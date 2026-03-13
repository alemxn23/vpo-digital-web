import { SelectedMed, VPOData } from '../types';

/**
 * PHARMACOLOGY ENGINE
 * Central logic for per-medication recommendations based on patient factors.
 */

export interface MedicationRecommendation {
    medId: string;
    action: 'stop' | 'continue' | 'adjust';
    daysPrior: number;
    hoursPrior?: number; // More precise
    alertLevel: 'green' | 'yellow' | 'red';
    instructions: string;
    rationale: string;
    bridgeRequired?: boolean;
    stressDoseRecommendation?: string;
}

export const getMedicationRecommendation = (med: SelectedMed, patient: VPOData): MedicationRecommendation => {
    // 1. DEFAULT VALUES (From DB)
    let recommendation: MedicationRecommendation = {
        medId: med.id,
        action: med.action,
        daysPrior: med.daysPrior,
        alertLevel: med.alertLevel,
        instructions: med.instructions,
        rationale: "Protocolo estándar.",
        bridgeRequired: false
    };

    // 2. LOGIC BY ATC GROUP

    // --- C: CARDIOVASCULAR ---
    if (med.atcCode?.startsWith('C07')) { // Beta-blockers
        // Logic: Continue if chronic, Stop if naive (but we assume chronic in med rec list usually)
        // If HR < 50 or SBP < 100 check is done at administration time (Instruction level)
        recommendation.action = 'continue';
        recommendation.alertLevel = 'green';
        recommendation.instructions = "CONTINUAR. Incluir dosis la mañana de la cirugía con sorbo de agua.";
        recommendation.rationale = "Prevención de isquemia de rebote. Suspender solo si Hipotensión/Bradicardia severa.";
    }

    if (med.atcCode?.startsWith('C09')) { // ACE inhibitors / ARBs
        // Logic: Stop 24h before to prevent vasoplegia, UNLESS severe Heart Failure (HFrEF)
        if (patient.icc && patient.icc_nyha !== 'I') {
            // Complex case: HFrEF might need continuance to prevent afterload spike, 
            // BUT mainstream guideline is still STOP to prevent vasoplegia during induction.
            recommendation.action = 'stop';
            recommendation.daysPrior = 1;
            recommendation.instructions = "SUSPENDER 24h Antes. (Riesgo vasoplejía).";
            recommendation.rationale = "Evitar hipotensión refractaria intraoperatoria.";
        } else {
            recommendation.action = 'stop';
            recommendation.daysPrior = 1;
            recommendation.instructions = "SUSPENDER 24h Antes (Omitir dosis de la mañana).";
        }
    }

    // --- B: BLOOD / ANTICOAGULANTS ---
    if (med.isAnticoagulant) {
        // PAUSE Protocol Logic
        const bleedingRisk = getSurgicalBleedingRisk(patient);
        const crcl = patient.tfg || 90;

        if (med.anticoagType === 'DOAC') {
            // Basic PAUSE Logic
            let daysToStop = 1; // Low risk default (24h approx)

            if (bleedingRisk === 'high') {
                if (crcl < 50) {
                    daysToStop = 3; // 72h (Apixaban/Rivaroxaban High Risk + Low TFG)
                } else {
                    daysToStop = 2; // 48h (High Risk + Normal TFG)
                }
            } else {
                daysToStop = 1; // Low Risk (24h)
            }

            // Dabigatran Specifics (Accumulates more)
            if (med.id === 'dabi') {
                if (crcl < 50) daysToStop += 2; // +48h conservative
                else if (bleedingRisk === 'high') daysToStop = 3; // 72h min for Dabi high risk
            }

            recommendation.daysPrior = daysToStop;
            recommendation.action = 'stop';
            recommendation.instructions = `SUSPENDER ${daysToStop} días antes (aprox ${daysToStop * 24}h).`;
            recommendation.rationale = `Riesgo Sangrado: ${bleedingRisk.toUpperCase()}. TFG: ${crcl.toFixed(0)}. Protocolo PAUSE.`;
        }

        if (med.anticoagType === 'AVK') { // Warfarin
            recommendation.daysPrior = 5;
            recommendation.action = 'stop';

            // Bridge Logic
            if (isHighThromboticRisk(patient)) {
                recommendation.bridgeRequired = true;
                recommendation.instructions = "Suspender 5 días antes. REQUIERE PUENTE con Heparina (Enoxaparina).";
                recommendation.rationale = "Alto Riesgo Trombótico (Válvula Mecánica, FA CHA₂DS₂-VASc ≥ 6, o EVC reciente).";
            } else {
                recommendation.instructions = "Suspender 5 días antes. NO requiere puente.";
                recommendation.rationale = "Bajo riesgo trombótico. Puenteo aumenta sangrado sin beneficio.";
            }
        }
    }

    if (med.category === 'Antiagregante') {
        // Stent Logic
        if (patient.cardiopatiaIsquemica && patient.cardio_stent) {
            const stentSafe = checkStentSafety(patient.stent_fecha_colocacion, patient.stent_tipo, patient.esUrgencia);

            if (!stentSafe.safe) {
                recommendation.alertLevel = 'red';
                recommendation.action = 'continue'; // Or POSTPONE
                recommendation.instructions = `¡ALERTA! ${stentSafe.message}. Si C.Electiva: POSPONER o Interconsulta Cardio. Si Urgencia: MANTENER DUAL (Riesgo sangrado alto aceptado).`;
            } else {
                // Safe to stop P2Y12?
                if (med.id === 'asa') {
                    recommendation.action = 'continue';
                    recommendation.instructions = "CONTINUAR AAS (Prevención Secundaria).";
                } else {
                    // P2Y12 (Clopidogrel etc)
                    recommendation.action = 'stop';
                    recommendation.daysPrior = med.daysPrior; // 5-7 days
                    recommendation.instructions = `Suspender ${med.daysPrior} días antes.`;
                }
            }
        }
    }

    // --- A: ALIMENTARY / METABOLISM ---
    if (med.category === 'iSGLT2') {
        recommendation.action = 'stop';
        recommendation.daysPrior = 3; // FDA update 2024
        if (med.id === 'ertu') recommendation.daysPrior = 4;
        recommendation.instructions = `SUSPENDER ${recommendation.daysPrior} DÍAS ANTES.`;
        recommendation.rationale = "Prevención cetoacidosis euglucémica perioperatoria.";
    }

    if (med.isGLP1) {
        recommendation.action = 'stop';
        if (med.glp1Frequency === 'weekly') {
            recommendation.daysPrior = 7;
            recommendation.instructions = "SUSPENDER 1 SEMANA ANTES.";
        } else {
            recommendation.daysPrior = 1;
            recommendation.instructions = "Suspender día de cirugía.";
        }
        recommendation.rationale = "Riesgo de aspiración por gastroparesia (Estómago lleno).";
    }

    // --- H: CORTICOSTEROIDES & HORMONAS ---
    if (med.isSteroid) {
        if (med.isChronic) {
            recommendation.alertLevel = 'yellow';
            recommendation.action = 'adjust';
            const stressDose = calculateStressDose(patient, med);
            recommendation.instructions = stressDose;
            recommendation.stressDoseRecommendation = stressDose;
            recommendation.rationale = "Uso crónico (>3 sem/dosis altas). Riesgo insuficiencia adrenal aguda.";
        } else {
            recommendation.alertLevel = 'green';
            recommendation.action = 'continue'; // Or adjust? Usually continue basal or just stop if short course.
            recommendation.instructions = "No requiere dosis de estrés si uso < 3 semanas.";
            recommendation.rationale = "Eje HHA íntegro probable.";
        }
    }

    // --- N: NEUROLOGY / PSYCHIATRY ---
    if (med.category === 'Antiepiléptico') {
        recommendation.alertLevel = 'green';
        recommendation.action = 'continue';
        recommendation.instructions = "CONTINUAR ESTRICTAMENTE. Si ayuno prolongado, rotar a IV.";
        recommendation.rationale = "Riesgo alto de crisis convulsivas por deprivación.";
    }

    if (med.category === 'Antiparkinsoniano') {
        recommendation.alertLevel = 'green';
        recommendation.action = 'continue';
        recommendation.instructions = "CONTINUAR hasta momento de cirugía. Reiniciar en cuanto tolere vía oral.";
        recommendation.rationale = "Riesgo de rigidez/Síndrome Neuroléptico Maligno si suspensión abrupta.";
    }

    if (med.category === 'Antipsicótico') {
        if (med.id === 'cloza') { // Clozapine
            recommendation.alertLevel = 'yellow';
            recommendation.action = 'continue';
            recommendation.instructions = "CONTINUAR. Vigilar ileo postoperatorio (riesgo aumentado).";
            recommendation.rationale = "Riesgo agranulocitosis (no suspender monitorización) y rebote psicótico.";
        } else {
            recommendation.action = 'continue';
            recommendation.instructions = "CONTINUAR. Precaución QT prolongado con anestésicos.";
        }
    }

    if (med.category === 'Litio') {
        recommendation.alertLevel = 'red';
        recommendation.action = 'stop';
        recommendation.daysPrior = 1; // 24-72h depending on renal. 1 day safe default.
        recommendation.instructions = "SUSPENDER 24-72h antes (Según función renal). Niveles < 1.0 mEq/L.";
        recommendation.rationale = "Potencia relajantes musculares. Riesgo toxicidad renal/deshidratación.";
    }

    // --- J: ANTIINFECCIOSOS (High Risk) ---
    if (med.category === 'Antirretroviral') {
        recommendation.alertLevel = 'green';
        recommendation.action = 'continue';
        recommendation.instructions = "CONTINUAR. Riesgo de rebote viral y resistencia si se suspende.";
        recommendation.rationale = "Vida media crítica. Mantener horario estricto.";
    }

    // --- L: IMMUNOSUPPRESSANTS / ANTINEOPLASTIC ---
    if (med.category === 'Inmunosupresor') {
        recommendation.alertLevel = 'green';
        recommendation.action = 'continue';
        recommendation.instructions = "CONTINUAR ESTRICTAMENTE. Dosis matutina con poco agua.";
        recommendation.rationale = "Alto riesgo de rechazo de injerto (Trasplante) o brote (Autoinmune).";
    }

    return recommendation;
};

export const calculateStressDose = (patient: VPOData, med: SelectedMed): string => {
    const site = patient.gupta_surgical_site || 'minor';
    let risk = 'minor';

    // Risk Categorization
    const modRisk = ['abdominal', 'orthopedic', 'spine', 'head-neck', 'urologic', 'gynecologic'];
    const highRisk = ['cardiac', 'aortic', 'transplant', 'esopha', 'pneumonectomy'];

    if (modRisk.some(r => site.includes(r))) risk = 'moderate';
    if (highRisk.some(r => site.includes(r))) risk = 'severe';
    if (patient.capB_cxMayor) risk = 'moderate'; // Default major

    const weight = patient.peso || 70;

    // 1. Calculate Patient's Current Home Dose Equivalent
    const homeEquiv = calculateHydrocortisoneEquivalent(med);
    let equivMsg = "";
    if (homeEquiv > 0) {
        equivMsg = ` (Tu dosis actual equivale a aprox. ${homeEquiv.toFixed(0)}mg de Hidrocortisona/día).`;
    }

    // 2. Define Target Stress Requirement (Total Daily Hydrocortisone)
    let targetDailyHydro = 25; // Minor
    if (risk === 'moderate') targetDailyHydro = 75; // 50 ind + 25 maintenance (approx)
    if (risk === 'severe') targetDailyHydro = 150; // 100 ind + 50 maintenance (approx)

    // 3. Compare and Recommend
    // If home dose is significantly higher than stress dose, we might need to match it to prevent insufficiency relative to their baseline.
    // "Sick Day" / Stress rules: If already on high dose, maintain usually sufficient, but if super high stress, adding basal + stress might be needed.
    // Current consensus: If on supraphysiologic dose > stress dose, just CONTINUE current dose (convert to IV) + consider small boost if unstable.

    let recommendation = "";

    if (homeEquiv > targetDailyHydro) {
        // Patient takes MORE than the stress dose normally.
        // Recommendation: Maintain equivalent dose IV.
        // Example: Patient takes 200mg Hydro equiv. Stress dose is 100mg. 
        // We should NOT reduce them to 100mg.
        const ivDose = Math.ceil(homeEquiv / 3); // Split q8h
        recommendation = `Dosis basal ALTA${equivMsg}. NO REDUCIR DOSIS. Administrar equiv. a Hidrocortisona ${ivDose}mg IV c/8h.`;
    } else {
        // Standard Stress Dose Logic override
        let hydroDose = '25mg';
        let maintainDose = 'Dosis usual';

        if (risk === 'severe') { // Major Surgery
            hydroDose = '100mg';
            maintainDose = '50mg IV c/8h'; // Total ~250mg 1st 24h
        } else if (risk === 'moderate') { // Moderate Surgery
            hydroDose = '50mg';
            maintainDose = '25mg IV c/8h'; // Total ~125mg 1st 24h
        } else {
            // Minor Surgery
            // Sick day rule: double dose?
            // Or standard 25mg induction.
            if (homeEquiv > 0) {
                recommendation = `Riesgo Menor${equivMsg}. Opción 1: Duplicar dosis habitual VO por 24h. Opción 2: Hidrocortisona 25mg IV inducción + Dosis habitual.`;
                return recommendation;
            }
            hydroDose = '25mg';
        }

        recommendation = `Inducción: Hidrocortisona ${hydroDose} IV. Mantenimiento: ${maintainDose} por 24h, luego reducir.`;
        if (homeEquiv > 0) recommendation += equivMsg;
    }

    return recommendation;
};

const calculateHydrocortisoneEquivalent = (med: SelectedMed): number => {
    // Potency relative to Hydrocortisone (1)
    // Prednisone: 4
    // Prednisolone: 4
    // Methylprednisolone: 5
    // Dexamethasone: 25
    // Deflazacort: ~3 (6mg Def = 5mg Pred = 20mg Hydro) -> 20/6 = 3.33
    // Betamethasone: 25

    // Hydrocortisone: 1

    const dose = med.dose || med.steroidDose || 0;
    if (!dose) return 0;

    const name = med.name.toLowerCase();

    if (name.includes('prednisona') || name.includes('prednisolone')) return dose * 4;
    if (name.includes('metilprednisolona') || name.includes('methylprednisolone')) return dose * 5;
    if (name.includes('dexametasona') || name.includes('dexamethasone')) return dose * 25;
    if (name.includes('betametasona')) return dose * 25;
    if (name.includes('deflazacort')) return dose * 3.33;
    if (name.includes('hidrocortisona') || name.includes('hydrocortisone')) return dose * 1;

    return 0;
};

const getSurgicalBleedingRisk = (patient: VPOData): 'low' | 'high' => {
    // PAUSE / EHA Mapping
    const highRiskSites = [
        'intracranial', 'spinal', 'cardiac', 'vascular', 'aortic',
        'thoracic', 'abdominal', 'orthopedic', 'urologic', 'bariatric', 'reconstructive'];

    // Check Gupta Site or Ariscat Incision (Proxy for cavity surgery)
    if (highRiskSites.includes(patient.gupta_surgical_site)) return 'high';
    if (patient.capB_cxMayor) return 'high'; // Major surgery generic flag

    return 'low'; // Default for peripheral/minor/ophthalmic
};

const isHighThromboticRisk = (patient: VPOData): boolean => {
    // 1. Mechanical Valve (Mitral/Aortic check needs strict valve type, assuming 'valvula_protesis' implies checks)
    if (patient.valvula_protesis) return true; // Simplified: Any prosthesis is high risk for now (or at least needs bridge eval)

    // 2. Atrial Fibrillation High Risk
    if ((patient.arritmias && patient.arritmia_tipo === 'fa') || patient.ecg_ritmo_especifico === 'FA') {
        if (patient.cha2ds2vasc >= 6) return true;
        if (patient.evc && getMonthsDiff(patient.evc_fecha) < 3) return true; // Recent stroke
    }

    // 3. Recent VTE (< 3 months) - check Caprini history or new field
    // (patient.capD_evc || patient.capC_historiaTVP) && recent... (Not easily available dates for VTE, defaulting safe)

    return false;
};

// Helper for date diff inside this scope
const getMonthsDiff = (dateString: string) => {
    if (!dateString) return 999;
    const now = new Date();
    const event = new Date(dateString);
    let months = (now.getFullYear() - event.getFullYear()) * 12;
    months -= event.getMonth();
    months += now.getMonth();
    return months <= 0 ? 0 : months;
};

const checkStentSafety = (dateStr: string, type: 'BMS' | 'DES', isUrgent: boolean): { safe: boolean, message: string } => {
    if (!dateStr) return { safe: true, message: "" };

    const stentDate = new Date(dateStr);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - stentDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffMonths = diffDays / 30;

    if (type === 'BMS' && diffDays < 30) {
        return { safe: false, message: "Stent Metálico < 30 días. Riesgo Trombosis Altísimo." };
    }
    if (type === 'DES' && diffMonths < 6) {
        return { safe: false, message: "Stent Farmacoactivo < 6 meses. Riesgo Trombosis Alto." };
    }

    return { safe: true, message: "Stent endotelizado (> tiempo seguridad)." };
};

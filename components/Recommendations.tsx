import React, { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { VPOData } from '../types';
import { ClipboardList, CheckCircle2, AlertTriangle, ArrowRight, Syringe, HeartPulse, BedDouble, Stethoscope, Activity, Droplets, Info, Check, X, Lock } from 'lucide-react';

interface RecommendationsProps {
    isUnlocked?: boolean;
    onRequestUnlock?: () => void;
}

const Recommendations: React.FC<RecommendationsProps> = ({ isUnlocked = false, onRequestUnlock }) => {
    const { register, watch, setValue } = useFormContext<VPOData>();
    const [selectedGoal, setSelectedGoal] = useState<string | null>(null);

    const metasChecked = watch('metasTerapeuticas');
    const selectedMeds = watch('selectedMeds') || [];
    const capriniScore = watch('caprini') || 0;

    // Clinical Variables for Logic
    const data = watch();

    // Helper to prevent infinite loops
    const safeSet = (key: keyof VPOData, newVal: any) => {
        const current = (data as any)[key];
        if (typeof newVal === 'number' && typeof current === 'number' && isNaN(newVal) && isNaN(current)) return;
        if (current != newVal) {
            setValue(key, newVal as any);
        }
    };

    // --- BUSINESS RULES & LOGIC HELPERS ---

    // --- GLOBAL GOALS & TARGETS ---
    const getGlobalTargets = () => {
        const isHighCV = data.icc || data.cardiopatiaIsquemica || (data.edad || 0) > 75 || data.enfRenalCronica;
        const isStrictBP = (data.diabetes && (data.enfRenalCronica || (data.tfg || 0) < 60)) || data.hta_control === 'descontrolada';

        // Targets
        const hbTarget = isHighCV ? 10.0 : 8.0;
        const bpTarget = isStrictBP ? { sys: 130, dia: 80 } : { sys: 140, dia: 90 };
        const gluTarget = data.diabetes ? { min: 140, max: 180 } : { min: 70, max: 140 };

        // Real Values Check (Validation)
        const currentHb = data.hb || 0;
        const currentSys = data.taSistolica || 0;
        const currentDia = data.taDiastolica || 0;
        const currentGlu = data.glucosaCentral || data.glucosaCapilar || 0;

        return {
            hb: {
                target: hbTarget,
                current: currentHb,
                isOk: currentHb >= hbTarget || currentHb === 0,
                label: `> ${hbTarget.toFixed(1)}`
            },
            bp: {
                target: bpTarget,
                current: { sys: currentSys, dia: currentDia },
                isOk: (currentSys > 0 ? (currentSys < bpTarget.sys && currentDia < bpTarget.dia) : true),
                label: `< ${bpTarget.sys}/${bpTarget.dia}`
            },
            glu: {
                target: gluTarget,
                current: currentGlu,
                isOk: (currentGlu > 0 ? (currentGlu >= gluTarget.min && currentGlu <= gluTarget.max) : true),
                label: `${gluTarget.min}-${gluTarget.max}`
            }
        };
    };

    const getInsulinSchema = () => {
        // Logic: Resistant Schema if Basal Insulin used OR BMI > 35
        const isResistant = data.usaInsulina || (data.imc && data.imc > 35);
        const title = isResistant ? "ESQUEMA INSULINA RÁPIDA (RESISTENTE)" : "ESQUEMA INSULINA RÁPIDA (SENSIBLE)";

        // Values: [Low, High] for each tier
        const tiers = isResistant ? [4, 6, 8, 10, 12, 15] : [2, 4, 6, 8, 10, 12];

        return `\n\n--- ${title} ---\n` +
            `• 140-180 mg/dL: ${tiers[0]} UI SC\n` +
            `• 181-220 mg/dL: ${tiers[1]} UI SC\n` +
            `• 221-260 mg/dL: ${tiers[2]} UI SC\n` +
            `• 261-300 mg/dL: ${tiers[3]} UI SC\n` +
            `• 301-350 mg/dL: ${tiers[4]} UI SC\n` +
            `• > 351 mg/dL:   ${tiers[5]} UI SC + Aviso`;
    };

    const getAntibioticRegimen = () => {
        const site = data.gupta_surgical_site || 'other';
        const isAllergic = data.alergicos;
        const allergyDetail = (data.alergicosDetalle || '').toLowerCase();
        const weight = data.peso || 70;
        const imc = data.imc || 25;

        // Check for Penicillin/Beta-lactam allergy
        const hasBetaLactamAllergy = isAllergic && (
            allergyDetail.includes('penicilina') ||
            allergyDetail.includes('betalactam') ||
            allergyDetail.includes('cefalosporina') ||
            allergyDetail.includes('penicilin')
        );

        // Cefazolin Dosing Logic (ASHP 2024)
        const cefazolinDose = (weight >= 120 || imc >= 35) ? '3g' : '2g';
        const standardInduction = `Cefazolina ${cefazolinDose} IV (Inducción 60 min previos).`;
        const vancomycinRegimen = "Vancomicina 15mg/kg (Máx 2g) IV (Inducción 120 min previos).";
        const clindaRegimen = "Clindamicina 900mg IV (Inducción 60 min previos).";

        if (hasBetaLactamAllergy) {
            return `${vancomycinRegimen} o ${clindaRegimen} (Alergia a Beta-lactámicos).`;
        }

        // Regimens by surgical site (ASHP/IDSA/SIS/SHEA 2024)
        switch (site) {
            case 'cardiac':
            case 'aortic':
            case 'vascular':
                return `${standardInduction} Redosificar cada 4h (2h si CEC).`;
            case 'intestinal':
            case 'biliary':
            case 'anorectal':
                return `Cefazolina ${cefazolinDose} IV + Metronidazol 500mg IV. Alt: Ertapenem 1g IV.`;
            case 'bariatric':
                return `Cefazolina 3g IV (Ajuste por IMC/Peso).`;
            case 'urologic':
                return `Ciprofloxacino 400mg IV o Cefazolina ${cefazolinDose} IV.`;
            case 'thoracic':
            case 'orthopedic':
            case 'spinal':
            case 'intracranial':
                return standardInduction;
            case 'neck':
            case 'ent':
                // Note: ASHP recommends no prophylaxis for clean ENT without implants
                const dx = (data.diagnosticoQuirurgico || '').toLowerCase();
                const isContaminated = dx.includes('cancer') || dx.includes('neoplasia') || dx.includes('reconstruccion') || dx.includes('colgajo');
                if (isContaminated) {
                    return `Cefazolina ${cefazolinDose} IV + Metronidazol 500mg IV.`;
                }
                return "NO SE REQUIERE PROFILAXIS (Cirugía Limpia de Cabeza y Cuello sin prótesis).";
            default:
                return `${standardInduction} (Protocolo Estándar).`;
        }
    };

    const getFluidRecommendation = () => {
        const site = data.gupta_surgical_site || 'other';
        const isNeuro = site === 'intracranial' || site === 'spinal';
        const isThoracic = site === 'thoracic';
        const isAbdMajor = ['intestinal', 'bariatric', 'biliary', 'urologic', 'anorectal', 'obstetric', 'gyneco'].includes(site) || data.capB_cxMayor || data.capB_laparoscopia;

        const isChfOrRenal = data.icc || data.enfRenalCronica || (data.lee && (data.lee === 'III' || data.lee === 'IV'));
        const isCirrhosis = data.hepatopatia;
        const isAmbulatory = data.capA_cxMenor;

        // 1. SAFETY RULE: NO SYNTHETIC COLLOIDS
        const safetyWarning = "⚠️ KDIGO 2024: Uso de Coloides Sintéticos (HES/Voluven) CONTRAINDICADO (Riesgo AKI/Mortalidad).";

        let strategy = "";

        // 2. COMORBIDITY OVERRIDES
        if (isChfOrRenal) {
            strategy = "• ESTRATEGIA: Restrictiva guiada por metas (GDFT).\n• Recomendación: Tolerancia a fluidos disminuida. No suspender diuréticos si hay congestión. Balance neutro/negativo.";
        } else if (isCirrhosis) {
            strategy = "• FLUIDO: Cristaloides Balanceados o Albúmina.\n• Regla: Si paracentesis >5L -> Reponer 8g Albúmina por litro extraído. Evitar Salina 0.9%.";
        } else if (isNeuro) {
            // 3. SURGERY SPECIFIC
            strategy = "• FLUIDO: Solución Salina 0.9% (ÚNICA opción permitida).\n• ALERTA: Prohibido el uso de soluciones hipotónicas o Ringer Lactato en grandes volúmenes (Riesgo de Edema Cerebral).";
        } else if (isThoracic) {
            strategy = "• ESTRATEGIA: Estrictamente Restrictiva (< 2 ml/kg/h).\n• Meta: Balance acumulado < 1.5L in 24h. Pulmón sensible. Manejar hipotensión con vasopresores.";
        } else if (isAbdMajor) {
            strategy = "• ESTRATEGIA: Moderadamente Liberal (Estudio RELIEF).\n• Fluido: Cristaloides Balanceados (Hartmann/Plasma-Lyte). Evitar Salina 0.9% (Acidosis hiperclorémica).\n• Meta: 10-12 ml/kg/h intraop. Balance positivo final 1-2L.";
        } else if (isAmbulatory) {
            strategy = "• ESTRATEGIA: Liberal Moderada (1-2L Cristaloides Balanceados) para reducir NVPO y mareo.";
        } else {
            // Default Standard
            strategy = "• Recomendación: Solución Hartmann/Balanceada 1000 cc para 8 horas (Mantenimiento Estándar).";
        }

        return `${strategy}\n• ${safetyWarning}\n(Ref: ASA 2023, SAMBA 2024, KDIGO 2024)`;
    };

    const getThromboprophylaxisRec = () => {
        const caprini = data.caprini || 0;
        const tfg = data.tfg || 90;
        const imc = data.imc || 25;
        const weight = data.peso || 70;

        // 1. Risk Stratification
        if (caprini <= 1) return "Riesgo Muy Bajo: Deambulación temprana y frecuente.";

        let drug = "Enoxaparina";
        let dose = "40mg SC cada 24h";
        let mechanical = "Medias de Compresión Graduada (TEDs)";

        // 2. Renal Adjustment (TFG < 30 or Stage 4/5 CKD)
        if (tfg < 30 || data.erc_estadio === 'G4' || data.erc_estadio === 'G5') {
            drug = "Heparina No Fraccionada (HNF) o Enoxaparina Ajustada";
            dose = "HNF 5000 UI SC cada 12h (Preferido) o Enoxaparina 30mg SC cada 24h";
        } else {
            // 3. BMI Adjustment (Obesity)
            if (imc >= 40) {
                if (caprini >= 5) {
                    dose = "40mg SC cada 12h o 60mg SC cada 24h (Rango Obesidad Mórbida)";
                } else {
                    dose = "40mg SC cada 24h";
                }
            } else if (weight > 100) {
                dose = "40mg SC cada 12h o 60mg SC cada 24h";
            }
        }

        // 4. Component Synthesis
        if (caprini >= 5) {
            return `Riesgo ALTO (Caprini ${caprini}): ${drug} ${dose} + ${mechanical} + CPI (Compresión Neumática Intermitente).`;
        } else if (caprini >= 3) {
            return `Riesgo MODERADO (Caprini ${caprini}): ${drug} ${dose} + ${mechanical}.`;
        } else {
            return `Riesgo BAJO (Caprini ${caprini}): ${mechanical} y Deambulación temprana.`;
        }
    };

    const generatePrePlan = () => {
        const medsPlan = ""; // Removed redundant text summary to avoid duplication in report

        // DUKE ALERT IN PLAN
        const dukeAlert = (data.duke_resultado === 'Definitivo' || data.duke_resultado === 'Posible')
            ? "\n\n⚠️ ALERTA INFECTOLOGÍA: Riesgo de Endocarditis (Duke +). Se sugiere diferir procedimiento electivo, hemocultivos y ETE."
            : "";

        // NSAID BLOCKER LOGIC (TFG < 30)
        const tfgVal = data.tfg || 90;
        const aineInstruction = tfgVal < 30
            ? "⛔ CONTRAINDICADOS AINEs (TFG < 30). Uso estricto de analgésicos no nefrotóxicos (Paracetamol/Opioides)."
            : "Suspender AAS/AINEs 7 días antes (Riesgo Hemorrágico).";

        const antibioticRegimen = getAntibioticRegimen();
        const fluidRec = getFluidRecommendation();

        // Frailty Alert
        const frailtyScore = data.fragilidad_score || 1;
        const frailtyRec = frailtyScore >= 5
            ? "\n\n⚠️ FRAGILIDAD (CFS >= 5): Protocolo de prevención de Delirio y manejo geriátrico temprano sugerido."
            : "";

        // STOP-BANG Alert (High Risk)
        const stopBangRec = (data.stopbang_risk === 'Alto' || data.stopbang_risk === 'Alto (Dx Previo)')
            ? "\n\n⚠️ VÍA AÉREA (STOP-BANG ALTO): Se sugiere extubación despierto y monitoreo de oximetría continua postoperatoria por alta probabilidad de SAOS."
            : "";

        // Fasting & CHO Logic (SAMBA 2024)
        const isDiabetic = data.diabetes;
        const fastingRule = isDiabetic
            ? "• Ayuno: Sólidos 6h. Líquidos claros (AGUA) hasta 2h previas.\n• ⚠️ DIABETES: EVITAR cargas de Carbohidratos/Maltodextrina (SAMBA 2024: Riesgo de Hiperglucemia/Variabilidad)."
            : "• Ayuno: Sólidos 6h. Líquidos claros hasta 2h previas.\n• Carga CHO: Maltodextrina recomendada 2h antes (Reduce resistencia a insulina).";

        // NSQIP High Risk Alert
        const nsqipAlert = (data.nsqip_total || 0) >= 10
            ? `\n\n⚠️ NSQIP ALTO (${data.nsqip_total}%): Riesgo elevado de complicación quirúrgica mayor a 30 días. Se recomienda optimización de comorbilidades antes de proceder.`
            : (data.nsqip_total || 0) >= 3
                ? `\n• NSQIP Moderado (${data.nsqip_total}%): Riesgo de complicación mayor. Estratificar y documentar consentimiento informado ampliado.`
                : "";

        // Urgency Alert
        const urgencyAlert = data.esUrgencia
            ? `\n\n⚠️ CIRUGÍA DE URGENCIA / EMERGENCIA:
• Tipo de procedimiento: URGENCIA (Impacto en escalas: +4 Goldman, +10 Detsky, +8 ARISCAT, ASA-E).
• Ayuno no garantizado: Considerar técnica de secuencia rápida (IRS) si estómago lleno.
• Optimización preoperatoria limitada: Priorizar estabilidad hemodinámica sobre metas absolutas.
• Evaluar corrección URGENTE de electrolitos críticos, coagulopatía o anemia grave antes de inducción si el tiempo lo permite.
• Documentar riesgo anestésico-quirúrgico aumentado en consentimiento informado.`
            : "";

        return `${fastingRule}
• ${aineInstruction}
• Profilaxis antibiótica: ${antibioticRegimen} (Ref: ASHP Guidelines / Sanford 2024)
• Tromboprofilaxis: ${capriniScore >= 5 ? 'Iniciar 12h previas según esquema (Ver Post)' : 'Deambulación temprana / Medias TEDs'}. (Ref: ACCP / PAUSE)
• Soluciones: \n${fluidRec}${dukeAlert}${frailtyRec}${stopBangRec}${nsqipAlert}${urgencyAlert}`;
    };

    const getEcoRecommendations = () => {
        const parts = [];
        // A. FEVI Low
        if ((data.eco_fevi || 60) < 35) {
            parts.push("RESERVA CARDIACA DISMINUIDA (<35%). Alto riesgo de hipotensión a la inducción. Se sugiere evitar inotrópicos negativos y manejar líquidos con extrema precaución.");
        }
        // B. Estenosis Aortica (From Eco or Antecedents)
        if (data.eco_valvulopatia === 'estenosis_aortica_severa' || data.flag_estenosis_aortica_severa) {
            parts.push("ESTENOSIS AÓRTICA SEVERA: ALERTA CRÍTICA. Mantener precarga y RVS. Evitar hipotensión y taquicardia. Anestesia neuroaxial puede precipitar colapso.");
        }
        // C. Hipertension Pulmonar
        if (data.eco_psap_elevada) {
            parts.push("HIPERTENSIÓN PULMONAR: Riesgo de falla ventricular derecha. Evitar hipoxia, hipercapnia y acidosis intraoperatoria.");
        } // D. Disfuncion Diastolica
        if (data.eco_disfuncion_diastolica) {
            parts.push("DISFUNCIÓN DIASTÓLICA SEVERA: La taquicardia y la fibrilación auricular son mal toleradas. Mantener ritmo sinusal.");
        }

        if (parts.length === 0) return "";
        return "\n\n⚠️ SUGERENCIAS ECOCARDIOGRÁFICAS:\n• " + parts.join("\n• ");
    };

    const generateTransPlan = () => {
        const targets = getGlobalTargets();
        const fluidRec = getFluidRecommendation();

        const hemodynamics = `• METAS HEMODINÁMICAS: TA ${targets.bp.label} mmHg. Evitar hipotensión. Evitar sobrecarga hídrica.`;

        // Antibiotic Redosing logic based on site
        const site = data.gupta_surgical_site || 'other';
        const redoseInterval = site === 'cardiac' ? '2-4h' : '4h';
        const antibioticInstructions = getAntibioticRegimen().includes('NO SE REQUIERE')
            ? ""
            : `\n• ANTIBIÓTICO: Redosificar cada ${redoseInterval} si duración > 4h o sangrado > 1.5L.`;

        // Insulin Logic
        const insulinInstruction = data.diabetes
            ? `\n• Mantener Glucemia ${targets.glu.label} mg/dL.${getInsulinSchema()}`
            : "";

        // Steroid Stress Dose Logic (If any med has stress dose instruction)
        const steroidMeds = selectedMeds.filter(m => m.isSteroid && m.action === 'adjust');
        const steroidInstruction = steroidMeds.length > 0
            ? `\n• DOSIS ESTRÉS ESTEROIDEO: ${steroidMeds[0].instructions}` // Take the first one found
            : "";

        // Eco Logic
        const ecoRecs = getEcoRecommendations();

        return `• A cargo de Anestesiología.
• Monitoreo cardiaco y pulsioximetría continuos.
• METAS: Hb ${targets.hb.label} g/dL. Uresis ≥ 0.5ml/kg/h.
• METAS HEMODINÁMICAS: TA ${targets.bp.label} mmHg. Evitar hipotensión.
• LÍQUIDOS: \n${fluidRec}${antibioticInstructions}${insulinInstruction}${steroidInstruction}${ecoRecs}`;
    };

    const generatePostPlan = () => {
        const targets = getGlobalTargets();
        const trombo = getThromboprophylaxisRec();
        const site = data.gupta_surgical_site || 'other';
        const antibioticDuration = (site === 'cardiac' || site === 'aortic') ? '48h' : '24h';

        // Bariatric ERAS Protocol (ASMBS 2023)
        const bariatricEras = site === 'bariatric'
            ? `\n\n--- PROTOCOLO ERAS BARIÁTRICO (ASMBS 2023) ---
• Monitorear saturación O2 continua min. 24h postop (Alto riesgo SAOS).
• CPAP/BiPAP postoperatorio si STOP-BANG ≥ 3 o diagnóstico previo SAOS.
• Suplementación proteica: 60-80g proteína/día al inicio de la vía oral.
• Líquidos claros 2h postqx → progresión a líquidos espesos → papilla bariátrica.
• Suplementos vitamínicos: Multivitamínico masticable, Vitamina B12, Calcio + Vitamina D.
• Deambulación a las 4-6h postoperatorias (Protocolo antitrombótico agresivo).
• Vigilar signos de fuga anastomótica (Taquicardia inexplicable, fiebre, dolor atípico) en las primeras 72h.
• Seguimiento nutricional obligatorio a 1, 3, 6 y 12 meses. (Ref: ASMBS/IFSO 2023)`
            : "";

        return `• Al tolerar la VO reiniciar tratamiento habitual.
• METAS: Glucosa ${targets.glu.label} mg/dL. TA ${targets.bp.label} mmHg.
• TROMBOPROFILAXIS: ${trombo}
• ANTIBIÓTICO: Suspender en <${antibioticDuration} postoperatorias si no hay evidencia de infección.
• Vigilar datos de sangrado e infección en sitio quirúrgico.
• Deambulación temprana.
• Analgesia multimodal ahorradora de opioides.
• Seguimiento por UMF/HGZ al alta.${bariatricEras}`;
    };

    // --- ECG, VITALS & PHYSICAL FINDINGS RECOMMENDATIONS ---
    const getECGAndFindingsRecs = () => {
        const alerts: string[] = [];

        // ---- ECG FINDINGS ----
        if (data.ecg_isquemia) {
            alerts.push("⚡ ECG: Isquemia/Necrosis activa detectada. Considerar interconsulta a Cardiología y optimizar tratamiento antiisquémico previo a procedimiento electivo.");
        }
        if (data.ecg_brihh_completo) {
            alerts.push("⚡ ECG: BRIHH Completo. Sugiere cardiopatía estructural subyacente. Vigilar intraoperatoriamente. Alto riesgo de bloqueo completo con manejo de catéter.");
        }
        if (data.ecg_extrasistoles) {
            alerts.push("⚡ ECG: >5 Extrasístoles Ventriculares/min (+7 Goldman). Optimizar manejo electrolítico (K+, Mg²⁺) perioperatorio.");
        }
        if (data.ecg_ritmo_especifico === 'FA') {
            alerts.push("⚡ ECG: Fibrilación Auricular. Verificar anticoagulación. Control de FC meta <100 lpm. Valorar CHA₂DS₂-VASc para riesgo embólico.");
        } else if (data.ecg_ritmo_especifico === 'Flutter') {
            alerts.push("⚡ ECG: Flutter Auricular. Riesgo de conversión 1:1 y deterioro hemodinámico en estrés perioperatorio. Control de FC estricto.");
        } else if (data.ecg_ritmo_especifico === 'Marcapasos') {
            alerts.push("⚡ ECG: Ritmo de Marcapasos. Verificar tipo (DDD/VVI) y programación. Usar bisturí bipolar o evitar electrocauterio monopolar. Tener imán disponible.");
        }
        if (data.ecg_bloqueo === 'Mobitz_II') {
            alerts.push("⚡ ECG: Bloqueo AV Mobitz II (+5 Detsky). Alto riesgo de progresión a bloqueo completo. Valorar marcapasos temporal de precaución con Cardiología.");
        }
        if (data.ecg_bloqueo === '3er_Grado') {
            alerts.push("⚡ ECG: Bloqueo AV Completo (3er Grado). Requiere marcapasos temporal definitivo antes de proceder a cirugía electiva.");
        }
        if (data.ecg_hvi) {
            alerts.push("⚡ ECG: HVI (Hipertrofia Ventricular Izquierda). Marcador de HTA crónica severa. Se apoya ASA III. Metas de TA estrictas.");
        }

        // ---- SIGNOS VITALES CRÍTICOS ----
        const sys = data.taSistolica || 0;
        const fc = data.fc || 0;
        const sato2 = data.sato2 || 0;
        const fr = data.fr || 0;
        if (sys > 180) {
            alerts.push(`⚠️ HTA Severa (${sys} mmHg): Se recomienda optimización del control tensional antes del procedimiento electivo. Meta: <160 mmHg para reducir riesgo cardiovascular perioperatorio.`);
        } else if (sys > 160) {
            alerts.push(`⚠️ HTA Grado II (${sys} mmHg): Control presión arterial preoperatorio recomendado. Meta perioperatoria: <140 mmHg.`);
        }
        if (fc > 100) {
            alerts.push(`⚠️ Taquicardia (${fc} lpm): Investigar causa (fiebre, dolor, hipovolemia, anemia, FA). Control de FC perioperatorio. Meta: <100 lpm en reposo.`);
        } else if (fc < 50) {
            alerts.push(`⚠️ Bradicardia (${fc} lpm): Vigilar en contexto de medicamentos (betabloqueadores). Tener atropina disponible.`);
        }
        if (sato2 > 0 && sato2 < 90) {
            alerts.push(`⚠️ Hipoxemia Severa (SpO2 ${sato2}%): Optimizar función respiratoria antes del procedimiento. Considerar O2 suplementario, espirometría incentiva, fisioterapia pulmonar.`);
        } else if (sato2 > 0 && sato2 < 94) {
            alerts.push(`⚠️ SpO2 Limítrofe (${sato2}%): Vigilar oxigenación perioperatoria. Monitoreo continuo de pulsioximetría recomendado.`);
        }
        if (fr > 20) {
            alerts.push(`⚠️ Taquipnea (${fr} rpm): Considerar causa subyacente (descompensación cardiaca, neumónica, ansiedad). Valorar si es seguro proceder.`);
        }

        // ---- LABORATORIOS CRÍTICOS ----
        const k = data.k || 0;
        const na = data.na || 0;
        const cr = parseFloat(data.creatinina as any) || 0;
        const hb = data.hb || 0;
        const plaq = data.plaquetas || 0;
        if (k > 0 && k < 3.0) {
            alerts.push(`⚠️ Hipocalemia (K⁺ ${k} mEq/L): Corregir electrolitos previo a cirugía. Riesgo de arritmias perioperatorias. Meta: K⁺ > 3.5 mEq/L.`);
        } else if (k > 0 && k > 5.5) {
            alerts.push(`⚠️ Hipercalemia (K⁺ ${k} mEq/L): Riesgo de bloqueo AV y fibrilación ventricular. Corregir antes del procedimiento electivo.`);
        }
        if (na > 0 && na < 130) {
            alerts.push(`⚠️ Hiponatremia (Na⁺ ${na} mEq/L): Riesgo de edema cerebral y convulsiones perioperatorias. Corregir lentamente (<8 mEq/L/24h). Sodio Isotónico.`);
        } else if (na > 0 && na > 150) {
            alerts.push(`⚠️ Hipernatremia (Na⁺ ${na} mEq/L): Corrección con agua libre calculada. Retrasar cirugía electiva hasta Na⁺ < 145 mEq/L.`);
        }
        if (cr > 3.0) {
            alerts.push(`⚠️ Daño Renal (Cr ${cr} mg/dL): Alto riesgo de LRA perioperatoria. Optimizar hidratación. Ajustar dosis de medicamentos nefrotóxicos. Evitar contraste IV y AINEs.`);
        }
        if (hb > 0 && hb < 8.0) {
            alerts.push(`⚠️ Anemia Severa (Hb ${hb} g/dL): Optimizar reservas. Considerar hierro IV, EPO si hay tiempo. En cirugía urgente: transfundir previo si Hb < 7.0 g/dL (o <8 en cardiopatía).`);
        }
        if (plaq > 0 && plaq < 100) {
            alerts.push(`⚠️ Trombocitopenia (Plaq ${plaq} k/μL): Riesgo hemorrágico elevado. Transfundir plaquetas si <50k (cirugía mayor) o <20k (profiláctico). Valorar riesgo/beneficio.`);
        }

        // ---- HALLAZGOS FÍSICOS ----
        if (data.exploracion_estenosis_aortica || data.flag_estenosis_aortica_severa) {
            alerts.push("🩺 ESTENOSIS AÓRTICA SEVERA: Mantener precarga y RVS. Evitar hipotensión brusca y taquicardia. La anestesia neuroaxial puede precipitar colapso hemodinámico.");
        }
        if (data.exploracion_soplo_carotideo) {
            alerts.push("🩺 Soplo Carotídeo: Riesgo de EVC perioperatorio aumentado. Mantener PAM dentro del 20% de la basal. Evitar hipotensión. Considerar dúplex carotídeo si no se ha realizado.");
        }
        if (data.exploracion_s3 || (data.icc && data.icc_evolucion === 'aguda')) {
            alerts.push("🩺 Signos de ICC Aguda (S3/Estertores/Ingurgitación): Optimizar hemodinámicamente antes del procedimiento. Balance hídrico negativo guiado por metas. Considerar diferir cirugía electiva.");
        }
        if (data.exploracion_edema) {
            alerts.push("🩺 Edema de Miembros Inferiores: Vigilar trombosis venosa profunda. Verificar tromboprofilaxis. Elevación de extremidades. Caprini +1.");
        }

        if (alerts.length === 0) return "";
        return "\n\n--- ALERTAS CLÍNICAS (ECG/Vitales/Labs/Física) ---\n" + alerts.map(a => `• ${a}`).join("\n");
    };

    // --- EFFECT: APPLY STANDARD GOALS ---
    useEffect(() => {
        if (metasChecked) {
            const ecgRecs = getECGAndFindingsRecs();
            const pre = generatePrePlan() + ecgRecs;
            const trans = generateTransPlan() + (ecgRecs ? `\n\n--- ALERTAS ACTIVAS ---\n${ecgRecs.split('---\n')[1] || ''}` : '');
            const post = generatePostPlan();

            if (data.plan_pre !== pre) setValue('plan_pre', pre);
            if (data.plan_trans !== trans) setValue('plan_trans', trans);
            if (data.plan_post !== post) setValue('plan_post', post);
        }
    }, [
        metasChecked, setValue,
        // Comorbidities
        data.diabetes, data.icc, data.icc_evolucion, data.cardiopatiaIsquemica, data.enfRenalCronica,
        data.hepatopatia, data.neumopatia, data.evc, data.hta_control,
        // Scales
        capriniScore, data.nsqip_total, data.gupta_surgical_site, data.gupta,
        // Gabinete
        data.duke_resultado, data.eco_fevi, data.eco_valvulopatia, data.eco_psap_elevada, data.eco_disfuncion_diastolica,
        data.flag_estenosis_aortica_severa,
        // ECG Findings
        data.ecg_isquemia, data.ecg_brihh_completo, data.ecg_extrasistoles,
        data.ecg_ritmo_especifico, data.ecg_bloqueo, data.ecg_hvi,
        // Vitals
        data.taSistolica, data.taDiastolica, data.fc, data.sato2, data.fr, data.temp,
        // Labs
        data.hb, data.plaquetas, data.creatinina, data.tfg, data.k, data.na,
        // Physical Findings
        data.exploracion_s3, data.exploracion_estenosis_aortica, data.exploracion_soplo_carotideo, data.exploracion_edema,
        // Meds & Urgency
        JSON.stringify(selectedMeds), data.esUrgencia,
        // Other
        data.stopbang_risk, data.fragilidad_score, data.edad, data.imc, data.peso,
        data.alergicos, data.alergicosDetalle, data.capB_cxMayor, data.capB_laparoscopia, data.capA_cxMenor,
        data.valvula_protesis, data.arritmia_tipo,
    ]);

    // Determine Meta Labels based on risk
    const isNephroCardio = data.enfRenalCronica || data.icc || data.cardiopatiaIsquemica;

    return (
        <div className="flex flex-col gap-3">

            {/* TITLE — outside the card */}
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2.5">
                    <ClipboardList className="text-slate-400" size={20} strokeWidth={1.5} />
                    <div>
                        <h2 className="text-base font-bold text-slate-800 leading-tight">Plan de Manejo Integral</h2>
                        <p className="text-[11px] text-slate-400 font-medium">Pre, Trans y Post-Quirúrgico</p>
                    </div>
                </div>

                {/* MASTER TOGGLE */}
                <label className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border cursor-pointer transition-all duration-200
            ${metasChecked
                        ? 'bg-emerald-50/50 border-emerald-200/60 text-emerald-800 shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-white hover:border-slate-300'}`}
                >
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-200 ${metasChecked ? 'bg-emerald-600 border-emerald-600' : 'bg-white border-slate-300'}`}>
                        {metasChecked && <CheckCircle2 size={14} className="text-white" />}
                    </div>
                    <input type="checkbox" {...register('metasTerapeuticas')} className="sr-only" />
                    <span className="font-semibold text-[13px]">Aplicar Metas Institucionales</span>
                </label>
            </div>

            {/* CARD — starts here */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">

                {/* PHYSICIAN SECTION */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4 p-5 border-b border-slate-100 bg-slate-50/20">
                    <div>
                        <label className="block text-[12px] font-semibold text-slate-500 mb-1.5">Médico que realizó</label>
                        <input {...register('elaboro')} className="w-full bg-white border-slate-200 rounded-lg text-[13px] px-3 py-2 border hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500/50 transition-all" placeholder="Nombre completo..." />
                    </div>
                    <div>
                        <label className="block text-[12px] font-semibold text-slate-500 mb-1.5">Matrícula / Cédula</label>
                        <input {...register('matricula')} className="w-full bg-white border-slate-200 rounded-lg text-[13px] px-3 py-2 border hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500/50 transition-all" />
                    </div>
                    <div>
                        <label className="block text-[12px] font-semibold text-slate-500 mb-1.5">Médico Residente</label>
                        <input {...register('residente')} className="w-full bg-white border-slate-200 rounded-lg text-[13px] px-3 py-2 border hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500/50 transition-all" placeholder="Nombre completo..." />
                    </div>
                    <div>
                        <label className="block text-[12px] font-semibold text-slate-500 mb-1.5">Matrícula (Residente)</label>
                        <input {...register('residente_matricula')} className="w-full bg-white border-slate-200 rounded-lg text-[13px] px-3 py-2 border hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500/50 transition-all" />
                    </div>
                </div>

                {/* INDICATORS / METAS GLOBALES */}
                <div className="bg-slate-50/50 p-4 flex flex-col lg:flex-row justify-between items-center gap-4 px-8 border-b border-slate-100 relative">

                    {/* EXPLANATION OVERLAY / POPOVER */}
                    {selectedGoal && (
                        <div className="absolute inset-0 bg-white/95 backdrop-blur-md z-50 flex items-center justify-between px-8 rounded-sm">
                            <div className="flex items-center gap-6 max-w-4xl">
                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                                    {selectedGoal === 'bp' && <Activity className="text-emerald-500" size={24} />}
                                    {selectedGoal === 'glu' && <Syringe className="text-blue-500" size={24} />}
                                    {selectedGoal === 'hb' && <HeartPulse className="text-rose-500" size={24} />}
                                    {selectedGoal === 'uresis' && <Droplets className="text-cyan-500" size={24} />}
                                </div>
                                <div>
                                    <h4 className="text-[13px] font-semibold text-slate-800 mb-1">
                                        Justificación: {selectedGoal === 'bp' ? 'Tensión Arterial' : selectedGoal === 'glu' ? 'Glucosa' : selectedGoal === 'hb' ? 'Hemoglobina' : 'Gasto Urinario'}
                                    </h4>
                                    <p className="text-[12px] text-slate-500 leading-relaxed max-w-2xl">
                                        {selectedGoal === 'hb' && "Mantener Hb > 8.0 g/dL en pacientes sanos y > 10.0 g/dL en pacientes con reserva cardiovascular limitada (ICC, Isquemia, Edad > 75) para asegurar el aporte de oxígeno tisular (DO2) y evitar isquemia perioperatoria. (Guía ESAIC/ASA)"}
                                        {selectedGoal === 'bp' && "Mantener la PAM dentro del 20% de la basal. Objetivos más estrictos (<130/80) en pacientes con ERC o DM descontrolada para protección de órgano blanco y reducción de riesgo de evento cerebral. (Guía ACC/AHA)"}
                                        {selectedGoal === 'glu' && "En pacientes con diabetes, el rango 140-180 mg/dL equilibra la prevención de hipoglucemia con la reducción del riesgo de infección de sitio quirúrgico. En no diabéticos, mantener < 140 mg/dL. (Guía ADA/NICE)"}
                                        {selectedGoal === 'uresis' && "El gasto urinario ≥ 0.5 ml/kg/h es un indicador fundamental de la perfusión renal y estado de volumen. La oliguria persistente sugiere hipovolemia o daño renal agudo incipiente. (Guía KDIGO)"}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedGoal(null)}
                                className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                            >
                                <X size={18} strokeWidth={1.5} />
                            </button>
                        </div>
                    )}

                    {(() => {
                        const targets = getGlobalTargets();
                        return (
                            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-8 gap-y-3">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-medium text-slate-400 mb-0.5">Indicadores</span>
                                    <h4 className="text-[13px] font-semibold text-slate-800">Metas Globales</h4>
                                </div>

                                <div className="h-8 w-px bg-slate-200 hidden lg:block" />

                                {/* BP Indicator */}
                                <div
                                    onClick={() => setSelectedGoal('bp')}
                                    className="flex items-center gap-3 group transition-all hover:scale-105 cursor-help"
                                >
                                    <div className={`p-1.5 rounded-lg border transition-colors ${targets.bp.isOk ? 'bg-emerald-50 border-emerald-200 text-emerald-500' : 'bg-red-50 border-red-200 text-red-500'}`}>
                                        <Activity size={16} />
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <span className="text-[10px] font-medium text-slate-400 leading-none">Tensión Arterial</span>
                                            <Info size={8} className="text-slate-300 group-hover:text-slate-400 transition-colors" />
                                        </div>
                                        <div className="flex items-baseline gap-1.5">
                                            <span className="text-[13px] font-semibold text-slate-800 leading-none tabular-nums">{targets.bp.label}</span>
                                            {targets.bp.current.sys > 0 && (
                                                <span className={`text-[10px] font-semibold ${targets.bp.isOk ? 'text-emerald-500' : 'text-red-500'}`}>
                                                    (Real: {targets.bp.current.sys}/{targets.bp.current.dia})
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Glucose Indicator */}
                                <div
                                    onClick={() => setSelectedGoal('glu')}
                                    className="flex items-center gap-3 group transition-all hover:scale-105 cursor-help"
                                >
                                    <div className={`p-1.5 rounded-lg border transition-colors ${targets.glu.isOk ? 'bg-blue-50 border-blue-200 text-blue-500' : 'bg-red-50 border-red-200 text-red-500'}`}>
                                        <Syringe size={16} />
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <span className="text-[10px] font-medium text-slate-400 leading-none">Glucosa Central</span>
                                            <Info size={8} className="text-slate-300 group-hover:text-slate-400 transition-colors" />
                                        </div>
                                        <div className="flex items-baseline gap-1.5">
                                            <span className="text-[13px] font-semibold text-slate-800 leading-none tabular-nums">{targets.glu.label}</span>
                                            {targets.glu.current > 0 && (
                                                <span className={`text-[10px] font-semibold ${targets.glu.isOk ? 'text-blue-500' : 'text-red-500'}`}>
                                                    (Real: {targets.glu.current})
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Hemoglobin Indicator */}
                                <div
                                    onClick={() => setSelectedGoal('hb')}
                                    className="flex items-center gap-3 group transition-all hover:scale-105 cursor-help"
                                >
                                    <div className={`p-1.5 rounded-lg border transition-colors ${targets.hb.isOk ? 'bg-rose-50 border-rose-200 text-rose-500' : 'bg-orange-50 border-orange-200 text-orange-500'}`}>
                                        <HeartPulse size={16} />
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <span className="text-[10px] font-medium text-slate-400 leading-none">Hemoglobina (Target)</span>
                                            <Info size={8} className="text-slate-300 group-hover:text-slate-400 transition-colors" />
                                        </div>
                                        <div className="flex items-baseline gap-1.5">
                                            <span className="text-[13px] font-semibold text-slate-800 leading-none tabular-nums">{targets.hb.label}</span>
                                            {targets.hb.current > 0 && (
                                                <span className={`text-[10px] font-semibold ${targets.hb.isOk ? 'text-slate-500' : 'text-red-500 animate-pulse'}`}>
                                                    (Real: {targets.hb.current})
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Uresis Indicator */}
                                <div
                                    onClick={() => setSelectedGoal('uresis')}
                                    className="flex items-center gap-3 group transition-all hover:scale-105 cursor-help"
                                >
                                    <div className="bg-cyan-50 p-1.5 rounded-lg border border-cyan-200 text-cyan-500">
                                        <Droplets size={16} />
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <span className="text-[10px] font-medium text-slate-400 leading-none">Uresis (Gasto)</span>
                                            <Info size={8} className="text-slate-300 group-hover:text-slate-400 transition-colors" />
                                        </div>
                                        <span className="text-[13px] font-semibold text-slate-800 leading-none tabular-nums">≥ 0.5 <span className="text-[10px] text-slate-400 font-medium ml-1">ml/kg/h</span></span>
                                    </div>
                                </div>
                            </div>
                        );
                    })()}
                </div>

                {/* VERTICAL STACKED LAYOUT */}
                <div className="p-5 flex flex-col gap-4">

                    {/* SECTION 1: PRE-QX */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 px-1">
                            <Stethoscope size={14} className="text-slate-400" strokeWidth={1.5} />
                            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Pre-Quirúrgico</span>
                        </div>
                        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
                            <div className="p-4 flex flex-col relative">
                                {(!isUnlocked && !watch('is_vip_live')) && (
                                    <div
                                        onClick={onRequestUnlock}
                                        className="absolute inset-0 z-10 bg-white/70 backdrop-blur-[3px] flex flex-col items-center justify-center gap-2 cursor-pointer rounded-b-2xl transition-colors hover:bg-white/80"
                                    >
                                        <Lock size={18} className="text-slate-300" strokeWidth={1.5} />
                                        <span className="text-[11px] font-medium text-slate-400">Desbloquear VPO para editar</span>
                                    </div>
                                )}
                                <textarea
                                    {...register('plan_pre')}
                                    readOnly={!isUnlocked && !watch('is_vip_live')}
                                    className={`w-full min-h-[160px] bg-transparent border-none resize-none text-[13px] leading-relaxed focus:ring-0 p-2 text-slate-700 font-medium placeholder:text-slate-400 placeholder:italic ${(!isUnlocked && !watch('is_vip_live')) ? 'cursor-not-allowed select-none' : ''
                                        }`}
                                    placeholder="Ayuno, Soluciones, Antibóticos..."
                                />
                                <div className="mt-2 p-2.5 bg-cyan-50/30 rounded-lg border border-cyan-200/40">
                                    <p className="text-[11px] text-cyan-600 font-medium flex items-center gap-1.5"><Info size={12} strokeWidth={1.5} /> Sugerencia: ASHP/IDSA 2024</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2: TRANS-QX */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 px-1">
                            <HeartPulse size={14} className="text-slate-400" strokeWidth={1.5} />
                            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Trans-Quirúrgico</span>
                        </div>
                        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
                            <div className="p-4 flex flex-col relative">
                                {(!isUnlocked && !watch('is_vip_live')) && (
                                    <div
                                        onClick={onRequestUnlock}
                                        className="absolute inset-0 z-10 bg-white/70 backdrop-blur-[3px] flex flex-col items-center justify-center gap-2 cursor-pointer rounded-b-2xl transition-colors hover:bg-white/80"
                                    >
                                        <Lock size={18} className="text-slate-300" strokeWidth={1.5} />
                                        <span className="text-[11px] font-medium text-slate-400">Desbloquear VPO para editar</span>
                                    </div>
                                )}
                                <textarea
                                    {...register('plan_trans')}
                                    readOnly={!isUnlocked && !watch('is_vip_live')}
                                    className={`w-full min-h-[160px] bg-transparent border-none resize-none text-[13px] leading-relaxed focus:ring-0 p-2 text-slate-700 font-medium placeholder:text-slate-400 placeholder:italic ${(!isUnlocked && !watch('is_vip_live')) ? 'cursor-not-allowed select-none' : ''
                                        }`}
                                    placeholder="Metas hemodinámicas, Esquema Insulina..."
                                />
                                <div className="mt-2 p-2.5 bg-amber-50/30 rounded-lg border border-amber-200/40">
                                    <p className="text-[11px] text-amber-600 font-medium flex items-center gap-1.5"><Activity size={12} strokeWidth={1.5} /> Meta: GDFT (Goal Directed)</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 3: POST-QX */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 px-1">
                            <BedDouble size={14} className="text-slate-400" strokeWidth={1.5} />
                            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Post-Quirúrgico</span>
                        </div>
                        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
                            <div className="p-4 flex flex-col relative">
                                {(!isUnlocked && !watch('is_vip_live')) && (
                                    <div
                                        onClick={onRequestUnlock}
                                        className="absolute inset-0 z-10 bg-white/70 backdrop-blur-[3px] flex flex-col items-center justify-center gap-2 cursor-pointer rounded-b-2xl transition-colors hover:bg-white/80"
                                    >
                                        <Lock size={18} className="text-slate-300" strokeWidth={1.5} />
                                        <span className="text-[11px] font-medium text-slate-400">Desbloquear VPO para editar</span>
                                    </div>
                                )}
                                <textarea
                                    {...register('plan_post')}
                                    readOnly={!isUnlocked && !watch('is_vip_live')}
                                    className={`w-full min-h-[160px] bg-transparent border-none resize-none text-[13px] leading-relaxed focus:ring-0 p-2 text-slate-700 font-medium placeholder:text-slate-400 placeholder:italic ${(!isUnlocked && !watch('is_vip_live')) ? 'cursor-not-allowed select-none' : ''
                                        }`}
                                    placeholder="Reinicio V.O., Tromboprofilaxis, Alta..."
                                />
                                <div className="mt-2 p-2.5 bg-emerald-50/30 rounded-lg border border-emerald-200/40">
                                    <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1.5"><Check size={12} strokeWidth={1.5} /> Alta sugerida: Protocolo ERAS</p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

            </div>{/* end card */}
        </div>
    );
};

export default Recommendations;
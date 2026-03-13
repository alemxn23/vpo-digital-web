import React, { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { VPOData } from '../types';
import { ClipboardCheck, Calculator, AlertCircle, Bug, Search, CheckSquare, XSquare, Info, ShieldAlert, HeartPulse, User, Check, X } from 'lucide-react';

interface ScaleCardProps {
    label: string;
    desc: string;
    children?: React.ReactNode;
    autoCalc?: boolean;
    onClick?: () => void;
    isAuthorized?: boolean;
    onToggleAuth?: (e: React.MouseEvent) => void;
    className?: string;
}

const ScaleCard = ({ label, desc, children, autoCalc = false, onClick, isAuthorized, onToggleAuth, className = '' }: ScaleCardProps) => (
    <div
        onClick={onClick}
        className={`bg-white p-4 rounded-2xl border shadow-sm transition-all duration-200 relative group select-none
    ${autoCalc ? 'border-slate-200/80' : 'border-slate-200/80'} 
    ${onClick ? 'cursor-pointer hover:shadow-md hover:border-cyan-300/50 hover:-translate-y-0.5' : ''} ${className}`}
    >

        <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-1.5">
                <label className={`text-[13px] font-semibold text-slate-800 select-none`}>{label}</label>
                {autoCalc && <Calculator size={11} className="text-cyan-500" strokeWidth={1.5} />}
            </div>
            <span className="text-[10px] text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full whitespace-nowrap select-none font-medium">{desc}</span>
        </div>
        {children}
        {/* Hint for interactivity */}
        {onClick && (
            <div className="absolute bottom-2 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                <span className="text-[10px] font-semibold text-cyan-600 flex items-center gap-1 select-none bg-cyan-50 px-2 py-1 rounded-full"><Search size={10} strokeWidth={1.5} /> Desglose</span>
            </div>
        )}
    </div>
);

// --- HELPER: Month Diff ---
const getMonthsDiff = (dateString: string) => {
    if (!dateString) return 999;
    const now = new Date();
    const event = new Date(dateString);
    let months = (now.getFullYear() - event.getFullYear()) * 12;
    months -= event.getMonth();
    months += now.getMonth();
    return months <= 0 ? 0 : months;
};

// --- HELPER: Week Diff ---
const getWeeksDiff = (dateString: string) => {
    if (!dateString) return 999;
    const now = new Date().getTime();
    const event = new Date(dateString).getTime();
    const diffInDays = (now - event) / (1000 * 3600 * 24);
    return diffInDays / 7;
};

const parse = (val: any) => {
    const n = parseFloat(val);
    return isNaN(n) ? 0 : n;
};

const RiskScales: React.FC = () => {
    const { register, watch, setValue } = useFormContext<VPOData>();
    const [selectedScale, setSelectedScale] = useState<string | null>(null);

    // Watch fields for Automatic Logic
    const data = watch();
    const overrides = data.risk_overrides || {};
    const authorized = data.authorized_report_scales || {};

    const toggleAuth = (scaleId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        // Por defecto todas las escalas inician desactivadas (gris) hasta que el usuario las active
        const current = authorized[scaleId] === true;
        setValue('authorized_report_scales', {
            ...authorized,
            [scaleId]: !current
        });
    };

    // --- MASTER SCORE FUNCTION LOGIC ---
    // --- MASTER SCORE FUNCTION LOGIC ---
    useEffect(() => {
        // Helper to prevent infinite loops due to type mismatch (string vs number) or NaN
        const safeSet = (key: keyof VPOData, newVal: any) => {
            const current = data[key];
            // Handle NaN comparisons (NaN !== NaN is true)
            if (typeof newVal === 'number' && typeof current === 'number' && isNaN(newVal) && isNaN(current)) {
                return;
            }
            if (current != newVal) {
                setValue(key, newVal);
            }
        };

        // --- 0. PRE-CALCULATE FLAGS ---
        const monthsPostIAM = data.cardiopatiaIsquemica && data.cardio_tipo_evento === 'iam' ? getMonthsDiff(data.cardio_fecha_evento) : 999;
        const isIAMReciente = monthsPostIAM < 6;
        const isIAMAntiguo = monthsPostIAM >= 6 && monthsPostIAM < 999;

        const isAnginaInestable = data.cardiopatiaIsquemica && data.cardio_tipo_evento === 'angina_inestable';
        const isEstenosisSevera = (data.valvulopatia && data.valvula_afectada === 'aortica' && data.valvula_patologia === 'estenosis' && data.valvula_severidad === 'severa') || data.exploracion_estenosis_aortica || data.eco_valvulopatia === 'estenosis_aortica_severa';

        const isSato2Critica = data.sato2 > 0 && data.sato2 < 90;
        const isNaCritico = data.na > 0 && (data.na < 130 || data.na > 150);
        const isTACritica = data.taSistolica > 0 && (data.taSistolica < 90 || data.taSistolica > 170);
        const isFCCritica = data.fc > 0 && (data.fc < 50 || data.fc > 110);

        const weeksPostEAP = data.icc && data.icc_historia_eap ? getWeeksDiff(data.icc_fecha_eap) : 999;
        const isEAPAgudo = weeksPostEAP < 1;
        const monthsPostEVC = data.evc ? getMonthsDiff(data.evc_fecha) : 999;
        const isEVCAgudo = monthsPostEVC < 1;

        const malEstadoGeneral = (data.k && data.k < 3) || (parse(data.creatinina) > 3) || (data.urea > 50) || isSato2Critica || isNaCritico || isTACritica || isFCCritica || data.hepatopatia || data.capA_reposo;

        safeSet('flag_iam_reciente', isIAMReciente);
        safeSet('flag_angina_inestable', isAnginaInestable);
        safeSet('flag_estenosis_aortica_severa', isEstenosisSevera);
        safeSet('flag_eap_agudo', isEAPAgudo);
        safeSet('flag_evc_agudo', isEVCAgudo);

        const getVal = (key: string, auto: boolean) => {
            if (overrides && overrides[key] !== undefined) return overrides[key];
            return auto;
        };

        // --- 1. Lee (RCRI) ---
        let leePoints = 0;
        // High-risk surgery criterion — from Gabinete incision site
        if (getVal('lee_cx_high', data.capB_cxMayor || data.ariscat_incision === 'abdominal_sup' || data.ariscat_incision === 'intratoracica')) leePoints++;
        // Ischemic heart disease: history OR ECG evidence (LBBB, ischemia pattern)
        if (getVal('lee_ischem', data.cardiopatiaIsquemica || data.capA_iam || data.ecg_isquemia || data.ecg_brihh_completo)) leePoints++;
        // Heart failure: history OR physical OR echo FEVI
        if (getVal('lee_icc', data.icc || data.exploracion_s3 || data.exploracion_ingurgitacion || data.exploracion_estertores || (data.eco_fevi && data.eco_fevi < 40))) leePoints++;
        // Stroke/TIA/peripheral vascular: history OR focal deficit OR EVC flag
        if (getVal('lee_evc', data.evc || data.capD_evc || data.exploracion_soplo_carotideo)) leePoints++;
        if (getVal('lee_insulin', data.diabetes && data.usaInsulina)) leePoints++;
        if (getVal('lee_renal', data.creatinina > 2.0 || (data.tfg && data.tfg < 60))) leePoints++;

        let leeClass: "I" | "II" | "III" | "IV" = "I";
        if (leePoints === 0) leeClass = "I";
        else if (leePoints === 1) leeClass = "II";
        else if (leePoints === 2) leeClass = "III";
        else if (leePoints >= 3) leeClass = "IV";

        safeSet('lee', leeClass);

        // --- 2. Caprini ---
        let capPoints = 0;
        const age = parse(data.edad);
        if (age >= 75) capPoints += 3;
        else if (age >= 61) capPoints += 2;
        else if (age >= 41) capPoints += 1;
        if (parse(data.imc) > 25) capPoints += 1;

        if (data.capA_cxMenor) capPoints += 1;
        if (data.capA_cxMayorAnt) capPoints += 1;
        if (data.capA_varices) capPoints += 1;
        if (data.capA_eii) capPoints += 1;
        if (isIAMReciente || isIAMAntiguo || data.ecg_isquemia) capPoints += 1; // ECG ischemia also counts
        if (data.neumopatia || data.capA_epoc) capPoints += 1;
        if (data.capA_reposo) capPoints += 1;
        if (data.exploracion_edema) capPoints += 1;
        if (data.capB_cxMayor) capPoints += 2;
        if (data.capB_laparoscopia) capPoints += 2;
        if (data.capB_confinado) capPoints += 2;
        if (data.capB_ferula) capPoints += 2;
        if (data.capB_cancer) capPoints += 2;
        if (data.capB_cateter) capPoints += 2;
        if (data.capC_historiaTVP) capPoints += 3;
        if (data.capC_historiaFam) capPoints += 3;
        if (data.capC_leiden) capPoints += 3;
        if (data.capC_lupico) capPoints += 3;
        if (data.capC_hit) capPoints += 3;
        if (isEVCAgudo) capPoints += 5;
        else if (data.evc) capPoints += 1;
        if (data.capD_artroplastia) capPoints += 5;
        if (data.capD_fxCadera) capPoints += 5;
        if (data.capD_trauma) capPoints += 5;

        safeSet('caprini', capPoints);

        // --- 3. ASA Autopuntaje ---
        let asaBase: "I" | "II" | "III" | "IV" = "I";
        if (data.tabaquismo || (parse(data.imc) > 30 && parse(data.imc) < 40) || (data.hta && data.hta_control === 'controlada') || (data.diabetes && !data.usaInsulina)) asaBase = "II";
        if (parse(data.imc) >= 40 || data.enfRenalCronica || data.neumopatia || (data.icc && data.icc_nyha !== 'IV') || isIAMAntiguo || (data.hta && data.hta_control === 'descontrolada') || data.erc_dialisis) asaBase = "III";
        if (isIAMReciente || (data.icc && data.icc_nyha === 'IV') || isAnginaInestable || isEstenosisSevera || monthsPostEVC < 3 || data.hepato_child === 'C' || data.erc_estadio === 'G5') asaBase = "IV";

        // Override Logic
        let finalASA = data.asa_manual_class ? (data.asa_manual_class as any) : asaBase;
        if (data.esUrgencia && !finalASA.includes('-E')) finalASA = `${finalASA}-E`;

        safeSet('asa', finalASA);

        // --- 4. GOLDMAN ---
        let goldmanPoints = 0;
        // S3/JVD/Rales — any sign of cardiac decompensation
        if (getVal('gold_s3', data.exploracion_s3 || data.exploracion_ingurgitacion || data.exploracion_estertores || (data.icc && (data.icc_nyha === 'IV' || data.icc_evolucion === 'aguda')) || (data.eco_fevi && data.eco_fevi < 40))) goldmanPoints += 11;
        if (getVal('gold_iam', isIAMReciente)) goldmanPoints += 10;
        // Non-sinus rhythm: from history or ECG
        if (getVal('gold_ritmo', (data.arritmias && data.arritmia_tipo !== 'otra') || (data.ecg_ritmo_especifico && data.ecg_ritmo_especifico !== 'Sinusal'))) goldmanPoints += 7;
        // >5 PVCs/min: from history or ECG
        if (getVal('gold_pvc', (data.arritmias && data.arritmia_tipo === 'extrasistoles') || data.ecg_extrasistoles)) goldmanPoints += 7;
        if (getVal('gold_age', parse(data.edad) > 70)) goldmanPoints += 5;
        if (getVal('gold_urg', data.esUrgencia)) goldmanPoints += 4;
        // Severe aortic stenosis: from valve history, physical exam, or echo
        if (getVal('gold_ao', isEstenosisSevera)) goldmanPoints += 3;
        // Poor general condition: labs, vitals, hepatic, bed rest
        if (getVal('gold_gen', malEstadoGeneral)) goldmanPoints += 3;
        // Intraperitoneal/intrathoracic: from Gabinete incision site OR Gupta site
        if (getVal('gold_cx', data.ariscat_incision === 'abdominal_sup' || data.ariscat_incision === 'intratoracica' || ['aortic', 'cardiac', 'thoracic', 'intracranial'].includes(data.gupta_surgical_site || ''))) goldmanPoints += 3;

        let goldmanClass: "I" | "II" | "III" | "IV" = "I";
        if (goldmanPoints >= 26) goldmanClass = "IV";
        else if (goldmanPoints >= 13) goldmanClass = "III";
        else if (goldmanPoints >= 6) goldmanClass = "II";

        safeSet('goldman', goldmanClass);

        // --- 5. DETSKY ---
        let detskyPoints = 0;
        if (getVal('det_iam_rec', isIAMReciente)) detskyPoints += 10;
        else if (getVal('det_iam_ant', isIAMAntiguo)) detskyPoints += 5;
        if (getVal('det_ang_inest', isAnginaInestable)) detskyPoints += 20;
        else if (getVal('det_ang_est', data.cardiopatiaIsquemica && data.cardio_tipo_evento === 'angina_estable')) detskyPoints += 10;
        if (getVal('det_eap', isEAPAgudo)) detskyPoints += 10;
        else if (getVal('det_eap_hist', data.icc_historia_eap)) detskyPoints += 5;
        if (getVal('det_ao', isEstenosisSevera)) detskyPoints += 20;
        // Non-sinus rhythm: from history or ECG (includes high-degree blocks)
        if (getVal('det_ritmo', (data.arritmias && data.arritmia_tipo !== 'otra') || (data.ecg_ritmo_especifico && data.ecg_ritmo_especifico !== 'Sinusal') || (data.ecg_bloqueo as string) === 'Mobitz_II' || (data.ecg_bloqueo as string) === '3er_Grado')) detskyPoints += 5;
        if (getVal('det_gen', malEstadoGeneral)) detskyPoints += 5;
        if (getVal('det_age', parse(data.edad) > 70)) detskyPoints += 5;
        if (getVal('det_urg', data.esUrgencia)) detskyPoints += 10;

        let detskyClass: "I" | "II" | "III" = "I";
        if (detskyPoints >= 31) detskyClass = "III";
        else if (detskyPoints >= 15) detskyClass = "II";

        safeSet('detsky', detskyClass);

        // --- 6. GUPTA ---
        const intercept = -5.31;
        const coeffAge = 0.003 * parse(data.edad);
        const coeffCr = parse(data.creatinina) > 1.5 ? 0.6 : 0;
        let coeffAsa = 0;
        // We use calculated ASA base for Gupta to avoid circular logic
        const asaVal = finalASA ? finalASA.replace('-E', '') : 'I';
        if (asaVal === "II") coeffAsa = 0.11;
        if (asaVal === "III") coeffAsa = 0.69;
        if (asaVal === "IV" || asaVal === "V") coeffAsa = 1.99;

        let coeffFunc = 0;
        if (data.functional_status === 'partial') coeffFunc = 0.65;
        if (data.functional_status === 'total') coeffFunc = 0.88;

        let coeffSite = 0;
        const site = data.gupta_surgical_site || 'other';
        switch (site) {
            case 'anorectal': coeffSite = -1.5; break;
            case 'orthopedic': coeffSite = 0.2; break;
            case 'bariatric': coeffSite = 0.3; break;
            case 'thoracic': coeffSite = 0.9; break;
            case 'cardiac': coeffSite = 1.4; break;
            case 'vascular': coeffSite = 0.9; break;
            case 'aortic': coeffSite = 1.2; break;
            case 'intracranial': coeffSite = 0.9; break;
            case 'other': coeffSite = 0; break;
            default: coeffSite = 0;
        }

        const logit = intercept + coeffAge + coeffCr + coeffAsa + coeffFunc + coeffSite;
        const risk = Math.exp(logit) / (1 + Math.exp(logit));
        const riskPercent = parseFloat((risk * 100).toFixed(1));

        if (!isNaN(riskPercent)) {
            safeSet('gupta', riskPercent);
        }

        // --- 6.5 NSQIP SURGICAL RISK CALCULATOR ---
        // Based on ACS-NSQIP validated logistic regression predictors
        const nsqipIntercept = -5.80;
        const nsqipCoeffAge = 0.010 * parse(data.edad);
        let nsqipCoeffAsa = 0;
        if (asaVal === "III") nsqipCoeffAsa = 0.60;
        if (asaVal === "IV" || asaVal === "V") nsqipCoeffAsa = 1.50;
        let nsqipCoeffFunc = 0;
        if (data.functional_status === 'partial') nsqipCoeffFunc = 0.45;
        if (data.functional_status === 'total') nsqipCoeffFunc = 0.70;
        const nsqipCoeffCr = parse(data.creatinina) > 1.5 ? 0.40 : 0;
        const nsqipCoeffDm = data.diabetes ? 0.25 : 0;
        const nsqipCoeffCopd = data.neumopatia ? 0.55 : 0;
        const nsqipCoeffEmerg = data.esUrgencia ? 0.90 : 0;
        const nsqipCoeffObesity = parse(data.imc) >= 40 ? 0.30 : 0;
        const nsqipCoeffCardiac = (data.icc || isIAMReciente || isIAMAntiguo) ? 0.35 : 0;
        let nsqipCoeffSite = 0;
        switch (site) {
            case 'bariatric': nsqipCoeffSite = -0.15; break;
            case 'thoracic': nsqipCoeffSite = 0.80; break;
            case 'aortic': nsqipCoeffSite = 0.80; break;
            case 'vascular': nsqipCoeffSite = 0.65; break;
            case 'cardiac': nsqipCoeffSite = 1.10; break;
            case 'intracranial': nsqipCoeffSite = 0.70; break;
            case 'amputation': nsqipCoeffSite = 0.50; break;
            default: nsqipCoeffSite = 0;
        }
        const nsqipLogit = nsqipIntercept + nsqipCoeffAge + nsqipCoeffAsa + nsqipCoeffFunc +
            nsqipCoeffCr + nsqipCoeffDm + nsqipCoeffCopd + nsqipCoeffEmerg +
            nsqipCoeffObesity + nsqipCoeffCardiac + nsqipCoeffSite;
        const nsqipRisk = Math.exp(nsqipLogit) / (1 + Math.exp(nsqipLogit));
        const nsqipPercent = parseFloat((nsqipRisk * 100).toFixed(1));
        let nsqipRiesgo = "Bajo";
        if (nsqipPercent >= 10) nsqipRiesgo = "Alto";
        else if (nsqipPercent >= 3) nsqipRiesgo = "Moderado";
        if (!isNaN(nsqipPercent)) {
            safeSet('nsqip_total', nsqipPercent);
            safeSet('nsqip_riesgo', nsqipRiesgo);
        }

        // --- 6.1 VRC SCORE (Vascular Only) ---
        if (['vascular', 'aortic', 'amputation'].includes(site)) {
            let vrcPoints = 0;
            if (parse(data.edad) >= 70) vrcPoints += 2;
            if (data.neumopatia || data.vrc_epoc) vrcPoints += 2; // COPD
            if (parse(data.creatinina) > 1.8) vrcPoints += 2;
            if (data.cardiopatiaIsquemica || isIAMAntiguo || isIAMReciente) vrcPoints += 2; // CAD
            if (data.icc) vrcPoints += 3; // CHF
            if (data.diabetes && data.usaInsulina) vrcPoints += 1; // DM Insulin
            if (data.vrc_beta_blocker) vrcPoints += 1; // Preop BB

            safeSet('vrc_total', vrcPoints);

            // Set Risk Interpretation
            let vrcRisk = "Bajo";
            if (vrcPoints >= 7) vrcRisk = "Alto (>8% Mortalidad)";
            else if (vrcPoints >= 4) vrcRisk = "Moderado (4-8% Mortalidad)";
            else vrcRisk = "Bajo (<4% Mortalidad)";

            safeSet('vrc_riesgo', vrcRisk);

        } else {
            safeSet('vrc_total', -1);
            safeSet('vrc_riesgo', '');
        }

        // --- 7. CHA2DS2-VASc ---
        let chaPoints = 0;
        // C - Congestive HF (IC, S3, Engorgement, Rales, LVEF < 40%)
        const hasCongestion = data.icc || data.exploracion_s3 || data.exploracion_ingurgitacion || data.exploracion_estertores || (data.eco_fevi && data.eco_fevi < 40);
        if (hasCongestion) chaPoints += 1;

        if (data.hta) chaPoints += 1; // H
        if (parse(data.edad) >= 75) chaPoints += 2; // A2
        if (data.diabetes) chaPoints += 1; // D

        // S2 - Stroke/TIA/Thromboembolism (EVC, Focal deficit, Carotid bruits)
        const hasStrokeHistory = data.evc || isEVCAgudo || data.exploracion_soplo_carotideo || data.evc_secuelas;
        if (hasStrokeHistory) chaPoints += 2;

        // V - Vascular Disease (Prior MI, PAD, Aortic plaque/stenosis)
        const hasVascularDisease = data.cardiopatiaIsquemica || isIAMReciente || isIAMAntiguo || isEstenosisSevera || data.exploracion_estenosis_aortica;
        if (hasVascularDisease) chaPoints += 1;

        if (parse(data.edad) >= 65 && parse(data.edad) < 75) chaPoints += 1; // A
        if (data.genero === 'Fem') chaPoints += 1; // Sc

        safeSet('cha2ds2vasc', chaPoints);

        // --- 8. HAS-BLED ---
        let hasbledPoints = 0;
        if (data.hta && data.hta_control === 'descontrolada') hasbledPoints += 1;
        if (parse(data.creatinina) > 2.26 || data.erc_dialisis || data.erc_estadio === 'G4' || data.erc_estadio === 'G5' || (data.tfg && data.tfg < 60)) hasbledPoints += 1;
        if (data.hepatopatia || data.hepato_child === 'B' || data.hepato_child === 'C') hasbledPoints += 1;
        if (data.evc) hasbledPoints += 1;
        if (data.coagulopatia || data.inr > 1.2 || data.hasbled_inr_labil) hasbledPoints += 1;
        if (parse(data.edad) > 65) hasbledPoints += 1;
        if (data.tabaquismo || data.hasbled_alcohol) hasbledPoints += 1;

        safeSet('hasbled', hasbledPoints);

        // --- 9. STOP-BANG ---
        let sbPoints = 0;
        if (data.stopBang_snoring) sbPoints += 1;
        if (data.stopBang_tired) sbPoints += 1;
        if (data.stopBang_observed) sbPoints += 1;
        if (data.stopBang_neck) sbPoints += 1;
        if (data.hta) sbPoints += 1;
        if (parse(data.imc) > 35) sbPoints += 1;
        if (parse(data.edad) > 50) sbPoints += 1;
        if (data.genero === 'Masc') sbPoints += 1;

        safeSet('stopbang_total', sbPoints);

        // --- Risk Interpretation for STOP-BANG logic update directly
        let sbRisk = sbPoints >= 5 ? "Alto" : sbPoints >= 3 ? "Intermedio" : "Bajo";
        // Override if OSA is already diagnosed
        if (data.diagnosed_osa || data.neumo_tipo === 'saohs') {
            sbRisk = "Alto (Dx Previo)";
        }

        safeSet('stopbang_risk', sbRisk);

        // --- 10. KHORANA SCALE (VTE in Cancer) ---
        let khoranaPoints = 0;
        const siteSitio = data.cancer_tipo_sitio;

        // Site of Cancer
        if (["estomago", "pancreas"].includes(siteSitio)) khoranaPoints += 2;
        else if (["pulmon", "linfoma", "ginecologico", "vejiga", "testicular"].includes(siteSitio)) khoranaPoints += 1;

        // Labs
        if (parse(data.plaquetas) >= 350000) khoranaPoints += 1;
        if (parse(data.hb) < 10) khoranaPoints += 1; // Assuming anemia or EPO use
        if (parse(data.leucocitos) > 11000) khoranaPoints += 1;
        if (parse(data.imc) >= 35) khoranaPoints += 1;

        safeSet('khorana_total', khoranaPoints);

        let khoranaRisk: "Bajo" | "Intermedio" | "Alto" | "" = "";
        if (data.cancer_activo) {
            if (khoranaPoints >= 3) khoranaRisk = "Alto";
            else if (khoranaPoints >= 1) khoranaRisk = "Intermedio";
            else khoranaRisk = "Bajo";
        }
        safeSet('khorana_riesgo', khoranaRisk);

        // --- 11. VIENNA CATS SCORE (ESMO 2024) ---
        let viennaPoints = -1;
        let viennaRisk = "";

        if (data.cancer_activo) {
            let siteScore = 0;
            const site = data.cancer_tipo_sitio;

            // Level 2: Very High
            if (['estomago', 'pancreas', 'snc'].includes(site)) siteScore = 2;
            // Level 1: High
            else if (['pulmon', 'linfoma', 'ginecologico', 'vejiga', 'testicular', 'colorectal', 'esofago', 'rinon', 'sarcoma', 'cabeza_cuello'].includes(site)) siteScore = 1;
            // Level 0: Low/Reference (Breast, Prostate, Other)

            // D-dimer conversion: ng/mL -> ug/mL
            const ddimerUg = data.ddimer / 1000;
            const logDdimer = Math.log2(ddimerUg + 1);

            // Formula
            const preIndex = (0.6709 * siteScore) + (0.2793 * logDdimer);
            const hazard = Math.exp(preIndex);

            // Baseline Survival at 6 months (0.97863) -> 1 - S0^hazard
            const riskDecimal = 1 - Math.pow(0.97863, hazard);
            const riskPercent = riskDecimal * 100;

            viennaPoints = parseFloat(riskPercent.toFixed(1));

            if (viennaPoints >= 8) viennaRisk = "Alto (Considerar Tromboprofilaxis)";
            else viennaRisk = "Bajo / Intermedio";

            safeSet('vienna_cats_total', viennaPoints);
            safeSet('vienna_cats_risk', viennaRisk);
        } else {
            safeSet('vienna_cats_total', 0);
            safeSet('vienna_cats_risk', "");
        }

        // --- 12. METs (Functional Capacity) ---
        let suggestedMets = 4; // Default: can climb stairs (independent)
        if (data.functional_status === 'partial') suggestedMets = 3;
        if (data.functional_status === 'total') suggestedMets = 1;

        // Penalties based on comorbidities
        if (data.icc && (data.icc_nyha === 'III' || data.icc_nyha === 'IV')) suggestedMets = Math.min(suggestedMets, 3);
        if (data.neumo_o2) suggestedMets = Math.min(suggestedMets, 2);
        if (isIAMReciente || isEVCAgudo) suggestedMets = Math.min(suggestedMets, 2);
        if (data.capA_reposo) suggestedMets = 1; // Bedridden/Prolonged rest

        // Only update if not explicitly manual
        if (data.mets_method !== 'manual') {
            safeSet('mets_estimated', suggestedMets);
        }

    }, [
        data.edad, data.imc, data.genero, data.hta, data.hta_control, data.diabetes, data.usaInsulina,
        data.cardiopatiaIsquemica, data.cardio_tipo_evento, data.cardio_fecha_evento,
        data.icc, data.icc_nyha, data.icc_evolucion, data.icc_historia_eap, data.icc_fecha_eap,
        data.neumopatia, data.neumo_o2, data.neumo_tipo, data.diagnosed_osa,
        data.enfRenalCronica, data.erc_dialisis, data.erc_estadio, data.creatinina, data.tfg,
        data.hepatopatia, data.hepato_child,
        data.evc, data.evc_fecha, data.evc_secuelas,
        data.arritmias, data.arritmia_tipo,
        data.valvulopatia, data.valvula_afectada, data.valvula_patologia, data.valvula_severidad,
        // All ECG findings - critical for Goldman, Detsky, Lee reactivity
        data.ecg_ritmo_especifico, data.ecg_extrasistoles, data.ecg_hvi,
        data.ecg_brihh_incompleto, data.ecg_brihh_completo, data.ecg_isquemia,
        data.ecg_bloqueo, data.ecg_otras_alteraciones,
        data.esUrgencia, data.gupta_surgical_site, data.functional_status,
        data.stopBang_snoring, data.stopBang_tired, data.stopBang_observed, data.stopBang_neck,
        data.eco_fevi, data.eco_valvulopatia, data.eco_psap_elevada, data.eco_disfuncion_diastolica,
        data.flag_angina_inestable, data.flag_estenosis_aortica_severa, data.flag_eap_agudo, data.flag_evc_agudo,
        data.capA_cxMenor, data.capA_cxMayorAnt, data.capA_varices, data.capA_eii, data.capA_iam, data.capA_epoc, data.capA_reposo,
        data.capB_cxMayor, data.capB_laparoscopia, data.capB_confinado, data.capB_ferula, data.capB_cancer, data.capB_cateter,
        data.capC_historiaTVP, data.capC_historiaFam, data.capC_leiden, data.capC_lupico, data.capC_hit,
        data.capD_artroplastia, data.capD_fxCadera, data.capD_trauma,
        data.hasbled_inr_labil, data.hasbled_alcohol, data.vrc_epoc, data.vrc_beta_blocker,
        data.tabaquismo, data.active_smoking, data.inr, data.urea, data.asa_manual_class, data.risk_overrides,
        data.cancer_activo, data.cancer_tipo_sitio, data.hb, data.plaquetas, data.leucocitos, data.ddimer,
        data.sato2, data.na, data.k, data.cl, data.taSistolica, data.fc, data.taDiastolica, data.fr, data.temp,
        data.exploracion_s3, data.exploracion_ingurgitacion, data.exploracion_estertores, data.exploracion_edema,
        data.exploracion_estenosis_aortica, data.exploracion_soplo_carotideo,
        data.ariscat_incision, data.ariscat_duracion, data.ariscat_total,
        data.mets_method, data.mets_estimated,
        setValue
    ]);

    // --- INTERACTIVE AUDIT MODAL LOGIC ---
    const toggleOverride = (key: string, autoValue: boolean) => {
        const current = overrides[key] !== undefined ? overrides[key] : autoValue;
        if (autoValue === true && current === true) {
            const confirm = window.confirm(`⚠️ ADVERTENCIA DE SEGURIDAD\n\nEste criterio fue detectado automáticamente por datos clínicos (Labs/Exploración).\nDesmarcarlo podría subestimar el riesgo real del paciente.\n\n¿Desea forzar la modificación manual?`);
            if (!confirm) return;
        }
        const newOverrides = { ...overrides, [key]: !current };
        setValue('risk_overrides', newOverrides);
    };

    const CapriniCheckbox = ({ name, label, detected }: { name: keyof VPOData, label: string, detected?: boolean }) => {
        const isChecked = watch(name);

        return (
            <label className={`flex items-start gap-2.5 p-2.5 rounded-lg cursor-pointer transition-all duration-200 ${detected ? 'bg-cyan-50/30 border border-cyan-200/40' : isChecked ? 'bg-slate-50' : 'hover:bg-slate-50/50 border border-transparent'}`}>
                <div className="mt-0.5 relative">
                    <input type="checkbox" {...register(name)} className="w-4 h-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500/30" />
                </div>
                <div className="flex-1">
                    <span className={`text-[12px] leading-snug ${isChecked || detected ? 'text-slate-800 font-semibold' : 'text-slate-600 font-medium'}`}>{label}</span>
                    {detected && (
                        <div className="flex items-center gap-1 mt-0.5 text-[10px] text-cyan-600 font-semibold">
                            <Check size={10} strokeWidth={2} /> Detectado en Clínica
                        </div>
                    )}
                </div>
            </label>
        );
    };

    const AuditModal = () => {
        if (!selectedScale) return null;

        let content = null;
        let title = "";
        let riskStr = "";

        // 1. ASA BREAKDOWN
        if (selectedScale === 'asa') {
            title = "Estado Físico ASA";
            content = (
                <div className="space-y-4">
                    <div className="bg-slate-50 p-3 rounded-lg text-[12px] text-slate-600 border border-slate-200/60">
                        <p>Clasificación subjetiva del estado físico. Puede forzar la clase si considera que el algoritmo subestima la severidad.</p>
                    </div>
                    <table className="w-full text-[12px] border-collapse">
                        <thead>
                            <tr className="bg-slate-50 text-left"><th className="p-2 text-slate-500 font-semibold text-[11px]">Clase</th><th className="p-2 text-slate-500 font-semibold text-[11px]">Definición</th></tr>
                        </thead>
                        <tbody>
                            {[
                                { c: 'I', d: 'Sano' },
                                { c: 'II', d: 'Enfermedad sistémica leve (HTA controlada, Fumador)' },
                                { c: 'III', d: 'Enfermedad sistémica severa limitante (EPOC, IAM antiguo, ERC)' },
                                { c: 'IV', d: 'Enfermedad sistémica con amenaza constante a la vida (IAM reciente, Sepsis)' },
                            ].map(row => (
                                <tr key={row.c} className={`border-b border-slate-100 ${data.asa?.includes(row.c) && !data.asa?.includes(row.c + 'I') ? 'bg-cyan-50/50 font-semibold' : ''}`}>
                                    <td className="p-2 font-semibold text-slate-700">ASA {row.c}</td>
                                    <td className="p-2 text-slate-600">{row.d}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="border-t border-slate-100 pt-3 mt-3">
                        <label className="text-[12px] font-semibold text-slate-500 block mb-1.5">Forzar Clase ASA (Manual)</label>
                        <select
                            value={data.asa_manual_class || ""}
                            onChange={(e) => setValue('asa_manual_class', e.target.value)}
                            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500/50 transition-all mb-2"
                        >
                            <option value="">-- Usar Calculado (Auto) --</option>
                            <option value="I">ASA I</option>
                            <option value="II">ASA II</option>
                            <option value="III">ASA III</option>
                            <option value="IV">ASA IV</option>
                            <option value="IV">ASA V (Moribundo)</option>
                        </select>
                        {data.asa_manual_class && (
                            <textarea
                                placeholder="Justificación obligatoria..."
                                {...register('asa_justification')}
                                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-[12px] h-16 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500/50 hover:border-slate-300 transition-all resize-none"
                            />
                        )}
                    </div>
                </div>
            );
        }

        // 2. CAPRINI DRAWER
        else if (selectedScale === 'caprini') {
            title = "Checklist Caprini (40+ Variables)";
            // Prepare Auto-detected flags for cleaner UI
            const isIAM = (data.cardiopatiaIsquemica && (data.cardio_tipo_evento === 'iam' || data.cardio_tipo_evento === 'angina_inestable'));

            content = (
                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">

                    {/* BASAL FACTORS */}
                    <div className="bg-slate-50 p-3 rounded-lg text-[11px] space-y-1 mb-3 border border-slate-200/60">
                        <p className="font-semibold text-slate-500 text-[12px]">Factores basales detectados:</p>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="flex justify-between"><span>Edad ({data.edad}a):</span> <b>+{data.edad >= 75 ? '3' : data.edad >= 61 ? '2' : data.edad >= 41 ? '1' : '0'}</b></div>
                            <div className="flex justify-between"><span>IMC ({data.imc}):</span> <b>+{data.imc > 25 ? '1' : '0'}</b></div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <h4 className="text-[12px] font-semibold text-cyan-700 bg-cyan-50/40 px-2.5 py-1.5 rounded-lg border border-cyan-200/50">Grupo A · 1 Punto</h4>
                            <CapriniCheckbox name="capA_cxMenor" label="Cirugía menor (<45 min)" />
                            <CapriniCheckbox name="capA_cxMayorAnt" label="Antecedente Cx Mayor (<1 mes)" />
                            <CapriniCheckbox name="capA_varices" label="Venas varicosas / Edema" />
                            <CapriniCheckbox name="capA_eii" label="Enf. Inflamatoria Intestinal" />
                            <CapriniCheckbox name="capA_iam" label="IAM (Historia)" detected={isIAM} />
                            <CapriniCheckbox name="capA_epoc" label="EPOC / Neumonía (<1 mes)" detected={data.neumopatia} />
                            <CapriniCheckbox name="capA_reposo" label="Paciente en cama (>72h)" />
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-[12px] font-semibold text-indigo-700 bg-indigo-50/40 px-2.5 py-1.5 rounded-lg border border-indigo-200/50">Grupo B · 2 Puntos</h4>
                            <CapriniCheckbox name="capB_cxMayor" label="Cirugía Mayor (>45 min)" />
                            <CapriniCheckbox name="capB_laparoscopia" label="Laparoscopía (>45 min)" />
                            <CapriniCheckbox name="capB_confinado" label="Confinado a cama (>72h)" />
                            <CapriniCheckbox name="capB_ferula" label="Inmovilización yeso/férula" />
                            <CapriniCheckbox name="capB_cancer" label="Cáncer activo (o tx <6m)" />
                            <CapriniCheckbox name="capB_cateter" label="Acceso Venoso Central" />
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-[12px] font-semibold text-violet-700 bg-violet-50/40 px-2.5 py-1.5 rounded-lg border border-violet-200/50">Grupo C · 3 Puntos</h4>
                            <CapriniCheckbox name="capC_historiaTVP" label="Historia TVP / TEP" />
                            <CapriniCheckbox name="capC_historiaFam" label="Historia Fam. Trombosis" />
                            <CapriniCheckbox name="capC_leiden" label="Factor V Leiden" />
                            <CapriniCheckbox name="capC_lupico" label="Anticoagulante Lúpico" />
                            <CapriniCheckbox name="capC_hit" label="Trombocitopenia Inducida Heparina (HIT)" />
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-[12px] font-semibold text-red-700 bg-red-50/40 px-2.5 py-1.5 rounded-lg border border-red-200/50">Grupo D · 5 Puntos</h4>
                            <CapriniCheckbox name="capD_evc" label="EVC (< 1 mes)" detected={data.evc && getMonthsDiff(data.evc_fecha) < 1} />
                            <CapriniCheckbox name="capD_artroplastia" label="Artroplastía (Cadera/Rodilla)" />
                            <CapriniCheckbox name="capD_fxCadera" label="Fractura de Cadera/Pelvis/Pierna" />
                            <CapriniCheckbox name="capD_trauma" label="Trauma Agudo Medular (Parálisis)" />
                        </div>
                    </div>
                </div>
            );
        }

        // 3. GENERIC CRITERIA LIST (GOLDMAN, DETSKY, LEE)
        else {
            let criteria: any[] = [];

            if (selectedScale === 'goldman') {
                title = "Goldman (1977)";
                const pts = [0, 5, 12, 25]; // Thresholds
                const risks = ["0.2%", "1%", "7%", "22%"]; // Complication risk
                // Determine risk
                let cls = data.goldman;
                let r = cls === 'I' ? risks[0] : cls === 'II' ? risks[1] : cls === 'III' ? risks[2] : risks[3];
                const modalMalEstadoGeneral = (data.k && data.k < 3) || (parse(data.creatinina) > 3) || (data.urea > 50) || (data.sato2 > 0 && data.sato2 < 90) || (data.na > 0 && (data.na < 130 || data.na > 150)) || (data.taSistolica > 0 && (data.taSistolica < 90 || data.taSistolica > 170)) || (data.fc > 0 && (data.fc < 50 || data.fc > 110)) || data.hepatopatia || data.capA_reposo;

                criteria = [
                    { id: 'gold_s3', label: "S3 / Ingurgitación / Estertores", points: 11, auto: !!(data.exploracion_s3 || data.exploracion_ingurgitacion || data.exploracion_estertores), source: "Física" },
                    { id: 'gold_iam', label: "IAM < 6 meses", points: 10, auto: !!(data.cardiopatiaIsquemica && data.cardio_tipo_evento === 'iam' && getMonthsDiff(data.cardio_fecha_evento) < 6), source: "Interrogatorio" },
                    { id: 'gold_ritmo', label: "Ritmo No Sinusal / FA", points: 7, auto: !!(data.ecg_ritmo_especifico && data.ecg_ritmo_especifico !== 'Sinusal'), source: "ECG" },
                    { id: 'gold_pvc', label: "> 5 Extrasístoles Vent/min", points: 7, auto: !!(data.ecg_extrasistoles), source: "ECG" },
                    { id: 'gold_age', label: "Edad > 70 años", points: 5, auto: !!(data.edad > 70), source: "Ficha ID" },
                    { id: 'gold_urg', label: "Cirugía de Urgencia", points: 4, auto: !!(data.esUrgencia), source: "Ficha ID" },
                    { id: 'gold_ao', label: "Estenosis Aórtica Severa", points: 3, auto: !!((data.valvulopatia && data.valvula_afectada === 'aortica' && data.valvula_patologia === 'estenosis' && data.valvula_severidad === 'severa') || data.exploracion_estenosis_aortica || data.eco_valvulopatia === 'estenosis_aortica_severa'), source: "Exploración/Eco" },
                    { id: 'gold_gen', label: "Mal Estado General (Vitals/Labs/Renal/Hepático)", points: 3, auto: !!modalMalEstadoGeneral, source: "Signos/Labs" },
                    { id: 'gold_cx', label: "Cx Intraperitoneal / Torácica", points: 3, auto: !!(data.ariscat_incision === 'abdominal_sup' || data.ariscat_incision === 'intratoracica'), source: "Gabinete" },
                ];
            }
            else if (selectedScale === 'detsky') {
                title = "Detsky Modificado";
                riskStr = data.detsky === 'I' ? "Riesgo Bajo (<15 pts)" : data.detsky === 'II' ? "Riesgo Intermedio (15-30 pts)" : "Riesgo Alto (>31 pts)";
                const modalEAPAgudo = data.icc && data.icc_historia_eap && (getWeeksDiff(data.icc_fecha_eap) < 1);
                const modalMalEstadoGeneralDetsky = (data.k && data.k < 3) || (parse(data.creatinina) > 3) || (data.urea > 50) || (data.sato2 > 0 && data.sato2 < 90) || (data.na > 0 && (data.na < 130 || data.na > 150)) || (data.taSistolica > 0 && (data.taSistolica < 90 || data.taSistolica > 170)) || (data.fc > 0 && (data.fc < 50 || data.fc > 110)) || data.hepatopatia || data.capA_reposo;

                criteria = [
                    { id: 'det_ang_inest', label: "Angina Inestable (CCS IV)", points: 20, auto: !!(data.cardiopatiaIsquemica && data.cardio_tipo_evento === 'angina_inestable'), source: "Historia" },
                    { id: 'det_ao', label: "Estenosis Aórtica Crítica", points: 20, auto: !!((data.valvulopatia && data.valvula_afectada === 'aortica' && data.valvula_patologia === 'estenosis' && data.valvula_severidad === 'severa') || data.exploracion_estenosis_aortica || data.eco_valvulopatia === 'estenosis_aortica_severa'), source: "Exploración" },
                    { id: 'det_iam_rec', label: "IAM Reciente (<6m)", points: 10, auto: !!(data.cardiopatiaIsquemica && data.cardio_tipo_evento === 'iam' && getMonthsDiff(data.cardio_fecha_evento) < 6), source: "Historia" },
                    { id: 'det_eap', label: "Edema Agudo Pulmón (<1sem)", points: 10, auto: !!modalEAPAgudo, source: "Historia" },
                    { id: 'det_urg', label: "Cirugía de Urgencia", points: 10, auto: !!data.esUrgencia, source: "ID" },
                    { id: 'det_iam_ant', label: "IAM Antiguo (>6m)", points: 5, auto: !!(data.cardiopatiaIsquemica && data.cardio_tipo_evento === 'iam' && getMonthsDiff(data.cardio_fecha_evento) >= 6), source: "Historia" },
                    { id: 'det_ritmo', label: "Ritmo No Sinusal", points: 5, auto: !!(data.ecg_ritmo_especifico && data.ecg_ritmo_especifico !== 'Sinusal'), source: "ECG" },
                    { id: 'det_gen', label: "Mal Estado General (Vitals/Labs/Renal/Hepático)", points: 5, auto: !!modalMalEstadoGeneralDetsky, source: "Signos/Labs/Historia" },
                ];
            }
            else if (selectedScale === 'lee') {
                title = "Lee (RCRI)";
                const r = data.lee === 'I' ? "0.4%" : data.lee === 'II' ? "0.9%" : data.lee === 'III' ? "6.6%" : "11%";
                riskStr = `Riesgo Evento Cardiaco Mayor: ${r}`;
                const modalEVCAgudo = data.evc && (getMonthsDiff(data.evc_fecha) < 1);
                criteria = [
                    { id: 'lee_cx_high', label: "Cirugía Alto Riesgo (Vasc/Abd/Tor)", points: 1, auto: !!(data.capB_cxMayor || (data.ariscat_incision && ['abdominal_sup', 'intratoracica'].includes(data.ariscat_incision))), source: "Tipo Cx" },
                    { id: 'lee_ischem', label: "Cardiopatía Isquémica", points: 1, auto: !!(data.cardiopatiaIsquemica || data.cardio_tipo_evento === 'iam' || data.cardio_tipo_evento === 'angina_inestable'), source: "Historia" },
                    { id: 'lee_icc', label: "Insuficiencia Cardiaca", points: 1, auto: !!(data.icc || data.exploracion_s3 || data.exploracion_ingurgitacion || data.exploracion_estertores), source: "Historia/Física" },
                    { id: 'lee_evc', label: "Historia EVC / AIT / Vascular Perif.", points: 1, auto: !!(data.evc || data.exploracion_soplo_carotideo || modalEVCAgudo), source: "Neuro/Explor" },
                    { id: 'lee_insulin', label: "Diabetes con Insulina", points: 1, auto: !!(data.diabetes && data.usaInsulina), source: "Endocrino" },
                    { id: 'lee_renal', label: "Creatinina > 2.0 mg/dL o TFG < 60", points: 1, auto: !!(data.creatinina > 2.0 || (data.tfg && data.tfg < 60)), source: "Labs" },
                ];
            }
            else if (selectedScale === 'gupta') {
                title = "Gupta MICA (NSQIP)";
                riskStr = `Probabilidad IAM/Paro 30 días: ${data.gupta}%`;
                const gupta_site_labels: Record<string, string> = {
                    anorectal: 'Anorrectal', aortic: 'Aórtica', amputation: 'Amputación',
                    bariatric: 'Bariátrica (Metabólica)', biliary: 'Biliar', cardiac: 'Cardiaca',
                    ent: 'ORL (Cabeza/Cuello)', intestinal: 'Intestinal', intracranial: 'Intracraneal',
                    neck: 'Cuello/Tiroides', obstetric: 'Obstétrica', orthopedic: 'Ortopédica',
                    spinal: 'Columna', thoracic: 'Torácica', vascular: 'Vascular Periférica',
                    urologic: 'Urológica', other: 'Otra'
                };
                content = (
                    <div className="space-y-3">
                        <div className="p-3 bg-blue-50 rounded text-center">
                            <span className="text-3xl font-bold text-clinical-navy">{data.gupta}%</span>
                            <p className="text-[10px] uppercase text-gray-500">Riesgo IAM/Paro Cardíaco 30 días</p>
                        </div>
                        <div className="space-y-2 text-xs">
                            <div className="flex justify-between border-b pb-1"><span>Edad:</span> <b>{data.edad} años (+{(0.003 * (data.edad || 0)).toFixed(3)})</b></div>
                            <div className="flex justify-between border-b pb-1"><span>Creatinina:</span> <b>{data.creatinina} {data.creatinina > 1.5 ? '⚠️ +0.60' : '(Normal)'}</b></div>
                            <div className="flex justify-between border-b pb-1"><span>Estado Funcional:</span> <b>{data.functional_status === 'independent' ? 'Independiente (0)' : data.functional_status === 'partial' ? 'Dependencia Parcial (+0.65)' : 'Dependencia Total (+0.88)'}</b></div>
                            <div className="flex justify-between border-b pb-1"><span>ASA:</span> <b>{data.asa}</b></div>
                            <div className="flex justify-between border-b pb-1">
                                <span>Sitio Quirúrgico:</span>
                                <b>{gupta_site_labels[data.gupta_surgical_site] || data.gupta_surgical_site}</b>
                            </div>
                        </div>
                        <div className="border-t pt-2">
                            <label className="text-xs font-bold block mb-1">Cambiar Sitio Quirúrgico</label>
                            <select
                                value={data.gupta_surgical_site || 'other'}
                                onChange={(e) => setValue('gupta_surgical_site', e.target.value as any)}
                                className="w-full p-2 border rounded text-xs"
                            >
                                {Object.entries(gupta_site_labels).map(([val, lbl]) => (
                                    <option key={val} value={val}>{lbl}</option>
                                ))}
                            </select>
                        </div>
                        <div className="p-2 bg-slate-50 rounded text-[10px] text-slate-500 italic border">
                            Modelo logístico validado en 211,410 pacientes (NSQIP/MICA). Predice infarto o paro cardíaco a 30 días.
                        </div>
                    </div>
                );
            }
            else if (selectedScale === 'nsqip') {
                title = "NSQIP — Complicaciones Quirúrgicas";
                riskStr = `Riesgo complicación mayor 30d: ${data.nsqip_total}% (${data.nsqip_riesgo})`;
                const nsqipSite = data.gupta_surgical_site || 'other';
                const nsqipAsaVal = (data.asa || 'I').replace('-E', '');
                content = (
                    <div className="space-y-3">
                        <div className={`p-3 rounded text-center border-2 ${(data.nsqip_total || 0) >= 10 ? 'bg-red-50 border-red-300' :
                            (data.nsqip_total || 0) >= 3 ? 'bg-amber-50 border-amber-300' :
                                'bg-green-50 border-green-300'
                            }`}>
                            <span className={`text-3xl font-bold ${(data.nsqip_total || 0) >= 10 ? 'text-red-700' :
                                (data.nsqip_total || 0) >= 3 ? 'text-amber-700' : 'text-green-700'
                                }`}>{data.nsqip_total}%</span>
                            <p className="text-[10px] uppercase text-gray-500 mt-1">Riesgo Complicación Mayor</p>
                            <p className={`text-xs font-black uppercase ${(data.nsqip_total || 0) >= 10 ? 'text-red-600' :
                                (data.nsqip_total || 0) >= 3 ? 'text-amber-600' : 'text-green-600'
                                }`}>{data.nsqip_riesgo}</p>
                        </div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase border-b pb-1">Factores Detectados</p>
                        <div className="space-y-1">
                            {[
                                { label: `Edad (${data.edad}a)`, val: `+${(0.010 * (data.edad || 0)).toFixed(2)}`, active: true },
                                { label: `ASA ${nsqipAsaVal}`, val: nsqipAsaVal === 'III' ? '+0.60' : (nsqipAsaVal === 'IV' || nsqipAsaVal === 'V') ? '+1.50' : '0', active: nsqipAsaVal !== 'I' && nsqipAsaVal !== 'II' },
                                { label: 'Disfunción Funcional', val: data.functional_status === 'total' ? '+0.70' : '+0.45', active: data.functional_status !== 'independent' },
                                { label: `Creatinina > 1.5 (${data.creatinina})`, val: '+0.40', active: (data.creatinina || 0) > 1.5 },
                                { label: 'Diabetes Mellitus', val: '+0.25', active: !!data.diabetes },
                                { label: 'EPOC / Neumopatía', val: '+0.55', active: !!data.neumopatia },
                                { label: 'Cirugía de Urgencia', val: '+0.90', active: !!data.esUrgencia },
                                { label: `Obesidad Mórbida IMC ${data.imc}`, val: '+0.30', active: (data.imc || 0) >= 40 },
                                { label: 'Cardiopatía (ICC/IAM)', val: '+0.35', active: !!(data.icc || data.cardiopatiaIsquemica) },
                                { label: `Sitio: ${nsqipSite}`, val: nsqipSite === 'cardiac' ? '+1.10' : nsqipSite === 'thoracic' || nsqipSite === 'aortic' ? '+0.80' : nsqipSite === 'vascular' ? '+0.65' : nsqipSite === 'intracranial' ? '+0.70' : nsqipSite === 'bariatric' ? '−0.15 (↓ riesgo)' : '0', active: !['other', 'anorectal', 'biliary', 'intestinal', 'neck', 'obstetric', 'orthopedic', 'spinal', 'ent', 'urologic', 'amputation'].includes(nsqipSite) }
                            ].map((f, idx) => (
                                <div key={idx} className={`flex justify-between p-2 rounded border text-xs ${f.active ? 'bg-red-50 border-red-200 font-bold' : 'bg-gray-50 text-gray-400'
                                    }`}>
                                    <span>{f.label}</span>
                                    <span>{f.active ? f.val : '0'}</span>
                                </div>
                            ))}
                        </div>
                        <div className="p-2 bg-slate-50 rounded text-[10px] text-slate-500 italic border">
                            Modelo predictivo derivado de ACS-NSQIP. Calcula riesgo de cualquier complicación mayor a 30 días:
                            &lt;3% Bajo · 3–10% Moderado · &gt;10% Alto
                        </div>
                    </div>
                );
            }
            else if (selectedScale === 'duke') {
                title = "Criterios de Duke (Endocarditis)";
                riskStr = `Diagnóstico: ${data.duke_resultado}`;
                // Simplified Duke View
                content = (
                    <div className="space-y-3">
                        <div className={`p-2 text-center text-white font-bold rounded ${data.duke_resultado === 'Definitivo' ? 'bg-red-600' : data.duke_resultado === 'Posible' ? 'bg-amber-500' : 'bg-green-600'}`}>
                            {data.duke_resultado}
                        </div>
                        <div className="text-xs space-y-2">
                            <p className="font-bold border-b">Mayores (Detectados)</p>
                            {data.duke_mayor_hemocultivo && <div className="text-red-600">• Hemocultivos (+)</div>}
                            {data.duke_mayor_eco && <div className="text-red-600">• Ecocardiograma (+)</div>}
                            {data.duke_mayor_regurgitacion && <div className="text-red-600">• Nueva Regurgitación</div>}
                            {!data.duke_mayor_hemocultivo && !data.duke_mayor_eco && !data.duke_mayor_regurgitacion && <span className="text-gray-400 italic">Ninguno</span>}

                            <p className="font-bold border-b mt-2">Menores (Detectados)</p>
                            {data.duke_menor_fiebre && <div className="text-red-600">• Fiebre ({data.temp}°C)</div>}
                            {data.duke_menor_predisposicion && <div className="text-red-600">• Predisposición Cardíaca</div>}
                            {/* ... others ... */}
                        </div>
                    </div>
                );
            }
            else if (selectedScale === 'cha2ds2vasc') {
                title = "CHA₂DS₂-VASc (Riesgo Ictus)";
                riskStr = `Riesgo Anual Ictus: ${data.cha2ds2vasc === 0 ? '0%' : data.cha2ds2vasc === 1 ? '1.3%' : data.cha2ds2vasc === 2 ? '2.2%' : data.cha2ds2vasc === 3 ? '3.2%' : data.cha2ds2vasc === 4 ? '4.0%' : data.cha2ds2vasc === 5 ? '6.7%' : data.cha2ds2vasc === 6 ? '9.8%' : '9.6 - 15.2%'}`;
                criteria = [
                    { id: 'cha_c', label: "Insuficiencia Cardíaca (C)", points: 1, auto: !!data.icc, source: "Historia" },
                    { id: 'cha_h', label: "Hipertensión (H)", points: 1, auto: !!data.hta, source: "Historia" },
                    { id: 'cha_a2', label: "Edad >= 75 años (A₂)", points: 2, auto: data.edad >= 75, source: "ID" },
                    { id: 'cha_d', label: "Diabetes (D)", points: 1, auto: !!(data.diabetes), source: "Historia" },
                    { id: 'cha_s2', label: "Ictus / AIT / Tromboembolismo (S₂)", points: 2, auto: !!(data.evc || data.exploracion_soplo_carotideo), source: "Neuro/Explor" },
                    { id: 'cha_v', label: "Enf. Vascular (IAM, EAP, Placa) (V)", points: 1, auto: !!(data.cardiopatiaIsquemica || data.icc_historia_eap || data.flag_iam_reciente || data.flag_evc_agudo || data.exploracion_estenosis_aortica), source: "Historia/Explor" },
                    { id: 'cha_a', label: "Edad 65-74 años (A)", points: 1, auto: data.edad >= 65 && data.edad < 75, source: "ID" },
                    { id: 'cha_sc', label: "Sexo Femenino (Sc)", points: 1, auto: data.genero === 'Fem', source: "ID" },
                ];
            }
            else if (selectedScale === 'hasbled') {
                title = "HAS-BLED (Riesgo Sangrado)";
                riskStr = `Puntaje: ${data.hasbled} (${data.hasbled >= 3 ? 'ALTO RIESGO' : 'Riesgo Bajo/Mod'})`;

                // For HAS-BLED we have some manual toggles mixed with auto
                content = (
                    <div className="space-y-4">
                        <div className="bg-orange-50 p-2 rounded text-xs text-orange-900 border border-orange-100">
                            <p>Evalúa riesgo de sangrado mayor en pacientes con FA anticoagulados.</p>
                        </div>

                        <div className="space-y-2">
                            {/* Auto Items */}
                            <div className={`flex justify-between p-2 rounded border ${data.hta && data.hta_control === 'descontrolada' ? 'bg-red-50 border-red-200' : 'bg-gray-50'}`}>
                                <span className="text-xs font-bold">H: Hipertensión Descontrolada</span>
                                <span className="text-xs font-bold">{data.hta && data.hta_control === 'descontrolada' ? '+1' : '0'}</span>
                            </div>
                            <div className={`flex justify-between p-2 rounded border ${data.creatinina > 2.26 || data.erc_dialisis || (data.tfg && data.tfg < 60) || data.hepatopatia ? 'bg-red-50 border-red-200' : 'bg-gray-50'}`}>
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold">A: Fx Renal o Hepática Anormal (1 pto c/u)</span>
                                    <span className="text-[9px] text-gray-500">Cr &gt; 2.26, TFG &lt; 60, Diálisis, Cirrosis</span>
                                </div>
                                <span className="text-xs font-bold inline-flex items-center">
                                    {((data.creatinina > 2.26 || data.erc_dialisis || (data.tfg && data.tfg < 60)) ? 1 : 0) + (data.hepatopatia ? 1 : 0)} pts
                                </span>
                            </div>
                            <div className={`flex justify-between p-2 rounded border ${data.evc ? 'bg-red-50 border-red-200' : 'bg-gray-50'}`}>
                                <span className="text-xs font-bold">S: Stroke (Ictus previo)</span>
                                <span className="text-xs font-bold">{data.evc ? '+1' : '0'}</span>
                            </div>
                            <div className={`flex justify-between p-2 rounded border ${data.coagulopatia || data.inr > 1.2 ? 'bg-red-50 border-red-200' : 'bg-gray-50'}`}>
                                <span className="text-xs font-bold">B: Bleeding (Hx o Predisposición)</span>
                                <span className="text-xs font-bold">{data.coagulopatia || data.inr > 1.2 ? '+1' : '0'}</span>
                            </div>

                            {/* Manual / Mixed Items */}
                            <label className={`flex justify-between items-center p-2 rounded border cursor-pointer ${watch('hasbled_inr_labil') ? 'bg-red-50 border-red-200' : 'bg-white hover:bg-gray-50'}`}>
                                <span className="text-xs font-bold flex items-center gap-2">
                                    <input type="checkbox" {...register('hasbled_inr_labil')} className="w-4 h-4 text-clinical-navy rounded" />
                                    L: INR Lábil (TTR {'<'} 60%)
                                </span>
                                <span className="text-xs font-bold">{watch('hasbled_inr_labil') ? '+1' : '0'}</span>
                            </label>

                            <div className={`flex justify-between p-2 rounded border ${data.edad > 65 ? 'bg-red-50 border-red-200' : 'bg-gray-50'}`}>
                                <span className="text-xs font-bold">E: Elderly (Edad &gt; 65)</span>
                                <span className="text-xs font-bold">{data.edad > 65 ? '+1' : '0'}</span>
                            </div>

                            <label className={`flex justify-between items-center p-2 rounded border cursor-pointer ${watch('hasbled_alcohol') ? 'bg-red-50 border-red-200' : 'bg-white hover:bg-gray-50'}`}>
                                <span className="text-xs font-bold flex items-center gap-2">
                                    <input type="checkbox" {...register('hasbled_alcohol')} className="w-4 h-4 text-clinical-navy rounded" />
                                    D: Drogas / Alcohol ({'>'} 8 copas/sem)
                                </span>
                                <span className="text-xs font-bold">{watch('hasbled_alcohol') ? '+1' : '0'}</span>
                            </label>
                        </div>
                    </div>
                );
            }
            else if (selectedScale === 'stopBang') {
                title = "STOP-BANG (SAOS)";
                const sb_score = data.stopbang_total || 0;
                let sb_risk = "Bajo";
                if (sb_score >= 3) sb_risk = "Intermedio";
                if (sb_score >= 5) sb_risk = "Alto";
                riskStr = `Riesgo: ${sb_risk} (${sb_score}/8 pts)`;

                content = (
                    <div className="space-y-4">
                        <div className={`p-2 rounded text-xs border ${sb_score >= 5 ? 'bg-red-50 border-red-200 text-red-900' : 'bg-blue-50 border-blue-200 text-blue-900'}`}>
                            <p>Cuestionario validado para tamizaje de Apnea Obstructiva del Sueño.</p>
                            {sb_score >= 5 && <p className="mt-1 font-bold">⚠️ ALTO RIESGO: Considere vía aérea difícil y extubación despierto.</p>}
                        </div>

                        <div className="space-y-2">
                            <div className="bg-gray-100 p-2 rounded text-[10px] space-y-1 mb-2">
                                <p className="font-bold text-gray-500 uppercase">Factores Automáticos:</p>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="flex justify-between"><span>Pressure (HTA):</span> <b>{data.hta ? '+1' : '0'}</b></div>
                                    <div className="flex justify-between"><span>BMI ({'>'}35):</span> <b>{data.imc > 35 ? '+1' : '0'}</b></div>
                                    <div className="flex justify-between"><span>Age ({'>'}50):</span> <b>{data.edad > 50 ? '+1' : '0'}</b></div>
                                    <div className="flex justify-between"><span>Gender (Masc):</span> <b>{data.genero === 'Masc' ? '+1' : '0'}</b></div>
                                </div>
                            </div>

                            <p className="font-bold text-xs text-clinical-navy border-b pb-1">Cuestionario (Interrogatorio):</p>

                            <label className={`flex justify-between items-center p-2 rounded border cursor-pointer ${watch('stopBang_snoring') ? 'bg-blue-50 border-blue-200' : 'bg-white hover:bg-gray-50'}`}>
                                <span className="text-xs font-bold flex items-center gap-2">
                                    <input type="checkbox" {...register('stopBang_snoring')} className="w-4 h-4 text-clinical-navy rounded" />
                                    S (Snoring): ¿Ronca fuerte?
                                </span>
                                <span className="text-xs font-bold">{watch('stopBang_snoring') ? '+1' : '0'}</span>
                            </label>

                            <label className={`flex justify-between items-center p-2 rounded border cursor-pointer ${watch('stopBang_tired') ? 'bg-blue-50 border-blue-200' : 'bg-white hover:bg-gray-50'}`}>
                                <span className="text-xs font-bold flex items-center gap-2">
                                    <input type="checkbox" {...register('stopBang_tired')} className="w-4 h-4 text-clinical-navy rounded" />
                                    T (Tired): ¿Cansado/Soñoliento de día?
                                </span>
                                <span className="text-xs font-bold">{watch('stopBang_tired') ? '+1' : '0'}</span>
                            </label>

                            <label className={`flex justify-between items-center p-2 rounded border cursor-pointer ${watch('stopBang_observed') ? 'bg-blue-50 border-blue-200' : 'bg-white hover:bg-gray-50'}`}>
                                <span className="text-xs font-bold flex items-center gap-2">
                                    <input type="checkbox" {...register('stopBang_observed')} className="w-4 h-4 text-clinical-navy rounded" />
                                    O (Observed): ¿Alguien le ha visto dejar de respirar?
                                </span>
                                <span className="text-xs font-bold">{watch('stopBang_observed') ? '+1' : '0'}</span>
                            </label>

                            <label className={`flex justify-between items-center p-2 rounded border cursor-pointer ${watch('stopBang_neck') ? 'bg-blue-50 border-blue-200' : 'bg-white hover:bg-gray-50'}`}>
                                <span className="text-xs font-bold flex items-center gap-2">
                                    <input type="checkbox" {...register('stopBang_neck')} className="w-4 h-4 text-clinical-navy rounded" />
                                    N (Neck): ¿Cuello {'>'} 40cm?
                                </span>
                                <span className="text-xs font-bold">{watch('stopBang_neck') ? '+1' : '0'}</span>
                            </label>

                            <div className="mt-2 text-xs text-gray-400 italic">
                                *Si no se conoce el cuello, usar talla de camisa {'>'} 43cm (hombre) o {'>'} 41cm (mujer).
                            </div>
                        </div>
                    </div>
                );
            }
            else if (selectedScale === 'khorana') {
                title = "Escala de Khorana (ETV)";
                riskStr = `Puntaje: ${data.khorana_total} (${data.khorana_riesgo})`;
                const ptsSite = (["estomago", "pancreas"].includes(data.cancer_tipo_sitio)) ? 2 : (["pulmon", "linfoma", "ginecologico", "vejiga", "testicular"].includes(data.cancer_tipo_sitio)) ? 1 : 0;

                content = (
                    <div className="space-y-4">
                        <div className="bg-blue-50 p-2 rounded text-xs text-blue-900 border border-blue-100">
                            <p>Evalúa el riesgo de tromboembolismo venoso en pacientes oncológicos ambulatorios.</p>
                        </div>
                        <div className="space-y-2">
                            <div className={`flex justify-between p-2 rounded border ${ptsSite > 0 ? 'bg-red-50 border-red-200' : 'bg-gray-50'}`}>
                                <span className="text-xs font-bold">Sitio del Cáncer ({data.cancer_tipo_sitio})</span>
                                <span className="text-xs font-bold">+{ptsSite}</span>
                            </div>
                            <div className={`flex justify-between p-2 rounded border ${data.plaquetas >= 350000 ? 'bg-red-50 border-red-200' : 'bg-gray-50'}`}>
                                <span className="text-xs font-bold">Plaquetas &ge; 350,000/mm&sup3;</span>
                                <span className="text-xs font-bold">{data.plaquetas >= 350000 ? '+1' : '0'}</span>
                            </div>
                            <div className={`flex justify-between p-2 rounded border ${data.hb < 10 ? 'bg-red-50 border-red-200' : 'bg-gray-50'}`}>
                                <span className="text-xs font-bold">Hemoglobina &lt; 10 g/dL o uso de EPO</span>
                                <span className="text-xs font-bold">{data.hb < 10 ? '+1' : '0'}</span>
                            </div>
                            <div className={`flex justify-between p-2 rounded border ${data.leucocitos > 11000 ? 'bg-red-50 border-red-200' : 'bg-gray-50'}`}>
                                <span className="text-xs font-bold">Leucocitos &gt; 11,000/mm&sup3;</span>
                                <span className="text-xs font-bold">{data.leucocitos > 11000 ? '+1' : '0'}</span>
                            </div>
                            <div className={`flex justify-between p-2 rounded border ${data.imc >= 35 ? 'bg-red-50 border-red-200' : 'bg-gray-50'}`}>
                                <span className="text-xs font-bold">IMC &ge; 35 kg/m&sup2;</span>
                                <span className="text-xs font-bold">{data.imc >= 35 ? '+1' : '0'}</span>
                            </div>
                        </div>
                        <div className="mt-4 p-3 rounded-lg border bg-slate-50 text-[10px]">
                            <p className="font-bold border-b mb-1 pb-1">Interpretación (Riesgo ETV a 6 meses):</p>
                            <p>• 0 pts: Bajo (0.3 - 0.8%)</p>
                            <p>• 1-2 pts: Intermedio (1.8 - 2.0%)</p>
                            <p>• &ge; 3 pts: Alto (6.7 - 7.1%)</p>
                        </div>
                    </div>
                );
            }
            else if (selectedScale === 'mets') {
                title = "Capacidad Funcional (METs)";
                const currentMets = watch('mets_estimated') || 4;
                riskStr = currentMets >= 4 ? "Capacidad Suficiente" : "Capacidad Limitada (< 4 METs)";

                content = (
                    <div className="space-y-4">
                        <div className="bg-blue-50 p-3 rounded text-xs text-blue-900 border border-blue-100 italic">
                            Evaluación de reserva funcional. Si no se puede subir un piso de escaleras sin problemas, el riesgo cardiaco aumenta.
                        </div>

                        <div className="flex bg-gray-100 p-1 rounded-lg">
                            <button
                                onClick={() => setValue('mets_method', 'auto')}
                                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${data.mets_method !== 'manual' ? 'bg-white shadow-sm text-clinical-navy' : 'text-gray-500'}`}
                            >
                                Automático
                            </button>
                            <button
                                onClick={() => setValue('mets_method', 'manual')}
                                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${data.mets_method === 'manual' ? 'bg-white shadow-sm text-clinical-navy' : 'text-gray-500'}`}
                            >
                                Manual
                            </button>
                        </div>

                        <div className="space-y-2">
                            {[
                                { v: 1, t: "En Reposo / Encamado", d: "Limitación extrema, incapacidad de actividades básicas." },
                                { v: 2, t: "Pobre (< 4 METs)", d: "Solo actividades básicas: vestirse, comer, caminar lento." },
                                { v: 4, t: "Moderada (4 METs)", d: "Puede subir un piso de escaleras o caminar 2 cuadras rápido." },
                                { v: 7, t: "Buena (> 4 METs)", d: "Actividades vigorosas, deportes ligeros, trabajo pesado." },
                                { v: 10, t: "Excelente (> 10 METs)", d: "Deportes de alta intensidad, nadar, correr." },
                            ].map((item) => (
                                <div
                                    key={item.v}
                                    onClick={() => {
                                        setValue('mets_estimated', item.v);
                                        setValue('mets_method', 'manual');
                                    }}
                                    className={`p-3 rounded-lg border cursor-pointer transition-all ${currentMets === item.v ? 'bg-clinical-navy text-white' : 'bg-white hover:bg-slate-50'}`}
                                >
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h5 className="text-xs font-bold uppercase tracking-tight">{item.t}</h5>
                                            <p className={`text-[10px] mt-0.5 ${currentMets === item.v ? 'text-blue-100' : 'text-gray-500'}`}>{item.d}</p>
                                        </div>
                                        <span className={`text-lg font-black ml-4 ${currentMets === item.v ? 'text-white' : 'text-clinical-navy'}`}>{item.v}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {data.mets_method !== 'manual' && (
                            <div className="p-3 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                                <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Fuentes detectadas:</p>
                                <div className="space-y-1">
                                    <div className="flex justify-between text-[10px]">
                                        <span>Estado Funcional ({data.functional_status}):</span>
                                        <span className="font-bold">{data.functional_status === 'independent' ? '4 METs' : data.functional_status === 'partial' ? '3 METs' : '1 MET'}</span>
                                    </div>
                                    {data.icc && (
                                        <div className="flex justify-between text-[10px] text-red-600">
                                            <span>NYHA {data.icc_nyha}:</span>
                                            <span className="font-bold">Penalización</span>
                                        </div>
                                    )}
                                    {data.neumo_o2 && (
                                        <div className="flex justify-between text-[10px] text-red-600">
                                            <span>Uso de O2:</span>
                                            <span className="font-bold">Penalización</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                );
            }
            else if (selectedScale === 'fragilidad') {
                title = "Escala de Fragilidad Clínica (CFS)";
                const score = watch('fragilidad_score') || 1;
                riskStr = score >= 7 ? "Fragilidad Severa" : score >= 5 ? "Frágil" : "Robusto / Vulnerable";
                content = (
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                        <div className="bg-slate-50 p-3 rounded text-xs text-slate-600 border border-slate-200">
                            La valoración geriátrica identifica pacientes con mayor riesgo de complicaciones, estancia prolongada y mortalidad.
                        </div>
                        {[
                            { v: 1, t: "Muy Ajustado", d: "Activo, enérgico, motivado. Se ejercita regularmente." },
                            { v: 2, t: "Ajustado", d: "Sin enfermedad activa, pero menos enérgico que nivel 1." },
                            { v: 3, t: "Bien, con enfermedad controlada", d: "Síntomas bajo control, pero no camina regularmente." },
                            { v: 4, t: "Vulnerable", d: "No depende de otros, pero los síntomas limitan sus actividades." },
                            { v: 5, t: "Fragilidad Leve", d: "Necesita ayuda con actividades instrumentales (finanzas, transporte)." },
                            { v: 6, t: "Fragilidad Moderada", d: "Necesita ayuda con baño, vestido y actividades básicas." },
                            { v: 7, t: "Fragilidad Severa", d: "Completamente dependiente para cuidado personal." },
                            { v: 8, t: "Fragilidad Muy Severa", d: "Al final de la vida, completamente dependiente." },
                            { v: 9, t: "Enfermedad Terminal", d: "Expectativa de vida < 6 meses." }
                        ].map((item) => (
                            <div
                                key={item.v}
                                onClick={() => setValue('fragilidad_score', item.v)}
                                className={`p-2 rounded-lg border cursor-pointer transition-all ${score === item.v ? 'bg-clinical-navy border-clinical-navy text-white' : 'bg-white hover:bg-slate-50'}`}
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <span className={`text-lg font-black ${score === item.v ? 'text-white' : 'text-clinical-navy'}`}>{item.v}</span>
                                    <div className="flex-1">
                                        <h5 className="text-xs font-bold leading-tight uppercase tracking-tight">{item.t}</h5>
                                        <p className={`text-[10px] leading-tight mt-0.5 ${score === item.v ? 'text-blue-100' : 'text-gray-500'}`}>{item.d}</p>
                                    </div>
                                    {score === item.v && <Check size={16} />}
                                </div>
                            </div>
                        ))}
                    </div>
                );
            }
            else if (selectedScale === 'vrc') {
                title = "VRC Score (Vascular Risk)";
                const points = watch('vrc_total') || 0;
                riskStr = `Total de Puntos: ${points} | ${watch('vrc_riesgo')}`;
                criteria = [
                    { id: 'vrc_age', label: "Edad >= 70 años", points: 2, auto: data.edad >= 70, source: "ID" },
                    { id: 'vrc_epoc', label: "EPOC / Neumopatía", points: 2, auto: !!(data.neumopatia || data.vrc_epoc), source: "Historia" },
                    { id: 'vrc_cr', label: "Creatinina > 1.8 mg/dL", points: 2, auto: data.creatinina > 1.8, source: "Labs" },
                    { id: 'vrc_cad', label: "Enfermedad Coronaria (CAD/IAM)", points: 2, auto: !!(data.cardiopatiaIsquemica), source: "Historia" },
                    { id: 'vrc_icc', label: "Insuficiencia Cardiaca (CHF)", points: 3, auto: !!(data.icc), source: "Historia" },
                    { id: 'vrc_dm', label: "DM Insulinodependiente", points: 1, auto: !!(data.diabetes && data.usaInsulina), source: "Endocrino" },
                    { id: 'vrc_bb', label: "Uso de Beta-bloqueador", points: 1, auto: !!(data.vrc_beta_blocker), source: "Historia" },
                ];
            }
            else if (selectedScale === 'vienna_cats') {
                title = "Vienna CATS Score (ESMO 2024)";
                riskStr = `Riesgo 6 meses: ${data.vienna_cats_total}% (${data.vienna_cats_risk})`;

                const site = data.cancer_tipo_sitio;
                let siteRisk = "Bajo/Intermedio (0)";
                if (['estomago', 'pancreas', 'snc'].includes(site)) siteRisk = "Muy Alto (2)";
                else if (['pulmon', 'linfoma', 'ginecologico', 'vejiga', 'testicular', 'colorectal', 'esofago', 'rinon', 'sarcoma', 'cabeza_cuello'].includes(site)) siteRisk = "Alto (1)";

                content = (
                    <div className="space-y-4">
                        <div className="bg-blue-50 p-2 rounded text-xs text-blue-900 border border-blue-100">
                            <p>Nomograma validado (ESMO 2024) que integra sitio tumoral y Dímero-D continuo.</p>
                        </div>
                        <div className="space-y-3">
                            <div className="bg-slate-50 p-3 rounded border">
                                <h4 className="text-xs font-bold text-gray-700 mb-2">Variables del Modelo:</h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs">
                                        <span>Sitio ({site || 'No especificado'}):</span>
                                        <span className="font-bold text-clinical-navy">{siteRisk}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span>Dímero-D:</span>
                                        <span className="font-bold text-clinical-navy">{data.ddimer} ng/mL</span>
                                    </div>
                                </div>
                            </div>

                            <div className="text-center p-4 bg-white rounded border border-blue-100 shadow-sm">
                                <span className={`text-3xl font-bold ${data.vienna_cats_total >= 8 ? 'text-red-600' : 'text-clinical-navy'}`}>
                                    {data.vienna_cats_total}%
                                </span>
                                <p className="text-[10px] uppercase text-gray-400 mt-1">Probabilidad ETV acumulada a 6 meses</p>
                                {data.vienna_cats_total >= 8 && (
                                    <div className="mt-2 p-2 bg-red-50 text-red-800 text-[10px] font-bold rounded">
                                        Considere Tromboprofilaxis Primaria
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            }

            if (!content) {
                // ... generic content fallback ...
                content = (
                    <div className="space-y-2">
                        {/* ... generic implementation ... */}
                        <div className="bg-blue-50 text-blue-800 text-xs p-2 rounded mb-3 flex items-start gap-2">
                            <Info size={16} className="shrink-0 mt-0.5" />
                            <p>Los criterios en <span className="font-bold text-red-600">ROJO</span> están presentes. <span className="font-bold text-green-600">VERDE</span> ausentes.</p>
                        </div>
                        {criteria.map((c) => {
                            const isAuto = c.auto === true;
                            const isChecked = overrides[c.id] !== undefined ? overrides[c.id] : isAuto;

                            return (
                                <div
                                    key={c.id}
                                    onClick={() => toggleOverride(c.id, isAuto)}
                                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all select-none 
                                    ${isChecked ? 'bg-red-50 border-red-200' : 'bg-green-50/50 border-green-100 hover:bg-green-100'}`}
                                >
                                    <div className={`mt-0.5 w-5 h-5 flex items-center justify-center rounded border transition-colors 
                                      ${isChecked ? 'bg-red-500 border-red-500 text-white' : 'border-gray-300 bg-white'}`}>
                                        {isChecked && <CheckSquare size={14} />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between">
                                            <span className={`text-sm font-bold ${isChecked ? 'text-red-900' : 'text-slate-500'}`}>{c.label}</span>
                                            <span className="text-xs font-bold text-gray-400">+{c.points}</span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[9px] uppercase tracking-wide text-gray-400 bg-white px-1 rounded border">{c.source}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                );
            }
        }

        return (
            <div className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
                <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl border border-slate-200/50">
                    <div className="bg-slate-900 p-4 flex justify-between items-center text-white shrink-0 rounded-t-2xl">
                        <div>
                            <h3 className="font-semibold flex items-center gap-2 text-base"><Search size={16} strokeWidth={1.5} /> {title}</h3>
                            {riskStr && <p className="text-[12px] text-slate-400 mt-1 font-medium">{riskStr}</p>}
                        </div>
                        <button onClick={() => setSelectedScale(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"><X size={18} strokeWidth={1.5} /></button>
                    </div>

                    <div className="p-5 overflow-y-auto flex-1">
                        {content}
                    </div>

                    <div className="p-3.5 border-t border-slate-100 bg-slate-50/50 text-right shrink-0 rounded-b-2xl">
                        <button onClick={() => setSelectedScale(null)} className="px-5 py-2.5 bg-slate-900 text-white text-[13px] font-semibold rounded-xl shadow-sm hover:bg-slate-800 transition-colors">
                            Cerrar Panel
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-4">
            {selectedScale && <AuditModal />}

            {/* ── Section Header ── */}
            <div className="flex items-center gap-3 mb-1">
                <ClipboardCheck className="text-slate-400" size={20} strokeWidth={1.5} />
                <div>
                    <h2 className="text-base font-bold text-slate-800 leading-tight">Escalas y Riesgo</h2>
                    <p className="text-[11px] text-slate-400 font-medium">Cálculo automático de riesgo preoperatorio</p>
                </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 pb-8">

                {/* SECTION: GENERAL & SPECIALTY */}
                <div className="col-span-full flex items-center gap-2 mt-1 mb-0.5 px-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                    <span className="text-[12px] font-semibold text-slate-500">Escalas Generales</span>
                </div>

                {/* ASA - Full Width */}
                <ScaleCard
                    label="ASA"
                    desc="Estado Físico"
                    autoCalc={true}
                    onClick={() => setSelectedScale('asa')}
                    isAuthorized={authorized['asa'] === true}
                    onToggleAuth={(e) => toggleAuth('asa', e)}
                >
                    <div className="relative">
                        <div className="w-full p-2.5 bg-slate-50 border border-slate-200/60 rounded-xl text-center">
                            <span className="text-2xl font-bold text-slate-800 leading-none tabular-nums">{watch('asa')}</span>
                        </div>
                    </div>
                </ScaleCard>

                {/* CAPRINI - Full Width */}
                <ScaleCard
                    label="CAPRINI"
                    desc="Riesgo Trombótico"
                    autoCalc={true}
                    onClick={() => setSelectedScale('caprini')}
                    isAuthorized={authorized['caprini'] === true}
                    onToggleAuth={(e) => toggleAuth('caprini', e)}
                >
                    <div className="flex items-center justify-between mb-2.5">
                        <div className="flex items-center gap-3">
                            <div className="w-14 p-2 bg-slate-50 border border-slate-200/60 rounded-xl text-center font-bold text-lg text-slate-800 tabular-nums">
                                {watch('caprini')}
                            </div>
                            <div>
                                <span className="text-[10px] text-slate-400 block font-medium">Puntos totales</span>
                                <span className={`text-[12px] font-semibold ${watch('caprini') >= 5 ? 'text-red-600' : watch('caprini') >= 3 ? 'text-amber-600' : 'text-emerald-600'}`}>
                                    {watch('caprini') >= 5 ? 'Alto Riesgo' : watch('caprini') >= 3 ? 'Moderado' : 'Bajo'}
                                </span>
                            </div>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setSelectedScale('caprini'); }}
                        className="relative z-20 w-full py-1.5 bg-slate-50 border border-slate-200 text-slate-600 hover:bg-cyan-50 hover:border-cyan-300/50 hover:text-cyan-700 text-[11px] font-semibold rounded-lg flex items-center justify-center gap-2 transition-all duration-200"
                    >
                        <AlertCircle size={12} strokeWidth={1.5} />
                        Abrir Checklist Completo
                    </button>
                </ScaleCard>

                {/* FRAGILIDAD */}
                <ScaleCard
                    label="Fragilidad"
                    desc="CFS (1-9)"
                    autoCalc={false}
                    onClick={() => setSelectedScale('fragilidad')}
                    isAuthorized={authorized['fragilidad'] === true}
                    onToggleAuth={(e) => toggleAuth('fragilidad', e)}
                >
                    <div className="px-1 py-1">
                        <input
                            type="range" min="1" max="9" step="1"
                            value={watch('fragilidad_score') || 1}
                            onChange={(e) => setValue('fragilidad_score', parseInt(e.target.value))}
                            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                        />
                        <div className="flex justify-between items-center mt-2">
                            <span className="text-lg font-bold text-slate-800 tabular-nums">{watch('fragilidad_score') || 1}</span>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full leading-none
                                             ${(watch('fragilidad_score') || 1) <= 3 ? 'bg-emerald-100 text-emerald-700' :
                                    (watch('fragilidad_score') || 1) <= 6 ? 'bg-amber-100 text-amber-700' :
                                        'bg-red-100 text-red-700'}`}>
                                {(watch('fragilidad_score') || 1) <= 3 ? 'Robusto' :
                                    (watch('fragilidad_score') || 1) <= 6 ? 'Vulnerable' :
                                        'Frágil'}
                            </span>
                        </div>
                    </div>
                </ScaleCard>

                {/* METS */}
                <ScaleCard
                    label="METs"
                    desc="Capacidad"
                    autoCalc={data.mets_method !== 'manual'}
                    onClick={() => setSelectedScale('mets')}
                    isAuthorized={authorized['mets'] === true}
                    onToggleAuth={(e) => toggleAuth('mets', e)}
                >
                    <div className="text-center">
                        <div className="bg-slate-50 border border-slate-200/60 text-xl font-bold rounded-xl py-1.5 px-2 text-slate-800 mb-2 tabular-nums">
                            {watch('mets_estimated') || 4}
                        </div>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full
                                         ${(watch('mets_estimated') || 4) >= 10 ? 'bg-emerald-100 text-emerald-700' :
                                (watch('mets_estimated') || 4) >= 4 ? 'bg-amber-100 text-amber-700' :
                                    'bg-red-100 text-red-700'}`}>
                            {(watch('mets_estimated') || 4) >= 10 ? 'Excelente' :
                                (watch('mets_estimated') || 4) >= 4 ? 'Moderada' :
                                    'Mala (<4)'}
                        </span>
                    </div>
                </ScaleCard>

                {/* SECTION: CARDIOVASCULAR */}
                <div className="col-span-full flex items-center gap-2 mt-4 mb-0.5 px-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    <span className="text-[12px] font-semibold text-slate-500">Riesgo Cardiovascular</span>
                </div>

                {/* LEE (RCRI) */}
                <ScaleCard
                    label="LEE (RCRI)"
                    desc="Riesgo CV"
                    autoCalc={true}
                    onClick={() => setSelectedScale('lee')}
                    isAuthorized={authorized['lee'] === true}
                    onToggleAuth={(e) => toggleAuth('lee', e)}
                >
                    <div className="text-center">
                        <span className="text-2xl font-bold text-slate-800 tabular-nums">{watch('lee')}</span>
                        <p className="text-[10px] text-slate-400 font-medium">Clase I-IV</p>
                    </div>
                </ScaleCard>

                {/* GOLDMAN */}
                <ScaleCard
                    label="GOLDMAN"
                    desc="Original '77"
                    autoCalc={true}
                    onClick={() => setSelectedScale('goldman')}
                    isAuthorized={authorized['goldman'] === true}
                    onToggleAuth={(e) => toggleAuth('goldman', e)}
                >
                    <div className="text-center">
                        <span className="text-2xl font-bold text-slate-800 tabular-nums">{watch('goldman')}</span>
                        <p className="text-[10px] text-slate-400 font-medium">Clase I-IV</p>
                    </div>
                </ScaleCard>

                {/* DETSKY */}
                <ScaleCard
                    label="DETSKY"
                    desc="Modificado"
                    autoCalc={true}
                    onClick={() => setSelectedScale('detsky')}
                    isAuthorized={authorized['detsky'] === true}
                    onToggleAuth={(e) => toggleAuth('detsky', e)}
                >
                    <div className="text-center">
                        <span className="text-2xl font-bold text-slate-800 tabular-nums">{watch('detsky')}</span>
                        <p className="text-[10px] text-slate-400 font-medium">Clase I-III</p>
                    </div>
                </ScaleCard>

                {/* GUPTA */}
                <ScaleCard
                    label="GUPTA"
                    desc="MICA-IAM"
                    autoCalc={true}
                    onClick={() => setSelectedScale('gupta')}
                    isAuthorized={authorized['gupta'] === true}
                    onToggleAuth={(e) => toggleAuth('gupta', e)}
                >
                    <div className="text-center flex flex-col items-center justify-center">
                        <span className={`text-xl font-bold tabular-nums ${(watch('gupta') || 0) > 1 ? 'text-red-600' : 'text-slate-800'}`}>
                            {watch('gupta') || 0}%
                        </span>
                        <p className="text-[10px] text-slate-400 font-medium">IAM/Paro 30d</p>
                    </div>
                </ScaleCard>

                {/* NSQIP */}
                <ScaleCard
                    label="NSQIP"
                    desc="Compl. Mayores"
                    autoCalc={true}
                    onClick={() => setSelectedScale('nsqip')}
                    isAuthorized={authorized['nsqip'] === true}
                    onToggleAuth={(e) => toggleAuth('nsqip', e)}
                >
                    <div className="text-center flex flex-col items-center justify-center">
                        <span className={`text-xl font-bold tabular-nums ${(watch('nsqip_total') || 0) >= 10 ? 'text-red-600' :
                            (watch('nsqip_total') || 0) >= 3 ? 'text-amber-600' : 'text-slate-800'
                            }`}>
                            {watch('nsqip_total') || 0}%
                        </span>
                        <p className={`text-[10px] font-semibold ${(watch('nsqip_total') || 0) >= 10 ? 'text-red-600' :
                            (watch('nsqip_total') || 0) >= 3 ? 'text-amber-600' : 'text-slate-400'
                            }`}>
                            {watch('nsqip_riesgo') || 'Bajo'}
                        </p>
                    </div>
                </ScaleCard>

                {/* DUKE */}
                <ScaleCard
                    label="DUKE"
                    desc="Endocarditis"
                    autoCalc={true}
                    onClick={() => setSelectedScale('duke')}
                    isAuthorized={authorized['duke'] === true}
                    onToggleAuth={(e) => toggleAuth('duke', e)}
                >
                    <div className="text-center flex flex-col items-center justify-center">
                        <span className={`text-[12px] font-semibold ${watch('duke_resultado') === 'Definitivo' ? 'text-red-600 animate-pulse' :
                            watch('duke_resultado') === 'Posible' ? 'text-amber-600' : 'text-slate-600'
                            }`}>
                            {watch('duke_resultado') || 'Rechazado'}
                        </span>
                        <p className="text-[10px] text-slate-400 font-medium">Criterios</p>
                    </div>
                </ScaleCard>

                {/* CHA2DS2-VASc */}
                <ScaleCard
                    label="CHA₂DS₂-VASc"
                    desc="ECV FA"
                    autoCalc={true}
                    onClick={() => setSelectedScale('cha2ds2vasc')}
                    isAuthorized={authorized['cha2ds2vasc'] === true}
                    onToggleAuth={(e) => toggleAuth('cha2ds2vasc', e)}
                >
                    <div className="text-center">
                        <span className={`text-xl font-bold tabular-nums ${(watch('cha2ds2vasc') || 0) >= 2 ? 'text-red-600' : 'text-slate-800'}`}>
                            {watch('cha2ds2vasc') || 0}
                        </span>
                        <p className="text-[10px] text-slate-400 font-medium">Puntos</p>
                    </div>
                </ScaleCard>

                {/* VRC Score (Conditional) */}
                {(watch('gupta_surgical_site') === 'vascular' || watch('gupta_surgical_site') === 'aortic' || watch('gupta_surgical_site') === 'amputation') && (
                    <ScaleCard
                        label="VRC Score"
                        desc="VSGNE Vasc"
                        autoCalc={true}
                        onClick={() => setSelectedScale('vrc')}
                        isAuthorized={authorized['vrc'] === true}
                        onToggleAuth={(e) => toggleAuth('vrc', e)}
                    >
                        <div className="text-center flex items-center justify-center gap-4">
                            <div>
                                <span className={`text-xl font-bold tabular-nums ${(watch('vrc_total') || 0) >= 4 ? 'text-red-600' : 'text-slate-800'}`}>
                                    {watch('vrc_total') !== -1 ? watch('vrc_total') : '-'}
                                </span>
                                <p className="text-[10px] text-slate-400 font-medium">Puntos</p>
                            </div>
                            <div className="h-8 w-px bg-slate-200/60" />
                            <p className={`text-[12px] font-semibold ${(watch('vrc_total') || 0) >= 4 ? 'text-red-600' : 'text-emerald-600'}`}>
                                {watch('vrc_riesgo') || 'Bajo'}
                            </p>
                        </div>
                    </ScaleCard>
                )}

                {/* SECTION: MULTISYSTEM & ONCO */}
                <div className="col-span-full flex items-center gap-2 mt-4 mb-0.5 px-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                    <span className="text-[12px] font-semibold text-slate-500">Otras Escalas</span>
                </div>

                {/* STOP-BANG */}
                <ScaleCard
                    label="STOP-BANG"
                    desc="Apnea Sueño"
                    autoCalc={true}
                    onClick={() => setSelectedScale('stopBang')}
                    isAuthorized={authorized['stopBang'] === true}
                    onToggleAuth={(e) => toggleAuth('stopBang', e)}
                >
                    <div className="text-center">
                        <span className={`text-xl font-bold tabular-nums ${(watch('stopbang_total') || 0) >= 5 ? 'text-red-600' : (watch('stopbang_total') || 0) >= 3 ? 'text-amber-600' : 'text-slate-800'}`}>
                            {watch('stopbang_total') || 0}
                        </span>
                        <p className={`text-[10px] font-semibold ${(watch('stopbang_total') || 0) >= 5 ? 'text-red-600' : (watch('stopbang_total') || 0) >= 3 ? 'text-amber-600' : 'text-slate-400'}`}>
                            {(watch('stopbang_total') || 0) >= 5 ? 'Alto' : (watch('stopbang_total') || 0) >= 3 ? 'Inter.' : 'Bajo'}
                        </p>
                    </div>
                </ScaleCard>

                {/* HAS-BLED */}
                <ScaleCard
                    label="HAS-BLED"
                    desc="Sangrado"
                    autoCalc={true}
                    onClick={() => setSelectedScale('hasbled')}
                    isAuthorized={authorized['hasbled'] === true}
                    onToggleAuth={(e) => toggleAuth('hasbled', e)}
                >
                    <div className="text-center">
                        <span className={`text-xl font-bold tabular-nums ${(watch('hasbled') || 0) >= 3 ? 'text-red-600' : 'text-slate-800'}`}>
                            {watch('hasbled') || 0}
                        </span>
                        <p className="text-[10px] text-slate-400 font-medium">Puntos</p>
                    </div>
                </ScaleCard>

                {/* KHORANA CARD (Conditional) */}
                {data.cancer_activo && !['mieloma', 'snc'].includes(data.cancer_tipo_sitio) && (
                    <ScaleCard
                        label="KHORANA"
                        desc="ETV Cáncer"
                        autoCalc={true}
                        onClick={() => setSelectedScale('khorana')}
                        isAuthorized={authorized['khorana'] === true}
                        onToggleAuth={(e) => toggleAuth('khorana', e)}
                    >
                        <div className="text-center">
                            <span className={`text-xl font-bold tabular-nums ${data.khorana_total >= 3 ? 'text-red-600' : data.khorana_total >= 1 ? 'text-amber-600' : 'text-slate-800'}`}>
                                {data.khorana_total || 0}
                            </span>
                            <p className={`text-[10px] font-semibold ${data.khorana_total >= 3 ? 'text-red-600' : data.khorana_total >= 1 ? 'text-amber-600' : 'text-slate-400'}`}>
                                {data.khorana_riesgo || 'Bajo'}
                            </p>
                        </div>
                    </ScaleCard>
                )}

                {/* VIENNA CATS CARD (Conditional) */}
                {data.cancer_activo && (
                    <ScaleCard
                        label="VIENNA CATS"
                        desc="ETV 6m"
                        autoCalc={true}
                        onClick={() => setSelectedScale('vienna_cats')}
                        isAuthorized={authorized['vienna_cats'] === true}
                        onToggleAuth={(e) => toggleAuth('vienna_cats', e)}
                    >
                        <div className="text-center">
                            <span className={`text-xl font-bold tabular-nums ${(data.vienna_cats_total || 0) >= 8 ? 'text-red-600' : 'text-slate-800'}`}>
                                {data.vienna_cats_total || 0}%
                            </span>
                            <p className={`text-[10px] font-semibold ${(data.vienna_cats_total || 0) >= 8 ? 'text-red-600' : 'text-slate-400'}`}>
                                {data.vienna_cats_risk || 'Sin Riesgo'}
                            </p>
                        </div>
                    </ScaleCard>
                )}
            </div>
        </div>
    );
};

export default RiskScales;
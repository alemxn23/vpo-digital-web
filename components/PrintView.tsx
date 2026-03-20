import React from 'react';
import { useFormContext } from 'react-hook-form';
import { VPOData } from '../types';

// PDF Version: 2026-01-25.10 (Signature & Alignment Fix)

const PrintView: React.FC<{ isPrintMode?: boolean }> = ({ isPrintMode }) => {
    const { watch } = useFormContext<VPOData>();
    const data = watch();
    const overrides = data.risk_overrides || {};
    const hasOverrides = Object.keys(overrides).length > 0;

    // Compute clinical alerts for printed report
    const getPrintedAlerts = () => {
        const alerts: string[] = [];
        if (data.esUrgencia) {
            alerts.push('⚠️ CIRUGÍA DE URGENCIA: Ayuno no garantizado. Considerar IRS. +4 Goldman / +10 Detsky / +8 ARISCAT / ASA-E.');
        }
        if (data.ecg_isquemia) alerts.push('⚡ ECG: Isquemia/Necrosis activa. Optimizar tratamiento antiisquémico previo.');
        if (data.ecg_brihh_completo) alerts.push('⚡ ECG: BRIHH Completo. Vigilar intraoperatorio. Riesgo de bloqueo con catéter.');
        if (data.ecg_extrasistoles) alerts.push('⚡ ECG: >5 Extrasístoles Ventriculares/min. Corregir electrolitos (K+, Mg²⁺).');
        if (data.ecg_ritmo_especifico === 'FA') alerts.push('⚡ FA: Verificar anticoagulación. Control FC <100 lpm.');
        if (data.ecg_ritmo_especifico === 'Marcapasos') alerts.push('⚡ Marcapasos: Usar bisturí bipolar. Tener imán disponible.');
        if (data.ecg_bloqueo === 'Mobitz_II') alerts.push('⚡ Bloqueo Mobitz II: Valorar MP temporal con Cardiología.');
        if (data.ecg_bloqueo === '3er_Grado') alerts.push('⚡ BLOQUEO COMPLETO: Requiere MP temporal definitivo antes de CX electiva.');
        const sys = data.taSistolica || 0;
        const fc = data.fc || 0;
        const sato2 = data.sato2 || 0;
        const k = data.k || 0;
        const hb = data.hb || 0;
        const plaq = data.plaquetas || 0;
        if (sys > 180) alerts.push(`⚠️ HTA Severa (${sys} mmHg): Optimizar control tensional. Meta <160 mmHg.`);
        if (fc > 100) alerts.push(`⚠️ Taquicardia (${fc} lpm): Investigar causa. Meta <100 lpm.`);
        if (sato2 > 0 && sato2 < 90) alerts.push(`⚠️ Hipoxemia Severa (SpO2 ${sato2}%): Optimizar función respiratoria previo a CX.`);
        if (k > 0 && k < 3.0) alerts.push(`⚠️ Hipocalemia (K⁺ ${k} mEq/L): Corregir previo a CX. Riesgo de arritmias.`);
        if (k > 0 && k > 5.5) alerts.push(`⚠️ Hipercalemia (K⁺ ${k} mEq/L): Corregir antes del procedimiento.`);
        if (hb > 0 && hb < 8.0) alerts.push(`⚠️ Anemia Severa (Hb ${hb} g/dL). Considerar transfusión si Hb <7.0 g/dL.`);
        if (plaq > 0 && plaq < 100) alerts.push(`⚠️ Trombocitopenia (${plaq}k): Riesgo hemorrágico elevado.`);
        if (data.exploracion_estenosis_aortica || data.flag_estenosis_aortica_severa) alerts.push('🩺 Estenosis Aórtica Severa: Mantener precarga/RVS. Evitar hipotensión.');
        if (data.exploracion_soplo_carotideo) alerts.push('🩺 Soplo Carotídeo: Mantener PAM estable. Considerar dúplex.');
        return alerts;
    };
    const printedAlerts = getPrintedAlerts();
    // IDs should only be present in Print Mode to avoid html2canvas capturing the truncated preview
    const page1Id = isPrintMode ? "print-page-1" : undefined;
    const page2Id = isPrintMode ? "print-page-2" : undefined;

    // Conditional Flags
    const showCardioembolic = data.arritmia_tipo === 'fa' || data.valvula_protesis;

    // Helper functions for text display
    const getCardioText = () => {
        if (!data.cardiopatiaIsquemica) return "Negado";
        let text = "";
        if (data.cardio_tipo_evento === 'iam') text = `IAM (${data.cardio_fecha_evento})`;
        else if (data.cardio_tipo_evento === 'angina_inestable') text = "Angina Inestable - CCS IV";
        else text = "Angina Estable";

        if (data.cardio_stent) {
            text += ` / Stent ${data.stent_tipo || ''} (${data.stent_fecha_colocacion || 'S/F'})`;
        }
        return text;
    };

    const getIccText = () => {
        if (!data.icc) return "Negado";
        return `NYHA: ${data.icc_nyha} (${data.icc_evolucion === 'aguda' ? 'AGUDA' : 'CRÓNICA'}) ${data.icc_historia_eap ? '/ Hx EAP' : ''}`;
    };

    const getNeumoText = () => {
        if (!data.neumopatia) return "Negado";
        return `${(data.neumo_tipo || '').toUpperCase()} ${data.neumo_o2 ? '(REQ. O2)' : ''}`;
    };

    const getRenalText = () => {
        if (!data.enfRenalCronica) return "Negado";
        return `ERC G${data.erc_estadio || '?'} ${data.erc_dialisis ? '(DIÁLISIS)' : '(Conservador)'}`;
    };

    const getHepatoText = () => {
        if (!data.hepatopatia) return "Negado";
        return `${(data.hepato_tipo || '').toUpperCase()} (CHILD: ${data.hepato_child || '?'}) ${data.hepato_coagulopatia ? '+COAG' : ''}`;
    };

    const Check = ({ val }: { val: boolean }) => (
        <span style={{ fontWeight: 'bold', fontSize: '10px' }}>{val ? '(SI)' : 'NEGADO'}</span>
    );

    // Shared Styles
    const baseTable: React.CSSProperties = {
        borderCollapse: 'collapse',
        tableLayout: 'fixed',
        width: '700px',
        margin: '0 auto',
        fontFamily: 'Arial, sans-serif',
        color: 'black',
        backgroundColor: 'white',
        lineHeight: '1.1',
        fontSize: '9px'
    };

    const labelStyle: React.CSSProperties = {
        fontWeight: 'bold',
        fontSize: '9px',
        whiteSpace: 'nowrap',
        lineHeight: '1.1',
        color: '#1a1a1a'
    };

    const labelTitleStyle: React.CSSProperties = {
        fontWeight: 'bold',
        fontSize: '10px',
        backgroundColor: '#f3f4f6',
        padding: '5px 8px',
        borderBottom: '1px solid black',
        borderTop: '1px solid black'
    };

    const valueStyle: React.CSSProperties = {
        fontSize: '9px',
        borderBottom: '1px solid #ccc',
        height: '16px',
        textAlign: 'left',
        paddingLeft: '4px',
        verticalAlign: 'middle',
        lineHeight: '1.2'
    };

    return (
        <div style={{ background: 'white', width: '794px', paddingBottom: '20px' }}>
            {/* PAGE 1 */}
            <div id={page1Id} style={{ width: '794px', minHeight: '1050px', padding: '20px', boxSizing: 'border-box', backgroundColor: 'white' }}>

                {/* HEADER SECTION */}
                <table border={0} cellPadding={0} cellSpacing={0} style={baseTable}>
                    <tbody>
                        <tr>
                            <td width="130" valign="middle" style={{ width: '130px', borderBottom: '2px solid black', paddingBottom: '12px' }}>
                                <img src="/logo.png?v=8" alt="Logo" style={{ width: '100%', height: 'auto', objectFit: 'contain' }} />
                            </td>
                            <td width="284" valign="bottom" style={{ paddingLeft: '24px', borderBottom: '2px solid black', paddingBottom: '12px' }}>
                                <div style={{ fontSize: '15px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.01em', marginBottom: '2px', lineHeight: '1' }}>
                                    {(data.unidadMedica || '').toUpperCase()}
                                </div>
                                <div style={{ fontSize: '13px', fontWeight: 700, color: '#334155', letterSpacing: '0.01em', marginBottom: '4px' }}>
                                    {(data.servicioSolicitante || '').toUpperCase()}
                                </div>
                            </td>
                            <td width="300" align="right" valign="top" style={{ borderBottom: '2px solid black', paddingBottom: '12px' }}>
                                <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#1e40af', letterSpacing: '0.1em' }}>DIRECCIÓN DE PRESTACIONES MÉDICAS</div>
                                <div style={{ fontSize: '14px', fontWeight: 900, textDecoration: 'underline', marginTop: '12px', color: 'black', letterSpacing: '0.02em' }}>VALORACIÓN PREOPERATORIA</div>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <table width="714" height="15"><tbody><tr><td></td></tr></tbody></table>

                {/* IDENTIFICATION SECTION */}
                <table border={1} cellPadding={0} cellSpacing={0} style={{ ...baseTable, border: '1px solid black' }}>
                    <tbody>
                        <tr>
                            <td style={{ padding: '10px' }}>
                                <table width="100%" border={0} cellPadding={2} cellSpacing={0}>
                                    <tbody>
                                        <tr>
                                            <td style={{ ...labelStyle, width: '60px' }}>NOMBRE:</td>
                                            <td style={valueStyle}>{data.nombre}</td>
                                            <td style={{ ...labelStyle, width: '50px', paddingLeft: '10px' }}>FECHA:</td>
                                            <td style={{ ...valueStyle, width: '100px' }}>{data.fecha}</td>
                                        </tr>
                                    </tbody>
                                </table>
                                <table width="100%" border={0} cellPadding={2} cellSpacing={0} style={{ tableLayout: 'fixed', marginTop: '8px' }}>
                                    <tbody>
                                        <tr>
                                            <td style={{ ...labelStyle, width: '35px' }}>NSS:</td>
                                            <td style={{ ...valueStyle, width: '150px' }}>{data.nss}</td>
                                            <td style={{ ...labelStyle, width: '45px', paddingLeft: '10px' }}>EDAD:</td>
                                            <td style={{ ...valueStyle, width: '40px' }}>{data.edad}</td>
                                            <td style={{ ...labelStyle, width: '65px', paddingLeft: '10px' }}>GÉNERO:</td>
                                            <td style={{ ...valueStyle, width: '60px' }}>{data.genero}</td>
                                            <td style={{ ...labelStyle, width: '45px', paddingLeft: '10px' }}>CAMA:</td>
                                            <td style={valueStyle}>{data.cama}</td>
                                        </tr>
                                    </tbody>
                                </table>
                                <table width="100%" border={0} cellPadding={2} cellSpacing={0} style={{ marginTop: '8px' }}>
                                    <tbody>
                                        <tr>
                                            <td style={{ ...labelStyle, width: '100px' }}>DX QUIRÚRGICO:</td>
                                            <td style={valueStyle}>{data.diagnosticoQuirurgico}</td>
                                        </tr>
                                    </tbody>
                                </table>
                                <table width="100%" border={0} cellPadding={2} cellSpacing={0} style={{ marginTop: '8px' }}>
                                    <tbody>
                                        <tr>
                                            <td style={{ ...labelStyle, width: '130px' }}>CIRUGÍA PROGRAMADA:</td>
                                            <td style={valueStyle}>{data.cirugiaProgramada}</td>
                                        </tr>
                                    </tbody>
                                </table>
                                <table width="100%" border={0} cellPadding={2} cellSpacing={0} style={{ tableLayout: 'fixed', marginTop: '6px' }}>
                                    <tbody>
                                        <tr height="20">
                                            <td style={{ ...labelStyle, width: '35px' }}>TIPO:</td>
                                            <td style={{ ...valueStyle, width: '130px' }}>{data.esUrgencia ? 'URGENCIA' : 'ELECTIVA'}</td>
                                            <td style={{ ...labelStyle, width: '40px', paddingLeft: '10px' }}>PESO:</td>
                                            <td style={{ ...valueStyle, width: '45px' }}>{data.peso} kg</td>
                                            <td style={{ ...labelStyle, width: '45px', paddingLeft: '10px' }}>TALLA:</td>
                                            <td style={{ ...valueStyle, width: '45px' }}>{data.talla} m</td>
                                            <td style={{ ...labelStyle, width: '40px', paddingLeft: '10px', backgroundColor: '#f3f4f6', textAlign: 'center' }}>IMC:</td>
                                            <td style={{ ...valueStyle, backgroundColor: '#f3f4f6', textAlign: 'center', fontWeight: 'bold' }}>{data.imc}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <table width="714" height="15"><tbody><tr><td></td></tr></tbody></table>

                {/* VITAL SIGNS & PHYSICAL EXPLORATION */}
                <table border={1} cellPadding={0} cellSpacing={0} style={{ ...baseTable, border: '1px solid black' }}>
                    <tbody>
                        <tr height="30" bgcolor="#f3f4f6" align="center">
                            <td style={{ ...labelStyle, textAlign: 'center' }}>TA: {data.taSistolica}/{data.taDiastolica}</td>
                            <td style={{ ...labelStyle, textAlign: 'center' }}>FC: {data.fc}</td>
                            <td style={{ ...labelStyle, textAlign: 'center' }}>FR: {data.fr}</td>
                            <td style={{ ...labelStyle, textAlign: 'center' }}>TEMP: {data.temp}°C</td>
                            <td style={{ ...labelStyle, textAlign: 'center' }}>SATO2: {data.sato2}%</td>
                            <td style={{ ...labelStyle, textAlign: 'center' }}>GLUC: {data.glucosaCapilar}</td>
                        </tr>
                        <tr>
                            <td colSpan={6} style={{ padding: '8px 10px', backgroundColor: '#fff' }}>
                                <table width="100%" border={0} cellPadding={0} cellSpacing={0} style={{ tableLayout: 'fixed' }}>
                                    <tbody>
                                        <tr>
                                            <td style={{ ...labelStyle, textDecoration: 'underline', width: '300px' }}>EXPLORACIÓN FÍSICA Y HALLAZGOS CRÍTICOS:</td>
                                            <td align="right">
                                                {(data.exploracion_ingurgitacion || data.exploracion_s3 || data.exploracion_estertores || data.exploracion_soplo_carotideo || data.exploracion_estenosis_aortica) && (
                                                    <span style={{ backgroundColor: '#fee2e2', color: '#991b1b', fontSize: '8px', fontWeight: 'bold', padding: '3px 8px', border: '1px solid #fecaca', borderRadius: '4px', whiteSpace: 'nowrap' }}>
                                                        ⚠️ HALLAZGOS DE ALTO RIESGO
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                                <table width="100%" border={0} cellPadding={0} cellSpacing={0} style={{ tableLayout: 'fixed', marginTop: '6px' }}>
                                    <tbody>
                                        <tr style={{ fontSize: '9.5px' }}>
                                            <td style={{ color: data.exploracion_ingurgitacion ? '#b91c1c' : 'inherit', fontWeight: data.exploracion_ingurgitacion ? 'bold' : 'normal' }}>
                                                Ing. Yugular: {data.exploracion_ingurgitacion ? 'SI' : 'NO'}
                                            </td>
                                            <td style={{ color: data.exploracion_s3 ? '#b91c1c' : 'inherit', fontWeight: data.exploracion_s3 ? 'bold' : 'normal' }}>
                                                Ruidos S3: {data.exploracion_s3 ? 'SI' : 'NO'}
                                            </td>
                                            <td style={{ color: data.exploracion_estertores ? '#b91c1c' : 'inherit', fontWeight: data.exploracion_estertores ? 'bold' : 'normal' }}>
                                                Estertores: {data.exploracion_estertores ? 'SI' : 'NO'}
                                            </td>
                                            <td style={{ color: data.exploracion_edema ? '#b91c1c' : 'inherit', fontWeight: data.exploracion_edema ? 'bold' : 'normal' }}>
                                                Edema: {data.exploracion_edema ? 'SI' : 'NO'}
                                            </td>
                                            <td style={{ color: data.exploracion_soplo_carotideo ? '#b91c1c' : 'inherit', fontWeight: data.exploracion_soplo_carotideo ? 'bold' : 'normal' }}>
                                                Soplo: {data.exploracion_soplo_carotideo ? 'SI' : 'NO'}
                                            </td>
                                            <td style={{ color: data.exploracion_estenosis_aortica ? '#b91c1c' : 'inherit', fontWeight: data.exploracion_estenosis_aortica ? 'bold' : 'normal' }}>
                                                Est. Aórtica: {data.exploracion_estenosis_aortica ? 'SI' : 'NO'}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <table width="714" height="15"><tbody><tr><td></td></tr></tbody></table>

                {/* RISK FACTORS SECTION */}
                <table border={1} cellPadding={0} cellSpacing={0} style={{ ...baseTable, border: '1px solid black' }}>
                    <tbody>
                        <tr>
                            <td height="25" style={labelTitleStyle}>FACTORES DE RIESGO Y COMORBILIDADES</td>
                        </tr>
                        <tr>
                            <td style={{ padding: '10px' }}>
                                <table width="100%" border={0} cellPadding={2} cellSpacing={0}>
                                    <tbody>
                                        <tr>
                                            <td width="50%" style={{ borderBottom: '1px solid #eee', padding: '4px 0' }}><span style={labelStyle}>TABAQUISMO:</span> <Check val={data.tabaquismo} /> {data.tabaquismo && `IT: ${data.indiceTabaquico} (${data.riesgoEPOC})`}</td>
                                            <td width="50%" style={{ borderBottom: '1px solid #eee', padding: '4px 0', paddingLeft: '15px' }}><span style={labelStyle}>ALERGIAS:</span> {data.alergicos ? `(SI) ${data.alergicosDetalle || ''}` : 'NEGADO'}</td>
                                        </tr>
                                        <tr>
                                            <td style={{ borderBottom: '1px solid #eee', padding: '4px 0' }}><span style={labelStyle}>HTA:</span> <Check val={data.hta} /> {data.hta && `(${(data.hta_control || '').toUpperCase()} - ${data.hta_tiempo} años)`}</td>
                                            <td style={{ borderBottom: '1px solid #eee', padding: '4px 0', paddingLeft: '15px' }}><span style={labelStyle}>DIABETES:</span> <Check val={data.diabetes} /> {data.diabetes && `(Tipo ${data.diabetesTipo} - ${data.diabetesTiempo} años) ${data.usaInsulina ? '[INSULINA]' : ''}`}</td>
                                        </tr>
                                        <tr>
                                            <td style={{ borderBottom: '1px solid #eee', padding: '4px 0' }}><span style={labelStyle}>CARD. ISQUÉMICA:</span> <Check val={data.cardiopatiaIsquemica} /> {data.cardiopatiaIsquemica && getCardioText()}</td>
                                            <td style={{ borderBottom: '1px solid #eee', padding: '4px 0', paddingLeft: '15px' }}><span style={labelStyle}>I. CARDIACA:</span> <Check val={data.icc} /> {data.icc && getIccText()}</td>
                                        </tr>
                                        <tr>
                                            <td style={{ borderBottom: '1px solid #eee', padding: '4px 0' }}><span style={labelStyle}>ARRITMIAS:</span> <Check val={data.arritmias} /> {data.arritmias && `${(data.arritmia_tipo || '').toUpperCase()} ${data.marcapasos ? '[MARCAPASOS]' : ''}`}</td>
                                            <td style={{ borderBottom: '1px solid #eee', padding: '4px 0', paddingLeft: '15px' }}><span style={labelStyle}>VALVULOPATÍA:</span> <Check val={data.valvulopatia} /> {data.valvulopatia && `${data.valvula_afectada} ${data.valvula_patologia} (${data.valvula_severidad})`}</td>
                                        </tr>
                                        <tr>
                                            <td style={{ borderBottom: '1px solid #eee', padding: '4px 0' }}><span style={labelStyle}>ENF. RENAL:</span> <Check val={data.enfRenalCronica} /> {data.enfRenalCronica && getRenalText()}</td>
                                            <td style={{ borderBottom: '1px solid #eee', padding: '4px 0', paddingLeft: '15px' }}><span style={labelStyle}>NEUMOPATÍA:</span> <Check val={data.neumopatia} /> {data.neumopatia && getNeumoText()}</td>
                                        </tr>
                                        <tr>
                                            <td style={{ borderBottom: '1px solid #eee', padding: '4px 0' }}><span style={labelStyle}>EVC (NEURO):</span> <Check val={data.evc} /> {data.evc && `${(data.evc_tipo || '').toUpperCase()} (${data.evc_fecha})`}</td>
                                            <td style={{ borderBottom: '1px solid #eee', padding: '4px 0', paddingLeft: '15px' }}><span style={labelStyle}>HEPATOPATÍA:</span> <Check val={data.hepatopatia} /> {data.hepatopatia && getHepatoText()}</td>
                                        </tr>
                                        <tr>
                                            <td colSpan={2} style={{ borderBottom: '1px solid #eee', padding: '4px 0' }}><span style={labelStyle}>COAGULOPATÍA:</span> <Check val={data.coagulopatia} /> {data.coagulopatia && data.coag_tipo}</td>
                                        </tr>
                                    </tbody>
                                </table>
                                <table width="100%" border={0} cellPadding={2} cellSpacing={0} style={{ marginTop: '8px' }}>
                                    <tbody>
                                        <tr><td style={labelStyle}>ANTECEDENTES QUIRÚRGICOS / COMPLICACIONES:</td></tr>
                                        <tr><td style={{ ...valueStyle, borderBottom: '1px dotted black', minHeight: '30px', verticalAlign: 'top' }}>{data.cirugiasPrevias || '-'}</td></tr>
                                        <tr><td height="5"></td></tr>
                                        <tr><td style={labelStyle}>OTROS DIAGNÓSTICOS Y TRATAMIENTO ACTUAL:</td></tr>
                                        <tr><td style={{ ...valueStyle, borderBottom: '1px dotted black', minHeight: '30px', verticalAlign: 'top' }}>{data.otrasEnfermedades} {data.tratamientoActual ? `/ ${data.tratamientoActual}` : ''}</td></tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <table width="714" height="15"><tbody><tr><td></td></tr></tbody></table>

                {/* LABS & CABINET SUMMARY */}
                <table border={1} cellPadding={0} cellSpacing={0} style={{ ...baseTable, border: '1px solid black' }}>
                    <thead>
                        <tr bgcolor="#f3f4f6" height="25">
                            <td width="357" style={{ ...labelStyle, paddingLeft: '10px', borderRight: '1px solid black' }}>EXÁMENES DE LABORATORIO</td>
                            <td width="357" style={{ ...labelStyle, paddingLeft: '10px' }}>ESTUDIOS DE GABINETE</td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td valign="top" style={{ padding: '4px', borderRight: '1px solid black' }}>
                                <table width="100%" border={0} cellPadding={0} cellSpacing={0} style={{ tableLayout: 'fixed' }}>
                                    <tbody>
                                        <tr height="20">
                                            <td style={{ paddingLeft: '4px', fontSize: '9.5px' }}><span style={labelStyle}>BH:</span> Hb {data.hb} / Leu {data.leucocitos} / Plaq {data.plaquetas}</td>
                                        </tr>
                                        <tr height="20">
                                            <td style={{ paddingLeft: '4px', fontSize: '9.5px' }}><span style={labelStyle}>Tiempos:</span> TP {data.tp} / TTP {data.ttp} / INR {data.inr}</td>
                                        </tr>
                                        <tr height="20">
                                            <td style={{ paddingLeft: '4px', fontSize: '9.5px' }}><span style={labelStyle}>Química:</span> Glu {data.glucosaCentral} / Urea {data.urea} / Cr {data.creatinina}</td>
                                        </tr>
                                        <tr height="20">
                                            <td style={{ paddingLeft: '4px', fontSize: '9.5px' }}><span style={labelStyle}>Electrolitos:</span> Na {data.na} / K {data.k} / Cl {data.cl}</td>
                                        </tr>
                                        <tr height="25">
                                            <td style={{ backgroundColor: '#f3f4f6', fontSize: '9.5px', fontWeight: 'bold', borderTop: '1px solid #ccc', paddingLeft: '4px' }}>TFG Calculada: {data.tfg} ml/min</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                            <td valign="top" style={{ padding: '8px' }}>
                                <div style={{ fontSize: '10px', lineHeight: '1.4' }}>
                                    <span style={labelStyle}>ECG:</span> {data.ecg_ritmo_especifico}, FC {data.ecg_frecuencia} lpm.
                                    {data.ecg_bloqueo !== 'Ninguno' ? ` Bloqueo: ${data.ecg_bloqueo}.` : ''}<br />
                                    {data.ecg_isquemia && <span style={{ color: 'red', fontWeight: 'bold' }}>[ISQUEMIA (+)] </span>}
                                    {data.ecg_hvi && <span style={{ fontWeight: 'bold' }}>[HVI (+)] </span>}<br />
                                    <span style={labelStyle}>Rx Tórax:</span> {data.rx_descripcion || 'Sin hallazgos.'}<br />
                                    <span style={labelStyle}>ARISCAT:</span> {data.ariscat_total} pts ({data.ariscat_categoria})
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <table width="714" height="15"><tbody><tr><td></td></tr></tbody></table>

                {/* SCALES SUMMARY TABLE */}
                <table border={1} cellPadding={4} cellSpacing={0} style={{ ...baseTable, border: '1px solid black', backgroundColor: '#fafafa' }}>
                    <thead>
                        <tr bgcolor="#f3f4f6" height="25">
                            {(data.authorized_report_scales?.asa !== false) && <th style={{ ...labelStyle, fontSize: '9px', width: '35px' }}>ASA</th>}
                            {(data.authorized_report_scales?.goldman !== false) && <th style={{ ...labelStyle, fontSize: '9px' }}>GOLDMAN</th>}
                            {(data.authorized_report_scales?.detsky !== false) && <th style={{ ...labelStyle, fontSize: '9px' }}>DETSKY</th>}
                            {(data.authorized_report_scales?.lee !== false) && <th style={{ ...labelStyle, fontSize: '9px' }}>LEE</th>}
                            {(data.authorized_report_scales?.caprini !== false) && <th style={{ ...labelStyle, fontSize: '9px', width: '50px' }}>CAPRINI</th>}
                            {(data.authorized_report_scales?.gupta !== false) && <th style={{ ...labelStyle, fontSize: '9px', width: '50px' }}>GUPTA</th>}
                            {(data.authorized_report_scales?.nsqip !== false) && <th style={{ ...labelStyle, fontSize: '9px', width: '55px', backgroundColor: '#f0fdf4' }}>NSQIP</th>}
                            {(data.authorized_report_scales?.mets !== false) && <th style={{ ...labelStyle, fontSize: '9px', width: '50px' }}>METs</th>}
                            {(data.authorized_report_scales?.cha2ds2vasc !== false) && <th style={{ ...labelStyle, fontSize: '9px' }}>CHADSVASC</th>}
                            {(data.authorized_report_scales?.hasbled !== false) && <th style={{ ...labelStyle, fontSize: '9px' }}>HASBLED</th>}
                            {(data.authorized_report_scales?.stopBang !== false) && <th style={{ ...labelStyle, fontSize: '9px' }}>STOP-BANG</th>}
                            {(data.authorized_report_scales?.vrc !== false) && <th style={{ ...labelStyle, fontSize: '9px', backgroundColor: '#e0f2fe' }}>VRC</th>}
                            {(data.authorized_report_scales?.fragilidad !== false) && <th style={{ ...labelStyle, fontSize: '9px', backgroundColor: '#fef3c7' }}>CFS (1-9)</th>}
                        </tr>
                    </thead>
                    <tbody>
                        <tr align="center" height="30">
                            {(data.authorized_report_scales?.asa !== false) && <td style={{ fontSize: '10px', fontWeight: 'bold' }}>{data.asa}</td>}
                            {(data.authorized_report_scales?.goldman !== false) && <td style={{ fontSize: '10px', fontWeight: 'bold' }}>{data.goldman}</td>}
                            {(data.authorized_report_scales?.detsky !== false) && <td style={{ fontSize: '10px', fontWeight: 'bold' }}>{data.detsky}</td>}
                            {(data.authorized_report_scales?.lee !== false) && <td style={{ fontSize: '10px', fontWeight: 'bold' }}>{data.lee}</td>}
                            {(data.authorized_report_scales?.caprini !== false) && <td style={{ fontSize: '10px', fontWeight: 'bold' }}>{data.caprini}</td>}
                            {(data.authorized_report_scales?.gupta !== false) && <td style={{ fontSize: '10px', fontWeight: 'bold' }}>{data.gupta || 0}%</td>}
                            {(data.authorized_report_scales?.nsqip !== false) && (
                                <td style={{
                                    fontSize: '10px', fontWeight: 'bold',
                                    backgroundColor: (data.nsqip_total || 0) >= 10 ? '#fecaca' : (data.nsqip_total || 0) >= 3 ? '#fef9c3' : '#dcfce7'
                                }}>
                                    {data.nsqip_total || 0}%
                                    <br />
                                    <span style={{ fontSize: '8px' }}>{(data.nsqip_riesgo || 'Bajo').toUpperCase()}</span>
                                </td>
                            )}
                            {(data.authorized_report_scales?.mets !== false) && <td style={{ fontSize: '10px', fontWeight: 'bold' }}>{data.mets_estimated || 4}</td>}
                            {(data.authorized_report_scales?.cha2ds2vasc !== false) && <td style={{ fontSize: '10px', fontWeight: 'bold' }}>{data.cha2ds2vasc || 0}</td>}
                            {(data.authorized_report_scales?.hasbled !== false) && <td style={{ fontSize: '10px', fontWeight: 'bold' }}>{data.hasbled || 0}</td>}
                            {(data.authorized_report_scales?.stopBang !== false) && (
                                <td style={{ fontSize: '10px', fontWeight: 'bold' }}>
                                    {typeof data.stopbang_total === 'number' ? data.stopbang_total : 0} pts
                                    <br />
                                    <span style={{ fontSize: '8px' }}>{((data.stopbang_risk || 'Bajo') + '').toUpperCase()}</span>
                                </td>
                            )}
                            {(data.authorized_report_scales?.vrc !== false) && (
                                <td style={{ fontSize: '10px', fontWeight: 'bold', backgroundColor: (data.vrc_total || 0) >= 4 ? '#fecaca' : 'transparent' }}>
                                    {(data.vrc_total !== undefined && data.vrc_total !== -1) ?
                                        <>
                                            {data.vrc_total} pts
                                            <br />
                                            <span style={{ fontSize: '8px' }}>{((data.vrc_riesgo || 'Bajo') + '').toUpperCase()}</span>
                                        </>
                                        : '-'}
                                </td>
                            )}
                            {(data.authorized_report_scales?.fragilidad !== false) && (
                                <td style={{ fontSize: '10px', fontWeight: 'bold', backgroundColor: (data.fragilidad_score || 1) >= 5 ? '#fecaca' : 'transparent' }}>
                                    {data.fragilidad_score || 1}
                                </td>
                            )}
                        </tr>
                    </tbody>
                </table>

                {/* DYNAMIC ALERTS */}
                {(data.stopbang_total >= 5 || (data.fragilidad_score || 1) >= 5 || data.mets_estimated < 4 || (data.nsqip_total || 0) >= 10) && (
                    <div style={{ marginTop: '10px', border: '1px solid #b91c1c', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ backgroundColor: '#fee2e2', color: '#7f1d1d', fontSize: '10px', fontWeight: 'bold', padding: '4px 8px', borderBottom: '1px solid #fecaca' }}>
                            ALERTA CLÍNICA: ESTRATIFICACIÓN DE ALTO RIESGO
                        </div>
                        <div style={{ padding: '8px', fontSize: '9px', color: '#7f1d1d', backgroundColor: '#fff5f5' }}>
                            <ul style={{ margin: 0, paddingLeft: '15px' }}>
                                {(data.nsqip_total || 0) >= 10 && (
                                    <li><b>NSQIP ALTO ({data.nsqip_total}%):</b> Riesgo elevado de complicación quirúrgica mayor a 30 días. Optimizar comorbilidades. Si cirugía electiva, considerar diferir hasta estabilización.</li>
                                )}
                                {data.stopbang_total >= 5 && (
                                    <li><b>STOP-BANG ALTO ({data.stopbang_total} pts):</b> Alta probabilidad de SAOS moderado-severo. Se sugiere <b>extubación paciente despierto</b> y monitoreo continuo de oximetría postoperatoria. Considere CPAP si dispone.</li>
                                )}
                                {(data.fragilidad_score || 1) >= 5 && (
                                    <li><b>FRAGILIDAD (CFS {data.fragilidad_score}):</b> Reserva fisiológica disminuida. Alto riesgo de delirium postoperatorio y estancia prolongada. Considere protocolo de prevención de delirium y movilización temprana.</li>
                                )}
                                {data.mets_estimated < 4 && (
                                    <li><b>CAPACIDAD FUNCIONAL BAJA ({`<`} 4 METs):</b> Pobre reserva cardiorrespiratoria. Mayor riesgo de complicaciones isquémicas y respiratorias.</li>
                                )}
                            </ul>
                        </div>
                    </div>
                )}

            </div>

            {/* PAGE 2 - RECOMMENDATIONS & SIGNATURES */}
            <div id={page2Id} style={{ width: '794px', minHeight: '1050px', padding: '20px', boxSizing: 'border-box', backgroundColor: 'white' }}>

                {/* PAGE 2 HEADER */}
                <table border={0} cellPadding={0} cellSpacing={0} style={baseTable}>
                    <tbody>
                        <tr>
                            <td width="130" valign="middle" style={{ width: '130px', borderBottom: '2px solid black', paddingBottom: '12px' }}>
                                <img src="/logo.png?v=8" alt="Logo" style={{ width: '100%', height: 'auto', objectFit: 'contain' }} />
                            </td>
                            <td width="284" valign="bottom" style={{ paddingLeft: '24px', borderBottom: '2px solid black', paddingBottom: '12px' }}>
                                <div style={{ fontSize: '15px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.01em', marginBottom: '2px', lineHeight: '1' }}>
                                    {(data.unidadMedica || 'CMN SIGLO XXI').toUpperCase()}
                                </div>
                                <div style={{ fontSize: '13px', fontWeight: 700, color: '#334155', letterSpacing: '0.01em', marginBottom: '4px' }}>
                                    {(data.servicioSolicitante || 'MEDICINA INTERNA').toUpperCase()}
                                </div>
                            </td>
                            <td width="300" align="right" valign="top" style={{ borderBottom: '2px solid black', paddingBottom: '12px' }}>
                                <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#1e40af', letterSpacing: '0.1em' }}>DIRECCIÓN DE PRESTACIONES MÉDICAS</div>
                                <div style={{ fontSize: '14px', fontWeight: 900, textDecoration: 'underline', marginTop: '12px', color: 'black', letterSpacing: '0.02em' }}>VALORACIÓN PREOPERATORIA</div>
                                <div style={{ fontSize: '9px', color: '#334155', marginTop: '4px' }}>Paciente: {data.nombre} | NSS: {data.nss}</div>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <table width="714" height="10"><tbody><tr><td></td></tr></tbody></table>

                {/* URGENCIA BANNER - Page 2 */}
                {data.esUrgencia && (
                    <div style={{ marginBottom: '12px', background: '#b91c1c', color: 'white', borderRadius: '6px', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '16px' }}>⚠️</span>
                        <div>
                            <div style={{ fontWeight: 900, fontSize: '11px', letterSpacing: '0.05em' }}>CIRUGÍA DE URGENCIA / EMERGENCIA</div>
                            <div style={{ fontSize: '9px', opacity: 0.9 }}>Escalas impactadas: ASA-E +4 Goldman +10 Detsky +8 ARISCAT &bull; Valorar IRS (Inducción Secuencia Rápida)</div>
                        </div>
                    </div>
                )}

                {/* RECOMMENDATIONS SECTION */}
                <div style={{ marginTop: '10px' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '10px', textAlign: 'center', backgroundColor: '#eee', padding: '8px', border: '1px solid black', marginBottom: '12px' }}>PRE-QUIRÚRGICO</div>
                    <div style={{ fontSize: '9px', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>
                        {data.plan_pre}
                    </div>
                    {data.selectedMeds && data.selectedMeds.length > 0 && (
                        <div style={{ marginTop: '10px', borderTop: '1px dashed #ccc', paddingTop: '5px', fontSize: '9px' }}>
                            <div style={{ fontWeight: 'bold', textDecoration: 'underline', marginBottom: '3px' }}>CONCILIACIÓN FARMACOLÓGICA:</div>
                            {data.selectedMeds.map((med, idx) => (
                                <div key={idx} style={{ marginBottom: '4px' }}>
                                    <span style={{ fontWeight: 'bold' }}>• {med.name}:</span>{' '}
                                    <span style={{
                                        color: med.action === 'stop' ? '#b91c1c' : med.action === 'adjust' ? '#ca8a04' : '#15803d',
                                        fontWeight: 'bold'
                                    }}>
                                        {med.action === 'stop' ? 'SUSPENDER' : med.action === 'adjust' ? 'AJUSTAR' : 'CONTINUAR'}
                                    </span>
                                    <div style={{ paddingLeft: '8px', fontStyle: 'italic', color: '#444' }}>{med.instructions}</div>
                                </div>
                            ))}
                        </div>
                    )}
                    <div style={{ fontWeight: 'bold', fontSize: '10px', textAlign: 'center', backgroundColor: '#eee', padding: '8px', border: '1px solid black', marginBottom: '12px', marginTop: '18px' }}>TRANS-QUIRÚRGICO</div>
                    <div style={{ fontSize: '9px', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>{data.plan_trans}</div>
                    <div style={{ fontWeight: 'bold', fontSize: '10px', textAlign: 'center', backgroundColor: '#eee', padding: '8px', border: '1px solid black', marginBottom: '12px', marginTop: '18px' }}>POST-QUIRÚRGICO</div>
                    <div style={{ fontSize: '9px', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>{data.plan_post}</div>

                    {/* CLINICAL ALERTS SECTION - always shown if any alerts exist */}
                    {printedAlerts.length > 0 && (
                        <div style={{ marginTop: '14px', border: '1.5px solid #b91c1c', borderRadius: '4px', overflow: 'hidden', pageBreakInside: 'avoid' }}>
                            <div style={{ backgroundColor: '#b91c1c', color: 'white', fontSize: '9px', fontWeight: 'bold', padding: '4px 10px', letterSpacing: '0.08em' }}>
                                ⚠️ ALERTAS CLÍNICAS ACTIVAS (ECG / VITALES / LABORATORIOS / EXPLORACIÓN FÍSICA)
                            </div>
                            <div style={{ padding: '8px 10px', backgroundColor: '#fff5f5' }}>
                                <ul style={{ margin: 0, paddingLeft: '14px', fontSize: '8.5px', color: '#7f1d1d', lineHeight: '1.5' }}>
                                    {printedAlerts.map((alert, i) => (
                                        <li key={i} style={{ marginBottom: '3px' }}>{alert}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                </div>

                {/* DOCTORS SECTION */}
                <div style={{ marginTop: '40px', borderTop: '2px solid black', paddingTop: '20px' }}>
                    {hasOverrides && (
                        <div style={{ padding: '8px', backgroundColor: '#fffbeb', fontSize: '9px', fontStyle: 'italic', border: '1px solid #ffeeb3', marginBottom: '30px' }}>
                            <b>NOTA DE AUDITORÍA CLÍNICA:</b> Los puntajes de riesgo y escalas presentadas incluyen ajustes manuales realizados por el facultativo basados en la complejidad clínica individual del paciente.
                        </div>
                    )}
                    <table width="100%" border={0} cellPadding={0} cellSpacing={0}>
                        <tbody>
                            <tr>
                                <td width="42%" align="center">
                                    <div style={{ borderTop: '1px solid black', width: '90%', paddingTop: '15px' }}>
                                        <div style={{ fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase' }}>{data.residente || 'DR. MÉDICO RESIDENTE'}</div>
                                        <div style={{ fontSize: '9px', color: '#666', marginTop: '4px' }}>MÉDICO RESIDENTE</div>
                                        <div style={{ fontSize: '9px', color: '#666' }}>MATRÍCULA: {data.residente_matricula || '---'}</div>
                                    </div>
                                </td>
                                <td width="16%"></td>
                                <td width="42%" align="center">
                                    <div style={{ borderTop: '1px solid black', width: '90%', paddingTop: '15px' }}>
                                        <div style={{ fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase' }}>{data.elaboro || 'DR. MÉDICO QUE REALIZÓ'}</div>
                                        <div style={{ fontSize: '9px', color: '#666', marginTop: '4px' }}>MÉDICO QUE REALIZÓ</div>
                                        <div style={{ fontSize: '9px', color: '#666' }}>MATRÍCULA: {data.matricula || '---'}</div>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PrintView;


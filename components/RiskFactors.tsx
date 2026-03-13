import React, { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { VPOData } from '../types';
import {
    AlertCircle, FileWarning, Cigarette, Heart, Activity, Brain, ShieldAlert,
    ChevronDown, ChevronUp, Wind, Droplets, FlaskConical, Stethoscope
} from 'lucide-react';

/* ── Shared Apple-style classes ── */
const inputClass = "w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500/50 hover:border-slate-300 transition-all duration-200";
const selectClass = `${inputClass} bg-white`;
const labelClass = "text-[12px] font-semibold text-slate-500 tracking-wide";
const subLabelClass = "text-[10px] text-slate-400";

/* ── Reusable field ── */
const Field = ({ label, children, className = '' }: { label: string; children: React.ReactNode; className?: string }) => (
    <div className={className}>
        <label className={`${labelClass} block mb-1.5`}>{label}</label>
        {children}
    </div>
);

// --- ACCORDION CARD COMPONENT ---
interface RiskAccordionProps {
    label: string;
    name: keyof VPOData;
    icon?: React.ElementType;
    iconColor?: string;
    children?: React.ReactNode;
    warningIf?: boolean;
}

const RiskAccordion = ({
    label,
    name,
    icon: Icon,
    iconColor = 'text-slate-400',
    children,
    warningIf
}: RiskAccordionProps) => {
    const { register, watch } = useFormContext<VPOData>();
    const isOpen = watch(name) as boolean;

    return (
        <div className={`rounded-xl transition-all duration-300 overflow-hidden border ${isOpen ? 'border-slate-300 bg-white shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
            <label className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${isOpen ? 'bg-slate-50/50' : 'hover:bg-slate-50/40'}`}>
                <div className="flex items-center gap-3">
                    <input type="checkbox" {...register(name)} className="w-4 h-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500/30" />
                    <div className="flex items-center gap-2">
                        {Icon && <Icon size={18} className={`${isOpen ? iconColor : 'text-slate-400'} transition-colors`} strokeWidth={1.5} />}
                        <span className={`font-semibold text-[13px] ${isOpen ? 'text-slate-800' : 'text-slate-600'}`}>{label}</span>
                    </div>
                    {isOpen && warningIf && <AlertCircle size={14} className="text-red-500 animate-pulse" />}
                </div>
                {isOpen ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-300" />}
            </label>

            {/* EXPANDABLE CONTENT */}
            {isOpen && (
                <div className="px-4 pb-4 border-t border-slate-100 animate-fadeIn space-y-3 pt-4">
                    {children}
                </div>
            )}
        </div>
    );
};

const RiskFactors: React.FC = () => {
    const { register, watch, setValue } = useFormContext<VPOData>();

    // Logic dependencies for Smoking Index
    const cigarros = watch('cigarrosDia');
    const anios = watch('aniosFumando');
    const tabaquismo = watch('tabaquismo');

    // Smoking Index Calculation
    useEffect(() => {
        if (tabaquismo && cigarros > 0 && anios > 0) {
            const it = parseFloat(((cigarros * anios) / 20).toFixed(1));
            const currentIT = watch('indiceTabaquico');
            if (currentIT !== it && !(isNaN(currentIT) && isNaN(it))) {
                setValue('indiceTabaquico', it);
            }
            let riesgo = "Leve";
            if (it >= 10 && it < 20) riesgo = "Moderado";
            if (it >= 20) riesgo = "Intenso (Alto Riesgo EPOC)";
            if (watch('riesgoEPOC') !== riesgo) {
                setValue('riesgoEPOC', riesgo);
            }
        } else {
            if (watch('indiceTabaquico') !== 0) setValue('indiceTabaquico', 0);
            if (watch('riesgoEPOC') !== "") setValue('riesgoEPOC', "");
        }
    }, [tabaquismo, cigarros, anios, setValue, watch]);

    return (
        <div className="space-y-5">
            {/* ── Section Header ── */}
            <div className="flex items-center gap-3">
                <FileWarning className="text-slate-400" size={20} strokeWidth={1.5} />
                <div>
                    <h2 className="text-base font-bold text-slate-800 leading-tight">Factores de Riesgo</h2>
                    <p className="text-[11px] text-slate-400 font-medium">Interrogatorio clínico</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-2.5">

                {/* 1. TABAQUISMO */}
                <RiskAccordion label="Tabaquismo" name="tabaquismo" icon={Cigarette} iconColor="text-orange-500" warningIf={(watch('indiceTabaquico') || 0) >= 20}>
                    <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-3">
                        <h4 className={`${labelClass} mb-2`}>Calculadora Índice Tabáquico</h4>
                        <div className="flex gap-3">
                            <Field label="Cigarros/día" className="flex-1">
                                <input type="number" {...register('cigarrosDia', { valueAsNumber: true })} className={`${inputClass} text-center font-semibold tabular-nums`} />
                            </Field>
                            <Field label="Años fumando" className="flex-1">
                                <input type="number" {...register('aniosFumando', { valueAsNumber: true })} className={`${inputClass} text-center font-semibold tabular-nums`} />
                            </Field>
                        </div>
                        <div className="mt-3 flex justify-between items-center">
                            <span className="text-xs font-semibold text-slate-600">IT: {watch('indiceTabaquico')}</span>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${watch('indiceTabaquico') >= 20 ? 'text-red-600 bg-red-50' : 'text-emerald-600 bg-emerald-50'}`}>
                                {watch('riesgoEPOC')}
                            </span>
                        </div>
                    </div>
                </RiskAccordion>

                {/* 2. ALERGIAS */}
                <RiskAccordion label="Alergias" name="alergicos" icon={AlertCircle} iconColor="text-red-500" warningIf={watch('alergicos')}>
                    <Field label="Detalle de alergias">
                        <textarea
                            {...register('alergicosDetalle')}
                            rows={2}
                            placeholder="Medicamentos, alimentos, látex..."
                            className={`${inputClass} resize-none`}
                        />
                    </Field>
                    {watch('alergicos') && !watch('alergicosDetalle') && (
                        <p className="text-[11px] text-amber-600 font-medium">⚠️ Especifique las alergias detectadas.</p>
                    )}
                </RiskAccordion>

                {/* 3. HIPERTENSIÓN (HTA) */}
                <RiskAccordion label="Hipertensión Arterial" name="hta" icon={Activity} iconColor="text-rose-500" warningIf={watch('hta_control') === 'descontrolada'}>
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Estado actual">
                            <select {...register('hta_control')} className={selectClass}>
                                <option value="controlada">Controlada</option>
                                <option value="descontrolada">Descontrolada {'>'} 140/90 (ASA III)</option>
                            </select>
                        </Field>
                        <Field label="Tiempo Dx (años)">
                            <input {...register('hta_tiempo')} className={inputClass} placeholder="#" />
                        </Field>
                    </div>
                </RiskAccordion>

                {/* 4. DIABETES */}
                <RiskAccordion label="Diabetes Mellitus" name="diabetes" icon={Droplets} iconColor="text-blue-500">
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Tipo">
                            <select {...register('diabetesTipo')} className={selectClass}>
                                <option value="2">Tipo 2</option>
                                <option value="1">Tipo 1</option>
                            </select>
                        </Field>
                        <Field label="Tiempo Dx (años)">
                            <input {...register('diabetesTiempo')} className={inputClass} placeholder="#" />
                        </Field>
                    </div>
                    <label className="flex items-center gap-2 mt-1 p-2.5 rounded-lg border border-orange-200/60 bg-orange-50/40 cursor-pointer hover:bg-orange-50 transition-colors">
                        <input type="checkbox" {...register('usaInsulina')} className="w-4 h-4 rounded border-slate-300 text-orange-500 focus:ring-orange-500/30" />
                        <span className="text-[12px] font-semibold text-orange-700">¿Requiere Insulina?</span>
                    </label>
                </RiskAccordion>

                {/* 5. CARDIOPATÍA ISQUÉMICA */}
                <RiskAccordion
                    label="Cardiopatía Isquémica"
                    name="cardiopatiaIsquemica"
                    icon={Heart}
                    iconColor="text-red-500"
                    warningIf={watch('cardio_tipo_evento') === 'iam' || watch('cardio_tipo_evento') === 'angina_inestable'}
                >
                    <div className="space-y-3">
                        <Field label="Evento más reciente">
                            <select {...register('cardio_tipo_evento')} className={selectClass}>
                                <option value="angina_estable">Angina Estable (CCS I-II)</option>
                                <option value="angina_inestable">Angina Inestable (CCS III-IV) [+10 Detsky]</option>
                                <option value="iam">Infarto Agudo de Miocardio (IAM)</option>
                            </select>
                        </Field>

                        <Field label="Fecha del último evento">
                            <input type="date" {...register('cardio_fecha_evento')} className={inputClass} />
                            <p className={`${subLabelClass} mt-1`}>Si es IAM {'<'} 6 meses = Alto Riesgo (Goldman/Detsky)</p>
                        </Field>

                        {/* STENT INPUTS */}
                        <label className="flex items-center gap-2 p-2.5 rounded-lg border border-indigo-200/60 bg-indigo-50/30 cursor-pointer hover:bg-indigo-50/50 transition-colors">
                            <input type="checkbox" {...register('cardio_stent')} className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/30" />
                            <span className="text-[12px] font-semibold text-indigo-700">Portador de Stent Coronario</span>
                        </label>
                        {watch('cardio_stent') && (
                            <div className="pl-4 grid grid-cols-2 gap-3 animate-fadeIn p-3 bg-indigo-50/20 rounded-lg border border-indigo-100/50">
                                <Field label="Fecha colocación">
                                    <input type="date" {...register('stent_fecha_colocacion')} className={inputClass} />
                                </Field>
                                <Field label="Tipo de stent">
                                    <select {...register('stent_tipo')} className={selectClass}>
                                        <option value="DES">Farmacoactivo (DES)</option>
                                        <option value="BMS">Metálico (BMS)</option>
                                    </select>
                                </Field>
                            </div>
                        )}
                    </div>
                </RiskAccordion>

                {/* 6. INSUFICIENCIA CARDIACA */}
                <RiskAccordion label="Insuficiencia Cardiaca (ICC)" name="icc" icon={Heart} iconColor="text-rose-500">
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Clase (NYHA)">
                            <select {...register('icc_nyha')} className={selectClass}>
                                <option value="I">I (Sin disnea)</option>
                                <option value="II">II (Esfuerzos moderados)</option>
                                <option value="III">III (Esfuerzos leves)</option>
                                <option value="IV">IV (Reposo)</option>
                            </select>
                        </Field>
                        <Field label="Evolución">
                            <select {...register('icc_evolucion')} className={selectClass}>
                                <option value="cronica_comp">Crónica Compensada</option>
                                <option value="cronica_descomp">Crónica Descompensada</option>
                                <option value="aguda">Aguda / Debut</option>
                            </select>
                        </Field>
                    </div>
                    <div className="mt-3 border-t border-slate-100 pt-3">
                        <label className="flex items-center gap-2 mb-2">
                            <input type="checkbox" {...register('icc_historia_eap')} className="w-4 h-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500/30" />
                            <span className="text-[12px] font-semibold text-slate-600">Antecedente Edema Agudo Pulmón (EAP)</span>
                        </label>
                        {watch('icc_historia_eap') && (
                            <div className="pl-6 animate-fadeIn">
                                <Field label="Fecha último EAP">
                                    <input type="date" {...register('icc_fecha_eap')} className={inputClass} />
                                    <span className="text-[10px] text-red-500 mt-1 block">Si es {'<'} 1 semana = +10 Pts Detsky</span>
                                </Field>
                            </div>
                        )}
                    </div>
                </RiskAccordion>

                {/* 7. ARRITMIAS */}
                <RiskAccordion label="Arritmias" name="arritmias" icon={Activity} iconColor="text-violet-500">
                    <div className="space-y-3">
                        <Field label="Tipo">
                            <select {...register('arritmia_tipo')} className={selectClass}>
                                <option value="fa">Fibrilación Auricular (FA)</option>
                                <option value="flutter">Flutter Auricular</option>
                                <option value="bloqueo">Bloqueo AV (II/III)</option>
                                <option value="tsv">Taquicardia Supraventricular</option>
                                <option value="extrasistoles">Extrasístoles Ventriculares</option>
                                <option value="otra">Otra</option>
                            </select>
                        </Field>
                        <label className="flex items-center gap-2 p-2.5 rounded-lg border border-violet-200/60 bg-violet-50/30 cursor-pointer hover:bg-violet-50/50 transition-colors">
                            <input type="checkbox" {...register('marcapasos')} className="w-4 h-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500/30" />
                            <span className="text-[12px] font-semibold text-violet-700">Portador de Marcapasos / DAI</span>
                        </label>
                    </div>
                </RiskAccordion>

                {/* 8. VALVULOPATÍAS */}
                <RiskAccordion
                    label="Valvulopatías"
                    name="valvulopatia"
                    icon={Heart}
                    iconColor="text-pink-500"
                    warningIf={watch('valvula_afectada') === 'aortica' && watch('valvula_patologia') === 'estenosis' && watch('valvula_severidad') === 'severa'}
                >
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Válvula">
                            <select {...register('valvula_afectada')} className={selectClass}>
                                <option value="aortica">Aórtica</option>
                                <option value="mitral">Mitral</option>
                                <option value="tricuspide">Tricúspide</option>
                                <option value="pulmonar">Pulmonar</option>
                            </select>
                        </Field>
                        <Field label="Patología">
                            <select {...register('valvula_patologia')} className={selectClass}>
                                <option value="estenosis">Estenosis</option>
                                <option value="insuficiencia">Insuficiencia</option>
                                <option value="doble">Doble Lesión</option>
                            </select>
                        </Field>
                        <Field label="Severidad" className="col-span-2">
                            <select {...register('valvula_severidad')} className={`${selectClass} font-semibold`}>
                                <option value="leve">Leve</option>
                                <option value="moderada">Moderada</option>
                                <option value="severa">Severa / Crítica</option>
                            </select>
                            {watch('valvula_severidad') === 'severa' && watch('valvula_afectada') === 'aortica' && (
                                <span className="text-[11px] text-red-600 block mt-1.5 font-semibold">⚠️ Estenosis Aórtica Severa = Alto Riesgo (Goldman/Detsky)</span>
                            )}
                        </Field>
                        {/* PROSTHESIS CHECKBOX */}
                        <div className="col-span-2">
                            <label className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 cursor-pointer hover:bg-slate-50 transition-colors">
                                <input type="checkbox" {...register('valvula_protesis')} className="w-4 h-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500/30" />
                                <span className="text-[12px] font-semibold text-slate-600">Portador de Prótesis Valvular</span>
                            </label>
                        </div>
                    </div>
                </RiskAccordion>

                {/* --- DATOS ECOCARDIOGRÁFICOS (CONDITIONAL) --- */}
                {(watch('icc') || watch('valvulopatia') || ['vascular', 'aortic', 'amputation', 'cardiac'].includes(watch('gupta_surgical_site'))) && (
                    <div className="rounded-xl border border-cyan-200/60 bg-cyan-50/20 overflow-hidden animate-fadeIn shadow-sm">
                        <div className="bg-cyan-50/50 p-3.5 border-b border-cyan-200/40 flex items-center gap-2">
                            <Activity className="text-cyan-600" size={16} strokeWidth={1.5} />
                            <h3 className="text-[13px] font-semibold text-cyan-800">Módulo Ecocardiográfico</h3>
                        </div>
                        <div className="p-4 space-y-3">
                            {/* FEVI */}
                            <div>
                                <label className={labelClass}>FEVI (%)</label>
                                <div className="flex items-center gap-3 mt-1.5">
                                    <input
                                        type="number"
                                        {...register('eco_fevi', { valueAsNumber: true })}
                                        className={`w-20 ${inputClass} text-center font-semibold tabular-nums !border-cyan-200 focus:!ring-cyan-500/30`}
                                        placeholder="60"
                                    />
                                    <span className={`${subLabelClass} italic`}>Fracción de Eyección Ventrículo Izquierdo</span>
                                </div>
                                {(watch('eco_fevi') || 60) < 35 && (
                                    <p className="text-[10px] text-red-600 font-semibold mt-1 animate-pulse">
                                        ⚠️ FEVI MUY BAJA: Riesgo Choque Cardiogénico.
                                    </p>
                                )}
                            </div>

                            {/* CHECKBOXES */}
                            <div className="grid grid-cols-2 gap-2">
                                <label className="flex items-center gap-2 p-2.5 bg-white border border-cyan-100 rounded-lg cursor-pointer hover:bg-cyan-50/30 transition-colors">
                                    <input type="checkbox" {...register('eco_disfuncion_diastolica')} className="w-4 h-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500/30" />
                                    <span className="text-[11px] font-semibold text-slate-600">Disfunción Diastólica</span>
                                </label>
                                <label className="flex items-center gap-2 p-2.5 bg-white border border-cyan-100 rounded-lg cursor-pointer hover:bg-cyan-50/30 transition-colors">
                                    <input type="checkbox" {...register('eco_psap_elevada')} className="w-4 h-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500/30" />
                                    <span className="text-[11px] font-semibold text-slate-600">PSAP {'>'} 45mmHg</span>
                                </label>
                            </div>

                            {/* VALVULOPATIA */}
                            <Field label="Valvulopatía significativa (Eco)">
                                <select {...register('eco_valvulopatia')} className={`${selectClass} !border-cyan-200`}>
                                    <option value="ninguna">Ninguna / No Significativa</option>
                                    <option value="estenosis_aortica_severa">Estenosis Aórtica Severa</option>
                                    <option value="insuficiencia_mitral_severa">Insuficiencia Mitral Severa</option>
                                </select>
                            </Field>
                        </div>
                    </div>
                )}

                {/* 9. NEUROLOGÍA (EVC) */}
                <RiskAccordion label="Enf. Vascular Cerebral (EVC)" name="evc" icon={Brain} iconColor="text-purple-500">
                    <div className="space-y-3">
                        <Field label="Fecha del evento">
                            <input type="date" {...register('evc_fecha')} className={inputClass} />
                            <p className={`${subLabelClass} mt-1`}>
                                Si {'<'} 3 meses = ASA IV (Diferir Electiva). Si {'<'} 1 mes = Caprini +5.
                            </p>
                        </Field>
                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Tipo">
                                <select {...register('evc_tipo')} className={selectClass}>
                                    <option value="isquemico">Isquémico</option>
                                    <option value="hemorragico">Hemorrágico</option>
                                    <option value="ait">AIT (Transitorio)</option>
                                </select>
                            </Field>
                        </div>
                        <label className="flex items-center gap-2">
                            <input type="checkbox" {...register('evc_secuelas')} className="w-4 h-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500/30" />
                            <span className="text-[12px] font-semibold text-slate-600">Secuelas Neurológicas / Motoras</span>
                        </label>
                    </div>
                </RiskAccordion>

                {/* 10. NEUMOPATÍA */}
                <RiskAccordion label="Neumopatía (Pulmonar)" name="neumopatia" icon={Wind} iconColor="text-teal-500">
                    <div className="space-y-3">
                        <Field label="Patología">
                            <select {...register('neumo_tipo')} className={selectClass}>
                                <option value="epoc">EPOC (Enfisema/Bronquitis)</option>
                                <option value="asma">ASMA</option>
                                <option value="saohs">SAOHS (Apnea del Sueño)</option>
                                <option value="fibrosis">Fibrosis Pulmonar / Intersticial</option>
                                <option value="otra">Otra</option>
                            </select>
                            {watch('neumo_tipo') === 'saohs' && (
                                <div className="mt-1.5 p-2.5 bg-amber-50 text-amber-700 text-[11px] font-medium rounded-lg border border-amber-200/60">
                                    ⚠️ Riesgo Vía Aérea Difícil + Hipoxia post-extubación.
                                </div>
                            )}
                        </Field>
                        <label className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer">
                            <input type="checkbox" {...register('neumo_o2')} className="w-4 h-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500/30" />
                            <span className="text-[12px] font-semibold text-slate-600">Uso de Oxígeno Domiciliario</span>
                        </label>
                    </div>
                </RiskAccordion>

                {/* 10.1 Vía Aérea y Sueño (STOP-BANG) - Conditional */}
                {((parseFloat(watch('imc') as any) || 0) > 30 || watch('diagnosed_osa') || watch('neumo_tipo') === 'saohs') && (
                    <div className="rounded-xl border border-violet-200/60 bg-violet-50/20 overflow-hidden animate-fadeIn">
                        <div className="flex items-center gap-2 p-3.5 border-b border-violet-200/40 bg-violet-50/40">
                            <Wind size={16} className="text-violet-600" strokeWidth={1.5} />
                            <span className="text-[13px] font-semibold text-violet-800">Vía Aérea y Sueño (STOP-BANG)</span>
                        </div>
                        <div className="px-4 pb-4 pt-3 space-y-3">
                            <div className="bg-white p-3 rounded-lg border border-violet-100/50 text-xs shadow-sm">
                                <p className={`${labelClass} mb-2`}>Puntos automáticos (detectados):</p>
                                <div className="grid grid-cols-2 gap-2 text-slate-600">
                                    <div className={(parseFloat(watch('imc') as any) || 0) > 35 ? 'font-semibold text-red-600' : ''}>• IMC &gt; 35</div>
                                    <div className={(parseFloat(watch('edad') as any) || 0) > 50 ? 'font-semibold text-red-600' : ''}>• Edad &gt; 50</div>
                                    <div className={watch('hta') ? 'font-semibold text-red-600' : ''}>• Hipertensión</div>
                                    <div className={watch('genero') === 'Masc' ? 'font-semibold text-red-600' : ''}>• Género Masc.</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                                {[
                                    { name: 'stopBang_snoring' as keyof VPOData, title: 'Ronquido (Snoring)', desc: '¿Ronca fuerte?' },
                                    { name: 'stopBang_tired' as keyof VPOData, title: 'Cansancio (Tired)', desc: '¿Cansado o con sueño durante el día?' },
                                    { name: 'stopBang_observed' as keyof VPOData, title: 'Observado (Observed)', desc: '¿Alguien le ha visto dejar de respirar?' },
                                    { name: 'stopBang_neck' as keyof VPOData, title: 'Cuello (Neck)', desc: '¿> 40cm (o talla camisa > 16)?' },
                                ].map(({ name, title, desc }) => (
                                    <label key={name} className={`flex items-center gap-2.5 p-3 bg-white border rounded-lg cursor-pointer transition-all duration-200 ${watch(name) ? 'border-violet-300 bg-violet-50/30' : 'border-slate-200 hover:border-violet-300'}`}>
                                        <input type="checkbox" {...register(name)} className="w-4 h-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500/30" />
                                        <div>
                                            <span className="text-[12px] font-semibold block text-slate-700">{title}</span>
                                            <span className={subLabelClass}>{desc}</span>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* 10.2 Geriatría (Fragilidad) - Conditional */}
                {watch('edad') >= 65 && (
                    <div className="rounded-xl border border-amber-200/60 bg-amber-50/20 overflow-hidden animate-fadeIn">
                        <div className="flex items-center gap-2 p-3.5 border-b border-amber-200/40 bg-amber-50/40">
                            <Activity size={16} className="text-amber-600" strokeWidth={1.5} />
                            <span className="text-[13px] font-semibold text-amber-800">Geriatría y Fragilidad</span>
                        </div>
                        <div className="px-4 pb-4 pt-3">
                            <Field label="Escala Clínica de Fragilidad (CFS)">
                                <select
                                    {...register('fragilidad_score', { valueAsNumber: true })}
                                    className={`${selectClass} !border-amber-200 focus:!ring-amber-500/30`}
                                >
                                    <option value="1">1. Muy en forma (Robusto)</option>
                                    <option value="2">2. En forma (Activo)</option>
                                    <option value="3">3. Bien controlado (Comorbilidades estables)</option>
                                    <option value="4">4. Vulnerable (Síntomas limitantes)</option>
                                    <option value="5">5. Levemente Frágil (Ayuda para IAVD)</option>
                                    <option value="6">6. Moderadamente Frágil (Ayuda act. exterior)</option>
                                    <option value="7">7. Severamente Frágil (Dependencia total personal)</option>
                                    <option value="8">8. Muy Severamente Frágil (Fin de vida inminente)</option>
                                    <option value="9">9. Terminal (Expectativa &lt; 6m)</option>
                                </select>
                            </Field>
                            <div className="mt-2.5 text-[11px] text-slate-500 bg-white p-2.5 rounded-lg border border-amber-100/50">
                                <b className="text-slate-600">Interpretación:</b> 1-3 Robusto | 4-6 Vulnerable | 7-9 Frágil. <br />
                                Impacta en riesgo de Delirium y estancia hospitalaria.
                            </div>
                        </div>
                    </div>
                )}

                {/* 11. RENAL (ERC) */}
                <RiskAccordion label="Enfermedad Renal (ERC)" name="enfRenalCronica" icon={FlaskConical} iconColor="text-amber-600">
                    <div className="space-y-3">
                        <Field label="Estadio (KDIGO)">
                            <select {...register('erc_estadio')} className={selectClass}>
                                <option value="G3a">G3a (TFG 45-59)</option>
                                <option value="G3b">G3b (TFG 30-44)</option>
                                <option value="G4">G4 (TFG 15-29)</option>
                                <option value="G5">G5 (TFG {'<'} 15)</option>
                            </select>
                        </Field>
                        <label className="flex items-center gap-2 p-2.5 rounded-lg border border-red-200/60 bg-red-50/30 cursor-pointer hover:bg-red-50/50 transition-colors">
                            <input type="checkbox" {...register('erc_dialisis')} className="w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-500/30" />
                            <span className="text-[12px] font-semibold text-red-700">En Terapia de Reemplazo (Diálisis/HD)</span>
                        </label>
                        {watch('erc_dialisis') && (
                            <p className={`${subLabelClass} ml-1`}>Nota: ASA III/IV Automático. Meta K {'<'} 5.0</p>
                        )}
                    </div>
                </RiskAccordion>

                {/* 12. HEPATOPATÍA */}
                <RiskAccordion label="Hepatopatía" name="hepatopatia" icon={Activity} iconColor="text-yellow-600" warningIf={watch('hepato_child') === 'C'}>
                    <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Tipo">
                                <select {...register('hepato_tipo')} className={selectClass}>
                                    <option value="cirrosis">Cirrosis Hepática</option>
                                    <option value="hepatitis">Hepatitis Activa/Viral</option>
                                    <option value="higado_graso">Hígado Graso / NASH</option>
                                </select>
                            </Field>
                            <Field label="Child-Pugh">
                                <select {...register('hepato_child')} className={selectClass}>
                                    <option value="A">A (5-6 pts)</option>
                                    <option value="B">B (7-9 pts)</option>
                                    <option value="C">C (10-15 pts)</option>
                                </select>
                            </Field>
                        </div>
                        {watch('hepato_child') === 'C' && (
                            <div className="p-2.5 bg-red-50 text-red-700 text-[12px] font-semibold rounded-lg text-center border border-red-200/60">
                                Contraindicación relativa: Mortalidad {'>'} 50%.
                            </div>
                        )}
                        <label className="flex items-center gap-2">
                            <input type="checkbox" {...register('hepato_coagulopatia')} className="w-4 h-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500/30" />
                            <span className="text-[12px] font-semibold text-slate-600">Coagulopatía (INR Prolongado)</span>
                        </label>
                    </div>
                </RiskAccordion>

                {/* 13. HEMATOLOGÍA */}
                <RiskAccordion label="Coagulopatía" name="coagulopatia" icon={Droplets} iconColor="text-red-400">
                    <Field label="Tipo">
                        <input {...register('coag_tipo')} className={inputClass} placeholder="Trombocitopenia, Hemofilia, V.Willebrand..." />
                    </Field>
                </RiskAccordion>

                {/* 14. CÁNCER Y HEMATOLOGÍA (KHORANA) */}
                <RiskAccordion label="Cáncer y Hematología" name="cancer_activo" icon={AlertCircle} iconColor="text-amber-500" warningIf={watch('cancer_activo')}>
                    <div className="space-y-3">
                        <div className="p-2.5 rounded-lg bg-amber-50/50 border border-amber-200/50 text-[11px] text-amber-800 font-medium">
                            La Escala de Khorana estima el riesgo de ETV en pacientes con cáncer ambulatorios que recibirán quimioterapia.
                        </div>

                        <Field label="Sitio primario del cáncer">
                            <select
                                {...register('cancer_tipo_sitio')}
                                className={selectClass}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setValue('cancer_tipo_sitio', val as any);
                                    if (val !== "") {
                                        setValue('capB_cancer', true);
                                    }
                                }}
                            >
                                <option value="">-- Seleccione el Sitio --</option>
                                <option value="estomago">Estómago (Muy Alto Riesgo)</option>
                                <option value="pancreas">Páncreas (Muy Alto Riesgo)</option>
                                <option value="snc">SNC / Cerebral (Muy Alto Riesgo)</option>
                                <option value="pulmon">Pulmón (Alto Riesgo)</option>
                                <option value="linfoma">Linfoma (Alto Riesgo)</option>
                                <option value="ginecologico">Ginecológico (Alto Riesgo)</option>
                                <option value="vejiga">Vejiga (Alto Riesgo)</option>
                                <option value="testicular">Testicular (Alto Riesgo)</option>
                                <option value="rinon">Riñón (Alto Riesgo)</option>
                                <option value="esofago">Esófago (Alto Riesgo)</option>
                                <option value="colorectal">Colorectal (Alto Riesgo)</option>
                                <option value="sarcoma">Sarcoma (Alto Riesgo)</option>
                                <option value="cabeza_cuello">Cabeza y Cuello (Alto Riesgo)</option>
                                <option value="mieloma">Mieloma (Excluido Khorana/Cats)</option>
                                <option value="otro">Otro Sitio (Riesgo Bajo)</option>
                            </select>
                            {watch('cancer_tipo_sitio') === 'mieloma' || watch('cancer_tipo_sitio') === 'snc' ? (
                                <p className="text-[11px] text-cyan-600 font-medium mt-1 italic">
                                    ℹ️ La escala de Khorana no se aplica en este tipo de neoplasia.
                                </p>
                            ) : null}
                        </Field>

                        <label className="flex items-center gap-2.5 p-2.5 rounded-lg border border-cyan-200/60 bg-cyan-50/30 cursor-pointer hover:bg-cyan-50/50 transition-colors">
                            <input
                                type="checkbox"
                                {...register('capB_cancer')}
                                className="w-4 h-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500/30"
                            />
                            <div className="flex flex-col">
                                <span className="text-[12px] font-semibold text-slate-700">Incluir en Criterio Caprini</span>
                                <span className={subLabelClass}>Cáncer activo (o en tratamiento últimos 6 meses)</span>
                            </div>
                        </label>
                    </div>
                </RiskAccordion>

                {/* ── Bottom Cards ── */}
                <div className="space-y-3 mt-2">
                    {/* ANTECEDENTES QX */}
                    <div className="bg-white p-4 border border-slate-200/80 rounded-xl">
                        <label className="text-[13px] font-semibold text-slate-700 flex items-center gap-2 mb-2.5">
                            <Stethoscope size={15} className="text-cyan-500" strokeWidth={1.5} /> Antecedentes Quirúrgicos
                        </label>
                        <textarea
                            {...register('cirugiasPrevias')}
                            rows={3}
                            className={`${inputClass} resize-none`}
                            placeholder="Cirugías previas, complicaciones anestésicas..."
                        />
                    </div>

                    {/* OTRAS ENFERMEDADES */}
                    <div className="bg-white p-4 border border-slate-200/80 rounded-xl">
                        <label className="text-[13px] font-semibold text-slate-700 flex items-center gap-2 mb-2.5">
                            <AlertCircle size={15} className="text-amber-500" strokeWidth={1.5} /> Otras Enfermedades / Comorbilidades
                        </label>
                        <textarea
                            {...register('otrasEnfermedades')}
                            rows={2}
                            className={`${inputClass} resize-none`}
                            placeholder="Otras enfermedades no listadas arriba..."
                        />
                    </div>

                    {/* TRATAMIENTO ACTUAL */}
                    <div className="bg-white p-4 border border-slate-200/80 rounded-xl">
                        <label className="text-[13px] font-semibold text-slate-700 flex items-center gap-2 mb-2.5">
                            <Stethoscope size={15} className="text-emerald-500" strokeWidth={1.5} /> Tratamiento Actual (Crónico)
                        </label>
                        <textarea
                            {...register('tratamientoActual')}
                            rows={2}
                            className={`${inputClass} resize-none`}
                            placeholder="Fármacos crónicos, dosis, última toma..."
                        />
                    </div>

                    {/* FUNCTIONAL STATUS FOR GUPTA */}
                    <div className="bg-white p-4 border border-slate-200/80 rounded-xl">
                        <h3 className="text-[13px] font-semibold text-slate-700 flex items-center gap-2 mb-2.5">
                            <ShieldAlert size={15} className="text-violet-500" strokeWidth={1.5} /> Estado Funcional (Gupta)
                        </h3>
                        <Field label="Estado funcional">
                            <select {...register('functional_status')} className={selectClass}>
                                <option value="independent">Independiente (Sin ayuda)</option>
                                <option value="partial">Parcialmente Dependiente</option>
                                <option value="total">Totalmente Dependiente</option>
                            </select>
                        </Field>

                        <div className="mt-3">
                            <Field label="Sitio quirúrgico (Gupta)">
                                <select {...register('gupta_surgical_site')} className={selectClass}>
                                    <option value="other">Otro / General</option>
                                    <option value="amputation">Amputación</option>
                                    <option value="anorectal">Anorrectal</option>
                                    <option value="aortic">Aórtico</option>
                                    <option value="bariatric">Bariátrico</option>
                                    <option value="biliary">Biliar</option>
                                    <option value="cardiac">Cardiaco</option>
                                    <option value="ent">ORL / Tiroides</option>
                                    <option value="intestinal">Intestinal</option>
                                    <option value="intracranial">Intracraneal</option>
                                    <option value="orthopedic">Ortopédico</option>
                                    <option value="spinal">Columna</option>
                                    <option value="thoracic">Torácico</option>
                                    <option value="vascular">Vascular Periférico</option>
                                    <option value="urologic">Urológico</option>
                                    <option value="obstetric">Obstétrico</option>
                                </select>
                            </Field>
                        </div>

                        {/* VRC SPECIFIC FACTORS */}
                        {(watch('gupta_surgical_site') === 'vascular' || watch('gupta_surgical_site') === 'aortic' || watch('gupta_surgical_site') === 'amputation') && (
                            <div className="mt-3 pt-3 border-t border-slate-100 animate-fadeIn bg-violet-50/30 p-3 rounded-lg">
                                <label className={`${labelClass} text-violet-600 block mb-2`}>
                                    Criterios Específicos VRC (Vascular)
                                </label>
                                <div className="grid grid-cols-1 gap-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" {...register('vrc_epoc')} className="w-4 h-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500/30" />
                                        <div className="flex flex-col">
                                            <span className="text-[12px] font-semibold text-slate-700">EPOC (Diagnóstico Formal)</span>
                                            <span className={subLabelClass}>Puntaje VRC independiente de Neumopatía</span>
                                        </div>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" {...register('vrc_beta_blocker')} className="w-4 h-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500/30" />
                                        <div className="flex flex-col">
                                            <span className="text-[12px] font-semibold text-slate-700">Uso de Beta-Bloqueador</span>
                                            <span className={subLabelClass}>Tratamiento previo crónico</span>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default RiskFactors;
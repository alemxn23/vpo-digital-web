import React, { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { VPOData } from '../types';
import { Image, UploadCloud, HeartPulse, Activity, AlertTriangle, FileImage, Stethoscope, Bug, Microscope, X } from 'lucide-react';

/* ── Shared Apple-style classes ── */
const inputClass = "w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500/50 hover:border-slate-300 transition-all duration-200";
const selectClass = `${inputClass} bg-white`;
const labelClass = "text-[12px] font-semibold text-slate-500 tracking-wide";

const Field = ({ label, children, className = '' }: { label: string; children: React.ReactNode; className?: string }) => (
    <div className={className}>
        <label className={`${labelClass} block mb-1.5`}>{label}</label>
        {children}
    </div>
);

const Gabinete: React.FC = () => {
    const { register, watch, setValue } = useFormContext<VPOData>();
    const [dragActiveRx, setDragActiveRx] = useState(false);
    const [dragActiveEkg, setDragActiveEkg] = useState(false);

    const data = watch();
    const ritmo = watch('ecg_ritmo_especifico');

    // --- ARISCAT CALCULATION LOGIC ---
    useEffect(() => {
        let points = 0;
        const age = parseFloat(data.edad as any) || 0;
        if (age > 80) { points += 16; }
        else if (age >= 51) { points += 3; }

        const spo2 = data.sato2 || 98;
        if (spo2 <= 90) { points += 24; }
        else if (spo2 <= 95) { points += 8; }

        if (data.ariscat_infeccion) { points += 17; }
        if ((data.hb || 12) < 10) { points += 11; }
        if (data.ariscat_incision === 'abdominal_sup' || data.ariscat_incision === 'intratoracica') {
            points += 24;
        }
        if (data.ariscat_duracion === 'mas_3') { points += 23; }
        else if (data.ariscat_duracion === '2_a_3') { points += 16; }
        if (data.esUrgencia) { points += 8; }

        const currentTotal = data.ariscat_total;
        if (currentTotal !== points) {
            setValue('ariscat_total', points);
        }

        let category = "Bajo Riesgo";
        if (points >= 45) category = "ALTO RIESGO";
        else if (points >= 26) category = "Riesgo Moderado";

        if (data.ariscat_categoria !== category) {
            setValue('ariscat_categoria', category);
        }
    }, [data.edad, data.sato2, data.ariscat_infeccion, data.hb, data.ariscat_incision, data.ariscat_duracion, data.esUrgencia, setValue]);

    // --- DUKE CRITERIA LOGIC ---
    useEffect(() => {
        if ((data.temp || 0) >= 38.0) {
            setValue('duke_menor_fiebre', true);
        }
    }, [data.temp, setValue]);

    useEffect(() => {
        let majors = 0;
        if (data.duke_mayor_hemocultivo) majors++;
        if (data.duke_mayor_eco) majors++;
        if (data.duke_mayor_regurgitacion) majors++;

        let minors = 0;
        if (data.duke_menor_predisposicion) minors++;
        if (data.duke_menor_fiebre) minors++;
        if (data.duke_menor_vascular) minors++;
        if (data.duke_menor_inmuno) minors++;
        if (data.duke_menor_micro) minors++;

        let result: "Definitivo" | "Posible" | "Rechazado" = "Rechazado";
        if (majors >= 2 || (majors >= 1 && minors >= 3) || minors >= 5) {
            result = "Definitivo";
        } else if ((majors >= 1 && minors >= 1) || minors >= 3) {
            result = "Posible";
        }
        setValue('duke_resultado', result);
    }, [
        data.duke_mayor_hemocultivo, data.duke_mayor_eco, data.duke_mayor_regurgitacion,
        data.duke_menor_predisposicion, data.duke_menor_fiebre, data.duke_menor_vascular,
        data.duke_menor_inmuno, data.duke_menor_micro, setValue
    ]);

    // --- IMAGE UPLOAD HANDLER ---
    const handleFile = (files: FileList | null, field: 'rx_imagen' | 'ekg_imagen') => {
        if (files && files[0]) {
            const file = files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setValue(field, reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    /* ── Apple-style Upload Zone ── */
    const UploadZone = ({ id, field, label, hint, dragActive: isActive, setDragActive: setActive, maxH = 'max-h-48' }: {
        id: string; field: 'rx_imagen' | 'ekg_imagen'; label: string; hint: string;
        dragActive: boolean; setDragActive: (v: boolean) => void; maxH?: string;
    }) => (
        <div
            className={`rounded-xl border transition-all duration-200 mb-4 overflow-hidden ${isActive ? 'border-cyan-400 bg-cyan-50/30 shadow-sm shadow-cyan-500/10' : 'border-slate-200 hover:border-slate-300 bg-slate-50/30'}`}
            onDragEnter={() => setActive(true)}
            onDragLeave={() => setActive(false)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
                e.preventDefault();
                setActive(false);
                handleFile(e.dataTransfer.files, field);
            }}
        >
            <input
                type="file"
                id={id}
                className="hidden"
                accept="image/*"
                onChange={(e) => handleFile(e.target.files, field)}
            />
            {watch(field) ? (
                <div className="relative p-3">
                    <img src={watch(field) as string} alt={label} className={`${maxH} w-full object-contain mx-auto rounded-lg`} />
                    <button
                        type="button"
                        onClick={() => setValue(field, '')}
                        className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm text-white rounded-full hover:bg-red-500 transition-colors duration-200"
                    >
                        <X size={14} strokeWidth={1.5} />
                    </button>
                </div>
            ) : (
                <label htmlFor={id} className="cursor-pointer flex items-center gap-3 p-4 group">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center group-hover:bg-cyan-100 transition-colors duration-200 shrink-0">
                        <UploadCloud size={18} className="text-slate-400 group-hover:text-cyan-600 transition-colors" strokeWidth={1.5} />
                    </div>
                    <div>
                        <span className="text-[13px] font-semibold text-slate-600 group-hover:text-cyan-700 transition-colors block">{label}</span>
                        <span className="text-[11px] text-slate-400">{hint}</span>
                    </div>
                </label>
            )}
        </div>
    );

    const DukeCheckbox = ({ name, label, autoNote }: { name: keyof VPOData, label: string, autoNote?: string }) => (
        <label className="flex items-start gap-2.5 p-2.5 rounded-lg hover:bg-violet-50/30 cursor-pointer border border-transparent hover:border-violet-200/50 transition-all duration-200">
            <input type="checkbox" {...register(name)} className="mt-0.5 w-4 h-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500/30" />
            <div className="flex flex-col">
                <span className="text-[12px] font-medium text-slate-600 leading-snug">{label}</span>
                {autoNote && <span className="text-[10px] text-violet-600 font-semibold bg-violet-100/50 px-1.5 py-0.5 rounded w-fit mt-0.5">{autoNote}</span>}
            </div>
        </label>
    );

    return (
        <div className="space-y-5">
            {/* ── Section Header ── */}
            <div className="flex items-center gap-3">
                <FileImage className="text-slate-400" size={20} strokeWidth={1.5} />
                <div>
                    <h2 className="text-base font-bold text-slate-800 leading-tight">Gabinete</h2>
                    <p className="text-[11px] text-slate-400 font-medium">Radiología, ECG y criterios diagnósticos</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
                {/* ── MODULE 1: RADIOGRAFÍA & ARISCAT ── */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                    {/* Module header */}
                    <div className="flex items-center gap-2 px-5 py-3.5 border-b border-slate-100">
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                        <Image size={15} className="text-cyan-600" strokeWidth={1.5} />
                        <h3 className="text-[13px] font-semibold text-slate-700">Radiografía de Tórax</h3>
                    </div>

                    <div className="p-5 space-y-4">
                        {/* Apple-style upload zone */}
                        <UploadZone
                            id="rx-upload"
                            field="rx_imagen"
                            label="Subir imagen de RX"
                            hint="Arrastrar o hacer clic · JPG, PNG"
                            dragActive={dragActiveRx}
                            setDragActive={setDragActiveRx}
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Field label="Fecha RX">
                                <input type="date" {...register('rx_fecha')} className={inputClass} />
                            </Field>
                            <Field label="SpO2 basal (actual)">
                                <div className={`w-full px-3 py-2.5 rounded-lg border text-sm font-semibold text-center tabular-nums ${data.sato2 <= 90 ? 'bg-red-50 text-red-600 border-red-200' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                                    {data.sato2 || 0}%
                                </div>
                            </Field>
                        </div>

                        <Field label="Descripción radiológica">
                            <textarea
                                {...register('rx_descripcion')}
                                rows={3}
                                className={`${inputClass} resize-none`}
                                placeholder="Infiltrados, cardiomegalia, derrame..."
                            />
                        </Field>

                        {/* ARISCAT Calculator */}
                        <div className="rounded-xl border border-teal-200/60 bg-teal-50/20 p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <Activity size={14} className="text-teal-600" strokeWidth={1.5} />
                                <h4 className="text-[12px] font-semibold text-teal-800">Calculadora ARISCAT</h4>
                                <span className="text-[10px] text-teal-500 ml-auto font-medium">Riesgo Pulmonar</span>
                            </div>

                            <div className="space-y-3">
                                <label className="flex items-center gap-2.5 cursor-pointer bg-white p-2.5 rounded-lg border border-teal-100 hover:border-teal-200 transition-colors">
                                    <input type="checkbox" {...register('ariscat_infeccion')} className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500/30" />
                                    <span className="text-[12px] font-semibold text-slate-600">Infección Respiratoria reciente (último mes)</span>
                                </label>

                                <div className="grid grid-cols-2 gap-3">
                                    <Field label="Sitio incisión">
                                        <select {...register('ariscat_incision')} className={`${selectClass} !border-teal-200 text-xs`}>
                                            <option value="periferica">Periférica (Bajo)</option>
                                            <option value="abdominal_sup">Abdominal Sup.</option>
                                            <option value="intratoracica">Intratorácica</option>
                                        </select>
                                    </Field>
                                    <Field label="Duración Cx">
                                        <select {...register('ariscat_duracion')} className={`${selectClass} !border-teal-200 text-xs`}>
                                            <option value="menos_2">{'<'} 2 Horas</option>
                                            <option value="2_a_3">2 - 3 Horas</option>
                                            <option value="mas_3">{'>'} 3 Horas</option>
                                        </select>
                                    </Field>
                                </div>

                                {/* ARISCAT Result */}
                                <div className="flex items-center justify-between border-t border-teal-200/50 pt-3">
                                    <div>
                                        <span className="text-[10px] text-slate-400 block">Puntaje</span>
                                        <span className="text-lg font-bold text-slate-800 tabular-nums">{watch('ariscat_total') || 0} pts</span>
                                    </div>
                                    <span className={`text-[12px] font-semibold px-3 py-1 rounded-full ${(watch('ariscat_total') || 0) >= 45 ? 'text-red-700 bg-red-100' :
                                        (watch('ariscat_total') || 0) >= 26 ? 'text-amber-700 bg-amber-100' : 'text-emerald-700 bg-emerald-100'
                                        }`}>
                                        {watch('ariscat_categoria')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── MODULE 2: ECG ── */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                    {/* Module header */}
                    <div className="flex items-center gap-2 px-5 py-3.5 border-b border-slate-100">
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        <HeartPulse size={15} className="text-rose-500" strokeWidth={1.5} />
                        <h3 className="text-[13px] font-semibold text-slate-700">Electrocardiograma</h3>
                    </div>

                    <div className="p-5 space-y-4">
                        {/* Apple-style upload zone */}
                        <UploadZone
                            id="ekg-upload"
                            field="ekg_imagen"
                            label="Subir trazo de EKG"
                            hint="Arrastrar o hacer clic · Imagen del trazo"
                            dragActive={dragActiveEkg}
                            setDragActive={setDragActiveEkg}
                            maxH="max-h-36"
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Field label="Fecha ECG">
                                <input type="date" {...register('ecg_fecha')} className={inputClass} />
                            </Field>
                            <Field label="Frecuencia (lpm)">
                                <input type="number" {...register('ecg_frecuencia', { valueAsNumber: true })} className={`${inputClass} text-center font-semibold tabular-nums`} />
                            </Field>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Field label="Ritmo">
                                <select {...register('ecg_ritmo_especifico')} className={selectClass}>
                                    <option value="Sinusal">Sinusal</option>
                                    <option value="FA">Fibrilación Auricular</option>
                                    <option value="Flutter">Flutter Auricular</option>
                                    <option value="Union">Ritmo de la Unión</option>
                                    <option value="Marcapasos">Marcapasos</option>
                                </select>
                            </Field>
                            <Field label="Bloqueo AV">
                                <select {...register('ecg_bloqueo')} className={selectClass}>
                                    <option value="Ninguno">Ninguno</option>
                                    <option value="1er_Grado">1er Grado</option>
                                    <option value="Mobitz_I">Mobitz I</option>
                                    <option value="Mobitz_II">Mobitz II</option>
                                    <option value="3er_Grado">3er Grado (Completo)</option>
                                </select>
                            </Field>
                        </div>

                        <div className="space-y-1.5">
                            <label className={labelClass}>Alteraciones específicas</label>
                            <div className="grid grid-cols-1 gap-1.5">
                                {/* HVI */}
                                <label className={`flex items-center justify-between gap-2 p-2.5 border rounded-lg cursor-pointer transition-all duration-200 ${watch('ecg_hvi') ? 'bg-amber-50/50 border-amber-300/60' : 'border-slate-200 hover:border-slate-300'}`}>
                                    <div className="flex items-center gap-2">
                                        <input type="checkbox" {...register('ecg_hvi')} className="w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500/30" />
                                        <span className={`text-[12px] font-medium ${watch('ecg_hvi') ? 'text-amber-800 font-semibold' : 'text-slate-600'}`}>HVI (Criterios Sokolow/Cornell)</span>
                                    </div>
                                    {watch('ecg_hvi') && <span className="text-[10px] bg-amber-100 text-amber-700 font-semibold px-2 py-0.5 rounded-full shrink-0">ASA III</span>}
                                </label>

                                {/* BRIHH Incompleto */}
                                <label className="flex items-center justify-between gap-2 p-2.5 border border-slate-200 rounded-lg hover:border-slate-300 cursor-pointer transition-all duration-200">
                                    <div className="flex items-center gap-2">
                                        <input type="checkbox" {...register('ecg_brihh_incompleto')} className="w-4 h-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500/30" />
                                        <span className="text-[12px] font-medium text-slate-600">BRIHH Incompleto</span>
                                    </div>
                                    <span className="text-[10px] text-slate-400 font-medium">Monitorear</span>
                                </label>

                                {/* BRIHH Completo */}
                                <label className={`flex items-center justify-between gap-2 p-2.5 border rounded-lg cursor-pointer transition-all duration-200 ${watch('ecg_brihh_completo') ? 'bg-red-50/50 border-red-300/60' : 'border-slate-200 hover:border-slate-300'}`}>
                                    <div className="flex items-center gap-2">
                                        <input type="checkbox" {...register('ecg_brihh_completo')} className="w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-500/30" />
                                        <div>
                                            <span className={`text-[12px] font-semibold ${watch('ecg_brihh_completo') ? 'text-red-700' : 'text-slate-600'}`}>BRIHH Completo</span>
                                            {watch('ecg_brihh_completo') && <p className="text-[10px] text-red-500">Sugiere cardiopatía subyacente</p>}
                                        </div>
                                    </div>
                                    {watch('ecg_brihh_completo') && <span className="text-[10px] bg-red-100 text-red-700 font-semibold px-2 py-0.5 rounded-full shrink-0">+1 Lee</span>}
                                </label>

                                {/* ECG Ischemia */}
                                <label className={`flex items-center justify-between gap-2 p-2.5 border rounded-lg cursor-pointer transition-all duration-200 ${watch('ecg_isquemia') ? 'bg-red-50/50 border-red-300/60' : 'border-slate-200 hover:border-slate-300'}`}>
                                    <div className="flex items-center gap-2">
                                        <input type="checkbox" {...register('ecg_isquemia')} className="w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-500/30" />
                                        <div>
                                            <span className={`text-[12px] font-semibold ${watch('ecg_isquemia') ? 'text-red-700' : 'text-slate-600'}`}>Isquemia / Necrosis</span>
                                            <p className="text-[10px] text-slate-400">Q patológica, ST elevado/deprimido, T invertida</p>
                                        </div>
                                    </div>
                                    {watch('ecg_isquemia') && (
                                        <div className="flex flex-col gap-0.5 items-end shrink-0">
                                            <span className="text-[10px] bg-red-500 text-white font-semibold px-2 py-0.5 rounded-full">+1 Lee</span>
                                            <span className="text-[10px] bg-red-100 text-red-700 font-semibold px-2 py-0.5 rounded-full">+1 Caprini</span>
                                        </div>
                                    )}
                                </label>

                                {/* Extrasistoles */}
                                <label className={`flex items-center justify-between gap-2 p-2.5 border rounded-lg cursor-pointer transition-all duration-200 ${watch('ecg_extrasistoles') ? 'bg-orange-50/50 border-orange-300/60' : 'border-slate-200 hover:border-slate-300'}`}>
                                    <div className="flex items-center gap-2">
                                        <input type="checkbox" {...register('ecg_extrasistoles')} className="w-4 h-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500/30" />
                                        <span className={`text-[12px] font-medium ${watch('ecg_extrasistoles') ? 'text-orange-800 font-semibold' : 'text-slate-600'}`}>{'>'} 5 Extrasístoles Ventriculares/min</span>
                                    </div>
                                    {watch('ecg_extrasistoles') && <span className="text-[10px] bg-orange-100 text-orange-700 font-semibold px-2 py-0.5 rounded-full shrink-0">+7 Goldman</span>}
                                </label>
                            </div>
                        </div>

                        {/* Ritmo non-sinus impact */}
                        {watch('ecg_ritmo_especifico') && watch('ecg_ritmo_especifico') !== 'Sinusal' && (
                            <div className="p-3 bg-amber-50/50 border border-amber-200/60 rounded-lg flex items-center justify-between">
                                <span className="text-[12px] font-semibold text-amber-700">Ritmo: {watch('ecg_ritmo_especifico')}</span>
                                <div className="flex gap-1">
                                    <span className="text-[10px] bg-amber-500 text-white font-semibold px-2 py-0.5 rounded-full">+7 Goldman</span>
                                    <span className="text-[10px] bg-amber-400 text-white font-semibold px-2 py-0.5 rounded-full">+5 Detsky</span>
                                </div>
                            </div>
                        )}

                        {/* High-degree block impact */}
                        {(watch('ecg_bloqueo') === 'Mobitz_II' || watch('ecg_bloqueo') === '3er_Grado') && (
                            <div className="p-3 bg-red-50/50 border border-red-200/60 rounded-lg flex items-center justify-between">
                                <span className="text-[12px] font-semibold text-red-700">Bloqueo: {watch('ecg_bloqueo') === '3er_Grado' ? 'Completo (3er Grado)' : 'Mobitz II'}</span>
                                <span className="text-[10px] bg-red-500 text-white font-semibold px-2 py-0.5 rounded-full">+5 Detsky</span>
                            </div>
                        )}

                        <Field label="Otras alteraciones">
                            <input {...register('ecg_otras_alteraciones')} className={inputClass} placeholder="Eje desviado, QT largo, etc." />
                        </Field>

                        {/* Logic Alerts */}
                        {(ritmo === 'FA' || ritmo === 'Flutter') && (
                            <div className="p-3 bg-amber-50/50 border border-amber-200/60 rounded-xl flex items-start gap-2.5 animate-fadeIn">
                                <AlertTriangle className="text-amber-500 mt-0.5 shrink-0" size={15} strokeWidth={1.5} />
                                <p className="text-[12px] text-amber-700 font-medium leading-snug">
                                    <strong>Fibrilación/Flutter:</strong> Verifique sección de Anticoagulación en "Fármacos" y calcule riesgo trombótico.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── MODULE 3: ENDOCARDITIS (DUKE) ── */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                        <Bug size={15} className="text-violet-500" strokeWidth={1.5} />
                        <h3 className="text-[13px] font-semibold text-slate-700">Endocarditis Infecciosa (Duke)</h3>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[11px] font-semibold
                        ${data.duke_resultado === 'Definitivo' ? 'bg-red-500 text-white animate-pulse' :
                            data.duke_resultado === 'Posible' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-500'}`
                    }>
                        {data.duke_resultado || 'Rechazado'}
                    </span>
                </div>

                <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Criterios Mayores */}
                    <div>
                        <div className="flex items-center gap-1.5 mb-2.5">
                            <Microscope size={13} className="text-violet-500" strokeWidth={1.5} />
                            <h4 className={`${labelClass} text-violet-600`}>Criterios Mayores</h4>
                        </div>
                        <div className="space-y-0.5">
                            <DukeCheckbox name="duke_mayor_hemocultivo" label="Hemocultivos Positivos (Típicos)" />
                            <DukeCheckbox name="duke_mayor_eco" label="Evidencia Ecocardiográfica (Vegetación/Absceso)" />
                            <DukeCheckbox
                                name="duke_mayor_regurgitacion"
                                label="Nueva Regurgitación Valvular"
                                autoNote={data.exploracion_estenosis_aortica || data.exploracion_soplo_carotideo ? "Soplo detectado en física" : ""}
                            />
                        </div>
                    </div>

                    {/* Criterios Menores */}
                    <div>
                        <div className="flex items-center gap-1.5 mb-2.5">
                            <Stethoscope size={13} className="text-violet-500" strokeWidth={1.5} />
                            <h4 className={`${labelClass} text-violet-600`}>Criterios Menores</h4>
                        </div>
                        <div className="space-y-0.5">
                            <DukeCheckbox name="duke_menor_predisposicion" label="Predisposición (Cardiopatía o ADIV)" />
                            <DukeCheckbox
                                name="duke_menor_fiebre"
                                label="Fiebre ≥ 38.0°C"
                                autoNote={data.temp >= 38.0 ? `Detectado: ${data.temp}°C` : ""}
                            />
                            <DukeCheckbox name="duke_menor_vascular" label="Fenómenos Vasculares (Embolia, Infartos)" />
                            <DukeCheckbox name="duke_menor_inmuno" label="Fenómenos Inmunológicos (GMN, Osler, Roth)" />
                            <DukeCheckbox name="duke_menor_micro" label="Evidencia Microbiológica (No mayor)" />
                        </div>
                    </div>
                </div>

                {/* ALERTS */}
                {(data.duke_resultado === 'Definitivo' || data.duke_resultado === 'Posible') && (
                    <div className="mx-5 mb-5 p-3.5 bg-red-50 border border-red-200/60 rounded-xl flex items-start gap-2.5 animate-fadeIn">
                        <AlertTriangle className="text-red-500 mt-0.5 shrink-0" size={16} strokeWidth={1.5} />
                        <div>
                            <h5 className="text-[12px] font-semibold text-red-700">Riesgo Endocarditis</h5>
                            <p className="text-[11px] text-red-600 font-medium leading-snug mt-0.5">
                                Diferir cirugía electiva, iniciar protocolo de antibióticos y solicitar ETE urgente.
                            </p>
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
};

export default Gabinete;
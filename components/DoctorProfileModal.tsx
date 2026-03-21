import React, { useState, useRef, useCallback, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import {
    X, ShieldCheck, Clock, CheckCircle2, XCircle, Camera, Upload,
    IdCard, AlertCircle, Loader2, RotateCcw, ChevronRight, UserCheck, Check
} from 'lucide-react';

interface DoctorProfile {
    full_name: string;
    cedula_profesional: string;
    verification_status: 'unverified' | 'pending' | 'approved' | 'rejected';
    verified: boolean;
    ine_url?: string;
    selfie_url?: string;
}

interface DoctorProfileModalProps {
    onClose: () => void;
    profile: DoctorProfile | null;
    onVerificationSubmitted?: () => void;
}

type Step = 'status' | 'cedula' | 'selfie' | 'ine' | 'done';

export const DoctorProfileModal: React.FC<DoctorProfileModalProps> = ({
    onClose,
    profile,
    onVerificationSubmitted
}) => {
    const [step, setStep] = useState<Step>(
        profile?.verification_status === 'unverified' ? 'cedula' : 'status'
    );
    const [selfieDataUrl, setSelfieDataUrl] = useState<string | null>(null);
    const [ineFile, setIneFile] = useState<File | null>(null);
    const [inePreview, setInePreview] = useState<string | null>(null);
    const [cameraOn, setCameraOn] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const ineInputRef = useRef<HTMLInputElement>(null);
    const selfieInputRef = useRef<HTMLInputElement>(null);

    const [editMode, setEditMode] = useState(!profile?.cedula_profesional || !profile?.full_name);
    const [cedulaInput, setCedulaInput] = useState(profile?.cedula_profesional || '');
    const [nameInput, setNameInput] = useState(profile?.full_name || '');

    useEffect(() => {
        return () => stopCamera();
    }, []);

    useEffect(() => {
        if (profile) {
            if (!cedulaInput && profile.cedula_profesional) setCedulaInput(profile.cedula_profesional);
            if (!nameInput && profile.full_name) setNameInput(profile.full_name);
            setEditMode(!profile.cedula_profesional || !profile.full_name);
        }
    }, [profile]);

    const startCamera = async () => {
        if (editMode) {
            if (!nameInput.trim()) return setError('El nombre completo es requerido.');
            if (nameInput.trim().length < 3) return setError('El nombre debe tener al menos 3 caracteres.');
            if (!cedulaInput.trim()) return setError('La Cédula Profesional es requerida.');
            if (cedulaInput.trim().length < 4) return setError('La Cédula no es válida.');
        }

        setError('');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
            }
            setCameraOn(true);
            setStep('selfie');
        } catch {
            setError('No se pudo acceder a la cámara. Verifica los permisos del navegador o sube una foto desde tus archivos.');
            setStep('selfie');
        }
    };

    const stopCamera = () => {
        streamRef.current?.getTracks().forEach(t => t.stop());
        streamRef.current = null;
        setCameraOn(false);
    };

    const takeSelfie = () => {
        if (!videoRef.current) return;
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
        setSelfieDataUrl(canvas.toDataURL('image/jpeg', 0.85));
        stopCamera();
    };

    const retakeSelfie = () => {
        setSelfieDataUrl(null);
        startCamera();
    };

    const handleSelfieFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 10 * 1024 * 1024) {
            setError('El archivo es demasiado grande (máx. 10 MB).');
            return;
        }
        stopCamera();
        const reader = new FileReader();
        reader.onload = (ev) => {
            setSelfieDataUrl(ev.target?.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleIneFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 10 * 1024 * 1024) {
            setError('El archivo es demasiado grande (máx. 10 MB).');
            return;
        }
        setIneFile(file);
        const reader = new FileReader();
        reader.onload = (ev) => setInePreview(ev.target?.result as string);
        reader.readAsDataURL(file);
    };

    // Eliminado dataUrlToBlob, usamos fetch nativo rescindiendo funciones lentas y propensas a error

    const handleSubmit = async () => {
        if (!supabase) return setError('Servicio no disponible.');
        if (!selfieDataUrl) return setError('Por favor proporciona una foto de tu rostro.');
        if (!ineFile) return setError('Por favor sube tu INE.');
        setUploading(true);
        setError('');
        try {
            const { data: authData } = await supabase.auth.getUser();
            const userId = authData?.user?.id;
            if (!userId) throw new Error('No autenticado.');

            const ts = Date.now();

            // 1. Upload selfie
            const selfieReq = await fetch(selfieDataUrl);
            const selfieBlob = await selfieReq.blob();
            const selfiePath = `${userId}/selfie_${ts}.jpg`;

            const { error: selfieErr } = await supabase.storage
                .from('ine-comprobantes')
                .upload(selfiePath, selfieBlob, { contentType: 'image/jpeg', upsert: true });
            if (selfieErr) throw selfieErr;

            // Creamos una URL firmada de 1 año para que el admin la pueda abrir, ya que el bucket debe ser Privado.
            const { data: selfieData, error: selfieSignErr } = await supabase.storage
                .from('ine-comprobantes')
                .createSignedUrl(selfiePath, 60 * 60 * 24 * 365);
            if (selfieSignErr) throw selfieSignErr;

            // 2. Upload INE
            const ineExt = ineFile.name.split('.').pop() || 'jpg';
            const inePath = `${userId}/ine_${ts}.${ineExt}`;

            const { error: ineErr } = await supabase.storage
                .from('ine-comprobantes')
                .upload(inePath, ineFile, { contentType: ineFile.type, upsert: true });
            if (ineErr) throw ineErr;

            const { data: ineData, error: ineSignErr } = await supabase.storage
                .from('ine-comprobantes')
                .createSignedUrl(inePath, 60 * 60 * 24 * 365);
            if (ineSignErr) throw ineSignErr;

            // 3. Update profile
            const profileUpdates: any = {
                verification_status: 'pending',
                ine_url: ineData?.signedUrl || null,
                selfie_url: selfieData?.signedUrl || null,
            };
            if (nameInput) profileUpdates.full_name = nameInput.trim();
            if (cedulaInput) profileUpdates.cedula_profesional = cedulaInput.trim();

            const { error: profileErr } = await supabase.from('profiles').update(profileUpdates).eq('id', userId);
            if (profileErr) throw profileErr;

            setStep('done');
            onVerificationSubmitted?.();
        } catch (err: any) {
            setError(err.message || 'Error al enviar la solicitud.');
        } finally {
            setUploading(false);
        }
    };

    const StatusBadge = () => {
        const s = profile?.verification_status || 'unverified';
        if (s === 'approved' || profile?.verified) return (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                <CheckCircle2 size={12} className="text-emerald-500" />
                <span className="text-[10px] uppercase tracking-wide font-bold">Verificado</span>
            </div>
        );
        if (s === 'pending') return (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full">
                <Clock size={12} className="text-amber-500" />
                <span className="text-[10px] uppercase tracking-wide font-bold">En Revisión</span>
            </div>
        );
        if (s === 'rejected') return (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 rounded-full">
                <XCircle size={12} className="text-red-500" />
                <span className="text-[10px] uppercase tracking-wide font-bold">Rechazado</span>
            </div>
        );
        return (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-600 border border-slate-200 rounded-full">
                <ShieldCheck size={12} className="text-slate-400" />
                <span className="text-[10px] uppercase tracking-wide font-bold">Sin verificar</span>
            </div>
        );
    };

    const currentStatus = profile?.verification_status || 'unverified';
    const canStartVerification = currentStatus === 'unverified' || currentStatus === 'rejected';
    const inputClass = "w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 text-sm placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="relative w-full max-w-md bg-white border border-slate-200/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
                {/* Header */}
                <div className="px-6 py-5 flex items-center justify-between border-b border-slate-100 bg-white">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-sm">
                            <UserCheck size={20} strokeWidth={1.5} className="text-slate-700" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-slate-800 leading-tight">Perfil Médico</h2>
                            <p className="text-[12px] font-medium text-slate-400">Verificación de identidad profesional</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={16} strokeWidth={2} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                    {/* Profile Info - always visible */}
                    <div className="bg-white rounded-xl p-4 mb-6 border border-slate-200/60 shadow-sm flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <p className="text-slate-800 font-bold text-sm truncate">{nameInput || profile?.full_name || '—'}</p>
                            <p className="text-slate-500 text-[11px] mt-0.5 font-medium">Cédula: <span className="text-slate-800 font-mono font-bold">{cedulaInput || profile?.cedula_profesional || '—'}</span></p>
                        </div>
                        <StatusBadge />
                    </div>

                    {/* --- STEP: STATUS --- */}
                    {step === 'status' && (
                        <div className="space-y-4">
                            {(profile?.verification_status === 'approved' || profile?.verified) && (
                                <div className="flex flex-col items-center gap-3 py-6">
                                    <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center shadow-sm">
                                        <CheckCircle2 size={32} strokeWidth={1.5} className="text-emerald-500" />
                                    </div>
                                    <h3 className="text-slate-800 font-bold text-base mt-2">¡Identidad Verificada!</h3>
                                    <p className="text-slate-500 text-xs text-center leading-relaxed px-4">Tu nombre y cédula aparecerán con la marca de verificación en todos tus reportes generados.</p>
                                </div>
                            )}
                            {profile?.verification_status === 'pending' && (
                                <div className="flex flex-col items-center gap-3 py-6">
                                    <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center shadow-sm">
                                        <Clock size={32} strokeWidth={1.5} className="text-amber-500" />
                                    </div>
                                    <h3 className="text-slate-800 font-bold text-base mt-2">Solicitud en revisión</h3>
                                    <p className="text-slate-500 text-xs text-center leading-relaxed px-4">Estamos revisando tus datos en el Registro Nacional de Profesionistas. Te notificaremos pronto.</p>
                                </div>
                            )}
                            {canStartVerification && (
                                <button
                                    onClick={() => setStep('cedula')}
                                    className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl transition-all shadow-md text-[13px]"
                                >
                                    Iniciar Proceso de Verificación <ChevronRight size={16} />
                                </button>
                            )}
                        </div>
                    )}

                    {/* --- STEP: CEDULA REVIEW --- */}
                    {step === 'cedula' && (
                        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="flex flex-col mb-2">
                                <span className="text-[10px] font-bold text-cyan-600 tracking-wider uppercase mb-1">Paso 1 de 3</span>
                                <h3 className="text-base font-bold text-slate-800">Confirma tu identidad</h3>
                                <p className="text-xs text-slate-500 mt-1">Ingresa los datos exactos que aparecen en tu cédula para su verificación en la SEP.</p>
                            </div>

                            {editMode ? (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-500 mb-1.5 ml-1">Nombre Completo</label>
                                        <input
                                            type="text"
                                            value={nameInput}
                                            onChange={e => setNameInput(e.target.value)}
                                            placeholder="Ej. Dr. Juan Pérez García"
                                            className={inputClass}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-500 mb-1.5 ml-1">Cédula Profesional</label>
                                        <input
                                            type="text"
                                            value={cedulaInput}
                                            onChange={e => setCedulaInput(e.target.value)}
                                            placeholder="Ej. 12345678"
                                            className={`${inputClass} font-mono`}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                                    <div className="w-10 h-10 rounded-full bg-cyan-50 flex items-center justify-center shrink-0">
                                        <IdCard size={18} className="text-cyan-600" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Cédula Registrada</p>
                                        <p className="text-slate-800 font-mono font-bold mt-0.5">{cedulaInput}</p>
                                    </div>
                                </div>
                            )}

                            {error && (
                                <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl p-3">
                                    <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
                                    <p className="text-red-800 text-xs font-medium">{error}</p>
                                </div>
                            )}

                            <button
                                onClick={startCamera}
                                className="w-full mt-2 flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl transition-all shadow-sm text-[13px]"
                            >
                                Continuar Paso 2 <ChevronRight size={16} />
                            </button>
                        </div>
                    )}

                    {/* --- STEP: SELFIE --- */}
                    {step === 'selfie' && (
                        <div className="space-y-5 animate-in fade-in slide-in-from-right-2 duration-300">
                            <div className="flex flex-col mb-2">
                                <span className="text-[10px] font-bold text-cyan-600 tracking-wider uppercase mb-1">Paso 2 de 3</span>
                                <h3 className="text-base font-bold text-slate-800">Fotografía de rostro</h3>
                                <p className="text-xs text-slate-500 mt-1">Toma una foto en el momento o sube una imagen de tu cara con buena iluminación.</p>
                            </div>

                            <input ref={selfieInputRef} type="file" accept="image/*" className="hidden" onChange={handleSelfieFile} />

                            <div className="relative rounded-2xl bg-slate-100 overflow-hidden aspect-square flex items-center justify-center border border-slate-200/80 shadow-inner">
                                {selfieDataUrl ? (
                                    <img src={selfieDataUrl} alt="Selfie" className="w-full h-full object-cover" />
                                ) : (
                                    <>
                                        <video
                                            ref={videoRef}
                                            className={`w-full h-full object-cover ${cameraOn ? 'block' : 'hidden'}`}
                                            muted
                                            playsInline
                                            autoPlay
                                        />
                                        {!cameraOn && (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-slate-400 bg-slate-50">
                                                <Camera size={40} strokeWidth={1} />
                                                <p className="text-xs font-medium">Cámara no iniciada</p>
                                            </div>
                                        )}
                                        {/* Guide */}
                                        {cameraOn && (
                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                                                <div className="w-48 h-48 rounded-full border-[3px] border-white/60 border-dashed drop-shadow-md" />
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>

                            {error && (
                                <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl p-3">
                                    <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
                                    <p className="text-red-800 text-xs font-medium">{error}</p>
                                </div>
                            )}

                            <div className="flex flex-col gap-3">
                                {!selfieDataUrl ? (
                                    <div className="flex gap-2">
                                        {!cameraOn ? (
                                            <button onClick={startCamera} className="flex flex-1 items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl text-[13px] transition-all shadow-sm">
                                                <Camera size={16} /> Abrir Cámara
                                            </button>
                                        ) : (
                                            <button onClick={takeSelfie} className="flex flex-1 items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl text-[13px] transition-all shadow-sm">
                                                <Camera size={16} /> Tomar Foto Ahora
                                            </button>
                                        )}
                                        <button onClick={() => selfieInputRef.current?.click()} className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold py-3.5 px-4 rounded-xl text-[13px] transition-all shadow-sm">
                                            <Upload size={16} className="text-slate-500" /> Archivo
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex gap-2">
                                        <button onClick={retakeSelfie} className="flex items-center justify-center bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 font-bold py-3.5 px-5 rounded-xl text-[13px] transition-all shadow-sm">
                                            <RotateCcw size={16} />
                                        </button>
                                        <button onClick={() => { setError(''); setStep('ine'); }} className="flex-1 flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl text-[13px] transition-all shadow-sm">
                                            Continuar Paso 3 <ChevronRight size={16} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* --- STEP: INE UPLOAD --- */}
                    {step === 'ine' && (
                        <div className="space-y-5 animate-in fade-in slide-in-from-right-2 duration-300">
                            <div className="flex flex-col mb-2">
                                <span className="text-[10px] font-bold text-cyan-600 tracking-wider uppercase mb-1">Paso 3 de 3</span>
                                <h3 className="text-base font-bold text-slate-800">Documento de Identidad</h3>
                                <p className="text-xs text-slate-500 mt-1">Sube una foto clara (frontal) de tu INE/IFE vigente para validar tu identidad.</p>
                            </div>

                            <input ref={ineInputRef} type="file" accept="image/*,.pdf" className="hidden" onChange={handleIneFile} />

                            {inePreview ? (
                                <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-white">
                                    {ineFile?.type === 'application/pdf' ? (
                                        <div className="flex flex-col items-center gap-3 py-10 bg-slate-50">
                                            <IdCard size={40} strokeWidth={1.5} className="text-slate-400" />
                                            <p className="text-[13px] text-slate-600 font-semibold">{ineFile.name}</p>
                                        </div>
                                    ) : (
                                        <div className="bg-slate-50 aspect-video flex items-center justify-center p-2">
                                            <img src={inePreview} alt="INE" className="w-full h-full object-contain rounded-lg" />
                                        </div>
                                    )}
                                    <button onClick={() => { setIneFile(null); setInePreview(null); }} className="absolute top-3 right-3 p-1.5 bg-white/90 backdrop-blur-sm shadow-sm rounded-full text-slate-600 hover:text-red-500 hover:bg-white transition-colors">
                                        <X size={14} strokeWidth={2.5} />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => ineInputRef.current?.click()}
                                    className="w-full bg-white border-2 border-dashed border-slate-300 hover:border-cyan-500/50 hover:bg-cyan-50/30 rounded-2xl p-8 flex flex-col items-center gap-3 text-slate-500 hover:text-cyan-600 transition-all group"
                                >
                                    <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-cyan-100/50 transition-colors">
                                        <Upload size={20} strokeWidth={1.5} />
                                    </div>
                                    <div className="text-center">
                                        <span className="text-sm font-bold text-slate-700 group-hover:text-cyan-700 block mb-0.5">Seleccionar Documento</span>
                                        <span className="text-[11px] text-slate-400">Archivos JPG, PNG o PDF (Máx. 10 MB)</span>
                                    </div>
                                </button>
                            )}

                            {error && (
                                <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl p-3">
                                    <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
                                    <p className="text-red-800 text-xs font-medium">{error}</p>
                                </div>
                            )}

                            <button
                                onClick={handleSubmit}
                                disabled={uploading || !ineFile}
                                className="w-full mt-2 flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl transition-all shadow-sm text-[13px] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {uploading ? <><Loader2 size={16} className="animate-spin" /> Procesando Solicitud...</> : <><ShieldCheck size={16} /> Enviar para Verificación</>}
                            </button>
                        </div>
                    )}

                    {/* --- STEP: DONE --- */}
                    {step === 'done' && (
                        <div className="flex flex-col items-center gap-4 py-8 animate-in zoom-in-95 duration-500">
                            <div className="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center shadow-sm">
                                <Check size={40} strokeWidth={2} className="text-emerald-500" />
                            </div>
                            <div className="text-center space-y-2">
                                <h3 className="text-slate-800 font-bold text-xl">¡Solicitud recibida!</h3>
                                <p className="text-slate-500 text-xs leading-relaxed px-6">
                                    Hemos recibido exitosamente tu documentación y la validaremos junto con tu número de cédula en el Registro Nacional de Profesionistas.<br /><br />
                                    <span className="text-slate-800 font-semibold">Te notificaremos el resultado en máximo 24-48 hrs.</span>
                                </p>
                            </div>
                            <button onClick={onClose} className="w-full mt-4 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-[13px] transition-all">
                                Cerrar y Volver
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DoctorProfileModal;

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import {
    X, ShieldCheck, Clock, CheckCircle2, XCircle, Camera, Upload,
    IdCard, AlertCircle, Loader2, RotateCcw, ChevronRight, UserCheck
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

    const [editMode, setEditMode] = useState(!profile?.cedula_profesional || !profile?.full_name);
    const [cedulaInput, setCedulaInput] = useState(profile?.cedula_profesional || '');
    const [nameInput, setNameInput] = useState(profile?.full_name || '');

    // Stop camera on unmount or when navigating away
    useEffect(() => {
        return () => stopCamera();
    }, []);

    // Sync state if profile loads slightly after modal opens
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
            setError('No se pudo acceder a la cámara. Verifica los permisos del navegador.');
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

    const dataUrlToBlob = (dataUrl: string): Blob => {
        const arr = dataUrl.split(',');
        const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
        const bstr = atob(arr[1]);
        const u8arr = new Uint8Array(bstr.length);
        for (let i = 0; i < bstr.length; i++) u8arr[i] = bstr.charCodeAt(i);
        return new Blob([u8arr], { type: mime });
    };

    const handleSubmit = async () => {
        if (!supabase) return setError('Servicio no disponible.');
        if (!selfieDataUrl) return setError('Por favor toma una selfie primero.');
        if (!ineFile) return setError('Por favor sube tu INE.');
        setUploading(true);
        setError('');
        try {
            const { data: authData } = await supabase.auth.getUser();
            const userId = authData?.user?.id;
            if (!userId) throw new Error('No autenticado.');

            const ts = Date.now();

            // 1. Upload selfie
            const selfieBlob = dataUrlToBlob(selfieDataUrl);
            const { error: selfieErr } = await supabase.storage
                .from('ine-comprobantes')
                .upload(`${userId}/selfie_${ts}.jpg`, selfieBlob, { contentType: 'image/jpeg', upsert: true });
            if (selfieErr) throw selfieErr;
            const { data: selfieData } = supabase.storage.from('ine-comprobantes').getPublicUrl(`${userId}/selfie_${ts}.jpg`);

            // 2. Upload INE
            const ineExt = ineFile.name.split('.').pop() || 'jpg';
            const { error: ineErr } = await supabase.storage
                .from('ine-comprobantes')
                .upload(`${userId}/ine_${ts}.${ineExt}`, ineFile, { contentType: ineFile.type, upsert: true });
            if (ineErr) throw ineErr;
            const { data: ineData } = supabase.storage.from('ine-comprobantes').getPublicUrl(`${userId}/ine_${ts}.${ineExt}`);

            // 3. Update profile
            // Use up-to-date inputs inside the modal if editMode was true
            const profileUpdates: any = {
                verification_status: 'pending',
                ine_url: ineData?.publicUrl || null,
                selfie_url: selfieData?.publicUrl || null,
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

    // --- Status badge helper ---
    const StatusBadge = () => {
        const s = profile?.verification_status || 'unverified';
        if (s === 'approved' || profile?.verified) return (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
                <CheckCircle2 size={14} className="text-emerald-400" />
                <span className="text-xs font-bold text-emerald-400">Verificado</span>
            </div>
        );
        if (s === 'pending') return (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-full">
                <Clock size={14} className="text-amber-400" />
                <span className="text-xs font-bold text-amber-400">Pendiente de revisión</span>
            </div>
        );
        if (s === 'rejected') return (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/30 rounded-full">
                <XCircle size={14} className="text-red-400" />
                <span className="text-xs font-bold text-red-400">Rechazado — reenvía documentación</span>
            </div>
        );
        return (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-700/50 border border-slate-600/50 rounded-full">
                <ShieldCheck size={14} className="text-slate-400" />
                <span className="text-xs font-bold text-slate-400">Sin verificar</span>
            </div>
        );
    };

    const currentStatus = profile?.verification_status || 'unverified';
    const canStartVerification = currentStatus === 'unverified' || currentStatus === 'rejected';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl shadow-teal-900/20 overflow-hidden">
                {/* Top accent */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-400 via-cyan-400 to-indigo-500" />

                {/* Header */}
                <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-slate-700/50">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-teal-500/10 border border-teal-500/30 flex items-center justify-center">
                            <UserCheck size={18} className="text-teal-400" />
                        </div>
                        <div>
                            <h2 className="text-base font-black text-white leading-tight">Perfil Médico</h2>
                            <p className="text-[11px] text-slate-400">Verificación de identidad profesional</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800">
                        <X size={18} />
                    </button>
                </div>

                <div className="px-6 pb-6 pt-4">
                    {/* Profile Info - always visible */}
                    <div className="bg-slate-800/40 rounded-xl p-4 mb-4 border border-slate-700/30">
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <p className="text-white font-bold text-sm truncate">{nameInput || profile?.full_name || '—'}</p>
                                <p className="text-slate-400 text-xs mt-0.5">Cédula Profesional: <span className="text-teal-400 font-mono font-bold">{cedulaInput || profile?.cedula_profesional || '—'}</span></p>
                            </div>
                            <StatusBadge />
                        </div>
                    </div>

                    {/* --- STEP: STATUS (already verified or pending) --- */}
                    {step === 'status' && (
                        <div className="space-y-4">
                            {(profile?.verification_status === 'approved' || profile?.verified) && (
                                <div className="flex flex-col items-center gap-3 py-6">
                                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                                        <CheckCircle2 size={32} className="text-emerald-400" />
                                    </div>
                                    <p className="text-emerald-300 font-bold text-sm text-center">¡Tu identidad médica ha sido verificada!</p>
                                    <p className="text-slate-400 text-xs text-center">Tu nombre y cédula aparecerán con el badge ✅ en todos los reportes generados.</p>
                                </div>
                            )}
                            {profile?.verification_status === 'pending' && (
                                <div className="flex flex-col items-center gap-3 py-6">
                                    <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                                        <Clock size={32} className="text-amber-400" />
                                    </div>
                                    <p className="text-amber-300 font-bold text-sm text-center">Solicitud en revisión</p>
                                    <p className="text-slate-400 text-xs text-center leading-relaxed">Estamos verificando tu cédula en el Registro Nacional de Profesionistas (SEP) y revisando tu INE. Te notificaremos en 24-48 horas.</p>
                                </div>
                            )}
                            {canStartVerification && (
                                <button
                                    onClick={() => setStep('cedula')}
                                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white font-bold py-3 rounded-xl transition-all text-sm"
                                >
                                    Iniciar Verificación <ChevronRight size={16} />
                                </button>
                            )}
                        </div>
                    )}

                    {/* --- STEP: CEDULA REVIEW --- */}
                    {step === 'cedula' && (
                        <div className="space-y-4">
                            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                                <p className="text-xs text-blue-300 leading-relaxed">
                                    <strong>Paso 1 de 3: Confirma tu identidad</strong><br />
                                    Ingresa los datos exactos que aparecen en tu cédula. Los verificaremos en el Registro Nacional de Profesionistas (SEP).
                                </p>
                            </div>

                            {editMode ? (
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 mb-1">Nombre Completo</label>
                                        <input
                                            type="text"
                                            value={nameInput}
                                            onChange={e => setNameInput(e.target.value)}
                                            placeholder="Ej. Dr. Juan Pérez García"
                                            className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 mb-1">Cédula Profesional</label>
                                        <input
                                            type="text"
                                            value={cedulaInput}
                                            onChange={e => setCedulaInput(e.target.value)}
                                            placeholder="Ej. 12345678"
                                            className="w-full bg-slate-800 border border-slate-700 text-white font-mono rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 bg-slate-800/60 rounded-xl p-3 border border-slate-600/40">
                                    <IdCard size={20} className="text-teal-400 shrink-0" />
                                    <div>
                                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Cédula Profesional</p>
                                        <p className="text-white font-mono font-bold">{cedulaInput}</p>
                                    </div>
                                </div>
                            )}

                            {error && (
                                <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-3 py-2">
                                    <AlertCircle size={14} className="text-red-400 shrink-0 mt-0.5" />
                                    <p className="text-red-300 text-xs">{error}</p>
                                </div>
                            )}

                            <button
                                onClick={startCamera}
                                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white font-bold py-3 rounded-xl transition-all text-sm"
                            >
                                Confirmar — Tomar Selfie <ChevronRight size={16} />
                            </button>
                        </div>
                    )}

                    {/* --- STEP: SELFIE --- */}
                    {step === 'selfie' && (
                        <div className="space-y-4">
                            <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                                <p className="text-xs text-purple-300 leading-relaxed">
                                    <strong>Paso 2 de 3: Selfie biométrica</strong><br />
                                    Toma una foto de tu cara con buena iluminación. La compararemos con tu INE para verificar tu identidad.
                                </p>
                            </div>

                            <div className="relative rounded-xl bg-slate-800 overflow-hidden aspect-square flex items-center justify-center border border-slate-600/30">
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
                                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-500 bg-slate-800 z-10">
                                                <Camera size={32} />
                                                <p className="text-xs">Cámara no activa</p>
                                            </div>
                                        )}
                                    </>
                                )}
                                {/* Face guide overlay */}
                                {cameraOn && !selfieDataUrl && (
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                                        <div className="w-40 h-40 rounded-full border-4 border-teal-400/60 border-dashed" />
                                    </div>
                                )}
                            </div>

                            {error && (
                                <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-3 py-2">
                                    <AlertCircle size={14} className="text-red-400 shrink-0 mt-0.5" />
                                    <p className="text-red-300 text-xs">{error}</p>
                                </div>
                            )}

                            <div className="flex gap-2">
                                {!selfieDataUrl && !cameraOn && (
                                    <button onClick={startCamera} className="flex-1 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-bold py-2.5 rounded-xl text-sm transition-all">
                                        <Camera size={16} /> Abrir Cámara
                                    </button>
                                )}
                                {cameraOn && !selfieDataUrl && (
                                    <button onClick={takeSelfie} className="flex-1 flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-500 text-white font-bold py-2.5 rounded-xl text-sm transition-all">
                                        <Camera size={16} /> Tomar Foto
                                    </button>
                                )}
                                {selfieDataUrl && (
                                    <>
                                        <button onClick={retakeSelfie} className="flex items-center justify-center gap-1.5 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2.5 px-4 rounded-xl text-sm transition-all">
                                            <RotateCcw size={14} /> Repetir
                                        </button>
                                        <button onClick={() => { setError(''); setStep('ine'); }} className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white font-bold py-2.5 rounded-xl text-sm transition-all">
                                            Continuar <ChevronRight size={16} />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* --- STEP: INE UPLOAD --- */}
                    {step === 'ine' && (
                        <div className="space-y-4">
                            <div className="p-3 bg-teal-500/10 border border-teal-500/20 rounded-xl">
                                <p className="text-xs text-teal-300 leading-relaxed">
                                    <strong>Paso 3 de 3: Sube tu INE</strong><br />
                                    Sube una foto clara (frontal) de tu INE/IFE vigente. Máx. 10 MB. JPG, PNG o PDF.
                                </p>
                            </div>

                            <input ref={ineInputRef} type="file" accept="image/*,.pdf" className="hidden" onChange={handleIneFile} />

                            {inePreview ? (
                                <div className="relative rounded-xl overflow-hidden border border-slate-600/30">
                                    {ineFile?.type === 'application/pdf' ? (
                                        <div className="flex flex-col items-center gap-2 py-8 bg-slate-800/60">
                                            <IdCard size={32} className="text-teal-400" />
                                            <p className="text-xs text-slate-300 font-medium">{ineFile.name}</p>
                                        </div>
                                    ) : (
                                        <img src={inePreview} alt="INE" className="w-full max-h-48 object-contain bg-slate-800" />
                                    )}
                                    <button onClick={() => { setIneFile(null); setInePreview(null); }} className="absolute top-2 right-2 p-1 bg-red-500/80 rounded-full text-white hover:bg-red-500 transition-colors">
                                        <X size={12} />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => ineInputRef.current?.click()}
                                    className="w-full border-2 border-dashed border-slate-600 hover:border-teal-400/50 rounded-xl p-8 flex flex-col items-center gap-2 text-slate-500 hover:text-teal-400 transition-all"
                                >
                                    <Upload size={24} />
                                    <span className="text-xs font-medium">Seleccionar INE</span>
                                </button>
                            )}

                            {error && (
                                <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-3 py-2">
                                    <AlertCircle size={14} className="text-red-400 shrink-0 mt-0.5" />
                                    <p className="text-red-300 text-xs">{error}</p>
                                </div>
                            )}

                            <button
                                onClick={handleSubmit}
                                disabled={uploading || !ineFile}
                                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white font-bold py-3 rounded-xl transition-all text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {uploading ? <><Loader2 size={16} className="animate-spin" /> Enviando...</> : <><ShieldCheck size={16} /> Enviar para Verificación</>}
                            </button>
                        </div>
                    )}

                    {/* --- STEP: DONE --- */}
                    {step === 'done' && (
                        <div className="flex flex-col items-center gap-4 py-6">
                            <div className="w-16 h-16 rounded-full bg-teal-500/10 border border-teal-500/30 flex items-center justify-center">
                                <CheckCircle2 size={32} className="text-teal-400" />
                            </div>
                            <div className="text-center">
                                <p className="text-white font-bold text-sm">¡Solicitud enviada!</p>
                                <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                                    Verificaremos tu cédula en el Registro Nacional de Profesionistas (SEP) y revisaremos tu INE.<br />
                                    <span className="text-teal-400 font-semibold">Te notificaremos en 24-48 horas.</span>
                                </p>
                            </div>
                            <button onClick={onClose} className="px-8 py-2.5 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl text-sm transition-all">
                                Cerrar
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DoctorProfileModal;

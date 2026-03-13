import React, { useState } from 'react';
import { supabase } from '../utils/supabase';
import { IdCard, User, AlertCircle, Loader2, Save } from 'lucide-react';

interface CompleteProfileModalProps {
    session: any;
    defaultName?: string;
    onComplete: (newName: string, newCedula: string) => void;
}

export const CompleteProfileModal: React.FC<CompleteProfileModalProps> = ({ session, defaultName, onComplete }) => {
    const [fullName, setFullName] = useState(defaultName || '');
    const [cedula, setCedula] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (fullName.trim().length < 3) return setError('El nombre debe tener al menos 3 caracteres.');
        if (cedula.trim().length < 4) return setError('Ingresa una Cédula Profesional válida.');

        setLoading(true);

        try {
            // First check if cedula is already in use
            const { data: existingProfiles, error: checkError } = await supabase
                .from('profiles')
                .select('id')
                .eq('cedula_profesional', cedula.trim());

            if (checkError) throw checkError;
            if (existingProfiles && existingProfiles.length > 0 && existingProfiles[0].id !== session.user.id) {
                throw new Error('Esta Cédula Profesional ya está registrada en otra cuenta.');
            }

            // Update profile
            const { error: updateError } = await supabase
                .from('profiles')
                .update({
                    full_name: fullName.trim(),
                    cedula_profesional: cedula.trim()
                })
                .eq('id', session.user.id);

            if (updateError) throw updateError;

            // Success
            onComplete(fullName.trim(), cedula.trim());
        } catch (err: any) {
            setError(err.message || 'Ocurrió un error al guardar los datos.');
        } finally {
            setLoading(false);
        }
    };

    const inputClass = `w-full bg-slate-800/60 border border-slate-600/50 rounded-xl px-4 py-3 text-white placeholder-slate-400 
    focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400/50 transition-all text-sm`;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
            <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl shadow-teal-900/20 overflow-hidden outline outline-4 outline-slate-800/50">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-400 via-cyan-400 to-indigo-500" />

                <div className="px-8 pt-8 pb-4">
                    <h2 className="text-xl font-black text-white tracking-tight">Completa tu Perfil</h2>
                    <p className="text-slate-400 text-sm mt-1 leading-relaxed">
                        Para usar VPO Digital de forma segura y evitar cuentas duplicadas, debes ingresar tu <b>Nombre</b> y <b>Cédula Profesional</b>.
                    </p>
                </div>

                <div className="px-8 pb-8">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400 px-1">Nombre Completo</label>
                            <div className="relative">
                                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={e => setFullName(e.target.value)}
                                    placeholder="Dr. Juan Pérez"
                                    required
                                    className={`${inputClass} pl-11`}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400 px-1">Cédula Profesional</label>
                            <div className="relative">
                                <IdCard size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    value={cedula}
                                    onChange={e => setCedula(e.target.value)}
                                    placeholder="Ej. 12345678"
                                    required
                                    className={`${inputClass} pl-11 font-mono`}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-3 py-2.5">
                                <AlertCircle size={14} className="text-red-400 shrink-0 mt-0.5" />
                                <p className="text-red-300 text-xs leading-relaxed">{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || !cedula.trim() || !fullName.trim()}
                            className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 
                            text-white font-bold py-3 mt-4 rounded-xl transition-all shadow-lg shadow-teal-900/30 
                            hover:shadow-teal-800/40 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed text-sm
                            flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <><Loader2 size={16} className="animate-spin" /> Guardando...</>
                            ) : (
                                <><Save size={16} /> Completar Perfil y Continuar</>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

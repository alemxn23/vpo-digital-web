import React, { useState } from 'react';
import { supabase } from '../utils/supabase';
import { Lock, Loader2, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';

export const UpdatePasswordModal = () => {
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!supabase) return;
        if (password.length < 6) return setError('La contraseña debe tener al menos 6 caracteres.');

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const { error } = await supabase.auth.updateUser({ password });
            if (error) throw error;

            setSuccess('Contraseña actualizada correctamente. Redirigiendo...');
            setTimeout(() => {
                window.location.href = '/';
            }, 2000);
        } catch (err: any) {
            setError(err.message || 'Error al actualizar contraseña');
        } finally {
            setLoading(false);
        }
    };

    const inputClass = `w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 
    focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all text-sm`;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="relative w-full max-w-md bg-white border border-slate-200/80 rounded-2xl shadow-2xl overflow-hidden">
                <div className="px-8 pt-8 pb-4">
                    <div className="flex items-center gap-2 mb-2">
                        <img src="/logo.png?v=9" alt="VPO Digital" className="h-6 w-auto object-contain" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 tracking-tight mt-4">Crear nueva contraseña</h2>
                    <p className="text-slate-500 text-sm mt-1">Escribe tu nueva clave de acceso.</p>
                </div>

                <div className="px-8 pb-8">
                    <form onSubmit={handleUpdate} className="space-y-4">
                        <div className="relative mt-2">
                            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="Nueva contraseña (mín. 6 caracteres)"
                                required
                                className={`${inputClass} pl-11 pr-11`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>

                        {error && (
                            <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
                                <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
                                <p className="text-red-800 text-xs font-medium leading-relaxed">{error}</p>
                            </div>
                        )}
                        {success && (
                            <div className="flex items-start gap-2 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2.5">
                                <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                                <p className="text-emerald-800 text-xs font-medium leading-relaxed">{success}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || !!success}
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl transition-all shadow-sm
                            disabled:opacity-60 disabled:cursor-not-allowed mt-4 text-[13px] tracking-wide"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Loader2 size={16} className="animate-spin" />
                                    Actualizando...
                                </span>
                            ) : !!success ? (
                                <span className="flex items-center justify-center gap-2">
                                    <CheckCircle2 size={16} />
                                    Hecho
                                </span>
                            ) : (
                                'Actualizar Contraseña'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

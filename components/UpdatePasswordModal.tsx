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

    const inputClass = `w-full bg-slate-800/60 border border-slate-600/50 rounded-xl px-4 py-3 text-white placeholder-slate-400 
    focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400/50 transition-all text-sm`;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl shadow-teal-900/20 overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-400 via-cyan-400 to-indigo-500" />

                <div className="px-8 pt-8 pb-4">
                    <h2 className="text-xl font-black text-white tracking-tight">VPO Digital</h2>
                    <p className="text-slate-400 text-sm mt-0.5">Crear nueva contraseña</p>
                </div>

                <div className="px-8 pb-8">
                    <form onSubmit={handleUpdate} className="space-y-4">
                        <div className="relative relative mt-4">
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
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>

                        {error && (
                            <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-3 py-2.5">
                                <AlertCircle size={14} className="text-red-400 shrink-0 mt-0.5" />
                                <p className="text-red-300 text-xs leading-relaxed">{error}</p>
                            </div>
                        )}
                        {success && (
                            <div className="flex items-start gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-3 py-2.5">
                                <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                                <p className="text-emerald-300 text-xs leading-relaxed">{success}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || !!success}
                            className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 
                            text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-teal-900/30 
                            hover:shadow-teal-800/40 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed mt-2 text-sm"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Loader2 size={16} className="animate-spin" />
                                    Actualizando...
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

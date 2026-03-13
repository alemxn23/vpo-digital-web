import React, { useState } from 'react';
import { supabase } from '../utils/supabase';
import { Mail, Lock, IdCard, Loader2, AlertCircle, CheckCircle2, Eye, EyeOff, ArrowLeft, Stethoscope } from 'lucide-react';

interface AuthModalProps {
    onClose?: () => void;
    onBack?: () => void;
}

const GoogleIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
);

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onBack }) => {
    type Tab = 'login' | 'register' | 'forgot_password';
    const [tab, setTab] = useState<Tab>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [cedula, setCedula] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const clearMessages = () => { setError(''); setSuccess(''); };

    const handleGoogleLogin = async () => {
        if (!supabase) return setError('Servicio no disponible.');
        setGoogleLoading(true);
        clearMessages();
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin,
                    queryParams: { access_type: 'offline', prompt: 'consent' }
                }
            });
            if (error) throw error;
        } catch (err: any) {
            setError(err.message || 'Error al conectar con Google');
            setGoogleLoading(false);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!supabase) return setError('Servicio no disponible.');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) return setError('Ingresa un correo electrónico válido.');
        setLoading(true);
        clearMessages();
        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) {
                if (error.message.includes('Invalid login credentials')) {
                    throw new Error('Correo o contraseña incorrectos.');
                }
                throw error;
            }
            // Auth state change will be handled by AuthGuard
        } catch (err: any) {
            setError(err.message || 'Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!supabase) return setError('Servicio no disponible.');
        if (!email) return setError('Ingresa tu correo electrónico.');
        setLoading(true);
        clearMessages();
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });
            if (error) throw error;
            setSuccess('Si el correo existe, recibirás un enlace para restablecer tu contraseña.');
        } catch (err: any) {
            setError(err.message || 'Error al solicitar cambio de contraseña');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!supabase) return setError('Servicio no disponible.');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) return setError('Ingresa un correo electrónico válido.');
        if (!fullName.trim() || fullName.trim().length < 3) return setError('El nombre completo es requerido (mín. 3 caracteres).');
        if (!cedula.trim()) return setError('La Cédula Profesional es requerida.');
        if (cedula.trim().length < 4) return setError('La Cédula Profesional no es válida.');
        if (password.length < 6) return setError('La contraseña debe tener al menos 6 caracteres.');

        setLoading(true);
        clearMessages();
        try {
            // 1. Check if cedula already exists
            const { data: existing } = await supabase
                .from('profiles')
                .select('id')
                .eq('cedula_profesional', cedula.trim())
                .maybeSingle();

            if (existing) {
                throw new Error('Esta Cédula Profesional ya está registrada. Si es tuya, inicia sesión con tu correo.');
            }

            // 2. Create auth user
            const { data, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: window.location.origin
                }
            });

            if (signUpError) {
                if (
                    signUpError.status === 400 ||
                    (signUpError as any).code === 'user_already_exists' ||
                    signUpError.message.toLowerCase().includes('already registered') ||
                    signUpError.message.toLowerCase().includes('already been registered')
                ) {
                    throw new Error('Este correo ya está registrado. Usa "Iniciar Sesión".');
                }
                throw signUpError;
            }

            // 3. Insert profile with cedula
            if (data.user) {
                const { error: profileError } = await supabase.from('profiles').upsert({
                    id: data.user.id,
                    full_name: fullName.trim(),
                    cedula_profesional: cedula.trim(),
                    plan_type: 'free',
                    paid_credits: 0,
                    free_vpos_used_today: 0,
                    last_vpo_date: null,
                    verification_status: 'unverified',
                    verified: false
                });

                if (profileError && profileError.code === '23505') {
                    // Unique violation on cedula
                    throw new Error('Esta Cédula Profesional ya está en uso.');
                }
            }

            if (data.session) {
                // User is auto-confirmed, auth guard will pick it up
            } else {
                setSuccess('✅ Registro exitoso. Revisa tu correo para confirmar tu cuenta.');
            }
        } catch (err: any) {
            setError(err.message || 'Error al registrar usuario');
        } finally {
            setLoading(false);
        }
    };

    const inputClass = `w-full bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder-slate-500 
    focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400/50 transition-all text-sm`;

    const goBack = onBack || onClose;

    return (
        <div className="min-h-screen bg-slate-950 flex" style={{ fontFamily: "'Inter', sans-serif" }}>
            {/* ── LEFT PANEL: Auth Form ── */}
            <div className="w-full lg:w-1/2 flex flex-col min-h-screen">
                {/* Top bar */}
                <div className="flex items-center justify-between px-8 py-6">
                    <img
                        src="/logo.png?v=9"
                        alt="VPO Digital"
                        className="h-10 w-auto object-contain"
                    />
                    {goBack && (
                        <button
                            onClick={goBack}
                            className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm font-medium transition-colors"
                        >
                            <ArrowLeft size={16} />
                            Volver
                        </button>
                    )}
                </div>

                {/* Form Section */}
                <div className="flex-1 flex items-center justify-center px-8 pb-12">
                    <div className="w-full max-w-sm">
                        {/* Heading */}
                        <div className="mb-8">
                            <h1 className="text-2xl font-black text-white tracking-tight mb-1">
                                {tab === 'login' && 'Bienvenido de nuevo'}
                                {tab === 'register' && 'Crea tu cuenta'}
                                {tab === 'forgot_password' && 'Recuperar contraseña'}
                            </h1>
                            <p className="text-slate-400 text-sm">
                                {tab === 'login' && 'Inicia sesión en tu cuenta'}
                                {tab === 'register' && 'Regístrate para comenzar a usar VPO Digital'}
                                {tab === 'forgot_password' && 'Ingresa tu correo y te enviaremos un enlace'}
                            </p>
                        </div>

                        {/* Google Button */}
                        {tab !== 'forgot_password' && (
                            <>
                                <button
                                    onClick={handleGoogleLogin}
                                    disabled={googleLoading || loading}
                                    className="w-full flex items-center justify-center gap-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium py-3 px-4 rounded-xl 
                                    border border-slate-700/50 transition-all text-sm hover:border-slate-600 disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {googleLoading ? <Loader2 size={18} className="animate-spin" /> : <GoogleIcon />}
                                    {googleLoading ? 'Conectando...' : 'Continuar con Google'}
                                </button>

                                <div className="flex items-center gap-3 my-5">
                                    <div className="flex-1 h-px bg-slate-800" />
                                    <span className="text-slate-500 text-xs font-medium">o</span>
                                    <div className="flex-1 h-px bg-slate-800" />
                                </div>
                            </>
                        )}

                        {/* Form */}
                        <form
                            onSubmit={
                                tab === 'login' ? handleLogin :
                                    tab === 'register' ? handleRegister :
                                        handleForgotPassword
                            }
                            className="space-y-3"
                        >
                            {/* Full name (register only) */}
                            {tab === 'register' && (
                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 mb-1.5 ml-1">Nombre completo</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={fullName}
                                            onChange={e => setFullName(e.target.value)}
                                            placeholder="Dr. Juan García López"
                                            required
                                            className={inputClass}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Email */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 mb-1.5 ml-1">Correo electrónico</label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        placeholder="correo@ejemplo.com"
                                        required
                                        className={inputClass}
                                    />
                                </div>
                            </div>

                            {/* Cédula (register only) */}
                            {tab === 'register' && (
                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 mb-1.5 ml-1">Cédula Profesional</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={cedula}
                                            onChange={e => setCedula(e.target.value)}
                                            placeholder="ej. 14098958"
                                            required
                                            className={inputClass}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Password (Login & Register only) */}
                            {tab !== 'forgot_password' && (
                                <div>
                                    <div className="flex items-center justify-between mb-1.5 ml-1">
                                        <label className="block text-xs font-semibold text-slate-400">Contraseña</label>
                                        {tab === 'login' && (
                                            <button
                                                type="button"
                                                onClick={() => { setTab('forgot_password'); clearMessages(); }}
                                                className="text-xs font-semibold text-teal-400 hover:text-teal-300 transition-colors"
                                            >
                                                ¿Olvidaste tu contraseña?
                                            </button>
                                        )}
                                    </div>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            placeholder={tab === 'register' ? 'Mín. 6 caracteres' : '••••••••'}
                                            required
                                            className={`${inputClass} pr-11`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Back to login (Forgot password only) */}
                            {tab === 'forgot_password' && (
                                <div className="flex justify-start pb-1">
                                    <button
                                        type="button"
                                        onClick={() => { setTab('login'); clearMessages(); }}
                                        className="text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1"
                                    >
                                        ← Volver a iniciar sesión
                                    </button>
                                </div>
                            )}

                            {/* Register note */}
                            {tab === 'register' && (
                                <p className="text-[11px] text-slate-500 leading-relaxed">
                                    🔐 Tu Cédula Profesional es única a tu cuenta y previene registros duplicados.
                                </p>
                            )}

                            {/* Forgot password note */}
                            {tab === 'forgot_password' && (
                                <p className="text-[11px] text-slate-500 leading-relaxed">
                                    Ingresa tu correo y te enviaremos un enlace para crear una nueva contraseña.
                                </p>
                            )}

                            {/* Error / Success */}
                            {error && (
                                <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5">
                                    <AlertCircle size={14} className="text-red-400 shrink-0 mt-0.5" />
                                    <p className="text-red-300 text-xs leading-relaxed">{error}</p>
                                </div>
                            )}
                            {success && (
                                <div className="flex items-start gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2.5">
                                    <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                                    <p className="text-emerald-300 text-xs leading-relaxed">{success}</p>
                                </div>
                            )}

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading || googleLoading}
                                className="w-full bg-teal-500 hover:bg-teal-400 text-white font-bold py-3 rounded-xl transition-all 
                                shadow-lg shadow-teal-900/30 disabled:opacity-60 disabled:cursor-not-allowed text-sm mt-2"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <Loader2 size={16} className="animate-spin" />
                                        {tab === 'login' ? 'Iniciando...' : tab === 'register' ? 'Registrando...' : 'Enviando...'}
                                    </span>
                                ) : (
                                    tab === 'login' ? 'Iniciar Sesión' : tab === 'register' ? 'Crear Cuenta' : 'Recuperar Contraseña'
                                )}
                            </button>
                        </form>

                        {/* Switch between login/register */}
                        <div className="mt-6 text-center">
                            {tab === 'login' ? (
                                <p className="text-slate-500 text-sm">
                                    ¿No tienes cuenta?{' '}
                                    <button
                                        onClick={() => { setTab('register'); clearMessages(); }}
                                        className="text-white font-semibold hover:underline"
                                    >
                                        Regístrate
                                    </button>
                                </p>
                            ) : tab === 'register' ? (
                                <p className="text-slate-500 text-sm">
                                    ¿Ya tienes cuenta?{' '}
                                    <button
                                        onClick={() => { setTab('login'); clearMessages(); }}
                                        className="text-white font-semibold hover:underline"
                                    >
                                        Inicia sesión
                                    </button>
                                </p>
                            ) : null}
                        </div>

                        {/* Register footer note */}
                        {tab === 'register' && (
                            <p className="text-center text-slate-600 text-[10px] mt-5 leading-relaxed max-w-xs mx-auto">
                                Al registrarte verificaremos tu cédula en el Registro Nacional de Profesionistas (SEP).
                                Tu cuenta estará activa al instante.
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* ── RIGHT PANEL: Branding / Testimonial ── */}
            <div className="hidden lg:flex w-1/2 relative overflow-hidden">
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900 to-teal-950" />
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-900/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-900/15 rounded-full blur-[100px]" />

                {/* Border left */}
                <div className="absolute left-0 top-0 bottom-0 w-px bg-slate-800" />

                {/* Content */}
                <div className="relative z-10 flex items-center justify-center p-16 w-full">
                    <div className="max-w-md">
                        {/* Quote marks */}
                        <div className="text-teal-500/30 text-8xl font-serif leading-none mb-4 select-none">"</div>

                        {/* Testimonial */}
                        <blockquote className="text-white text-2xl md:text-3xl font-bold leading-snug mb-8 -mt-6">
                            Ahora tardo menos de 5 minutos en generar una VPO completa con todas las escalas. Antes me tomaba media hora por paciente.
                        </blockquote>

                        {/* Author */}
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-teal-900/50">
                                <Stethoscope size={22} className="text-white" />
                            </div>
                            <div>
                                <p className="text-white font-bold text-sm">Médico Internista</p>
                                <p className="text-slate-400 text-xs">Hospital General, México</p>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="mt-12 pt-8 border-t border-slate-800/60 grid grid-cols-3 gap-6">
                            <div>
                                <p className="text-teal-400 text-2xl font-black">14</p>
                                <p className="text-slate-500 text-xs font-medium mt-0.5">Escalas de Riesgo</p>
                            </div>
                            <div>
                                <p className="text-teal-400 text-2xl font-black">&lt;5 min</p>
                                <p className="text-slate-500 text-xs font-medium mt-0.5">Por VPO</p>
                            </div>
                            <div>
                                <p className="text-teal-400 text-2xl font-black">PDF</p>
                                <p className="text-slate-500 text-xs font-medium mt-0.5">Institucional</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

import React from 'react';
import {
    ChevronRight, BarChart3, FileText, CloudUpload,
    ClipboardCheck, Shield, Zap, LogIn, ArrowRight
} from 'lucide-react';

interface LandingPageProps {
    onShowAuth: (tab: 'login' | 'register') => void;
}

const FeatureCard = ({
    icon: Icon, title, desc
}: { icon: any; title: string; desc: string }) => (
    <div className="group p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.1] transition-all duration-500">
        <div className="w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center mb-4 group-hover:bg-white/[0.1] transition-colors duration-500">
            <Icon size={20} className="text-white/70 group-hover:text-white transition-colors duration-500" strokeWidth={1.5} />
        </div>
        <h3 className="text-white font-semibold text-[15px] mb-2 tracking-tight">{title}</h3>
        <p className="text-white/60 text-sm leading-relaxed font-light">{desc}</p>
    </div>
);




export const LandingPage: React.FC<LandingPageProps> = ({ onShowAuth }) => {
    return (
        <div className="min-h-screen bg-[#050505] text-white antialiased" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>

            {/* ── NAVBAR ── */}
            <nav className="relative z-10 flex items-center justify-between px-6 md:px-16 py-4 max-w-7xl mx-auto border-b border-white/[0.08]">
                <div className="flex items-center gap-1">
                    <img
                        src="/logo.png?v=9"
                        alt="VPO Digital"
                        className="h-10 w-auto object-contain opacity-90 mr-4"
                    />
                    <a
                        href="#pricing"
                        onClick={(e) => { e.preventDefault(); document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }); }}
                        className="text-white/60 hover:text-white text-sm font-medium transition-all duration-300 px-4 py-2 rounded-xl hover:bg-white/[0.06]"
                    >
                        Planes
                    </a>
                    <a
                        href="mailto:mcfidel98@gmail.com"
                        className="text-white/60 hover:text-white text-sm font-medium transition-all duration-300 px-4 py-2 rounded-xl hover:bg-white/[0.06]"
                    >
                        Soporte
                    </a>
                </div>
                <button
                    onClick={() => onShowAuth('login')}
                    className="flex items-center gap-2 text-white hover:text-slate-300 text-sm font-medium 
              transition-all duration-300 px-4 py-2 rounded-xl hover:bg-white/[0.06]"
                >
                    <LogIn size={15} strokeWidth={1.5} />
                    Iniciar Sesión
                </button>
            </nav>

            {/* ── HERO ── */}
            <section className="relative z-10 pt-24 pb-32 px-6 md:px-16 max-w-7xl mx-auto">
                <div className="max-w-3xl mx-auto text-center">

                    <h1 className="text-5xl md:text-7xl font-bold leading-[1.05] tracking-tight mb-6">
                        Valoración{' '}
                        <br className="hidden md:block" />
                        Preoperatoria{' '}
                        <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Digital</span>
                    </h1>

                    <p className="text-white/60 text-lg md:text-xl leading-relaxed mb-10 max-w-xl mx-auto font-light">
                        Genera VPOs institucionales completas con escalas de riesgo validadas, notas médicas automáticas y exportación a PDF en segundos.
                    </p>

                    {/* CTA */}
                    <div className="flex flex-col sm:flex-row gap-3 justify-center mb-16">
                        <button
                            onClick={() => onShowAuth('login')}
                            className="flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium px-8 py-3.5 rounded-xl 
                            transition-all duration-300 hover:from-cyan-400 hover:to-blue-400 hover:shadow-lg hover:shadow-cyan-900/30 text-[15px]"
                        >
                            Comenzar Ahora
                            <ArrowRight size={16} strokeWidth={2} />
                        </button>
                    </div>

                    {/* Scales — Infinite marquee */}
                    <style>{`
                        @keyframes marquee {
                            from { transform: translateX(0); }
                            to   { transform: translateX(-50%); }
                        }
                        .marquee-track { animation: marquee 28s linear infinite; }
                        .marquee-track:hover { animation-play-state: paused; }
                    `}</style>
                    <div
                        className="w-full overflow-hidden"
                        style={{
                            maskImage: 'linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)',
                            WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)'
                        }}
                    >
                        <div className="flex marquee-track" style={{ width: 'max-content' }}>
                            {/* Two identical sets for seamless loop */}
                            {[...Array(2)].map((_, setIdx) => (
                                <div key={setIdx} className="flex gap-2 pr-2" aria-hidden={setIdx === 1}>
                                    {['ASA', 'LEE', 'Goldman', 'Caprini', 'ARISCAT', 'Gupta', 'STOP-BANG', 'CFS', 'METs', 'Duke', 'CHA₂DS₂', 'HAS-BLED', 'Khorana', 'NSQIP'].map(s => (
                                        <span
                                            key={s}
                                            className="inline-flex items-center px-3 py-1 bg-white/[0.07] border border-white/[0.15] 
                                            rounded-full text-[11px] font-medium text-white/90 tracking-wide whitespace-nowrap"
                                        >
                                            {s}
                                        </span>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Badge */}
                    <p className="text-white/50 text-xs font-medium tracking-wide mt-8">Plataforma Médica Certificada</p>
                </div>
            </section>

            {/* ── STATS BAR ── */}
            <section className="relative z-10 border-y border-white/[0.06] py-12 px-6">
                <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    {[
                        { value: '14', label: 'Escalas de Riesgo' },
                        { value: '<5 min', label: 'Por valoración' },
                        { value: 'PDF', label: 'Formato institucional' },
                        { value: '100%', label: 'Automatizado' },
                    ].map((stat, i) => (
                        <div key={i}>
                            <p className="text-white text-2xl md:text-3xl font-bold tracking-tight">{stat.value}</p>
                            <p className="text-white/50 text-xs font-medium mt-1 tracking-wide">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── FEATURES ── */}
            <section className="relative z-10 py-24 px-6 md:px-16">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <p className="text-white/50 text-xs font-medium uppercase tracking-[0.2em] mb-4">Características</p>
                        <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">Todo lo que necesitas</h2>
                        <p className="text-white/50 max-w-md mx-auto font-light">Diseñado por médicos, para médicos. Sin curva de aprendizaje.</p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <FeatureCard
                            icon={BarChart3} title="14 Escalas de Riesgo"
                            desc="ASA, Goldman, Lee, Caprini, ARISCAT, Gupta, CFS, METs, STOP-BANG, Duke, CHA₂DS₂-VASc, HAS-BLED, Khorana y NSQIP — todas calculadas automáticamente."
                        />
                        <FeatureCard
                            icon={FileText} title="PDF Institucional"
                            desc="Exporta la valoración como un documento profesional de 2 páginas listo para firma y archivo en expediente clínico."
                        />
                        <FeatureCard
                            icon={CloudUpload} title="Google Drive"
                            desc="Sube el PDF y las imágenes de ECG y RX directamente a tu carpeta de Drive desde la app."
                        />
                        <FeatureCard
                            icon={ClipboardCheck} title="Nota Médica Auto"
                            desc="Genera la nota de valoración completa en segundos, lista para copiar al expediente electrónico."
                        />
                        <FeatureCard
                            icon={Shield} title="Acceso Seguro"
                            desc="Autenticación con Cédula Profesional única. Un registro por médico. Tus datos protegidos con Supabase."
                        />
                        <FeatureCard
                            icon={Zap} title="Tiempo Real"
                            desc="Todos los puntajes de riesgo se actualizan mientras llenas los datos del paciente. Sin botones, sin espera."
                        />
                    </div>
                </div>
            </section>

            {/* ── PRICING ── */}
            <section id="pricing" className="relative z-10 py-24 px-6 md:px-16 border-t border-white/[0.06]">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <p className="text-white/50 text-xs font-medium uppercase tracking-[0.2em] mb-4">PLANES</p>
                        <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">Simple y transparente</h2>
                        <p className="text-white/50 font-light">Comienza gratis. Escala cuando lo necesites.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

                        {/* ── Card 1: Gratuito ── */}
                        <div className="group flex flex-col rounded-2xl border border-white/[0.08] bg-white/[0.02] p-7 transition-all duration-500 hover:border-white/[0.15] hover:bg-white/[0.04] h-full">
                            <p className="text-white/60 text-sm font-medium mb-2">Gratuito</p>
                            <div className="flex items-end gap-1.5 mb-6">
                                <span className="text-white text-4xl font-bold tracking-tight">$0</span>
                                <span className="text-white/40 text-xs mb-1.5">/mes</span>
                            </div>
                            <ul className="space-y-3 mb-8 flex-1">
                                {['1 VPO gratuita por día', 'Todas las escalas de riesgo', 'Exportación a PDF', 'Nota médica automática', 'Google Drive (1/día)'].map((f, i) => (
                                    <li key={i} className="flex items-start gap-2.5 text-[13px]">
                                        <svg className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span className="text-white/70">{f}</span>
                                    </li>
                                ))}
                            </ul>
                            <button
                                onClick={() => onShowAuth('login')}
                                className="w-full py-2.5 rounded-xl font-medium text-sm bg-white/[0.06] text-white/70 border border-white/[0.08] 
                                hover:bg-white/[0.1] hover:text-white hover:border-white/[0.15] transition-all duration-300 mt-auto"
                            >
                                Comenzar Gratis
                            </button>
                        </div>

                        {/* ── Card 2: Starter ── */}
                        <div className="group flex flex-col rounded-2xl border border-white/[0.08] bg-white/[0.02] p-7 transition-all duration-500 hover:border-white/[0.15] hover:bg-white/[0.04] h-full">
                            <p className="text-white/60 text-sm font-medium mb-2">Starter</p>
                            <div className="flex items-end gap-1.5 mb-6">
                                <span className="text-white text-4xl font-bold tracking-tight">$250</span>
                                <span className="text-white/40 text-xs mb-1.5">MXN / pago único</span>
                            </div>
                            <ul className="space-y-3 mb-8 flex-1">
                                {['5 reportes PDF', 'Generación instantánea', 'Sin caducidad', 'Datos seguros en la nube'].map((f, i) => (
                                    <li key={i} className="flex items-start gap-2.5 text-[13px]">
                                        <svg className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span className="text-white/70">{f}</span>
                                    </li>
                                ))}
                            </ul>
                            <button
                                onClick={() => onShowAuth('login')}
                                className="w-full py-2.5 rounded-xl font-medium text-sm bg-white/[0.06] text-white/70 border border-white/[0.08] 
                                hover:bg-white/[0.1] hover:text-white hover:border-white/[0.15] transition-all duration-300 mt-auto"
                            >
                                Comprar Starter
                            </button>
                        </div>

                        {/* ── Card 3: Pro ── */}
                        <div className="group relative flex flex-col rounded-2xl border border-amber-500/20 bg-white/[0.03] p-7 transition-all duration-500 hover:border-amber-500/40 hover:shadow-[0_0_40px_-12px_rgba(245,158,11,0.1)] h-full">
                            {/* Floating badge */}
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold px-4 py-1 rounded-full tracking-widest uppercase">
                                MEJOR VALOR
                            </div>
                            <p className="text-white/60 text-sm font-medium mb-2">Pro</p>
                            <div className="flex items-end gap-1.5 mb-6">
                                <span className="text-white text-4xl font-bold tracking-tight">$400</span>
                                <span className="text-white/40 text-xs mb-1.5">MXN / pago único</span>
                            </div>
                            <ul className="space-y-3 mb-8 flex-1">
                                {['10 reportes PDF', 'Generación instantánea', 'Sin caducidad', 'Datos seguros en la nube'].map((f, i) => (
                                    <li key={i} className="flex items-start gap-2.5 text-[13px]">
                                        <svg className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span className="text-white/70">{f}</span>
                                    </li>
                                ))}
                            </ul>
                            <button
                                onClick={() => onShowAuth('login')}
                                className="w-full py-2.5 rounded-xl font-medium text-sm bg-gradient-to-r from-cyan-500 to-blue-500 text-white 
                                hover:from-cyan-400 hover:to-blue-400 hover:shadow-lg hover:shadow-cyan-900/30 transition-all duration-300 mt-auto"
                            >
                                Comprar Pro
                            </button>
                        </div>

                        {/* ── Card 4: VIP ── */}
                        <div className="group relative flex flex-col rounded-2xl border border-white/[0.12] bg-white/[0.03] p-7 transition-all duration-500 hover:border-cyan-500/30 hover:shadow-[0_0_40px_-12px_rgba(34,211,238,0.12)] h-full">
                            {/* Floating badge */}
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-bold px-4 py-1 rounded-full tracking-widest uppercase shadow-lg">
                                Contactar
                            </div>
                            <p className="text-white/60 text-sm font-medium mb-2">VIP</p>
                            <div className="flex items-end gap-1.5 mb-6">
                                <span className="text-white text-4xl font-bold tracking-tight">---</span>
                            </div>
                            <ul className="space-y-3 mb-8 flex-1">
                                {['VPOs ilimitadas', 'Todo el plan gratuito', 'Soporte prioritario', 'Créditos adicionales', 'Acceso anticipado a funciones'].map((f, i) => (
                                    <li key={i} className="flex items-start gap-2.5 text-[13px]">
                                        <svg className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span className="text-white/70">{f}</span>
                                    </li>
                                ))}
                            </ul>
                            <button
                                onClick={() => window.open('mailto:mcfidel98@gmail.com?subject=Acceso VIP VPO Digital', '_blank')}
                                className="w-full py-2.5 rounded-xl font-medium text-sm bg-gradient-to-r from-cyan-500 to-blue-500 text-white 
                                hover:from-cyan-400 hover:to-blue-400 hover:shadow-lg hover:shadow-cyan-900/30 transition-all duration-300 mt-auto"
                            >
                                Solicitar Acceso
                            </button>
                        </div>

                    </div>
                    <p className="text-center text-white/50 text-sm mt-10 font-light">
                        Los paquetes Starter y Pro son de pago único y no requieren suscripción. Adquiérelos directamente desde tu panel de usuario.
                    </p>
                </div>
            </section>

            {/* ── FOOTER ── */}
            <footer className="relative z-10 border-t border-white/[0.15] py-10 px-6 md:px-16">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                        <img src="/logo.png?v=9" alt="VPO Digital" className="h-12 w-auto object-contain opacity-70" />
                        <span className="text-white/50 text-xs font-light">© {new Date().getFullYear()} Todos los derechos reservados</span>
                    </div>
                    <a href="mailto:mcfidel98@gmail.com" className="text-white/50 hover:text-white/70 text-sm font-light transition-colors duration-300">
                        Soporte
                    </a>
                    <a
                        href="mailto:mcfidel98@gmail.com"
                        title="Desarrollado por Med-Tech Labs"
                        className="flex items-center gap-2"
                    >
                        <span className="text-white/50 text-[10px] font-light uppercase tracking-widest">Powered by</span>
                        <img
                            src="/medtech_logo.png?v=9"
                            alt="Med-Tech Labs"
                            className="h-12 w-auto object-contain"
                        />
                    </a>
                </div>
            </footer>
        </div>
    );
};

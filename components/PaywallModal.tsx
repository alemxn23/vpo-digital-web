import React, { useState, useEffect } from 'react';
import {
    CreditCard, X, ShieldCheck, Zap, Loader2, Star,
    Gift, Calendar, CheckCircle, Lock, Sparkles, TrendingUp,
    Award, FileText, Package, Rocket, Crown, Building2
} from 'lucide-react';
import { supabase } from '../utils/supabase';

// ─── Types ──────────────────────────────────────────────────────────────────

interface PaywallModalProps {
    isOpen: boolean;
    onClose: () => void;
    /** 'paywall' = límite alcanzado, 'account' = ver estatus/comprar créditos */
    mode?: 'paywall' | 'account';
}

interface Profile {
    paid_credits: number;
    free_vpos_used_today: number;
    plan_type: string;
    last_vpo_date: string | null;
}

// ─── Package Card ────────────────────────────────────────────────────────────

const PackageCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    credits: number;
    price: number;
    priceId: string;
    badge?: string;
    highlight?: boolean;
    loading: string | null;
    onBuy: (priceId: string, credits: number, packName: string) => void;
}> = ({ icon, title, credits, price, priceId, badge, highlight, loading, onBuy }) => {
    const packId = `${credits}vpos`;
    const isLoading = loading === packId;
    const perUnit = (price / credits).toFixed(0);

    return (
        <button
            onClick={() => onBuy(priceId, credits, packId)}
            disabled={loading !== null}
            className={`
                relative w-full text-left rounded-2xl border p-5 transition-all duration-200 group
                ${highlight
                    ? 'border-slate-800 bg-slate-900 shadow-xl shadow-slate-900/15 text-white hover:bg-slate-800'
                    : 'border-slate-200 bg-white hover:border-cyan-300/50 hover:shadow-md'}
                ${loading !== null ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer active:scale-[0.98]'}
            `}
        >
            {badge && (
                <span className={`
                    absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-semibold px-3 py-1 rounded-full border
                    ${highlight
                        ? 'bg-emerald-500 text-white border-emerald-400'
                        : 'bg-slate-800 text-white border-slate-700'}
                `}>
                    {badge}
                </span>
            )}

            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                    {icon}
                    <div>
                        <p className={`font-semibold text-base leading-tight ${highlight ? 'text-white' : 'text-slate-800'}`}>
                            {title}
                        </p>
                        <p className={`text-[11px] font-medium ${highlight ? 'text-slate-400' : 'text-slate-400'}`}>
                            ${perUnit} MXN · por VPO
                        </p>
                    </div>
                </div>

                <div className="text-right">
                    <p className={`text-2xl font-bold leading-none tabular-nums ${highlight ? 'text-white' : 'text-slate-800'}`}>
                        ${price}
                    </p>
                    <p className={`text-[10px] font-medium ${highlight ? 'text-slate-400' : 'text-slate-400'}`}>MXN</p>
                </div>
            </div>

            <div className={`flex items-center justify-between pt-3 border-t ${highlight ? 'border-white/10' : 'border-slate-100'}`}>
                <div className="flex items-center gap-1.5">
                    <FileText size={14} className={highlight ? 'text-slate-400' : 'text-slate-500'} />
                    <span className={`text-xs font-medium ${highlight ? 'text-slate-300' : 'text-slate-600'}`}>
                        {credits} reportes PDF
                    </span>
                </div>

                <div className={`
                    flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-all
                    ${highlight
                        ? 'bg-white/10 text-white group-hover:bg-white/20'
                        : 'bg-slate-800 text-white group-hover:bg-slate-700'}
                `}>
                    {isLoading
                        ? <><Loader2 size={14} className="animate-spin" /> Cargando...</>
                        : <><CreditCard size={14} /> Comprar</>
                    }
                </div>
            </div>
        </button>
    );
};

// ─── Main Modal ──────────────────────────────────────────────────────────────

const PaywallModal: React.FC<PaywallModalProps> = ({ isOpen, onClose, mode = 'paywall' }) => {
    const [loading, setLoading] = useState<string | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [isVIP, setIsVIP] = useState(false);
    const [tab, setTab] = useState<'status' | 'buy'>('buy');

    useEffect(() => {
        if (!isOpen) return;
        // Default tab: 'status' when opened from account button, 'buy' from paywall
        setTab(mode === 'account' ? 'status' : 'buy');
        fetchProfile();
    }, [isOpen, mode]);

    const fetchProfile = async () => {
        if (!supabase) return;
        try {
            const { data: authData } = await supabase.auth.getUser();
            const user = authData?.user;
            if (!user) return;

            const { data } = await supabase
                .from('profiles')
                .select('paid_credits, free_vpos_used_today, plan_type, last_vpo_date')
                .eq('id', user.id)
                .single();

            if (data) setProfile(data);
            setIsVIP(user.email === 'mcfidel98@gmail.com');
        } catch (err) {
            console.error('Error fetching profile:', err);
        }
    };

    const handleBuy = async (priceId: string, creditsAmount: number, packName: string) => {
        setLoading(packName);

        // Payment Links directos de Stripe
        const paymentLinks: Record<string, string> = {
            'price_1T4HWkKtp6JiUcWzTNSg9D8h': 'https://buy.stripe.com/dRm4gA7Rs8SxgdV5SW24001', // Starter: 5 VPOs $250 MXN
            'price_1T4HX1Ktp6JiUcWzb6Jm2Utk': 'https://buy.stripe.com/14A6oI5JkecRaTBa9c24002', // Pro: 10 VPOs $400 MXN
        };

        try {
            // Intentar Edge Function primero (si está desplegada y supabase existe)
            if (supabase) {
                const { data, error } = await supabase.functions.invoke('create-checkout-session', {
                    body: {
                        priceId,
                        mode: 'payment',
                        successUrl: `${window.location.origin}/?success=true`,
                        cancelUrl: `${window.location.origin}/?canceled=true`,
                        credits: creditsAmount,
                    }
                });

                if (!error && data?.url) {
                    window.location.href = data.url;
                    return;
                }
            }

            // Fallback: abrir Payment Link directo de Stripe
            const link = paymentLinks[priceId];
            if (link) window.open(link, '_blank');
        } catch (error) {
            console.error('Error creating checkout session:', error);
            // Fallback garantizado: abrir Payment Link de Stripe directamente
            const link = paymentLinks[priceId];
            if (link) {
                window.open(link, '_blank');
            } else {
                alert('Ocurrió un error. Contacta soporte: mcfidel98@gmail.com');
            }
        } finally {
            setLoading(null);
        }
    };

    if (!isOpen) return null;

    const freeUsed = profile?.free_vpos_used_today ?? 0;
    const paidCredits = profile?.paid_credits ?? 0;
    const hasFreeToday = freeUsed < 1;

    return (
        <div
            className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden relative flex flex-col max-h-[95dvh] border border-slate-200/50">

                {/* ── Header ── */}
                <div className="relative bg-white p-6 pb-4 overflow-hidden shrink-0 border-b border-slate-100">

                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors z-10 hover:bg-slate-100 rounded-full p-1.5"
                    >
                        <X size={18} strokeWidth={1.5} />
                    </button>

                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-sm shadow-cyan-500/20">
                            <Sparkles size={20} className="text-white" strokeWidth={1.5} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-800 tracking-tight leading-tight">VPO Digital</h2>
                            <p className="text-[11px] text-slate-400 font-medium">Gestión de créditos</p>
                        </div>
                    </div>

                    {/* Credit Summary Chips */}
                    <div className="flex flex-wrap gap-2">
                        <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200 text-[11px] font-medium text-slate-600">
                            <CreditCard size={12} className="text-cyan-500" />
                            <span>{isVIP ? '∞' : paidCredits} créditos pagados</span>
                        </div>
                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-medium
                            ${hasFreeToday
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                                : 'bg-red-50 border-red-200 text-red-500'}`}
                        >
                            <Gift size={12} />
                            <span>{hasFreeToday ? '1 VPO gratis disponible' : '0 VPO gratis — cortesía usada'}</span>
                        </div>
                    </div>
                </div>

                {/* ── Tabs ── */}
                <div className="flex gap-1 p-2.5 bg-slate-50/50 border-b border-slate-100 shrink-0">
                    {[
                        { id: 'status', label: 'Estatus de cuenta', icon: Award },
                        { id: 'buy', label: 'Comprar créditos', icon: TrendingUp },
                    ].map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            onClick={() => setTab(id as 'status' | 'buy')}
                            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-[12px] font-semibold transition-all duration-200
                                ${tab === id
                                    ? 'bg-white text-slate-800 shadow-sm border border-slate-200/60'
                                    : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'}`}
                        >
                            <Icon size={14} strokeWidth={1.5} />
                            {label}
                        </button>
                    ))}
                </div>

                {/* ── Scrollable Content ── */}
                <div className="overflow-y-auto overscroll-contain flex-1">

                    {/* ── ACCOUNT STATUS TAB ── */}
                    {tab === 'status' && (
                        <div className="p-5 space-y-4">
                            {/* Stats grid */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-white rounded-2xl p-4 border border-slate-200/80 text-center">
                                    <p className="text-3xl font-bold text-slate-800 tabular-nums">
                                        {isVIP ? '∞' : paidCredits}
                                    </p>
                                    <p className="text-[11px] font-medium text-slate-400 mt-1">
                                        Créditos totales
                                    </p>
                                </div>
                                <div className={`rounded-2xl p-4 border text-center
                                    ${hasFreeToday
                                        ? 'bg-emerald-50/50 border-emerald-200/60'
                                        : 'bg-red-50/50 border-red-200/60'}`}
                                >
                                    <p className={`text-3xl font-bold tabular-nums ${hasFreeToday ? 'text-emerald-600' : 'text-red-500'}`}>
                                        {hasFreeToday ? '1' : '0'}
                                    </p>
                                    <p className={`text-[11px] font-medium mt-1 ${hasFreeToday ? 'text-slate-400' : 'text-red-400'}`}>
                                        VPO gratis hoy
                                    </p>
                                </div>
                            </div>

                            {/* Status items */}
                            {[
                                { icon: Calendar, label: 'Último VPO generado', value: profile?.last_vpo_date ? new Date(profile.last_vpo_date).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Nunca', color: 'text-slate-500' },
                                { icon: CheckCircle, label: 'Estado de cuenta', value: 'Activa y verificada', color: 'text-emerald-500' },
                            ].map(({ icon: Icon, label, value, color }) => (
                                <div key={label} className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200/80">
                                    <div className="flex items-center gap-2.5">
                                        <Icon size={15} className={color} strokeWidth={1.5} />
                                        <span className="text-[12px] font-medium text-slate-500">{label}</span>
                                    </div>
                                    <span className={`text-[12px] font-semibold ${color}`}>{value}</span>
                                </div>
                            ))}

                            <button
                                onClick={() => setTab('buy')}
                                className="w-full bg-slate-800 text-white font-semibold py-3.5 rounded-xl text-[13px] hover:bg-slate-700 transition-all duration-200 shadow-sm flex items-center justify-center gap-2 mt-2"
                            >
                                <CreditCard size={16} strokeWidth={1.5} />
                                Comprar más créditos
                            </button>
                        </div>
                    )}

                    {/* ── BUY CREDITS TAB ── */}
                    {tab === 'buy' && (
                        <div className="p-5 space-y-3">
                            {/* Package cards */}
                            <div className="space-y-3">
                                <PackageCard
                                    icon={<div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-sm shadow-cyan-500/20"><Package size={17} className="text-white" strokeWidth={1.5} /></div>}
                                    title="Paquete Starter"
                                    credits={5}
                                    price={250}
                                    priceId="price_1T4HWkKtp6JiUcWzTNSg9D8h"
                                    loading={loading}
                                    onBuy={handleBuy}
                                />
                                <PackageCard
                                    icon={<div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-sm shadow-violet-500/20"><Rocket size={17} className="text-white" strokeWidth={1.5} /></div>}
                                    title="Paquete Pro"
                                    credits={10}
                                    price={400}
                                    priceId="price_1T4HX1Ktp6JiUcWzb6Jm2Utk"
                                    badge="Mejor Valor"
                                    highlight={true}
                                    loading={loading}
                                    onBuy={handleBuy}
                                />
                            </div>

                            {/* Trust notice */}
                            <p className="text-center text-[10px] text-slate-400 font-medium flex items-center justify-center gap-1 pb-2">
                                <Lock size={10} strokeWidth={1.5} />
                                Pago seguro procesado por Stripe. No almacenamos datos de tarjeta.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PaywallModal;

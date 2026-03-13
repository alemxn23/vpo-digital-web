import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import type { Session } from '@supabase/supabase-js';
import { LandingPage } from './LandingPage';
import { AuthModal } from './AuthModal';
import { UpdatePasswordModal } from './UpdatePasswordModal';
import { Loader2 } from 'lucide-react';

type AuthTab = 'login' | 'register';

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [showAuth, setShowAuth] = useState(false);
    const [authTab, setAuthTab] = useState<AuthTab>('login');
    const [recoveryMode, setRecoveryMode] = useState(false);

    useEffect(() => {
        // Password recovery is detected via onAuthStateChange below — no pathname check needed.

        if (!supabase) {
            // No Supabase config — allow access (dev mode)
            setSession({ dev: true });
            setLoading(false);
            return;
        }

        // 1. Get current session
        supabase.auth.getSession().then(({ data }: any) => {
            setSession(data.session);
            setLoading(false);
        });

        // 2. Listen for auth changes
        const { data: listener } = supabase.auth.onAuthStateChange((event: any, newSession: any) => {
            setSession(newSession);
            if (newSession) setShowAuth(false); // close modal on successful login

            if (event === 'PASSWORD_RECOVERY') {
                setRecoveryMode(true);
            }
        });

        return () => {
            listener?.subscription?.unsubscribe?.();
        };
    }, []);

    const handleShowAuth = (tab: AuthTab) => {
        setAuthTab(tab);
        setShowAuth(true);
    };

    // ── Recovery Mode ──
    if (recoveryMode) {
        return <UpdatePasswordModal />;
    }

    // ── Loading state ──
    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center shadow-xl shadow-teal-900/50">
                        <Loader2 size={26} className="text-white animate-spin" />
                    </div>
                    <p className="text-slate-400 text-sm font-medium">Cargando VPO Digital...</p>
                </div>
            </div>
        );
    }

    // ── Preview mode: ?preview=landing to see the landing locally ──
    const isLandingPreview = new URLSearchParams(window.location.search).get('preview') === 'landing';
    if (isLandingPreview) {
        if (showAuth) {
            return <AuthModal onBack={() => setShowAuth(false)} />;
        }
        return <LandingPage onShowAuth={handleShowAuth} />;
    }

    // ── Unauthenticated ──
    if (!session) {
        if (showAuth) {
            return <AuthModal onBack={() => setShowAuth(false)} />;
        }
        return <LandingPage onShowAuth={handleShowAuth} />;
    }

    // ── Authenticated → render app ──
    return <>{children}</>;
};

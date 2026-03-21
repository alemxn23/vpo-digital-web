// Trigger new Vercel production build
import React, { useState, useEffect, useRef } from 'react';
import { useForm, FormProvider, useFormContext } from 'react-hook-form';
import { VPOData, Gender } from './types';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import {
  Printer,
  Stethoscope,
  User,
  Activity,
  ClipboardCheck,
  FileText,
  Copy,
  CheckCircle2,
  Pill,
  FileImage,
  UploadCloud,
  Loader2,
  Save,
  MessageCircle,
  Settings,
  ClipboardList,
  LogOut,
  Coins,
  Unlock,
  ChevronRight
} from 'lucide-react';
import PatientInfo from './components/PatientInfo';
import RiskFactors from './components/RiskFactors';
import LabsAndVitals from './components/LabsAndVitals';
import MedicationReconciliation from './components/MedicationReconciliation';
import RiskScales from './components/RiskScales';
import Recommendations from './components/Recommendations';
import PrintView from './components/PrintView';
import Gabinete from './components/Gabinete';
import MedicalNoteGenerator from './components/MedicalNoteGenerator';
import { supabase } from './utils/supabase';
import PaywallModal from './components/PaywallModal';
import { AuthGuard } from './components/AuthGuard';
import { DoctorProfileModal } from './components/DoctorProfileModal';
import { CompleteProfileModal } from './components/CompleteProfileModal';

// --- Configuration ---
// Google Drive Client ID. Sigue los pasos en GOOGLE_DRIVE_SETUP.md para configurar el tuyo.
const DEFAULT_CLIENT_ID = '147428616428-bafn28uqehgsdhivcs766t6f49o6gpl6.apps.googleusercontent.com';

// --- Badge Component for Header ---
const ScoreBadge = ({ label, value, colorClass = "bg-clinical-navy", subValue }: { label: string, value: string | number | undefined, colorClass?: string, subValue?: string }) => {
  const hasValue = value !== undefined && value !== null && value !== '' && value !== -1;
  if (!hasValue) return null;

  return (
    <div className={`flex flex-col items-center justify-center px-1.5 py-0.5 rounded-md ${colorClass} text-white min-w-[54px] md:min-w-[60px] shadow-sm transform hover:scale-105 hover:brightness-110 transition-all cursor-default select-none border border-white/20 whitespace-nowrap`}>
      <span className="text-[6.5px] md:text-[7.5px] font-black opacity-80 uppercase tracking-tighter leading-none mb-0.5">{label}</span>
      <div className="flex items-baseline gap-0.5">
        <span className="text-[11px] md:text-[12px] font-black leading-none">{value}</span>
        {subValue && <span className="text-[6.5px] md:text-[7.5px] font-bold opacity-75 leading-none">{subValue}</span>}
      </div>
    </div>
  );
};

interface DoctorProfile {
  full_name: string;
  cedula_profesional: string;
  verification_status: 'unverified' | 'pending' | 'approved' | 'rejected';
  verified: boolean;
  ine_url?: string;
  selfie_url?: string;
}

// --- Header Component ---
const StickyHeader = ({ onOpenAccount, onOpenProfile, doctorProfile }: {
  onOpenAccount: () => void;
  onOpenProfile: () => void;
  doctorProfile: DoctorProfile | null;
}) => {
  const { watch } = useFormContext<VPOData>();

  // Use profile data if available, fall back to form value
  const doctorName = doctorProfile?.full_name || watch('elaboro') || 'Dr. Médico';
  const cedulaDisplay = doctorProfile?.cedula_profesional || '—';
  const isVerified = doctorProfile?.verified || doctorProfile?.verification_status === 'approved';
  const initials = doctorName.split(' ').filter(Boolean).slice(0, 2).map((w: string) => w[0]).join('').toUpperCase() || 'DR';
  const paidCredits = (watch('paid_credits_live') as number) ?? 0;
  const freeVposUsed = (watch('free_vpos_used_today_live') as number) ?? 0;
  const hasFreeVpo = freeVposUsed < 1;
  const credits = paidCredits + (hasFreeVpo ? 1 : 0);

  return (
    <header className="sticky top-0 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 z-30 no-print h-14 md:h-[60px]">
      <div className="w-full max-w-[1440px] mx-auto px-3 md:px-6 h-full flex items-center justify-between gap-4">

        {/* Physician Branding */}
        <button
          onClick={onOpenProfile}
          className="flex items-center gap-2.5 shrink-0 min-w-0 py-1.5 px-3 rounded-xl hover:bg-slate-50 transition-all duration-200 group"
          title="Ver perfil médico"
        >
          <div className="w-8 h-8 md:w-9 md:h-9 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center text-slate-600 font-bold text-[11px] md:text-[12px] ring-1 ring-slate-200/80 group-hover:ring-slate-300 transition-all">{initials}</div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[13px] font-semibold text-slate-800 tracking-tight truncate leading-none group-hover:text-slate-900 transition-colors">{doctorName}</span>
              {isVerified && <span className="text-emerald-500 text-[11px] leading-none" title="Médico Verificado">✅</span>}
              {!isVerified && doctorProfile?.verification_status === 'pending' && <span className="text-amber-400 text-[11px] leading-none" title="Verificación pendiente">🕐</span>}
            </div>
            <span className="text-[10px] font-medium text-slate-400 leading-none mt-0.5">Céd. {cedulaDisplay}</span>
          </div>
        </button>

        {/* Premium Credits Pill */}
        <button
          onClick={onOpenAccount}
          title="Ver estado de cuenta"
          className="ml-auto shrink-0 group flex items-center gap-2 px-3.5 py-1.5 rounded-full
            bg-slate-100 border border-slate-200/80
            hover:bg-slate-200/60 hover:border-slate-300
            active:scale-[0.98]
            transition-all duration-200"
        >
          <div className="w-[18px] h-[18px] bg-amber-500 rounded-full flex items-center justify-center shrink-0">
            <Coins size={11} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="text-sm font-bold tabular-nums text-slate-700">{watch('is_vip_live') ? '∞' : credits}</span>
          <span className="text-[10px] font-semibold text-clinical-navy uppercase tracking-wider">Créditos</span>
        </button>
      </div>
    </header>
  );
};

const Sidebar = ({ activeStep, setStep }: { activeStep: number, setStep: (s: number) => void }) => {
  const { watch } = useFormContext<VPOData>();
  const unidadMedica = watch('unidadMedica');
  const servicioSolicitante = watch('servicioSolicitante');

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
      window.location.reload();
    }
  };

  const navItems = [
    { icon: User, label: "Paciente", step: 0 },
    { icon: Activity, label: "Clínica", step: 1 },
    { icon: FileImage, label: "Gabinete", step: 2 },
    { icon: Pill, label: "Fármacos", step: 3 },
    { icon: ClipboardCheck, label: "Escalas", step: 4 },
    { icon: ClipboardList, label: "Recomendaciones", step: 5 },
    { icon: FileText, label: "Nota Médica", step: 6 },
    { icon: Printer, label: "Reporte", step: 7 },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-60 bg-white/80 backdrop-blur-xl border-r border-slate-200/60 h-screen sticky top-0 left-0 z-40 overflow-y-auto no-print">
      <div className="px-5 pt-5 pb-3">
        <img src="/logo.png?v=8" alt="Logo" className="w-36 h-auto object-contain" />
      </div>

      <nav className="flex-1 px-3 py-2 space-y-0.5">
        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.12em] px-3 py-2 mb-1">Módulos</div>
        {navItems.map((item) => {
          const isActive = activeStep === item.step;
          return (
            <button
              key={item.label}
              onClick={() => setStep(item.step)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 group relative
                ${isActive
                  ? 'bg-slate-100/80 text-slate-900'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                }`}
            >
              {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-cyan-500" />}
              <item.icon size={18} className={isActive ? 'text-slate-700' : 'text-slate-400 group-hover:text-slate-500'} strokeWidth={1.5} />
              <span className={`text-[13px] ${isActive ? 'font-semibold' : 'font-medium'}`}>{item.label}</span>
            </button>
          )
        })}
      </nav>

      <div className="px-4 pb-5 mt-auto space-y-3">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all text-xs font-medium"
        >
          <LogOut size={14} strokeWidth={1.5} />
          Cerrar sesión
        </button>
        <div className="rounded-xl p-3 border border-slate-100 flex flex-col items-center bg-slate-50/50">
          <a
            href="mailto:mcfidel98@gmail.com"
            className="flex flex-col items-center transition-opacity hover:opacity-70"
          >
            <img
              src="/medtech_logo.png?v=8"
              alt="Med-Tech Labs"
              className="h-20 w-auto object-contain mb-1"
            />
            <span className="text-[10px] font-semibold text-slate-500 hover:underline">Contactar Soporte</span>
          </a>
          <p className="text-[9px] text-slate-400 mt-1.5 font-medium">Act: {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </aside>
  );
};

const BottomNav = ({ activeStep, setStep }: { activeStep: number, setStep: (s: number) => void }) => {
  const navItems = [
    { icon: User, label: "Paciente", step: 0 },
    { icon: Activity, label: "Clínica", step: 1 },
    { icon: FileImage, label: "Gabinete", step: 2 },
    { icon: Pill, label: "Fármacos", step: 3 },
    { icon: ClipboardCheck, label: "Escalas", step: 4 },
    { icon: ClipboardList, label: "Rec.", step: 5 },
    { icon: FileText, label: "Nota", step: 6 },
    { icon: Printer, label: "PDF", step: 7 },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-200 z-50 pb-safe no-print lg:hidden shadow-[0_-6px_30px_rgba(15,23,42,0.12)]">
      <div className="max-w-md mx-auto flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = activeStep === item.step;
          return (
            <button
              key={item.label}
              onClick={() => setStep(item.step)}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isActive ? 'text-clinical-navy' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <item.icon size={isActive ? 24 : 20} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-[10px] font-medium ${isActive ? 'font-bold' : ''}`}>{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  );
};

const generateClinicalNote = (data: VPOData): string => {
  const risks = [];
  if (data.tabaquismo) risks.push(`Tabaquismo (IT: ${data.indiceTabaquico || '-'})`);
  if (data.hta) risks.push("HTA");
  if (data.diabetes) risks.push(`DM2 (${data.diabetesTipo}, ${data.usaInsulina ? 'Insulina' : 'Oral'})`);
  if (data.icc) risks.push("ICC");
  if (data.enfRenalCronica) risks.push(`ERC (TFG: ${data.tfg || '-'})`);

  const labs = `Hb: ${data.hb || '-'}, Plaq: ${data.plaquetas || '-'}, Leu: ${data.leucocitos || '-'}, Glu: ${data.glucosaCentral || '-'}, Cr: ${data.creatinina || '-'}, K: ${data.k || '-'}`;

  return `VALORACIÓN PREOPERATORIA
Paciente: ${data.nombre || 'Desconocido'} (${data.edad} años)
Dx: ${data.diagnosticoQuirurgico || 'Pendiente'}
Cirugía: ${data.cirugiaProgramada} (${data.tipoCirugia})

FACTORES DE RIESGO:
${risks.length > 0 ? risks.join(', ') : 'Negados'}
${data.cardio_stent ? `• Stent ${data.stent_tipo} (${data.stent_fecha_colocacion})` : ''}
${data.cirugiasPrevias ? `Antecedentes: ${data.cirugiasPrevias}` : ''}

LABORATORIOS:
${labs}
ECG: ${data.ecg_ritmo_especifico || data.ritmo}, Frec: ${data.ecg_frecuencia || data.frecuenciaEcg} lpm.
ARISCAT: ${data.ariscat_total} pts (${data.ariscat_categoria}).

ESCALAS DE RIESGO:
• ASA: ${data.asa || '-'} | Goldman: ${data.goldman || '-'} | Lee: ${data.lee || '-'}
• Caprini: ${data.caprini || '-'} pts | Gupta: ${data.gupta || 0}% | Duke: ${data.duke_resultado || '-'}
${data.arritmia_tipo === 'fa' || data.valvula_protesis ? `• CHA₂DS₂-VASc: ${data.cha2ds2vasc} | HAS-BLED: ${data.hasbled}` : ''}

PLAN / RECOMENDACIONES:
${data.recomendacionesGenerales || 'Sin recomendaciones específicas.'}
${data.ayuno ? `Ayuno: ${data.ayuno}` : ''}
`.trim();
};

declare global {
  interface Window {
    google: any;
    gapi: any;
  }
}

const App: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallMode, setPaywallMode] = useState<'paywall' | 'account'>('paywall');
  const [isCheckingCredits, setIsCheckingCredits] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile | null>(null);

  const methods = useForm<VPOData>({
    defaultValues: {
      fecha: new Date().toISOString().split('T')[0],
      hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      unidadMedica: localStorage.getItem('vpo_unidad_medica') || '',
      servicioSolicitante: localStorage.getItem('vpo_servicio') || '',
      elaboro: localStorage.getItem('vpo_doctor_name') || '',
      matricula: localStorage.getItem('vpo_doctor_cedula') || '',
      tipoCirugia: 'Electiva',
      esUrgencia: false,
      genero: Gender.MALE,
      ritmo: 'SINSUSAL',
      asa: 'II',
      lee: 'I',
      mets_estimated: 4,
      mets_method: 'auto',
      khorana_total: 0,
      vienna_cats_total: 0,
      ariscat_total: 0,
      caprini: 3,
      goldman: 'I',
      detsky: 'I',
      gupta: 0.1,
      cha2ds2vasc: 0,
      hasbled: 0,
      fragilidad_score: 1,
      stopbang_total: 0,
      cancer_activo: false
    }
  });

  const { watch, setValue } = methods;

  const openAccountModal = () => {
    setPaywallMode('account');
    setShowPaywall(true);
  };

  // Fetch credits from Supabase
  useEffect(() => {
    if (!supabase) {
      console.warn("Supabase not initialized. Using default credit values.");
      // Set defaults so the unlock flow works: 1 FREE VPO available
      setValue('paid_credits_live', 0);
      setValue('free_vpos_used_today_live', 0);
      setValue('is_vip_live', false);
      return;
    }

    const fetchCredits = async () => {
      try {
        const { data: authData } = await supabase.auth.getUser();
        const user = authData?.user;
        if (user) {
          const { data: profile, error: profileFetchErr } = await supabase
            .from('profiles')
            .select('paid_credits, free_vpos_used_today, plan_type, full_name, cedula_profesional, verification_status, verified')
            .eq('id', user.id)
            .maybeSingle();

          let finalFullName = profile?.full_name || '';

          // If no profile exists (e.g., new Google login without trigger), create it!
          if (!profile && !profileFetchErr) {
            finalFullName = user.user_metadata?.full_name || '';
            const { data: newProfile, error: insertErr } = await supabase.from('profiles').insert({
              id: user.id,
              full_name: finalFullName,
              plan_type: 'free',
              paid_credits: 0,
              free_vpos_used_today: 0,
              verification_status: 'unverified',
              verified: false
            }).select().single();

            if (insertErr) {
              console.error("ERROR CREATING PROFILE:", insertErr);
              alert("Error al sincronizar tu perfil de Google con la base de datos de Supabase:\n" + insertErr.message + "\n(Revisa la consola para más detalles, verifica o desactiva las políticas RLS en la tabla profiles).");
            }

            if (!insertErr && newProfile) {
              // We successfully created the profile.
              setValue('paid_credits_live', 0);
              setValue('free_vpos_used_today_live', 0);
              setValue('is_vip_live', false);
              setDoctorProfile({
                full_name: finalFullName,
                cedula_profesional: '',
                verification_status: 'unverified',
                verified: false,
              });
              if (finalFullName && !methods.getValues('elaboro')) {
                setValue('elaboro', finalFullName);
              }
            }
          } else if (profile) {
            // Auto-sync Google name if empty on existing but unnamed profile
            if (!finalFullName && user.user_metadata?.full_name) {
              finalFullName = user.user_metadata.full_name;
              await supabase.from('profiles').update({ full_name: finalFullName }).eq('id', user.id);
            }

            setValue('paid_credits_live', profile.paid_credits || 0);
            setValue('free_vpos_used_today_live', profile.free_vpos_used_today || 0);
            setValue('is_vip_live', profile.plan_type === 'unlimited');
            if (profile.plan_type === 'unlimited') {
              setIsUnlocked(true);
            }
            // Set doctor profile state
            setDoctorProfile({
              full_name: finalFullName,
              cedula_profesional: profile.cedula_profesional || '',
              verification_status: profile.verification_status || 'unverified',
              verified: profile.verified || false,
            });
            // Pre-populate elaboro with full_name if empty
            if (finalFullName && !methods.getValues('elaboro')) {
              setValue('elaboro', finalFullName);
            }
            // Pre-populate matricula with cedula if empty
            if (profile.cedula_profesional && !methods.getValues('matricula')) {
              setValue('matricula', profile.cedula_profesional);
            }
          } else {
            setValue('paid_credits_live', 0);
            setValue('free_vpos_used_today_live', 0);
            setValue('is_vip_live', false);
          }
        }
      } catch (err) {
        console.error("Error fetching credits:", err);
        setValue('free_vpos_used_today_live', 0);
      }
    };
    fetchCredits();

    // Subscribe to changes in profiles
    const channel = supabase
      .channel('profile_changes')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' }, fetchCredits)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [setValue]);

  useEffect(() => {
    const savedData = localStorage.getItem('vpo_current_data');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        methods.reset(parsed);
      } catch (e) {
        console.error("Failed to load saved data", e);
      }
    }
  }, [methods]);


  useEffect(() => {
    const subscription = methods.watch((value) => {
      localStorage.setItem('vpo_current_data', JSON.stringify(value));
    });
    return () => subscription.unsubscribe();
  }, [methods.watch]);

  // Cleanup legacy defaults that might be stuck in localStorage
  useEffect(() => {
    const currentData = methods.getValues();
    let needsReset = false;
    const cleanValues = { ...currentData };

    if (currentData.unidadMedica === 'IMSS' || currentData.unidadMedica === 'CMN SIGLO XXI') {
      cleanValues.unidadMedica = '';
      needsReset = true;
    }
    if (currentData.servicioSolicitante === 'CIRUGÍA GENERAL' || currentData.servicioSolicitante === 'MEDICINA INTERNA') {
      cleanValues.servicioSolicitante = '';
      needsReset = true;
    }

    if (needsReset) {
      methods.reset(cleanValues);
    }
  }, [methods]);


  const generatePDFDoc = async (): Promise<jsPDF> => {
    const page1 = document.getElementById('print-page-1');
    if (!page1) throw new Error("Página del reporte no encontrada. Intente recargar la página.");
    const page2 = document.getElementById('print-page-2'); // opcional

    const pdf = new jsPDF('p', 'mm', 'letter');
    const pdfWidth = pdf.internal.pageSize.getWidth();

    const capturePage = async (element: HTMLElement) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: 794,
        windowWidth: 794,
        scrollX: 0,
        scrollY: 0,
        onclone: (clonedDoc) => {
          const clonedEl = clonedDoc.getElementById(element.id);
          const body = clonedDoc.body;
          if (clonedEl) {
            while (body.firstChild) body.removeChild(body.firstChild);
            body.appendChild(clonedEl);
            clonedEl.style.width = '794px';
            clonedEl.style.margin = '0 auto';
            clonedEl.style.padding = '0';
            clonedEl.style.position = 'static';
            clonedEl.style.transform = 'none';
          }
          body.style.width = '794px';
          body.style.margin = '0';
          body.style.padding = '0';
          body.style.backgroundColor = '#ffffff';
        }
      });
      return canvas.toDataURL('image/png', 1.0);
    };

    const imgData1 = await capturePage(page1);
    const imgProps1 = pdf.getImageProperties(imgData1);
    const imgHeight1 = (imgProps1.height * pdfWidth) / imgProps1.width;
    pdf.addImage(imgData1, 'PNG', 0, 0, pdfWidth, imgHeight1);

    // Página 2 es opcional — si existe, la agrega
    if (page2) {
      pdf.addPage();
      const imgData2 = await capturePage(page2);
      const imgProps2 = pdf.getImageProperties(imgData2);
      const imgHeight2 = (imgProps2.height * pdfWidth) / imgProps2.width;
      pdf.addImage(imgData2, 'PNG', 0, 0, pdfWidth, imgHeight2);
    }

    return pdf;
  };

  const handleUnlockVPO = async () => {
    if (isUnlocked) return;
    setIsCheckingCredits(true);
    try {
      // Use live values already synced from Supabase into the form
      const paidCredits = methods.getValues('paid_credits_live') ?? 0;
      const freeUsed = methods.getValues('free_vpos_used_today_live') ?? 0;
      const isVIP = methods.getValues('is_vip_live') ?? false;

      // --- VIP / Developer bypass ---
      if (isVIP) {
        setIsUnlocked(true);
        return;
      }

      // --- Use free daily VPO ---
      if (freeUsed < 1) {
        if (supabase) {
          const { data: authData } = await supabase.auth.getUser();
          const user = authData?.user;
          if (user) {
            await supabase.from('profiles').update({
              free_vpos_used_today: 1,
              last_vpo_date: new Date().toISOString().split('T')[0]
            }).eq('id', user.id);
          }
        }
        // Optimistically update local form state
        methods.setValue('free_vpos_used_today_live', 1);
        setIsUnlocked(true);
        return;
      }

      // --- Use paid credit ---
      if (paidCredits > 0) {
        if (supabase) {
          const { data: authData } = await supabase.auth.getUser();
          const user = authData?.user;
          if (user) {
            await supabase.from('profiles').update({
              paid_credits: paidCredits - 1
            }).eq('id', user.id);
          }
        }
        // Optimistically update local form state
        methods.setValue('paid_credits_live', paidCredits - 1);
        setIsUnlocked(true);
        return;
      }

      // --- No credits left → Show paywall ---
      setPaywallMode('paywall');
      setShowPaywall(true);
    } catch (err) {
      console.error("Unlock Error:", err);
      // On any error, still let the user through to avoid blocking clinical work
      setIsUnlocked(true);
    } finally {
      setIsCheckingCredits(false);
    }
  };

  const handlePrintPDF = async () => {
    if (!isUnlocked) {
      await handleUnlockVPO();
      return;
    }

    try {
      const doc = await generatePDFDoc();
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) {
        const dateStr = new Date().toISOString().split('T')[0];
        const rawName = methods.getValues().nombre || 'Paciente';
        const safeName = rawName.replace(/[^a-zA-Z0-9]/g, '_');
        doc.save(`VPO_${safeName}_${dateStr}.pdf`);
      } else {
        doc.autoPrint();
        const blobUrl = doc.output('bloburl');
        const printWindow = window.open(blobUrl, '_blank');
        if (!printWindow || printWindow.closed) {
          alert("⚠️ Ventana emergente bloqueada. Se descargará el PDF.");
          const dateStr = new Date().toISOString().split('T')[0];
          const safeName = (methods.getValues().nombre || 'Paciente').replace(/[^a-zA-Z0-9]/g, '_');
          doc.save(`VPO_${safeName}_${dateStr}.pdf`);
        }
      }
    } catch (e) {
      console.error(e);
      alert("Error al generar vista de impresión.");
    } finally {
      setIsCheckingCredits(false);
    }
  };

  const base64ToBlob = (base64: string): Blob => {
    const parts = base64.split(';base64,');
    const contentType = parts[0].split(':')[1];
    const raw = window.atob(parts[1]);
    const uInt8Array = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; ++i) uInt8Array[i] = raw.charCodeAt(i);
    return new Blob([uInt8Array], { type: contentType });
  };

  const handleDriveUpload = async () => {
    if (!isUnlocked) {
      await handleUnlockVPO();
      return;
    }

    setIsUploading(true);
    const currentOrigin = window.location.origin;
    alert(`Iniciando Drive en: ${currentOrigin}\nSi no sale ventana de Google, revise bloqueador de popups.`);
    console.log("Starting Drive upload process at origin:", currentOrigin);

    const safetyTimeout = setTimeout(() => {
      setIsUploading(false);
      console.warn("Drive upload timed out after 60s.");
    }, 60000);

    if (!window.google || !window.google.accounts) {
      alert("ERROR: Servicios de Google no listos. Reintente en 5 segundos.");
      setIsUploading(false);
      return;
    }

    const clientId = localStorage.getItem('vpo_google_client_id_v2') || DEFAULT_CLIENT_ID;
    try {
      console.log("Initializing OAuth client with ID:", clientId);
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'https://www.googleapis.com/auth/drive.file',
        callback: async (tokenResponse: any) => {
          clearTimeout(safetyTimeout);
          console.log("OAuth Callback Triggered:", tokenResponse);

          if (tokenResponse.error) {
            alert(`Error de Google: ${tokenResponse.error_description || tokenResponse.error}`);
            setIsUploading(false);
            return;
          }

          if (tokenResponse && tokenResponse.access_token) {
            console.log("Acceso concedido. Iniciando subida...");
            try {
              // 1. Obtener o crear carpeta
              console.log("Checking/Creating folder...");
              const folderId = await getOrCreateFolder(tokenResponse.access_token);

              // 2. Generar PDF
              console.log("Generating PDF Document...");
              const doc = await generatePDFDoc();
              const pdfBlob = doc.output('blob');

              const dateStr = new Date().toISOString().split('T')[0];
              const safeName = (methods.getValues().nombre || 'Paciente').replace(/[^a-zA-Z0-9]/g, '_');
              const fileName = `${dateStr}_${safeName}_VPO.pdf`;

              console.log(`Subiendo: ${fileName}`);

              // 3. Subir PDF
              console.log(`Uploading PDF: ${fileName} to folder ${folderId}`);
              await uploadFileToDrive(tokenResponse.access_token, pdfBlob, fileName, folderId);

              // 4. Subir RX si existe
              const rxData = methods.getValues('rx_imagen');
              if (rxData) {
                console.log("Uploading RX image...");
                const rxBlob = base64ToBlob(rxData);
                const rxName = `${dateStr}_${safeName}_RX.png`;
                await uploadFileToDrive(tokenResponse.access_token, rxBlob, rxName, folderId);
              }

              // 5. Subir EKG si existe
              const ekgData = methods.getValues('ekg_imagen');
              if (ekgData) {
                console.log("Uploading EKG image...");
                const ekgBlob = base64ToBlob(ekgData);
                const ekgName = `${dateStr}_${safeName}_EKG.png`;
                await uploadFileToDrive(tokenResponse.access_token, ekgBlob, ekgName, folderId);
              }

              console.log("Upload sequence completed successfully.");
              alert("✅ ¡Éxito! Abriendo tu carpeta de Drive...");

              // Abrir la carpeta de Drive directamente
              window.open(`https://drive.google.com/drive/u/0/folders/${folderId}`, '_blank');

            } catch (err) {
              console.error("Drive Upload Error:", err);
              alert(`Error al procesar: ${err instanceof Error ? err.message : String(err)}`);
            } finally {
              setIsUploading(false);
            }
          } else {
            alert("No se recibió token. Reintente el inicio de sesión.");
            setIsUploading(false);
          }
        }
      });
      client.requestAccessToken();
    } catch (e) {
      alert(`Error al iniciar cliente: ${e instanceof Error ? e.message : String(e)}`);
      setIsUploading(false);
    }
  };

  const getOrCreateFolder = async (accessToken: string): Promise<string> => {
    const q = "mimeType='application/vnd.google-apps.folder' and name='VPO_Expedientes_MedicinaInterna' and trashed=false";
    const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(`Error al buscar carpeta: ${errorData.error?.message || res.statusText}`);
    }

    const data = await res.json();
    if (data.files && data.files.length > 0) return data.files[0].id;

    // Si no existe, crearla
    const create = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'VPO_Expedientes_MedicinaInterna', mimeType: 'application/vnd.google-apps.folder' })
    });

    if (!create.ok) {
      const errorData = await create.json();
      throw new Error(`Error al crear carpeta: ${errorData.error?.message || create.statusText}`);
    }

    const folder = await create.json();
    return folder.id;
  };

  const uploadFileToDrive = async (token: string, blob: Blob, name: string, folderId: string) => {
    const metadata = { name, parents: [folderId] };
    const boundary = 'vpo_digital_upload_boundary';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const metadataPart = `Content-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}`;
    const mediaPart = `\r\nContent-Type: ${blob.type}\r\n\r\n`;

    const multipartBody = new Blob([
      delimiter,
      metadataPart,
      delimiter,
      mediaPart,
      blob,
      closeDelimiter
    ], { type: `multipart/related; boundary=${boundary}` });

    const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`
      },
      body: multipartBody
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(`Error al subir ${name}: ${errorData.error?.message || res.statusText}`);
    }

    const data = await res.json();
    if (name.endsWith('_VPO.pdf')) methods.setValue('driveLink', data.webViewLink);
    return data;
  };

  const handleWhatsApp = async () => {
    if (!isUnlocked) {
      await handleUnlockVPO();
      return;
    }

    const data = methods.getValues();
    const summary = `VALORACIÓN VPO\nPaciente: ${data.nombre}\nASA: ${data.asa}\nLee: ${data.lee}\nGoldman: ${data.goldman}\nLink: ${data.driveLink || '(Sube a Drive primero)'}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(summary)}`, '_blank');
  };

  const handleCopyNote = () => {
    const note = generateClinicalNote(methods.getValues());
    navigator.clipboard.writeText(note).then(() => {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    });
  };

  const [showCompleteProfile, setShowCompleteProfile] = useState(false);
  const [sessionData, setSessionData] = useState<any>(null);

  return (
    <AuthGuard>
      <FormProvider {...methods}>
        <div className="min-h-screen bg-clinical-bg font-sans pb-20 lg:pb-0 lg:flex items-start">
          <Sidebar activeStep={activeStep} setStep={setActiveStep} />
          <div className="flex-1 min-w-0 flex flex-col min-h-screen">
            <StickyHeader
              onOpenAccount={openAccountModal}
              onOpenProfile={() => setShowProfileModal(true)}
              doctorProfile={doctorProfile}
            />
            <main className="pt-4 md:pt-8 pb-8 px-4 w-full max-w-md md:max-w-3xl lg:max-w-6xl mx-auto flex-1">
              <div className={activeStep === 0 ? 'block' : 'hidden'}>
                <PatientInfo isLocked={isUnlocked} onNewPatient={() => {
                  const paidCredits = methods.getValues('paid_credits_live') ?? 0;
                  const freeUsed = methods.getValues('free_vpos_used_today_live') ?? 0;
                  const isVIP = methods.getValues('is_vip_live') ?? false;
                  const remaining = paidCredits + (freeUsed < 1 ? 1 : 0);
                  const msg = isVIP
                    ? "⚠️ ¿Registrar nuevo paciente?\n\nEsta acción borrará todos los datos del paciente actual."
                    : `⚠️ ¿Registrar nuevo paciente?\n\nEsta acción borrará todos los datos del paciente actual.\nCréditos disponibles: ${remaining} VPO${remaining !== 1 ? 's' : ''}`;
                  if (confirm(msg)) {
                    localStorage.removeItem('vpo_current_data');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    // Provide a slight delay so the user sees the confirmation before reload
                    setTimeout(() => {
                      window.location.reload();
                    }, 100);
                  }
                }} />
              </div>
              <div className={activeStep === 1 ? 'block' : 'hidden'}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6"><RiskFactors /><LabsAndVitals /></div>
              </div>
              <div className={activeStep === 2 ? 'block' : 'hidden'}><Gabinete /></div>
              <div className={activeStep === 3 ? 'block' : 'hidden'}><MedicationReconciliation /></div>
              <div className={activeStep === 4 ? 'block' : 'hidden'}>
                <RiskScales />
              </div>
              <div className={activeStep === 5 ? 'block' : 'hidden'}>
                <Recommendations isUnlocked={isUnlocked} onRequestUnlock={handleUnlockVPO} />
              </div>
              <div className={activeStep === 6 ? 'block h-full' : 'hidden'}><MedicalNoteGenerator isUnlocked={isUnlocked} onRequestUnlock={handleUnlockVPO} /></div>
              <div className={activeStep === 7 ? 'block' : 'hidden'}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Preview Section: blurred until unlocked */}
                  <div className="lg:col-span-2 relative bg-white/95 backdrop-blur-sm p-4 rounded-2xl shadow-[0_18px_45px_rgba(15,23,42,0.06)] border border-slate-100 w-full h-[600px] sm:h-[850px] overflow-auto scrollbar-thin scrollbar-thumb-slate-200 group transition-all duration-300">
                    {/* Lock overlay - only shown when NOT unlocked */}
                    {!isUnlocked && !methods.getValues('is_vip_live') && (
                      <>
                        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none">
                          <div className="bg-white/92 backdrop-blur-md px-8 py-5 rounded-2xl border border-slate-100 shadow-[0_18px_55px_rgba(15,23,42,0.16)] flex flex-col items-center gap-2 transition-transform duration-300">
                            <ClipboardCheck size={32} className="text-clinical-navy" />
                            <span className="text-clinical-navy font-black text-lg tracking-tighter">DESBLOQUEA PARA PREVISUALIZAR</span>
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest text-center">Presiona "Desbloquear VPO" para ver<br />y exportar el reporte</span>
                          </div>
                        </div>
                        {/* Watermark Pattern Layer */}
                        <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.02] select-none flex flex-wrap gap-20 justify-center items-center overflow-hidden rotate-[-25deg]">
                          {Array(15).fill(0).map((_, i) => (
                            <span key={i} className="text-5xl font-black text-clinical-navy whitespace-nowrap">VPO DIGITAL • VISTA PRELIMINAR • </span>
                          ))}
                        </div>
                      </>
                    )}

                    <div className="w-full flex justify-center overflow-x-hidden">
                      <div className={`w-[794px] shrink-0 transform scale-[0.4] sm:scale-[0.6] lg:scale-[0.85] xl:scale-[0.95] origin-top transition-all duration-700 ${!isUnlocked ? 'blur-[5px] select-none pointer-events-none' : 'blur-0'}`} style={{ minHeight: '100%' }}>
                        <PrintView />
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Actions Section */}
                  <div className="space-y-6">
                    <div className="bg-white/95 backdrop-blur-sm p-6 rounded-2xl shadow-[0_18px_45px_rgba(15,23,42,0.06)] border border-slate-100">
                      <div className="flex flex-col gap-4">
                        {/* Unified Account Status + Unlock Panel */}
                        {isUnlocked ? (
                          /* ----- UNLOCKED STATE ----- */
                          /* ----- UNLOCKED STATE ----- */
                          <div className="w-full bg-emerald-50/50 p-4 rounded-2xl border border-emerald-200/60 flex items-center justify-between group transition-all duration-300 hover:bg-emerald-50">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 bg-emerald-100/80 rounded-full flex items-center justify-center text-emerald-600 shadow-inner">
                                <CheckCircle2 size={20} className="text-emerald-600" strokeWidth={2.5} />
                              </div>
                              <div className="flex flex-col">
                                <span className="font-bold text-[13px] text-emerald-900 tracking-tight leading-none mb-1">VPO Desbloqueado</span>
                                <span className="text-[11px] font-medium text-emerald-600/80 leading-none">
                                  {methods.watch('is_vip_live') ? 'Acceso VIP • Ilimitado' : `${methods.watch('paid_credits_live') ?? 0} crédito${(methods.watch('paid_credits_live') ?? 0) !== 1 ? 's' : ''} restante${(methods.watch('paid_credits_live') ?? 0) !== 1 ? 's' : ''}`}
                                </span>
                              </div>
                            </div>
                            <button onClick={openAccountModal} className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 px-3 py-1.5 rounded-lg transition-colors">
                              Cuenta
                            </button>
                          </div>
                        ) : (
                          /* ----- LOCKED STATE ----- */
                          <>
                            {/* Compact credits info row */}
                            <button
                              onClick={openAccountModal}
                              className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-slate-50 rounded-2xl border border-slate-200/80 shadow-sm hover:border-slate-300 hover:shadow transition-all group text-left"
                            >
                              <div className="flex items-center gap-2">
                                <Coins size={14} className="text-amber-500 shrink-0" strokeWidth={2.5} />
                                <span className="text-[12px] font-semibold text-slate-600 group-hover:text-slate-800 transition-colors">
                                  {methods.watch('is_vip_live') ? (
                                    <span className="flex items-center gap-1.5"><span className="bg-slate-100 text-slate-700 font-bold px-1.5 py-0.5 rounded-full">VIP</span> Acceso Ilimitado</span>
                                  ) : (
                                    <>{(methods.watch('paid_credits_live') ?? 0) + ((methods.watch('free_vpos_used_today_live') ?? 0) < 1 ? 1 : 0)} VPOs disponibles</>
                                  )}
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-400 font-bold group-hover:text-slate-600 transition-colors flex items-center gap-0.5">Cuenta <ChevronRight size={12} strokeWidth={2} /></span>
                            </button>

                            {/* Main unlock button */}
                            <button
                              onClick={handleUnlockVPO}
                              disabled={isCheckingCredits}
                              className={`w-full bg-slate-900 text-white py-4 mt-2 rounded-2xl font-bold text-[15px] flex flex-col items-center justify-center gap-1 transition-all duration-300 shadow-md shadow-slate-900/10 ${isCheckingCredits ? 'opacity-70 cursor-wait' : 'hover:scale-[1.02] hover:bg-slate-800 active:scale-[0.98]'}`}>
                              <div className="flex items-center gap-2">
                                <Unlock size={18} strokeWidth={2.5} />
                                <span>Desbloquear Reporte</span>
                              </div>
                              <span className="text-[10px] text-slate-300 font-medium tracking-wide">
                                {methods.watch('is_vip_live')
                                  ? 'Acceso VIP Ilimitado'
                                  : (methods.watch('free_vpos_used_today_live') ?? 0) < 1
                                    ? 'Usar cortesía gratuita del día'
                                    : `Usar 1 crédito (${(methods.watch('paid_credits_live') ?? 0)} restantes)`}
                              </span>
                            </button>
                          </>
                        )}

                        <button
                          onClick={handlePrintPDF}
                          disabled={isCheckingCredits}
                          className={`w-full ${isUnlocked ? 'bg-slate-900 border-transparent shadow-md shadow-slate-900/10' : 'bg-slate-100 border-slate-200 text-slate-400'} text-white py-4 rounded-[1.25rem] font-semibold text-[15px] flex items-center justify-center gap-2.5 transition-all duration-300 ${isUnlocked ? 'hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]' : 'cursor-not-allowed'} ${isCheckingCredits ? 'opacity-70 cursor-wait' : ''}`}>
                          <Printer size={18} strokeWidth={2} className={isUnlocked ? 'text-white/90' : 'text-slate-400'} />
                          <span>Imprimir PDF</span>
                        </button>

                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={handleDriveUpload}
                            disabled={isUploading || isCheckingCredits || !isUnlocked}
                            className={`flex flex-col items-center justify-center gap-1.5 py-4 rounded-[1.25rem] border transition-all duration-300 group ${isUnlocked ? 'bg-white border-slate-200/60 shadow-sm hover:border-slate-300 hover:shadow-md active:scale-95' : 'bg-slate-50 border-slate-100 opacity-60 cursor-not-allowed'} ${isUploading ? 'cursor-wait' : ''}`}
                          >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isUnlocked ? 'bg-slate-50 group-hover:bg-slate-100 text-slate-700' : 'text-slate-400'}`}>
                              {isUploading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} strokeWidth={2} />}
                            </div>
                            <span className={`text-[11px] font-bold tracking-wide ${isUnlocked ? 'text-slate-600' : 'text-slate-400'}`}>Drive</span>
                          </button>

                          <button
                            onClick={handleWhatsApp}
                            disabled={!isUnlocked}
                            className={`flex flex-col items-center justify-center gap-1.5 py-4 rounded-[1.25rem] border transition-all duration-300 group ${isUnlocked ? 'bg-white border-slate-200/60 shadow-sm hover:border-[#25D366]/30 hover:shadow-md hover:shadow-[#25D366]/5 active:scale-95' : 'bg-slate-50 border-slate-100 opacity-60 cursor-not-allowed'}`}
                          >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isUnlocked ? 'bg-slate-50 group-hover:bg-[#25D366]/10 text-[#25D366]' : 'text-slate-400'}`}>
                              <MessageCircle size={18} strokeWidth={2} />
                            </div>
                            <span className={`text-[11px] font-bold tracking-wide ${isUnlocked ? 'text-slate-600 group-hover:text-[#25D366]' : 'text-slate-400'}`}>WhatsApp</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Quick Tips or Info */}
                    <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-100">
                      <h4 className="text-[10px] font-black text-blue-900 uppercase tracking-widest mb-2">Tip de Reporte</h4>
                      <p className="text-[10px] text-blue-800 leading-relaxed font-medium">
                        Asegúrate de haber completado la <b>Conciliación Farmacológica</b> en el módulo de Fármacos para que aparezca en el plan post-quirúrgico.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </main>
          </div>
          {activeStep === 7 && (
            <button onClick={handleCopyNote} className="fixed bottom-24 right-6 bg-white/80 backdrop-blur-xl border border-white/40 text-slate-800 px-5 py-3.5 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] z-40 flex items-center gap-2.5 transition-all duration-300 hover:scale-[1.02] hover:bg-white/90 active:scale-[0.98]">
              <div className="bg-slate-100/80 p-1.5 rounded-full"><Copy size={16} strokeWidth={2} className="text-slate-700" /></div>
              <span className="hidden md:inline font-semibold text-[14px]">Copiar Texto</span>
            </button>
          )}
        </div>
        {showToast && (
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white px-5 py-2.5 rounded-full z-50 text-xs font-medium shadow-lg backdrop-blur flex items-center gap-2 transform transition-all duration-200">
            <CheckCircle2 size={16} className="text-emerald-400" />
            <span>Nota copiada al portapapeles</span>
          </div>
        )}
        <BottomNav activeStep={activeStep} setStep={setActiveStep} />

        {/* Hidden Container for high-res PDF generation - THIS IS THE ONLY ONE WITH IDs print-page-1/2 */}
        <div id="print-content" style={{
          position: 'fixed',
          left: '-10000px',
          top: '0',
          width: '794px',
          zIndex: -1000
        }}>
          <PrintView isPrintMode={true} />
        </div>

        <PaywallModal isOpen={showPaywall} onClose={() => setShowPaywall(false)} mode={paywallMode} />

        {showProfileModal && (
          <DoctorProfileModal
            profile={doctorProfile}
            onClose={() => setShowProfileModal(false)}
            onVerificationSubmitted={() => {
              // Refresh profile after submission
              setDoctorProfile(prev => prev ? { ...prev, verification_status: 'pending' } : prev);
            }}
          />
        )}

        {showCompleteProfile && sessionData?.user && (
          <CompleteProfileModal
            session={sessionData}
            defaultName={doctorProfile?.full_name || sessionData.user.user_metadata?.full_name}
            onComplete={(newName, newCedula) => {
              setDoctorProfile(prev => prev ? { ...prev, full_name: newName, cedula_profesional: newCedula } : {
                full_name: newName,
                cedula_profesional: newCedula,
                verification_status: 'unverified',
                verified: false
              });
              setValue('elaboro', newName);
              setValue('matricula', newCedula);
              setShowCompleteProfile(false);
            }}
          />
        )}
      </FormProvider>
    </AuthGuard>
  );
};

export default App;
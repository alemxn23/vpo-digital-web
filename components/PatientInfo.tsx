import React, { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { VPOData, Gender } from '../types';
import { User, Calendar, Siren, RotateCcw, Lock, Ruler, Scissors } from 'lucide-react';

interface PatientInfoProps {
  isLocked?: boolean;
  onNewPatient?: () => void;
}

/* ── Reusable field with label ── */
const Field = ({ label, icon, children, className = '' }: { label: string; icon?: React.ReactNode; children: React.ReactNode; className?: string }) => (
  <div className={className}>
    <label className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-500 tracking-wide mb-1.5">
      {icon}{label}
    </label>
    {children}
  </div>
);

const inputClass = "w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500/50 hover:border-slate-300 transition-all duration-200";
const readOnlyInputClass = "w-full px-3 py-2.5 rounded-lg border border-slate-100 bg-slate-50 text-sm text-slate-600 text-center font-semibold tabular-nums";

const PatientInfo: React.FC<PatientInfoProps> = ({ isLocked = false, onNewPatient }) => {
  const { register, watch, setValue, reset } = useFormContext<VPOData>();

  const peso = watch('peso');
  const talla = watch('talla');
  const fechaNacimiento = watch('fechaNacimiento');
  const isPendingDate = watch('fechaCirugiaPendiente');
  const isUrgencia = watch('esUrgencia');

  useEffect(() => {
    if (peso && talla) {
      const bmi = peso / (talla * talla);
      setValue('imc', parseFloat(bmi.toFixed(2)));
    }
  }, [peso, talla, setValue]);

  useEffect(() => {
    if (fechaNacimiento) {
      const today = new Date();
      const birthDate = new Date(fechaNacimiento);
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      setValue('edad', age);
    }
  }, [fechaNacimiento, setValue]);

  useEffect(() => {
    if (isUrgencia) {
      setValue('tipoCirugia', 'Urgencia');
    } else {
      setValue('tipoCirugia', 'Electiva');
    }
  }, [isUrgencia, setValue]);

  const handleReset = () => {
    if (onNewPatient) {
      onNewPatient();
    } else {
      if (confirm("⚠️ ¿Borrar todos los datos e iniciar nuevo paciente?")) {
        localStorage.removeItem('vpo_current_data');
        reset({ fecha: new Date().toISOString().split('T')[0], hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), genero: Gender.FEMALE } as unknown as VPOData);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };


  return (
    <div className="space-y-5">
      {/* ── Section Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <User className="text-slate-400" size={20} strokeWidth={1.5} />
          <div>
            <h2 className="text-base font-bold text-slate-800 leading-tight">Ficha Paciente</h2>
            <p className="text-[11px] text-slate-400 font-medium">Datos generales del paciente</p>
          </div>
          {isLocked && !watch('is_vip_live') && (
            <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full ml-1">
              <Lock size={10} strokeWidth={1.5} /> Solo lectura
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[12px] font-medium text-slate-500
            bg-white border border-slate-200 shadow-sm
            hover:bg-red-50 hover:text-red-600 hover:border-red-200 hover:shadow-red-100
            active:scale-[0.97] transition-all duration-200"
        >
          <RotateCcw size={13} strokeWidth={1.5} />
          Nuevo Paciente
        </button>
      </div>

      {isLocked && !watch('is_vip_live') && (
        <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-medium">
          <Lock size={14} className="shrink-0 text-amber-500" strokeWidth={1.5} />
          <span>VPO bloqueado para edición. Usa <b>Nuevo Paciente</b> para iniciar una nueva valoración.</span>
        </div>
      )}

      {/* ── Main Form Card ── */}
      <div className={`bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden ${isLocked && !watch('is_vip_live') ? 'opacity-50 pointer-events-none select-none' : ''}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">

          {/* ── LEFT COLUMN — Patient Identity ── */}
          <div className="p-5 md:p-6 space-y-4">
            {/* Column sub-header */}
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Identificación</span>
            </div>

            <Field label="Nombre completo">
              <input {...register('nombre')} className={inputClass} placeholder="Apellido Nombre" />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Fecha de nacimiento" icon={<Calendar size={11} strokeWidth={1.5} className="text-cyan-500" />}>
                <input type="date" {...register('fechaNacimiento')} className={inputClass} />
              </Field>
              <Field label="Edad (auto)">
                <input type="number" readOnly {...register('edad')} className={readOnlyInputClass} />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Género">
                <select {...register('genero')} className={inputClass}>
                  <option value={Gender.FEMALE}>Femenino</option>
                  <option value={Gender.MALE}>Masculino</option>
                </select>
              </Field>
              <Field label="NSS">
                <input {...register('nss')} className={inputClass} />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Cama">
                <input {...register('cama')} className={inputClass} placeholder="123-A" />
              </Field>
              <Field label="Servicio">
                <input {...register('servicioSolicitante')} className={inputClass} placeholder="Ej. Medicina Interna" />
              </Field>
            </div>

            <Field label="Unidad médica (hospital)">
              <input {...register('unidadMedica')} className={inputClass} placeholder="Ej. Hospital General" />
            </Field>
          </div>

          {/* ── RIGHT COLUMN — Surgery & Measurements ── */}
          <div className="p-5 md:p-6 space-y-4">
            {/* Column sub-header */}
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <div className="w-1.5 h-1.5 rounded-full bg-violet-500" />
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Cirugía</span>
            </div>

            {/* Surgery & Urgency */}
            <div className="rounded-xl border border-slate-100 bg-slate-50/40 p-4 space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-medium text-slate-400 tracking-wide">Fecha de cirugía</label>
                <label className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full cursor-pointer transition-all duration-200 text-[11px] font-semibold
                  ${isUrgencia
                    ? 'bg-red-500 text-white shadow-sm shadow-red-500/25'
                    : 'bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-400'
                  }`}>
                  <input type="checkbox" {...register('esUrgencia')} className="sr-only" />
                  <Siren size={12} className={isUrgencia ? 'animate-pulse' : ''} strokeWidth={1.5} />
                  Urgencia
                </label>
              </div>

              <input
                type="date"
                {...register('fechaQx')}
                disabled={isPendingDate}
                className={`${inputClass} ${isPendingDate ? '!bg-slate-100 !text-slate-300 !border-slate-100' : ''}`}
              />

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" {...register('fechaCirugiaPendiente')} className="w-3.5 h-3.5 rounded border-slate-300 text-cyan-500 focus:ring-cyan-500/30" />
                <span className="text-[12px] font-medium text-slate-500">Pendiente / Por programar</span>
              </label>
            </div>

            <Field label="Diagnóstico Qx" icon={<Scissors size={11} strokeWidth={1.5} className="text-violet-500" />}>
              <input {...register('diagnosticoQuirurgico')} className={inputClass} />
            </Field>
            <Field label="Cirugía programada">
              <input {...register('cirugiaProgramada')} className={inputClass} />
            </Field>

            {/* Anthropometry */}
            <div className="rounded-xl border border-emerald-200/60 bg-emerald-50/30 p-4 hover:bg-emerald-50/50 transition-colors duration-300">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <Ruler size={14} className="text-emerald-600" strokeWidth={1.5} />
                  <h3 className="text-[13px] font-semibold text-emerald-800">Antropometría</h3>
                </div>
                <span className="text-[10px] font-medium text-emerald-500 bg-emerald-100 px-2 py-0.5 rounded-full">Auto</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Field label="Peso (kg)">
                  <input type="number" step="0.1" {...register('peso', { valueAsNumber: true })} className={`${inputClass} text-center font-semibold tabular-nums !border-emerald-200 !bg-white focus:!ring-emerald-500/30 focus:!border-emerald-500/50`} />
                </Field>
                <Field label="Talla (m)">
                  <input type="number" step="0.01" {...register('talla', { valueAsNumber: true })} className={`${inputClass} text-center font-semibold tabular-nums !border-emerald-200 !bg-white focus:!ring-emerald-500/30 focus:!border-emerald-500/50`} />
                </Field>
                <Field label="IMC">
                  <div className="w-full px-3 py-2.5 rounded-lg bg-gradient-to-br from-emerald-600 to-teal-700 text-white text-sm text-center font-bold tabular-nums shadow-sm shadow-emerald-600/20">
                    {watch('imc') || '—'}
                  </div>
                </Field>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PatientInfo;
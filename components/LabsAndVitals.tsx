import React, { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { VPOData, Gender } from '../types';
import { TestTube, Activity, Minus, Plus, AlertTriangle, Droplets, Stethoscope, HeartPulse } from 'lucide-react';

// --- Stepper Input Component ---
const StepperInput = ({
  label,
  name,
  step = 1,
  unit = '',
  min = 0,
  max = 9999,
  warningLow = -Infinity,
  warningHigh = Infinity
}: {
  label: string,
  name: keyof VPOData,
  step?: number,
  unit?: string,
  min?: number,
  max?: number,
  warningLow?: number,
  warningHigh?: number
}) => {
  const { register, watch, setValue } = useFormContext<VPOData>();
  const value = watch(name) as number || 0;

  const isLow = value > 0 && value < warningLow;
  const isHigh = value > 0 && value > warningHigh;
  const isWarning = isLow || isHigh;

  const adjust = (amount: number) => {
    const newValue = Number((value + amount).toFixed(1)); // Fix float precision
    if (newValue >= min && newValue <= max) {
      setValue(name, newValue);
    }
  };

  const getBorderColor = () => {
    if (isHigh) return 'border-red-500 bg-red-50 shadow-sm';
    if (isLow) return 'border-blue-400 bg-blue-50/30 shadow-sm';
    return 'border-gray-200';
  };

  const getTextColor = () => {
    if (isHigh) return 'text-red-700';
    if (isLow) return 'text-blue-700';
    return 'text-gray-500';
  };

  return (
    <div className={`bg-white p-3 rounded-xl border transition-all duration-300 ${getBorderColor()}`}>
      <div className="flex justify-between items-center mb-2">
        <label className={`text-[10px] font-black uppercase tracking-tight ${getTextColor()}`}>{label}</label>
        {unit && <span className="text-[10px] text-gray-400 font-medium">{unit}</span>}
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => adjust(-step)}
          className={`w-10 h-10 flex items-center justify-center rounded-lg touch-manipulation active:scale-95 transition-all ${isHigh ? 'bg-red-100 text-red-700' : isLow ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}
        >
          <Minus size={18} />
        </button>
        <input
          type="number"
          step={step}
          {...register(name, { valueAsNumber: true })}
          className={`w-full text-center font-black text-xl p-1 bg-transparent border-b outline-none ${isHigh ? 'text-red-600 border-red-200' : isLow ? 'text-blue-600 border-blue-200' : 'text-slate-800 border-transparent'}`}
        />
        <button
          type="button"
          onClick={() => adjust(step)}
          className={`w-10 h-10 flex items-center justify-center rounded-lg touch-manipulation active:scale-95 transition-all ${isHigh ? 'bg-red-100 text-red-700' : isLow ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}
        >
          <Plus size={18} />
        </button>
      </div>
    </div>
  );
};

// --- Alert Banner Component ---
const AlertBanner = ({ message, type = 'danger' }: { message: string, type?: 'danger' | 'warning' }) => (
  <div className={`p-4 rounded-xl flex items-start gap-3 animate-fadeIn mb-4 ${type === 'danger' ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-amber-100 text-amber-800 border border-amber-200'}`}>
    <AlertTriangle className={`shrink-0 ${type === 'danger' ? 'text-red-600' : 'text-amber-600'}`} size={20} />
    <div>
      <h4 className="font-bold text-sm uppercase mb-1">Alerta de Seguridad</h4>
      <p className="text-sm font-medium leading-tight">{message}</p>
    </div>
  </div>
);

// --- Checkbox Card Component ---
const CriticalFinding = ({ name, label, points, alert }: { name: keyof VPOData, label: string, points?: string, alert?: boolean }) => {
  const { register, watch } = useFormContext<VPOData>();
  const isChecked = watch(name);

  return (
    <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${isChecked ? (alert ? 'bg-red-100 border-red-300' : 'bg-red-50 border-red-200') : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
      <input type="checkbox" {...register(name)} className="mt-1 w-4 h-4 text-clinical-red focus:ring-clinical-red rounded border-gray-300" />
      <div>
        <span className={`text-sm font-bold block ${isChecked ? 'text-red-800' : 'text-gray-700'}`}>{label}</span>
        {points && isChecked && <span className="text-[10px] font-bold text-red-600 uppercase bg-white/50 px-1 rounded mt-1 inline-block">{points}</span>}
        {alert && isChecked && <div className="text-[10px] text-red-700 font-bold mt-1 animate-pulse">⚠️ ALERTA RIESGO CRÍTICO</div>}
      </div>
    </label>
  );
};

const LabsAndVitals: React.FC = () => {
  const { register, watch, setValue } = useFormContext<VPOData>();

  // Logic dependencies
  const creatinina = watch('creatinina');
  const edad = watch('edad');
  const genero = watch('genero');
  const potasio = watch('k');
  const plaquetas = watch('plaquetas');
  const glucosa = watch('glucosaCentral') || watch('glucosaCapilar');
  const sodio = watch('na');
  const sato2 = watch('sato2');

  // Safety Logic Check
  const isArrhythmiaRisk = potasio > 0 && (potasio < 3.0 || potasio > 5.5);
  const isBleedingRisk = plaquetas > 0 && plaquetas < 50000;
  const isHypoxiaRisk = sato2 > 0 && sato2 < 90;
  const isHyperglycemiaRisk = glucosa > 180;
  const isDysnatremiaRisk = sodio > 0 && (sodio < 130 || sodio > 150);

  // Auto-Calculate GFR (CKD-EPI 2021)
  useEffect(() => {
    if (creatinina > 0 && edad > 0) {
      const isFemale = genero === Gender.FEMALE;

      // CKD-EPI Constants
      const kappa = isFemale ? 0.7 : 0.9;
      const alpha = isFemale ? -0.241 : -0.302;
      const genderFactor = isFemale ? 1.012 : 1;

      const crOverKappa = creatinina / kappa;
      const minVal = Math.min(crOverKappa, 1);
      const maxVal = Math.max(crOverKappa, 1);

      // Formula
      // GFR = 142 * min(Scr/k, 1)^a * max(Scr/k, 1)^-1.200 * 0.9938^Age * GenderFactor
      const gfr = 142 * Math.pow(minVal, alpha) * Math.pow(maxVal, -1.2) * Math.pow(0.9938, edad) * genderFactor;

      setValue('tfg', parseFloat(gfr.toFixed(1)));
    } else {
      // Reset if missing data
      setValue('tfg', 0);
    }
  }, [creatinina, edad, genero, setValue]);

  return (
    <div className="space-y-6 pb-4">

      {/* Vitals Section */}
      <div>
        <div className="flex items-center gap-2 mb-3 px-1">
          <Activity className="text-clinical-navy" size={20} />
          <h2 className="text-lg font-bold text-slate-800">Signos Vitales</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <StepperInput label="Sistólica" name="taSistolica" step={5} unit="mmHg" warningHigh={140} warningLow={90} />
          <StepperInput label="Diastólica" name="taDiastolica" step={5} unit="mmHg" warningHigh={90} warningLow={60} />
          <StepperInput label="FC" name="fc" step={1} unit="lpm" warningHigh={100} warningLow={60} />
          <StepperInput label="SatO2" name="sato2" step={1} unit="%" warningLow={90} warningHigh={100} />
          <StepperInput label="FR" name="fr" step={1} unit="rpm" warningHigh={20} warningLow={12} />
          <StepperInput label="Glucosa" name="glucosaCapilar" step={10} unit="mg/dL" warningHigh={180} warningLow={70} />
        </div>
      </div>

      {/* NEW: Physical Exam Critical Findings */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
        <div className="flex items-center gap-2 mb-3 text-slate-800">
          <Stethoscope size={18} className="text-clinical-navy" />
          <h3 className="font-bold text-sm uppercase">Hallazgos Físicos (Valoración Escalas)</h3>
        </div>

        <div className="space-y-4">
          {/* GROUP: Signs of HF */}
          <div>
            <h4 className="text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-1">
              <HeartPulse size={12} /> Signos Insuficiencia Cardíaca (+11 pts Goldman)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <CriticalFinding name="exploracion_ingurgitacion" label="Ingurgitación Yugular" points="+11 Goldman" />
              <CriticalFinding name="exploracion_s3" label="Tercer Ruido (S3)" points="+11 Goldman / +10 Detsky" />
              <CriticalFinding name="exploracion_estertores" label="Estertores Crepitantes" points="+11 Goldman" />
              <CriticalFinding name="exploracion_edema" label="Edema Miembros Inf." points="+1 Caprini" />
            </div>
          </div>

          {/* GROUP: Murmurs & Focal */}
          <div>
            <h4 className="text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-1">
              <Activity size={12} /> Soplos y Otros
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <CriticalFinding
                name="exploracion_estenosis_aortica"
                label="Estenosis Aórtica (Soplo)"
                points="+3 Goldman / +20 Detsky"
                alert={true}
              />
              <CriticalFinding name="exploracion_soplo_carotideo" label="Soplo Carotídeo / Déficit Focal" />
            </div>
          </div>
        </div>
      </div>

      {/* Labs Section */}
      <div>
        <div className="flex items-center gap-2 mb-3 px-1 mt-6">
          <TestTube className="text-clinical-navy" size={20} />
          <h2 className="text-lg font-bold text-slate-800">Laboratorios</h2>
        </div>

        {/* --- SAFETY ALERTS AREA --- */}
        {isArrhythmiaRisk && (
          <AlertBanner
            message={`Riesgo de Arritmia: Potasio en ${potasio} mEq/L. Corregir electrolitos antes de inducción anestésica.`}
            type="danger"
          />
        )}
        {isBleedingRisk && (
          <AlertBanner
            message={`Riesgo de sangrado elevado: Plaquetas en ${plaquetas}. Valorar transfusión para cirugía mayor (>50k).`}
            type="danger"
          />
        )}
        {isHypoxiaRisk && (
          <AlertBanner
            message={`Hipoxia detectada: SatO2 ${sato2}%. Mal pronóstico en escalas Goldman/Detsky. Optimizar ventilación.`}
            type="danger"
          />
        )}
        {isHyperglycemiaRisk && (
          <AlertBanner
            message={`Hiperglucemia detectada: ${glucosa} mg/dL. Mantener meta transoperatoria 140-180 mg/dL.`}
            type="warning"
          />
        )}
        {isDysnatremiaRisk && (
          <AlertBanner
            message={`Disnatremia detectada: Sodio ${sodio} mEq/L. Riesgo de edema cerebral o mielinolisis si se corrige abruptamente.`}
            type="warning"
          />
        )}

        <h3 className="text-xs font-bold text-gray-400 uppercase mb-2 px-1">Hemático</h3>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <StepperInput label="Hb" name="hb" step={0.1} warningLow={10} unit="g/dL" />
          <div className="col-span-1">
            <StepperInput label="Plaquetas" name="plaquetas" step={5000} warningLow={50000} />
          </div>
          <div className="col-span-2">
            <StepperInput label="Leucocitos" name="leucocitos" step={500} />
          </div>
        </div>

        <h3 className="text-xs font-bold text-gray-400 uppercase mb-2 px-1">Metabólico</h3>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <StepperInput label="Glucosa (QS)" name="glucosaCentral" step={5} warningHigh={180} />
          <StepperInput label="Urea" name="urea" step={1} />
          <div className="col-span-2">
            <StepperInput label="Creatinina" name="creatinina" step={0.1} warningHigh={1.5} />
          </div>
          <div className="col-span-2 bg-blue-50 p-3 rounded-xl border border-blue-100 flex justify-between items-center shadow-inner">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-blue-900">TFG (CKD-EPI)</span>
              <span className="text-[10px] text-blue-600">Calculado por Cr, Edad, Género</span>
            </div>
            <div className="flex items-baseline">
              <input readOnly {...register('tfg')} className="bg-transparent text-right font-bold text-2xl text-blue-900 w-24 outline-none" />
              <span className="text-xs text-blue-700 ml-1">ml/min</span>
            </div>
          </div>
        </div>

        <h3 className="text-xs font-bold text-gray-400 uppercase mb-2 px-1">Electrolitos y Coagulación</h3>
        <div className="grid grid-cols-3 gap-2 mb-4">
          <StepperInput label="Na+" name="na" step={1} warningLow={135} warningHigh={145} />
          <StepperInput label="K+" name="k" step={0.1} warningLow={3.5} warningHigh={5.0} />
          <StepperInput label="Cl-" name="cl" step={1} warningLow={98} warningHigh={107} />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <StepperInput label="TP" name="tp" step={0.1} />
          <StepperInput label="TTP" name="ttp" step={0.1} />
          <StepperInput label="INR" name="inr" step={0.1} warningHigh={1.5} />
          <div className="col-span-3 mt-2">
            <StepperInput label="D-Dímero" name="ddimer" step={100} unit="ng/mL (ug/L)" warningHigh={500} />
          </div>
        </div>

      </div>
    </div>
  );
};

export default LabsAndVitals;
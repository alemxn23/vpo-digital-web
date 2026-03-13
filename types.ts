export enum Gender {
  MALE = "Masc",
  FEMALE = "Fem"
}

export interface SelectedMed {
  id: string;
  name: string;
  category: string;
  keywords?: string[];
  action: 'stop' | 'continue' | 'adjust';
  daysPrior?: number; // 0 = Day of surgery, 1 = 24h before, 7 = 7 days before
  instructions: string;
  source?: string;
  englishName?: string; // For OpenFDA queries
  isChronic?: boolean;
  stressDoseRecommendation?: string;
  fdaWarning?: string;
  alertLevel: 'red' | 'yellow' | 'green';
  // Specific properties for logic
  dose?: number; // Generic dose for calculations
  isSteroid?: boolean;
  steroidDose?: number;
  steroidDurationWeeks?: number;
  isGLP1?: boolean;
  glp1Frequency?: 'daily' | 'weekly';
  isAnticoagulant?: boolean;
  anticoagType?: 'AVK' | 'DOAC' | 'HBPM';
  route?: 'VO' | 'IV' | 'SC' | 'Inhalada' | 'Topica' | 'Oftalmica';
  conversionMessage?: string; // To display bioequivalence notes

  // New Engine Fields
  atcCode?: string;
  halfLifeHours?: number;
  requiresBridging?: boolean;
  stopTimeHours?: number; // More precise than days
}

export interface VPOData {
  // Identificación
  fecha: string;
  hora: string;
  nombre: string;
  nss: string;

  // Edad y Nacimiento
  fechaNacimiento: string;
  edad: number; // Calculado

  genero: Gender;
  cama: string;
  servicioSolicitante: string;
  unidadMedica: string;

  diagnosticoQuirurgico: string;
  cirugiaProgramada: string;

  // Cirugía y Tiempos
  fechaQx: string;
  fechaCirugiaPendiente: boolean;
  esUrgencia: boolean; // Toggle Urgencia
  tipoCirugia: "Electiva" | "Urgencia"; // Legacy field

  peso: number;
  talla: number;
  imc: number; // Calculado

  // --- FACTORES DE RIESGO (INTERROGATORIO DIRIGIDO) ---

  // 1. Tabaquismo
  tabaquismo: boolean;
  cigarrosDia: number; // Calculadora IT
  aniosFumando: number; // Calculadora IT
  indiceTabaquico: number;
  riesgoEPOC: string; // Resultado IT
  active_smoking: boolean; // Tabaquismo Activo vs Histórico (Para ARISCAT/VRC)

  // 2. Alergias
  alergicos: boolean;
  alergicosDetalle: string;

  // 3. Hipertensión (HTA)
  hta: boolean;
  hta_control: "controlada" | "descontrolada"; // Descontrolada -> ASA III
  hta_tiempo: string; // Años

  // 4. Diabetes (DM)
  diabetes: boolean;
  diabetesTipo: "1" | "2" | "";
  diabetesTiempo: string;
  usaInsulina: boolean;

  // 5. Cardiopatía Isquémica
  cardiopatiaIsquemica: boolean; // Main toggle (IAM or Angina)
  cardio_tipo_evento: "angina_estable" | "angina_inestable" | "iam";

  cardio_fecha_evento: string; // Date picker used for calc

  // Stents (New)
  cardio_stent: boolean;
  stent_fecha_colocacion: string;
  stent_tipo: "BMS" | "DES";

  // 6. Insuficiencia Cardiaca (ICC)
  icc: boolean;
  icc_nyha: "I" | "II" | "III" | "IV";
  icc_evolucion: "aguda" | "cronica_comp" | "cronica_descomp";
  icc_historia_eap: boolean; // Antecedente EAP
  icc_fecha_eap: string; // Para saber si es < 1 semana

  // 7. Arritmias
  arritmias: boolean;
  arritmia_tipo: "fa" | "flutter" | "bloqueo" | "tsv" | "extrasistoles" | "otra";
  marcapasos: boolean;

  // 8. Valvulopatía
  valvulopatia: boolean;
  valvula_afectada: "aortica" | "mitral" | "tricuspide" | "pulmonar";
  valvula_patologia: "estenosis" | "insuficiencia" | "doble";
  valvula_severidad: "leve" | "moderada" | "severa";
  valvula_protesis: boolean; // New field for Cardioembolic logic

  // 9. EVC (Neurología)
  evc: boolean;
  evc_fecha: string;
  evc_tipo: "isquemico" | "hemorragico" | "ait";
  evc_secuelas: boolean;

  // 10. Neumopatía
  neumopatia: boolean;
  neumo_tipo: string; // EPOC, ASMA, SAOHS
  diagnosed_osa: boolean; // Apnea diagnosticada
  neumo_o2: boolean;

  // 11. Renal (ERC)
  enfRenalCronica: boolean;
  erc_estadio: "G1" | "G2" | "G3a" | "G3b" | "G4" | "G5";
  erc_dialisis: boolean;

  // 12. Hepatopatía
  hepatopatia: boolean;
  hepato_tipo: "cirrosis" | "hepatitis" | "higado_graso";
  hepato_child: "A" | "B" | "C";
  hepato_coagulopatia: boolean;

  // 13. Coagulopatía (Hematología)
  coagulopatia: boolean;
  coag_tipo: string;

  // 14. Cáncer (Para Escala Khorana / Vienna CATS)
  cancer_activo: boolean;
  cancer_tipo_sitio: "estomago" | "pancreas" | "pulmon" | "linfoma" | "ginecologico" | "vejiga" | "testicular" | "mieloma" | "snc" | "colorectal" | "esofago" | "rinon" | "sarcoma" | "cabeza_cuello" | "otro" | "";

  // --- VARIABLES DERIVADAS PARA ESCALAS (Auto-flagged by logic) ---
  flag_iam_reciente: boolean; // < 6m
  flag_iam_antiguo: boolean; // > 6m
  flag_angina_inestable: boolean; // CCS III/IV
  flag_estenosis_aortica_severa: boolean;
  flag_eap_agudo: boolean; // < 1 week
  flag_evc_agudo: boolean; // < 1 month

  // Gupta (MICA) Specifics
  functional_status: "independent" | "partial" | "total";
  gupta_surgical_site: "anorectal" | "aortic" | "amputation" | "bariatric" | "biliary" | "cardiac" | "ent" | "intestinal" | "intracranial" | "neck" | "obstetric" | "orthopedic" | "spinal" | "thoracic" | "vascular" | "urologic" | "other";

  // Antecedentes Texto Libre
  cirugiasPrevias: string;
  otrasEnfermedades: string;
  tratamientoActual: string;

  // Fármacos (Medication Reconciliation)
  selectedMeds: SelectedMed[];

  // Exploración & Signos (Updated)
  taSistolica: number;
  taDiastolica: number;
  fc: number;
  fr: number;
  temp: number;
  sato2: number;
  glucosaCapilar: number;

  // Hallazgos Físicos Críticos (Updated for Goldman linkage)
  exploracion_ingurgitacion: boolean; // Goldman +11
  exploracion_s3: boolean; // Goldman +11, Detsky +10
  exploracion_estertores: boolean; // Goldman +11 (Signo ICC)
  exploracion_estenosis_aortica: boolean; // Goldman +3, Detsky +20
  exploracion_edema: boolean; // Caprini +1
  exploracion_soplo_carotideo: boolean;

  // Labs
  hb: number;
  ht: number;
  leucocitos: number;
  plaquetas: number;
  tp: number;
  ttp: number;
  inr: number;
  glucosaCentral: number;
  urea: number;
  creatinina: number;
  na: number;
  k: number;
  cl: number;
  ddimer: number;

  // Calculados automáticamente
  tfg: number; // Tasa Filtración Glomerular

  // --- GABINETE ---
  rx_fecha: string;
  rx_imagen: string; // Base64 URL
  ekg_imagen: string; // Base64 URL

  rx_descripcion: string;

  ariscat_infeccion: boolean;
  ariscat_incision: "periferica" | "abdominal_sup" | "intratoracica";
  ariscat_duracion: "menos_2" | "2_a_3" | "mas_3";
  ariscat_total: number;
  ariscat_categoria: string;

  ecg_fecha: string;
  ecg_frecuencia: number;
  ecg_ritmo_especifico: "Sinusal" | "FA" | "Flutter" | "Union" | "Marcapasos";
  ecg_bloqueo: "Ninguno" | "1er_Grado" | "Mobitz_I" | "Mobitz_II" | "3er_Grado";

  ecg_hvi: boolean;
  ecg_brihh_incompleto: boolean;
  ecg_brihh_completo: boolean;
  ecg_isquemia: boolean;
  ecg_extrasistoles: boolean;
  ecg_otras_alteraciones: string;

  // --- DATOS ECOCARDIOGRÁFICOS (MODULO NUEVO) ---
  eco_fevi: number; // %
  eco_disfuncion_diastolica: boolean;
  eco_psap_elevada: boolean; // > 45mmHg
  eco_valvulopatia: "ninguna" | "estenosis_aortica_severa" | "insuficiencia_mitral_severa";

  // --- ENDOCARDITIS (DUKE) ---
  duke_mayor_hemocultivo: boolean;
  duke_mayor_eco: boolean;
  duke_mayor_regurgitacion: boolean;
  duke_menor_predisposicion: boolean;
  duke_menor_fiebre: boolean;
  duke_menor_vascular: boolean;
  duke_menor_inmuno: boolean;
  duke_menor_micro: boolean;
  duke_resultado: "Definitivo" | "Posible" | "Rechazado";
  duke_manual_add: boolean; // Allow manual addition of other criteria

  // Legacy bridging
  ritmo: string;
  frecuenciaEcg: number;

  // Escalas
  asa: "I" | "II" | "III" | "IV" | "E" | "I-E" | "II-E" | "III-E" | "IV-E";
  goldman: "I" | "II" | "III" | "IV";
  detsky: "I" | "II" | "III";
  caprini: number;
  lee: "I" | "II" | "III" | "IV";
  gupta: number; // Percentage

  // NSQIP Surgical Risk Calculator
  nsqip_total: number; // % Risk of any major complication at 30 days
  nsqip_riesgo: string; // "Bajo" | "Moderado" | "Alto"

  // Cardioembolic Scales
  cha2ds2vasc: number;
  hasbled: number;
  hasbled_inr_labil: boolean; // Manual toggle
  hasbled_alcohol: boolean; // Manual toggle

  // Khorana & Vienna CATS
  khorana_total: number;
  khorana_riesgo: "Bajo" | "Intermedio" | "Alto" | "";
  vienna_cats_total: number; // Score (points)
  vienna_cats_risk: string; // Probability % and Risk Level




  // --- PULMONAR & VÍA AÉREA (STOP-BANG) ---
  stopBang_snoring: boolean;
  stopBang_tired: boolean;
  stopBang_observed: boolean;
  stopBang_neck: boolean; // > 40cm
  stopbang_total: number;
  stopbang_risk: "Bajo" | "Intermedio" | "Alto" | "Alto (Dx Previo)";
  neck_circumference: number; // For manual input

  // --- RESERVA FUNCIONAL & FRAGILIDAD & VRC ---
  fragilidad_score: number; // 1-9 Clinical Frailty Scale
  vrc_total: number; // Vascular Risk (VSGNE)
  vrc_riesgo: string;
  riesgo_vrc_renal: boolean; // Auto flag Cr > 1.8
  vrc_epoc: boolean;
  vrc_beta_blocker: boolean;

  mets_estimated: number; // METs
  mets_method: "auto" | "biometric" | "duke_dasi" | "manual";

  // --- ASA OVERRIDE ---
  asa_manual_class: string; // If user forces class
  asa_justification: string;

  // --- RISK SCALE OVERRIDES (AUDIT) ---
  // Stores { 'goldman_s3': false } if manually unchecked
  risk_overrides: Record<string, boolean>;

  // --- CAPRINI DETAILED VARIABLES ---
  // Group A (1 Point)
  capA_cxMenor: boolean;
  capA_cxMayorAnt: boolean;
  capA_varices: boolean;
  capA_eii: boolean;
  capA_iam: boolean;
  capA_epoc: boolean;
  capA_reposo: boolean;

  // Group B (2 Points)
  capB_cxMayor: boolean;
  capB_laparoscopia: boolean;
  capB_confinado: boolean;
  capB_ferula: boolean;
  capB_cancer: boolean;
  capB_cateter: boolean;

  // Group C (3 Points)
  capC_historiaTVP: boolean;
  capC_historiaFam: boolean;
  capC_leiden: boolean;
  capC_lupico: boolean;
  capC_hit: boolean;

  // Group D (5 Points)
  capD_evc: boolean;
  capD_artroplastia: boolean;
  capD_fxCadera: boolean;
  capD_trauma: boolean;

  // Plan Estructurado
  plan_pre: string;
  plan_trans: string;
  plan_post: string;

  // Legacy Plan Fields
  ayuno: string;
  soluciones: string;
  antibioticos: string;
  tromboprofilaxis: string;
  recomendacionesGenerales: string;
  metasTerapeuticas: boolean;

  // Esquema Insulina (Sub-sección)
  insulinaEsquema: boolean;

  elaboro: string;
  matricula: string;
  residente: string;
  residente_matricula: string;

  // Reporting & Publication
  authorized_report_scales: Record<string, boolean>;

  // External
  driveLink?: string; // To store the uploaded file URL
  paid_credits_live?: number;
  free_vpos_used_today_live?: number;
  is_vip_live?: boolean;
}
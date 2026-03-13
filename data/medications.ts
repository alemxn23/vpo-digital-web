
import { SelectedMed } from '../types';

export const MEDICATIONS_DB: SelectedMed[] = [

    {
        id: 'meto',
        name: 'Metoprolol',
        category: 'B-Bloq',
        action: 'continue',
        daysPrior: 0,
        alertLevel: 'green',
        instructions: 'CONTINUAR. Si VO no posible, considerar IV.',
        atcCode: 'C07AB02'
    },
    {
        id: 'biso',
        name: 'Bisoprolol',
        category: 'B-Bloq',
        action: 'continue',
        daysPrior: 0,
        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'C07AB07'
    },
    {
        id: 'ateno',
        name: 'Atenolol',
        category: 'B-Bloq',
        action: 'continue',
        daysPrior: 0,
        alertLevel: 'green',
        instructions: 'CONTINUAR. No suspender abruptamente.',
        atcCode: 'C07AB03'
    },
    {
        id: 'carve',
        name: 'Carvedilol',
        category: 'B-Bloq',
        action: 'continue',
        daysPrior: 0,
        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'C07AG02'
    },
    {
        id: 'nebi',
        name: 'Nebivolol',
        category: 'B-Bloq',
        action: 'continue',
        daysPrior: 0,
        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'C07AB12'
    },
    {
        id: 'proprano',
        name: 'Propranolol',
        category: 'B-Bloq',
        action: 'continue',
        daysPrior: 0,
        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'C07AA05'
    },
    {
        id: 'labetalo',
        name: 'Labetalol',
        category: 'B-Bloq',
        action: 'continue',
        daysPrior: 0,
        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'C07AG01'
    },
    {
        id: 'losa',
        name: 'Losartán',
        category: 'ARA-II',
        action: 'stop',
        daysPrior: 1,
        alertLevel: 'red',
        instructions: 'SUSPENDER 24h antes (Riesgo hipotensión refractaria).',
        atcCode: 'C09CA01'
    },
    {
        id: 'telmi',
        name: 'Telmisartán',
        category: 'ARA-II',
        action: 'stop',
        daysPrior: 1,
        alertLevel: 'red',
        instructions: 'SUSPENDER 24h antes.',
        atcCode: 'C09CA07'
    },
    {
        id: 'valsa',
        name: 'Valsartán',
        category: 'ARA-II',
        action: 'stop',
        daysPrior: 1,
        alertLevel: 'red',
        instructions: 'SUSPENDER 24h antes.',
        atcCode: 'C09CA03'
    },
    {
        id: 'cande',
        name: 'Candesartán',
        category: 'ARA-II',
        action: 'stop',
        daysPrior: 1,
        alertLevel: 'red',
        instructions: 'SUSPENDER 24h antes.',
        atcCode: 'C09CA06'
    },
    {
        id: 'irbe',
        name: 'Irbesartán',
        category: 'ARA-II',
        action: 'stop',
        daysPrior: 1,
        alertLevel: 'red',
        instructions: 'SUSPENDER 24h antes.',
        atcCode: 'C09CA04'
    },
    {
        id: 'olme',
        name: 'Olmesartán',
        category: 'ARA-II',
        action: 'stop',
        daysPrior: 1,
        alertLevel: 'red',
        instructions: 'SUSPENDER 24h antes.',
        atcCode: 'C09CA08'
    },
    {
        id: 'ena',
        name: 'Enalapril',
        category: 'IECA',
        action: 'stop',
        daysPrior: 1,
        alertLevel: 'red',
        instructions: 'SUSPENDER 24h antes.',
        atcCode: 'C09AA02'
    },
    {
        id: 'capto',
        name: 'Captopril',
        category: 'IECA',
        action: 'stop',
        daysPrior: 1,
        alertLevel: 'red',
        instructions: 'SUSPENDER 24h antes.',
        atcCode: 'C09AA01'
    },
    {
        id: 'lisino',
        name: 'Lisinopril',
        category: 'IECA',
        action: 'stop',
        daysPrior: 1,
        alertLevel: 'red',
        instructions: 'SUSPENDER 24h antes.',
        atcCode: 'C09AA03'
    },
    {
        id: 'rami',
        name: 'Ramipril',
        category: 'IECA',
        action: 'stop',
        daysPrior: 1,
        alertLevel: 'red',
        instructions: 'SUSPENDER 24h antes.',
        atcCode: 'C09AA05'
    },
    {
        id: 'perindo',
        name: 'Perindopril',
        category: 'IECA',
        action: 'stop',
        daysPrior: 1,
        alertLevel: 'red',
        instructions: 'SUSPENDER 24h antes.',
        atcCode: 'C09AA04'
    },
    {
        id: 'valpro',
        name: 'Ácido Valproico',
        englishName: 'Valproic Acid',
        category: 'Antiepiléptico',
        action: 'continue',
        daysPrior: 0,
        alertLevel: 'green',
        instructions: 'CONTINUAR ESTRICTAMENTE. Riesgo crisis.',
        atcCode: 'N03AG01'
    },
    {
        id: 'carba',
        name: 'Carbamazepina',
        englishName: 'Carbamazepine',
        category: 'Antiepiléptico',
        action: 'continue',
        daysPrior: 0,
        alertLevel: 'green',
        instructions: 'CONTINUAR. Inductor enzimático (afecta anestésicos).',
        atcCode: 'N03AF01'
    },
    {
        id: 'fenito',
        name: 'Fenitoína',
        englishName: 'Phenytoin',
        category: 'Antiepiléptico',
        action: 'continue',
        daysPrior: 0,
        alertLevel: 'green',
        instructions: 'CONTINUAR. Riesgo arritmias si infusión rápida.',
        atcCode: 'N03AB02'
    },
    {
        id: 'leveti',
        name: 'Levetiracetam',
        englishName: 'Levetiracetam',
        category: 'Antiepiléptico',
        action: 'continue',
        daysPrior: 0,
        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'N03AX14'
    },
    {
        id: 'lamo',
        name: 'Lamotrigina',
        englishName: 'Lamotrigine',
        category: 'Antiepiléptico',
        action: 'continue',
        daysPrior: 0,
        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'N03AX09'
    },
    {
        id: 'levo_carbi',
        name: 'Levodopa/Carbidopa',
        englishName: 'Levodopa Carbidopa',
        category: 'Antiparkinsoniano',
        action: 'continue',
        daysPrior: 0,
        alertLevel: 'green',
        instructions: 'CONTINUAR HASTA INDUCCIÓN. Reiniciar apenas tolere VO (Riesgo rigidez).',
        atcCode: 'N04BA02'
    },
    {
        id: 'litio',
        name: 'Litio',
        englishName: 'Lithium',
        category: 'Litio',
        action: 'stop',
        daysPrior: 1,
        alertLevel: 'red',
        instructions: 'SUSPENDER 24-72h antes (Potencia bloqueantes neuromusculares). Check niveles.',
        atcCode: 'N05AN01'
    },
    {
        id: 'cloza',
        name: 'Clozapina',
        englishName: 'Clozapine',
        category: 'Antipsicótico',
        action: 'continue',
        daysPrior: 0,
        alertLevel: 'yellow',
        instructions: 'CONTINUAR. Aumenta riesgo ileo paralítico.',
        atcCode: 'N05AH02'
    },
    {
        id: 'biktarvy',
        name: 'Biktarvy (Bictegravir/Emtric/Tenofovir)',
        englishName: 'Biktarvy',
        category: 'Antirretroviral',
        action: 'continue',
        daysPrior: 0,
        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'J05AR20'
    },
    {
        id: 'truvada',
        name: 'Truvada (Emtricitabina/Tenofovir)',
        englishName: 'Truvada',
        category: 'Antirretroviral',
        action: 'continue',
        daysPrior: 0,
        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'J05AR03'
    },
    {
        id: 'dovato',
        name: 'Dovato (Dolutegravir/Lamivudina)',
        englishName: 'Dovato',
        category: 'Antirretroviral',
        action: 'continue',
        daysPrior: 0,
        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'J05AR25'
    },
    {
        id: 'atripla',
        name: 'Atripla (Efavirenz/Emtric/Tenofovir)',
        englishName: 'Atripla',
        category: 'Antirretroviral',
        action: 'continue',
        daysPrior: 0,
        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'J05AR06'
    },
    {
        id: 'triumeq',
        name: 'Triumeq (Dolute/Abaca/Lami)',
        englishName: 'Triumeq',
        category: 'Antirretroviral',
        action: 'continue',
        daysPrior: 0,
        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'J05AR13'
    },
    {
        id: 'tacro',
        name: 'Tacrolimus',
        englishName: 'Tacrolimus',
        category: 'Inmunosupresor',
        action: 'continue',
        daysPrior: 0,
        alertLevel: 'green',
        instructions: 'CONTINUAR. Dosis exacta matutina.',
        atcCode: 'L04AD02'
    },
    {
        id: 'ciclo',
        name: 'Ciclosporina',
        englishName: 'Cyclosporine',
        category: 'Inmunosupresor',
        action: 'continue',
        daysPrior: 0,
        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'L04AD01'
    },
    {
        id: 'micofen',
        name: 'Micofenolato',
        englishName: 'Mycophenolate',
        category: 'Inmunosupresor',
        action: 'continue',
        daysPrior: 0,
        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'L04AA06'
    },
    {
        id: 'amlo',
        name: 'Amlodipino',
        category: 'Ca-Ant',
        action: 'continue',
        daysPrior: 0,
        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'C08CA01'
    },
    {
        id: 'nife',
        name: 'Nifedipino',
        category: 'Ca-Ant',
        action: 'continue',
        daysPrior: 0,
        alertLevel: 'green',
        instructions: 'CONTINUAR. Riesgo taquicardia refleja mínimos en liberación prolongada.',
        atcCode: 'C08CA05'
    },
    {
        id: 'felodipino',
        name: 'Felodipino',
        category: 'Ca-Ant',
        action: 'continue',
        daysPrior: 0,
        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'C08CA02'
    },
    {
        id: 'vera',
        name: 'Verapamilo',
        category: 'Ca-Ant',
        action: 'continue',
        daysPrior: 0,
        alertLevel: 'green',
        instructions: 'CONTINUAR. Alerta Anestesia: Potencia depresores miocárdicos.',
        atcCode: 'C08DA01'
    },
    {
        id: 'diltia',
        name: 'Diltiazem',
        category: 'Ca-Ant',
        action: 'continue',
        daysPrior: 0,
        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'C08DB01'
    },
    {
        id: 'hctz',
        name: 'Hidroclorotiazida',
        category: 'Diurético',
        action: 'stop',
        daysPrior: 1,
        alertLevel: 'red',
        instructions: 'SUSPENDER día de cirugía (Riesgo hipovolemia/diskaliemia).',
        atcCode: 'C03AA03'
    },
    {
        id: 'clortal',
        name: 'Clortalidona',
        category: 'Diurético',
        action: 'stop',
        daysPrior: 1,
        alertLevel: 'red',
        instructions: 'SUSPENDER día de cirugía.',
        atcCode: 'C03BA04'
    },
    {
        id: 'furo',
        name: 'Furosemida',
        category: 'Diurético',
        action: 'stop',
        daysPrior: 1,
        alertLevel: 'red',
        instructions: 'SUSPENDER día de cirugía (salvo ICC descompensada).',
        atcCode: 'C03CA01'
    },
    {
        id: 'bumeta',
        name: 'Bumetanida',
        category: 'Diurético',
        action: 'stop',
        daysPrior: 1,
        alertLevel: 'red',
        instructions: 'SUSPENDER día de cirugía.',
        atcCode: 'C03CA02'
    },
    {
        id: 'espiro',
        name: 'Espironolactona',
        category: 'Diurético',
        action: 'stop',
        daysPrior: 1,
        alertLevel: 'yellow',
        instructions: 'SUSPENDER día de cirugía.',
        atcCode: 'C03DA01'
    },
    {
        id: 'eplerenona',
        name: 'Eplerenona',
        category: 'Diurético',
        action: 'stop',
        daysPrior: 1,
        alertLevel: 'yellow',
        instructions: 'SUSPENDER día de cirugía.',
        atcCode: 'C03DA04'
    },
    {
        id: 'asa',
        name: 'Aspirina (AAS)',
        englishName: 'Aspirin',
        category: 'Antiagregante',
        action: 'adjust',
        daysPrior: 7, // Default if not sec prev
        alertLevel: 'yellow',
        instructions: 'Prevención 2ria: CONTINUAR. Suspender 7 días SOLO si Neuro/Oftalmo/Raquia.',
        atcCode: 'B01AC06'
    },
    {
        id: 'enoxaparin',
        name: 'Enoxaparina',
        englishName: 'Enoxaparin',
        category: 'Anticoagulante',
        action: 'adjust',
        daysPrior: 1, // 24h usually
        alertLevel: 'yellow',
        instructions: 'Suspender 24h antes de la cirugía (Dosis Terapéutica) o 12h antes (Profiláctica). Evaluar función renal.',
        atcCode: 'B01AB05',
        keywords: ['clexane', 'heparina', 'bajo peso molecular']
    },
    {
        id: 'clopi',
        name: 'Clopidogrel',
        category: 'Antiagregante',
        action: 'stop',
        daysPrior: 5,
        alertLevel: 'red',
        instructions: 'SUSPENDER 5 días antes.',
        atcCode: 'B01AC04'
    },
    {
        id: 'tica',
        name: 'Ticagrelor',
        category: 'Antiagregante',
        action: 'stop',
        daysPrior: 5, // 3-5 days
        alertLevel: 'red',
        instructions: 'SUSPENDER 5 días antes (Vida media más corta, pero estándar seguro).',
        atcCode: 'B01AC24'
    },
    {
        id: 'prasu',
        name: 'Prasugrel',
        category: 'Antiagregante',
        action: 'stop',
        daysPrior: 7,
        alertLevel: 'red',
        instructions: 'SUSPENDER 7 días antes (Irreversible, más potente).',
        atcCode: 'B01AC22'
    },
    {
        id: 'cangrelor',
        name: 'Cangrelor',
        category: 'Antiagregante',
        action: 'stop',
        daysPrior: 0,
        alertLevel: 'red',
        instructions: 'SUSPENDER 1-6 HORAS antes (IV Ultrarápido).',
        atcCode: 'B01AC25'
    },
    {
        id: 'cilostazol',
        name: 'Cilostazol',
        category: 'Antiagregante',
        action: 'stop',
        daysPrior: 2,
        alertLevel: 'yellow',
        instructions: 'SUSPENDER 48h antes (Reversible).',
        atcCode: 'B01AC23'
    },
    {
        id: 'dipiri',
        name: 'Dipiridamol',
        category: 'Antiagregante',
        action: 'stop',
        daysPrior: 2,
        alertLevel: 'yellow',
        instructions: 'SUSPENDER 48h antes.',
        atcCode: 'B01AC07'
    },
    {
        id: 'warfa',
        name: 'Warfarina',
        englishName: 'Warfarin',
        category: 'Anticoagulante',
        anticoagType: 'AVK',
        isAnticoagulant: true,
        action: 'stop',
        daysPrior: 5,
        alertLevel: 'red',
        instructions: 'SUSPENDER 5 días antes. INR < 1.5. Evaluar Puenteo.',
        atcCode: 'B01AA03'
    },
    {
        id: 'aceno',
        name: 'Acenocumarol',
        category: 'Anticoagulante',
        anticoagType: 'AVK',
        isAnticoagulant: true,
        action: 'stop',
        daysPrior: 3,
        alertLevel: 'red',
        instructions: 'SUSPENDER 3 días antes. Evaluar Puenteo.',
        atcCode: 'B01AA07'
    },
    {
        id: 'riva',
        name: 'Rivaroxaban',
        englishName: 'Rivaroxaban',
        category: 'Anticoagulante',
        anticoagType: 'DOAC',
        isAnticoagulant: true,
        action: 'stop',
        daysPrior: 2,
        alertLevel: 'red',
        instructions: 'SUSPENDER 48-72h antes (Según Riesgo Sangrado/Renal).',
        atcCode: 'B01AF01'
    },
    {
        id: 'api',
        name: 'Apixaban',
        englishName: 'Apixaban',
        category: 'Anticoagulante',
        anticoagType: 'DOAC',
        isAnticoagulant: true,
        action: 'stop',
        daysPrior: 2,
        alertLevel: 'red',
        instructions: 'SUSPENDER 48-72h antes (Según Riesgo Sangrado/Renal).',
        atcCode: 'B01AF02'
    },
    {
        id: 'dabi',
        name: 'Dabigatran',
        englishName: 'Dabigatran',
        category: 'Anticoagulante',
        anticoagType: 'DOAC',
        isAnticoagulant: true,
        action: 'stop',
        daysPrior: 2,
        alertLevel: 'red',
        instructions: 'SUSPENDER 2-4 días antes (Dep. Renal estricta).',
        atcCode: 'B01AE07'
    },
    {
        id: 'edoxa',
        name: 'Edoxaban',
        category: 'Anticoagulante',
        anticoagType: 'DOAC',
        isAnticoagulant: true,
        action: 'stop',
        daysPrior: 2,
        alertLevel: 'red',
        instructions: 'SUSPENDER 48h antes.',
        atcCode: 'B01AF03'
    },
    {
        id: 'dapa',
        name: 'Dapagliflozina',
        englishName: 'Dapagliflozin',
        category: 'iSGLT2',
        action: 'stop',
        daysPrior: 3,
        alertLevel: 'red',
        instructions: 'SUSPENDER 3-4 DÍAS ANTES (Riesgo Cetoacidosis Euglucémica).',
        atcCode: 'A10BK01'
    },
    {
        id: 'empa',
        name: 'Empagliflozina',
        englishName: 'Empagliflozin',
        category: 'iSGLT2',
        action: 'stop',
        daysPrior: 3,
        alertLevel: 'red',
        instructions: 'SUSPENDER 3-4 DÍAS ANTES.',
        atcCode: 'A10BK03'
    },
    {
        id: 'cana',
        name: 'Canagliflozina',
        englishName: 'Canagliflozin',
        category: 'iSGLT2',
        action: 'stop',
        daysPrior: 3,
        alertLevel: 'red',
        instructions: 'SUSPENDER 3-4 DÍAS ANTES.',
        atcCode: 'A10BK02'
    },
    {
        id: 'ertu',
        name: 'Ertugliflozina',
        category: 'iSGLT2',
        action: 'stop',
        daysPrior: 4,
        alertLevel: 'red',
        instructions: 'SUSPENDER 4 DÍAS ANTES.',
        atcCode: 'A10BK04'
    },
    {
        id: 'sema',
        name: 'Semaglutida (Ozempic/Wegovy)',
        englishName: 'Semaglutide',
        category: 'GLP-1',
        isGLP1: true,
        glp1Frequency: 'weekly',
        action: 'stop',
        daysPrior: 7,
        alertLevel: 'red',
        instructions: 'SUSPENDER 1 SEMANA ANTES (Riesgo Broncoaspiración).',
        atcCode: 'A10BJ06'
    },
    {
        id: 'rybelsus',
        name: 'Semaglutida Oral (Rybelsus)',
        englishName: 'Semaglutide',
        category: 'GLP-1',
        isGLP1: true,
        glp1Frequency: 'daily',
        action: 'stop',
        daysPrior: 1,
        alertLevel: 'red',
        instructions: 'SUSPENDER EL DÍA DE LA CIRUGÍA.',
        atcCode: 'A10BJ06'
    },
    {
        id: 'lira',
        name: 'Liraglutida',
        englishName: 'Liraglutide',
        category: 'GLP-1',
        isGLP1: true,
        glp1Frequency: 'daily',
        action: 'stop',
        daysPrior: 1,
        alertLevel: 'red',
        instructions: 'SUSPENDER EL DÍA DE LA CIRUGÍA o 24h antes.',
        atcCode: 'A10BJ02'
    },
    {
        id: 'dula',
        name: 'Dulaglutida',
        englishName: 'Dulaglutide',
        category: 'GLP-1',
        isGLP1: true,
        glp1Frequency: 'weekly',
        action: 'stop',
        daysPrior: 7,
        alertLevel: 'red',
        instructions: 'SUSPENDER 1 SEMANA ANTES.',
        atcCode: 'A10BJ05'
    },
    {
        id: 'tirze',
        name: 'Tirzepatida (Mounjaro)',
        englishName: 'Tirzepatide',
        category: 'GLP-1', // Dual GIP/GLP-1
        isGLP1: true,
        glp1Frequency: 'weekly',
        action: 'stop',
        daysPrior: 7,
        alertLevel: 'red',
        instructions: 'SUSPENDER 1 SEMANA ANTES.',
        atcCode: 'A10BX16'
    },
    {
        id: 'ins_glar',
        name: 'Insulina Glargina',
        category: 'Insulina',
        action: 'adjust',
        daysPrior: 1,
        alertLevel: 'yellow',
        instructions: 'Reducir 20% dosis noche previa.',
        atcCode: 'A10AE04'
    },
    {
        id: 'ins_det',
        name: 'Insulina Detemir',
        category: 'Insulina',
        action: 'adjust',
        daysPrior: 1,
        alertLevel: 'yellow',
        instructions: 'Reducir 20% dosis noche previa.',
        atcCode: 'A10AE05'
    },
    {
        id: 'ins_deg',
        name: 'Insulina Degludec',
        category: 'Insulina',
        action: 'adjust',
        daysPrior: 1,
        alertLevel: 'yellow',
        instructions: 'Reducir 20% dosis. Vida media larga.',
        atcCode: 'A10AE06'
    },
    {
        id: 'ins_nph',
        name: 'Insulina NPH',
        category: 'Insulina',
        action: 'adjust',
        daysPrior: 1,
        alertLevel: 'yellow',
        instructions: 'Noche: -20%. Mañana: -50%.',
        atcCode: 'A10AC01'
    },
    {
        id: 'ins_rap',
        name: 'Insulina Rápida/Lispro/Aspart',
        category: 'Insulina',
        action: 'stop',
        daysPrior: 0,
        alertLevel: 'red',
        instructions: 'NO ADMINISTRAR en ayuno. Solo esquema corrección.',
        atcCode: 'A10AB01'
    },
    {
        id: 'ins_mix',
        name: 'Insulinas Premezcladas',
        category: 'Insulina',
        action: 'stop',
        daysPrior: 0,
        alertLevel: 'red',
        instructions: 'OMITIR mañana de cirugía.',
        atcCode: 'A10AD01'
    },
    {
        id: 'metf',
        name: 'Metformina',
        englishName: 'Metformin',
        category: 'Antidiabético',
        action: 'stop',
        daysPrior: 1,
        alertLevel: 'red',
        instructions: 'SUSPENDER 24h antes (Riesgo Acidosis Láctica).',
        atcCode: 'A10BA02'
    },
    {
        id: 'glib',
        name: 'Glibenclamida',
        category: 'Sulfonilurea',
        action: 'stop',
        daysPrior: 1,
        alertLevel: 'red',
        instructions: 'SUSPENDER 24h antes.',
        atcCode: 'A10BB01'
    },
    {
        id: 'glim',
        name: 'Glimepirida',
        category: 'Sulfonilurea',
        action: 'stop',
        daysPrior: 1,
        alertLevel: 'red',
        instructions: 'SUSPENDER 24h antes.',
        atcCode: 'A10BB12'
    },
    {
        id: 'pio',
        name: 'Pioglitazona',
        category: 'Tiazolidinediona',
        action: 'stop',
        daysPrior: 1,
        alertLevel: 'yellow',
        instructions: 'SUSPENDER día de cirugía.',
        atcCode: 'A10BG03'
    },
    {
        id: 'dpp4',
        name: 'Inhibidores DPP-4 (Sitagliptina/Vilda)',
        category: 'DPP-4',
        action: 'stop',
        daysPrior: 0,
        alertLevel: 'yellow',
        instructions: 'Omitir dosis de la mañana.',
        atcCode: 'A10BH01'
    },
    {
        id: 'pred',
        name: 'Prednisona',
        englishName: 'Prednisone',
        category: 'Corticoides',
        isSteroid: true,
        action: 'adjust', // Engine will check chronic use
        daysPrior: 0,
        alertLevel: 'yellow',
        instructions: 'Valorar dosis estrés si uso crónico.',
        atcCode: 'H02AB07'
    },
    {
        id: 'hidro',
        name: 'Hidrocortisona',
        englishName: 'Hydrocortisone',
        category: 'Corticoides',
        isSteroid: true,
        action: 'adjust',
        daysPrior: 0,
        alertLevel: 'yellow',
        instructions: 'Valorar dosis estrés.',
        atcCode: 'H02AB09'
    },
    {
        id: 'dexa',
        name: 'Dexametasona',
        englishName: 'Dexamethasone',
        category: 'Corticoides',
        isSteroid: true,
        action: 'adjust',
        daysPrior: 0,
        alertLevel: 'yellow',
        instructions: 'Valorar dosis estrés.',
        atcCode: 'H02AB02'
    },
    {
        id: 'metil',
        name: 'Metilprednisolona',
        englishName: 'Methylprednisolone',
        category: 'Corticoides',
        isSteroid: true,
        action: 'adjust',
        daysPrior: 0,
        alertLevel: 'yellow',
        instructions: 'Valorar dosis estrés.',
        atcCode: 'H02AB04'
    },
    {
        id: 'sertra',
        name: 'Sertralina',
        category: 'ISRS',
        action: 'continue',
        daysPrior: 0,
        alertLevel: 'green',
        instructions: 'CONTINUAR (Evitar síndrome discontinuación).',
        atcCode: 'N06AB06'
    },
    {
        id: 'fluox',
        name: 'Fluoxetina',
        category: 'ISRS',
        action: 'continue',
        daysPrior: 0,
        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'N06AB03'
    },
    {
        id: 'esci',
        name: 'Escitalopram',
        category: 'ISRS',
        action: 'continue',
        daysPrior: 0,
        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'N06AB10'
    },
    {
        id: 'paro',
        name: 'Paroxetina',
        category: 'ISRS',
        action: 'continue',
        daysPrior: 0,
        alertLevel: 'green',
        instructions: 'CONTINUAR. Vida media corta, síndrome de retirada severo.',
        atcCode: 'N06AB05'
    },
    {
        id: 'venla',
        name: 'Venlafaxina',
        category: 'IRSN',
        action: 'continue',
        daysPrior: 0,
        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'N06AX16'
    },
    {
        id: 'dulox',
        name: 'Duloxetina',
        category: 'IRSN',
        action: 'continue',
        daysPrior: 0,
        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'N06AX21'
    },
    {
        id: 'ami',
        name: 'Amitriptilina',
        category: 'Tricíclico',
        action: 'continue',
        daysPrior: 0,
        alertLevel: 'yellow',
        instructions: 'CONTINUAR. Interacción: Cuidado con adrenalina/vasopresores.',
        atcCode: 'N06AA09'
    },
    {
        id: 'imi',
        name: 'Imipramina',
        category: 'Tricíclico',
        action: 'continue',
        daysPrior: 0,
        alertLevel: 'yellow',
        instructions: 'CONTINUAR.',
        atcCode: 'N06AA02'
    },
    {
        id: 'fenel',
        name: 'Fenelzina (IMAO)',
        category: 'IMAO',
        action: 'stop',
        daysPrior: 14,
        alertLevel: 'red',
        instructions: 'SUSPENDER 2 SEMANAS antes. Interacción letal con Petidina/Efedrina.',
        atcCode: 'N06AF03'
    },
    {
        id: 'tranil',
        name: 'Tranilcipromina (IMAO)',
        category: 'IMAO',
        action: 'stop',
        daysPrior: 14,
        alertLevel: 'red',
        instructions: 'SUSPENDER 2 SEMANAS antes.',
        atcCode: 'N06AF04'
    },
    {
        id: 'moclo',
        name: 'Moclobemida',
        category: 'IMAO-A',
        action: 'stop',
        daysPrior: 1,
        alertLevel: 'yellow',
        instructions: 'Suspender 24h antes (Reversible).',
        atcCode: 'N06AG02'
    },
    {
        id: 'litio',
        name: 'Carbonato de Litio',
        category: 'Antimaníaco',
        action: 'stop',
        daysPrior: 2, // 24-72h
        alertLevel: 'red',
        instructions: 'SUSPENDER 24-72h antes (Según función renal). Riesgo toxicidad/interacción BNM.',
        atcCode: 'N05AN01'
    },
    {
        id: 'valpro',
        name: 'Valproato de Magnesio/Sódico',
        category: 'Antiepiléptico',
        action: 'continue',
        daysPrior: 0,
        alertLevel: 'green',
        instructions: 'CONTINUAR. Riesgo leve sangrado, pero convulsión intraop es peor.',
        atcCode: 'N03AG01'
    },
    {
        id: 'gaba',
        name: 'Gabapentina',
        category: 'Antiepiléptico',
        action: 'continue',
        daysPrior: 0,
        alertLevel: 'green',
        instructions: 'CONTINUAR. No suspender abruptamente.',
        atcCode: 'N03AX12'
    },
    {
        id: 'prega',
        name: 'Pregabalina',
        category: 'Antiepiléptico',
        action: 'continue',
        daysPrior: 0,
        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'N03AX16'
    },
    {
        id: 'levo_carbi',
        name: 'Levodopa / Carbidopa',
        category: 'Antiparkinson',
        action: 'continue',
        daysPrior: 0,
        alertLevel: 'green',
        instructions: 'CONTINUAR ESTRICTAMENTE. Riesgo rigidez severa.',
        atcCode: 'N04BA02'
    },
    {
        id: 'mtx',
        name: 'Metotrexato',
        category: 'FAME',
        action: 'continue',
        daysPrior: 0,
        alertLevel: 'green',
        instructions: 'CONTINUAR. No aumenta riesgo ISO.',
        atcCode: 'L01BA01'
    },
    {
        id: 'leflu',
        name: 'Leflunomida',
        category: 'FAME',
        action: 'continue',
        daysPrior: 0,
        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'L04AA13'
    },
    {
        id: 'sulfa',
        name: 'Sulfasalazina',
        category: 'FAME',
        action: 'continue',
        daysPrior: 0,
        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'A07EC01'
    },
    {
        id: 'hidrox',
        name: 'Hidroxicloroquina',
        category: 'FAME',
        action: 'continue',
        daysPrior: 0,
        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'P01BA02'
    },
    {
        id: 'aza',
        name: 'Azatioprina',
        category: 'Inmunosupresor',
        action: 'continue',
        daysPrior: 0,
        alertLevel: 'green',
        instructions: 'CONTINUAR (Excepto trasplante renal activo riesgo alto).',
        atcCode: 'L04AX01'
    },
    {
        id: 'mico',
        name: 'Micofenolato Mofetilo',
        category: 'Inmunosupresor',
        action: 'continue',
        daysPrior: 0,
        alertLevel: 'green',
        instructions: 'CONTINUAR (En LES severo).',
        atcCode: 'L04AA06'
    },
    {
        id: 'ada',
        name: 'Adalimumab',
        category: 'Biológico',
        action: 'stop',
        daysPrior: 14, // Aprox
        alertLevel: 'red',
        instructions: 'Programar cirugía al final del ciclo (Semana 3). Suspender.',
        atcCode: 'L04AB04'
    },
    {
        id: 'etaner',
        name: 'Etanercept',
        category: 'Biológico',
        action: 'stop',
        daysPrior: 7,
        alertLevel: 'red',
        instructions: 'Suspender 1 semana antes (Vida media más corta).',
        atcCode: 'L04AB01'
    },
    {
        id: 'infli',
        name: 'Infliximab',
        category: 'Biológico',
        action: 'stop',
        daysPrior: 28, // Mensual/Bimensual
        alertLevel: 'red',
        instructions: 'Operar al final del intervalo de dosis.',
        atcCode: 'L04AB02'
    },
    {
        id: 'toci',
        name: 'Tocilizumab',
        category: 'Biológico',
        action: 'stop',
        daysPrior: 14,
        alertLevel: 'red',
        instructions: 'Suspender 1 ciclo.',
        atcCode: 'L04AC07'
    },
    {
        id: 'tofa',
        name: 'Tofacitinib',
        category: 'JAK-i',
        action: 'stop',
        daysPrior: 3,
        alertLevel: 'red',
        instructions: 'SUSPENDER 3 días antes.',
        atcCode: 'L04AA29'
    },
    {
        id: 'bari',
        name: 'Baricitinib',
        category: 'JAK-i',
        action: 'stop',
        daysPrior: 3,
        alertLevel: 'red',
        instructions: 'SUSPENDER 3 días antes.',
        atcCode: 'L04AA37'
    },
    {
        id: 'ajo',
        name: 'Ajo (Suplemento)',
        category: 'Herbal',
        action: 'stop',
        daysPrior: 7,
        alertLevel: 'red',
        instructions: 'SUSPENDER 7 días antes. Riesgo sangrado (Inhibición plaquetaria).',
        keywords: ['garlic']
    },
    {
        id: 'ginkgo',
        name: 'Ginkgo Biloba',
        category: 'Herbal',
        action: 'stop',
        daysPrior: 2, // 36h
        alertLevel: 'red',
        instructions: 'SUSPENDER 36h-7 días antes. Riesgo sangrado.',
    },
    {
        id: 'ginseng',
        name: 'Ginseng',
        category: 'Herbal',
        action: 'stop',
        daysPrior: 7,
        alertLevel: 'red',
        instructions: 'SUSPENDER 7 días antes. Hipoglucemia/Sangrado.',
    },
    {
        id: 'sanjuan',
        name: 'Hierba de San Juan',
        category: 'Herbal',
        action: 'stop',
        daysPrior: 14,
        alertLevel: 'red',
        instructions: 'SUSPENDER 2 SEMANAS antes. Inductor CYP450 potente, riesgo colapso CV.',
    },
    {
        id: 'valeriana',
        name: 'Valeriana',
        category: 'Herbal',
        action: 'stop',
        daysPrior: 7, // Taper
        alertLevel: 'yellow',
        instructions: 'Reducir gradualmente. No suspender abruptamente día previo (Abstinencia GABA).',
    },
    {
        id: 'vite',
        name: 'Vitamina E (Dosis altas)',
        category: 'Suplemento',
        action: 'stop',
        daysPrior: 7,
        alertLevel: 'yellow',
        instructions: 'Suspender 7-14 días antes. Efecto antiplaquetario.',
    },
    {
        id: 'parac',
        name: 'Paracetamol',
        englishName: 'Acetaminophen',
        category: 'Analgésico',
        action: 'continue',
        daysPrior: 0,
        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'N02BE01'
    },
    {
        id: 'ketor',
        name: 'Ketorolaco',
        englishName: 'Ketorolac',
        category: 'AINE',
        action: 'stop',
        daysPrior: 1,
        alertLevel: 'red',
        instructions: 'SUSPENDER 24h antes.',
        atcCode: 'M01AB15'
    },
    {
        id: 'amoxi',
        name: 'Amoxicilina',
        category: 'Antibiótico',
        action: 'continue',
        daysPrior: 0,
        alertLevel: 'green',
        instructions: 'CONTINUAR tratamiento.',
        atcCode: 'J01CA04'
    },
    {
        id: 'atorva',
        name: 'Atorvastatina',
        category: 'Estatina',
        action: 'continue',
        daysPrior: 0,
        alertLevel: 'green',
        instructions: 'CONTINUAR. Efecto pleiotrópico protector vascular.',
        atcCode: 'C10AA05'
    },
    {
        id: 'rosuva',
        name: 'Rosuvastatina',
        category: 'Estatina',
        action: 'continue',
        daysPrior: 0,
        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'C10AA07'
    },
    {
        id: 'simva',
        name: 'Simvastatina',
        category: 'Estatina',
        action: 'continue',
        daysPrior: 0,
        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'C10AA01'
    },
    {
        id: 'ezetimiba',
        name: 'Ezetimiba',
        category: 'Hipolipemiante',
        action: 'continue',
        daysPrior: 0,
        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'C10AX09'
    },
    {
        id: 'beza',
        name: 'Bezafibrato',
        category: 'Fibrato',
        action: 'stop',
        daysPrior: 1,
        alertLevel: 'yellow',
        instructions: 'SUSPENDER 24h antes (Riesgo miopatía si asoc. estatinas + estrés qx).',
        atcCode: 'C10AB02'
    },
    {
        id: 'omepra',
        name: 'Omeprazol',
        category: 'IBP',
        action: 'continue',
        daysPrior: 0,
        alertLevel: 'green',
        instructions: 'CONTINUAR. Profilaxis úlcera estrés.',
        atcCode: 'A02BC01'
    },
    {
        id: 'panto',
        name: 'Pantoprazol',
        category: 'IBP',
        action: 'continue',
        daysPrior: 0,
        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'A02BC02'
    },
    {
        id: 'eso',
        name: 'Esomeprazol',
        category: 'IBP',
        action: 'continue',
        daysPrior: 0,
        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'A02BC05'
    },
    {
        id: 'metoclo',
        name: 'Metoclopramida',
        category: 'Procinético',
        action: 'continue',
        daysPrior: 0,
        alertLevel: 'green',
        instructions: 'CONTINUAR. Puede ayudar vaciamiento gástrico.',
        atcCode: 'A03FA01'
    },
    {
        id: 'levo',
        name: 'Levotiroxina',
        category: 'Tiroideo',
        action: 'continue',
        daysPrior: 0,
        alertLevel: 'green',
        instructions: 'CONTINUAR. Vida media muy larga (7 días), saltar 1 dosis no es crítico, pero mejor dar.',
        atcCode: 'H03AA01'
    },
    {
        id: 'metima',
        name: 'Metimazol',
        category: 'Antitiroideo',
        action: 'stop',
        daysPrior: 0,
        alertLevel: 'yellow',
        instructions: 'Omtiir dosis mañana de cirugía (Riesgo sangrado mínimo, pero evitar intraop).',
        atcCode: 'H03BB02'
    },
    {
        id: 'allo',
        name: 'Alopurinol',
        category: 'Antigotoso',
        action: 'continue',
        daysPrior: 0,
        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'M04AA01'
    },
    {
        id: 'colchi',
        name: 'Colchicina',
        category: 'Antigotoso',
        action: 'continue',
        daysPrior: 0,
        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'M04AC01'
    },
    {
        id: 'tamsulo',
        name: 'Tamsulosina',
        category: 'Alfa-Bloq',
        action: 'continue',
        daysPrior: 0,
        alertLevel: 'green',
        instructions: 'CONTINUAR. Riesgo Síndrome Iris Flácido (Avisar a oftalmólogo).',
        atcCode: 'G04CA02'
    },
    {
        id: 'ibu',
        name: 'Ibuprofeno',
        englishName: 'Ibuprofen',
        category: 'AINE',
        action: 'stop',
        daysPrior: 1,
        alertLevel: 'yellow',
        instructions: 'SUSPENDER 24h antes (Riesgo sangrado reversible).',
        atcCode: 'M01AE01'
    },
    {
        id: 'napro',
        name: 'Naproxeno',
        englishName: 'Naproxen',
        category: 'AINE',
        action: 'stop',
        daysPrior: 2,
        alertLevel: 'yellow',
        instructions: 'SUSPENDER 48h antes (Vida media más larga).',
        atcCode: 'M01AE02'
    },
    {
        id: 'diclo',
        name: 'Diclofenaco',
        englishName: 'Diclofenac',
        category: 'AINE',
        action: 'stop',
        daysPrior: 1,
        alertLevel: 'yellow',
        instructions: 'SUSPENDER 24h antes.',
        atcCode: 'M01AB05'
    },
    {
        id: 'cele',
        name: 'Celecoxib',
        category: 'AINE (COX-2)',
        action: 'continue', // Controversial, but often safe. Or stop 1 day.
        daysPrior: 0,
        alertLevel: 'green',
        instructions: 'CONTINUAR (Menor efecto antiplaquetario).',
        atcCode: 'M01AH01'
    },
    {
        id: 'indometa',
        name: 'Indometacina',
        category: 'AINE',
        action: 'stop',
        daysPrior: 2,
        alertLevel: 'yellow',
        instructions: 'SUSPENDER 48h antes.',
        atcCode: 'M01AB01'
    },
    {
        id: 'trama',
        name: 'Tramadol',
        englishName: 'Tramadol',
        category: 'Opioide',
        action: 'continue',
        daysPrior: 0,
        alertLevel: 'green',
        instructions: 'CONTINUAR. Evitar abstinencia.',
        atcCode: 'N02AX02'
    },
    {
        id: 'bupre',
        name: 'Buprenorfina',
        category: 'Opioide',
        action: 'continue',
        daysPrior: 0,
        alertLevel: 'green',
        instructions: 'CONTINUAR (Parches o SL). ¡Avisar Anestesia! (Afinidad alta receptores).',
        atcCode: 'N02AE01'
    },
    {
        id: 'morfina',
        name: 'Morfina',
        englishName: 'Morphine',
        category: 'Opioide',
        action: 'continue',
        daysPrior: 0,
        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'N02AA01'
    },
    {
        id: 'oxy',
        name: 'Oxicodona',
        category: 'Opioide',
        action: 'continue',
        daysPrior: 0,
        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'N02AA05'
    },
    {
        id: 'salbu',
        name: 'Salbutamol',
        category: 'Broncodilatador',
        action: 'continue',
        daysPrior: 0,
        alertLevel: 'green',
        instructions: 'CONTINUAR. Administrar puff previo a inducción.',
        atcCode: 'R03AC02'
    },
    {
        id: 'ipra',
        name: 'Bromuro de Ipratropio',
        category: 'Broncodilatador',
        action: 'continue',
        daysPrior: 0,
        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'R03BB01'
    },
    {
        id: 'fluti',
        name: 'Fluticasona (Inhalado)',
        category: 'Corticoide Inhalado',
        action: 'continue',
        daysPrior: 0,
        alertLevel: 'green',
        instructions: 'CONTINUAR. No suspender (riesgo hiperreactividad).',
        atcCode: 'R03BA05'
    },
    {
        id: 'teo',
        name: 'Teofilina',
        category: 'Xantina',
        action: 'continue',
        daysPrior: 0,
        alertLevel: 'yellow',
        instructions: 'CONTINUAR. Controlar niveles (Riesgo arritmias).',
        atcCode: 'R03DA04'
    },
    {
        id: 'alpraz',
        name: 'Alprazolam',
        category: 'Benzodiacepina',
        action: 'continue',
        daysPrior: 0,
        alertLevel: 'green',
        instructions: 'CONTINUAR. Si uso crónico, no suspender (abstinencia).',
        atcCode: 'N05BA12'
    },
    {
        id: 'clona',
        name: 'Clonazepam',
        category: 'Benzodiacepina',
        action: 'continue',
        daysPrior: 0,
        alertLevel: 'green',
        instructions: 'CONTINUAR. Si uso crónico, mantener dosis.',
        atcCode: 'N05BA08'
    },
    {
        id: 'lora',
        name: 'Lorazepam',
        category: 'Benzodiacepina',
        action: 'continue',
        daysPrior: 0,
        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'N05BA06'
    },
    {
        id: 'diaze',
        name: 'Diazepam',
        category: 'Benzodiacepina',
        action: 'continue',
        daysPrior: 0,
        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'N05BA01'
    },
    {
        id: 'qu etia',
        name: 'Quetiapina',
        category: 'Antipsicótico',
        action: 'continue',
        daysPrior: 0,
        alertLevel: 'green',
        instructions: 'CONTINUAR. Ojo: Prolongación QT.',
        atcCode: 'N05AH04'
    },
    {
        id: 'olanza',
        name: 'Olanzapina',
        category: 'Antipsicótico',
        action: 'continue',
        daysPrior: 0,
        alertLevel: 'green',
        instructions: 'CONTINUAR. Ojo: Sedación y QT.',
        atcCode: 'N05AH03'
    },
    {
        id: 'haloperidol',
        name: 'Haloperidol',
        category: 'Antipsicótico',
        action: 'continue',
        daysPrior: 0,
        alertLevel: 'yellow',
        instructions: 'CONTINUAR. Alto riesgo QT y extrapiramidalismo con antieméticos.',
        atcCode: 'N05AD01'
    },
    {
        id: 'risperidona',
        name: 'Risperidona',
        category: 'Antipsicótico',
        action: 'continue',
        daysPrior: 0,
        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'N05AX08'
    },
    {
        id: 'cefalex',
        name: 'Cefalexina',
        category: 'Antibiótico',
        action: 'continue',

        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'J01DB01'
    },
    {
        id: 'cipro',
        name: 'Ciprofloxacino',
        category: 'Antibiótico',
        action: 'continue',

        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'J01MA02'
    },
    {
        id: 'azitro',
        name: 'Azitromicina',
        category: 'Antibiótico',
        action: 'continue',

        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'J01FA10'
    },
    {
        id: 'clari',
        name: 'Claritromicina',
        category: 'Antibiótico',
        action: 'continue',

        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'J01FA09'
    },
    {
        id: 'doxi',
        name: 'Doxiciclina',
        category: 'Antibiótico',
        action: 'continue',

        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'J01AA02'
    },
    {
        id: 'nitrofu',
        name: 'Nitrofurantoína',
        category: 'Antibiótico',
        action: 'continue',

        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'J01XE01'
    },
    {
        id: 'clinda',
        name: 'Clindamicina',
        category: 'Antibiótico',
        action: 'continue',

        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'J01FF01'
    },
    {
        id: 'levoflo',
        name: 'Levofloxacino',
        category: 'Antibiótico',
        action: 'continue',

        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'J01MA12'
    },
    {
        id: 'trimetro',
        name: 'Trimetoprima/Sulfametoxazol',
        category: 'Antibiótico',
        action: 'continue',

        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'J01EE01'
    },
    {
        id: 'lanso',
        name: 'Lansoprazol',
        category: 'IBP',
        action: 'continue',

        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'A02BC03'
    },
    {
        id: 'rabe',
        name: 'Rabeprazol',
        category: 'IBP',
        action: 'continue',

        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'A02BC04'
    },
    {
        id: 'famo',
        name: 'Famotidina',
        category: 'Antihistamínico H2',
        action: 'continue',

        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'A02BA03'
    },
    {
        id: 'sucral',
        name: 'Sucralfato',
        category: 'Gastroprotector',
        action: 'continue',

        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'A02BX02'
    },
    {
        id: 'lope',
        name: 'Loperamida',
        category: 'Antidiarreico',
        action: 'continue',

        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'A07DA03'
    },
    {
        id: 'fina',
        name: 'Finasterida',
        category: 'Urológico',
        action: 'continue',

        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'G04CB01'
    },
    {
        id: 'duta',
        name: 'Dutasterida',
        category: 'Urológico',
        action: 'continue',

        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'G04CB02'
    },
    {
        id: 'soli',
        name: 'Solifenacina',
        category: 'Urológico',
        action: 'continue',

        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'G04BD08'
    },
    {
        id: 'oxybu',
        name: 'Oxibutinina',
        category: 'Urológico',
        action: 'continue',

        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'G04BD04'
    },
    {
        id: 'timo',
        name: 'Timolol (Oftálmico)',
        category: 'Oftalmológico',
        action: 'continue',

        alertLevel: 'yellow',
        instructions: 'CONTINUAR. Vigilar bradicardia por absorción sistémica.',
        atcCode: 'S01ED01'
    },
    {
        id: 'latano',
        name: 'Latanoprost',
        category: 'Oftalmológico',
        action: 'continue',

        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'S01EE01'
    },
    {
        id: 'brimo',
        name: 'Brimonidina',
        category: 'Oftalmológico',
        action: 'continue',

        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'S01EA05'
    },
    {
        id: 'melo',
        name: 'Meloxicam',
        category: 'AINE',
        action: 'stop',
        daysPrior: 2,
        alertLevel: 'yellow',
        instructions: 'SUSPENDER 48h antes.',
        atcCode: 'M01AC06'
    },
    {
        id: 'etori',
        name: 'Etoricoxib',
        category: 'AINE (COX-2)',
        action: 'continue',

        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'M01AH05'
    },
    {
        id: 'piro',
        name: 'Piroxicam',
        category: 'AINE',
        action: 'stop',
        daysPrior: 7,
        alertLevel: 'red',
        instructions: 'SUSPENDER 7 días antes (Vida media muy larga).',
        atcCode: 'M01AC01'
    },
    {
        id: 'sulindaco',
        name: 'Sulindaco',
        category: 'AINE',
        action: 'stop',
        daysPrior: 2,
        alertLevel: 'yellow',
        instructions: 'SUSPENDER 48h antes.',
        atcCode: 'M01AB02'
    },
    {
        id: 'vitc',
        name: 'Vitamina C (PURA)',
        category: 'Suplemento',
        action: 'continue',

        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'A11GA01'
    },
    {
        id: 'vitd',
        name: 'Vitamina D',
        category: 'Suplemento',
        action: 'continue',

        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'A11CC05'
    },
    {
        id: 'hierro',
        name: 'Sulfato Ferroso',
        category: 'Suplemento',
        action: 'continue',

        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'B03AA07'
    },
    {
        id: 'calcio',
        name: 'Carbonato de Calcio',
        category: 'Suplemento',
        action: 'continue',

        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'A12AA04'
    },
    {
        id: 'magne',
        name: 'Magnesio',
        category: 'Suplemento',
        action: 'continue',

        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'A12CC'
    },
    {
        id: 'modafi',
        name: 'Modafinilo',
        category: 'Estimulante',
        action: 'stop',
        daysPrior: 1,
        alertLevel: 'red',
        instructions: 'SUSPENDER 24h antes (Riesgo inestabilidad CV).',
        atcCode: 'N06BA07'
    },
    {
        id: 'silde',
        name: 'Sildenafil (Viagra)',
        category: 'Disfución Eréctil',
        action: 'stop',
        daysPrior: 1,
        alertLevel: 'red',
        instructions: 'SUSPENDER 24h antes (Riesgo hipotensión severa si se usan nitratos).',
        atcCode: 'G04BE03'
    },
    {
        id: 'tada',
        name: 'Tadalafil (Cialis)',
        category: 'Disfución Eréctil',
        action: 'stop',
        daysPrior: 2,
        alertLevel: 'red',
        instructions: 'SUSPENDER 48h antes (Vida media larga).',
        atcCode: 'G04BE08'
    },
    {
        id: 'aripi',
        name: 'Aripiprazol',
        category: 'Antipsicótico',
        action: 'continue',

        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'N05AX12'
    },
    {
        id: 'zipra',
        name: 'Ziprasidona',
        category: 'Antipsicótico',
        action: 'continue',

        alertLevel: 'yellow',
        instructions: 'CONTINUAR. Ojo: Prolongación QT.',
        atcCode: 'N05AE04'
    },
    {
        id: 'pali',
        name: 'Paliperidona',
        category: 'Antipsicótico',
        action: 'continue',

        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'N05AX13'
    },
    {
        id: 'aco',
        name: 'Anticonceptivos Orales (Combinados)',
        category: 'Hormonal',
        action: 'stop',
        daysPrior: 28,
        alertLevel: 'red',
        instructions: 'VALORAR SUSPENSIÓN 4 SEMANAS antes en cirugía de alto riesgo trombótico.',
        atcCode: 'G03AA'
    },
    {
        id: 'thn',
        name: 'Terapia de Reemplazo Hormonal',
        category: 'Hormonal',
        action: 'stop',
        daysPrior: 28,
        alertLevel: 'red',
        instructions: 'VALORAR SUSPENSIÓN 4 SEMANAS antes.',
        atcCode: 'G03C'
    },
    {
        id: 'ralo',
        name: 'Raloxifeno',
        category: 'Modulador Estrogénico',
        action: 'stop',
        daysPrior: 7,
        alertLevel: 'red',
        instructions: 'SUSPENDER 7 días antes (Riesgo TVP).',
        atcCode: 'G03XC01'
    },
    {
        id: 'tamoxi',
        name: 'Tamoxifeno',
        category: 'Antiestrógenos',
        action: 'continue',

        alertLevel: 'yellow',
        instructions: 'CONTINUAR (En cáncer de mama). Vigilancia TVP.',
        atcCode: 'L02BA01'
    },
    {
        id: 'vosc',
        name: 'Voscina (Buscapina)',
        category: 'Antiespasmódico',
        action: 'continue',

        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'A03BB01'
    },
    {
        id: 'pinaverio',
        name: 'Bromuro de Pinaverio',
        category: 'Antiespasmódico',
        action: 'continue',

        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'A03AX04'
    },
    {
        id: 'trimebutina',
        name: 'Trimebutina',
        category: 'Antiespasmódico',
        action: 'continue',

        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'A03AA05'
    },
    {
        id: 'simeticona',
        name: 'Simeticona',
        category: 'Antiflatulento',
        action: 'continue',

        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'A03AX13'
    },
    {
        id: 'psyllium',
        name: 'Psyllium Plantago',
        category: 'Laxante',
        action: 'stop',
        daysPrior: 1,
        alertLevel: 'yellow',
        instructions: 'SUSPENDER 24h antes (Evitar masa fecal indeseada).',
        atcCode: 'A06AC01'
    },
    {
        id: 'senosidos',
        name: 'Senósidos A-B',
        category: 'Laxante',
        action: 'stop',
        daysPrior: 1,
        alertLevel: 'yellow',
        instructions: 'SUSPENDER día previo.',
        atcCode: 'A06AB06'
    },
    {
        id: 'cefadrox',
        name: 'Cefadroxilo',
        category: 'Antibiótico',
        action: 'continue',

        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'J01DB05'
    },
    {
        id: 'cefuro',
        name: 'Cefuroxima',
        category: 'Antibiótico',
        action: 'continue',

        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'J01DC02'
    },
    {
        id: 'cefdinir',
        name: 'Cefdinir',
        category: 'Antibiótico',
        action: 'continue',

        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'J01DD15'
    },
    {
        id: 'amoxiclav',
        name: 'Amoxicilina / Ácido Clavulánico',
        category: 'Antibiótico',
        action: 'continue',

        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'J01CR02'
    },
    {
        id: 'fosfo',
        name: 'Fosfomicina',
        category: 'Antibiótico',
        action: 'continue',

        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'J01XX01'
    },
    {
        id: 'metroni',
        name: 'Metronidazol',
        category: 'Antibiótico',
        action: 'continue',

        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'J01XD01'
    },
    {
        id: 'vanco',
        name: 'Vancomicina',
        category: 'Antibiótico',
        action: 'continue',

        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'J01XA01'
    },
    {
        id: 'linezolid',
        name: 'Linezolid',
        category: 'Antibiótico',
        action: 'continue',

        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'J01XX08'
    },
    {
        id: 'irbe_hctz',
        name: 'Irbesartán / Hidroclorotiazida',
        category: 'ARA-II + Diurético',
        action: 'stop',
        daysPrior: 1,
        alertLevel: 'red',
        instructions: 'SUSPENDER 24h antes (Ambos componentes requieren suspensión).',
        atcCode: 'C09DA04'
    },
    {
        id: 'losa_hctz',
        name: 'Losartán / Hidroclorotiazida',
        category: 'ARA-II + Diurético',
        action: 'stop',
        daysPrior: 1,
        alertLevel: 'red',
        instructions: 'SUSPENDER 24h antes.',
        atcCode: 'C09DA01'
    },
    {
        id: 'telmi_hctz',
        name: 'Telmisartán / Hidroclorotiazida',
        category: 'ARA-II + Diurético',
        action: 'stop',
        daysPrior: 1,
        alertLevel: 'red',
        instructions: 'SUSPENDER 24h antes.',
        atcCode: 'C09DA07'
    },
    {
        id: 'valsa_hctz',
        name: 'Valsartán / Hidroclorotiazida',
        category: 'ARA-II + Diurético',
        action: 'stop',
        daysPrior: 1,
        alertLevel: 'red',
        instructions: 'SUSPENDER 24h antes.',
        atcCode: 'C09DA03'
    },
    {
        id: 'spirono_hctz',
        name: 'Espironolactona / Hidroclorotiazida',
        category: 'Diuréticos',
        action: 'stop',
        daysPrior: 1,
        alertLevel: 'red',
        instructions: 'SUSPENDER 24h antes.',
        atcCode: 'C03EA01'
    },
    {
        id: 'triamterene',
        name: 'Triamtereno / Hidroclorotiazida',
        category: 'Diuréticos',
        action: 'stop',
        daysPrior: 1,
        alertLevel: 'red',
        instructions: 'SUSPENDER 24h antes.',
        atcCode: 'C03EA01'
    },
    {
        id: 'montelu',
        name: 'Montelukast',
        category: 'Antileucotrieno',
        action: 'continue',

        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'R03DC03'
    },
    {
        id: 'bud_form',
        name: 'Budesonida / Formoterol (Symbicort)',
        category: 'Combinación Respiratoria',
        action: 'continue',

        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'R03AK07'
    },
    {
        id: 'flut_salm',
        name: 'Fluticasona / Salmeterol (Seretide/Advair)',
        category: 'Combinación Respiratoria',
        action: 'continue',

        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'R03AK06'
    },
    {
        id: 'umec_vilan',
        name: 'Umeclidinio / Vilanterol (Anoro)',
        category: 'LAMA/LABA',
        action: 'continue',

        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'R03AL03'
    },
    {
        id: 'tio_olod',
        name: 'Tiotropio / Olodaterol (Stiolto)',
        category: 'LAMA/LABA',
        action: 'continue',

        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'R03AL06'
    },
    {
        id: 'febuxo',
        name: 'Febuxostat',
        category: 'Antigotoso',
        action: 'continue',

        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'M04AA03'
    },
    {
        id: 'raniti',
        name: 'Ranitidina',
        category: 'Anti-H2',
        action: 'continue',

        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'A02BA02'
    },
    {
        id: 'cimetidina',
        name: 'Cimetidina',
        category: 'Anti-H2',
        action: 'continue',

        alertLevel: 'yellow',
        instructions: 'CONTINUAR. Ojo con interacciones citocromo P450.',
        atcCode: 'A02BA01'
    },
    {
        id: 'dompe',
        name: 'Domperidona',
        category: 'Procinético',
        action: 'continue',

        alertLevel: 'yellow',
        instructions: 'CONTINUAR. Ojo: Prolongación del intervalo QT.',
        atcCode: 'A03FA03'
    },
    {
        id: 'itoprida',
        name: 'Itoprida',
        category: 'Procinético',
        action: 'continue',

        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'A03FA'
    },
    {
        id: 'vitb12',
        name: 'Vitamina B12 (Cianocobalamina)',
        category: 'Suplemento',
        action: 'continue',

        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'B03BA01'
    },
    {
        id: 'vitb6',
        name: 'Vitamina B6 (Piridoxina)',
        category: 'Suplemento',
        action: 'continue',

        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'A11HA02'
    },
    {
        id: 'vitb1',
        name: 'Vitamina B1 (Tiamina)',
        category: 'Suplemento',
        action: 'continue',

        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'A11DA01'
    },
    {
        id: 'folico',
        name: 'Ácido Fólico',
        category: 'Suplemento',
        action: 'continue',

        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'B03BB01'
    },
    {
        id: 'zinc',
        name: 'Zinc (Suplemento)',
        category: 'Suplemento',
        action: 'continue',

        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'A12CB'
    },
    {
        id: 'terazo',
        name: 'Terazosina',
        category: 'Alfa-Bloq (HBP)',
        action: 'continue',

        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'G04CA03'
    },
    {
        id: 'alfuzo',
        name: 'Alfuzosina',
        category: 'Alfa-Bloq (HBP)',
        action: 'continue',

        alertLevel: 'green',
        instructions: 'CONTINUAR.',
        atcCode: 'G04CA01'
    },
    {
        id: 'armodaf',
        name: 'Armodafinilo',
        category: 'Psicoestimulante',
        action: 'stop',
        daysPrior: 1,
        alertLevel: 'red',
        instructions: 'SUSPENDER 24h antes.',
        atcCode: 'N06BA13'
    },
    {
        id: 'metilf',
        name: 'Metilfenidato (Ritalin/Concerta)',
        category: 'Psicoestimulante',
        action: 'stop',
        daysPrior: 1,
        alertLevel: 'red',
        instructions: 'SUSPENDER día de la cirugía (Riesgo hipertensión/arritmias con anestésicos).',
        atcCode: 'N06BA04'
    },
    {
        id: 'phenter',
        name: 'Fentermina',
        category: 'Anorexigénico',
        action: 'stop',
        daysPrior: 7,
        alertLevel: 'red',
        instructions: 'SUSPENDER 7 días antes (Riesgo crisis hipertensiva e inestabilidad CV importante).',
        atcCode: 'A08AA01'
    },
    {
        id: 'mazindol',
        name: 'Mazindol',
        category: 'Anorexigénico',
        action: 'stop',
        daysPrior: 7,
        alertLevel: 'red',
        instructions: 'SUSPENDER 7 días antes.',
        atcCode: 'A08AA05'
    }
];
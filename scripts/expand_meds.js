
import fs from 'fs';

const filePath = '/Users/macbookpro/Desktop/Antigravity/VPO DIGITAL /data/medications.ts';
let content = fs.readFileSync(filePath, 'utf-8');

const newMeds = [
    // --- MÁS ANTIBIÓTICOS ---
    { id: 'cefalex', name: 'Cefalexina', category: 'Antibiótico', action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR.', atcCode: 'J01DB01' },
    { id: 'cipro', name: 'Ciprofloxacino', category: 'Antibiótico', action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR.', atcCode: 'J01MA02' },
    { id: 'azitro', name: 'Azitromicina', category: 'Antibiótico', action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR.', atcCode: 'J01FA10' },
    { id: 'clari', name: 'Claritromicina', category: 'Antibiótico', action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR.', atcCode: 'J01FA09' },
    { id: 'doxi', name: 'Doxiciclina', category: 'Antibiótico', action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR.', atcCode: 'J01AA02' },
    { id: 'nitrofu', name: 'Nitrofurantoína', category: 'Antibiótico', action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR.', atcCode: 'J01XE01' },
    { id: 'clinda', name: 'Clindamicina', category: 'Antibiótico', action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR.', atcCode: 'J01FF01' },
    { id: 'levoflo', name: 'Levofloxacino', category: 'Antibiótico', action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR.', atcCode: 'J01MA12' },
    { id: 'trimetro', name: 'Trimetoprima/Sulfametoxazol', category: 'Antibiótico', action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR.', atcCode: 'J01EE01' },

    // --- MÁS GASTRO ---
    { id: 'lanso', name: 'Lansoprazol', category: 'IBP', action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR.', atcCode: 'A02BC03' },
    { id: 'rabe', name: 'Rabeprazol', category: 'IBP', action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR.', atcCode: 'A02BC04' },
    { id: 'famo', name: 'Famotidina', category: 'Antihistamínico H2', action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR.', atcCode: 'A02BA03' },
    { id: 'sucral', name: 'Sucralfato', category: 'Gastroprotector', action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR.', atcCode: 'A02BX02' },
    { id: 'lope', name: 'Loperamida', category: 'Antidiarreico', action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR.', atcCode: 'A07DA03' },

    // --- UROLOGÍA ---
    { id: 'fina', name: 'Finasterida', category: 'Urológico', action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR.', atcCode: 'G04CB01' },
    { id: 'duta', name: 'Dutasterida', category: 'Urológico', action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR.', atcCode: 'G04CB02' },
    { id: 'soli', name: 'Solifenacina', category: 'Urológico', action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR.', atcCode: 'G04BD08' },
    { id: 'oxybu', name: 'Oxibutinina', category: 'Urológico', action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR.', atcCode: 'G04BD04' },

    // --- OFTALMOLOGÍA (Glaucoma - Beta bloqueadores tópicos ¡Ojo!) ---
    { id: 'timo', name: 'Timolol (Oftálmico)', category: 'Oftalmológico', action: 'continue', alertLevel: 'yellow', instructions: 'CONTINUAR. Vigilar bradicardia por absorción sistémica.', atcCode: 'S01ED01' },
    { id: 'latano', name: 'Latanoprost', category: 'Oftalmológico', action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR.', atcCode: 'S01EE01' },
    { id: 'brimo', name: 'Brimonidina', category: 'Oftalmológico', action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR.', atcCode: 'S01EA05' },

    // --- ANALGESIA / AINES EXPANSIÓN ---
    { id: 'melo', name: 'Meloxicam', category: 'AINE', action: 'stop', daysPrior: 2, alertLevel: 'yellow', instructions: 'SUSPENDER 48h antes.', atcCode: 'M01AC06' },
    { id: 'etori', name: 'Etoricoxib', category: 'AINE (COX-2)', action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR.', atcCode: 'M01AH05' },
    { id: 'piro', name: 'Piroxicam', category: 'AINE', action: 'stop', daysPrior: 7, alertLevel: 'red', instructions: 'SUSPENDER 7 días antes (Vida media muy larga).', atcCode: 'M01AC01' },
    { id: 'sulindaco', name: 'Sulindaco', category: 'AINE', action: 'stop', daysPrior: 2, alertLevel: 'yellow', instructions: 'SUSPENDER 48h antes.', atcCode: 'M01AB02' },

    // --- VITAMINAS / SUPLEMENTOS ---
    { id: 'vitc', name: 'Vitamina C (PURA)', category: 'Suplemento', action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR.', atcCode: 'A11GA01' },
    { id: 'vitd', name: 'Vitamina D', category: 'Suplemento', action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR.', atcCode: 'A11CC05' },
    { id: 'hierro', name: 'Sulfato Ferroso', category: 'Suplemento', action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR.', atcCode: 'B03AA07' },
    { id: 'calcio', name: 'Carbonato de Calcio', category: 'Suplemento', action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR.', atcCode: 'A12AA04' },
    { id: 'magne', name: 'Magnesio', category: 'Suplemento', action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR.', atcCode: 'A12CC' },

    // --- OTROS COMUNES ---
    { id: 'colchi', name: 'Colchicina', category: 'Antigotoso', action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR.', atcCode: 'M04AC01' },
    { id: 'allo', name: 'Alopurinol', category: 'Antigotoso', action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR.', atcCode: 'M04AA01' },
    { id: 'modafi', name: 'Modafinilo', category: 'Estimulante', action: 'stop', daysPrior: 1, alertLevel: 'red', instructions: 'SUSPENDER 24h antes (Riesgo inestabilidad CV).', atcCode: 'N06BA07' },
    { id: 'silde', name: 'Sildenafil (Viagra)', category: 'Disfución Eréctil', action: 'stop', daysPrior: 1, alertLevel: 'red', instructions: 'SUSPENDER 24h antes (Riesgo hipotensión severa si se usan nitratos).', atcCode: 'G04BE03' },
    { id: 'tada', name: 'Tadalafil (Cialis)', category: 'Disfución Eréctil', action: 'stop', daysPrior: 2, alertLevel: 'red', instructions: 'SUSPENDER 48h antes (Vida media larga).', atcCode: 'G04BE08' },

    // --- ANTIPSIQUÍTICOS ATÍPICOS ---
    { id: 'aripi', name: 'Aripiprazol', category: 'Antipsicótico', action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR.', atcCode: 'N05AX12' },
    { id: 'zipra', name: 'Ziprasidona', category: 'Antipsicótico', action: 'continue', alertLevel: 'yellow', instructions: 'CONTINUAR. Ojo: Prolongación QT.', atcCode: 'N05AE04' },
    { id: 'pali', name: 'Paliperidona', category: 'Antipsicótico', action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR.', atcCode: 'N05AX13' },

    // --- ANTICONCEPTIVOS / TERAPIA HORMONAL ---
    { id: 'aco', name: 'Anticonceptivos Orales (Combinados)', category: 'Hormonal', action: 'stop', daysPrior: 28, alertLevel: 'red', instructions: 'VALORAR SUSPENSIÓN 4 SEMANAS antes en cirugía de alto riesgo trombótico.', atcCode: 'G03AA' },
    { id: 'thn', name: 'Terapia de Reemplazo Hormonal', category: 'Hormonal', action: 'stop', daysPrior: 28, alertLevel: 'red', instructions: 'VALORAR SUSPENSIÓN 4 SEMANAS antes.', atcCode: 'G03C' },
    { id: 'ralo', name: 'Raloxifeno', category: 'Modulador Estrogénico', action: 'stop', daysPrior: 7, alertLevel: 'red', instructions: 'SUSPENDER 7 días antes (Riesgo TVP).', atcCode: 'G03XC01' },
    { id: 'tamoxi', name: 'Tamoxifeno', category: 'Antiestrógenos', action: 'continue', alertLevel: 'yellow', instructions: 'CONTINUAR (En cáncer de mama). Vigilancia TVP.', atcCode: 'L02BA01' },

    // --- MISCELÁNEOS ---
    { id: 'vosc', name: 'Voscina (Buscapina)', category: 'Antiespasmódico', action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR.', atcCode: 'A03BB01' },
    { id: 'pinaverio', name: 'Bromuro de Pinaverio', category: 'Antiespasmódico', action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR.', atcCode: 'A03AX04' },
    { id: 'trimebutina', name: 'Trimebutina', category: 'Antiespasmódico', action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR.', atcCode: 'A03AA05' },
    { id: 'simeticona', name: 'Simeticona', category: 'Antiflatulento', action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR.', atcCode: 'A03AX13' },
    { id: 'psyllium', name: 'Psyllium Plantago', category: 'Laxante', action: 'stop', daysPrior: 1, alertLevel: 'yellow', instructions: 'SUSPENDER 24h antes (Evitar masa fecal indeseada).', atcCode: 'A06AC01' },
    { id: 'senosidos', name: 'Senósidos A-B', category: 'Laxante', action: 'stop', daysPrior: 1, alertLevel: 'yellow', instructions: 'SUSPENDER día previo.', atcCode: 'A06AB06' }
];

// Helper to format as JS object
const formatMed = (med) => {
    return `    {
        id: '${med.id}',
        name: '${med.name}',
        category: '${med.category}',
        action: '${med.action}',
        ${med.daysPrior !== undefined ? `daysPrior: ${med.daysPrior},` : ''}
        alertLevel: '${med.alertLevel}',
        instructions: '${med.instructions}',
        atcCode: '${med.atcCode}'
    }`;
};

const newBlocks = newMeds.map(formatMed).join(",\n");

// Insert before the last closing bracket
const lastBracketIndex = content.lastIndexOf('];');
if (lastBracketIndex === -1) {
    console.error("Could not find end of array");
    process.exit(1);
}

const updatedContent = content.substring(0, lastBracketIndex) +
    ",\n" + newBlocks + "\n" +
    content.substring(lastBracketIndex);

fs.writeFileSync(filePath, updatedContent);
console.log(`Added ${newMeds.length} more medications.`);

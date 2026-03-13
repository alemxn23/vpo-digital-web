
import fs from 'fs';

const filePath = '/Users/macbookpro/Desktop/Antigravity/VPO DIGITAL /data/medications.ts';
let content = fs.readFileSync(filePath, 'utf-8');

const additionalMeds = [
    { id: 'cefadrox', name: 'Cefadroxilo', category: 'Antibiótico', action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR.', atcCode: 'J01DB05' },
    { id: 'cefuro', name: 'Cefuroxima', category: 'Antibiótico', action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR.', atcCode: 'J01DC02' },
    { id: 'cefdinir', name: 'Cefdinir', category: 'Antibiótico', action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR.', atcCode: 'J01DD15' },
    { id: 'amoxiclav', name: 'Amoxicilina / Ácido Clavulánico', category: 'Antibiótico', action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR.', atcCode: 'J01CR02' },
    { id: 'fosfo', name: 'Fosfomicina', category: 'Antibiótico', action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR.', atcCode: 'J01XX01' },
    { id: 'metroni', name: 'Metronidazol', category: 'Antibiótico', action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR.', atcCode: 'J01XD01' },
    { id: 'vanco', name: 'Vancomicina', category: 'Antibiótico', action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR.', atcCode: 'J01XA01' },
    { id: 'linezolid', name: 'Linezolid', category: 'Antibiótico', action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR.', atcCode: 'J01XX08' },

    { id: 'irbe_hctz', name: 'Irbesartán / Hidroclorotiazida', category: 'ARA-II + Diurético', action: 'stop', daysPrior: 1, alertLevel: 'red', instructions: 'SUSPENDER 24h antes (Ambos componentes requieren suspensión).', atcCode: 'C09DA04' },
    { id: 'losa_hctz', name: 'Losartán / Hidroclorotiazida', category: 'ARA-II + Diurético', action: 'stop', daysPrior: 1, alertLevel: 'red', instructions: 'SUSPENDER 24h antes.', atcCode: 'C09DA01' },
    { id: 'telmi_hctz', name: 'Telmisartán / Hidroclorotiazida', category: 'ARA-II + Diurético', action: 'stop', daysPrior: 1, alertLevel: 'red', instructions: 'SUSPENDER 24h antes.', atcCode: 'C09DA07' },
    { id: 'valsa_hctz', name: 'Valsartán / Hidroclorotiazida', category: 'ARA-II + Diurético', action: 'stop', daysPrior: 1, alertLevel: 'red', instructions: 'SUSPENDER 24h antes.', atcCode: 'C09DA03' },

    { id: 'spirono_hctz', name: 'Espironolactona / Hidroclorotiazida', category: 'Diuréticos', action: 'stop', daysPrior: 1, alertLevel: 'red', instructions: 'SUSPENDER 24h antes.', atcCode: 'C03EA01' },
    { id: 'triamterene', name: 'Triamtereno / Hidroclorotiazida', category: 'Diuréticos', action: 'stop', daysPrior: 1, alertLevel: 'red', instructions: 'SUSPENDER 24h antes.', atcCode: 'C03EA01' },

    { id: 'montelu', name: 'Montelukast', category: 'Antileucotrieno', action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR.', atcCode: 'R03DC03' },
    { id: 'bud_form', name: 'Budesonida / Formoterol (Symbicort)', category: 'Combinación Respiratoria', action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR.', atcCode: 'R03AK07' },
    { id: 'flut_salm', name: 'Fluticasona / Salmeterol (Seretide/Advair)', category: 'Combinación Respiratoria', action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR.', atcCode: 'R03AK06' },
    { id: 'umec_vilan', name: 'Umeclidinio / Vilanterol (Anoro)', category: 'LAMA/LABA', action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR.', atcCode: 'R03AL03' },
    { id: 'tio_olod', name: 'Tiotropio / Olodaterol (Stiolto)', category: 'LAMA/LABA', action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR.', atcCode: 'R03AL06' },

    { id: 'espi_hctz', name: 'Espironolactona / Hidroclorotiazida', category: 'Diurético Combinado', action: 'stop', daysPrior: 1, alertLevel: 'red', instructions: 'SUSPENDER 24h antes.', atcCode: 'C03EA01' },

    { id: 'febuxo', name: 'Febuxostat', category: 'Antigotoso', action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR.', atcCode: 'M04AA03' },
    { id: 'allopur', name: 'Alopurinol', category: 'Antigotoso', action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR.', atcCode: 'M04AA01' },

    { id: 'raniti', name: 'Ranitidina', category: 'Anti-H2', action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR.', atcCode: 'A02BA02' },
    { id: 'cimetidina', name: 'Cimetidina', category: 'Anti-H2', action: 'continue', alertLevel: 'yellow', instructions: 'CONTINUAR. Ojo con interacciones citocromo P450.', atcCode: 'A02BA01' },

    { id: 'dompe', name: 'Domperidona', category: 'Procinético', action: 'continue', alertLevel: 'yellow', instructions: 'CONTINUAR. Ojo: Prolongación del intervalo QT.', atcCode: 'A03FA03' },
    { id: 'itoprida', name: 'Itoprida', category: 'Procinético', action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR.', atcCode: 'A03FA' },

    { id: 'vitb12', name: 'Vitamina B12 (Cianocobalamina)', category: 'Suplemento', action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR.', atcCode: 'B03BA01' },
    { id: 'vitb6', name: 'Vitamina B6 (Piridoxina)', category: 'Suplemento', action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR.', atcCode: 'A11HA02' },
    { id: 'vitb1', name: 'Vitamina B1 (Tiamina)', category: 'Suplemento', action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR.', atcCode: 'A11DA01' },
    { id: 'folico', name: 'Ácido Fólico', category: 'Suplemento', action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR.', atcCode: 'B03BB01' },
    { id: 'zinc', name: 'Zinc (Suplemento)', category: 'Suplemento', action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR.', atcCode: 'A12CB' },

    { id: 'terazo', name: 'Terazosina', category: 'Alfa-Bloq (HBP)', action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR.', atcCode: 'G04CA03' },
    { id: 'alfuzo', name: 'Alfuzosina', category: 'Alfa-Bloq (HBP)', action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR.', atcCode: 'G04CA01' },

    { id: 'modafi', name: 'Modafinilo', category: 'Psicoestimulante', action: 'stop', daysPrior: 1, alertLevel: 'red', instructions: 'SUSPENDER 24h antes.', atcCode: 'N06BA07' },
    { id: 'armodaf', name: 'Armodafinilo', category: 'Psicoestimulante', action: 'stop', daysPrior: 1, alertLevel: 'red', instructions: 'SUSPENDER 24h antes.', atcCode: 'N06BA13' },
    { id: 'metilf', name: 'Metilfenidato (Ritalin/Concerta)', category: 'Psicoestimulante', action: 'stop', daysPrior: 1, alertLevel: 'red', instructions: 'SUSPENDER día de la cirugía (Riesgo hipertensión/arritmias con anestésicos).', atcCode: 'N06BA04' },

    { id: 'phenter', name: 'Fentermina', category: 'Anorexigénico', action: 'stop', daysPrior: 7, alertLevel: 'red', instructions: 'SUSPENDER 7 días antes (Riesgo crisis hipertensiva e inestabilidad CV importante).', atcCode: 'A08AA01' },
    { id: 'mazindol', name: 'Mazindol', category: 'Anorexigénico', action: 'stop', daysPrior: 7, alertLevel: 'red', instructions: 'SUSPENDER 7 días antes.', atcCode: 'A08AA05' },

    { id: 'pregaba', name: 'Pregabalina', category: 'Gabapentinoide', action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR.', atcCode: 'N03AX16' },
    { id: 'gabapen', name: 'Gabapentina', category: 'Gabapentinoide', action: 'continue', alertLevel: 'green', instructions: 'CONTINUAR.', atcCode: 'N03AX12' }
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

const newBlocks = additionalMeds.map(formatMed).join(",\n");

const lastBracketIndex = content.lastIndexOf('];');
if (lastBracketIndex === -1) {
    console.error("Could not find end of array");
    process.exit(1);
}

const updatedContent = content.substring(0, lastBracketIndex) +
    ",\n" + newBlocks + "\n" +
    content.substring(lastBracketIndex);

fs.writeFileSync(filePath, updatedContent);
console.log(`Added ${additionalMeds.length} more medications.`);

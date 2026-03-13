
import fs from 'fs';

const filePath = '/Users/macbookpro/Desktop/Antigravity/VPO DIGITAL /data/medications.ts';
let content = fs.readFileSync(filePath, 'utf-8');

const updates = [
    { name: 'Semaglutida (Ozempic/Wegovy)', english: 'Semaglutide' },
    { name: 'Semaglutida Oral (Rybelsus)', english: 'Semaglutide' },
    { name: 'Liraglutida', english: 'Liraglutide' },
    { name: 'Dulaglutida', english: 'Dulaglutide' },
    { name: 'Tirzepatida (Mounjaro)', english: 'Tirzepatide' },
    { name: 'Dapagliflozina', english: 'Dapagliflozin' },
    { name: 'Empagliflozina', english: 'Empagliflozin' },
    { name: 'Canagliflozina', english: 'Canagliflozin' },
    { name: 'Metformina', english: 'Metformin' },
    { name: 'Warfarina', english: 'Warfarin' },
    { name: 'Rivaroxaban', english: 'Rivaroxaban' }, // Same
    { name: 'Apixaban', english: 'Apixaban' }, // Same
    { name: 'Dabigatran', english: 'Dabigatran' }, // Same
    { name: 'Aspirina (AAS)', english: 'Aspirin' },
    { name: 'Naproxeno', english: 'Naproxen' },
    { name: 'Ibuprofeno', english: 'Ibuprofen' },
    { name: 'Diclofenaco', english: 'Diclofenac' },
    { name: 'Ketorolaco', english: 'Ketorolac' },
    { name: 'Paracetamol', english: 'Acetaminophen' }, // Important! FDA uses Acetaminophen usually
    { name: 'Tramadol', english: 'Tramadol' },
    { name: 'Morfina', english: 'Morphine' },
    { name: 'Fentanilo', english: 'Fentanyl' }
];

let updatedContent = content;

updates.forEach(update => {
    // Regex to find the object block for this name
    const regex = new RegExp(`(name:\\s*'${update.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}',)([^}]*?)`, 'g');

    updatedContent = updatedContent.replace(regex, (match, nameLine, rest) => {
        // Check if englishName already exists
        if (rest.includes('englishName:')) {
            return match; // Skip if exists
        }
        // Insert englishName
        return `${nameLine}\n        englishName: '${update.english}',${rest}`;
    });
});

fs.writeFileSync(filePath, updatedContent);
console.log("English names updated.");

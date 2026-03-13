
// Mock DB based on actual file content to test logic in isolation if import fails
const MEDICATIONS_DB = [
    { id: 'parac', name: 'Paracetamol', category: 'Analgésico' },
    { id: 'ketor', name: 'Ketorolaco', category: 'AINE' },
    { id: 'ibu', name: 'Ibuprofeno', category: 'AINE' }
];

const searchTerm = "Parac";
const selectedMeds = [];

const filteredMeds = searchTerm.length > 1
    ? MEDICATIONS_DB.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()) && !selectedMeds.some(s => s.id === m.id))
    : [];

console.log(`Searching for "${searchTerm}"...`);
console.log(`Found ${filteredMeds.length} matches.`);
filteredMeds.forEach(m => console.log(`- ${m.name}`));

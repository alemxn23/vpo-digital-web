
import fs from 'fs';

const filePath = '/Users/macbookpro/Desktop/Antigravity/VPO DIGITAL /data/medications.ts';
let content = fs.readFileSync(filePath, 'utf-8');

// Extract the array content
const match = content.match(/export const MEDICATIONS_DB: SelectedMed\[\] = \[(.*)\];/s);
if (!match) {
    console.error("Could not find MEDICATIONS_DB array");
    process.exit(1);
}

const arrayContent = match[1];

// This is a naive way but we'll try to split by some pattern
// A better way is to use a simple parser or regex that finds objects { ... }
const medicationBlocks = [];
let currentBlock = "";
let braceCount = 0;
let inObject = false;

for (let i = 0; i < arrayContent.length; i++) {
    const char = arrayContent[i];
    if (char === '{') {
        if (braceCount === 0) inObject = true;
        braceCount++;
    }

    if (inObject) currentBlock += char;

    if (char === '}') {
        braceCount--;
        if (braceCount === 0) {
            medicationBlocks.push(currentBlock);
            currentBlock = "";
            inObject = false;
        }
    }
}

console.log(`Found ${medicationBlocks.length} blocks before filter`);

const uniqueMeds = new Map();
medicationBlocks.forEach(block => {
    // Extract ID and Name for hashing
    const idMatch = block.match(/id:\s*'([^']+)'/);
    const nameMatch = block.match(/name:\s*'([^']+)'/);

    if (idMatch && nameMatch) {
        const id = idMatch[1];
        const name = nameMatch[1].toLowerCase();
        // Use ID as key, but if multiple IDs exist for same drug name (like valpro vs valproato), we might want to consolidate
        // For now, let's keep it simple: unique by name
        if (!uniqueMeds.has(name)) {
            uniqueMeds.set(name, block);
        }
    }
});

console.log(`Found ${uniqueMeds.size} unique medications after filter`);

// Reconstruct
let newArrayContent = "\n    " + Array.from(uniqueMeds.values()).join(",\n    ") + "\n";

const newContent = content.substring(0, match.index) +
    "export const MEDICATIONS_DB: SelectedMed[] = [" +
    newArrayContent +
    "];";

fs.writeFileSync(filePath, newContent);
console.log("Deduplication complete.");

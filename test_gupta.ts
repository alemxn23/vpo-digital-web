import { GuptaCalculator } from './custom_services/GuptaCalculator';
import { VPOData } from './types';

// Mock VPOData
const mockDataLow = {
    edad: 30,
    creatinina: 1.0,
    asa: 'I',
    functional_status: 'independent',
    gupta_surgical_site: 'neck' // +0.18
} as unknown as VPOData;

const mockDataHigh = {
    edad: 80,
    creatinina: 2.0, // > 1.5 -> +0.61
    asa: 'IV',      // -0.95
    functional_status: 'total', // +1.03
    gupta_surgical_site: 'aortic' // +1.60
} as unknown as VPOData;

console.log("--- TEST REPORT ---");

// Test 1: Low Risk
const result1 = GuptaCalculator.calculate(mockDataLow);
console.log("Test Case 1 (Low Risk):");
console.log("  Input: 30yo, ASA I, Indep, Cr 1.0, Neck");
console.log(`  Probability: ${result1.probability.toFixed(5)}%`);
console.log(`  Risk Class: ${result1.maceRiskClass}`);
console.log(`  Output Text: ${result1.text}`);
// Expected: Very low, <1%

// Test 2: High Risk
const result2 = GuptaCalculator.calculate(mockDataHigh);
console.log("\nTest Case 2 (High Risk):");
console.log("  Input: 80yo, ASA IV, Total Dep, Cr 2.0, Aortic");
console.log(`  Probability: ${result2.probability.toFixed(5)}%`);
console.log(`  Risk Class: ${result2.maceRiskClass}`);
console.log(`  Output Text: ${result2.text}`);
// Expected: High, >1% (approx 19%)

console.log("\n--- END TEST ---");

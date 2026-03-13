import { VPOData } from '../types';

export interface GuptaResult {
    probability: number;
    maceRiskClass: string;
    text: string;
}

export class GuptaCalculator {
    // Coefficients from Gupta PK et al. Circulation 2011;124:381-387
    private static readonly COEFFICIENTS = {
        INTERCEPT: -5.309,
        AGE: 0.02,
        CREATININE_ELEVATED: 0.61, // > 1.5 mg/dL
        ASA: {
            'I': -5.17,
            'II': -3.29,
            'III': -1.92,
            'IV': -0.95,
            'V': 0.00,
            'E': -5.17,    // Default to base if E? Or treat base class. Assuming base.
            'I-E': -5.17,
            'II-E': -3.29,
            'III-E': -1.92,
            'IV-E': -0.95,
        } as Record<string, number>,
        FUNCTIONAL_STATUS: {
            'independent': 0.00,
            'partial': 0.65,
            'total': 1.03
        } as Record<string, number>,
        SURGERY_SITE: {
            'anorectal': -0.16,
            'aortic': 1.60,
            'amputation': 0.86,     // Mapped to Peripheral Vascular
            'bariatric': -0.25,
            'biliary': 0.59,
            'cardiac': 1.01,
            'ent': 0.71,
            'intestinal': 1.14,
            'intracranial': 1.40,
            'neck': 0.18,           // Thyroid/Parathyroid
            'obstetric': 0.76,      // Gynecologic
            'orthopedic': 0.80,
            'spinal': 0.21,
            'thoracic': 0.40,
            'vascular': 0.86,       // Peripheral Vascular
            'urologic': -0.26,
            'other': 0.54,          // Fallback (e.g., Skin +0.54 or Abdomen Other 1.13?, Using Skin/Avg conservative)
        } as Record<string, number>
    };

    /**
     * Calculates the Gupta MACE risk percentage.
     * @param data The VPOData object containing patient information
     * @returns GuptaResult object with probability and interpretation
     */
    public static calculate(data: VPOData): GuptaResult {
        let logit = this.COEFFICIENTS.INTERCEPT;

        // 1. Age
        const age = data.edad || 0;
        logit += age * this.COEFFICIENTS.AGE;

        // 2. Creatinine (> 1.5 mg/dL)
        // Note: data.creatinina might be undefined, handle gracefully
        if (data.creatinina > 1.5) {
            logit += this.COEFFICIENTS.CREATININE_ELEVATED;
        }

        // 3. ASA Class
        // The selector usually includes 'E' modifiers. We need to handle that.
        // Mapping keys from types.ts: "I" | "II" | "III" | "IV" | "E" | "I-E" | "II-E" | "III-E" | "IV-E"
        const asaKey = data.asa || 'I';
        // If exact match exists use it, otherwise fallback (though all should be covered)
        const asaCoeff = this.COEFFICIENTS.ASA[asaKey] ?? this.COEFFICIENTS.ASA['I'];
        logit += asaCoeff;

        // 4. Functional Status
        const funcStatus = data.functional_status || 'independent';
        const funcCoeff = this.COEFFICIENTS.FUNCTIONAL_STATUS[funcStatus] ?? 0;
        logit += funcCoeff;

        // 5. Surgery Site
        const site = data.gupta_surgical_site || 'other';
        const siteCoeff = this.COEFFICIENTS.SURGERY_SITE[site] ?? 0;
        logit += siteCoeff;

        // Calculate Probability
        // P = 1 / (1 + e^-logit)
        const probability = 1 / (1 + Math.exp(-logit));
        const percentage = probability * 100;

        // Interpretation
        let text = "";
        let maceRiskClass = "";

        if (percentage < 1) {
            maceRiskClass = "Bajo Riesgo";
            text = "Riesgo MACE Bajo (Inferior al promedio poblacional)"; // < 1%
        } else {
            maceRiskClass = "Riesgo Elevado";
            text = "Riesgo MACE Elevado. Se sugiere monitorización intraoperatoria estricta y troponinas postoperatorias";
        }

        return {
            probability: percentage,
            maceRiskClass,
            text
        };
    }
}

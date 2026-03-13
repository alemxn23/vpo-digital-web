/**
 * OpenFDA Client Service
 * Fetches official drug labeling information from the US Food & Drug Administration.
 * Focused on Safety: Boxed Warnings (Black Box) and Contraindications.
 * 
 * Documentation: https://open.fda.gov/apis/drug/label/
 * Endpoint: https://api.fda.gov/drug/label.json
 * No API Key required for low volume (< 240 req/min).
 */

const BASE_URL = 'https://api.fda.gov/drug/label.json';

export interface FDASafetyInfo {
    drugName: string;
    hasBoxedWarning: boolean;
    boxedWarning: string[];
    contraindications: string[];
    warnings: string[];
    genericName?: string;
    brandName?: string;
    lastUpdated?: string;
}

export const fetchDrugSafetyInfo = async (drugName: string): Promise<FDASafetyInfo | null> => {
    if (!drugName) return null;

    // Clean search term (remove accents as FDA is English-based, though exact matching might require English names)
    // We will search by 'openfda.brand_name' or 'openfda.generic_name'
    const query = `search=openfda.brand_name:"${encodeURIComponent(drugName)}"+openfda.generic_name:"${encodeURIComponent(drugName)}"&limit=1`;

    // Note: Searching Spanish names in US DB might fail. We might need a translation layer or rely on user entering generic names which often overlap or use the English version if known.
    // For now, we try direct search. Ideally, our MEDICATIONS_DB would have an 'englishName' field.

    try {
        const response = await fetch(`${BASE_URL}?${query}`);
        if (!response.ok) {
            console.warn(`FDA API Error: ${response.statusText}`);
            return null;
        }

        const data = await response.json();
        if (!data.results || data.results.length === 0) return null;

        const label = data.results[0];

        return {
            drugName: drugName,
            hasBoxedWarning: !!label.boxed_warning,
            boxedWarning: label.boxed_warning || [],
            contraindications: label.contraindications || [],
            warnings: label.warnings || [],
            genericName: label.openfda?.generic_name?.[0],
            brandName: label.openfda?.brand_name?.[0],
            lastUpdated: label.effective_time
        };

    } catch (error) {
        console.error("Failed to fetch FDA data", error);
        return null;
    }
};

/**
 * Returns a safety alert level based on presence of Boxed Warning
 */
export const getFDAAlertLevel = (info: FDASafetyInfo): 'CRITICAL' | 'HIGH' | 'MODERATE' => {
    if (info.hasBoxedWarning) return 'CRITICAL';
    if (info.contraindications.length > 0) return 'HIGH';
    return 'MODERATE';
};

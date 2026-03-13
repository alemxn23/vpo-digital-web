
/**
 * UniversalSearchService
 * Service to search for medications directly from OpenFDA API
 * when they are not found in the local curated database.
 */

const BASE_URL = "https://api.fda.gov/drug/label.json";

export interface OpenFDASearchResult {
    openfda: {
        brand_name?: string[];
        generic_name?: string[];
        manufacturer_name?: string[];
        product_ndc?: string[];
    };
    id: string; // generated ID or spl_id
}

export const searchOpenFDAMeds = async (query: string): Promise<OpenFDASearchResult[]> => {
    if (!query || query.length < 3) return [];

    // Search by brand_name (using wildcard)
    // Limit to 10 results for performance
    const searchQuery = `search=openfda.brand_name:"${query}*"&limit=10`;

    try {
        const response = await fetch(`${BASE_URL}?${searchQuery}`);

        if (!response.ok) {
            // 404 means no results usually
            return [];
        }

        const data = await response.json();

        if (data.results) {
            // Map to a cleaner format, filtering out entries without brand names
            return data.results
                .filter((res: any) => res.openfda && res.openfda.brand_name)
                .map((res: any) => ({
                    openfda: {
                        brand_name: res.openfda.brand_name,
                        generic_name: res.openfda.generic_name,
                        manufacturer_name: res.openfda.manufacturer_name
                    },
                    id: res.openfda.product_ndc ? res.openfda.product_ndc[0] : Math.random().toString(36).substr(2, 9)
                }));
        }

        return [];
    } catch (error) {
        console.error("OpenFDA Search Error:", error);
        return [];
    }
};

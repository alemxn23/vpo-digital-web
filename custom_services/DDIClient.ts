
/**
 * DDIClient.ts
 * Service to interact with the NLM (National Library of Medicine) Interaction API.
 * 
 * Flow:
 * 1. Resolve RxCUI (RxNorm Identifier) for drug names.
 * 2. Query for interactions between a list of RxCUIs.
 */

export interface InteractionResult {
    severity: 'high' | 'medium' | 'low' | 'none';
    description: string;
    source: string;
    pair: [string, string];
}

/**
 * Resolves a drug name to its RxCUI.
 * Uses NIH RxNav API.
 */
export async function getRxCUI(drugName: string): Promise<string | null> {
    try {
        const response = await fetch(`https://rxnav.nlm.nih.gov/REST/rxcui.json?name=${encodeURIComponent(drugName)}&search=1`);
        const data = await response.json();

        if (data.idGroup && data.idGroup.rxnormId) {
            return data.idGroup.rxnormId[0];
        }
        return null;
    } catch (error) {
        console.error("Error fetching RxCUI for", drugName, error);
        return null;
    }
}

/**
 * Fetches interactions for a list of RxCUIs.
 */
export async function fetchInteractions(rxcuis: string[]): Promise<InteractionResult[]> {
    if (rxcuis.length < 2) return [];

    try {
        const idList = rxcuis.join('+');
        const response = await fetch(`https://rxnav.nlm.nih.gov/REST/interaction/list.json?rxcuis=${idList}`);
        const data = await response.json();

        const results: InteractionResult[] = [];

        if (data.fullInteractionTypeGroup) {
            data.fullInteractionTypeGroup.forEach((group: any) => {
                group.fullInteractionType.forEach((type: any) => {
                    const interactionPair = type.interactionPair[0];
                    const description = interactionPair.description;
                    const severity = interactionPair.severity === 'high' ? 'high' : 'medium'; // NLM severity mapping

                    const drug1 = interactionPair.interactionConcept[0].minMatche.name;
                    const drug2 = interactionPair.interactionConcept[1].minMatche.name;

                    results.push({
                        severity,
                        description,
                        source: 'NLM Interaction API',
                        pair: [drug1, drug2]
                    });
                });
            });
        }

        return results;
    } catch (error) {
        console.error("Error fetching interactions", error);
        return [];
    }
}

/**
 * High-level function to check interactions for a list of medication names.
 */
export async function checkMedicationInteractions(drugNames: string[]): Promise<InteractionResult[]> {
    // 1. Resolve all RxCUIs
    const rxcuiPromises = drugNames.map(name => getRxCUI(name));
    const resolvedRxCUIs = await Promise.all(rxcuiPromises);

    const validRxCUIs = resolvedRxCUIs.filter((id): id is string => id !== null);

    if (validRxCUIs.length < 2) return [];

    // 2. Fetch interactions
    return await fetchInteractions(validRxCUIs);
}

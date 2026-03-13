import { EMA_DATABASE } from '../data/ema_medications';
import { SelectedMed } from '../types';

/**
 * Simulates an API call to a European Medicines Agency (EMA) database.
 * In reality, this searches our local curated list of European/International drugs
 * that are often missing from US-centric databases (FDA).
 */
export const searchEMAMeds = async (query: string): Promise<SelectedMed[]> => {
    // Simulate network latency (300-600ms) for realism
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 300));

    if (!query || query.length < 3) return [];

    const lowerQuery = query.toLowerCase();

    return EMA_DATABASE.filter(med => {
        const nameMatch = med.name.toLowerCase().includes(lowerQuery);
        const keywordMatch = med.keywords?.some(k => k.toLowerCase().includes(lowerQuery));
        return nameMatch || keywordMatch;
    });
};

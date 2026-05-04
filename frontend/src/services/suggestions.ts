import { api } from './api';
import type { Suggestion, SuggestionHistory } from '../types';

export const suggestionsService = {
    async getSuggestions(genre?: string, skipHistory: boolean = false): Promise<Suggestion> {
        const params = new URLSearchParams();
        if (genre) params.set('genre', genre);
        if (skipHistory) params.set('skip_history', 'true');
        const qs = params.toString();
        const url = `/api/suggestions${qs ? `?${qs}` : ''}`;
        return api.get<Suggestion>(url);
    },

    async getHistory(): Promise<SuggestionHistory[]> {
        return api.get<SuggestionHistory[]>('/api/suggestions/history');
    },
};

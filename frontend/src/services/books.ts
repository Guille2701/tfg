import { api } from './api';
import type { Book } from '../types';

export const booksService = {
    async getAll(): Promise<Book[]> {
        return api.get<Book[]>('/api/books');
    },

    async search(query?: string, genero?: string): Promise<Book[]> {
        const params = new URLSearchParams();
        if (query) params.set('q', query);
        if (genero) params.set('genero', genero);
        const qs = params.toString();
        return api.get<Book[]>(`/api/books${qs ? `?${qs}` : ''}`);
    },

    async searchByName(name: string): Promise<Book[]> {
        return api.get<Book[]>(`/api/books/${encodeURIComponent(name)}`);
    },

    async getGenres(): Promise<string[]> {
        return api.get<string[]>('/api/books/genres');
    },
};

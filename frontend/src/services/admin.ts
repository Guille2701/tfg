import { api } from './api';
import type { Book, Event, User } from '../types';

// ═══════════════════════════════════════════
//  Admin Service - Requiere ROLE_ADMIN
// ═══════════════════════════════════════════

export const adminService = {
    // --- Uploads ---
    async uploadImage(file: File): Promise<{ url: string }> {
        const formData = new FormData();
        formData.append('file', file);
        return api.post<{ url: string; message: string }>('/api/admin/upload', formData);
    },

    // --- Libros ---
    async createBook(data: Partial<Book> & { nombre_libro: string; autor: string; estanteria: string; balda: string; cod_barras: string; sinopsis: string }): Promise<Book> {
        return api.post<Book>('/api/admin/books', data);
    },

    async updateBook(id: number, data: Partial<Book>): Promise<Book> {
        return api.put<Book>(`/api/admin/books/${id}`, data);
    },

    async deleteBook(id: number): Promise<{ message: string }> {
        return api.delete<{ message: string }>(`/api/admin/books/${id}`);
    },

    // --- Eventos ---
    async createEvent(data: {
        title: string;
        category: string;
        description: string;
        event_date: string;
        time: string;
        location: string;
        category_color?: string;
        image_url?: string;
    }): Promise<Event> {
        return api.post<Event>('/api/admin/events', data);
    },

    async updateEvent(id: number, data: Partial<Event>): Promise<Event> {
        return api.put<Event>(`/api/admin/events/${id}`, data);
    },

    async deleteEvent(id: number): Promise<{ message: string }> {
        return api.delete<{ message: string }>(`/api/admin/events/${id}`);
    },

    // --- Usuarios ---
    async getUsers(): Promise<User[]> {
        return api.get<User[]>('/api/admin/users');
    },

    async createUser(data: {
        username: string;
        password: string;
        email: string;
        nombre?: string;
        is_minor?: boolean;
        roles?: string[];
    }): Promise<User> {
        return api.post<User>('/api/admin/users', data);
    },

    async updateUser(id: number, data: Partial<User & { password?: string }>): Promise<User> {
        return api.put<User>(`/api/admin/users/${id}`, data);
    },

    async deleteUser(id: number): Promise<{ message: string }> {
        return api.delete<{ message: string }>(`/api/admin/users/${id}`);
    },
};

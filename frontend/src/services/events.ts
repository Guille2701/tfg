import { api } from './api';
import type { Event } from '../types';

export const eventsService = {
    async getAll(): Promise<Event[]> {
        return api.get<Event[]>('/api/events');
    },
};

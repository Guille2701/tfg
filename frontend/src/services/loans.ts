import { api } from './api';
import type { Loan, SuspensionStatus } from '../types';

export const loansService = {
    async getMyLoans(): Promise<Loan[]> {
        return api.get<Loan[]>('/api/loans/my');
    },

    async getAllLoans(): Promise<Loan[]> {
        return api.get<Loan[]>('/api/loans/all');
    },

    async getLoanStatus(): Promise<SuspensionStatus> {
        return api.get<SuspensionStatus>('/api/loans/status');
    },

    async createLoan(bookId: number): Promise<{ message: string; loan: Loan }> {
        return api.post<{ message: string; loan: Loan }>('/api/loans/', { book_id: bookId });
    },

    async returnLoan(loanId: number): Promise<{ message: string; loan: Loan }> {
        return api.put<{ message: string; loan: Loan }>(`/api/loans/${loanId}/return`, {});
    },
};

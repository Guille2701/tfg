
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

class ApiService {
    private baseUrl: string;

    constructor() {
        this.baseUrl = API_URL;
    }

    private getAuthHeaders(isFormData: boolean = false): HeadersInit {
        const token = localStorage.getItem('access_token');
        const headers: HeadersInit = {
            ...(token && { Authorization: `Bearer ${token}` }),
        };

        if (!isFormData) {
            (headers as any)['Content-Type'] = 'application/json';
        }

        return headers;
    }

    async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;

        // Detección más robusta de FormData para evitar errores de instanceof
        const isFormData = !!(options.body instanceof FormData ||
            (options.body && typeof (options.body as any).append === 'function'));

        const authHeaders = this.getAuthHeaders(isFormData);

        const config: RequestInit = {
            ...options,
            headers: {
                ...authHeaders,
                ...options.headers,
            },
        };

        try {
            const response = await fetch(url, config);

            if (!response.ok) {
                // Flask-JWT-Extended suele usar el campo 'msg' para errores
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.message || errorData.msg || errorData.error || `Error HTTP ${response.status}`;
                throw new Error(errorMessage);
            }

            return await response.json();
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Error desconocido al conectar con el servidor');
        }
    }

    async get<T>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, { method: 'GET' });
    }

    async post<T>(endpoint: string, data?: unknown): Promise<T> {
        const isFormData = data instanceof FormData;
        return this.request<T>(endpoint, {
            method: 'POST',
            body: isFormData ? (data as any) : JSON.stringify(data),
        });
    }

    async put<T>(endpoint: string, data?: unknown): Promise<T> {
        const isFormData = data instanceof FormData;
        return this.request<T>(endpoint, {
            method: 'PUT',
            body: isFormData ? (data as any) : JSON.stringify(data),
        });
    }

    async delete<T>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, { method: 'DELETE' });
    }
}

export const api = new ApiService();

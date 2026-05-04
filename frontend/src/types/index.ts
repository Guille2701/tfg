// User types
export interface User {
    id: number;
    username: string;
    nombre?: string;
    email: string;
    is_minor?: boolean;
    responsible_adult_email?: string;
    roles: string[];
}

export interface LoginCredentials {
    username: string;
    password: string;
}

export interface RegisterData {
    username: string;
    password: string;
    email: string;
    is_minor?: boolean;
    responsible_adult_email?: string;
    responsible_adult_id?: number;  // Optional, but email is preferred for initial registration
}

export interface AuthResponse {
    access_token: string;
    user: User;
}

// Book types
export interface Book {
    id: number;
    nombreLibro: string;
    autor: string;
    estanteria: string;
    balda: string;
    codBarras: string;
    prestado: boolean;
    genero: string;
    sinopsis?: string;
    imageUrl?: string;
    hidden?: boolean;
}

// Event types
export interface Event {
    id: number;
    title: string;
    category: string;
    categoryColor: string;
    description: string;
    eventDate: string;
    day: string;
    month: string;
    time: string;
    location: string;
    imageUrl?: string;
}

// Loan types
export interface Loan {
    id: number;
    user_id: number;
    book_id: number;
    book: Book;
    loan_date: string;
    expected_return_date: string;
    return_date?: string;
    penalty_days?: number;
    user?: {
        id: number;
        username: string;
        nombre?: string;
        email: string;
    };
}

export interface SuspensionStatus {
    suspended: boolean;
    suspension_until: string | null;
    days_remaining: number;
    total_penalty_days: number;
}

// Suggestion types
export interface Suggestion {
    suggestions: Book[];
    explanation?: string;
    timestamp: string;
}

export interface SuggestionHistory {
    timestamp: string;
    suggestions: Book[];
}

// API Error type
export interface ApiError {
    error: string;
    message?: string;
}

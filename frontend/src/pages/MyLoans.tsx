import { useState, useEffect } from 'react';
import { loansService } from '../services/loans';
import { useAuth } from '../contexts/AuthContext';
import { API_URL } from '../services/api';
import type { Loan, SuspensionStatus } from '../types';

const MyLoans = () => {
    const { isAuthenticated, isAdmin } = useAuth();
    const [loans, setLoans] = useState<Loan[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [showHistory, setShowHistory] = useState(false);
    const [returningLoanId, setReturningLoanId] = useState<number | null>(null);
    const [returnSuccess, setReturnSuccess] = useState<number | null>(null);
    const [returnError, setReturnError] = useState<{ loanId: number; message: string } | null>(null);
    const [suspension, setSuspension] = useState<SuspensionStatus | null>(null);

    useEffect(() => {
        if (isAuthenticated) {
            loadLoans();
            if (!isAdmin) {
                loansService.getLoanStatus()
                    .then(setSuspension)
                    .catch(() => {/* silencioso */});
            }
        }
    }, [isAuthenticated, isAdmin]);

    const loadLoans = async () => {
        try {
            setIsLoading(true);
            setError('');
            // Si es admin, cargar todos los préstamos; si no, solo los del usuario
            const data = isAdmin
                ? await loansService.getAllLoans()
                : await loansService.getMyLoans();
            setLoans(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar préstamos');
        } finally {
            setIsLoading(false);
        }
    };

    const handleReturnLoan = async (loanId: number) => {
        setReturningLoanId(loanId);
        setReturnError(null);
        setReturnSuccess(null);

        try {
            await loansService.returnLoan(loanId);
            setReturnSuccess(loanId);
            setTimeout(() => setReturnSuccess(null), 3000);
            // Recargar préstamos para actualizar la vista
            await loadLoans();
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Error al devolver el libro';
            setReturnError({ loanId, message: errorMessage });
            setTimeout(() => setReturnError(null), 5000);
        } finally {
            setReturningLoanId(null);
        }
    };

    // Separate active and returned loans
    const activeLoans = loans.filter(loan => !loan.return_date);
    const returnedLoans = loans.filter(loan => loan.return_date);

    // Format date
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Calculate days remaining
    const getDaysRemaining = (expectedReturnDate: string) => {
        const today = new Date();
        const returnDate = new Date(expectedReturnDate);
        const diffTime = returnDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    // Get status badge
    const getStatusBadge = (loan: Loan) => {
        if (loan.return_date) {
            if (loan.penalty_days && loan.penalty_days > 0) {
                return (
                    <div className="px-3 py-1 bg-red-100 text-red-600 text-xs font-bold rounded-full flex items-center gap-1">
                        <span className="material-icons text-xs">warning</span>
                        Devuelto con retraso ({loan.penalty_days}d)
                    </div>
                );
            }
            return (
                <div className="px-3 py-1 bg-[#c5e0cf] text-[#2c5040] text-xs font-bold rounded-full flex items-center gap-1">
                    <span className="material-icons text-xs">check_circle</span>
                    Devuelto
                </div>
            );
        }

        const daysRemaining = getDaysRemaining(loan.expected_return_date);

        if (daysRemaining < 0) {
            return (
                <div className="px-3 py-1 bg-red-100 text-red-600 text-xs font-bold rounded-full flex items-center gap-1">
                    <span className="material-icons text-xs">error</span>
                    Vencido ({Math.abs(daysRemaining)} días)
                </div>
            );
        } else if (daysRemaining <= 3) {
            return (
                <div className="px-3 py-1 bg-orange-100 text-orange-600 text-xs font-bold rounded-full flex items-center gap-1">
                    <span className="material-icons text-xs">warning</span>
                    {daysRemaining} días restantes
                </div>
            );
        } else {
            return (
                <div className="px-3 py-1 bg-green-100 text-green-600 text-xs font-bold rounded-full flex items-center gap-1">
                    <span className="material-icons text-xs">schedule</span>
                    {daysRemaining} días restantes
                </div>
            );
        }
    };

    // Render loan card
    const LoanCard = ({ loan }: { loan: Loan }) => {
        const imageUrl = loan.book.imageUrl?.startsWith('http')
            ? loan.book.imageUrl
            : (loan.book.imageUrl ? `${API_URL}${loan.book.imageUrl}` : null);

        return (
            <div className="bg-[#dff0e8] rounded-2xl overflow-hidden border border-[#90c9a5] shadow-sm hover:shadow-lg transition-all">
                <div className="flex flex-col sm:flex-row">
                    {/* Book Image */}
                    <div className="w-full sm:w-48 h-64 sm:h-auto bg-[#c5e0cf] flex items-center justify-center relative">
                        {imageUrl ? (
                            <img
                                src={imageUrl}
                                alt={loan.book.nombreLibro}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span className="material-icons text-6xl text-slate-300">auto_stories</span>
                        )}
                    </div>

                    {/* Loan Info */}
                    <div className="flex-1 p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-slate-900 mb-1">
                                    {loan.book.nombreLibro}
                                </h3>
                                <p className="text-[#3d6e58] mb-2">
                                    {loan.book.autor}
                                </p>
                                {loan.book.genero && (
                                    <span className="inline-block px-2 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full">
                                        {loan.book.genero}
                                    </span>
                                )}
                            </div>
                            {getStatusBadge(loan)}
                        </div>

                        {/* Admin: Show user info */}
                        {isAdmin && loan.user && (
                            <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                                <div className="flex items-center gap-2 text-blue-700 font-semibold mb-1">
                                    <span className="material-icons text-sm">person</span>
                                    <span>Usuario</span>
                                </div>
                                <div className="ml-6 space-y-1 text-[#2c5040]">
                                    <div>{loan.user.nombre || loan.user.username}</div>
                                    <div className="text-xs">{loan.user.email}</div>
                                </div>
                            </div>
                        )}

                        <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 text-[#2c5040]">
                                <span className="material-icons text-sm">event</span>
                                <span>Préstamo: {formatDate(loan.loan_date)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-[#2c5040]">
                                <span className="material-icons text-sm">event_available</span>
                                <span>Devolución esperada: {formatDate(loan.expected_return_date)}</span>
                            </div>
                            {loan.return_date && (
                                <div className="flex items-center gap-2 text-[#2c5040]">
                                    <span className="material-icons text-sm">check_circle</span>
                                    <span>Devuelto: {formatDate(loan.return_date)}</span>
                                </div>
                            )}
                            {loan.penalty_days != null && loan.penalty_days > 0 && (
                                <div className="flex items-center gap-2 text-red-500 font-semibold">
                                    <span className="material-icons text-sm">gavel</span>
                                    <span>Penalización: {loan.penalty_days} día(s) de retraso</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2 text-[#2c5040]">
                                <span className="material-icons text-sm">place</span>
                                <span>Estantería {loan.book.estanteria}, Balda {loan.book.balda}</span>
                            </div>
                        </div>

                        {/* Admin: Return button for active loans */}
                        {isAdmin && !loan.return_date && (
                            <div className="mt-4 pt-4 border-t border-[#90c9a5]">
                                {/* Error message */}
                                {returnError?.loanId === loan.id && (
                                    <div className="mb-2 p-2 bg-red-50 text-red-600 rounded-lg text-xs">
                                        {returnError.message}
                                    </div>
                                )}

                                {/* Success message */}
                                {returnSuccess === loan.id && (
                                    <div className="mb-2 p-2 bg-green-50 text-green-600 rounded-lg text-xs flex items-center gap-1">
                                        <span className="material-icons text-sm">check_circle</span>
                                        Libro devuelto exitosamente
                                    </div>
                                )}

                                <button
                                    onClick={() => handleReturnLoan(loan.id)}
                                    disabled={returningLoanId === loan.id || returnSuccess === loan.id}
                                    className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-primary text-white rounded-xl hover:bg-opacity-90 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {returningLoanId === loan.id ? (
                                        <>
                                            <span className="material-icons text-sm animate-spin">refresh</span>
                                            Procesando...
                                        </>
                                    ) : returnSuccess === loan.id ? (
                                        <>
                                            <span className="material-icons text-sm">check_circle</span>
                                            Devuelto
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-icons text-sm">assignment_return</span>
                                            Marcar como devuelto
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    if (!isAuthenticated) {
        return (
            <div className="pt-32 pb-20 px-6 min-h-screen bg-[#d4ecdf]">
                <div className="max-w-4xl mx-auto text-center">
                    <span className="material-icons text-6xl text-[#3d6e58] mb-4">lock</span>
                    <h2 className="text-3xl font-bold mb-4">Acceso restringido</h2>
                    <p className="text-[#2c5040]">
                        Debes iniciar sesión para ver tus préstamos.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="pt-32 pb-20 px-6 min-h-screen bg-[#d4ecdf]">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-12 text-center max-w-3xl mx-auto">
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary font-semibold rounded-full text-xs uppercase tracking-wider mb-6 border border-primary/20">
                        <span className="material-icons text-sm">book</span>
                        {isAdmin ? 'Gestión de Préstamos' : 'Mis Préstamos'}
                    </span>
                    <h1 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900 tracking-tight">
                        {isAdmin ? 'Todos los préstamos' : 'Gestiona tus libros'}
                    </h1>
                    <p className="text-lg text-[#2c5040] leading-relaxed">
                        {isAdmin
                            ? 'Vista completa de todos los préstamos de la biblioteca, tanto vigentes como históricos.'
                            : 'Aquí puedes ver todos tus préstamos activos y el historial completo.'
                        }
                    </p>
                </div>

                {/* Suspension Banner (only for non-admin users) */}
                {!isAdmin && suspension?.suspended && (
                    <div className="mb-8 max-w-3xl mx-auto p-5 bg-red-50 border border-red-300 rounded-2xl flex items-start gap-4 shadow-sm">
                        <span className="material-icons text-red-500 text-3xl mt-0.5 shrink-0">gavel</span>
                        <div className="flex-1">
                            <h3 className="text-red-700 font-bold text-base mb-1">
                                Cuenta suspendida temporalmente
                            </h3>
                            <p className="text-red-600 text-sm leading-relaxed">
                                No puedes solicitar nuevos préstamos hasta el{' '}
                                <strong>
                                    {new Date(suspension.suspension_until!).toLocaleDateString('es-ES', {
                                        year: 'numeric', month: 'long', day: 'numeric'
                                    })}
                                </strong>{' '}
                                ({suspension.days_remaining} día(s) restante(s)).
                            </p>
                            <p className="text-red-500 text-xs mt-1">
                                Penalización acumulada: {suspension.total_penalty_days} día(s) de retraso en devoluciones anteriores.
                            </p>
                        </div>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="mb-8 max-w-2xl mx-auto p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3">
                        <span className="material-icons text-red-500">error_outline</span>
                        <p className="text-red-600 font-medium">{error}</p>
                    </div>
                )}

                {/* Loading State */}
                {isLoading && (
                    <div className="text-center py-32">
                        <div className="inline-block w-12 h-12 border-4 border-[#90c9a5] border-t-primary rounded-full animate-spin"></div>
                        <p className="mt-4 text-[#3d6e58] font-medium animate-pulse">
                            Cargando préstamos...
                        </p>
                    </div>
                )}

                {/* Active Loans Section */}
                {!isLoading && (
                    <>
                        <div className="mb-12">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                                    <span className="material-icons text-primary">library_books</span>
                                    Préstamos Vigentes
                                    <span className="ml-2 px-3 py-1 bg-primary/10 text-primary text-sm font-bold rounded-full">
                                        {activeLoans.length}
                                    </span>
                                </h2>
                            </div>

                            {activeLoans.length > 0 ? (
                                <div className="space-y-4">
                                    {activeLoans.map((loan) => (
                                        <LoanCard key={loan.id} loan={loan} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-16 bg-[#dff0e8] rounded-2xl border border-[#90c9a5]">
                                    <span className="material-icons text-6xl text-slate-300 mb-4">
                                        library_books
                                    </span>
                                    <h3 className="text-xl font-bold text-[#3d6e58] mb-2">
                                        No tienes préstamos activos
                                    </h3>
                                    <p className="text-[#3d6e58]">
                                        Visita la biblioteca para solicitar un libro.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* History Section */}
                        {returnedLoans.length > 0 && (
                            <div className="mb-12">
                                <button
                                    onClick={() => setShowHistory(!showHistory)}
                                    className="w-full flex items-center justify-between p-6 bg-[#dff0e8] rounded-2xl border border-[#90c9a5] hover:shadow-lg transition-all mb-4"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="material-icons text-[#3d6e58]">history</span>
                                        <h2 className="text-xl font-bold text-slate-900">
                                            Historial de Préstamos
                                        </h2>
                                        <span className="px-3 py-1 bg-[#c5e0cf] text-[#2c5040] text-sm font-bold rounded-full">
                                            {returnedLoans.length}
                                        </span>
                                    </div>
                                    <span className={`material-icons transition-transform ${showHistory ? 'rotate-180' : ''}`}>
                                        expand_more
                                    </span>
                                </button>

                                {showHistory && (
                                    <div className="space-y-4">
                                        {returnedLoans.map((loan) => (
                                            <LoanCard key={loan.id} loan={loan} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Empty State - No loans at all */}
                        {loans.length === 0 && (
                            <div className="text-center py-20">
                                <span className="material-icons text-6xl text-[#3d6e58] mb-4">
                                    menu_book
                                </span>
                                <h3 className="text-2xl font-bold text-[#3d6e58] mb-2">
                                    Aún no has solicitado ningún préstamo
                                </h3>
                                <p className="text-[#3d6e58] mb-6">
                                    Explora nuestra biblioteca y solicita tu primer libro.
                                </p>
                                <a
                                    href="/biblioteca"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-opacity-90 transition-all shadow-lg shadow-primary/20"
                                >
                                    <span className="material-icons">library_books</span>
                                    Ir a la Biblioteca
                                </a>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default MyLoans;

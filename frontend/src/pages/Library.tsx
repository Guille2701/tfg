import { useState, useEffect, useCallback } from 'react';
import { booksService } from '../services/books';
import { adminService } from '../services/admin';
import { loansService } from '../services/loans';
import { useAuth } from '../contexts/AuthContext';
import { API_URL } from '../services/api';
import type { Book, SuspensionStatus } from '../types';

const Library = () => {
    const { isAdmin, isAuthenticated } = useAuth();
    const [books, setBooks] = useState<Book[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [generoFilter, setGeneroFilter] = useState('');

    // Loan state
    const [loaningBookId, setLoaningBookId] = useState<number | null>(null);
    const [loanSuccess, setLoanSuccess] = useState<number | null>(null);
    const [loanError, setLoanError] = useState<{ bookId: number; message: string } | null>(null);
    const [suspension, setSuspension] = useState<SuspensionStatus | null>(null);

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [editingBook, setEditingBook] = useState<Book | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [formData, setFormData] = useState({
        nombre_libro: '',
        autor: '',
        estanteria: '',
        balda: '',
        cod_barras: '',
        sinopsis: '',
        genero: '',
        image_url: '',
    });

    // Real-time search with debounce
    const searchBooks = useCallback(async (query: string, genero: string) => {
        try {
            setIsLoading(true);
            setError('');
            const data = await booksService.search(query || undefined, genero || undefined);
            setBooks(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar libros');
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Debounce effect: search on every keystroke with 300ms delay
    useEffect(() => {
        const timer = setTimeout(() => {
            searchBooks(searchTerm, generoFilter);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm, generoFilter, searchBooks]);

    // Fetch suspension status for authenticated non-admin users
    useEffect(() => {
        if (isAuthenticated && !isAdmin) {
            loansService.getLoanStatus()
                .then(setSuspension)
                .catch(() => {/* silencioso */});
        }
    }, [isAuthenticated, isAdmin]);

    // Admin: open create modal
    const handleCreate = () => {
        setEditingBook(null);
        setImageFile(null);
        setFormData({
            nombre_libro: '',
            autor: '',
            estanteria: '',
            balda: '',
            cod_barras: '',
            sinopsis: '',
            genero: '',
            image_url: '',
        });
        setShowModal(true);
    };

    // Admin: open edit modal
    const handleEdit = (book: Book) => {
        setEditingBook(book);
        setImageFile(null);
        setFormData({
            nombre_libro: book.nombreLibro,
            autor: book.autor,
            estanteria: book.estanteria,
            balda: book.balda,
            cod_barras: book.codBarras,
            sinopsis: book.sinopsis || '',
            genero: book.genero || '',
            image_url: book.imageUrl || '',
        });
        setShowModal(true);
    };

    // Admin: delete book
    const handleDelete = async (bookId: number) => {
        if (!confirm('¿Estás seguro de que quieres eliminar este libro?')) return;
        try {
            await adminService.deleteBook(bookId);
            searchBooks(searchTerm, generoFilter);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al eliminar libro');
        }
    };

    // Admin: save (create or update)
    const handleSave = async () => {
        // Validar campos requeridos
        if (!formData.nombre_libro || !formData.autor || !formData.estanteria ||
            !formData.balda || !formData.cod_barras || !formData.sinopsis) {
            setError('Todos los campos marcados con * son obligatorios');
            return;
        }

        try {
            setError(''); // Limpiar error previo
            setIsUploading(true);
            let finalImageUrl = formData.image_url;

            // If a local file is selected, upload it first
            if (imageFile) {
                const uploadRes = await adminService.uploadImage(imageFile);
                finalImageUrl = uploadRes.url;
            }

            const dataToSave = { ...formData, image_url: finalImageUrl };

            if (editingBook) {
                await adminService.updateBook(editingBook.id, dataToSave);
            } else {
                await adminService.createBook(dataToSave as any);
            }
            setShowModal(false);
            searchBooks(searchTerm, generoFilter);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al guardar libro');
        } finally {
            setIsUploading(false);
        }
    };

    // User: Request loan
    const handleLoanRequest = async (bookId: number) => {
        if (!isAuthenticated) {
            alert('Debes iniciar sesión para solicitar un préstamo');
            return;
        }

        setLoaningBookId(bookId);
        setLoanError(null);
        setLoanSuccess(null);

        try {
            await loansService.createLoan(bookId);
            setLoanSuccess(bookId);
            setTimeout(() => setLoanSuccess(null), 3000);
            // Refresh books to update availability
            searchBooks(searchTerm, generoFilter);
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Error al solicitar el préstamo';
            setLoanError({ bookId, message: errorMessage });
            setTimeout(() => setLoanError(null), 5000);
        } finally {
            setLoaningBookId(null);
        }
    };

    // Unique genres from loaded books for the filter
    const genres = [...new Set(books.map(b => b.genero).filter(Boolean))];


    return (
        <div className="pt-32 pb-20 px-6 min-h-screen bg-[#d4ecdf]">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-12 text-center max-w-3xl mx-auto">
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary font-semibold rounded-full text-xs uppercase tracking-wider mb-6 border border-primary/20">
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                        Biblioteca Digital
                    </span>
                    <h1 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900 tracking-tight">
                        Explora nuestro catálogo
                    </h1>
                    <p className="text-lg text-[#2c5040] leading-relaxed">
                        Descubre miles de historias, conocimientos y aventuras en nuestra colección.
                        Utiliza los filtros para encontrar tu próxima lectura.
                    </p>
                </div>

                {/* Search + Filter Bar */}
                <div className="mb-12 max-w-4xl mx-auto space-y-4">
                    <div className="flex gap-4 flex-col sm:flex-row p-1">
                        <div className="flex-1 relative group">
                            <span className="material-icons absolute left-5 top-1/2 -translate-y-1/2 text-[#3d6e58] group-focus-within:text-primary transition-colors">search</span>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Buscar por título, autor..."
                                className="w-full pl-14 pr-6 py-4 rounded-xl border border-[#90c9a5] bg-[#dff0e8] focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-lg shadow-sm hover:shadow-md"
                            />
                        </div>
                        <div className="relative">
                            <select
                                value={generoFilter}
                                onChange={(e) => setGeneroFilter(e.target.value)}
                                className="appearance-none px-6 py-4 pr-12 rounded-xl border border-[#90c9a5] bg-[#dff0e8] focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-lg min-w-[220px] shadow-sm hover:shadow-md cursor-pointer"
                            >
                                <option value="">Todos los géneros</option>
                                {genres.map((g) => (
                                    <option key={g} value={g}>{g}</option>
                                ))}
                            </select>
                            <span className="material-icons absolute right-4 top-1/2 -translate-y-1/2 text-[#3d6e58] pointer-events-none">expand_more</span>
                        </div>
                    </div>

                    {/* Admin: Create button */}
                    {isAdmin && (
                        <div className="flex justify-end pt-4">
                            <button
                                onClick={handleCreate}
                                className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-opacity-90 transition-all shadow-lg shadow-primary/20 hover:-translate-y-0.5"
                            >
                                <span className="material-icons">add</span>
                                Añadir nuevo libro
                            </button>
                        </div>
                    )}
                </div>

                {/* Suspension Banner */}
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
                            Cargando colección...
                        </p>
                    </div>
                )}

                {/* Books Grid */}
                {!isLoading && books.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {books.map((book) => (
                            <div
                                key={book.id}
                                className="group bg-[#dff0e8] rounded-2xl overflow-hidden border border-[#90c9a5] shadow-sm hover:shadow-xl hover:shadow-slate-300/60 transition-all duration-300 hover:-translate-y-1 flex flex-col h-full"
                            >
                                {/* Book Image */}
                                <div className="h-72 bg-[#cfe8d8] flex items-center justify-center relative overflow-hidden">
                                    {book.imageUrl ? (
                                        <img
                                            src={book.imageUrl.startsWith('http') ? book.imageUrl : `${API_URL}${book.imageUrl}`}
                                            alt={book.nombreLibro}
                                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700 ease-out"
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center text-slate-300">
                                            <span className="material-icons text-6xl mb-2">auto_stories</span>
                                            <span className="text-sm font-medium">Sin portada</span>
                                        </div>
                                    )}

                                    {/* Action Buttons Overlay (Admin) */}
                                    {isAdmin && (
                                        <div className="absolute top-4 left-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleEdit(book); }}
                                                className="p-2 bg-white/90 backdrop-blur-md text-[#1f3d30] rounded-full hover:text-primary shadow-lg transition-colors"
                                                title="Editar"
                                            >
                                                <span className="material-icons text-sm">edit</span>
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDelete(book.id!); }}
                                                className="p-2 bg-white/90 backdrop-blur-md text-[#1f3d30] rounded-full hover:text-red-500 shadow-lg transition-colors"
                                                title="Eliminar"
                                            >
                                                <span className="material-icons text-sm">delete</span>
                                            </button>
                                        </div>
                                    )}

                                    {/* Status Badge */}
                                    <div className="absolute top-4 right-4 z-10">
                                        {book.prestado ? (
                                            <div className="px-3 py-1 bg-red-500/90 backdrop-blur-md text-white text-xs font-bold rounded-full shadow-sm flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-[#dff0e8]"></span>
                                                Prestado
                                            </div>
                                        ) : (
                                            <div className="px-3 py-1 bg-green-500/90 backdrop-blur-md text-white text-xs font-bold rounded-full shadow-sm flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="w-1.5 h-1.5 rounded-full bg-[#dff0e8]"></span>
                                                Disponible
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="p-6 flex-1 flex flex-col bg-[#dff0e8] border-t border-slate-50">
                                    {book.genero && (
                                        <div className="text-xs font-bold text-primary uppercase tracking-widest mb-3 flex items-center gap-2">
                                            <span className="w-6 h-px bg-primary/30"></span>
                                            {book.genero}
                                        </div>
                                    )}
                                    <h3 className="text-lg font-bold text-slate-900 leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-2" title={book.nombreLibro}>
                                        {book.nombreLibro}
                                    </h3>
                                    <p className="text-[#3d6e58] text-sm font-medium mb-4">
                                        {book.autor}
                                    </p>
                                    {book.sinopsis && (
                                        <p className="text-sm text-[#2c5040] line-clamp-3">
                                            {book.sinopsis}
                                        </p>
                                    )}
                                    <div className="pt-2 flex items-center gap-2 text-sm text-[#3d6e58]">
                                        <span className="material-icons text-sm">place</span>
                                        Estantería {book.estanteria}, Balda {book.balda}
                                    </div>

                                    {/* Admin: Edit + Delete buttons */}
                                    {isAdmin && (
                                        <div className="flex gap-2 pt-3 border-t border-[#90c9a5] mt-3">
                                            <button
                                                onClick={() => handleEdit(book)}
                                                className="flex-1 flex items-center justify-center gap-1 py-2 px-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors text-sm font-semibold"
                                            >
                                                <span className="material-icons text-sm">edit</span>
                                                Editar
                                            </button>
                                            <button
                                                onClick={() => handleDelete(book.id)}
                                                className="flex-1 flex items-center justify-center gap-1 py-2 px-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors text-sm font-semibold"
                                            >
                                                <span className="material-icons text-sm">delete</span>
                                                Eliminar
                                            </button>
                                        </div>
                                    )}

                                    {/* User (non-admin): Loan button */}
                                    {isAuthenticated && !isAdmin && (
                                        <div className="pt-3 border-t border-[#90c9a5] mt-3">
                                            {/* Error message */}
                                            {loanError?.bookId === book.id && (
                                                <div className="mb-2 p-2 bg-red-50 text-red-600 rounded-lg text-xs">
                                                    {loanError.message}
                                                </div>
                                            )}

                                            {/* Success message */}
                                            {loanSuccess === book.id && (
                                                <div className="mb-2 p-2 bg-green-50 text-green-600 rounded-lg text-xs flex items-center gap-1">
                                                    <span className="material-icons text-sm">check_circle</span>
                                                    Préstamo solicitado exitosamente
                                                </div>
                                            )}

                                            <button
                                                onClick={() => handleLoanRequest(book.id)}
                                                disabled={loaningBookId === book.id || loanSuccess === book.id || book.prestado || !!suspension?.suspended}
                                                className="w-full flex items-center justify-center gap-1 py-2 px-3 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-colors text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {loaningBookId === book.id ? (
                                                    <>
                                                        <span className="material-icons text-sm animate-spin">refresh</span>
                                                        Procesando...
                                                    </>
                                                ) : loanSuccess === book.id ? (
                                                    <>
                                                        <span className="material-icons text-sm">check_circle</span>
                                                        Prestado
                                                    </>
                                                ) : book.prestado ? (
                                                    <>
                                                        <span className="material-icons text-sm">block</span>
                                                        No disponible
                                                    </>
                                                ) : (
                                                    <>
                                                        <span className="material-icons text-sm">book</span>
                                                        Prestar libro
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && books.length === 0 && (
                    <div className="text-center py-20">
                        <span className="material-icons text-6xl text-[#3d6e58] mb-4">
                            search_off
                        </span>
                        <h3 className="text-2xl font-bold text-[#3d6e58] mb-2">
                            No se encontraron libros
                        </h3>
                        <p className="text-[#3d6e58]">
                            {searchTerm || generoFilter
                                ? 'Intenta con otro término de búsqueda o género'
                                : 'No hay libros disponibles en este momento'}
                        </p>
                    </div>
                )}
            </div>

            {/* Admin Modal: Create / Edit Book */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#dff0e8] rounded-3xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold">
                                {editingBook ? 'Editar libro' : 'Nuevo libro'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-[#c5e0cf] rounded-xl">
                                <span className="material-icons">close</span>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold mb-1">Título *</label>
                                <input
                                    type="text"
                                    value={formData.nombre_libro}
                                    onChange={(e) => setFormData({ ...formData, nombre_libro: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-[#90c9a5] bg-[#dff0e8] focus:border-primary outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1">Autor *</label>
                                <input
                                    type="text"
                                    value={formData.autor}
                                    onChange={(e) => setFormData({ ...formData, autor: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-[#90c9a5] bg-[#dff0e8] focus:border-primary outline-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-1">Estantería *</label>
                                    <input
                                        type="text"
                                        value={formData.estanteria}
                                        onChange={(e) => setFormData({ ...formData, estanteria: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border-2 border-[#90c9a5] bg-[#dff0e8] focus:border-primary outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1">Balda *</label>
                                    <input
                                        type="text"
                                        value={formData.balda}
                                        onChange={(e) => setFormData({ ...formData, balda: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border-2 border-[#90c9a5] bg-[#dff0e8] focus:border-primary outline-none"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-1">Código barras *</label>
                                    <input
                                        type="text"
                                        value={formData.cod_barras}
                                        onChange={(e) => setFormData({ ...formData, cod_barras: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border-2 border-[#90c9a5] bg-[#dff0e8] focus:border-primary outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1">Género</label>
                                    <input
                                        type="text"
                                        value={formData.genero}
                                        onChange={(e) => setFormData({ ...formData, genero: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border-2 border-[#90c9a5] bg-[#dff0e8] focus:border-primary outline-none"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1">Sinopsis *</label>
                                <textarea
                                    value={formData.sinopsis}
                                    onChange={(e) => setFormData({ ...formData, sinopsis: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-[#90c9a5] bg-[#dff0e8] focus:border-primary outline-none resize-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1">Imagen (Archivo o URL)</label>
                                <div className="space-y-2">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                                        className="w-full text-sm text-[#3d6e58] file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                                    />
                                    <input
                                        type="text"
                                        value={formData.image_url}
                                        placeholder="O pega una URL externa"
                                        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border-2 border-[#90c9a5] bg-[#dff0e8] focus:border-primary outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-8">
                            <button
                                onClick={() => setShowModal(false)}
                                disabled={isUploading}
                                className="flex-1 py-3 px-6 bg-[#c5e0cf] text-[#1f3d30] font-bold rounded-xl hover:bg-[#a4d4b8] transition-colors disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isUploading}
                                className="flex-1 py-3 px-6 bg-primary text-white font-bold rounded-xl hover:bg-opacity-90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isUploading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>}
                                {editingBook ? 'Guardar cambios' : 'Crear libro'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Library;

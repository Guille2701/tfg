import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { suggestionsService } from '../services/suggestions';
import { booksService } from '../services/books';
import { API_URL } from '../services/api';
import type { Book, SuggestionHistory } from '../types';

const RecommendedBookCard = ({ book }: { book: Book }) => {
    const imageUrl = book.imageUrl?.startsWith('http')
        ? book.imageUrl
        : (book.imageUrl ? `${API_URL}${book.imageUrl}` : null);

    return (
        <div className="group bg-[#dff0e8] rounded-3xl overflow-hidden border border-[#90c9a5] hover:shadow-2xl transition-all hover:-translate-y-2">
            <div className="h-56 relative overflow-hidden bg-[#c5e0cf]">
                {imageUrl ? (
                    <img src={imageUrl} alt={book.nombreLibro} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                    <div className="w-full h-full bg-linear-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                        <span className="material-icons text-6xl text-primary/40">auto_stories</span>
                    </div>
                )}
                {book.genero && (
                    <div className="absolute top-4 left-4 px-3 py-1 bg-primary text-white text-xs font-bold rounded-full uppercase tracking-wider">
                        {book.genero}
                    </div>
                )}
                <div className="absolute top-4 right-4 w-10 h-10 bg-accent/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
                    <span className="material-icons text-white text-sm">psychology</span>
                </div>
            </div>
            <div className="p-6">
                <h3 className="text-lg font-bold line-clamp-2 mb-1 group-hover:text-primary transition-colors">{book.nombreLibro}</h3>
                <p className="text-[#3d6e58] text-sm mb-3">{book.autor}</p>
                {book.sinopsis && (
                    <p className="text-[#2c5040] text-sm line-clamp-3">{book.sinopsis}</p>
                )}
            </div>
        </div>
    );
};

const HistoryEntry = ({ entry }: { entry: SuggestionHistory }) => {
    const date = new Date(entry.timestamp);
    const formattedDate = date.toLocaleDateString('es-ES', {
        day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    return (
        <div className="bg-[#dff0e8] rounded-2xl border border-[#90c9a5] p-6">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="material-icons text-primary text-sm">history</span>
                </div>
                <span className="text-sm text-[#3d6e58]">{formattedDate}</span>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2">
                {entry.suggestions.map((book) => (
                    <div key={book.id} className="shrink-0 w-32">
                        <div className="h-40 rounded-xl overflow-hidden bg-[#c5e0cf] mb-2">
                            {book.imageUrl ? (
                                <img
                                    src={book.imageUrl.startsWith('http') ? book.imageUrl : `${API_URL}${book.imageUrl}`}
                                    alt={book.nombreLibro}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <span className="material-icons text-3xl text-slate-300">auto_stories</span>
                                </div>
                            )}
                        </div>
                        <p className="text-xs font-semibold line-clamp-2">{book.nombreLibro}</p>
                        <p className="text-xs text-[#3d6e58] line-clamp-1">{book.autor}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

const Recommendations = () => {
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const navigate = useNavigate();

    const [recommendations, setRecommendations] = useState<Book[]>([]);
    const [explanation, setExplanation] = useState('');
    const [history, setHistory] = useState<SuggestionHistory[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [error, setError] = useState('');
    const [hasGenerated, setHasGenerated] = useState(false);
    const [availableGenres, setAvailableGenres] = useState<string[]>([]);
    const [selectedGenre, setSelectedGenre] = useState<string>('');
    const [activeMode, setActiveMode] = useState<'history' | 'genre' | null>(null);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate('/login');
        }
    }, [authLoading, isAuthenticated, navigate]);

    useEffect(() => {
        if (isAuthenticated) {
            loadHistory();
            loadGenres();
        }
    }, [isAuthenticated]);

    const loadGenres = async () => {
        try {
            const genres = await booksService.getGenres();
            setAvailableGenres(genres);
        } catch {
            // silent fail
        }
    };

    const loadHistory = async () => {
        setIsLoadingHistory(true);
        try {
            const data = await suggestionsService.getHistory();
            setHistory(data);
        } catch {
            // silently fail for history
        } finally {
            setIsLoadingHistory(false);
        }
    };

    const generateRecommendations = async (genre?: string, skipHistory: boolean = false) => {
        setIsLoading(true);
        setError('');
        setRecommendations([]);
        setExplanation('');
        setSelectedGenre(genre || '');

        try {
            const data = await suggestionsService.getSuggestions(genre, skipHistory);
            setRecommendations(data.suggestions);
            setExplanation(data.explanation || '');
            setHasGenerated(true);
            // Refresh history
            loadHistory();
        } catch (err: any) {
            setError(err.message || 'Error al generar recomendaciones');
        } finally {
            setIsLoading(false);
        }
    };

    if (authLoading) return null;

    return (
        <div className="min-h-screen bg-background-light pt-28 pb-16">
            <div className="max-w-7xl mx-auto px-6">
                {/* Hero Section */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary font-semibold rounded-full text-sm mb-6">
                        <span className="material-icons text-sm">psychology</span>
                        Inteligencia Artificial · Mistral
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        Recomendaciones <span className="text-primary">personalizadas</span>
                    </h1>                    <p className="text-xl text-[#3d6e58] max-w-2xl mx-auto mb-12">
                        Nuestro sistema de IA analiza tus gustos para sugerirte libros que encajen contigo.
                    </p>

                    {/* Banner Próximamente */}
                    <div className="max-w-4xl mx-auto mb-16 bg-accent/10 border-2 border-dashed border-accent/40 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-6 text-left">
                        <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-accent/20">
                            <span className="material-icons text-white text-3xl">construction</span>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-800 mb-1">¡Próximamente en Alauxa!</h3>
                            <p className="text-[#3d6e58]">
                                Estamos terminando de entrenar y configurar nuestro modelo de Inteligencia Artificial para ofrecerte las mejores recomendaciones. 
                                <span className="font-bold"> Esta funcionalidad estará activa muy pronto.</span>
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-12">
                        {/* Option 1: History */}
                        <button
                            onClick={() => {
                                setActiveMode('history');
                                generateRecommendations(undefined, false);
                            }}
                            disabled={isLoading}
                            className={`p-8 rounded-3xl border-2 transition-all text-left flex flex-col gap-4 group ${
                                activeMode === 'history' 
                                ? 'border-primary bg-primary/5 ring-4 ring-primary/10' 
                                : 'border-[#90c9a5] bg-[#dff0e8] hover:border-primary/50'
                            } ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                        >
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                <span className="material-icons">auto_awesome</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-lg mb-1">Personalizado</h3>
                                <p className="text-sm text-[#3d6e58]">Basado en tus lecturas anteriores</p>
                            </div>
                        </button>

                        {/* Option 2: Genre */}
                        <button
                            onClick={() => setActiveMode('genre')}
                            disabled={isLoading}
                            className={`p-8 rounded-3xl border-2 transition-all text-left flex flex-col gap-4 group ${
                                activeMode === 'genre' 
                                ? 'border-secondary bg-secondary/5 ring-4 ring-secondary/10' 
                                : 'border-[#90c9a5] bg-[#dff0e8] hover:border-secondary/50'
                            } ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                        >
                            <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary group-hover:scale-110 transition-transform">
                                <span className="material-icons">category</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-lg mb-1">Por Género</h3>
                                <p className="text-sm text-[#3d6e58]">Explora un tema sin contexto previo</p>
                            </div>
                        </button>
                    </div>

                    {/* Genre List (Only visible if Genre mode selected) */}
                    {activeMode === 'genre' && (
                        <div className="max-w-3xl mx-auto mb-12 p-8 bg-[#dff0e8] rounded-3xl border border-[#90c9a5] shadow-xl animate-in fade-in slide-in-from-top-4 duration-500">
                            <p className="text-center text-sm font-bold text-[#3d6e58] uppercase tracking-widest mb-6">Elige un género para comenzar</p>
                            <div className="flex flex-wrap justify-center gap-3">
                                {availableGenres.map(genre => (
                                    <button
                                        key={genre}
                                        onClick={() => generateRecommendations(genre, true)}
                                        disabled={isLoading}
                                        className={`px-5 py-3 rounded-full text-sm font-bold transition-all ${
                                            selectedGenre === genre 
                                            ? 'bg-secondary text-white shadow-lg shadow-secondary/30' 
                                            : 'bg-[#c5e0cf] text-[#2c5040] hover:bg-secondary/10 hover:text-secondary'
                                        } disabled:opacity-50`}
                                    >
                                        {genre}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-8 p-5 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
                        <span className="material-icons text-red-500 mt-0.5">error_outline</span>
                        <div>
                            <p className="font-semibold text-red-700">Error al generar recomendaciones</p>
                            <p className="text-red-600 text-sm mt-1">{error}</p>
                        </div>
                    </div>
                )}

                {/* Loading Animation */}
                {isLoading && (
                    <div className="text-center py-20">
                        <div className="relative inline-block">
                            <div className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                            <span className="material-icons absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary text-2xl">psychology</span>
                        </div>
                        <p className="mt-6 text-[#3d6e58] text-lg">La IA está analizando el catálogo...</p>
                        <p className="text-[#3d6e58] text-sm mt-1">Esto puede tardar unos segundos</p>
                    </div>
                )}

                {/* Recommendations Results */}
                {!isLoading && hasGenerated && recommendations.length > 0 && (
                    <div className="mb-16">
                        <div className="flex items-center gap-3 mb-8">
                            <span className="material-icons text-primary text-3xl">auto_awesome</span>
                            <h2 className="text-3xl font-bold">Libros recomendados para ti</h2>
                        </div>

                        {/* Book Cards Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-10">
                            {recommendations.map((book) => (
                                <RecommendedBookCard key={book.id} book={book} />
                            ))}
                        </div>

                        {/* AI Explanation */}
                        {explanation && (
                            <div className="bg-linear-to-br from-primary/5 to-secondary/5 border border-primary/20 rounded-3xl p-8">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                                        <span className="material-icons text-white">smart_toy</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">Análisis de Mistral IA</h3>
                                        <p className="text-xs text-[#3d6e58]">Explicación personalizada</p>
                                    </div>
                                </div>
                                <div className="prose prose-slate max-w-none text-sm leading-relaxed whitespace-pre-line">
                                    {explanation}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Empty state after generating */}
                {!isLoading && hasGenerated && recommendations.length === 0 && !error && (
                    <div className="text-center py-16 mb-16">
                        <div className="w-20 h-20 bg-[#c5e0cf] rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="material-icons text-4xl text-[#3d6e58]">menu_book</span>
                        </div>
                        <h3 className="text-xl font-bold text-[#3d6e58] mb-2">Sin recomendaciones disponibles</h3>
                        <p className="text-[#3d6e58] max-w-md mx-auto">
                            Pide prestado algún libro para que la IA pueda analizar tus gustos y generar recomendaciones personalizadas.
                        </p>
                    </div>
                )}

                {/* History Section */}
                {history.length > 0 && (
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <span className="material-icons text-[#3d6e58] text-2xl">history</span>
                            <h2 className="text-2xl font-bold">Historial de recomendaciones</h2>
                        </div>
                        <div className="space-y-4">
                            {history.map((entry, index) => (
                                <HistoryEntry key={index} entry={entry} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Empty history state */}
                {!isLoadingHistory && history.length === 0 && !hasGenerated && (
                    <div className="text-center py-16">
                        <div className="w-20 h-20 bg-[#cfe8d8] rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="material-icons text-4xl text-slate-300">explore</span>
                        </div>
                        <h3 className="text-xl font-bold text-[#3d6e58] mb-2">Descubre nuevas lecturas</h3>
                        <p className="text-[#3d6e58] max-w-md mx-auto">
                            Pulsa el botón de arriba para que nuestra IA analice tus gustos y te recomiende libros que te encantarán.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Recommendations;

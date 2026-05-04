import { useState } from "react"
import type { Book } from "../../types/index"
import { API_URL } from "../../services/api"
import { useAuth } from "../../contexts/AuthContext"
import { loansService } from "../../services/loans"

const BookCard = ({ book }: { book: Book }) => {
  const { isAuthenticated, isAdmin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [loanError, setLoanError] = useState<string | null>(null);
  const [loanSuccess, setLoanSuccess] = useState(false);

  const imageUrl = book.imageUrl?.startsWith('http')
    ? book.imageUrl
    : (book.imageUrl ? `${API_URL}${book.imageUrl}` : null);

  const handleLoanRequest = async () => {
    if (!isAuthenticated) {
      alert('Debes iniciar sesión para solicitar un préstamo');
      return;
    }

    setIsLoading(true);
    setLoanError(null);
    setLoanSuccess(false);

    try {
      await loansService.createLoan(book.id);
      setLoanSuccess(true);
      setTimeout(() => setLoanSuccess(false), 3000);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al solicitar el préstamo';
      setLoanError(errorMessage);
      setTimeout(() => setLoanError(null), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#dff0e8] rounded-3xl overflow-hidden border border-[#90c9a5] hover:shadow-xl transition-all h-full flex flex-col">
      <div className="h-64 relative bg-[#c5e0cf]">
        {imageUrl ? (
          <img src={imageUrl} alt={book.nombreLibro} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="material-icons text-6xl text-slate-300">auto_stories</span>
          </div>
        )}
        {book.genero && (
          <div className="absolute top-4 left-4 px-3 py-1 bg-primary text-white text-xs font-bold rounded-full uppercase tracking-wider">
            {book.genero}
          </div>
        )}
      </div>
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-xl font-bold line-clamp-2 mb-2">{book.nombreLibro}</h3>
          <p className="text-[#3d6e58] mb-4">{book.autor}</p>
        </div>

        {/* Mensajes de estado */}
        {loanSuccess && (
          <div className="mb-3 p-3 bg-green-100 text-green-800 rounded-lg text-sm">
            ✓ Préstamo solicitado exitosamente
          </div>
        )}
        {loanError && (
          <div className="mb-3 p-3 bg-red-100 text-red-800 rounded-lg text-sm">
            {loanError}
          </div>
        )}

        <div className="space-y-2">
          <button className="w-full py-3 bg-primary/10 text-primary font-bold rounded-xl hover:bg-primary hover:text-white transition-all">
            Ver detalles
          </button>

          {/* Botón de préstamo solo para usuarios no admin */}
          {isAuthenticated && !isAdmin && (
            <button
              onClick={handleLoanRequest}
              disabled={isLoading || loanSuccess}
              className="w-full py-3 bg-green-500/10 text-green-600 font-bold rounded-xl hover:bg-green-500 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="material-icons animate-spin text-xl">refresh</span>
                  Procesando...
                </>
              ) : loanSuccess ? (
                <>
                  <span className="material-icons text-xl">check_circle</span>
                  Prestado
                </>
              ) : (
                <>
                  <span className="material-icons text-xl">book</span>
                  Prestar libro
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default BookCard


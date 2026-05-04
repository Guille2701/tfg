import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await login({ username, password });
            navigate('/biblioteca');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-20"
             style={{ background: 'linear-gradient(160deg, #c8e0cf 0%, #b8d4be 100%)' }}>
            {/* Decorative blobs */}
            <div className="absolute top-24 left-10 w-72 h-72 rounded-full opacity-30 blur-3xl pointer-events-none"
                 style={{ background: 'radial-gradient(circle, #5aab6e, transparent)' }} />
            <div className="absolute bottom-16 right-10 w-56 h-56 rounded-full opacity-20 blur-3xl pointer-events-none"
                 style={{ background: 'radial-gradient(circle, #3a9fd4, transparent)' }} />

            <div className="relative w-full max-w-md animate-fade-up">
                {/* Card */}
                <div className="rounded-3xl p-8 space-y-7"
                     style={{
                         background: 'linear-gradient(145deg, #e8f5ec 0%, #daeee2 100%)',
                         border: '1px solid rgba(100,170,130,0.3)',
                         boxShadow: '0 20px 60px rgba(46,125,71,0.15), 0 4px 16px rgba(46,125,71,0.08)',
                     }}>

                    {/* Logo + header */}
                    <div className="text-center space-y-2">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-3"
                             style={{ background: 'linear-gradient(135deg, #2e7d47, #4a9e62)', boxShadow: '0 8px 24px rgba(46,125,71,0.35)' }}>
                            <span className="material-icons text-white text-3xl">menu_book</span>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight" style={{ color: '#1a3328' }}>Iniciar sesión</h1>
                        <p className="text-sm" style={{ color: '#3d6b55' }}>Accede a tu cuenta de <span className="font-bold text-primary">ALAUXA</span></p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
                             style={{ background: '#fee2e2', border: '1px solid #fca5a5' }}>
                            <span className="material-icons text-red-500 text-lg">error_outline</span>
                            <p className="text-red-700 text-sm font-medium">{error}</p>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold" style={{ color: '#1f5c34' }} htmlFor="username">
                                Usuario
                            </label>
                            <div className="relative">
                                <span className="material-icons absolute left-3.5 top-1/2 -translate-y-1/2 text-lg pointer-events-none" style={{ color: '#5aab6e' }}>person</span>
                                <input
                                    type="text" id="username" value={username} required
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Tu nombre de usuario"
                                    className="input-green pl-10"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold" style={{ color: '#1f5c34' }} htmlFor="password">
                                Contraseña
                            </label>
                            <div className="relative">
                                <span className="material-icons absolute left-3.5 top-1/2 -translate-y-1/2 text-lg pointer-events-none" style={{ color: '#5aab6e' }}>lock</span>
                                <input
                                    type="password" id="password" value={password} required
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Tu contraseña"
                                    className="input-green pl-10"
                                />
                            </div>
                        </div>

                        <button type="submit" disabled={isLoading} className="btn-primary w-full py-3.5 text-base">
                            {isLoading
                                ? <span className="flex items-center justify-center gap-2"><span className="material-icons animate-spin text-base">refresh</span>Entrando...</span>
                                : 'Iniciar sesión'}
                        </button>
                    </form>

                    {/* Links */}
                    <div className="text-center text-sm space-y-3" style={{ color: '#3d6b55' }}>
                        <p>¿No tienes cuenta?{' '}
                            <a href="/register" className="font-bold hover:underline" style={{ color: '#2e7d47' }}>
                                Regístrate aquí
                            </a>
                        </p>
                        <div style={{ borderTop: '1px solid rgba(100,170,130,0.35)' }} className="pt-3">
                            <a href="/" className="hover:text-primary transition-colors inline-flex items-center gap-1">
                                <span className="material-icons text-sm">arrow_back</span>
                                Volver al inicio
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;

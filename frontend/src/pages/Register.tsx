import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const inputIcon = (icon: string) => (
    <span className="material-icons absolute left-3.5 top-1/2 -translate-y-1/2 text-lg pointer-events-none" style={{ color: '#5aab6e' }}>{icon}</span>
);

const Register = () => {
    const [formData, setFormData] = useState({
        username: '', email: '', password: '', confirmPassword: '',
        isMinor: false, responsibleAdultEmail: '',
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (formData.password !== formData.confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }
        setIsLoading(true);
        try {
            await register({
                username: formData.username,
                email: formData.email,
                password: formData.password,
                is_minor: formData.isMinor,
                responsible_adult_email: formData.isMinor ? formData.responsibleAdultEmail : undefined,
            });
            navigate('/biblioteca');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al registrarse');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-24"
             style={{ background: 'linear-gradient(160deg, #c8e0cf 0%, #b8d4be 100%)' }}>
            {/* Blobs */}
            <div className="absolute top-20 right-12 w-64 h-64 rounded-full opacity-25 blur-3xl pointer-events-none"
                 style={{ background: 'radial-gradient(circle, #5aab6e, transparent)' }} />
            <div className="absolute bottom-20 left-12 w-48 h-48 rounded-full opacity-20 blur-3xl pointer-events-none"
                 style={{ background: 'radial-gradient(circle, #f5c842, transparent)' }} />

            <div className="relative w-full max-w-md animate-fade-up">
                <div className="rounded-3xl p-8 space-y-6"
                     style={{
                         background: 'linear-gradient(145deg, #e8f5ec 0%, #daeee2 100%)',
                         border: '1px solid rgba(100,170,130,0.3)',
                         boxShadow: '0 20px 60px rgba(46,125,71,0.15), 0 4px 16px rgba(46,125,71,0.08)',
                     }}>

                    {/* Header */}
                    <div className="text-center space-y-2">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-2"
                             style={{ background: 'linear-gradient(135deg, #2e7d47, #4a9e62)', boxShadow: '0 8px 24px rgba(46,125,71,0.35)' }}>
                            <span className="material-icons text-white text-3xl">person_add</span>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight" style={{ color: '#1a3328' }}>Crear cuenta</h1>
                        <p className="text-sm" style={{ color: '#3d6b55' }}>Únete a la comunidad de <span className="font-bold text-primary">ALAUXA</span></p>
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
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Username */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold" style={{ color: '#1f5c34' }} htmlFor="username">Usuario</label>
                            <div className="relative">
                                {inputIcon('person')}
                                <input type="text" id="username" name="username" value={formData.username}
                                    onChange={handleChange} placeholder="Elige un nombre de usuario"
                                    className="input-green pl-10" required />
                            </div>
                        </div>

                        {/* Email (only non-minor) */}
                        {!formData.isMinor && (
                            <div className="space-y-1.5">
                                <label className="block text-sm font-semibold" style={{ color: '#1f5c34' }} htmlFor="email">Email</label>
                                <div className="relative">
                                    {inputIcon('email')}
                                    <input type="email" id="email" name="email" value={formData.email}
                                        onChange={handleChange} placeholder="tu@email.com"
                                        className="input-green pl-10" required />
                                </div>
                            </div>
                        )}

                        {/* Minor checkbox */}
                        <label className="flex items-center gap-3 cursor-pointer select-none py-2 px-3 rounded-xl transition-colors hover:bg-[#c5e0cf]/40">
                            <input type="checkbox" id="isMinor" name="isMinor"
                                checked={formData.isMinor} onChange={handleChange}
                                className="w-4 h-4 rounded accent-primary" />
                            <span className="text-sm font-medium" style={{ color: '#1f3d30' }}>Soy menor de edad</span>
                        </label>

                        {/* Minor guardian */}
                        {formData.isMinor && (
                            <div className="rounded-2xl p-4 space-y-3"
                                 style={{ background: '#fffbeb', border: '1px solid #fcd34d' }}>
                                <p className="text-xs font-medium flex items-center gap-1.5" style={{ color: '#92400e' }}>
                                    <span className="material-icons text-sm">info</span>
                                    Necesitas el email de un adulto responsable
                                </p>
                                <div className="space-y-1.5">
                                    <label className="block text-sm font-semibold" style={{ color: '#1f5c34' }} htmlFor="responsibleAdultEmail">
                                        Email del adulto responsable
                                    </label>
                                    <div className="relative">
                                        {inputIcon('supervisor_account')}
                                        <input type="email" id="responsibleAdultEmail" name="responsibleAdultEmail"
                                            value={formData.responsibleAdultEmail} onChange={handleChange}
                                            placeholder="email@tutor.com" className="input-green pl-10" required />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Password */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold" style={{ color: '#1f5c34' }} htmlFor="password">Contraseña</label>
                            <div className="relative">
                                {inputIcon('lock')}
                                <input type="password" id="password" name="password" value={formData.password}
                                    onChange={handleChange} placeholder="Mínimo 6 caracteres"
                                    className="input-green pl-10" required minLength={6} />
                            </div>
                        </div>

                        {/* Confirm password */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold" style={{ color: '#1f5c34' }} htmlFor="confirmPassword">Confirmar contraseña</label>
                            <div className="relative">
                                {inputIcon('lock_reset')}
                                <input type="password" id="confirmPassword" name="confirmPassword" value={formData.confirmPassword}
                                    onChange={handleChange} placeholder="Repite tu contraseña"
                                    className="input-green pl-10" required />
                            </div>
                        </div>

                        <button type="submit" disabled={isLoading} className="btn-primary w-full py-3.5 text-base">
                            {isLoading
                                ? <span className="flex items-center justify-center gap-2"><span className="material-icons animate-spin text-base">refresh</span>Registrando...</span>
                                : 'Crear cuenta'}
                        </button>
                    </form>

                    {/* Links */}
                    <div className="text-center text-sm space-y-3" style={{ color: '#3d6b55' }}>
                        <p>¿Ya tienes cuenta?{' '}
                            <a href="/login" className="font-bold hover:underline" style={{ color: '#2e7d47' }}>Inicia sesión</a>
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

export default Register;

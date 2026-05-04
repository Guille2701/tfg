import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => { logout(); navigate('/'); };

    const navLink = "relative font-semibold transition-colors hover:text-primary after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all hover:after:w-full";

    return (
        <nav className="fixed top-0 w-full z-50 glass-nav">
            <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2.5 group">
                    <img
                        alt="Alauxa Logo"
                        className="h-11 w-auto transition-transform group-hover:scale-105"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDVxaUzHh5TzU-gpqh7gWqwteju_G3BawITwKwW_icjfE6Klc_8jfA_ffWvkgDrff_aTLnW3prducUvo31Gh6kB0JcXqLfa3Ytubw52AUB7oKGi30ODGmVyGm6M-H3vBqQQexMHTWmVGxGR1eCrKxeokuAhmvF-_8_ZS2dTqg1r1xDbaN5GaCkzB8gMn4I0x1rRLuVvlxYjRpkpkqBhAx-9b4FcoQuHaizG3WuZ076tRIRVUunci_GKN4oZgqjKsAd2UTMNDRGcq_A"
                    />
                    <span className="text-xl font-black tracking-widest text-primary">ALAUXA</span>
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-7 text-base" style={{ color: '#1f3d30' }}>
                    <Link className={navLink} to="/#eventos">Eventos</Link>
                    <Link className={navLink} to="/biblioteca">Biblioteca</Link>

                    {isAuthenticated ? (
                        <>
                            <Link className={navLink} to="/mis-prestamos">Mis Préstamos</Link>
                            <Link className={`${navLink} flex items-center gap-1`} to="/recomendaciones">
                                <span className="material-icons text-sm">psychology</span>
                                Recomendaciones IA
                            </Link>
                            <div className="flex items-center gap-3 pl-4" style={{ borderLeft: '1px solid rgba(100,170,130,0.4)' }}>
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                                     style={{ background: 'rgba(46,125,71,0.1)', border: '1px solid rgba(46,125,71,0.2)' }}>
                                    <span className="material-icons text-sm text-primary">person</span>
                                    <span className="text-sm font-semibold" style={{ color: '#2e7d47' }}>{user?.username}</span>
                                </div>
                                <button onClick={handleLogout}
                                    className="text-sm font-semibold px-4 py-1.5 rounded-full transition-all active:scale-95"
                                    style={{ background: 'rgba(220,50,50,0.08)', color: '#c0392b', border: '1px solid rgba(220,50,50,0.2)' }}
                                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(220,50,50,0.15)')}
                                    onMouseLeave={e => (e.currentTarget.style.background = 'rgba(220,50,50,0.08)')}>
                                    Cerrar sesión
                                </button>
                            </div>
                        </>
                    ) : (
                        <Link to="/login"
                            className="text-sm font-bold px-5 py-2 rounded-full text-white transition-all active:scale-95"
                            style={{ background: 'linear-gradient(135deg, #2e7d47, #4a9e62)', boxShadow: '0 4px 14px rgba(46,125,71,0.35)' }}>
                            Iniciar sesión
                        </Link>
                    )}
                </div>

                {/* Mobile toggle */}
                <button className="md:hidden p-2 rounded-xl transition-colors"
                    style={{ background: menuOpen ? 'rgba(46,125,71,0.12)' : 'transparent' }}
                    onClick={() => setMenuOpen(!menuOpen)}>
                    <span className="material-icons text-2xl" style={{ color: '#1f3d30' }}>
                        {menuOpen ? 'close' : 'menu'}
                    </span>
                </button>
            </div>

            {/* Mobile dropdown */}
            {menuOpen && (
                <div className="md:hidden px-6 py-5 flex flex-col gap-4 font-semibold shadow-lg"
                     style={{ background: '#daeee2', borderTop: '1px solid rgba(100,170,130,0.4)', color: '#1f3d30' }}>
                    <Link onClick={() => setMenuOpen(false)} to="/#eventos" className="hover:text-primary transition-colors">Eventos</Link>
                    <Link onClick={() => setMenuOpen(false)} to="/biblioteca" className="hover:text-primary transition-colors">Biblioteca</Link>
                    {isAuthenticated ? (
                        <>
                            <Link onClick={() => setMenuOpen(false)} to="/mis-prestamos" className="hover:text-primary transition-colors">Mis Préstamos</Link>
                            <Link onClick={() => setMenuOpen(false)} to="/recomendaciones" className="hover:text-primary transition-colors flex items-center gap-1">
                                <span className="material-icons text-sm">psychology</span>Recomendaciones IA
                            </Link>
                            <div style={{ borderTop: '1px solid rgba(100,170,130,0.3)' }} className="pt-3 flex items-center justify-between">
                                <span className="text-sm" style={{ color: '#3d6b55' }}>👤 {user?.username}</span>
                                <button onClick={handleLogout} className="text-sm font-semibold text-red-600 hover:text-red-700">
                                    Cerrar sesión
                                </button>
                            </div>
                        </>
                    ) : (
                        <Link onClick={() => setMenuOpen(false)} to="/login" className="text-primary font-bold">Iniciar sesión →</Link>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;

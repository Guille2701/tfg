
const Footer = () => {
    return (
        <footer className="bg-primary pt-20 pb-12 px-6 text-white">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    {/* Logo & Description */}
                    <div className="col-span-1 md:col-span-2 space-y-6">
                        <div className="flex items-center gap-3">
                            <img
                                alt="Alauxa Logo"
                                className="h-16 w-auto brightness-0 invert"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCJljIW80bpRjSlzE64xtWjH6bmU93PPEOZiTgFAYLpFIAYkflsmwkghEP_oDtudDadvEq_k5OtSowKQiUvX9iHuz9-u4VRGIyCClG0JYQ0M0zhg0e1ZDY10i62gsb1yM7w6q0dZUCwWUVJKGX8MBworGqrx_BuoqWw7KOy4idcjrcxYEgcztExhTrH1LXIsHQdGwHBdTlV09-k4bZnoLLcGktKDqe3hvnsBb1NwltV7Gr6NAWI2ojbTKMAjUrOaE2xPdWEhBkRZsw"
                            />
                            <span className="text-3xl font-bold tracking-tight">ALAUXA</span>
                        </div>
                        <p className="text-white/80 text-lg max-w-sm">
                            Trabajamos para dinamizar la vida cultural de Pinos del Valle,
                            creando puentes generacionales a través del arte y el aprendizaje.
                        </p>
                        <div className="flex gap-4">
                            <a
                                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                                href="#"
                            >
                                <span className="material-icons">facebook</span>
                            </a>
                            <a
                                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                                href="#"
                            >
                                <span className="material-icons">alternate_email</span>
                            </a>
                        </div>
                    </div>

                    {/* Enlaces útiles */}
                    <div className="space-y-6">
                        <h5 className="text-xl font-bold">Enlaces útiles</h5>
                        <ul className="space-y-4 text-white/80">
                            <li>
                                <a className="hover:text-white transition-colors" href="#">
                                    Aviso Legal
                                </a>
                            </li>
                            <li>
                                <a className="hover:text-white transition-colors" href="#">
                                    Privacidad
                                </a>
                            </li>
                            <li>
                                <a className="hover:text-white transition-colors" href="#">
                                    Contacto
                                </a>
                            </li>
                            <li>
                                <a className="hover:text-white transition-colors" href="#">
                                    Preguntas Frecuentes
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Ubicación */}
                    <div className="space-y-6">
                        <h5 className="text-xl font-bold">Ubicación</h5>
                        <p className="text-white/80">
                            Centro Cultural Alauxa
                            <br />
                            Calle de la Paz, 12
                            <br />
                            Pinos del Valle, Granada
                        </p>
                        <p className="text-white/80">
                            <strong>Tel:</strong> 958 123 456
                        </p>
                    </div>
                </div>

                {/* Copyright */}
                <div className="border-t border-white/10 pt-8 text-center text-white/60 space-y-4">
                    <p>Todos los derechos reservados 2026 ©</p>
                    <p className="text-sm">
                        Esta web ha sido diseñada y producida por dos socios de la
                        asociación cultural Alauxa
                    </p>
                    <p className="font-bold text-white/90">
                        Alvaro Bazan Diaz y Guillermo Bazan Diaz
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

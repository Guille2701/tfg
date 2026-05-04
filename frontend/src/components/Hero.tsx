import heroImg from '../assets/cultural_activities_hero.jpg';

const Hero = () => {
    return (
        <header className="pt-32 pb-24 px-6 bg-linear-to-b from-primary/5 to-transparent">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
                {/* Left Content */}
                <div className="flex-1 space-y-8 text-center md:text-left">
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/50 backdrop-blur-sm border border-[#90c9a5] text-primary font-semibold rounded-full text-xs uppercase tracking-wider shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                        Centro Cultural Alauxa
                    </span>
                    <h1 className="text-5xl md:text-7xl font-bold leading-tight tracking-tight text-slate-900">
                        Cultura para <br />
                        <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-secondary">todas las edades</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-[#2c5040] max-w-2xl leading-relaxed">
                        Un espacio vibrante en Pinos del Valle donde niños y mayores se
                        encuentran a través del arte, la lectura y la tradición.
                    </p>
                    <div className="flex flex-wrap gap-4 justify-center md:justify-start pt-2">
                        <a
                            className="px-8 py-4 bg-primary text-white text-lg font-bold rounded-xl hover:bg-opacity-90 transition-all shadow-lg shadow-primary/20 flex items-center gap-2 hover:-translate-y-0.5"
                            href="#eventos"
                        >
                            Explorar actividades
                            <span className="material-icons text-xl">arrow_forward</span>
                        </a>
                        <a
                            className="px-8 py-4 bg-[#dff0e8] border border-[#90c9a5] text-lg font-semibold rounded-xl hover:border-primary hover:text-primary transition-all shadow-sm hover:shadow-md text-[#1f3d30]"
                            href="/biblioteca"
                        >
                            Saber más
                        </a>
                    </div>
                </div>

                {/* Right Image */}
                <div className="flex-1 w-full max-w-lg">
                    <div className="relative">
                        <div className="absolute -top-10 -left-10 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
                        <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-secondary/20 rounded-full blur-3xl"></div>
                        <img
                            alt="Cultural Activities"
                            className="w-full relative z-10 rounded-2xl shadow-2xl shadow-slate-200/50 border border-white/20"
                            src={heroImg}
                        />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Hero;

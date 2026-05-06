
import { Link } from 'react-router-dom';

interface Service {
    icon: string;
    iconColor: string;
    title: string;
    description: string;
    linkText: string;
    link: string;
}

const ServicesSection = () => {
    const services: Service[] = [
        {
            icon: 'collections',
            iconColor: 'text-secondary',
            title: 'Exposiciones',
            description: 'Descubre el talento de artistas locales e internacionales en nuestra sala de muestras.',
            linkText: 'Ver catálogo →',
            link: '#eventos',

        },
        {
            icon: 'auto_stories',
            iconColor: 'text-primary',
            title: 'Biblioteca',
            description: 'Más de 2.000 títulos para todas las edades. Consulta disponibilidad y reserva online.',
            linkText: 'Ir a la biblioteca →',
            link: '/biblioteca',
        },
        {
            icon: 'volunteer_activism',
            iconColor: 'text-accent',
            title: 'Hazte Socio',
            description: 'Apoya la cultura y disfruta de ventajas exclusivas en talleres y eventos.',
            linkText: 'Información socios →',
            link: '/register',
        },
    ];

    return (
        <section className="py-20 bg-primary/5">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                {services.map((service, index) => (
                    <div
                        key={index}
                        className="p-8 bg-[#dff0e8] rounded-3xl shadow-sm border border-[#90c9a5] flex flex-col items-center text-center space-y-4"
                    >
                        <span className={`material-icons text-5xl ${service.iconColor}`}>
                            {service.icon}
                        </span>
                        <h4 className="text-2xl font-bold">{service.title}</h4>
                        <p className="text-[#2c5040]">
                            {service.description}
                        </p>
                        {service.link.startsWith('/') ? (
                            <Link className="text-primary font-bold hover:underline" to={service.link}>
                                {service.linkText}
                            </Link>
                        ) : (
                            <a className="text-primary font-bold hover:underline" href={service.link}>
                                {service.linkText}
                            </a>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
};

export default ServicesSection;

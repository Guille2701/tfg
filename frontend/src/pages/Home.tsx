import Hero from '../components/Hero';
import EventsSection from '../components/EventsSection';
import ServicesSection from '../components/ServicesSection';
import Footer from '../components/Footer';

const Home = () => {
    return (
        <div className="bg-background-light text-[#1a3328] min-h-screen">
            <Hero />
            <EventsSection />
            <ServicesSection />
            <Footer />
        </div>
    );
};

export default Home;

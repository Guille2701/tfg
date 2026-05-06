import { useState, useEffect } from 'react';
import { eventsService } from '../services/events';
import { adminService } from '../services/admin';
import { useAuth } from '../contexts/AuthContext';
import { API_URL } from '../services/api';
import type { Event } from '../types';

const EventCard = ({ event, isAdmin, onEdit, onDelete, onView }: { event: Event; isAdmin: boolean; onEdit: (e: Event) => void; onDelete: (id: number) => void; onView: (e: Event) => void }) => {
    return (
        <div
            className="group bg-[#dff0e8] rounded-4xl overflow-hidden border border-[#90c9a5] hover:shadow-2xl transition-all hover:-translate-y-2 cursor-pointer"
            onClick={() => onView(event)}
        >
            {/* Image with Date Badge */}
            <div className="h-56 relative overflow-hidden">
                {event.imageUrl ? (
                    <img
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        src={event.imageUrl.startsWith('http') ? event.imageUrl : `${API_URL}${event.imageUrl}`}
                    />
                ) : (
                    <div className="w-full h-full bg-linear-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                        <span className="material-icons text-6xl text-primary/40">event</span>
                    </div>
                )}
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-2xl text-center">
                    <span className="block text-2xl font-bold leading-none">
                        {event.day}
                    </span>
                    <span className="text-xs uppercase font-bold text-[#3d6e58]">
                        {event.month}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-8 space-y-4">
                <span className={`text-sm font-bold uppercase tracking-widest ${event.categoryColor}`}>
                    {event.category}
                </span>
                <h3 className="text-2xl font-bold group-hover:text-primary transition-colors">
                    {event.title}
                </h3>
                <div className="flex items-center gap-4 text-[#3d6e58] text-sm">
                    <span className="flex items-center gap-1">
                        <span className="material-icons text-sm">schedule</span> {event.time}
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="material-icons text-sm">place</span> {event.location}
                    </span>
                </div>
                <p className="text-[#2c5040] line-clamp-2">
                    {event.description}
                </p>

                {/* Admin buttons */}
                {isAdmin && (
                    <div className="flex gap-2 pt-3 border-t border-[#90c9a5]">
                        <button
                            onClick={(e) => { e.stopPropagation(); onEdit(event); }}
                            className="flex-1 flex items-center justify-center gap-1 py-2 px-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors text-sm font-semibold"
                        >
                            <span className="material-icons text-sm">edit</span>
                            Editar
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete(event.id); }}
                            className="flex-1 flex items-center justify-center gap-1 py-2 px-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors text-sm font-semibold"
                        >
                            <span className="material-icons text-sm">delete</span>
                            Eliminar
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

const EventsSection = () => {
    const { isAdmin } = useAuth();
    const [events, setEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);
    const [viewingEvent, setViewingEvent] = useState<Event | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        category: '',
        category_color: 'text-primary',
        description: '',
        event_date: '',
        time: '',
        location: '',
        image_url: '',
    });

    const loadEvents = async () => {
        try {
            setIsLoading(true);
            const data = await eventsService.getAll();
            setEvents(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar eventos');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadEvents();
    }, []);

    const handleCreate = () => {
        setEditingEvent(null);
        setImageFile(null);
        setFormData({
            title: '',
            category: '',
            category_color: 'text-primary',
            description: '',
            event_date: '',
            time: '',
            location: '',
            image_url: '',
        });
        setShowModal(true);
    };

    const handleEdit = (event: Event) => {
        setEditingEvent(event);
        setImageFile(null);
        setFormData({
            title: event.title,
            category: event.category,
            category_color: event.categoryColor,
            description: event.description,
            event_date: event.eventDate,
            time: event.time,
            location: event.location,
            image_url: event.imageUrl || '',
        });
        setShowModal(true);
    };

    const handleDelete = async (eventId: number) => {
        if (!confirm('¿Estás seguro de que quieres eliminar este evento?')) return;
        try {
            await adminService.deleteEvent(eventId);
            loadEvents();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al eliminar evento');
        }
    };

    const handleSave = async () => {
        // Validar campos requeridos
        if (!formData.title || !formData.category || !formData.description ||
            !formData.event_date || !formData.time || !formData.location) {
            setError('Todos los campos marcados con * son obligatorios');
            return;
        }

        try {
            setError(''); // Limpiar error previo
            setIsUploading(true);
            let finalImageUrl = formData.image_url;

            if (imageFile) {
                const uploadRes = await adminService.uploadImage(imageFile);
                finalImageUrl = uploadRes.url;
            }

            const dataToSave = { ...formData, image_url: finalImageUrl };

            if (editingEvent) {
                await adminService.updateEvent(editingEvent.id, dataToSave);
            } else {
                await adminService.createEvent(dataToSave as any);
            }
            setShowModal(false);
            loadEvents();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al guardar evento');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <section className="py-24 px-6" id="eventos">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
                    <div className="space-y-2">
                        <h2 className="text-4xl font-bold">Eventos</h2>
                        <p className="text-xl text-[#3d6e58]">
                            Actividades en el Centro Cultural Alauxa
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {isAdmin && (
                            <button
                                onClick={handleCreate}
                                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all shadow-lg shadow-green-600/20"
                            >
                                <span className="material-icons">add</span>
                                Nuevo evento
                            </button>
                        )}
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-2xl">
                        <p className="text-red-600">{error}</p>
                    </div>
                )}

                {/* Loading */}
                {isLoading && (
                    <div className="text-center py-20">
                        <div className="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <p className="mt-4 text-[#3d6e58]">Cargando eventos...</p>
                    </div>
                )}

                {/* Events Grid */}
                {!isLoading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {events.map((event) => (
                            <EventCard key={event.id} event={event} isAdmin={isAdmin} onEdit={handleEdit} onDelete={handleDelete} onView={(e) => setViewingEvent(e)} />
                        ))}

                        {events.length === 0 && (
                            <div className="flex flex-col items-center justify-center p-12 border-4 border-dashed border-[#90c9a5] rounded-4xl text-center space-y-4 min-h-[400px] col-span-full">
                                <div className="w-20 h-20 bg-[#cfe8d8] rounded-full flex items-center justify-center">
                                    <span className="material-icons text-4xl text-[#3d6e58]">
                                        calendar_today
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold text-[#3d6e58]">
                                    No hay eventos programados
                                </h3>
                                <p className="text-[#3d6e58] max-w-[200px]">
                                    Estamos planificando nuevas actividades.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Admin Modal: Create / Edit Event */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#dff0e8] rounded-3xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold">
                                {editingEvent ? 'Editar evento' : 'Nuevo evento'}
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
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-[#90c9a5] bg-[#dff0e8] focus:border-primary outline-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-1">Categoría *</label>
                                    <input
                                        type="text"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border-2 border-[#90c9a5] bg-[#dff0e8] focus:border-primary outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1">Color categoría</label>
                                    <select
                                        value={formData.category_color}
                                        onChange={(e) => setFormData({ ...formData, category_color: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border-2 border-[#90c9a5] bg-[#dff0e8] focus:border-primary outline-none"
                                    >
                                        <option value="text-primary">Azul (Primary)</option>
                                        <option value="text-secondary">Naranja (Secondary)</option>
                                        <option value="text-green-600">Verde</option>
                                        <option value="text-purple-600">Morado</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1">Descripción *</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-[#90c9a5] bg-[#dff0e8] focus:border-primary outline-none resize-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-1">Fecha *</label>
                                    <input
                                        type="date"
                                        value={formData.event_date}
                                        onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border-2 border-[#90c9a5] bg-[#dff0e8] focus:border-primary outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1">Hora *</label>
                                    <input
                                        type="text"
                                        value={formData.time}
                                        placeholder="17:00 h"
                                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border-2 border-[#90c9a5] bg-[#dff0e8] focus:border-primary outline-none"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1">Ubicación *</label>
                                <input
                                    type="text"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-[#90c9a5] bg-[#dff0e8] focus:border-primary outline-none"
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
                                {editingEvent ? 'Guardar cambios' : 'Crear evento'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* View Event Detail Modal */}
            {viewingEvent && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setViewingEvent(null)}>
                    <div className="bg-[#dff0e8] rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        {/* Image */}
                        <div className="h-64 relative overflow-hidden rounded-t-3xl">
                            {viewingEvent.imageUrl ? (
                                <img
                                    alt={viewingEvent.title}
                                    className="w-full h-full object-cover"
                                    src={viewingEvent.imageUrl.startsWith('http') ? viewingEvent.imageUrl : `${API_URL}${viewingEvent.imageUrl}`}
                                />
                            ) : (
                                <div className="w-full h-full bg-linear-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                                    <span className="material-icons text-8xl text-primary/30">event</span>
                                </div>
                            )}
                            <button
                                onClick={() => setViewingEvent(null)}
                                className="absolute top-4 right-4 w-10 h-10 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-colors"
                            >
                                <span className="material-icons">close</span>
                            </button>
                            <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-5 py-3 rounded-2xl text-center">
                                <span className="block text-3xl font-bold leading-none">{viewingEvent.day}</span>
                                <span className="text-sm uppercase font-bold text-[#3d6e58]">{viewingEvent.month}</span>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-8 space-y-6">
                            <div>
                                <span className={`text-sm font-bold uppercase tracking-widest ${viewingEvent.categoryColor}`}>
                                    {viewingEvent.category}
                                </span>
                                <h2 className="text-3xl font-bold mt-2">{viewingEvent.title}</h2>
                            </div>

                            <div className="flex flex-wrap gap-4">
                                <div className="flex items-center gap-2 px-4 py-2 bg-[#cfe8d8] rounded-xl">
                                    <span className="material-icons text-primary">calendar_today</span>
                                    <span className="font-medium">{viewingEvent.eventDate}</span>
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 bg-[#cfe8d8] rounded-xl">
                                    <span className="material-icons text-primary">schedule</span>
                                    <span className="font-medium">{viewingEvent.time}</span>
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 bg-[#cfe8d8] rounded-xl">
                                    <span className="material-icons text-primary">place</span>
                                    <span className="font-medium">{viewingEvent.location}</span>
                                </div>
                            </div>

                            <div className="border-t border-[#90c9a5] pt-6">
                                <p className="text-[#2c5040] leading-relaxed whitespace-pre-line">
                                    {viewingEvent.description}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default EventsSection;

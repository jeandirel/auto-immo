import { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { availabilityService } from '../services/availabilityService';

export default function AvailabilityCalendar({ annonceId, onDateSelect }) {
    const [unavailableDates, setUnavailableDates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedStart, setSelectedStart] = useState('');
    const [selectedEnd, setSelectedEnd] = useState('');

    useEffect(() => {
        let mounted = true;

        const loadAvailability = async () => {
            try {
                const dates = await availabilityService.getUnavailableDates(annonceId);
                if (mounted) {
                    setUnavailableDates(dates);
                    setLoading(false);
                }
            } catch (err) {
                if (mounted) {
                    setError("Impossible de charger les disponibilités");
                    setLoading(false);
                }
            }
        };

        if (annonceId) {
            loadAvailability();
        }

        return () => { mounted = false; };
    }, [annonceId]);

    const handleDateChange = (start, end) => {
        setSelectedStart(start);
        setSelectedEnd(end);

        if (onDateSelect) {
            onDateSelect({ start, end });
        }
    };

    if (loading) return <div className="p-4 text-center text-gray-500">Chargement du calendrier...</div>;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-4">
                <Calendar className="text-primary" size={20} />
                <h3 className="font-bold text-gray-800">Disponibilités</h3>
            </div>

            {error && (
                <div className="text-red-500 text-sm mb-4 bg-red-50 p-2 rounded">
                    {error}
                </div>
            )}

            <div className="space-y-3">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Arrivée</label>
                    <input
                        type="date"
                        className="w-full border rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                        min={new Date().toISOString().split('T')[0]}
                        value={selectedStart}
                        onChange={(e) => handleDateChange(e.target.value, selectedEnd)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Départ</label>
                    <input
                        type="date"
                        className="w-full border rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                        min={selectedStart || new Date().toISOString().split('T')[0]}
                        value={selectedEnd}
                        onChange={(e) => handleDateChange(selectedStart, e.target.value)}
                    />
                </div>
            </div>

            {/* Légende simple */}
            <div className="mt-4 flex gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    Disponible
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-400"></div>
                    Réservé
                </div>
            </div>
        </div>
    );
}

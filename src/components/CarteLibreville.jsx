import React, { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Leaflet with Webpack/Vite
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Coordinates for Libreville
const LIBREVILLE_CENTER = [0.4162, 9.4673];

// Sample neighborhoods
const QUARTIERS = [
    { name: "Centre-Ville", coords: [0.390, 9.454] },
    { name: "Louis", coords: [0.405, 9.445] },
    { name: "Montagne Sainte", coords: [0.395, 9.460] },
    { name: "Glass", coords: [0.380, 9.470] },
    { name: "Oloumi", coords: [0.370, 9.480] },
    { name: "Lalala", coords: [0.360, 9.490] },
    { name: "Nzeng-Ayong", coords: [0.430, 9.500] },
    { name: "Akanda", coords: [0.500, 9.400] },
    { name: "Owendo", coords: [0.300, 9.500] },
];

function CarteLibreville() {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);

    useEffect(() => {
        // Initialize map if not already initialized
        if (mapRef.current && !mapInstanceRef.current) {
            const map = L.map(mapRef.current).setView(LIBREVILLE_CENTER, 13);
            mapInstanceRef.current = map;

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);

            // Add markers
            QUARTIERS.forEach(quartier => {
                L.marker(quartier.coords)
                    .addTo(map)
                    .bindPopup(`
                        <div class="text-center">
                            <strong class="text-primary text-lg">${quartier.name}</strong><br/>
                            <span class="text-gray-600 text-sm">Zone couverte par Auto-Immo</span>
                        </div>
                    `);
            });
        }

        // Cleanup on unmount
        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    const flyToQuartier = (coords) => {
        if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo(coords, 15);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6 text-center text-primary">Nos Zones d'Intervention à Libreville</h1>
            <p className="text-center mb-6 text-gray-600 max-w-2xl mx-auto">
                Auto-Immo est présent dans tous les quartiers stratégiques de Libreville pour vous proposer les meilleurs véhicules et biens immobiliers.
            </p>

            <div className="h-[600px] w-full rounded-xl overflow-hidden shadow-lg border-2 border-primary/20 bg-gray-100 relative z-0">
                <div ref={mapRef} style={{ height: "100%", width: "100%" }} />
            </div>

            <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4 text-center">Accès rapide par quartier</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {QUARTIERS.map((quartier, idx) => (
                        <button
                            key={idx}
                            onClick={() => flyToQuartier(quartier.coords)}
                            className="bg-white p-3 rounded-lg shadow text-center hover:bg-primary/10 transition border border-transparent hover:border-primary cursor-pointer group"
                        >
                            <span className="font-semibold text-gray-700 group-hover:text-primary transition">{quartier.name}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default CarteLibreville;

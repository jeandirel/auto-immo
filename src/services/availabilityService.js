// Service de gestion de la disponibilité et des réservations
// Simule une API REST pour respecter l'architecture demandée sans backend réel.
// Utilise localStorage pour la persistance des données.

const STORAGE_KEY_RESERVATIONS = 'auto_immo_reservations';
const STORAGE_KEY_AVAILABILITY = 'auto_immo_availability';

// Simule un délai réseau
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const availabilityService = {
    // Récupérer les dates indisponibles pour une annonce
    getUnavailableDates: async (annonceId) => {
        try {
            await delay(500); // Latence simulée
            const allReservations = JSON.parse(localStorage.getItem(STORAGE_KEY_RESERVATIONS) || '[]');

            // Filtrer les réservations acceptées pour cette annonce
            const annonceReservations = allReservations.filter(r =>
                r.annonceId === annonceId && r.status === 'confirmed'
            );

            // Convertir en tableau de dates (strings ISO YYYY-MM-DD)
            const dates = [];
            annonceReservations.forEach(r => {
                let current = new Date(r.startDate);
                const end = new Date(r.endDate);
                while (current <= end) {
                    dates.push(current.toISOString().split('T')[0]);
                    current.setDate(current.getDate() + 1);
                }
            });

            return [...new Set(dates)]; // Unique dates
        } catch (error) {
            console.error("Erreur API Disponibilité:", error);
            return []; // Fallback empty
        }
    },

    // Créer une nouvelle réservation
    createReservation: async (reservationData) => {
        try {
            await delay(800);

            // Validation basique
            if (!reservationData.startDate || !reservationData.endDate) {
                throw new Error("Dates invalides");
            }

            const newReservation = {
                id: Date.now(),
                ...reservationData,
                status: 'pending', // En attente validation
                createdAt: new Date().toISOString()
            };

            const allReservations = JSON.parse(localStorage.getItem(STORAGE_KEY_RESERVATIONS) || '[]');
            allReservations.push(newReservation);
            localStorage.setItem(STORAGE_KEY_RESERVATIONS, JSON.stringify(allReservations));

            return { success: true, data: newReservation };
        } catch (error) {
            console.error("Erreur Création Réservation:", error);
            throw error;
        }
    },

    // Envoyer une demande d'information
    sendInquiry: async (inquiryData) => {
        try {
            await delay(600);
            // Ici on simulerait un appel POST /api/inquiries
            console.log("Demande d'info envoyée:", inquiryData);
            return { success: true };
        } catch (error) {
            console.error("Erreur Envoi Message:", error);
            throw error;
        }
    }
};

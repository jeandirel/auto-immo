import { useState } from 'react';
import { CreditCard, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { availabilityService } from '../services/availabilityService';
import { Modal } from './Modal'; // Réutilisation du composant Modal existant

export default function ReserveNow({ annonce, dateSelection }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);

    // Calcul du prix total
    const calculateTotal = () => {
        if (!dateSelection?.start || !dateSelection?.end || !annonce.prix && !annonce.loyer) return 0;

        const start = new Date(dateSelection.start);
        const end = new Date(dateSelection.end);
        const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

        if (nights <= 0) return 0;

        const basePrice = annonce.prix || annonce.loyer || 0;
        // Si c'est une location mensuelle, on divise par 30 pour un prix journalier approximatif (logique simple pour l'exemple)
        const dailyPrice = annonce.typeAnnonce === 'location' ? Math.round(basePrice / 30) : basePrice;

        return dailyPrice * nights;
    };

    const totalPrice = calculateTotal();
    const canReserve = totalPrice > 0 && dateSelection?.start && dateSelection?.end;

    const handleReservation = async () => {
        setLoading(true);
        setError(null);

        try {
            await availabilityService.createReservation({
                annonceId: annonce.id,
                startDate: dateSelection.start,
                endDate: dateSelection.end,
                totalPrice: totalPrice,
                currency: 'FCFA'
            });
            setSuccess(true);
        } catch (err) {
            setError("Échec de la réservation. Veuillez réessayer.");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setIsModalOpen(false);
        // Reset state after close if successful to allow new reservation
        if (success) {
            setSuccess(false);
            setError(null);
        }
    };

    if (annonce.typeAnnonce === 'vente') return null; // Pas de réservation directe pour la vente

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                disabled={!canReserve}
                className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2 ${canReserve
                        ? 'bg-gradient-to-r from-green-600 to-green-500 text-white cursor-pointer hover:shadow-xl'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
            >
                <CreditCard size={20} />
                {canReserve ? `Réserver (${totalPrice.toLocaleString()} FCFA)` : 'Sélectionnez des dates'}
            </button>

            <Modal isOpen={isModalOpen} onClose={handleClose}>
                <div className="p-6 text-center">
                    <h2 className="text-2xl font-bold mb-4 text-gray-900">Confirmation de réservation</h2>

                    {success ? (
                        <div className="py-8 animate-fade-in">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle size={32} className="text-green-600" />
                            </div>
                            <h3 className="text-xl font-bold text-green-700 mb-2">Demande envoyée !</h3>
                            <p className="text-gray-600">Votre demande de réservation a bien été reçue. Le propriétaire vous contactera sous peu.</p>
                            <button
                                onClick={handleClose}
                                className="mt-6 bg-gray-900 text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-800 transition"
                            >
                                Fermer
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4 text-left">
                            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                                <p className="flex justify-between">
                                    <span className="text-gray-600">Arrivée :</span>
                                    <span className="font-semibold">{dateSelection?.start}</span>
                                </p>
                                <p className="flex justify-between">
                                    <span className="text-gray-600">Départ :</span>
                                    <span className="font-semibold">{dateSelection?.end}</span>
                                </p>
                                <div className="border-t pt-2 mt-2 flex justify-between text-lg font-bold text-primary">
                                    <span>Total estimé :</span>
                                    <span>{totalPrice.toLocaleString()} FCFA</span>
                                </div>
                            </div>

                            {error && (
                                <div className="bg-red-50 text-red-600 p-3 rounded-lg flex items-center gap-2 text-sm">
                                    <AlertCircle size={16} />
                                    {error}
                                </div>
                            )}

                            <p className="text-sm text-gray-500 italic">
                                En cliquant sur "Confirmer", vous envoyez une demande de réservation sans frais immédiats.
                            </p>

                            <div className="flex gap-4 mt-6">
                                <button
                                    onClick={handleClose}
                                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleReservation}
                                    disabled={loading}
                                    className="flex-1 px-4 py-3 bg-primary text-white rounded-lg font-bold hover:shadow-lg transition flex items-center justify-center gap-2"
                                >
                                    {loading ? <Loader className="animate-spin" size={20} /> : 'Confirmer la demande'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </Modal>
        </>
    );
}

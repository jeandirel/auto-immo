import { useState } from 'react';
import { Send, CheckCircle, Loader } from 'lucide-react';
import { availabilityService } from '../services/availabilityService';

export default function RequestInfo({ annonceId }) {
    const [message, setMessage] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!message.trim() || !email.trim()) return;

        setLoading(true);
        try {
            await availabilityService.sendInquiry({
                annonceId,
                email,
                message,
                date: new Date().toISOString()
            });
            setSent(true);
            setMessage('');
            setEmail('');
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (sent) {
        return (
            <div className="bg-green-50 p-6 rounded-2xl shadow-sm border border-green-100 text-center animate-fade-in">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle size={24} className="text-green-600" />
                </div>
                <h3 className="font-bold text-green-800 mb-1">Message envoyé !</h3>
                <p className="text-green-700 text-sm">Nous vous répondrons dans les plus brefs délais.</p>
                <button
                    onClick={() => setSent(false)}
                    className="mt-4 text-sm text-green-600 underline hover:text-green-800"
                >
                    Envoyer un autre message
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-transparent focus-within:border-primary/20 transition-all">
            <h3 className="text-xl font-bold mb-4 text-gray-900 flex items-center gap-2">
                <Send size={20} className="text-primary" />
                Demander plus d'infos
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Votre email</label>
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full border-2 border-gray-100 rounded-lg px-4 py-3 focus:border-primary focus:ring-0 outline-none transition"
                        placeholder="exemple@email.com"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                    <textarea
                        required
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={3}
                        className="w-full border-2 border-gray-100 rounded-lg px-4 py-3 focus:border-primary focus:ring-0 outline-none transition resize-none"
                        placeholder="Bonjour, ce bien est-il toujours disponible ?"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-black transition flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading ? <Loader className="animate-spin" size={18} /> : 'Envoyer'}
                </button>
            </form>
        </div>
    );
}

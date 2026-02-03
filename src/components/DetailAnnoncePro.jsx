import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Phone, Mail, User, MapPin, FileText, ClipboardList, Home, DollarSign, Share2, CheckCircle2, X } from 'lucide-react'
import { useAnnonces, useAuth } from '../App'
import { Modal, PhotoCarousel } from './Modal'
import AdminActions from './AdminActions'
import ImageCarousel from './ImageCarousel'
import AvailabilityCalendar from './AvailabilityCalendar'
import ReserveNow from './ReserveNow'
import RequestInfo from './RequestInfo'

export default function DetailAnnoncePro() {
    const { annonces, loading } = useAnnonces()
    const { user } = useAuth()
    const navigate = useNavigate()
    const { id } = useParams()
    const [showModal, setShowModal] = useState(false)
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
    const [dateSelection, setDateSelection] = useState({ start: null, end: null })

    // État de chargement
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        )
    }

    // Récupérer l'annonce (gestion ID string Firebase vs ID number locale)
    const annonce = annonces.find(a => String(a.id) === String(id))

    if (!annonce) {
        return (
            <div className="container mx-auto px-4 py-12 text-center">
                <h2 className="text-2xl font-bold text-gray-700">Annonce non trouvée</h2>
                <button onClick={() => navigate('/')} className="mt-4 text-primary">← Retour à l'accueil</button>
            </div>
        )
    }

    const shareUrl = window.location.href
    const isAdmin = user && user.role === 'admin'

    const openModal = (index = 0) => {
        setCurrentPhotoIndex(index)
        setShowModal(true)
    }

    // Helper pour afficher les valeurs conditionnellement
    const DetailItem = ({ label, value, icon: Icon }) => {
        if (!value && value !== 0 && value !== false) return null

        let displayValue = value
        if (typeof value === 'boolean') {
            displayValue = value ? 'Oui' : 'Non'
        } else if (Array.isArray(value)) {
            displayValue = value.join(', ')
        }

        return (
            <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition">
                {Icon && (
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon size={20} className="text-blue-600" />
                    </div>
                )}
                <div className="flex-1">
                    <p className="text-sm text-gray-600 font-medium mb-1">{label}</p>
                    <p className="text-base font-semibold text-gray-900">{displayValue}</p>
                </div>
            </div>
        )
    }

    // Badge de statut
    const StatusBadge = () => {
        if (annonce.status === 'paused') {
            return <span className="bg-yellow-500 text-white px-4 py-2 rounded-full text-sm font-semibold">⏸️ En Pause</span>
        }
        if (annonce.status === 'archived') {
            return <span className="bg-gray-500 text-white px-4 py-2 rounded-full text-sm font-semibold">📦 Archivé</span>
        }
        return null
    }

    return (
        <>
            <div className="bg-gray-50 min-h-screen">
                {/* Header Navigation */}
                <div className="bg-white shadow-sm sticky top-0 z-40">
                    <div className="container mx-auto px-4 py-4">
                        <div className="flex items-center justify-between">
                            <button
                                onClick={() => window.history.back()}
                                className="text-primary hover:text-primary/80 font-semibold transition flex items-center gap-2"
                            >
                                <X size={20} />
                                Retour
                            </button>
                            <StatusBadge />
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 py-6 max-w-7xl">
                    {/* 1️⃣ EN-TÊTE DE L'ANNONCE */}
                    <div className="bg-white rounded-2xl p-8 shadow-lg mb-6">
                        <div className="mb-6">
                            <h1 className="text-2xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                                {annonce.titre}
                            </h1>

                            {/* Prix dominant */}
                            <div className="flex items-baseline gap-4 mb-6">
                                <p className="text-4xl md:text-6xl font-bold text-primary">
                                    {annonce.prix?.toLocaleString() || annonce.loyer?.toLocaleString()}
                                    <span className="text-2xl ml-2">FCFA</span>
                                </p>
                                {annonce.negociable && (
                                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                                        Négociable
                                    </span>
                                )}
                            </div>

                            {/* Badges */}
                            <div className="flex flex-wrap gap-3">
                                <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-semibold">
                                    {annonce.typeAnnonce || annonce.type || 'Vente'}
                                </span>
                                <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full font-semibold capitalize">
                                    {annonce.categorie}
                                </span>
                                {annonce.sousCategorie && (
                                    <span className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full font-semibold">
                                        {annonce.sousCategorie}
                                    </span>
                                )}
                                {annonce.qualite && (
                                    <span className={`px-4 py-2 rounded-full font-semibold ${annonce.qualite === 'Complète' ? 'bg-emerald-100 text-emerald-800' :
                                        annonce.qualite === 'Partielle' ? 'bg-amber-100 text-amber-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                        ⭐ {annonce.qualite}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* GALERIE PHOTOS - CARROUSEL PROFESSIONNEL */}
                        <ImageCarousel
                            photos={annonce.photos}
                            onImageClick={openModal}
                            badges={
                                <>
                                    <span className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-lg">
                                        {annonce.typeAnnonce || annonce.type || 'Vente'}
                                    </span>
                                    <span className="bg-white text-gray-900 px-4 py-2 rounded-lg font-bold text-lg shadow-lg">
                                        {annonce.prix?.toLocaleString() || annonce.loyer?.toLocaleString()} FCFA
                                    </span>
                                </>
                            }
                        />

                        {/* VIDÉO */}
                        {(annonce.videoLink || annonce.videoFile) && (
                            <div className="mt-6">
                                <h3 className="text-xl font-bold mb-3 text-gray-900 flex items-center gap-2">
                                    <span>🎥 Vidéo du bien</span>
                                </h3>

                                <div className="bg-black rounded-xl overflow-hidden aspect-video flex items-center justify-center shadow-lg relative">
                                    {annonce.videoFile ? (
                                        <video
                                            controls
                                            className="w-full h-full"
                                            src={annonce.videoFile.data}
                                            poster={annonce.photos?.[0]}
                                        >
                                            Votre navigateur ne supporte pas la lecture de vidéos.
                                        </video>
                                    ) : annonce.videoLink ? (
                                        (() => {
                                            // Tentative simple d'embed YouTube
                                            const youtubeMatch = annonce.videoLink.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
                                            if (youtubeMatch && youtubeMatch[1]) {
                                                return (
                                                    <iframe
                                                        width="100%"
                                                        height="100%"
                                                        src={`https://www.youtube.com/embed/${youtubeMatch[1]}`}
                                                        title="Vidéo du bien"
                                                        frameBorder="0"
                                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                        allowFullScreen
                                                    ></iframe>
                                                );
                                            } else {
                                                // Lien générique
                                                return (
                                                    <div className="text-center p-8">
                                                        <a
                                                            href={annonce.videoLink}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-full font-bold hover:bg-red-700 transition transform hover:scale-105"
                                                        >
                                                            ▷ Voir la vidéo HD
                                                        </a>
                                                        <p className="text-gray-400 mt-2 text-sm">Ouvrir sur {new URL(annonce.videoLink).hostname}</p>
                                                    </div>
                                                );
                                            }
                                        })()
                                    ) : null}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Layout 2 colonnes */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Colonne principale */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* 2️⃣ LOCALISATION */}
                            <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-pink-500">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center">
                                        <MapPin size={24} className="text-pink-600" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900">Localisation</h2>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-lg">
                                        <span className="font-semibold text-gray-700">Ville :</span>
                                        <span className="text-gray-900 font-medium">{annonce.ville}</span>
                                    </div>
                                    {annonce.quartier && (
                                        <div className="flex items-center gap-3 text-lg">
                                            <span className="font-semibold text-gray-700">Quartier :</span>
                                            <span className="text-gray-900 font-medium">{annonce.quartier}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* 3️⃣ DESCRIPTION */}
                            <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-purple-500">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                        <FileText size={24} className="text-purple-600" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900">Description</h2>
                                </div>
                                <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">
                                    {annonce.description}
                                </p>
                            </div>

                            {/* 4️⃣ DÉTAILS TECHNIQUES */}
                            {annonce.details && Object.keys(annonce.details).length > 0 && (
                                <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-blue-500">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                            <ClipboardList size={24} className="text-blue-600" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-gray-900">Détails Techniques</h2>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {Object.entries(annonce.details).map(([key, value]) => {
                                            if (!value && value !== 0 && value !== false) return null
                                            if (Array.isArray(value) && value.length === 0) return null

                                            const label = key
                                                .replace(/_/g, ' ')
                                                .split(' ')
                                                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                                .join(' ')

                                            return (
                                                <DetailItem
                                                    key={key}
                                                    label={label}
                                                    value={value}
                                                    icon={Home}
                                                />
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* 5️⃣ ÉQUIPEMENTS & OPTIONS */}
                            {annonce.details?.options && annonce.details.options.length > 0 && (
                                <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-green-500">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                            <CheckCircle2 size={24} className="text-green-600" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-gray-900">Équipements</h2>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {annonce.details.options.map((option, i) => (
                                            <div key={i} className="flex items-center gap-3 bg-green-50 p-3 rounded-lg">
                                                <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center flex-shrink-0">
                                                    <CheckCircle2 size={16} className="text-white" />
                                                </div>
                                                <span className="font-medium text-gray-900">{option}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* 6️⃣ PRIX & CONDITIONS */}
                            <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-orange-500">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                                        <DollarSign size={24} className="text-orange-600" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900">Prix & Conditions</h2>
                                </div>
                                <div className="space-y-4">
                                    {annonce.typeAnnonce === 'vente' || annonce.prix ? (
                                        <>
                                            <DetailItem label="Prix de vente" value={`${annonce.prix?.toLocaleString()} FCFA`} />
                                            <DetailItem label="Négociable" value={annonce.negociable} />
                                        </>
                                    ) : (
                                        <>
                                            <DetailItem label="Loyer mensuel" value={`${annonce.loyer?.toLocaleString()} FCFA`} />
                                            <DetailItem label="Caution" value={`${annonce.caution?.toLocaleString()} FCFA`} />
                                            <DetailItem label="Avance (mois)" value={annonce.avance} />
                                            <DetailItem label="Charges incluses" value={annonce.charges_incluses} />
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Admin Actions */}
                            {isAdmin && (
                                <AdminActions
                                    annonce={annonce}
                                    onDelete={(id) => {
                                        if (supprimerAnnonce(id)) {
                                            navigate('/')
                                        }
                                    }}
                                    onArchive={archiverAnnonce}
                                    onTogglePause={togglePauseAnnonce}
                                />
                            )}
                        </div>

                        {/* Colonne latérale */}
                        <div className="space-y-6">
                            {/* MODULE DE RÉSERVATION (NOUVEAU) */}
                            {annonce.typeAnnonce !== 'vente' && (
                                <div className="bg-white rounded-2xl p-6 shadow-lg sticky top-24 z-10">
                                    <h3 className="text-xl font-bold mb-4 text-gray-900 border-b pb-2">Planifier une visite</h3>
                                    <AvailabilityCalendar
                                        annonceId={annonce.id}
                                        onDateSelect={setDateSelection}
                                    />
                                    <div className="mt-4">
                                        <ReserveNow
                                            annonce={annonce}
                                            dateSelection={dateSelection}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* 7️⃣ CONTACT */}
                            {annonce.contact && (
                                <div className="bg-white rounded-2xl p-6 shadow-lg">
                                    <h3 className="text-2xl font-bold mb-6 text-gray-900">Contact</h3>
                                    <div className="space-y-4 mb-6">
                                        {annonce.contact.nom && (
                                            <div className="flex items-center gap-3">
                                                <User size={20} className="text-gray-600" />
                                                <span className="text-gray-900 font-medium">{annonce.contact.nom}</span>
                                            </div>
                                        )}
                                        {annonce.contact.tel && (
                                            <div className="flex items-center gap-3">
                                                <Phone size={20} className="text-gray-600" />
                                                <span className="text-gray-900 font-medium">{annonce.contact.tel}</span>
                                            </div>
                                        )}
                                        {annonce.contact.email && (
                                            <div className="flex items-center gap-3">
                                                <Mail size={20} className="text-gray-600" />
                                                <span className="text-gray-900 font-medium text-sm">{annonce.contact.email}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* CTA Principal */}
                                    {annonce.contact.tel && (
                                        <a
                                            href={`tel:${annonce.contact.tel}`}
                                            className="block w-full bg-gradient-to-r from-primary to-secondary text-white text-center py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition-all transform hover:scale-105"
                                        >
                                            📞 Appeler maintenant
                                        </a>
                                    )}
                                </div>
                            )}

                            {/* DEMANDE D'INFO RAPIDE (NOUVEAU) */}
                            <RequestInfo annonceId={annonce.id} />

                            {/* 8️⃣ PARTAGE */}
                            <div className="bg-white rounded-2xl p-6 shadow-lg">
                                <div className="flex items-center gap-2 mb-6">
                                    <Share2 size={24} className="text-gray-700" />
                                    <h3 className="text-xl font-bold">Partager</h3>
                                </div>
                                <div className="flex flex-col gap-3">
                                    <a
                                        href={`https://wa.me/?text=${encodeURIComponent(annonce.titre + ' - ' + shareUrl)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-3 bg-[#25D366] text-white px-6 py-3.5 rounded-xl hover:bg-[#20BA5A] transition-all shadow-md hover:shadow-lg font-semibold"
                                    >
                                        <Phone size={20} />
                                        WhatsApp
                                    </a>
                                    <a
                                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-3 bg-[#1877F2] text-white px-6 py-3.5 rounded-xl hover:bg-[#166FE5] transition-all shadow-md hover:shadow-lg font-semibold"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                        </svg>
                                        Facebook
                                    </a>
                                    <a
                                        href={`https://www.tiktok.com/upload?caption=${encodeURIComponent(annonce.titre + ' - ' + shareUrl)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-3 bg-black text-white px-6 py-3.5 rounded-xl hover:bg-gray-800 transition-all shadow-md hover:shadow-lg font-semibold"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                                        </svg>
                                        TikTok
                                    </a>
                                    <a
                                        href={`https://www.instagram.com/`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-3 bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] text-white px-6 py-3.5 rounded-xl hover:opacity-90 transition-all shadow-md hover:shadow-lg font-semibold"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                                            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                                            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                                        </svg>
                                        Instagram
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Carousel */}
            <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
                <PhotoCarousel photos={annonce.photos} initialIndex={currentPhotoIndex} />
            </Modal>
        </>
    )
}

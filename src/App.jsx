import { useState, createContext, useContext, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Link, useNavigate, Navigate, useParams } from 'react-router-dom'
import { Home, Car, Building, Eye, Laptop, Search, Plus, Share2, Phone, Mail, LogIn, LogOut, User, Upload, X, MapPin } from 'lucide-react'
import FormulaireIntelligent from './FormulaireIntelligent'
import { Modal, PhotoCarousel } from './components/Modal'
import AdminActions from './components/AdminActions'
import ModifierAnnonce from './components/ModifierAnnonce'
import DetailAnnoncePro from './components/DetailAnnoncePro'

// Context d'authentification
const AuthContext = createContext()

function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user')
        return savedUser ? JSON.parse(savedUser) : null
    })

    const login = (email, password) => {
        if (email === 'admin@auto-immo.ga' && password === 'admin') {
            const userData = { email, role: 'admin', nom: 'Administrateur' }
            setUser(userData)
            localStorage.setItem('user', JSON.stringify(userData))
            return true
        }
        return false
    }

    const logout = () => {
        setUser(null)
        localStorage.removeItem('user')
    }

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

const useAuth = () => useContext(AuthContext)
// Context des annonces avec localStorage
const AnnonceContext = createContext()

function AnnonceProvider({ children }) {
    const [annonces, setAnnonces] = useState(() => {
        const saved = localStorage.getItem('annonces')
        if (saved) {
            try {
                // Auto-fix encoding issues in stored JSON
                let cleanJson = saved
                    .replace(/Ã©/g, 'é')
                    .replace(/Ã¨/g, 'è')
                    .replace(/Ã/g, 'à')
                    .replace(/ï¿½/g, 'oe') // Approximation safe
                    .replace(/Ã´/g, 'ô');

                return JSON.parse(cleanJson)
            } catch (e) {
                console.error("Erreur lecture localStorage:", e)
                return ANNONCES_DATA.map(a => ({ ...a, status: 'active' }))
            }
        }
        // Ajouter status:active aux données initiales
        return ANNONCES_DATA.map(a => ({ ...a, status: 'active' }))
    })

    // Sauvegarde automatique avec nettoyage préventif
    useEffect(() => {
        const stringified = JSON.stringify(annonces);
        localStorage.setItem('annonces', stringified);
    }, [annonces]);

    const ajouterAnnonce = (nouvelleAnnonce) => {
        const annonce = {
            ...nouvelleAnnonce,
            id: Date.now(),
            status: 'active',
            createdAt: new Date().toISOString(),
            // Contact par défaut pour toutes les annonces
            contact: {
                nom: 'auto-immo(Sonny)',
                tel: '+24107100275',
                email: 'contact@auto-immo.info'
            }
        }
        const nouvellesAnnonces = [annonce, ...annonces]
        setAnnonces(nouvellesAnnonces)
        localStorage.setItem('annonces', JSON.stringify(nouvellesAnnonces))
        return annonce
    }

    const modifierAnnonce = (id, updatedData) => {
        const nouvellesAnnonces = annonces.map(a =>
            a.id === id ? { ...a, ...updatedData, updatedAt: new Date().toISOString() } : a
        )
        setAnnonces(nouvellesAnnonces)
        localStorage.setItem('annonces', JSON.stringify(nouvellesAnnonces))
    }

    const supprimerAnnonce = (id) => {
        if (!window.confirm('⚠️ Êtes-vous sûr de vouloir supprimer cette annonce ? Cette action est irréversible.')) {
            return false
        }
        const nouvellesAnnonces = annonces.filter(a => a.id !== id)
        setAnnonces(nouvellesAnnonces)
        localStorage.setItem('annonces', JSON.stringify(nouvellesAnnonces))
        return true
    }

    const archiverAnnonce = (id) => {
        modifierAnnonce(id, { status: 'archived' })
    }

    const togglePauseAnnonce = (id) => {
        const annonce = annonces.find(a => a.id === id)
        if (annonce) {
            modifierAnnonce(id, { status: annonce.status === 'paused' ? 'active' : 'paused' })
        }
    }

    return (
        <AnnonceContext.Provider value={{
            annonces,
            ajouterAnnonce,
            modifierAnnonce,
            supprimerAnnonce,
            archiverAnnonce,
            togglePauseAnnonce
        }}>
            {children}
        </AnnonceContext.Provider>
    )
}

const useAnnonces = () => useContext(AnnonceContext)

// Export hooks for use in other components
export { useAuth, useAnnonces }

// Donnï¿½es d'exemple
const ANNONCES_DATA = [
    {
        id: 1,
        titre: 'Villa moderne 4 chambres - Libreville',
        prix: 85000000,
        categorie: 'immobilier',
        type: 'vente',
        ville: 'Libreville',
        quartier: 'Glass',
        description: 'Magnifique villa moderne avec 4 chambres, salon spacieux, cuisine équipée. Jardin et garage.',
        photos: ['https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800'],
        contact: { nom: 'auto-immo(Sonny)', tel: '+24107100275', email: 'contact@auto-immo.info' },
        details: { surface: 250, chambres: 4 }
    },
    {
        id: 2,
        titre: 'Toyota Land Cruiser 2020',
        prix: 25000000,
        categorie: 'vehicules',
        type: 'vente',
        ville: 'Port-Gentil',
        description: 'Land Cruiser en excellent état, 45000 km, toutes options.',
        photos: ['https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800'],
        contact: { nom: 'auto-immo(Sonny)', tel: '+24107100275', email: 'contact@auto-immo.info' },
        details: { marque: 'Toyota', modele: 'Land Cruiser', annee: 2020, kilometrage: 45000 }
    },
    {
        id: 3,
        titre: 'MacBook Pro 16" M2 Pro',
        prix: 1800000,
        categorie: 'informatique',
        type: 'vente',
        ville: 'Libreville',
        description: 'MacBook Pro 16" M2 Pro, 16GB RAM, 512GB SSD. Comme neuf, facture disponible.',
        photos: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800'],
        contact: { nom: 'auto-immo(Sonny)', tel: '+24107100275', email: 'contact@auto-immo.info' },
        details: { marque: 'Apple', modele: 'MacBook Pro', etat: 'Comme neuf' }
    },
    {
        id: 4,
        titre: 'Google Pixel Fold - 256GB - Neuf',
        prix: 1250000,
        categorie: 'informatique',
        type: 'vente',
        ville: 'Libreville',
        description: 'Google Pixel Fold en excellent état. Écran pliable incroyable, 256GB de stockage. Idéal pour la productivité et le multimédia.',
        photos: ['/images/fold_1.jpg', '/images/fold_2.jpg'],
        contact: { nom: 'auto-immo(Sonny)', tel: '+24107100275', email: 'contact@auto-immo.info' },
        details: { marque: 'Google', modele: 'Pixel Fold', etat: 'Comme neuf', stockage: '256GB' }
    },
    {
        id: 5,
        titre: 'Toyota Land Cruiser Prado 2024 - Black Edition',
        prix: 48000000,
        categorie: 'vehicules',
        type: 'vente',
        ville: 'Libreville',
        description: 'Toyota Land Cruiser Prado 2024, finition Black Edition. Moteur puissant, intérieur cuir, toutes options. Le roi de la route.',
        photos: ['/images/prado_1.jpg', '/images/prado_2.jpg'],
        contact: { nom: 'auto-immo(Sonny)', tel: '+24107100275', email: 'contact@auto-immo.info' },
        details: { marque: 'Toyota', modele: 'Land Cruiser Prado', annee: 2024, kilometrage: 1500, carburant: 'Diesel', boite: 'Automatique' }
    },
]

const VILLES = ['Libreville', 'Port-Gentil', 'Franceville', 'Oyem', 'Moanda']
const CATEGORIES = [
    { key: 'immobilier', label: 'Immobilier', icon: Building },
    { key: 'vehicules', label: 'Véhicules', icon: Car },
    { key: 'informatique', label: 'Informatique', icon: Laptop },
]

// Composants
function Navbar() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    return (
        <nav className="bg-gradient-to-r from-gabon-green via-primary to-secondary text-white shadow-lg">
            <div className="container mx-auto px-4 py-4">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <Link to="/" className="flex items-center">
                        <img src="/logo.jpg" alt="AUTO-IMMO" className="h-16 md:h-20 w-auto object-contain" />
                    </Link>
                    <div className="flex gap-4 items-center flex-wrap justify-center">
                        <Link to="/" className="hover:text-gabon-yellow transition text-sm md:text-base">Accueil</Link>

                        {user ? (
                            <>
                                {user.role === 'admin' && (
                                    <Link to="/nouvelle-annonce" className="flex items-center gap-2 bg-white text-primary px-3 py-2 md:px-4 rounded-lg hover:bg-gray-100 transition text-sm md:text-base">
                                        <Plus size={18} />
                                        <span className="hidden md:inline">Publier</span>
                                        <span className="md:hidden">Publier</span>
                                    </Link>
                                )}
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-2 bg-white/20 px-3 py-2 rounded-lg">
                                        <User size={16} />
                                        <span className="text-sm max-w-[100px] truncate">{user.nom}</span>
                                    </div>
                                    <button
                                        onClick={() => {
                                            logout()
                                            navigate('/')
                                        }}
                                        className="flex items-center gap-2 bg-white/20 px-3 py-2 md:px-4 rounded-lg hover:bg-white/30 transition text-sm md:text-base"
                                    >
                                        <LogOut size={18} />
                                        <span className="hidden md:inline">Déconnexion</span>
                                    </button>
                                </div>
                            </>
                        ) : (
                            <Link to="/login" className="flex items-center gap-2 bg-white text-primary px-4 py-2 rounded-lg hover:bg-gray-100 transition text-sm md:text-base">
                                <LogIn size={20} />
                                Connexion Admin
                            </Link>
                        )}
                    </div>
                </div >
            </div >
        </nav >
    )
}

function HomePage() {
    const navigate = useNavigate()
    const { annonces } = useAnnonces()
    const { user } = useAuth()
    const [filters, setFilters] = useState({ categorie: '', ville: '', search: '' })

    const filteredAnnonces = annonces.filter(annonce => {
        // Non-admins voient seulement les annonces actives
        if (!user || user.role !== 'admin') {
            if (annonce.status !== 'active') return false
        }

        if (filters.categorie && annonce.categorie !== filters.categorie) return false
        if (filters.ville && annonce.ville !== filters.ville) return false
        if (filters.search && !annonce.titre.toLowerCase().includes(filters.search.toLowerCase())) return false
        return true
    })

    return (
        <div>
            {/* Hero */}
            <div className="bg-gradient-to-r from-gabon-green via-primary to-secondary text-white py-12 md:py-16">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-3xl md:text-5xl font-bold mb-4">Trouvez le bien qui vous ressemble</h1>
                    <p className="text-lg md:text-xl mb-8">Immobilier, Véhicules et matériel informatique au Gabon</p>

                    {/* Filtres */}
                    <div className="bg-white rounded-lg p-6 text-gray-800 max-w-4xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <select
                                className="border rounded-lg px-4 py-2"
                                value={filters.categorie}
                                onChange={(e) => setFilters({ ...filters, categorie: e.target.value })}
                            >
                                <option value="">Toutes catégories</option>
                                {CATEGORIES.map(cat => <option key={cat.key} value={cat.key}>{cat.label}</option>)}
                            </select>

                            <select
                                className="border rounded-lg px-4 py-2"
                                value={filters.ville}
                                onChange={(e) => setFilters({ ...filters, ville: e.target.value })}
                            >
                                <option value="">Toutes villes</option>
                                {VILLES.map(ville => <option key={ville} value={ville}>{ville}</option>)}
                            </select>

                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Rechercher..."
                                    className="border rounded-lg px-4 py-2 w-full pl-10"
                                    value={filters.search}
                                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                />
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* catÃ©gories */}
            <div className="container mx-auto px-4 py-12">
                <h2 className="text-3xl font-bold mb-8">Nos catégories</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {CATEGORIES.map(cat => {
                        const Icon = cat.icon
                        const count = annonces.filter(a => a.categorie === cat.key).length
                        return (
                            <button
                                key={cat.key}
                                onClick={() => setFilters({ ...filters, categorie: cat.key })}
                                className="border-2 border-gray-200 rounded-lg p-6 hover:border-primary transition text-center group"
                            >
                                <Icon className="mx-auto mb-4 text-primary group-hover:scale-110 transition" size={48} />
                                <h3 className="text-xl font-semibold mb-2">{cat.label}</h3>
                                <p className="text-gray-600">{count} annonces</p>
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Liste annonces */}
            <div className="container mx-auto px-4 py-12">
                <h2 className="text-3xl font-bold mb-8">Dernières annonces ({filteredAnnonces.length})</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {filteredAnnonces.map(annonce => (
                        <div
                            key={annonce.id}
                            className="border rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer group bg-white"
                        >
                            {/* Image avec bouton Voir en overlay */}
                            <div className="relative h-48 overflow-hidden" onClick={() => navigate(`/annonce/${annonce.id}`)}>
                                <img
                                    src={annonce.photos[0]}
                                    alt={annonce.titre}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />

                                {/* Overlay gradient + bouton Voir (toujours visible mobile, hover desktop) */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            navigate(`/annonce/${annonce.id}`)
                                        }}
                                        className="bg-gradient-to-r from-primary to-secondary text-white px-6 py-3 rounded-full font-bold text-base shadow-2xl flex items-center gap-2 transform scale-90 md:scale-75 md:group-hover:scale-100 transition-all duration-300 hover:shadow-3xl"
                                        aria-label="Voir l'annonce"
                                    >
                                        <Eye size={22} strokeWidth={2.5} />
                                        <span>Voir</span>
                                    </button>
                                </div>

                                {/* Badge prix (toujours visible) */}
                                <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm text-primary px-3 py-1.5 rounded-lg font-bold text-sm shadow-lg">
                                    {annonce.prix?.toLocaleString() || annonce.loyer?.toLocaleString()} FCFA
                                </div>
                            </div>

                            {/* Contenu de la carte */}
                            <div className="p-4" onClick={() => navigate(`/annonce/${annonce.id}`)}>
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-semibold text-lg line-clamp-1 flex-1">{annonce.titre}</h3>
                                </div>
                                <p className="text-gray-600 text-sm mb-2 flex items-center gap-1">
                                    <MapPin size={16} className="text-primary" />
                                    {annonce.ville}
                                </p>
                                <p className="text-gray-700 text-sm line-clamp-2">{annonce.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

function DetailAnnonce() {
    const { annonces, supprimerAnnonce, archiverAnnonce, togglePauseAnnonce } = useAnnonces()
    const { user } = useAuth()
    const navigate = useNavigate()
    const [showModal, setShowModal] = useState(false)
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)

    const id = parseInt(window.location.pathname.split('/').pop())
    const annonce = annonces.find(a => a.id === id)

    if (!annonce) {
        return (
            <div className="container mx-auto px-4 py-12 text-center">
                <h2 className="text-2xl font-bold text-gray-700">Annonce non trouvï¿½e</h2>
                <button onClick={() => navigate('/')} className="mt-4 text-primary">? Retour ï¿½ l'accueil</button>
            </div>
        )
    }

    const shareUrl = window.location.href
    const isAdmin = user && user.role === 'admin'

    // Fonction pour ouvrir le modal ï¿½ une photo spï¿½cifique
    const openModal = (index = 0) => {
        setCurrentPhotoIndex(index)
        setShowModal(true)
    }

    // Badge de statut
    const StatusBadge = () => {
        if (annonce.status === 'paused') {
            return <span className="bg-yellow-500 text-white px-4 py-2 rounded-full text-sm font-semibold">?? En Pause</span>
        }
        if (annonce.status === 'archived') {
            return <span className="bg-gray-500 text-white px-4 py-2 rounded-full text-sm font-semibold">?? Archivï¿½</span>
        }
        return null
    }

    return (
        <>
            <div className="bg-gray-50 min-h-screen">
                <div className="container mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <button
                            onClick={() => window.history.back()}
                            className="text-primary hover:text-primary/80 font-semibold transition"
                        >
                            ? Retour
                        </button>
                        <StatusBadge />
                    </div>

                    {/* Photos Grid - Cliquables */}
                    <div className="grid grid-cols-4 gap-2 mb-8 rounded-xl overflow-hidden">
                        <div
                            className="col-span-3 row-span-2 cursor-pointer hover:opacity-90 transition"
                            onClick={() => openModal(0)}
                        >
                            <img
                                src={annonce.photos[0]}
                                alt="Photo principale"
                                className="w-full h-[500px] object-cover"
                            />
                        </div>
                        {annonce.photos.slice(1, 5).map((photo, i) => (
                            <div
                                key={i}
                                className="cursor-pointer hover:opacity-90 transition relative"
                                onClick={() => openModal(i + 1)}
                            >
                                <img
                                    src={photo}
                                    alt={`Photo ${i + 2}`}
                                    className="w-full h-[245px] object-cover"
                                />
                                {i === 3 && annonce.photos.length > 5 && (
                                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-white text-2xl font-bold">
                                        +{annonce.photos.length - 5}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Main Content */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column - Details */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Title & Price */}
                            <div className="bg-white rounded-xl p-6 shadow">
                                <h1 className="text-4xl font-bold mb-4">{annonce.titre}</h1>
                                <p className="text-5xl font-bold text-primary">{annonce.prix?.toLocaleString() || 'N/A'} FCFA</p>
                                <div className="flex flex-wrap gap-2 mt-4">
                                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                                        {annonce.typeAnnonce || annonce.type}
                                    </span>
                                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                                        {annonce.categorie}
                                    </span>
                                    {annonce.sousCategorie && (
                                        <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                                            {annonce.sousCategorie}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Location */}
                            <div className="bg-white rounded-xl p-6 shadow border-l-4 border-pink-500">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                                        <svg className="w-5 h-5 text-pink-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800">Localisation</h3>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-gray-700">
                                        <strong className="font-semibold">Ville :</strong> {annonce.ville}
                                    </p>
                                    {annonce.quartier && (
                                        <p className="text-gray-700">
                                            <strong className="font-semibold">Quartier :</strong> {annonce.quartier}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Description */}
                            <div className="bg-white rounded-xl p-6 shadow border-l-4 border-purple-500">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                        <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800">Description</h3>
                                </div>
                                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{annonce.description}</p>
                            </div>

                            {/* Category Specific Details */}
                            {annonce.details && Object.keys(annonce.details).length > 0 && (
                                <div className="bg-white rounded-xl p-6 shadow border-l-4 border-blue-500">
                                    <div className="flex items-center gap-2 mb-6">
                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-800">Dï¿½tails</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {Object.entries(annonce.details).map(([key, value]) => {
                                            if (Array.isArray(value) && value.length === 0) return null
                                            if (!value && value !== false) return null

                                            // Format le nom de la clï¿½
                                            const label = key
                                                .replace(/_/g, ' ')
                                                .split(' ')
                                                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                                .join(' ')

                                            // Format la valeur
                                            let displayValue
                                            if (typeof value === 'boolean') {
                                                displayValue = (
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-5 h-5 rounded flex items-center justify-center ${value ? 'bg-green-500' : 'bg-gray-300'}`}>
                                                            {value && (
                                                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                                                </svg>
                                                            )}
                                                        </div>
                                                        <span className="font-semibold">{value ? 'Oui' : 'Non'}</span>
                                                    </div>
                                                )
                                            } else if (Array.isArray(value)) {
                                                displayValue = <span className="font-semibold">{value.join(', ')}</span>
                                            } else {
                                                displayValue = <span className="font-semibold text-gray-900">{value}</span>
                                            }

                                            return (
                                                <div key={key} className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition">
                                                    <p className="text-sm text-gray-600 mb-1">{label}</p>
                                                    <div className="text-base">{displayValue}</div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

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

                        {/* Right Column - Contact & Share */}
                        <div className="space-y-6">
                            {/* Contact */}
                            {annonce.contact && (
                                <div className="bg-white rounded-xl p-6 shadow sticky top-4">
                                    <h3 className="text-xl font-bold mb-4">?? Contact</h3>
                                    <div className="space-y-3">
                                        {annonce.contact.nom && (
                                            <p className="flex items-center gap-2">
                                                <User size={20} className="text-primary" />
                                                <strong>{annonce.contact.nom}</strong>
                                            </p>
                                        )}
                                        {annonce.contact.tel && (
                                            <p className="flex items-center gap-2">
                                                <Phone size={20} className="text-primary" />
                                                {annonce.contact.tel}
                                            </p>
                                        )}
                                        {annonce.contact.email && (
                                            <p className="flex items-center gap-2">
                                                <Mail size={20} className="text-primary" />
                                                {annonce.contact.email}
                                            </p>
                                        )}
                                    </div>

                                    {/* Call to Action */}
                                    <a
                                        href={`tel:${annonce.contact.tel}`}
                                        className="block mt-6 bg-gradient-to-r from-primary to-secondary text-white text-center py-3 rounded-lg font-bold hover:shadow-xl transition"
                                    >
                                        ?? Appeler maintenant
                                    </a>
                                </div>
                            )}

                            {/* Share */}
                            <div className="bg-white rounded-xl p-6 shadow">
                                <div className="flex items-center gap-2 mb-4">
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

function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const { login } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = (e) => {
        e.preventDefault()
        setError('')

        if (login(email, password)) {
            navigate('/')
        } else {
            setError('Identifiants incorrects.')
        }
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
                <h1 className="text-3xl font-bold mb-6 text-center">Connexion Admin</h1>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block mb-2 font-semibold">Email</label>
                        <input
                            type="email"
                            required
                            className="w-full border rounded-lg px-4 py-2"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Votre email"
                        />
                    </div>

                    <div>
                        <label className="block mb-2 font-semibold">Mot de passe</label>
                        <input
                            type="password"
                            required
                            className="w-full border rounded-lg px-4 py-2"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary/90 transition font-semibold"
                    >
                        Se connecter
                    </button>
                </form>

            </div >
        </div >
    )
}

function NouvelleAnnonce() {
    const { user } = useAuth()
    const { ajouterAnnonce } = useAnnonces()
    const navigate = useNavigate()
    const [photos, setPhotos] = useState([])
    const [isDragging, setIsDragging] = useState(false)

    const handleSubmit = (annonceComplete) => {
        const annonce = ajouterAnnonce(annonceComplete)

        // Message de confirmation détaillé
        const message = `🎉 ANNONCE PUBLIÉE AVEC SUCCÈS !\n\n` +
            `📝 Titre : ${annonce.titre}\n` +
            `📸 Photos : ${photos.length}\n` +
            `⭐ Qualité : ${annonceComplete.qualite}\n` +
            `🔗 Slug SEO : ${annonceComplete.slug}\n\n` +
            `🏠 Redirection vers la page d'accueil...`

        alert(message)
        setPhotos([])
        navigate('/')
    }

    if (!user || user.role !== 'admin') {
        return (
            <div className="container mx-auto px-4 py-12 text-center">
                <div className="bg-red-100 border border-red-400 text-red-700 px-8 py-6 rounded-lg max-w-md mx-auto">
                    <h2 className="text-2xl font-bold mb-4">⚠️ Accès refusé</h2>
                    <p className="mb-4">Seul l'administrateur peut publier des annonces.</p>
                    <button onClick={() => navigate('/login')} className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition">
                        Se connecter
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <h1 className="text-4xl font-bold mb-2">Publier une annonce</h1>
            <p className="text-gray-600 mb-8">Formulaire intelligent adapté à votre catégorie</p>
            <FormulaireIntelligent onSubmit={handleSubmit} photos={photos} setPhotos={setPhotos} isDragging={isDragging} setIsDragging={setIsDragging} />
        </div>
    )
}

function App() {
    return (
        <AuthProvider>
            <AnnonceProvider>
                <BrowserRouter>
                    <div className="min-h-screen bg-gray-50">
                        <Navbar />
                        <Routes>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/annonce/:id" element={<DetailAnnoncePro />} />
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/nouvelle-annonce" element={<NouvelleAnnonce />} />
                            <Route path="/modifier-annonce/:id" element={<ModifierAnnonce />} />
                        </Routes>

                        <footer className="bg-gray-800 text-white py-8 mt-12">
                            <div className="container mx-auto px-4 text-center">
                                <p>© 2026 AUTO-IMMO - Petites Annonces Gabon</p>
                                <p className="text-sm text-gray-400 mt-2">🇬🇦 Développé avec ❤️ pour le Gabon</p>
                                <p className="text-sm text-gray-500 mt-1">Développé par <span className="text-primary font-semibold">Ogooué Artificial Intelligence (Ogooué AI) 🚀</span></p>
                            </div>
                        </footer>
                    </div>
                </BrowserRouter>
            </AnnonceProvider>
        </AuthProvider>
    )
}

export default App

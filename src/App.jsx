import { useState, createContext, useContext, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Link, useNavigate, Navigate, useParams } from 'react-router-dom'
import { Home, Car, Building, Eye, Laptop, Search, Plus, Share2, Phone, Mail, LogIn, LogOut, User, Upload, X, MapPin, Map, Database } from 'lucide-react'
import FormulaireIntelligent from './FormulaireIntelligent'
import { Modal, PhotoCarousel } from './components/Modal'
import AdminActions from './components/AdminActions'
import ModifierAnnonce from './components/ModifierAnnonce'
import DetailAnnoncePro from './components/DetailAnnoncePro'
import CarteLibreville from './components/CarteLibreville'

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
// Context des annonces avec Firebase
const AnnonceContext = createContext()

function AnnonceProvider({ children }) {
    const [annonces, setAnnonces] = useState([])
    const [loading, setLoading] = useState(true)

    // S'abonner aux changements Firebase en temps réel
    useEffect(() => {
        import('./firebase/annonceService').then(({ subscribeToAnnonces }) => {
            const unsubscribe = subscribeToAnnonces((firebaseAnnonces) => {
                setAnnonces(firebaseAnnonces)
                setLoading(false)
            })
            return () => unsubscribe()
        }).catch(error => {
            console.error("Erreur chargement Firebase:", error)
            setLoading(false)
        })

        // Migration automatique localStorage → Firebase (une seule fois)
        import('./firebase/migrationScript').then(({ migrateLocalStorageToFirebase }) => {
            migrateLocalStorageToFirebase().then(result => {
                if (result.success && result.successCount > 0) {
                    alert(`✅ Migration réussie !\n\n${result.successCount} annonces transférées vers Firebase.\n\nVos données sont maintenant synchronisées sur tous les appareils.`)
                }
            })
        }).catch(error => {
            console.error("Erreur script migration:", error)
        })
    }, [])



    const ajouterAnnonce = async (nouvelleAnnonce) => {
        try {
            const { saveAnnonce } = await import('./firebase/annonceService')
            const annonce = {
                ...nouvelleAnnonce,
                status: 'active',
                contact: {
                    nom: 'auto-immo(Sonny)',
                    tel: '+24107100275',
                    email: 'contact@auto-immo.info'
                }
            }
            const newAnnonce = await saveAnnonce(annonce)
            return newAnnonce
        } catch (error) {
            console.error("Erreur ajout annonce:", error)
            alert("Erreur lors de la création de l'annonce. Vérifiez votre connexion internet.")
            throw error
        }
    }

    const modifierAnnonce = async (id, updatedData) => {
        try {
            const { saveAnnonce } = await import('./firebase/annonceService')
            await saveAnnonce({ id, ...updatedData })
        } catch (error) {
            console.error("Erreur modification annonce:", error)
            alert("Erreur lors de la modification. Vérifiez votre connexion internet.")
        }
    }

    const supprimerAnnonce = async (id) => {
        if (!window.confirm('⚠️ Êtes-vous sûr de vouloir supprimer cette annonce ? Cette action est irréversible.')) {
            return false
        }
        try {
            const { deleteAnnonce } = await import('./firebase/annonceService')
            await deleteAnnonce(id)
            return true
        } catch (error) {
            console.error("Erreur suppression annonce:", error)
            alert("Erreur lors de la suppression. Vérifiez votre connexion internet.")
            return false
        }
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
            togglePauseAnnonce,
            loading
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
                        <Link to="/carte" className="hover:text-gabon-yellow transition text-sm md:text-base flex items-center gap-1">
                            <Map size={16} /> Carte
                        </Link>

                        {user ? (
                            <>
                                {user.role === 'admin' && (
                                    <>
                                        <Link to="/nouvelle-annonce" className="flex items-center gap-2 bg-white text-primary px-3 py-2 md:px-4 rounded-lg hover:bg-gray-100 transition text-sm md:text-base">
                                            <Plus size={18} />
                                            <span className="hidden md:inline">Publier</span>
                                            <span className="md:hidden">Publier</span>
                                        </Link>
                                        <button
                                            onClick={() => {
                                                if (window.confirm('Voulez-vous récupérer les anciennes données de ce téléphone vers Firebase ?')) {
                                                    import('./firebase/migrationScript').then(({ resetMigration, migrateLocalStorageToFirebase }) => {
                                                        resetMigration();
                                                        migrateLocalStorageToFirebase().then(res => {
                                                            alert(res.message);
                                                            if (res.successCount > 0) window.location.reload();
                                                        });
                                                    });
                                                }
                                            }}
                                            className="flex items-center gap-2 bg-gabon-yellow text-primary px-3 py-2 md:px-4 rounded-lg hover:bg-yellow-400 transition text-sm md:text-base font-bold shadow-md"
                                            title="Récupérer les anciennes données locales"
                                        >
                                            <Database size={18} />
                                            <span className="hidden md:inline">Récupérer</span>
                                        </button>
                                    </>
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
                            placeholder="entrez un mot de passe"
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

    const handleSubmit = async (annonceComplete) => {
        const annonce = await ajouterAnnonce(annonceComplete)

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
                    <div className="flex flex-col min-h-screen bg-gray-50">
                        <Navbar />
                        <main className="flex-grow">
                            <Routes>
                                <Route path="/" element={<HomePage />} />
                                <Route path="/annonce/:id" element={<DetailAnnoncePro />} />
                                <Route path="/login" element={<LoginPage />} />
                                <Route path="/nouvelle-annonce" element={
                                    <PrivateRoute>
                                        <NouvelleAnnonce />
                                    </PrivateRoute>
                                } />
                                <Route path="/modifier-annonce/:id" element={
                                    <PrivateRoute>
                                        <ModifierAnnonce />
                                    </PrivateRoute>
                                } />
                                <Route path="/carte" element={<CarteLibreville />} />
                                <Route path="*" element={<Navigate to="/" />} />
                            </Routes>
                        </main>
                        <footer className="bg-gray-800 text-white py-8 text-center">
                            <div className="container mx-auto px-4">
                                <p>&copy; {new Date().getFullYear()} AUTO-IMMO Gabon. Tous droits réservés.</p>
                                <p className="text-gray-400 text-sm mt-2">Votre partenaire de confiance pour l'immobilier, les véhicules et l'informatique.</p>
                                <p className="text-gray-500 text-xs mt-4">Développé par : <span className="text-primary font-semibold">Ogooué Artificial intelligence (Ogooué AI)</span></p>
                            </div>
                        </footer>
                    </div>
                </BrowserRouter>
            </AnnonceProvider>
        </AuthProvider>
    )
}

function PrivateRoute({ children }) {
    const { user } = useAuth()
    return user ? children : <Navigate to="/login" />
}

export default App

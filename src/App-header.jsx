import { useState, createContext, useContext } from 'react'
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom'
import { Home, Car, Building, Laptop, Search, Plus, LogIn, LogOut, User } from 'lucide-react'
import FormulaireIntelligent from './FormulaireIntelligent'

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

const ANNONCES_INITIALES = [
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
        contact: { nom: 'Jean Koumba', tel: '+241 06 12 34 56', email: 'j.koumba@example.com' },
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
        contact: { nom: 'Marie Obame', tel: '+241 07 23 45 67' },
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
        contact: { nom: 'David Ndong', tel: '+241 06 34 56 78' },
        details: { marque: 'Apple', modele: 'MacBook Pro', etat: 'Comme neuf' }
    },
]

function AnnonceProvider({ children }) {
    const [annonces, setAnnonces] = useState(() => {
        const saved = localStorage.getItem('annonces')
        return saved ? JSON.parse(saved) : ANNONCES_INITIALES
    })

    const ajouterAnnonce = (nouvelleAnnonce) => {
        const annonce = {
            ...nouvelleAnnonce,
            id: Date.now(),
            createdAt: new Date().toISOString()
        }
        const nouvellesAnnonces = [annonce, ...annonces]
        setAnnonces(nouvellesAnnonces)
        localStorage.setItem('annonces', JSON.stringify(nouvellesAnnonces))
        return annonce
    }

    return (
        <AnnonceContext.Provider value={{ annonces, ajouterAnnonce }}>
            {children}
        </AnnonceContext.Provider>
    )
}

const useAnnonces = () => useContext(AnnonceContext)

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
                <div className="flex items-center justify-between">
                    <Link to="/" className="text-2xl font-bold">AUTO-IMMO</Link>
                    <div className="flex gap-4 items-center">
                        <Link to="/" className="hover:text-gabon-yellow transition">Accueil</Link>

                        {user ? (
                            <>
                                <Link to="/nouvelle-annonce" className="flex items-center gap-2 bg-white text-primary px-4 py-2 rounded-lg hover:bg-gray-100 transition">
                                    <Plus size={20} />
                                    Publier
                                </Link>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <User size={20} />
                                        <span className="text-sm">{user.nom}</span>
                                    </div>
                                    <button
                                        onClick={logout}
                                        className="flex items-center gap-2 hover:text-gabon-yellow transition text-sm"
                                    >
                                        <LogOut size={20} />
                                        Déconnexion
                                    </button>
                                </div>
                            </>
                        ) : (
                            <Link to="/login" className="flex items-center gap-2 bg-white text-primary px-4 py-2 rounded-lg hover:bg-gray-100 transition">
                                <LogIn size={20} />
                                Connexion Admin
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    )
}

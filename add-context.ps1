$filePath = ".\src\App.jsx"
$content = Get-Content $filePath -Raw -Encoding UTF8

# 1. Ajouter AnnonceContext après useAuth
$annonceContextCode = @'

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
'@

# Supprimer l'ancien ANNONCES_DATA et ajouter AnnonceContext
$content = $content -replace "(?s)// Données d'exemple.*?\]", "$annonceContextCode"

# 2. Modifier HomePage pour utiliser useAnnonces
$content = $content -replace "const \[filters, setFilters\] = useState", "const { annonces } = useAnnonces()`r`n    const [filters, setFilters] = useState"
$content = $content -replace "ANNONCES_DATA\.filter", "annonces.filter"

# 3. Corriger l'encodage
$content = $content.Replace('catÃ©gories',  'catégories')
$content = $content.Replace('adaptÃ© Ã ', 'adapté à')
$content = $content.Replace('DÃ©connexion', 'Déconnexion')
$content = $content.Replace('Ã©quipÃ©e', 'équipée')
$content = $content.Replace('Ã©tat', 'état')
$content = $content.Replace('vÃ©hicules', 'véhicules')
$content = $content.Replace('matÃ©riel', 'matériel')
$content = $content.Replace('VÃ©hicules', 'Véhicules')

# Sauvegarder en UTF-8 BOM
$utf8BOM = New-Object System.Text.UTF8Encoding $true
[System.IO.File]::WriteAllText("$PWD\$filePath", $content, $utf8BOM)

Write-Host "✅ AnnonceContext ajouté et encodage corrigé!"

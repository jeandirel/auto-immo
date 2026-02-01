# Script pour ajouter la persistence localStorage

$file = ".\src\App.jsx.backup"
$content = Get-Content $file -Raw -Encoding UTF8

# 1. Ajouter AnnonceContext après useAuth (ligne 37)
$annonceContext = @'

// Context des annonces avec localStorage
const AnnonceContext = createContext()

function AnnonceProvider({ children }) {
    const [annonces, setAnnonces] = useState(() => {
        const saved = localStorage.getItem('annonces')
        if (saved) {
            return JSON.parse(saved)
        }
        return ANNONCES_DATA
    })

    const ajouterAnnonce = (nouvelleAnnonce) => {
        const annonce = { ...nouvelleAnnonce, id: Date.now() }
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

$content = $content.Replace("const useAuth = () => useContext(AuthContext)", "const useAuth = () => useContext(AuthContext)$annonceContext")

# 2. Modifier HomePage pour utiliser useAnnonces (après ligne 139)
$content = $content.Replace(
    "const [filters, setFilters] = useState({ categorie: '', ville: '', search: '' })",
    "const { annonces } = useAnnonces()`r`n    const [filters, setFilters] = useState({ categorie: '', ville: '', search: '' })"
)

# 3. Remplacer ANNONCES_DATA par annonces dans HomePage
$content = $content -replace "ANNONCES_DATA\.filter", "annonces.filter"

# 4. Dans catégories (ligne 199), remplacer aussi
$content = $content -replace "const count = ANNONCES_DATA\.filter", "const count = annonces.filter"

# 5. DetailAnnonce utiliser annonces aussi
$content = $content.Replace(
    "function DetailAnnonce() {`r`n    const id = parseInt(window.location.pathname.split('/').pop())`r`n    const annonce = ANNONCES_DATA.find",
    "function DetailAnnonce() {`r`n    const { annonces } = useAnnonces()`r`n    const id = parseInt(window.location.hostname.split('/').pop())`r`n    const annonce = annonces.find"
)

# 6. Remplacer NouvelleAnnonce function entière (lignes 377-648)
$nouveauNouvelleAnnonce = @'
function NouvelleAnnonce() {
    const { user } = useAuth()
    const { ajouterAnnonce } = useAnnonces()
    const navigate = useNavigate()
    const [photos, setPhotos] = useState([])
    const [isDragging, setIsDragging] = useState(false)

    const handleSubmit = (annonceComplete) => {
        const annonce = ajouterAnnonce(annonceComplete)
        alert(`🎉 Annonce créée avec succès !\n\n✅ ${annonce.titre}\n📸 Photos : ${photos.length}\n🔖 Slug : ${annonceComplete.slug}`)
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
'@

$content = $content -replace "(?s)function NouvelleAnnonce\(\).*?(?=function App\(\))", "$nouveauNouvelleAnnonce`r`n`r`n"

# 7. Wrapper App avec AnnonceProvider
$content = $content.Replace(
    "    return (`r`n        <AuthProvider>",
    "    return (`r`n        <AuthProvider>`r`n            <AnnonceProvider>"
)
$content = $content.Replace(
    "        </AuthProvider>`r`n    )",
    "            </AnnonceProvider>`r`n        </AuthProvider>`r`n    )"
)

# Sauvegarder
$utf8BOM = New-Object System.Text.UTF8Encoding $true
[System.IO.File]::WriteAllText("$PWD\src\App.jsx", $content, $utf8BOM)
Write-Host "✅ App.jsx finalisé avec persistence!"

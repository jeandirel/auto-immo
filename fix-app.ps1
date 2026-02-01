$newComponent = @'
function NouvelleAnnonce() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [photos, setPhotos] = useState([])
    const [isDragging, setIsDragging] = useState(false)

    const handleSubmit = (annonceComplete) => {
        alert(`🎉 Annonce créée avec succès !\n\n✅ Qualité : ${annonceComplete.qualite}\n📸 Photos : ${photos.length}\n🔖 Slug SEO : ${annonceComplete.slug}`)
        console.log('Annonce complète:', annonceComplete)
        
        // Reset
        setPhotos([])
        navigate('/')
    }

    // Protection : seulement admin peut publier
    if (!user || user.role !== 'admin') {
        return (
            <div className="container mx-auto px-4 py-12 text-center">
                <div className="bg-red-100 border border-red-400 text-red-700 px-8 py-6 rounded-lg max-w-md mx-auto">
                    <h2 className="text-2xl font-bold mb-4">⚠️ Accès refusé</h2>
                    <p className="mb-4">Seul l'administrateur peut publier des annonces.</p>
                    <button
                        onClick={() => navigate('/login')}
                        className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition"
                    >
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
            
            <FormulaireIntelligent 
                onSubmit={handleSubmit}
                photos={photos}
                setPhotos={setPhotos}
                isDragging={isDragging}
                setIsDragging={setIsDragging}
            />
        </div>
    )
}
'@

$content = Get-Content ".\src\App.jsx" -Raw
$startPattern = 'function NouvelleAnnonce\(\) \{'
$endPattern = '(?=\nfunction App\(\) \{)'

$newContent = $content -replace "(?s)$startPattern.*?$endPattern", "$newComponent`n"
$newContent | Set-Content ".\src\App.jsx" -Encoding UTF8
Write-Host "✅ App.jsx mis à jour avec FormulaireIntelligent!"

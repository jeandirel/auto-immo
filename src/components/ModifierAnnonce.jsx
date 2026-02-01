import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../App'
import { useAnnonces } from '../App'
import FormulaireIntelligent from '../FormulaireIntelligent'

export default function ModifierAnnonce() {
    const { id } = useParams()
    const { user } = useAuth()
    const { annonces, modifierAnnonce } = useAnnonces()
    const navigate = useNavigate()

    const [photos, setPhotos] = useState([])
    const [isDragging, setIsDragging] = useState(false)
    const [initialData, setInitialData] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Charger l'annonce existante
        const annonce = annonces.find(a => a.id === parseInt(id))

        if (!annonce) {
            alert('❌ Annonce non trouvée')
            navigate('/')
            return
        }

        // Convertir les photos (URLs) en objets avec preview
        const photosConverted = annonce.photos.map((url, index) => ({
            preview: url,
            name: `Photo ${index + 1}`,
            file: null // Pas de fichier physique, juste l'URL
        }))

        setPhotos(photosConverted)
        setInitialData(annonce)
        setLoading(false)
    }, [id, annonces, navigate])

    const handleSubmit = (annonceComplete) => {
        // Mettre à jour l'annonce existante
        modifierAnnonce(parseInt(id), annonceComplete)

        const message = `✅ ANNONCE MISE À JOUR AVEC SUCCÈS !\n\n` +
            `📝 Titre : ${annonceComplete.titre}\n` +
            `📸 Photos : ${photos.length}\n` +
            `⭐ Qualité : ${annonceComplete.qualite}\n\n` +
            `➡️ Redirection vers l'annonce...`

        alert(message)
        navigate(`/annonce/${id}`)
    }

    // Protection admin
    if (!user || user.role !== 'admin') {
        return (
            <div className="container mx-auto px-4 py-12 text-center">
                <div className="bg-red-100 border border-red-400 text-red-700 px-8 py-6 rounded-lg max-w-md mx-auto">
                    <h2 className="text-2xl font-bold mb-4">⚠️ Accès refusé</h2>
                    <p className="mb-4">Seul l'administrateur peut modifier des annonces.</p>
                    <button onClick={() => navigate('/login')} className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition">
                        Se connecter
                    </button>
                </div>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-12 text-center">
                <p className="text-xl text-gray-600">Chargement de l'annonce...</p>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <div className="mb-8">
                <button
                    onClick={() => navigate(-1)}
                    className="text-primary hover:text-primary/80 mb-4"
                >
                    ← Retour
                </button>
                <h1 className="text-4xl font-bold mb-2">Modifier l'annonce</h1>
                <p className="text-gray-600">Mettez à jour les informations de votre annonce</p>
            </div>

            <FormulaireIntelligent
                onSubmit={handleSubmit}
                photos={photos}
                setPhotos={setPhotos}
                isDragging={isDragging}
                setIsDragging={setIsDragging}
                initialData={initialData}
                isEditMode={true}
            />
        </div>
    )
}

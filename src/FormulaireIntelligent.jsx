import { useState, useEffect } from 'react'
import { Upload, X, Check, AlertCircle } from 'lucide-react'
import { CATEGORIES_DETAILS, VILLES_GABON, getQuartiersParVille, genererTitre, genererSlug } from './formData'

export default function FormulaireIntelligent({ onSubmit, photos, setPhotos, isDragging, setIsDragging }) {
    // État du formulaire - Étape 1: Type & Catégorie
    const [typeAnnonce, setTypeAnnonce] = useState('vente')
    const [categorie, setCategorie] = useState('')
    const [sousCategorie, setSousCategorie] = useState('')

    // État du formulaire - Informations générales
    const [formData, setFormData] = useState({
        titre: '',
        ville: '',
        quartier: '',
        prix: '',
        description: '',
        // Vente
        negociable: false,
        // Location
        loyer: '',
        caution: '',
        avance: 1,
        charges_incluses: false,
    })

    // État spécifique par catégorie
    const [detailsImmobilier, setDetailsImmobilier] = useState({
        chambres: '',
        salons: '',
        salles_bain: '',
        surface_habitable: '',
        surface_terrain: '',
        etages: '',
        annee_construction: '',
        equipements: []
    })

    const [detailsTerrain, setDetailsTerrain] = useState({
        superficie: '',
        acces_route: false,
        terrain_plat: false,
        borne: false,
        titre_foncier: false,
        lotissement: false,
        viabilisation: [],
        usages: []
    })

    const [detailsVehicule, setDetailsVehicule] = useState({
        marque: '',
        modele: '',
        annee: '',
        kilometrage: '',
        carburant: '',
        boite: '',
        portes: '',
        couleur: '',
        etat: '',
        options: []
    })

    // Liste dynamique des quartiers selon la ville
    const [quartiersDisponibles, setQuartiersDisponibles] = useState([])

    // PRÉ-REMPLIR LE FORMULAIRE EN MODE ÉDITION
    useEffect(() => {
        if (initialData && isEditMode) {
            // Pré-remplir les états de base
            setTypeAnnonce(initialData.typeAnnonce || initialData.type || 'vente')
            setCategorie(initialData.categorie || '')
            setSousCategorie(initialData.sousCategorie || '')

            // Pré-remplir formData
            setFormData({
                titre: initialData.titre || '',
                ville: initialData.ville || '',
                quartier: initialData.quartier || '',
                prix: initialData.prix || '',
                description: initialData.description || '',
                negociable: initialData.negociable || false,
                loyer: initialData.loyer || '',
                caution: initialData.caution || '',
                avance: initialData.avance || 1,
                charges_incluses: initialData.charges_incluses || false,
            })

            // Pré-remplir les détails selon la catégorie
            if (initialData.details) {
                if (initialData.categorie === 'immobilier') {
                    setDetailsImmobilier(prev => ({ ...prev, ...initialData.details }))
                } else if (initialData.categorie === 'terrain') {
                    setDetailsTerrain(prev => ({ ...prev, ...initialData.details }))
                } else if (initialData.categorie === 'vehicules') {
                    setDetailsVehicule(prev => ({ ...prev, ...initialData.details }))
                }
            }
        }
    }, [initialData, isEditMode])

    // Quand la ville change, charger les quartiers et réinitialiser le quartier
    useEffect(() => {
        if (formData.ville) {
            const quartiers = getQuartiersParVille(formData.ville)
            setQuartiersDisponibles(quartiers)
            // Reset quartier si la ville change
            setFormData(prev => ({ ...prev, quartier: '' }))
        } else {
            setQuartiersDisponibles([])
        }
    }, [formData.ville])

    // Auto-génération du titre
    useEffect(() => {
        if (!categorie || !sousCategorie || !formData.ville) return

        const dataForTitle = {
            categorie,
            sousCategorie,
            ville: formData.ville,
            quartier: formData.quartier,
            ...detailsImmobilier,
            ...detailsTerrain,
            ...detailsVehicule
        }

        const titreAuto = genererTitre(dataForTitle)
        if (titreAuto && !formData.titre) {
            setFormData(prev => ({ ...prev, titre: titreAuto }))
        }
    }, [categorie, sousCategorie, formData.ville, formData.quartier, detailsImmobilier.chambres, detailsTerrain.superficie, detailsVehicule.marque, detailsVehicule.modele])

    // Validation qualité
    const calculerQualite = () => {
        let score = 0
        let total = 0

        // Champs de base
        if (formData.titre) score++
        if (formData.ville) score++
        if (formData.prix || formData.loyer) score++
        if (formData.description && formData.description.length > 50) score++
        if (photos.length >= 3) score++
        total += 5

        // Champs spécifiques
        if (categorie === 'immobilier') {
            if (detailsImmobilier.chambres) score++
            if (detailsImmobilier.surface_habitable) score++
            if (detailsImmobilier.equipements.length > 0) score++
            total += 3
        } else if (categorie === 'terrain') {
            if (detailsTerrain.superficie) score++
            if (detailsTerrain.titre_foncier) score++
            total += 2
        } else if (categorie === 'vehicules') {
            if (detailsVehicule.marque) score++
            if (detailsVehicule.annee) score++
            if (detailsVehicule.kilometrage) score++
            total += 3
        }

        const pourcentage = (score / total) * 100

        if (pourcentage >= 80) return { label: 'Annonce complète', color: 'green', icon: Check }
        if (pourcentage >= 50) return { label: 'Annonce partielle', color: 'yellow', icon: AlertCircle }
        return { label: 'À compléter', color: 'red', icon: X }
    }

    const qualite = calculerQualite()

    const resetForm = () => {
        // Reset tous les états
        setTypeAnnonce('vente')
        setCategorie('')
        setSousCategorie('')
        setFormData({
            titre: '',
            ville: '',
            quartier: '',
            prix: '',
            description: '',
            negociable: false,
            loyer: '',
            caution: '',
            avance: 1,
            charges_incluses: false,
        })
        setDetailsImmobilier({
            chambres: '',
            salons: '',
            salles_bain: '',
            surface_habitable: '',
            surface_terrain: '',
            etages: '',
            annee_construction: '',
            equipements: []
        })
        setDetailsTerrain({
            superficie: '',
            acces_route: false,
            terrain_plat: false,
            borne: false,
            titre_foncier: false,
            lotissement: false,
            viabilisation: [],
            usages: []
        })
        setDetailsVehicule({
            marque: '',
            modele: '',
            annee: '',
            kilometrage: '',
            carburant: '',
            boite: '',
            portes: '',
            couleur: '',
            etat: '',
            options: []
        })
    }

    const handleSubmit = (e) => {
        e.preventDefault()

        if (photos.length === 0) {
            alert('⚠️ Veuillez ajouter au moins une photo')
            return
        }

        const annonceComplete = {
            ...formData,
            typeAnnonce,
            categorie,
            sousCategorie,
            photos: photos.map(p => p.preview),
            slug: genererSlug(formData.titre),
            details: categorie === 'immobilier' ? detailsImmobilier
                : categorie === 'terrain' ? detailsTerrain
                    : detailsVehicule,
            qualite: qualite.label,
            createdAt: new Date().toISOString()
        }

        // Soumettre l'annonce
        onSubmit(annonceComplete)

        // Réinitialiser le formulaire
        resetForm()
    }

    const processFiles = (files) => {
        files.forEach(file => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader()
                reader.onloadend = () => {
                    setPhotos(prev => [...prev, {
                        file,
                        preview: reader.result,
                        name: file.name
                    }])
                }
                reader.readAsDataURL(file)
            }
        })
    }

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files)
        processFiles(files)
    }

    const handleDragOver = (e) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = (e) => {
        e.preventDefault()
        setIsDragging(false)
    }

    const handleDrop = (e) => {
        e.preventDefault()
        setIsDragging(false)
        const files = Array.from(e.dataTransfer.files)
        processFiles(files)
    }

    const removePhoto = (index) => {
        setPhotos(prev => prev.filter((_, i) => i !== index))
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Badge qualité */}
            <div className={`p-4 rounded-lg border-2 ${qualite.color === 'green' ? 'bg-green-50 border-green-500' :
                qualite.color === 'yellow' ? 'bg-yellow-50 border-yellow-500' :
                    'bg-red-50 border-red-500'
                }`}>
                <div className="flex items-center gap-2">
                    <qualite.icon className={`${qualite.color === 'green' ? 'text-green-600' :
                        qualite.color === 'yellow' ? 'text-yellow-600' :
                            'text-red-600'
                        }`} size={24} />
                    <span className="font-semibold">{qualite.label}</span>
                </div>
            </div>

            {/* ÉTAPE 1: Type d'annonce */}
            <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="text-xl font-bold mb-4">Étape 1 : Type d'annonce *</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {['vente', 'location', 'vente_location'].map(type => (
                        <button
                            key={type}
                            type="button"
                            onClick={() => setTypeAnnonce(type)}
                            className={`p-4 rounded-lg border-2 transition ${typeAnnonce === type
                                ? 'border-primary bg-primary/10 font-semibold'
                                : 'border-gray-300 hover:border-primary'
                                }`}
                        >
                            {type === 'vente' ? 'Vente' : type === 'location' ? 'Location' : 'Vente & Location'}
                        </button>
                    ))}
                </div>
            </div>

            {/* ÉTAPE 2: Catégorie */}
            <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="text-xl font-bold mb-4">Étape 2 : Catégorie principale *</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.keys(CATEGORIES_DETAILS).map(cat => (
                        <button
                            key={cat}
                            type="button"
                            onClick={() => {
                                setCategorie(cat)
                                setSousCategorie('')
                            }}
                            className={`p-4 rounded-lg border-2 transition ${categorie === cat
                                ? 'border-primary bg-primary/10 font-semibold'
                                : 'border-gray-300 hover:border-primary'
                                }`}
                        >
                            {CATEGORIES_DETAILS[cat].label}
                        </button>
                    ))}
                </div>
            </div>

            {/* ÉTAPE 3: Sous-catégorie (si catégorie choisie) */}
            {categorie && (
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h3 className="text-xl font-bold mb-4">
                        Étape 3 : Type de {CATEGORIES_DETAILS[categorie].label} *
                    </h3>
                    <select
                        value={sousCategorie}
                        onChange={(e) => setSousCategorie(e.target.value)}
                        className="w-full border-2 rounded-lg px-4 py-3"
                        required
                    >
                        <option value="">-- Sélectionnez --</option>
                        {CATEGORIES_DETAILS[categorie].sousCategories.map(sc => (
                            <option key={sc.value} value={sc.value}>{sc.label}</option>
                        ))}
                    </select>
                </div>
            )}

            {/* Suite du formulaire si sous-catégorie choisie */}
            {sousCategorie && (
                <>
                    {/* Informations générales */}
                    <div className="bg-white p-6 rounded-xl shadow-md">
                        <h3 className="text-xl font-bold mb-4">Informations générales</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block mb-2 font-semibold">Titre de l'annonce *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.titre}
                                    onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                                    className="w-full border-2 rounded-lg px-4 py-2"
                                    placeholder="Ex: Maison 4 chambres avec jardin"
                                />
                                <p className="text-xs text-gray-500 mt-1">💡 Titre généré automatiquement, vous pouvez le modifier</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block mb-2 font-semibold">Ville *</label>
                                    <select
                                        value={formData.ville}
                                        onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
                                        className="w-full border-2 rounded-lg px-4 py-2"
                                        required
                                    >
                                        <option value="">-- Sélectionnez une ville --</option>
                                        {VILLES_GABON.map(v => (
                                            <option key={v} value={v}>{v}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block mb-2 font-semibold">
                                        Quartier {formData.ville && '(recommandé)'}
                                    </label>
                                    <select
                                        value={formData.quartier}
                                        onChange={(e) => setFormData({ ...formData, quartier: e.target.value })}
                                        className="w-full border-2 rounded-lg px-4 py-2"
                                        disabled={!formData.ville}
                                    >
                                        <option value="">
                                            {formData.ville ? '-- Sélectionnez un quartier --' : '-- Choisissez d\'abord une ville --'}
                                        </option>
                                        {quartiersDisponibles.map(q => (
                                            <option key={q} value={q}>{q}</option>
                                        ))}
                                    </select>
                                    {formData.ville && quartiersDisponibles.length > 0 && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            💡 {quartiersDisponibles.length} quartiers disponibles à {formData.ville}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Champs spécifiques IMMOBILIER */}
                    {categorie === 'immobilier' && (
                        <div className="bg-white p-6 rounded-xl shadow-md">
                            <h3 className="text-xl font-bold mb-4">Caractéristiques du bien</h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div>
                                    <label className="block mb-2 font-semibold">Chambres</label>
                                    <input
                                        type="number"
                                        value={detailsImmobilier.chambres}
                                        onChange={(e) => setDetailsImmobilier({ ...detailsImmobilier, chambres: e.target.value })}
                                        className="w-full border-2 rounded-lg px-4 py-2"
                                    />
                                </div>
                                <div>
                                    <label className="block mb-2 font-semibold">Salons</label>
                                    <input
                                        type="number"
                                        value={detailsImmobilier.salons}
                                        onChange={(e) => setDetailsImmobilier({ ...detailsImmobilier, salons: e.target.value })}
                                        className="w-full border-2 rounded-lg px-4 py-2"
                                    />
                                </div>
                                <div>
                                    <label className="block mb-2 font-semibold">Salles de bain</label>
                                    <input
                                        type="number"
                                        value={detailsImmobilier.salles_bain}
                                        onChange={(e) => setDetailsImmobilier({ ...detailsImmobilier, salles_bain: e.target.value })}
                                        className="w-full border-2 rounded-lg px-4 py-2"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block mb-2 font-semibold">Surface habitable (m²)</label>
                                    <input
                                        type="number"
                                        value={detailsImmobilier.surface_habitable}
                                        onChange={(e) => setDetailsImmobilier({ ...detailsImmobilier, surface_habitable: e.target.value })}
                                        className="w-full border-2 rounded-lg px-4 py-2"
                                    />
                                </div>
                                <div>
                                    <label className="block mb-2 font-semibold">Surface terrain (m²)</label>
                                    <input
                                        type="number"
                                        value={detailsImmobilier.surface_terrain}
                                        onChange={(e) => setDetailsImmobilier({ ...detailsImmobilier, surface_terrain: e.target.value })}
                                        className="w-full border-2 rounded-lg px-4 py-2"
                                    />
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block mb-2 font-semibold">Équipements & Options</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                    {CATEGORIES_DETAILS.immobilier.equipements.map(eq => (
                                        <label key={eq} className="flex items-center gap-2 p-2 border rounded hover:bg-gray-50">
                                            <input
                                                type="checkbox"
                                                checked={detailsImmobilier.equipements.includes(eq)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setDetailsImmobilier({
                                                            ...detailsImmobilier,
                                                            equipements: [...detailsImmobilier.equipements, eq]
                                                        })
                                                    } else {
                                                        setDetailsImmobilier({
                                                            ...detailsImmobilier,
                                                            equipements: detailsImmobilier.equipements.filter(e => e !== eq)
                                                        })
                                                    }
                                                }}
                                                className="w-4 h-4"
                                            />
                                            <span className="text-sm">{eq}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Champs spécifiques TERRAIN */}
                    {categorie === 'terrain' && (
                        <div className="bg-white p-6 rounded-xl shadow-md">
                            <h3 className="text-xl font-bold mb-4">Caractéristiques du terrain</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block mb-2 font-semibold">Superficie (m²) *</label>
                                    <input
                                        type="number"
                                        required
                                        value={detailsTerrain.superficie}
                                        onChange={(e) => setDetailsTerrain({ ...detailsTerrain, superficie: e.target.value })}
                                        className="w-full border-2 rounded-lg px-4 py-2"
                                    />
                                </div>
                            </div>



                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                {['acces_route', 'terrain_plat', 'borne', 'titre_foncier', 'lotissement'].map(field => (
                                    <label key={field} className="flex items-center gap-2 p-3 border-2 rounded-lg hover:bg-gray-50">
                                        <input
                                            type="checkbox"
                                            checked={detailsTerrain[field]}
                                            onChange={(e) => setDetailsTerrain({ ...detailsTerrain, [field]: e.target.checked })}
                                            className="w-5 h-5"
                                        />
                                        <span className="capitalize">{field.replace('_', ' ')}</span>
                                    </label>
                                ))}
                            </div>

                            <div className="mb-4">
                                <label className="block mb-2 font-semibold">Viabilisation</label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                    {CATEGORIES_DETAILS.terrain.viabilisation.map(vb => (
                                        <label key={vb} className="flex items-center gap-2 p-2 border rounded hover:bg-gray-50">
                                            <input
                                                type="checkbox"
                                                checked={detailsTerrain.viabilisation.includes(vb)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setDetailsTerrain({
                                                            ...detailsTerrain,
                                                            viabilisation: [...detailsTerrain.viabilisation, vb]
                                                        })
                                                    } else {
                                                        setDetailsTerrain({
                                                            ...detailsTerrain,
                                                            viabilisation: detailsTerrain.viabilisation.filter(v => v !== vb)
                                                        })
                                                    }
                                                }}
                                                className="w-4 h-4"
                                            />
                                            {vb}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )
                    }

                    {/* Champs spécifiques VÉHICULES */}
                    {
                        categorie === 'vehicules' && (
                            <div className="bg-white p-6 rounded-xl shadow-md">
                                <h3 className="text-xl font-bold mb-4">Caractéristiques du véhicule</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block mb-2 font-semibold">Marque *</label>
                                        <select
                                            required
                                            value={detailsVehicule.marque}
                                            onChange={(e) => setDetailsVehicule({ ...detailsVehicule, marque: e.target.value })}
                                            className="w-full border-2 rounded-lg px-4 py-2"
                                        >
                                            <option value="">-- Sélectionnez --</option>
                                            {CATEGORIES_DETAILS.vehicules.marques.map(m => (
                                                <option key={m} value={m}>{m}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block mb-2 font-semibold">Modèle *</label>
                                        <input
                                            type="text"
                                            required
                                            value={detailsVehicule.modele}
                                            onChange={(e) => setDetailsVehicule({ ...detailsVehicule, modele: e.target.value })}
                                            className="w-full border-2 rounded-lg px-4 py-2"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4 mb-4">
                                    <div>
                                        <label className="block mb-2 font-semibold">Année *</label>
                                        <input
                                            type="number"
                                            required
                                            value={detailsVehicule.annee}
                                            onChange={(e) => setDetailsVehicule({ ...detailsVehicule, annee: e.target.value })}
                                            className="w-full border-2 rounded-lg px-4 py-2"
                                        />
                                    </div>

                                    <div>
                                        <label className="block mb-2 font-semibold">Kilométrage *</label>
                                        <input
                                            type="number"
                                            required
                                            value={detailsVehicule.kilometrage}
                                            onChange={(e) => setDetailsVehicule({ ...detailsVehicule, kilometrage: e.target.value })}
                                            className="w-full border-2 rounded-lg px-4 py-2"
                                        />
                                    </div>

                                    <div>
                                        <label className="block mb-2 font-semibold">Couleur</label>
                                        <input
                                            type="text"
                                            value={detailsVehicule.couleur}
                                            onChange={(e) => setDetailsVehicule({ ...detailsVehicule, couleur: e.target.value })}
                                            className="w-full border-2 rounded-lg px-4 py-2"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block mb-2 font-semibold">Carburant *</label>
                                        <select
                                            required
                                            value={detailsVehicule.carburant}
                                            onChange={(e) => setDetailsVehicule({ ...detailsVehicule, carburant: e.target.value })}
                                            className="w-full border-2 rounded-lg px-4 py-2"
                                        >
                                            <option value="">-- Sélectionnez --</option>
                                            {CATEGORIES_DETAILS.vehicules.carburants.map(c => (
                                                <option key={c} value={c}>{c}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block mb-2 font-semibold">Boîte de vitesses *</label>
                                        <select
                                            required
                                            value={detailsVehicule.boite}
                                            onChange={(e) => setDetailsVehicule({ ...detailsVehicule, boite: e.target.value })}
                                            className="w-full border-2 rounded-lg px-4 py-2"
                                        >
                                            <option value="">-- Sélectionnez --</option>
                                            {CATEGORIES_DETAILS.vehicules.boites.map(b => (
                                                <option key={b} value={b}>{b}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="block mb-2 font-semibold">Options du véhicule</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                        {CATEGORIES_DETAILS.vehicules.options.map(opt => (
                                            <label key={opt} className="flex items-center gap-2 p-2 border rounded hover:bg-gray-50">
                                                <input
                                                    type="checkbox"
                                                    checked={detailsVehicule.options.includes(opt)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setDetailsVehicule({
                                                                ...detailsVehicule,
                                                                options: [...detailsVehicule.options, opt]
                                                            })
                                                        } else {
                                                            setDetailsVehicule({
                                                                ...detailsVehicule,
                                                                options: detailsVehicule.options.filter(o => o !== opt)
                                                            })
                                                        }
                                                    }}
                                                    className="w-4 h-4"
                                                />
                                                <span className="text-sm">{opt}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )
                    }

                    {/* Prix & Conditions */}
                    <div className="bg-white p-6 rounded-xl shadow-md">
                        <h3 className="text-xl font-bold mb-4">Prix & Conditions</h3>

                        {(typeAnnonce === 'vente' || typeAnnonce === 'vente_location') && (
                            <div className="mb-4">
                                <label className="block mb-2 font-semibold">Prix de vente (FCFA) *</label>
                                <input
                                    type="number"
                                    required={typeAnnonce !== 'location'}
                                    value={formData.prix}
                                    onChange={(e) => setFormData({ ...formData, prix: e.target.value })}
                                    className="w-full border-2 rounded-lg px-4 py-2"
                                />
                                <label className="flex items-center gap-2 mt-2">
                                    <input
                                        type="checkbox"
                                        checked={formData.negociable}
                                        onChange={(e) => setFormData({ ...formData, negociable: e.target.checked })}
                                        className="w-4 h-4"
                                    />
                                    <span className="text-sm">Prix négociable</span>
                                </label>
                            </div>
                        )}

                        {(typeAnnonce === 'location' || typeAnnonce === 'vente_location') && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block mb-2 font-semibold">Loyer mensuel (FCFA) *</label>
                                    <input
                                        type="number"
                                        required={typeAnnonce !== 'vente'}
                                        value={formData.loyer}
                                        onChange={(e) => setFormData({ ...formData, loyer: e.target.value })}
                                        className="w-full border-2 rounded-lg px-4 py-2"
                                    />
                                </div>
                                <div>
                                    <label className="block mb-2 font-semibold">Caution (FCFA)</label>
                                    <input
                                        type="number"
                                        value={formData.caution}
                                        onChange={(e) => setFormData({ ...formData, caution: e.target.value })}
                                        className="w-full border-2 rounded-lg px-4 py-2"
                                    />
                                </div>
                                <div>
                                    <label className="block mb-2 font-semibold">Avance (mois)</label>
                                    <input
                                        type="number"
                                        value={formData.avance}
                                        onChange={(e) => setFormData({ ...formData, avance: e.target.value })}
                                        className="w-full border-2 rounded-lg px-4 py-2"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Photos */}
                    <div className="bg-white p-6 rounded-xl shadow-md">
                        <h3 className="text-xl font-bold mb-4">Photos * (min. 3 recommandées)</h3>

                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${isDragging
                                ? 'border-primary bg-primary/10 scale-105'
                                : 'border-gray-300 hover:border-primary hover:bg-gray-50'
                                }`}
                        >
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageUpload}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />

                            <div className="pointer-events-none">
                                <div className="mx-auto w-16 h-16 mb-4 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-lg">
                                    <Upload className="w-8 h-8 text-white" />
                                </div>

                                <p className="text-lg font-bold text-gray-800 mb-2">
                                    {isDragging ? '📸 Déposez vos images ici' : 'Ajoutez vos photos'}
                                </p>

                                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-secondary text-white px-8 py-3 rounded-lg font-semibold shadow-lg">
                                    Choisir des fichiers
                                </div>
                            </div>
                        </div>

                        {photos.length > 0 && (
                            <div className="mt-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="bg-gradient-to-r from-primary to-secondary text-white w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                                        {photos.length}
                                    </div>
                                    <p className="font-semibold text-gray-800">
                                        Photo{photos.length > 1 ? 's' : ''} sélectionnée{photos.length > 1 ? 's' : ''}
                                    </p>
                                </div>

                                <div className="grid grid-cols-4 gap-4">
                                    {photos.map((photo, index) => (
                                        <div key={index} className="relative group">
                                            <img
                                                src={photo.preview}
                                                alt={`Photo ${index + 1}`}
                                                className="w-full h-32 object-cover rounded-xl shadow-md"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removePhoto(index)}
                                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    <div className="bg-white p-6 rounded-xl shadow-md">
                        <h3 className="text-xl font-bold mb-4">Description *</h3>
                        <textarea
                            required
                            rows={6}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full border-2 rounded-lg px-4 py-2"
                            placeholder="Décrivez le bien en détail, mentionnez le quartier, les commodités à proximité, les avantages..."
                        />
                        <p className="text-sm text-gray-500 mt-2">
                            {formData.description.length} caractères | Recommandé : minimum 100 caractères
                        </p>
                    </div>

                    {/* Bouton de soumission */}
                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-primary to-secondary text-white py-4 rounded-xl hover:shadow-xl transition-all font-bold text-lg transform hover:scale-105"
                    >
                        {isEditMode ? '✅ Mettre à jour l\'annonce' : '🚀 Publier l\'annonce'}
                    </button>
                </>
            )
            }
        </form >
    )
}

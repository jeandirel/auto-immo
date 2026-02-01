// Données pour le formulaire dynamique
export const CATEGORIES_DETAILS = {
    immobilier: {
        label: 'Immobilier',
        sousCategories: [
            { value: 'maison', label: 'Maison' },
            { value: 'appartement', label: 'Appartement' },
            { value: 'studio', label: 'Studio' },
            { value: 'villa', label: 'Villa' },
            { value: 'immeuble', label: 'Immeuble' },
            { value: 'local_commercial', label: 'Local commercial' },
            { value: 'bureau', label: 'Bureau' },
        ],
        equipements: [
            'Garage', 'Parking', 'Jardin', 'Piscine', 'Balcon/Terrasse',
            'Climatisation', 'Meublé', 'Cuisine équipée', 'Sécurité/Gardien',
            'Eau', 'Électricité'
        ],
        champsSpecifiques: ['chambres', 'salons', 'salles_bain', 'surface_habitable', 'surface_terrain', 'etages', 'annee_construction']
    },
    terrain: {
        label: 'Terrain',
        sousCategories: [
            { value: 'constructible', label: 'Constructible' },
            { value: 'agricole', label: 'Agricole' },
            { value: 'industriel', label: 'Industriel' },
            { value: 'commercial', label: 'Commercial' },
        ],
        viabilisation: ['Eau', 'Électricité', 'Internet', 'Égout'],
        usages: ['Résidentiel', 'Commercial', 'Agricole', 'Mixte'],
        champsSpecifiques: ['superficie', 'acces_route', 'terrain_plat', 'borne', 'titre_foncier', 'lotissement']
    },
    vehicules: {
        label: 'Véhicules',
        sousCategories: [
            { value: 'voiture', label: 'Voiture' },
            { value: 'moto', label: 'Moto' },
            { value: 'camion', label: 'Camion' },
            { value: 'utilitaire', label: 'Utilitaire' },
        ],
        marques: [
            'Toyota', 'Nissan', 'Mercedes', 'BMW', 'Audi', 'Volkswagen',
            'Peugeot', 'Renault', 'Hyundai', 'Kia', 'Honda', 'Ford', 'Autre'
        ],
        carburants: ['Essence', 'Diesel', 'Électrique', 'Hybride'],
        boites: ['Manuelle', 'Automatique'],
        etats: ['Neuf', 'Occasion - Très bon état', 'Occasion - Bon état', 'À réparer'],
        options: [
            'Climatisation', 'GPS', 'Caméra de recul', 'Airbags',
            'Jantes alu', 'Bluetooth', 'ABS', 'Régulateur de vitesse'
        ],
        champsSpecifiques: ['marque', 'modele', 'annee', 'kilometrage', 'carburant', 'boite', 'portes', 'couleur', 'etat']
    }
}

// Structure Villes -> Quartiers (dynamique)
export const VILLES_QUARTIERS = {
    'Libreville': {
        'Centre & Administratif': [
            'Centre-ville',
            'Boulevard Triomphal',
            'Batterie IV',
            'Montagne Sainte',
            "Derrière l'Assemblée",
            "Derrière l'Ambassade de Chine"
        ],
        'Nord de Libreville': [
            'Angondjé',
            'Okala',
            'Okala Alibandeng',
            'Okala Petit Paris',
            'Okala Carrefour',
            'Mindoubé',
            'Mikolongo',
            'Nzeng-Ayong Nord'
        ],
        'Est & Périphérie': [
            'Nzeng-Ayong',
            'Derrière la Prison',
            'Derrière la Sobraga',
            'PK5', 'PK6', 'PK7', 'PK8', 'PK9', 'PK10', 'PK11', 'PK12'
        ],
        'Sud de Libreville': [
            'Glass',
            'Lalala',
            'Lalala Carrefour',
            'Akébé',
            'Akébé Ville',
            'Akébé Plaine',
            'Kinguélé',
            'Plein Ciel'
        ],
        'Quartiers populaires': [
            'Mont-Bouët',
            'Nkembo',
            'Avorbam',
            'Cocotiers',
            'Derrière la Gare',
            'Baraka',
            'Belle Vue'
        ]
    },
    'Akanda': {
        'Akanda': [
            'Angondjé (zone Akanda)',
            'Sablière',
            'La Baie des Rois',
            'Derrière la Sablière',
            'Malibé',
            'Cap Estérias',
            'Cap Caravane',
            'Igoumié',
            'Bambouchine',
            'Avorbam Akanda'
        ]
    },
    'Owendo': {
        'Owendo': [
            'Owendo Centre',
            'Owendo Port',
            'Owendo Gare',
            'Owendo Sud',
            'Owendo Nord',
            'SNI Owendo',
            'Derrière la Sobraga Owendo',
            'Zone Industrielle Owendo',
            'Derrière la Poste Owendo',
            'Pont Nomba'
        ]
    }
}

// Liste des villes disponibles
export const VILLES_GABON = Object.keys(VILLES_QUARTIERS)

// Obtenir tous les quartiers d'une ville (à plat)
export const getQuartiersParVille = (ville) => {
    if (!ville || !VILLES_QUARTIERS[ville]) return []

    const zones = VILLES_QUARTIERS[ville]
    return Object.values(zones).flat()
}

// Générateur de titre automatique
export const genererTitre = (data) => {
    const { categorie, sousCategorie, type, ville, quartier, chambres, superficie, marque, modele } = data

    // Format: {Type} {détails} à {Quartier} – {Ville}
    const location = quartier ? `${quartier} – ${ville}` : ville

    if (categorie === 'immobilier') {
        const pieces = chambres ? `${chambres} chambres` : ''
        const prefix = quartier ? 'à' : '-'
        return `${sousCategorie} ${pieces} ${prefix} ${location}`.trim().replace(/\s+/g, ' ')
    }

    if (categorie === 'terrain') {
        const surface = superficie ? `${superficie}m²` : ''
        const prefix = quartier ? 'à' : '-'
        return `Terrain ${sousCategorie} ${surface} ${prefix} ${location}`.trim().replace(/\s+/g, ' ')
    }

    if (categorie === 'vehicules') {
        return `${marque} ${modele} - ${ville}`.trim()
    }

    return ''
}

// Générateur de slug SEO
export const genererSlug = (titre) => {
    return titre
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
}

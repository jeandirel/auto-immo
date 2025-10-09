"""
Modèles spécifiques pour chaque catégorie d'annonces
Immobilier, Véhicules, Matériel Informatique
"""

from dataclasses import dataclass, field
from typing import List, Dict, Optional, Any
from datetime import datetime

@dataclass
class AnnonceBase:
    """Modèle de base pour toutes les annonces"""
    titre: str
    description: str
    categorie: str  # 'immobilier', 'vehicules', 'informatique'
    type_annonce: str  # 'vente', 'location'
    prix: float
    devise: str = 'FCFA'
    localisation: str = ''
    ville: str = ''
    quartier: str = ''
    contact_nom: str = ''
    contact_telephone: str = ''
    contact_email: str = ''
    contact_whatsapp: str = ''
    photos: List[str] = field(default_factory=list)
    videos: List[str] = field(default_factory=list)
    statut: str = 'brouillon'  # 'brouillon', 'publie', 'expire', 'archive'
    date_creation: datetime = field(default_factory=datetime.now)
    date_expiration: Optional[datetime] = None

    def __post_init__(self):
        """Méthode appelée après l'initialisation"""
        pass

@dataclass
class AnnonceImmobilier(AnnonceBase):
    """Modèle spécifique pour les annonces immobilières"""
    type_bien: str = ''  # 'maison', 'appartement', 'terrain', 'bureau', 'commerce'
    surface: Optional[float] = None  # en m²
    nombre_chambres: Optional[int] = None
    nombre_salles_bain: Optional[int] = None
    nombre_pieces: Optional[int] = None
    etage: Optional[int] = None
    ascenseur: bool = False
    parking: bool = False
    jardin: bool = False
    piscine: bool = False
    climatisation: bool = False
    meuble: bool = False
    charges_incluses: bool = False
    caution: Optional[float] = None
    frais_agence: Optional[float] = None
    disponibilite: Optional[datetime] = None

    def __post_init__(self):
        super().__post_init__()
        self.categorie = 'immobilier'
    
    def to_dict(self) -> Dict[str, Any]:
        """Convertir en dictionnaire pour stockage en base"""
        return {
            'type_bien': self.type_bien,
            'surface': self.surface,
            'nombre_chambres': self.nombre_chambres,
            'nombre_salles_bain': self.nombre_salles_bain,
            'nombre_pieces': self.nombre_pieces,
            'etage': self.etage,
            'ascenseur': self.ascenseur,
            'parking': self.parking,
            'jardin': self.jardin,
            'piscine': self.piscine,
            'climatisation': self.climatisation,
            'meuble': self.meuble,
            'charges_incluses': self.charges_incluses,
            'caution': self.caution,
            'frais_agence': self.frais_agence,
            'disponibilite': self.disponibilite.isoformat() if self.disponibilite else None
        }

@dataclass
class AnnonceVehicule(AnnonceBase):
    """Modèle spécifique pour les annonces de véhicules"""
    marque: str = ''
    modele: str = ''
    annee: Optional[int] = None
    kilometrage: Optional[int] = None
    carburant: str = ''  # 'essence', 'diesel', 'hybride', 'electrique'
    transmission: str = ''  # 'manuelle', 'automatique'
    couleur: str = ''
    nombre_portes: Optional[int] = None
    nombre_places: Optional[int] = None
    puissance: Optional[int] = None  # en chevaux
    cylindree: Optional[float] = None  # en litres
    etat: str = ''  # 'neuf', 'tres_bon', 'bon', 'correct', 'a_reparer'
    premiere_main: bool = False
    carnet_entretien: bool = False
    controle_technique: bool = False
    assurance_valide: bool = False
    papiers_en_regle: bool = False
    accidents: bool = False
    
    def __post_init__(self):
        super().__post_init__()
        self.categorie = 'vehicules'
    
    def to_dict(self) -> Dict[str, Any]:
        """Convertir en dictionnaire pour stockage en base"""
        return {
            'marque': self.marque,
            'modele': self.modele,
            'annee': self.annee,
            'kilometrage': self.kilometrage,
            'carburant': self.carburant,
            'transmission': self.transmission,
            'couleur': self.couleur,
            'nombre_portes': self.nombre_portes,
            'nombre_places': self.nombre_places,
            'puissance': self.puissance,
            'cylindree': self.cylindree,
            'etat': self.etat,
            'premiere_main': self.premiere_main,
            'carnet_entretien': self.carnet_entretien,
            'controle_technique': self.controle_technique,
            'assurance_valide': self.assurance_valide,
            'papiers_en_regle': self.papiers_en_regle,
            'accidents': self.accidents
        }

@dataclass
class AnnonceInformatique(AnnonceBase):
    """Modèle spécifique pour les annonces de matériel informatique"""
    type_materiel: str = ''  # 'ordinateur_portable', 'ordinateur_bureau', 'smartphone', 'tablette', 'accessoire'
    marque: str = ''
    modele: str = ''
    processeur: str = ''
    memoire_ram: Optional[int] = None  # en GB
    stockage: Optional[int] = None  # en GB
    type_stockage: str = ''  # 'HDD', 'SSD', 'eMMC'
    carte_graphique: str = ''
    taille_ecran: Optional[float] = None  # en pouces
    resolution_ecran: str = ''
    systeme_exploitation: str = ''
    etat: str = ''  # 'neuf', 'comme_neuf', 'tres_bon', 'bon', 'correct'
    garantie: bool = False
    duree_garantie: Optional[int] = None  # en mois
    accessoires_inclus: List[str] = field(default_factory=list)
    boite_origine: bool = False
    facture_disponible: bool = False
    
    def __post_init__(self):
        super().__post_init__()
        self.categorie = 'informatique'
    
    def to_dict(self) -> Dict[str, Any]:
        """Convertir en dictionnaire pour stockage en base"""
        return {
            'type_materiel': self.type_materiel,
            'marque': self.marque,
            'modele': self.modele,
            'processeur': self.processeur,
            'memoire_ram': self.memoire_ram,
            'stockage': self.stockage,
            'type_stockage': self.type_stockage,
            'carte_graphique': self.carte_graphique,
            'taille_ecran': self.taille_ecran,
            'resolution_ecran': self.resolution_ecran,
            'systeme_exploitation': self.systeme_exploitation,
            'etat': self.etat,
            'garantie': self.garantie,
            'duree_garantie': self.duree_garantie,
            'accessoires_inclus': self.accessoires_inclus,
            'boite_origine': self.boite_origine,
            'facture_disponible': self.facture_disponible
        }

# Constantes pour les choix dans les formulaires
VILLES_GABON = [
    'Libreville', 'Port-Gentil', 'Franceville', 'Oyem', 'Moanda',
    'Mouila', 'Lambaréné', 'Tchibanga', 'Koulamoutou', 'Makokou',
    'Bitam', 'Gamba', 'Mayumba', 'Mitzic', 'Ndjolé'
]

TYPES_BIEN_IMMOBILIER = [
    'Maison', 'Appartement', 'Studio', 'Terrain', 'Bureau', 
    'Commerce', 'Entrepôt', 'Villa', 'Duplex'
]

MARQUES_VEHICULES = [
    'Toyota', 'Nissan', 'Honda', 'Hyundai', 'Kia', 'Ford', 
    'Chevrolet', 'Peugeot', 'Renault', 'Volkswagen', 'BMW', 
    'Mercedes-Benz', 'Audi', 'Mitsubishi', 'Mazda', 'Suzuki'
]

MARQUES_INFORMATIQUE = [
    'Apple', 'Samsung', 'Huawei', 'Xiaomi', 'HP', 'Dell', 
    'Lenovo', 'Asus', 'Acer', 'MSI', 'Sony', 'LG', 'Canon', 'Epson'
]

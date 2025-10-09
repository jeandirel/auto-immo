"""
Script pour générer des données de démonstration
Annonces d'exemple pour tester l'application
"""

import random
from datetime import datetime, timedelta
from models.database import Database
from models.annonce_models import VILLES_GABON, TYPES_BIEN_IMMOBILIER, MARQUES_VEHICULES, MARQUES_INFORMATIQUE

def generer_donnees_demo():
    """Générer des données de démonstration"""
    db = Database()
    
    print("🚀 Génération des données de démonstration...")
    
    # Données d'exemple pour l'immobilier
    annonces_immobilier = [
        {
            'titre': 'Villa moderne 4 chambres avec piscine',
            'description': 'Magnifique villa moderne située dans un quartier résidentiel calme. 4 chambres, 3 salles de bain, salon spacieux, cuisine équipée, piscine et jardin. Parking pour 2 voitures. Idéal pour famille.',
            'categorie': 'immobilier',
            'type_annonce': 'vente',
            'prix': 85000000,
            'ville': 'Libreville',
            'quartier': 'Batterie IV',
            'localisation': 'Quartier résidentiel Batterie IV, proche des écoles et commerces',
            'contact_nom': 'Marie Nguema',
            'contact_telephone': '+241-06-12-34-56',
            'contact_email': 'marie.nguema@email.com',
            'contact_whatsapp': '+24106123456',
            'statut': 'publie',
            'donnees_specifiques': {
                'type_bien': 'Villa',
                'surface': 250,
                'nombre_chambres': 4,
                'nombre_salles_bain': 3,
                'nombre_pieces': 8,
                'parking': True,
                'jardin': True,
                'piscine': True,
                'climatisation': True
            }
        },
        {
            'titre': 'Appartement 2 pièces centre-ville',
            'description': 'Bel appartement de 2 pièces au cœur de Libreville. Proche de tous les services, transports et commerces. Idéal pour jeune couple ou investissement locatif.',
            'categorie': 'immobilier',
            'type_annonce': 'location',
            'prix': 350000,
            'ville': 'Libreville',
            'quartier': 'Centre-ville',
            'localisation': 'Centre-ville, près du marché Mont-Bouët',
            'contact_nom': 'Jean Obame',
            'contact_telephone': '+241-07-98-76-54',
            'contact_whatsapp': '+24107987654',
            'statut': 'publie',
            'donnees_specifiques': {
                'type_bien': 'Appartement',
                'surface': 65,
                'nombre_chambres': 1,
                'nombre_salles_bain': 1,
                'nombre_pieces': 2,
                'climatisation': True,
                'meuble': False
            }
        },
        {
            'titre': 'Terrain constructible 1000m² Owendo',
            'description': 'Terrain plat et constructible de 1000m² situé à Owendo. Accès facile, proche des commodités. Idéal pour construction de villa ou immeuble.',
            'categorie': 'immobilier',
            'type_annonce': 'vente',
            'prix': 15000000,
            'ville': 'Libreville',
            'quartier': 'Owendo',
            'localisation': 'Owendo, zone résidentielle en développement',
            'contact_nom': 'Paul Mba',
            'contact_telephone': '+241-05-11-22-33',
            'contact_email': 'paul.mba@email.com',
            'statut': 'publie',
            'donnees_specifiques': {
                'type_bien': 'Terrain',
                'surface': 1000
            }
        }
    ]
    
    # Données d'exemple pour les véhicules
    annonces_vehicules = [
        {
            'titre': 'Toyota Camry 2018 - Excellent état',
            'description': 'Toyota Camry 2018 en excellent état. Entretien régulier, carnet de maintenance à jour. Véhicule non accidenté, première main. Climatisation, vitres électriques, radio CD.',
            'categorie': 'vehicules',
            'type_annonce': 'vente',
            'prix': 12500000,
            'ville': 'Port-Gentil',
            'localisation': 'Port-Gentil centre',
            'contact_nom': 'Sylvie Moussavou',
            'contact_telephone': '+241-06-55-44-33',
            'contact_whatsapp': '+24106554433',
            'statut': 'publie',
            'donnees_specifiques': {
                'marque': 'Toyota',
                'modele': 'Camry',
                'annee': 2018,
                'kilometrage': 45000,
                'carburant': 'essence',
                'transmission': 'automatique',
                'couleur': 'Blanc',
                'nombre_portes': 4,
                'nombre_places': 5,
                'etat': 'tres_bon',
                'premiere_main': True,
                'carnet_entretien': True,
                'controle_technique': True,
                'papiers_en_regle': True,
                'accidents': False
            }
        },
        {
            'titre': 'Nissan Patrol 4x4 - Parfait pour brousse',
            'description': 'Nissan Patrol 4x4 robuste et fiable. Parfait pour les déplacements en brousse et terrains difficiles. Moteur diesel économique, climatisation, radio.',
            'categorie': 'vehicules',
            'type_annonce': 'vente',
            'prix': 8500000,
            'ville': 'Franceville',
            'localisation': 'Franceville, quartier Potos',
            'contact_nom': 'Michel Ndong',
            'contact_telephone': '+241-07-33-22-11',
            'statut': 'publie',
            'donnees_specifiques': {
                'marque': 'Nissan',
                'modele': 'Patrol',
                'annee': 2015,
                'kilometrage': 120000,
                'carburant': 'diesel',
                'transmission': 'manuelle',
                'couleur': 'Vert',
                'nombre_portes': 5,
                'nombre_places': 7,
                'etat': 'bon',
                'papiers_en_regle': True
            }
        }
    ]
    
    # Données d'exemple pour l'informatique
    annonces_informatique = [
        {
            'titre': 'MacBook Pro 13" 2021 - Comme neuf',
            'description': 'MacBook Pro 13 pouces 2021 avec puce M1. Utilisé seulement 6 mois, comme neuf. Parfait pour travail professionnel, montage vidéo, développement. Boîte et accessoires inclus.',
            'categorie': 'informatique',
            'type_annonce': 'vente',
            'prix': 950000,
            'ville': 'Libreville',
            'quartier': 'Akanda',
            'localisation': 'Akanda, remise en main propre possible',
            'contact_nom': 'David Koumba',
            'contact_telephone': '+241-06-77-88-99',
            'contact_email': 'david.koumba@email.com',
            'statut': 'publie',
            'donnees_specifiques': {
                'type_materiel': 'ordinateur_portable',
                'marque': 'Apple',
                'modele': 'MacBook Pro 13"',
                'processeur': 'Apple M1',
                'memoire_ram': 8,
                'stockage': 256,
                'type_stockage': 'SSD',
                'taille_ecran': 13.3,
                'systeme_exploitation': 'macOS',
                'etat': 'comme_neuf',
                'garantie': True,
                'duree_garantie': 18,
                'boite_origine': True,
                'facture_disponible': True,
                'accessoires_inclus': ['Chargeur MagSafe', 'Câble USB-C', 'Documentation']
            }
        },
        {
            'titre': 'Samsung Galaxy S22 Ultra - État impeccable',
            'description': 'Samsung Galaxy S22 Ultra 256GB en état impeccable. Écran sans rayure, batterie excellente. Téléphone haut de gamme avec S Pen inclus. Idéal pour photo et productivité.',
            'categorie': 'informatique',
            'type_annonce': 'vente',
            'prix': 485000,
            'ville': 'Libreville',
            'quartier': 'Glass',
            'localisation': 'Glass, livraison possible Libreville',
            'contact_nom': 'Fatou Diallo',
            'contact_telephone': '+241-05-99-88-77',
            'contact_whatsapp': '+24105998877',
            'statut': 'publie',
            'donnees_specifiques': {
                'type_materiel': 'smartphone',
                'marque': 'Samsung',
                'modele': 'Galaxy S22 Ultra',
                'memoire_ram': 12,
                'stockage': 256,
                'taille_ecran': 6.8,
                'systeme_exploitation': 'Android 12',
                'etat': 'tres_bon',
                'garantie': False,
                'boite_origine': True,
                'accessoires_inclus': ['Chargeur rapide', 'Câble USB-C', 'S Pen', 'Coque de protection']
            }
        }
    ]
    
    # Insérer toutes les annonces
    toutes_annonces = annonces_immobilier + annonces_vehicules + annonces_informatique
    
    for i, annonce in enumerate(toutes_annonces):
        # Ajouter une date d'expiration
        annonce['date_expiration'] = datetime.now() + timedelta(days=random.randint(30, 90))
        
        try:
            annonce_id = db.ajouter_annonce(annonce)
            print(f"✅ Annonce {i+1}/{len(toutes_annonces)} créée: {annonce['titre']} (ID: {annonce_id})")
            
            # Générer quelques événements analytics aléatoirement
            generer_analytics_demo(db, annonce_id)
            
        except Exception as e:
            print(f"❌ Erreur lors de la création de l'annonce {i+1}: {e}")
    
    print(f"🎉 Génération terminée! {len(toutes_annonces)} annonces créées.")

def generer_analytics_demo(db: Database, annonce_id: int):
    """Générer des événements analytics de démonstration"""
    # Générer des vues aléatoirement
    nb_vues = random.randint(5, 50)
    for _ in range(nb_vues):
        date_vue = datetime.now() - timedelta(days=random.randint(0, 30))
        db.enregistrer_evenement(annonce_id, 'vue', ip_address=f"192.168.1.{random.randint(1, 255)}")
    
    # Générer quelques clics contact
    nb_clics = random.randint(0, max(1, nb_vues // 10))
    for _ in range(nb_clics):
        source = random.choice(['whatsapp', 'telephone', 'email'])
        db.enregistrer_evenement(annonce_id, 'clic_contact', source)
    
    # Générer quelques partages
    nb_partages = random.randint(0, max(1, nb_vues // 20))
    for _ in range(nb_partages):
        source = random.choice(['whatsapp', 'facebook', 'instagram'])
        db.enregistrer_evenement(annonce_id, 'partage', source)

if __name__ == "__main__":
    generer_donnees_demo()

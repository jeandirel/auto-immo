"""
Interface d'administration
Gestion des annonces par l'administrateur
"""

import streamlit as st
import json
import os
from datetime import datetime, timedelta
from typing import Dict
from models.database import Database
from models.annonce_models import (
    VILLES_GABON, TYPES_BIEN_IMMOBILIER, MARQUES_VEHICULES, MARQUES_INFORMATIQUE
)
from utils.auth import require_admin
from utils.helpers import format_prix, format_date, sauvegarder_image, get_site_settings

def main():
    """Page principale d'administration"""
    # Vérifier les droits d'accès
    require_admin()
    
    st.title("Administration - Gestion des annonces")
    
    # Menu de navigation admin
    tab1, tab2, tab3, tab4 = st.tabs([
        "Créer une annonce", 
        "Gérer les annonces", 
        "Statistiques", 
        "Paramètres"
    ])
    
    with tab1:
        creer_annonce()
    
    with tab2:
        gerer_annonces()
    
    with tab3:
        afficher_statistiques_admin()
    
    with tab4:
        parametres_admin()

def creer_annonce():
    """Interface de création d'annonce"""
    st.header("Créer une nouvelle annonce")
    
    # Sélection de la catégorie
    categorie = st.selectbox(
        "Catégorie *",
        options=['immobilier', 'vehicules', 'informatique'],
        format_func=lambda x: x.title()
    )
    
    # Informations de base
    col1, col2 = st.columns(2)
    
    with col1:
        titre = st.text_input("Titre de l'annonce *", max_chars=100)
        type_annonce = st.selectbox(
            "Type d'annonce *",
            options=['vente', 'location'] if categorie != 'informatique' else ['vente'],
            format_func=lambda x: x.title()
        )
        prix = st.number_input("Prix (FCFA) *", min_value=0, step=1000)
    
    with col2:
        ville = st.selectbox("Ville *", options=VILLES_GABON)
        quartier = st.text_input("Quartier")
        localisation = st.text_area("Localisation précise", height=100)
    
    # Description
    description = st.text_area("Description *", height=150, max_chars=1000)
    
    # Informations de contact
    st.subheader("Informations de contact")
    col1, col2 = st.columns(2)
    
    with col1:
        contact_nom = st.text_input("Nom du contact *")
        contact_telephone = st.text_input("Téléphone *", placeholder="+241-XX-XX-XX-XX")
    
    with col2:
        contact_email = st.text_input("Email", placeholder="contact@example.com")
        contact_whatsapp = st.text_input("WhatsApp", placeholder="+241XXXXXXXX")
    
    # Photos
    st.subheader("Photos")
    photos_uploadees = st.file_uploader(
        "Ajouter des photos (max 5)",
        type=['jpg', 'jpeg', 'png'],
        accept_multiple_files=True
    )
    
    if photos_uploadees and len(photos_uploadees) > 5:
        st.error("Maximum 5 photos autorisées")
        photos_uploadees = photos_uploadees[:5]
    
    # Informations spécifiques selon la catégorie
    donnees_specifiques = {}
    
    if categorie == 'immobilier':
        donnees_specifiques = formulaire_immobilier()
    elif categorie == 'vehicules':
        donnees_specifiques = formulaire_vehicule()
    elif categorie == 'informatique':
        donnees_specifiques = formulaire_informatique()
    
    # Paramètres de publication
    st.subheader("Paramètres de publication")
    col1, col2 = st.columns(2)
    
    with col1:
        statut = st.selectbox(
            "Statut",
            options=['brouillon', 'publie'],
            format_func=lambda x: 'Brouillon' if x == 'brouillon' else 'Publié'
        )
    
    with col2:
        duree_publication = st.selectbox(
            "Durée de publication",
            options=[30, 60, 90, 120],
            format_func=lambda x: f"{x} jours"
        )
    
    # Bouton de création
    if st.button("Créer l'annonce", type="primary", use_container_width=True):
        # Validation
        erreurs = []
        
        if not titre:
            erreurs.append("Le titre est obligatoire")
        if not description:
            erreurs.append("La description est obligatoire")
        if prix <= 0:
            erreurs.append("Le prix doit être supérieur à 0")
        if not contact_nom:
            erreurs.append("Le nom du contact est obligatoire")
        if not contact_telephone:
            erreurs.append("Le téléphone est obligatoire")
        
        if erreurs:
            for erreur in erreurs:
                st.error(f"❌ {erreur}")
            return
        
        # Sauvegarder les photos
        chemins_photos = []
        if photos_uploadees:
            for photo in photos_uploadees:
                chemin = sauvegarder_image(photo)
                if chemin:
                    chemins_photos.append(chemin)
        
        # Préparer les données
        date_expiration = datetime.now() + timedelta(days=duree_publication)
        
        annonce_data = {
            'titre': titre,
            'description': description,
            'categorie': categorie,
            'type_annonce': type_annonce,
            'prix': prix,
            'localisation': localisation,
            'ville': ville,
            'quartier': quartier,
            'contact_nom': contact_nom,
            'contact_telephone': contact_telephone,
            'contact_email': contact_email,
            'contact_whatsapp': contact_whatsapp,
            'statut': statut,
            'date_expiration': date_expiration,
            'donnees_specifiques': donnees_specifiques,
            'photos': chemins_photos
        }
        
        # Sauvegarder en base
        try:
            db = Database()
            annonce_id = db.ajouter_annonce(annonce_data)
            st.success(f"Annonce créée avec succès ! ID: {annonce_id}")
            
            # Réinitialiser le formulaire
            st.rerun()
            
        except Exception as e:
            st.error(f"❌ Erreur lors de la création: {e}")

def formulaire_immobilier():
    """Formulaire spécifique pour l'immobilier"""
    st.subheader("Informations immobilières")
    
    col1, col2 = st.columns(2)
    
    with col1:
        type_bien = st.selectbox("Type de bien", options=TYPES_BIEN_IMMOBILIER)
        surface = st.number_input("Surface (m²)", min_value=0, step=1)
        nombre_chambres = st.number_input("Nombre de chambres", min_value=0, max_value=20, step=1)
        nombre_salles_bain = st.number_input("Salles de bain", min_value=0, max_value=10, step=1)
    
    with col2:
        nombre_pieces = st.number_input("Nombre de pièces", min_value=0, max_value=50, step=1)
        etage = st.number_input("Étage", min_value=0, max_value=100, step=1)
        caution = st.number_input("Caution (FCFA)", min_value=0, step=1000)
        frais_agence = st.number_input("Frais d'agence (FCFA)", min_value=0, step=1000)
    
    # Équipements
    st.write("**Équipements disponibles:**")
    col1, col2, col3 = st.columns(3)
    
    with col1:
        ascenseur = st.checkbox("Ascenseur")
        parking = st.checkbox("Parking")
        jardin = st.checkbox("Jardin")
    
    with col2:
        piscine = st.checkbox("Piscine")
        climatisation = st.checkbox("Climatisation")
        meuble = st.checkbox("Meublé")
    
    with col3:
        charges_incluses = st.checkbox("Charges incluses")
    
    return {
        'type_bien': type_bien,
        'surface': surface if surface > 0 else None,
        'nombre_chambres': nombre_chambres if nombre_chambres > 0 else None,
        'nombre_salles_bain': nombre_salles_bain if nombre_salles_bain > 0 else None,
        'nombre_pieces': nombre_pieces if nombre_pieces > 0 else None,
        'etage': etage if etage > 0 else None,
        'caution': caution if caution > 0 else None,
        'frais_agence': frais_agence if frais_agence > 0 else None,
        'ascenseur': ascenseur,
        'parking': parking,
        'jardin': jardin,
        'piscine': piscine,
        'climatisation': climatisation,
        'meuble': meuble,
        'charges_incluses': charges_incluses
    }

def formulaire_vehicule():
    """Formulaire spécifique pour les véhicules"""
    st.subheader("Informations véhicule")
    
    col1, col2 = st.columns(2)
    
    with col1:
        marque = st.selectbox("Marque", options=[''] + MARQUES_VEHICULES)
        modele = st.text_input("Modèle")
        annee = st.number_input("Année", min_value=1990, max_value=datetime.now().year + 1, step=1)
        kilometrage = st.number_input("Kilométrage", min_value=0, step=1000)
    
    with col2:
        carburant = st.selectbox("Carburant", options=['', 'essence', 'diesel', 'hybride', 'electrique'])
        transmission = st.selectbox("Transmission", options=['', 'manuelle', 'automatique'])
        couleur = st.text_input("Couleur")
        etat = st.selectbox("État", options=['', 'neuf', 'tres_bon', 'bon', 'correct', 'a_reparer'])
    
    # Caractéristiques techniques
    col1, col2 = st.columns(2)
    with col1:
        nombre_portes = st.number_input("Nombre de portes", min_value=2, max_value=5, step=1)
        nombre_places = st.number_input("Nombre de places", min_value=2, max_value=9, step=1)
    
    with col2:
        puissance = st.number_input("Puissance (ch)", min_value=0, step=1)
        cylindree = st.number_input("Cylindrée (L)", min_value=0.0, step=0.1, format="%.1f")
    
    # Documents et état
    st.write("**Documents et état:**")
    col1, col2 = st.columns(2)
    
    with col1:
        premiere_main = st.checkbox("Première main")
        carnet_entretien = st.checkbox("Carnet d'entretien")
        controle_technique = st.checkbox("Contrôle technique à jour")
    
    with col2:
        assurance_valide = st.checkbox("Assurance valide")
        papiers_en_regle = st.checkbox("Papiers en règle")
        accidents = st.checkbox("Véhicule accidenté")
    
    return {
        'marque': marque,
        'modele': modele,
        'annee': annee if annee > 1990 else None,
        'kilometrage': kilometrage if kilometrage > 0 else None,
        'carburant': carburant,
        'transmission': transmission,
        'couleur': couleur,
        'etat': etat,
        'nombre_portes': nombre_portes if nombre_portes > 0 else None,
        'nombre_places': nombre_places if nombre_places > 0 else None,
        'puissance': puissance if puissance > 0 else None,
        'cylindree': cylindree if cylindree > 0 else None,
        'premiere_main': premiere_main,
        'carnet_entretien': carnet_entretien,
        'controle_technique': controle_technique,
        'assurance_valide': assurance_valide,
        'papiers_en_regle': papiers_en_regle,
        'accidents': accidents
    }

def formulaire_informatique():
    """Formulaire spécifique pour l'informatique"""
    st.subheader("Informations matériel informatique")
    
    col1, col2 = st.columns(2)
    
    with col1:
        type_materiel = st.selectbox(
            "Type de matériel",
            options=['', 'ordinateur_portable', 'ordinateur_bureau', 'smartphone', 'tablette', 'accessoire']
        )
        marque = st.selectbox("Marque", options=[''] + MARQUES_INFORMATIQUE)
        modele = st.text_input("Modèle")
        processeur = st.text_input("Processeur")
    
    with col2:
        memoire_ram = st.number_input("RAM (GB)", min_value=0, step=1)
        stockage = st.number_input("Stockage (GB)", min_value=0, step=1)
        type_stockage = st.selectbox("Type de stockage", options=['', 'HDD', 'SSD', 'eMMC'])
        carte_graphique = st.text_input("Carte graphique")
    
    # Écran et système
    col1, col2 = st.columns(2)
    with col1:
        taille_ecran = st.number_input("Taille écran (pouces)", min_value=0.0, step=0.1, format="%.1f")
        resolution_ecran = st.text_input("Résolution écran")
    
    with col2:
        systeme_exploitation = st.text_input("Système d'exploitation")
        etat = st.selectbox("État", options=['', 'neuf', 'comme_neuf', 'tres_bon', 'bon', 'correct'])
    
    # Garantie et accessoires
    col1, col2 = st.columns(2)
    with col1:
        garantie = st.checkbox("Sous garantie")
        duree_garantie = st.number_input("Durée garantie (mois)", min_value=0, max_value=60, step=1) if garantie else 0
    
    with col2:
        boite_origine = st.checkbox("Boîte d'origine")
        facture_disponible = st.checkbox("Facture disponible")
    
    # Accessoires
    accessoires_text = st.text_area("Accessoires inclus (un par ligne)")
    accessoires_inclus = [acc.strip() for acc in accessoires_text.split('\n') if acc.strip()] if accessoires_text else []
    
    return {
        'type_materiel': type_materiel,
        'marque': marque,
        'modele': modele,
        'processeur': processeur,
        'memoire_ram': memoire_ram if memoire_ram > 0 else None,
        'stockage': stockage if stockage > 0 else None,
        'type_stockage': type_stockage,
        'carte_graphique': carte_graphique,
        'taille_ecran': taille_ecran if taille_ecran > 0 else None,
        'resolution_ecran': resolution_ecran,
        'systeme_exploitation': systeme_exploitation,
        'etat': etat,
        'garantie': garantie,
        'duree_garantie': duree_garantie if garantie and duree_garantie > 0 else None,
        'accessoires_inclus': accessoires_inclus,
        'boite_origine': boite_origine,
        'facture_disponible': facture_disponible
    }

def gerer_annonces():
    """Interface de gestion des annonces existantes"""
    st.header("Gestion des annonces")
    st.session_state.setdefault('annonce_en_edition', None)
    
    db = Database()
    
    # Filtres
    col1, col2, col3 = st.columns(3)
    with col1:
        filtre_statut = st.selectbox("Statut", options=['tous', 'brouillon', 'publie', 'expire', 'archive'])
    with col2:
        filtre_categorie = st.selectbox("Catégorie", options=['toutes', 'immobilier', 'vehicules', 'informatique'])
    with col3:
        filtre_ville = st.selectbox("Ville", options=['toutes'] + VILLES_GABON)
    
    # Construire les filtres
    filtres = {}
    if filtre_statut != 'tous':
        filtres['statut'] = filtre_statut
    if filtre_categorie != 'toutes':
        filtres['categorie'] = filtre_categorie
    if filtre_ville != 'toutes':
        filtres['ville'] = filtre_ville
    
    # Récupérer les annonces
    annonces = db.obtenir_annonces(filtres, limit=100)
    
    if not annonces:
        st.info("Aucune annonce trouvée")
        return
    
    st.write(f"**{len(annonces)} annonce(s) trouvée(s)**")
    
    # Afficher les annonces
    for annonce in annonces:
        with st.expander(f"{annonce['titre']} - {format_prix(annonce['prix'])} ({annonce['statut']})"):
            col1, col2, col3, col4 = st.columns(4)
            
            with col1:
                st.write(f"**ID:** {annonce['id']}")
                st.write(f"**Catégorie:** {annonce['categorie'].title()}")
                st.write(f"**Type:** {annonce['type_annonce'].title()}")
            
            with col2:
                st.write(f"**Ville:** {annonce['ville']}")
                st.write(f"**Contact:** {annonce['contact_nom']}")
                st.write(f"**Téléphone:** {annonce['contact_telephone']}")
            
            with col3:
                st.write(f"**Vues:** {annonce.get('vues', 0)}")
                st.write(f"**Contacts:** {annonce.get('clics_contact', 0)}")
                st.write(f"**Partages:** {annonce.get('partages', 0)}")
            
            with col4:
                st.write(f"**Créé:** {format_date(annonce['date_creation'])}")
                st.write(f"**Expire:** {format_date(annonce['date_expiration']) if annonce['date_expiration'] else 'Jamais'}")
            
            # Actions
            col1, col2, col3, col4 = st.columns(4)

            with col1:
                if st.button("Voir", key=f"voir_admin_{annonce['id']}"):
                    st.session_state.annonce_selectionnee = annonce['id']
                    st.session_state.page = 'detail_annonce'
                    st.rerun()

            with col2:
                if st.button("Modifier", key=f"edit_{annonce['id']}"):
                    st.session_state.annonce_en_edition = annonce['id']

            with col3:
                nouveau_statut = 'archive' if annonce['statut'] != 'archive' else 'publie'
                libelle = 'Archiver' if nouveau_statut == 'archive' else 'Republier'
                if st.button(libelle, key=f"archive_{annonce['id']}"):
                    conn = db.get_connection()
                    cursor = conn.cursor()
                    cursor.execute("UPDATE annonces SET statut = ? WHERE id = ?", (nouveau_statut, annonce['id']))
                    conn.commit()
                    conn.close()
                    st.success(f"Annonce {'archivée' if nouveau_statut == 'archive' else 'publiée'}")
                    st.rerun()

            with col4:
                if st.button("Supprimer", key=f"delete_{annonce['id']}"):
                    if st.session_state.get(f'confirm_delete_{annonce["id"]}'):
                        conn = db.get_connection()
                        cursor = conn.cursor()
                        cursor.execute("DELETE FROM annonces WHERE id = ?", (annonce['id'],))
                        cursor.execute("DELETE FROM analytics WHERE annonce_id = ?", (annonce['id'],))
                        conn.commit()
                        conn.close()
                        st.success("Annonce supprimée")
                        st.rerun()
                    else:
                        st.session_state[f'confirm_delete_{annonce["id"]}'] = True
                        st.warning("Cliquez à nouveau pour confirmer la suppression")

            if st.session_state.get('annonce_en_edition') == annonce['id']:
                afficher_formulaire_modification(annonce)

def afficher_formulaire_modification(annonce):
    """Formulaire d'édition d'une annonce existante."""
    st.markdown("#### Modifier l'annonce")

    photos_existantes = annonce.get('photos') or []
    ville_actuelle = annonce.get('ville', '') or ''
    villes = list(VILLES_GABON)
    if ville_actuelle and ville_actuelle not in villes:
        villes = [ville_actuelle] + villes

    keep_flags = []

    with st.form(f"edit_form_{annonce['id']}"):
        col1, col2 = st.columns(2)

        with col1:
            titre = st.text_input("Titre", value=annonce['titre'])
            prix = st.number_input("Prix (FCFA)", min_value=0, step=10000, value=int(annonce['prix']))
            ville = st.selectbox("Ville", options=villes, index=villes.index(ville_actuelle) if ville_actuelle in villes else 0)
            quartier = st.text_input("Quartier", value=annonce.get('quartier') or "")
        with col2:
            statut = st.selectbox(
                "Statut",
                options=['publie', 'brouillon', 'archive', 'expire'],
                index=['publie', 'brouillon', 'archive', 'expire'].index(annonce.get('statut', 'publie'))
            )
            localisation = st.text_area("Localisation précise", value=annonce.get('localisation') or '', height=90)

        description = st.text_area("Description", value=annonce.get('description') or '', height=180)

        st.markdown("**Coordonnées du vendeur**")
        col1, col2 = st.columns(2)
        with col1:
            contact_nom = st.text_input("Nom", value=annonce.get('contact_nom') or '')
            contact_telephone = st.text_input("Téléphone", value=annonce.get('contact_telephone') or '')
        with col2:
            contact_email = st.text_input("Email", value=annonce.get('contact_email') or '')
            contact_whatsapp = st.text_input("WhatsApp", value=annonce.get('contact_whatsapp') or '')

        if photos_existantes:
            st.markdown("**Photos existantes**")
            for idx, photo in enumerate(photos_existantes):
                preview_col, keep_col = st.columns([3, 1])
                with preview_col:
                    if photo and (photo.startswith('http://') or photo.startswith('https://')):
                        st.image(photo, use_column_width=True)
                    elif photo and os.path.exists(photo):
                        st.image(photo, use_column_width=True)
                    else:
                        st.caption("Aperçu indisponible")
                with keep_col:
                    keep = st.checkbox("Conserver", value=True, key=f"keep_{annonce['id']}_{idx}")
                keep_flags.append(keep)
        else:
            keep_flags = []

        nouvelles_photos = st.file_uploader(
            "Ajouter de nouvelles photos",
            type=['jpg', 'jpeg', 'png', 'webp'],
            accept_multiple_files=True
        )

        enregistrer = st.form_submit_button("Enregistrer les modifications")

    if enregistrer:
        photos = [photo for photo, keep in zip(photos_existantes, keep_flags) if keep]
        if nouvelles_photos:
            for fichier in nouvelles_photos:
                chemin = sauvegarder_image(fichier)
                if chemin:
                    photos.append(chemin)

        modifications = {
            'titre': titre.strip(),
            'prix': prix,
            'ville': ville,
            'quartier': quartier.strip() or None,
            'localisation': localisation.strip(),
            'description': description.strip(),
            'contact_nom': contact_nom.strip(),
            'contact_telephone': contact_telephone.strip(),
            'contact_email': contact_email.strip() or None,
            'contact_whatsapp': contact_whatsapp.strip() or None,
            'statut': statut,
            'photos': photos,
        }

        db = Database()
        db.mettre_a_jour_annonce(annonce['id'], modifications)
        st.success("Annonce mise à jour avec succès")
        st.session_state.annonce_en_edition = None
        st.rerun()

    if st.button("Annuler", key=f"cancel_edit_{annonce['id']}"):
        st.session_state.annonce_en_edition = None
        st.rerun()

def afficher_statistiques_admin():
    """Afficher les statistiques pour l'admin"""
    st.header("Statistiques administrateur")
    
    db = Database()
    
    # Statistiques générales
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        total_annonces = len(db.obtenir_annonces())
        st.metric("Total annonces", total_annonces)
    
    with col2:
        annonces_publiees = len(db.obtenir_annonces({'statut': 'publie'}))
        st.metric("Publiées", annonces_publiees)
    
    with col3:
        brouillons = len(db.obtenir_annonces({'statut': 'brouillon'}))
        st.metric("Brouillons", brouillons)
    
    with col4:
        archives = len(db.obtenir_annonces({'statut': 'archive'}))
        st.metric("Archivées", archives)
    
    # Statistiques par catégorie
    st.subheader("Par catégorie")
    col1, col2, col3 = st.columns(3)
    
    with col1:
        immobilier = len(db.obtenir_annonces({'categorie': 'immobilier', 'statut': 'publie'}))
        st.metric("Immobilier", immobilier)
    
    with col2:
        vehicules = len(db.obtenir_annonces({'categorie': 'vehicules', 'statut': 'publie'}))
        st.metric("Véhicules", vehicules)
    
    with col3:
        informatique = len(db.obtenir_annonces({'categorie': 'informatique', 'statut': 'publie'}))
        st.metric("Informatique", informatique)

def parametres_admin():
    """Paramètres administrateur"""
    st.header("Paramètres du site")

    db = Database()
    settings = get_site_settings()
    company_name = settings.get("company_name", "AUTO-IMMO")
    logo_path = settings.get("logo_path", "")

    st.subheader("Identité visuelle")
    preview_col, form_col = st.columns([1, 2])

    with preview_col:
        if logo_path:
            st.image(logo_path, width=180, caption="Logo actuel")
        else:
            st.caption("Aucun logo défini pour le moment.")

    with form_col:
        with st.form("site_identity_form"):
            nouveau_nom = st.text_input(
                "Nom de l'entreprise / de l'agence",
                value=company_name,
                max_chars=80,
            )
            logo_file = st.file_uploader(
                "Logo (PNG, JPG, WebP)",
                type=['png', 'jpg', 'jpeg', 'webp']
            )
            supprimer_logo = st.checkbox("Supprimer le logo actuel") if logo_path else False
            submit_identite = st.form_submit_button("Enregistrer les modifications")

        if submit_identite:
            updates: Dict[str, Optional[str]] = {}
            nom_nettoye = nouveau_nom.strip()
            if nom_nettoye and nom_nettoye != company_name:
                updates["company_name"] = nom_nettoye

            if logo_file:
                nouveau_logo = sauvegarder_image(logo_file)
                if nouveau_logo:
                    updates["logo_path"] = nouveau_logo
            elif supprimer_logo and logo_path:
                updates["logo_path"] = None

            if updates:
                for cle, valeur in updates.items():
                    db.set_setting(cle, valeur)

                get_site_settings(force=True)
                st.success("Identité du site mise à jour.")
            else:
                st.info("Aucune modification détectée.")

    st.markdown("---")
    st.subheader("Maintenance")

    if st.button("Sauvegarder la base de données"):
        st.success("Sauvegarde effectuée (fonctionnalité à implémenter)")
    
    if st.button("Nettoyer les anciennes données analytics"):
        st.success("Nettoyage effectué (fonctionnalité à implémenter)")

if __name__ == "__main__":
    main()

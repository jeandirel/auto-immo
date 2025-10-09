"""
Page de détail d'une annonce
Affichage complet avec galerie, informations, contact et partage
"""

import streamlit as st
import json
from models.database import Database
from utils.helpers import (
    format_prix, format_date, afficher_boutons_partage, 
    afficher_bouton_contact, afficher_galerie_photos
)

def afficher_detail_annonce(annonce_id: int):
    """Afficher le détail complet d'une annonce"""
    db = Database()
    
    # Récupérer l'annonce
    annonce = db.obtenir_annonce_par_id(annonce_id)
    
    if not annonce:
        st.error("❌ Annonce non trouvée")
        return
    
    # Incrémenter le compteur de vues
    db.incrementer_vues(annonce_id)
    db.enregistrer_evenement(annonce_id, 'vue')
    
    # En-tête avec titre et prix
    col1, col2 = st.columns([3, 1])
    
    with col1:
        st.title(annonce['titre'])
        st.markdown(f"**📍 {annonce['ville']}{', ' + annonce['quartier'] if annonce['quartier'] else ''}**")
        st.markdown(f"🏷️ {annonce['categorie'].title()} • {annonce['type_annonce'].title()}")
    
    with col2:
        st.markdown(f"""
        <div style="background: #FF6B35; color: white; padding: 1rem; border-radius: 10px; text-align: center;">
            <h2 style="margin: 0; color: white;">{format_prix(annonce['prix'])}</h2>
        </div>
        """, unsafe_allow_html=True)
    
    # Statistiques de l'annonce
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        st.metric("👁️ Vues", annonce.get('vues', 0))
    with col2:
        st.metric("📞 Contacts", annonce.get('clics_contact', 0))
    with col3:
        st.metric("📤 Partages", annonce.get('partages', 0))
    with col4:
        st.metric("📅 Publié", format_date(annonce['date_creation']))
    
    st.markdown("---")
    
    # Galerie photos
    if annonce.get('photos'):
        photos = json.loads(annonce['photos']) if isinstance(annonce['photos'], str) else annonce['photos']
        afficher_galerie_photos(photos)
        st.markdown("---")
    
    # Description
    st.subheader("📝 Description")
    st.write(annonce['description'])
    
    # Informations spécifiques selon la catégorie
    if annonce['donnees_specifiques']:
        donnees_spec = json.loads(annonce['donnees_specifiques']) if isinstance(annonce['donnees_specifiques'], str) else annonce['donnees_specifiques']
        afficher_informations_specifiques(annonce['categorie'], donnees_spec)
    
    st.markdown("---")
    
    # Contact
    afficher_bouton_contact(annonce)
    
    st.markdown("---")
    
    # Partage social
    st.subheader("📤 Partager cette annonce")
    afficher_boutons_partage(annonce['id'], annonce['titre'], format_prix(annonce['prix']))
    
    # Bouton retour
    st.markdown("---")
    if st.button("🏠 Retour aux annonces", use_container_width=True):
        st.session_state.page = 'accueil'
        if 'annonce_selectionnee' in st.session_state:
            del st.session_state.annonce_selectionnee
        st.rerun()

def afficher_informations_specifiques(categorie: str, donnees: dict):
    """Afficher les informations spécifiques selon la catégorie"""
    st.subheader("ℹ️ Informations détaillées")
    
    if categorie == 'immobilier':
        afficher_info_immobilier(donnees)
    elif categorie == 'vehicules':
        afficher_info_vehicule(donnees)
    elif categorie == 'informatique':
        afficher_info_informatique(donnees)

def afficher_info_immobilier(donnees: dict):
    """Afficher les informations spécifiques à l'immobilier"""
    col1, col2 = st.columns(2)
    
    with col1:
        st.markdown("**🏠 Caractéristiques du bien**")
        if donnees.get('type_bien'):
            st.write(f"• Type: {donnees['type_bien']}")
        if donnees.get('surface'):
            st.write(f"• Surface: {donnees['surface']} m²")
        if donnees.get('nombre_chambres'):
            st.write(f"• Chambres: {donnees['nombre_chambres']}")
        if donnees.get('nombre_salles_bain'):
            st.write(f"• Salles de bain: {donnees['nombre_salles_bain']}")
        if donnees.get('nombre_pieces'):
            st.write(f"• Nombre de pièces: {donnees['nombre_pieces']}")
        if donnees.get('etage') is not None:
            st.write(f"• Étage: {donnees['etage']}")
    
    with col2:
        st.markdown("**✨ Équipements**")
        equipements = []
        if donnees.get('ascenseur'):
            equipements.append("Ascenseur")
        if donnees.get('parking'):
            equipements.append("Parking")
        if donnees.get('jardin'):
            equipements.append("Jardin")
        if donnees.get('piscine'):
            equipements.append("Piscine")
        if donnees.get('climatisation'):
            equipements.append("Climatisation")
        if donnees.get('meuble'):
            equipements.append("Meublé")
        
        if equipements:
            for equip in equipements:
                st.write(f"• {equip}")
        else:
            st.write("Aucun équipement spécifique mentionné")
    
    # Informations financières
    if donnees.get('caution') or donnees.get('frais_agence'):
        st.markdown("**💰 Informations financières**")
        if donnees.get('caution'):
            st.write(f"• Caution: {format_prix(donnees['caution'])}")
        if donnees.get('frais_agence'):
            st.write(f"• Frais d'agence: {format_prix(donnees['frais_agence'])}")
        if donnees.get('charges_incluses'):
            st.write("• Charges incluses dans le loyer")

def afficher_info_vehicule(donnees: dict):
    """Afficher les informations spécifiques aux véhicules"""
    col1, col2 = st.columns(2)
    
    with col1:
        st.markdown("**🚗 Caractéristiques techniques**")
        if donnees.get('marque'):
            st.write(f"• Marque: {donnees['marque']}")
        if donnees.get('modele'):
            st.write(f"• Modèle: {donnees['modele']}")
        if donnees.get('annee'):
            st.write(f"• Année: {donnees['annee']}")
        if donnees.get('kilometrage'):
            st.write(f"• Kilométrage: {donnees['kilometrage']:,} km".replace(',', ' '))
        if donnees.get('carburant'):
            st.write(f"• Carburant: {donnees['carburant'].title()}")
        if donnees.get('transmission'):
            st.write(f"• Transmission: {donnees['transmission'].title()}")
        if donnees.get('couleur'):
            st.write(f"• Couleur: {donnees['couleur']}")
    
    with col2:
        st.markdown("**🔧 Détails techniques**")
        if donnees.get('nombre_portes'):
            st.write(f"• Portes: {donnees['nombre_portes']}")
        if donnees.get('nombre_places'):
            st.write(f"• Places: {donnees['nombre_places']}")
        if donnees.get('puissance'):
            st.write(f"• Puissance: {donnees['puissance']} ch")
        if donnees.get('cylindree'):
            st.write(f"• Cylindrée: {donnees['cylindree']} L")
        if donnees.get('etat'):
            st.write(f"• État: {donnees['etat'].replace('_', ' ').title()}")
    
    # État et documents
    st.markdown("**📋 État et documents**")
    documents = []
    if donnees.get('premiere_main'):
        documents.append("Première main")
    if donnees.get('carnet_entretien'):
        documents.append("Carnet d'entretien")
    if donnees.get('controle_technique'):
        documents.append("Contrôle technique à jour")
    if donnees.get('assurance_valide'):
        documents.append("Assurance valide")
    if donnees.get('papiers_en_regle'):
        documents.append("Papiers en règle")
    
    if documents:
        for doc in documents:
            st.write(f"✅ {doc}")
    
    if donnees.get('accidents'):
        st.write("⚠️ Véhicule accidenté")

def afficher_info_informatique(donnees: dict):
    """Afficher les informations spécifiques au matériel informatique"""
    col1, col2 = st.columns(2)
    
    with col1:
        st.markdown("**💻 Spécifications techniques**")
        if donnees.get('type_materiel'):
            st.write(f"• Type: {donnees['type_materiel'].replace('_', ' ').title()}")
        if donnees.get('marque'):
            st.write(f"• Marque: {donnees['marque']}")
        if donnees.get('modele'):
            st.write(f"• Modèle: {donnees['modele']}")
        if donnees.get('processeur'):
            st.write(f"• Processeur: {donnees['processeur']}")
        if donnees.get('memoire_ram'):
            st.write(f"• RAM: {donnees['memoire_ram']} GB")
        if donnees.get('stockage'):
            st.write(f"• Stockage: {donnees['stockage']} GB {donnees.get('type_stockage', '')}")
        if donnees.get('carte_graphique'):
            st.write(f"• Carte graphique: {donnees['carte_graphique']}")
    
    with col2:
        st.markdown("**📱 Affichage et système**")
        if donnees.get('taille_ecran'):
            st.write(f"• Taille écran: {donnees['taille_ecran']}\"")
        if donnees.get('resolution_ecran'):
            st.write(f"• Résolution: {donnees['resolution_ecran']}")
        if donnees.get('systeme_exploitation'):
            st.write(f"• OS: {donnees['systeme_exploitation']}")
        if donnees.get('etat'):
            st.write(f"• État: {donnees['etat'].replace('_', ' ').title()}")
    
    # Garantie et accessoires
    st.markdown("**📦 Garantie et accessoires**")
    if donnees.get('garantie'):
        duree = donnees.get('duree_garantie', 'Non spécifiée')
        st.write(f"✅ Garantie: {duree} mois" if isinstance(duree, int) else f"✅ Garantie: {duree}")
    else:
        st.write("❌ Pas de garantie")
    
    if donnees.get('boite_origine'):
        st.write("✅ Boîte d'origine")
    if donnees.get('facture_disponible'):
        st.write("✅ Facture disponible")
    
    if donnees.get('accessoires_inclus'):
        st.write("**Accessoires inclus:**")
        for accessoire in donnees['accessoires_inclus']:
            st.write(f"• {accessoire}")

def main():
    """Fonction principale de la page de détail"""
    annonce_id = st.session_state.get('annonce_selectionnee')
    
    if not annonce_id:
        st.error("❌ Aucune annonce sélectionnée")
        if st.button("🏠 Retour à l'accueil"):
            st.session_state.page = 'accueil'
            st.rerun()
        return
    
    afficher_detail_annonce(annonce_id)

if __name__ == "__main__":
    main()

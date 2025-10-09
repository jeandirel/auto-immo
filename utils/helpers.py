"""
Fonctions utilitaires pour l'application
Formatage, validation, gestion des médias, etc.
"""

import os
import re
import uuid
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional

import requests
import streamlit as st
from PIL import Image
import urllib.parse


def format_prix(prix: float, devise: str = 'FCFA') -> str:
    """Formater un prix avec la devise"""
    if prix >= 1000000:
        return f"{prix/1000000:.1f}M {devise}"
    elif prix >= 1000:
        return f"{prix/1000:.0f}K {devise}"
    else:
        return f"{prix:,.0f} {devise}".replace(',', ' ')

def format_date(date) -> str:
    """Formater une date en français"""
    if not date:
        return "Non spécifiée"

    # Convertir la chaîne en datetime si nécessaire
    if isinstance(date, str):
        try:
            # Format de date SQLite : "YYYY-MM-DD HH:MM:SS"
            date = datetime.strptime(date, "%Y-%m-%d %H:%M:%S.%f")
        except ValueError:
            try:
                date = datetime.strptime(date, "%Y-%m-%d %H:%M:%S")
            except ValueError:
                return "Date invalide"

    now = datetime.now()
    diff = now - date
    
    if diff.days == 0:
        if diff.seconds < 3600:
            minutes = diff.seconds // 60
            return f"Il y a {minutes} minute{'s' if minutes > 1 else ''}"
        else:
            heures = diff.seconds // 3600
            return f"Il y a {heures} heure{'s' if heures > 1 else ''}"
    elif diff.days == 1:
        return "Hier"
    elif diff.days < 7:
        return f"Il y a {diff.days} jours"
    else:
        return date.strftime("%d/%m/%Y")


def get_site_settings(force: bool = False) -> Dict[str, str]:
    """Récupérer et mettre en cache les paramètres d'identité du site."""
    cache_key = "site_settings"
    if force or cache_key not in st.session_state:
        from models.database import Database

        db = Database()
        settings = db.get_settings()
        st.session_state[cache_key] = {
            "company_name": (settings.get("company_name") or "AUTO-IMMO").strip(),
            "logo_path": settings.get("logo_path") or "",
        }
    return st.session_state[cache_key]

def valider_telephone(telephone: str) -> bool:
    """Valider un numéro de téléphone gabonais"""
    # Format gabonais: +241-XX-XX-XX-XX ou 0X-XX-XX-XX
    pattern = r'^(\+241[-\s]?)?[0-9]{2}[-\s]?[0-9]{2}[-\s]?[0-9]{2}[-\s]?[0-9]{2}$'
    return bool(re.match(pattern, telephone.replace(' ', '-')))

def valider_email(email: str) -> bool:
    """Valider une adresse email"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))

def _save_image_local(uploaded_file, dossier: str) -> Optional[str]:
    """Sauvegarder l'image sur le disque local."""
    os.makedirs(dossier, exist_ok=True)

    extension = uploaded_file.name.rsplit(".", 1)[-1].lower()
    nom_fichier = f"{uuid.uuid4()}.{extension}"
    chemin_fichier = os.path.join(dossier, nom_fichier)

    uploaded_file.seek(0)

    try:
        with open(chemin_fichier, "wb") as fichier:
            fichier.write(uploaded_file.getbuffer())

        if extension in ["jpg", "jpeg", "png", "webp"]:
            optimiser_image(chemin_fichier)

        return chemin_fichier
    except Exception as exc:
        st.error(f"Erreur lors de la sauvegarde locale: {exc}")
        return None


def _save_image_remote(uploaded_file, config: Dict[str, Any]) -> Optional[str]:
    """Envoyer l'image vers un stockage distant via une API HTTP."""
    upload_url = config.get("upload_url")
    if not upload_url:
        st.error("Configuration du stockage distant incomplète: 'upload_url' manquant.")
        return None

    extension = uploaded_file.name.rsplit(".", 1)[-1].lower()
    filename_prefix = config.get("filename_prefix", "immo")
    nom_fichier = f"{filename_prefix}-{uuid.uuid4()}.{extension}"

    file_field = config.get("file_field", "file")
    headers = config.get("headers", {})
    form_fields = config.get("form_fields", {})
    timeout = config.get("timeout", 30)

    uploaded_file.seek(0)
    fichiers = {
        file_field: (
            nom_fichier,
            uploaded_file.getvalue(),
            uploaded_file.type or "application/octet-stream",
        )
    }

    try:
        response = requests.post(
            upload_url,
            files=fichiers,
            data=form_fields,
            headers=headers,
            timeout=timeout,
        )
        response.raise_for_status()
        payload = response.json()
    except requests.RequestException as exc:
        st.error(f"Erreur lors de l'envoi vers le stockage distant: {exc}")
        return None
    except ValueError:
        st.error("Réponse inattendue du stockage distant: JSON manquant.")
        return None

    url_key = config.get("url_key", "url")
    image_url = payload.get(url_key)

    if not image_url:
        st.error(f"Réponse du stockage distant invalide (clé '{url_key}' absente).")
        return None

    return image_url


def sauvegarder_image(uploaded_file, dossier: str = "uploads") -> Optional[str]:
    """Sauvegarder une image uploadée vers le backend configuré."""
    if uploaded_file is None:
        return None

    storage_config = st.secrets.get("storage", {}) or {}
    provider = storage_config.get("provider", "local").lower()

    if provider == "remote":
        return _save_image_remote(uploaded_file, storage_config)

    return _save_image_local(uploaded_file, dossier)

def optimiser_image(chemin_image: str, taille_max: tuple = (1200, 800), qualite: int = 85):
    """Optimiser une image pour le web tout en conservant son format d'origine."""
    try:
        extension = os.path.splitext(chemin_image)[1].lower()
        with Image.open(chemin_image) as img:
            format_sortie = {
                '.jpg': 'JPEG',
                '.jpeg': 'JPEG',
                '.png': 'PNG',
                '.webp': 'WEBP'
            }.get(extension, img.format or 'PNG')

            if format_sortie in ('JPEG', 'WEBP') and img.mode not in ('RGB', 'L'):
                img = img.convert('RGB')
            elif format_sortie == 'PNG' and img.mode == 'P':
                img = img.convert('RGBA')
            
            img.thumbnail(taille_max, Image.Resampling.LANCZOS)

            save_kwargs = {}
            if format_sortie == 'JPEG':
                save_kwargs = {'quality': qualite, 'optimize': True, 'progressive': True}
            elif format_sortie == 'PNG':
                save_kwargs = {'optimize': True}
            elif format_sortie == 'WEBP':
                save_kwargs = {'quality': qualite, 'method': 6}

            img.save(chemin_image, format=format_sortie, **save_kwargs)
    except Exception as e:
        st.error(f"Erreur lors de l'optimisation de l'image: {e}")

def generer_url_partage(annonce_id: int, plateforme: str, titre: str, prix: str) -> str:
    """Générer une URL de partage pour les réseaux sociaux"""
    base_url = st.secrets.get('app', {}).get('base_url', 'https://your-app.streamlit.app')
    url_annonce = f"{base_url}/?annonce={annonce_id}&utm_source={plateforme}&utm_medium=social&utm_campaign=partage"
    
    message = f"{titre} - {prix} - Voir l'annonce: {url_annonce}"
    
    if plateforme == 'whatsapp':
        return f"https://wa.me/?text={urllib.parse.quote(message)}"
    elif plateforme == 'facebook':
        return f"https://www.facebook.com/sharer/sharer.php?u={urllib.parse.quote(url_annonce)}"
    elif plateforme == 'instagram':
        # Instagram ne permet pas le partage direct, on copie le lien
        return url_annonce
    else:
        return url_annonce

def afficher_boutons_partage(annonce_id: int, titre: str, prix: str):
    """Afficher les boutons de partage social avec tracking UTM"""
    col1, col2, col3 = st.columns(3)

    with col1:
        url_whatsapp = generer_url_partage(annonce_id, 'whatsapp', titre, prix)
        st.markdown(f"""
        <a href="{url_whatsapp}" target="_blank" style="text-decoration: none;">
            <div style="background: #25D366; color: white; padding: 10px; border-radius: 5px; text-align: center; margin: 5px 0;">
                📱 Partager sur WhatsApp
            </div>
        </a>
        """, unsafe_allow_html=True)

        if st.button("📊 Compter partage WA", key=f"count_wa_{annonce_id}", help="Cliquez après avoir partagé"):
            from models.database import Database
            db = Database()
            db.enregistrer_evenement(annonce_id, 'partage', 'whatsapp')
            st.success("✅ Partage WhatsApp comptabilisé")

    with col2:
        url_facebook = generer_url_partage(annonce_id, 'facebook', titre, prix)
        st.markdown(f"""
        <a href="{url_facebook}" target="_blank" style="text-decoration: none;">
            <div style="background: #1877F2; color: white; padding: 10px; border-radius: 5px; text-align: center; margin: 5px 0;">
                📘 Partager sur Facebook
            </div>
        </a>
        """, unsafe_allow_html=True)

        if st.button("📊 Compter partage FB", key=f"count_fb_{annonce_id}", help="Cliquez après avoir partagé"):
            from models.database import Database
            db = Database()
            db.enregistrer_evenement(annonce_id, 'partage', 'facebook')
            st.success("✅ Partage Facebook comptabilisé")

    with col3:
        url_instagram = generer_url_partage(annonce_id, 'instagram', titre, prix)
        if st.button("📷 Copier lien Instagram", key=f"ig_{annonce_id}", use_container_width=True):
            st.code(url_instagram, language=None)
            st.info("📋 Lien copié ! Collez-le dans votre story Instagram")
            from models.database import Database
            db = Database()
            db.enregistrer_evenement(annonce_id, 'partage', 'instagram')

    # Statistiques de partage
    st.markdown("---")
    from models.database import Database
    db = Database()
    conn = db.get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT source_utm, COUNT(*) as count
        FROM analytics
        WHERE annonce_id = ? AND type_evenement = 'partage'
        GROUP BY source_utm
    """, (annonce_id,))
    partages = cursor.fetchall()
    conn.close()

    if partages:
        st.write("**📊 Statistiques de partage :**")
        for source, count in partages:
            st.write(f"• {source.title()}: {count} partage{'s' if count > 1 else ''}")
    else:
        st.write("**📊 Aucun partage enregistré pour cette annonce**")

def afficher_bouton_contact(annonce: Dict[str, Any]):
    """Afficher le bouton de contact avec les options disponibles"""
    st.subheader("📞 Contacter le vendeur")
    
    col1, col2 = st.columns(2)
    
    with col1:
        if annonce.get('contact_whatsapp'):
            url_wa = f"https://wa.me/{annonce['contact_whatsapp'].replace('+', '').replace('-', '').replace(' ', '')}"
            if st.button("💬 WhatsApp", use_container_width=True):
                st.markdown(f'<a href="{url_wa}" target="_blank">Contacter via WhatsApp</a>', 
                           unsafe_allow_html=True)
                # Enregistrer l'événement de clic contact
                from models.database import Database
                db = Database()
                db.enregistrer_evenement(annonce['id'], 'clic_contact', 'whatsapp')
        
        if annonce.get('contact_telephone'):
            if st.button("📞 Téléphone", use_container_width=True):
                st.info(f"Téléphone: {annonce['contact_telephone']}")
                # Enregistrer l'événement de clic contact
                from models.database import Database
                db = Database()
                db.enregistrer_evenement(annonce['id'], 'clic_contact', 'telephone')
    
    with col2:
        if annonce.get('contact_email'):
            if st.button("✉️ Email", use_container_width=True):
                st.info(f"Email: {annonce['contact_email']}")
                # Enregistrer l'événement de clic contact
                from models.database import Database
                db = Database()
                db.enregistrer_evenement(annonce['id'], 'clic_contact', 'email')

def afficher_galerie_photos(photos: List[str], titre: str = "Photos"):
    """Afficher une galerie de photos, qu'elles soient locales ou distantes."""
    if not photos:
        st.info("Aucune photo disponible")
        return

    st.subheader(f"📸 {titre}")

    def _afficher_image(source: str):
        if not source:
            return False
        if source.startswith(("http://", "https://")):
            st.image(source, use_column_width=True)
            return True
        if os.path.exists(source):
            st.image(source, use_column_width=True)
            return True
        return False

    if not _afficher_image(photos[0]):
        st.warning("Impossible d'afficher la première photo.")

    if len(photos) > 1:
        colonnes = st.columns(min(4, len(photos) - 1))
        for index, photo in enumerate(photos[1:]):
            with colonnes[index % 4]:
                if not _afficher_image(photo):
                    st.caption("Photo indisponible")

def calculer_age_annonce(date_creation: datetime) -> str:
    """Calculer l'âge d'une annonce"""
    if not date_creation:
        return "Date inconnue"
    
    if isinstance(date_creation, str):
        date_creation = datetime.fromisoformat(date_creation.replace('Z', '+00:00'))
    
    return format_date(date_creation)

def generer_meta_description(annonce: Dict[str, Any]) -> str:
    """Générer une meta description pour le SEO"""
    categorie = annonce.get('categorie', '').title()
    type_annonce = annonce.get('type_annonce', '').title()
    ville = annonce.get('ville', '')
    prix = format_prix(annonce.get('prix', 0))
    
    return f"{type_annonce} {categorie} à {ville} - {prix}. {annonce.get('description', '')[:100]}..."

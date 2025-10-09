"""
Page de détail d'une annonce
Affichage complet avec galerie, informations, contact et partage
"""

from contextlib import contextmanager
from html import escape
from typing import Dict, List, Tuple
import json

import streamlit as st

from models.database import Database
from utils.helpers import (
    format_prix,
    format_date,
    afficher_boutons_partage,
    afficher_galerie_photos,
)


@contextmanager
def detail_card(title: str):
    """Context manager pour encapsuler du contenu dans une carte stylée."""
    st.markdown('<div class="detail-card">', unsafe_allow_html=True)
    st.markdown(
        f'<div class="detail-card__header">{escape(title)}</div>',
        unsafe_allow_html=True,
    )
    st.markdown('<div class="detail-card__content">', unsafe_allow_html=True)
    yield
    st.markdown('</div></div>', unsafe_allow_html=True)


def afficher_detail_annonce(annonce_id: int):
    """Afficher le détail complet d'une annonce."""
    db = Database()
    annonce = db.obtenir_annonce_par_id(annonce_id)

    if not annonce:
        st.error("🚫 Annonce non trouvée")
        return

    db.incrementer_vues(annonce_id)
    db.enregistrer_evenement(annonce_id, "vue")

    header_left, header_right = st.columns([3, 1], gap="large")

    with header_left:
        st.title(annonce["titre"])
        localisation = annonce.get("ville", "") or ""
        if annonce.get("quartier"):
            localisation += f", {annonce['quartier']}"
        st.markdown(f"**📍 {escape(localisation.strip(', '))}**")
        st.markdown(
            f"🏷️ {annonce['categorie'].title()} • {annonce['type_annonce'].title()}"
        )

    with header_right:
        st.markdown(
            f"""
            <div class="price-chip">
                <span>{format_prix(annonce['prix'])}</span>
            </div>
            """,
            unsafe_allow_html=True,
        )

    stats_cols = st.columns(4)
    stats_cols[0].metric("👁️ Vues", annonce.get("vues", 0))
    stats_cols[1].metric("🤝 Contacts", annonce.get("clics_contact", 0))
    stats_cols[2].metric("📤 Partages", annonce.get("partages", 0))
    stats_cols[3].metric("🗓️ Publiée", format_date(annonce["date_creation"]))

    photos = annonce.get("photos")
    if photos:
        photos = json.loads(photos) if isinstance(photos, str) else photos
        afficher_galerie_photos(photos)

    contenu_col, contact_col = st.columns([3, 1], gap="large")

    with contenu_col:
        description_html = (
            escape(annonce.get("description", "")).replace("\n", "<br>")
            if annonce.get("description")
            else "<em>Aucune description fournie.</em>"
        )
        with detail_card("Description"):
            st.markdown(
                f'<p class="detail-description">{description_html}</p>',
                unsafe_allow_html=True,
            )

        donnees_spec = annonce.get("donnees_specifiques")
        if donnees_spec:
            donnees_spec = (
                json.loads(donnees_spec)
                if isinstance(donnees_spec, str)
                else donnees_spec
            )
            details_html = construire_sections_details(
                annonce["categorie"], donnees_spec
            )
        else:
            details_html = "<em>Aucune information détaillée disponible.</em>"

        with detail_card("Informations détaillées"):
            st.markdown(details_html, unsafe_allow_html=True)

        with detail_card("Partager cette annonce"):
            afficher_boutons_partage(
                annonce["id"],
                annonce["titre"],
                format_prix(annonce["prix"]),
            )

        if st.button("⬅️ Retour aux annonces", use_container_width=True):
            st.session_state.page = "accueil"
            st.session_state.pop("annonce_selectionnee", None)
            st.rerun()

    with contact_col:
        afficher_carte_contact(annonce)


def construire_sections_details(categorie: str, donnees: Dict) -> str:
    """Assembler le HTML des sections détaillées selon la catégorie."""
    builders = {
        "immobilier": construire_details_immobilier,
        "vehicules": construire_details_vehicule,
        "informatique": construire_details_informatique,
    }
    builder = builders.get(categorie)
    if not builder:
        return "<em>Détails spécifiques non disponibles.</em>"

    sections = builder(donnees or {})
    return "".join(sections) if sections else "<em>Détails à venir.</em>"


def construire_details_immobilier(donnees: Dict) -> List[str]:
    rows_infos = [
        ("Type de bien", donnees.get("type_bien")),
        (
            "Surface",
            f"{donnees['surface']} m²"
            if donnees.get("surface")
            else None,
        ),
        (
            "Chambres",
            str(donnees.get("nombre_chambres"))
            if donnees.get("nombre_chambres")
            else None,
        ),
        (
            "Salles de bain",
            str(donnees.get("nombre_salles_bain"))
            if donnees.get("nombre_salles_bain")
            else None,
        ),
        (
            "Nombre de pièces",
            str(donnees.get("nombre_pieces"))
            if donnees.get("nombre_pieces")
            else None,
        ),
        (
            "Étage",
            str(donnees.get("etage"))
            if donnees.get("etage") is not None
            else None,
        ),
    ]

    equipements_map = [
        ("ascenseur", "Ascenseur"),
        ("parking", "Parking"),
        ("jardin", "Jardin"),
        ("piscine", "Piscine"),
        ("climatisation", "Climatisation"),
        ("meuble", "Meublé"),
    ]
    equipements = [
        label for key, label in equipements_map if donnees.get(key)
    ]

    finance_rows = []
    if donnees.get("caution"):
        finance_rows.append(("Caution", format_prix(donnees["caution"])))
    if donnees.get("frais_agence"):
        finance_rows.append(
            ("Frais d'agence", format_prix(donnees["frais_agence"]))
        )
    if donnees.get("charges_incluses"):
        finance_rows.append(("Charges", "Charges incluses"))

    sections = []
    infos_html = creer_section("Caractéristiques du bien", rows_infos)
    if infos_html:
        sections.append(infos_html)

    equipements_html = creer_section("Équipements", tags=equipements)
    if equipements_html:
        sections.append(equipements_html)

    finance_html = creer_section("Conditions financières", finance_rows)
    if finance_html:
        sections.append(finance_html)

    return sections


def construire_details_vehicule(donnees: Dict) -> List[str]:
    tech_rows = [
        ("Marque", donnees.get("marque")),
        ("Modèle", donnees.get("modele")),
        ("Année", str(donnees.get("annee")) if donnees.get("annee") else None),
        (
            "Kilométrage",
            f"{donnees['kilometrage']:,} km".replace(",", " ")
            if donnees.get("kilometrage")
            else None,
        ),
        (
            "Carburant",
            donnees.get("carburant", "").title()
            if donnees.get("carburant")
            else None,
        ),
        (
            "Transmission",
            donnees.get("transmission", "").title()
            if donnees.get("transmission")
            else None,
        ),
        ("Couleur", donnees.get("couleur")),
    ]

    details_rows = [
        (
            "Portes",
            str(donnees.get("nombre_portes"))
            if donnees.get("nombre_portes")
            else None,
        ),
        (
            "Places",
            str(donnees.get("nombre_places"))
            if donnees.get("nombre_places")
            else None,
        ),
        (
            "Puissance",
            f"{donnees['puissance']} ch" if donnees.get("puissance") else None,
        ),
        (
            "Cylindrée",
            f"{donnees['cylindree']} L" if donnees.get("cylindree") else None,
        ),
        (
            "État",
            donnees.get("etat", "").replace("_", " ").title()
            if donnees.get("etat")
            else None,
        ),
    ]

    documents = []
    if donnees.get("premiere_main"):
        documents.append("Première main")
    if donnees.get("carnet_entretien"):
        documents.append("Carnet d'entretien")
    if donnees.get("controle_technique"):
        documents.append("Contrôle technique à jour")
    if donnees.get("assurance_valide"):
        documents.append("Assurance valide")
    if donnees.get("papiers_en_regle"):
        documents.append("Papiers en règle")
    if donnees.get("accidents"):
        documents.append("Historique accident déclaré")

    sections = []
    tech_html = creer_section("Caractéristiques techniques", tech_rows)
    if tech_html:
        sections.append(tech_html)

    details_html = creer_section("Détails supplémentaires", details_rows)
    if details_html:
        sections.append(details_html)

    docs_html = creer_section("Documents et statut", tags=documents)
    if docs_html:
        sections.append(docs_html)

    return sections


def construire_details_informatique(donnees: Dict) -> List[str]:
    specs_rows = [
        (
            "Type de matériel",
            donnees.get("type_materiel", "").replace("_", " ").title()
            if donnees.get("type_materiel")
            else None,
        ),
        ("Marque", donnees.get("marque")),
        ("Modèle", donnees.get("modele")),
        ("Processeur", donnees.get("processeur")),
        (
            "Mémoire RAM",
            f"{donnees['memoire_ram']} Go"
            if donnees.get("memoire_ram")
            else None,
        ),
        (
            "Stockage",
            f"{donnees['stockage']} Go {donnees.get('type_stockage', '').upper()}"
            if donnees.get("stockage")
            else None,
        ),
        ("Carte graphique", donnees.get("carte_graphique")),
    ]

    display_rows = [
        (
            "Taille d'écran",
            f"{donnees['taille_ecran']}\""
            if donnees.get("taille_ecran")
            else None,
        ),
        ("Résolution", donnees.get("resolution_ecran")),
        ("Système", donnees.get("systeme_exploitation")),
        (
            "État",
            donnees.get("etat", "").replace("_", " ").title()
            if donnees.get("etat")
            else None,
        ),
    ]

    garanties_tags = []
    if donnees.get("garantie"):
        duree = donnees.get("duree_garantie")
        if isinstance(duree, int):
            garanties_tags.append(f"Garantie {duree} mois")
        else:
            garanties_tags.append("Garantie en cours")
    if donnees.get("boite_origine"):
        garanties_tags.append("Boîte d'origine")
    if donnees.get("facture_disponible"):
        garanties_tags.append("Facture disponible")

    accessoires = donnees.get("accessoires_inclus") or []

    sections = []
    specs_html = creer_section("Spécifications principales", specs_rows)
    if specs_html:
        sections.append(specs_html)

    display_html = creer_section("Affichage & système", display_rows)
    if display_html:
        sections.append(display_html)

    garanties_html = creer_section("Garantie & documents", tags=garanties_tags)
    if garanties_html:
        sections.append(garanties_html)

    if accessoires:
        accessoires_html = (
            "<div class=\"detail-section\"><h4>Accessoires inclus</h4>"
            "<ul class=\"detail-list\">"
            + "".join(
                f"<li>{escape(accessoire)}</li>" for accessoire in accessoires
            )
            + "</ul></div>"
        )
        sections.append(accessoires_html)

    return sections


def creer_section(
    titre: str,
    rows: List[Tuple[str, str]] = None,
    tags: List[str] = None,
) -> str:
    rows = rows or []
    tags = tags or []

    rows_html = "".join(
        f"<div class=\"detail-row\"><span>{escape(label)}</span>"
        f"<span>{escape(value)}</span></div>"
        for label, value in rows
        if value
    )

    tags_html = ""
    if tags:
        tags_html = (
            '<div class="detail-tags">'
            + "".join(
                f'<span class="detail-tag">{escape(tag)}</span>'
                for tag in tags
            )
            + "</div>"
        )

    if not rows_html and not tags_html:
        return ""

    return (
        f'<div class="detail-section"><h4>{escape(titre)}</h4>'
        f"{rows_html}{tags_html}</div>"
    )


def afficher_carte_contact(annonce: Dict):
    """Afficher la carte de contact sticky."""
    st.markdown('<div class="contact-card">', unsafe_allow_html=True)
    st.markdown(
        '<div class="contact-card__title">Contacter le vendeur</div>',
        unsafe_allow_html=True,
    )

    contact_nom = annonce.get("contact_nom") or "Vendeur"
    st.markdown(
        f'<div class="contact-card__name">{escape(contact_nom)}</div>',
        unsafe_allow_html=True,
    )

    infos_secondaires = []
    if annonce.get("contact_email"):
        infos_secondaires.append(("Email", annonce["contact_email"]))
    if annonce.get("contact_telephone"):
        infos_secondaires.append(("Téléphone", annonce["contact_telephone"]))

    if infos_secondaires:
        st.markdown('<div class="contact-card__infos">', unsafe_allow_html=True)
        for label, value in infos_secondaires:
            st.markdown(
                f'<div class="contact-card__info"><span>{escape(label)}</span>'
                f'<span>{escape(value)}</span></div>',
                unsafe_allow_html=True,
            )
        st.markdown("</div>", unsafe_allow_html=True)

    if annonce.get("contact_whatsapp"):
        bouton_whatsapp(annonce)

    if annonce.get("contact_telephone"):
        bouton_telephone(annonce)

    if annonce.get("contact_email"):
        bouton_email(annonce)

    st.markdown("</div>", unsafe_allow_html=True)


def bouton_whatsapp(annonce: Dict):
    whatsapp_key = f"contact_whatsapp_{annonce['id']}"
    feedback_key = f"{whatsapp_key}_feedback"
    with st.container():
        if st.button("Discuter sur WhatsApp", key=whatsapp_key, use_container_width=True):
            url_wa = (
                f"https://wa.me/{annonce['contact_whatsapp'].replace('+', '').replace('-', '').replace(' ', '')}"
            )
            _log_contact_event(annonce["id"], "whatsapp")
            st.session_state[feedback_key] = url_wa
    if st.session_state.get(feedback_key):
        st.markdown(
            f'<div class="contact-card__feedback"><a href="{st.session_state[feedback_key]}" target="_blank">Ouvrir la conversation</a></div>',
            unsafe_allow_html=True,
        )


def bouton_telephone(annonce: Dict):
    phone_key = f"contact_phone_{annonce['id']}"
    feedback_key = f"{phone_key}_feedback"
    with st.container():
        if st.button("Appeler", key=phone_key, use_container_width=True):
            _log_contact_event(annonce["id"], "telephone")
            st.session_state[feedback_key] = annonce["contact_telephone"]
    if st.session_state.get(feedback_key):
        st.info(f"📞 {st.session_state[feedback_key]}")


def bouton_email(annonce: Dict):
    mail_key = f"contact_email_{annonce['id']}"
    feedback_key = f"{mail_key}_feedback"
    with st.container():
        if st.button("Envoyer un email", key=mail_key, use_container_width=True):
            _log_contact_event(annonce["id"], "email")
            st.session_state[feedback_key] = annonce["contact_email"]
    if st.session_state.get(feedback_key):
        st.info(f"✉️ {st.session_state[feedback_key]}")


def _log_contact_event(annonce_id: int, canal: str):
    db = Database()
    db.enregistrer_evenement(annonce_id, "clic_contact", canal)


def main():
    annonce_id = st.session_state.get("annonce_selectionnee")

    if not annonce_id:
        st.error("🚫 Aucune annonce sélectionnée")
        if st.button("⬅️ Retour à l'accueil"):
            st.session_state.page = "accueil"
            st.rerun()
        return

    afficher_detail_annonce(annonce_id)


if __name__ == "__main__":
    main()

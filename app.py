"""
Application principale - Site de petites annonces Gabon
Immobilier, Véhicules, Matériel Informatique
"""

import streamlit as st
from html import escape
from models.database import Database
from models.annonce_models import VILLES_GABON
from utils.helpers import (
    format_prix,
    format_date,
    afficher_boutons_partage,
    afficher_galerie_photos,
    get_site_settings,
)
from utils.user_accounts import register_user, authenticate_user
from utils.auth import auth_manager

CATEGORIES_OPTIONS = [
    ("toutes", "Toutes catégories"),
    ("immobilier", "Immobilier"),
    ("vehicules", "Véhicules"),
    ("informatique", "Informatique"),
]

TYPE_OPTIONS = [
    ("tous", "Vente & location"),
    ("vente", "Vente"),
    ("location", "Location"),
]

CATEGORY_LABELS = dict(CATEGORIES_OPTIONS)
TYPE_LABELS = dict(TYPE_OPTIONS)

CONNEXION_PAGE = "connexion"
ACCUEIL_PAGE = "accueil"


def initialiser_session():
    """Définir les valeurs par défaut de session et synchroniser l'état d'authentification."""
    defaults = {
        "page": CONNEXION_PAGE,
        "role": None,
        "user_public": None,
    }
    for cle, valeur in defaults.items():
        if cle not in st.session_state:
            st.session_state[cle] = valeur

    # Synchroniser avec l'état de streamlit-authenticator
    if auth_manager.is_authenticated():
        role_admin = auth_manager.get_user_role()
        if role_admin and st.session_state.get("role") not in ("admin", "analyst"):
            st.session_state["role"] = role_admin
            st.session_state["page"] = ACCUEIL_PAGE
            st.session_state["user_public"] = None
    else:
        if st.session_state.get("role") in ("admin", "analyst"):
            st.session_state["role"] = None
            st.session_state["page"] = CONNEXION_PAGE


def reset_session():
    """Réinitialiser les informations de navigation et d'authentification."""
    keys_to_clear = [
        "role",
        "user_public",
        "search_inputs",
        "annonce_selectionnee",
        "page_numero",
    ]
    for key in keys_to_clear:
        st.session_state.pop(key, None)

    st.session_state["role"] = None
    st.session_state["user_public"] = None
    st.session_state["page"] = CONNEXION_PAGE

    try:
        auth_manager.logout()
    except Exception:
        pass


def afficher_sidebar():
    """Afficher le panneau latéral selon le rôle courant."""
    role = st.session_state.get("role")

    st.sidebar.markdown("### Navigation")

    if role in ("admin", "analyst"):
        if not auth_manager.is_authenticated():
            reset_session()
            st.rerun()

        user = auth_manager.get_current_user()
        if user:
            st.sidebar.success(f"👤 Connecté : {user['name']}")
            st.sidebar.info(f"🎭 Rôle : {user['role'].title()}")

        if role == "admin":
            if st.sidebar.button("Gestion des annonces"):
                st.session_state.page = "admin"
                st.rerun()

        if role in ("admin", "analyst"):
            if st.sidebar.button("Analytics"):
                st.session_state.page = "analytics"
                st.rerun()

        if st.sidebar.button("Se déconnecter"):
            reset_session()
            st.rerun()

    elif role == "user":
        user = st.session_state.get("user_public") or {}
        st.sidebar.success(f"👤 Connecté : {user.get('nom', 'Utilisateur')}")
        st.sidebar.info("🎭 Rôle : Utilisateur")
        if st.sidebar.button("Se déconnecter"):
            reset_session()
            st.rerun()

    elif role == "guest":
        st.sidebar.info("Navigation en tant qu'invité")
        if st.sidebar.button("Changer de mode"):
            reset_session()
            st.rerun()

    else:
        st.sidebar.info("Choisissez un mode pour accéder au site.")

    st.sidebar.markdown("---")
    st.sidebar.markdown("### Pages légales")
    if st.sidebar.button("Mentions légales"):
        st.session_state.page = "mentions_legales"
        st.rerun()
    if st.sidebar.button("Politique de confidentialité"):
        st.session_state.page = "politique_confidentialite"
        st.rerun()


def afficher_page_connexion():
    """Portail de connexion / inscription / invité."""
    st.markdown(
        """
        <div class="login-hero">
            <h1>AUTO-IMMO</h1>
            <p>Choisissez comment accéder à la plateforme.</p>
        </div>
        """,
        unsafe_allow_html=True,
    )

    col_login, col_signup, col_guest = st.columns((3, 3, 2))

    with col_login:
        st.markdown('<div class="auth-card">', unsafe_allow_html=True)
        st.markdown("#### Se connecter", unsafe_allow_html=True)
        profil = st.radio(
            "Je suis :",
            ["Utilisateur", "Admin / Analyste"],
            horizontal=True,
            key="login_profile",
        )

        if profil == "Utilisateur":
            with st.form("login_user_form"):
                email = st.text_input("Email", key="login_email")
                mot_de_passe = st.text_input(
                    "Mot de passe", type="password", key="login_password"
                )
                submit_login = st.form_submit_button("Se connecter")

            if submit_login:
                ok, utilisateur, message = authenticate_user(email, mot_de_passe)
                if ok:
                    st.success(message)
                    st.session_state["role"] = "user"
                    st.session_state["user_public"] = utilisateur
                    st.session_state["page"] = ACCUEIL_PAGE
                    st.rerun()
                else:
                    st.error(message)
        else:
            st.info("Administrateur ou analyste : utilisez vos identifiants dédiés.")
            name, status, username = auth_manager.login_form()
            if status:
                st.success("Connexion réussie.")
                st.session_state["role"] = auth_manager.get_user_role() or "admin"
                st.session_state["user_public"] = None
                st.session_state["page"] = ACCUEIL_PAGE
                st.rerun()
            elif status is False:
                st.error("Identifiants incorrects.")

        st.markdown("</div>", unsafe_allow_html=True)

    with col_signup:
        st.markdown('<div class="auth-card">', unsafe_allow_html=True)
        st.markdown("#### Créer un compte utilisateur", unsafe_allow_html=True)
        with st.form("signup_form"):
            nom = st.text_input("Nom complet")
            email = st.text_input("Email")
            mot_de_passe = st.text_input("Mot de passe", type="password")
            confirmation = st.text_input("Confirmer le mot de passe", type="password")
            submit_signup = st.form_submit_button("Créer mon compte")

        if submit_signup:
            if mot_de_passe != confirmation:
                st.error("Les mots de passe ne correspondent pas.")
            else:
                ok, message = register_user(nom, email, mot_de_passe)
                if ok:
                    st.success(message)
                    ok_auth, utilisateur, _ = authenticate_user(email, mot_de_passe)
                    if ok_auth:
                        st.session_state["role"] = "user"
                        st.session_state["user_public"] = utilisateur
                        st.session_state["page"] = ACCUEIL_PAGE
                        st.rerun()
                else:
                    st.error(message)

        st.markdown("</div>", unsafe_allow_html=True)

    with col_guest:
        st.markdown('<div class="auth-card auth-card--guest">', unsafe_allow_html=True)
        st.markdown("#### Visiter en invité", unsafe_allow_html=True)
        st.write(
            "Parcourez les annonces librement sans créer de compte. "
            "Vous pourrez toujours vous inscrire plus tard."
        )
        if st.button("Continuer en invité", use_container_width=True):
            st.session_state["role"] = "guest"
            st.session_state["user_public"] = None
            st.session_state["page"] = ACCUEIL_PAGE
            st.rerun()
        st.markdown("</div>", unsafe_allow_html=True)

# Configuration de la page
st.set_page_config(
    page_title="Immo Gabon - Petites Annonces",
    page_icon="🏠",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Charger le CSS personnalisé
def load_css():
    """Charger les styles CSS personnalisés"""
    try:
        with open('assets/style.css', 'r', encoding='utf-8') as f:
            css = f.read()
        st.markdown(f'<style>{css}</style>', unsafe_allow_html=True)
    except FileNotFoundError:
        # CSS de base si le fichier n'est pas trouvé
        st.markdown("""
        <style>
            .main-header {
                background: linear-gradient(90deg, #FF6B35 0%, #F7931E 100%);
                padding: 2rem;
                border-radius: 10px;
                margin-bottom: 2rem;
                text-align: center;
                color: white;
            }
            .category-card {
                background: white;
                padding: 1.5rem;
                border-radius: 10px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                text-align: center;
                transition: transform 0.3s ease;
                border: 2px solid transparent;
            }
            .category-card:hover {
                transform: translateY(-5px);
                border-color: #FF6B35;
            }
            .annonce-card {
                background: white;
                padding: 1rem;
                border-radius: 8px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                margin-bottom: 1rem;
                border-left: 4px solid #FF6B35;
            }
            .prix-highlight {
                color: #FF6B35;
                font-weight: bold;
                font-size: 1.2em;
            }
            .stats-card {
                background: #f8f9fa;
                padding: 1rem;
                border-radius: 8px;
                text-align: center;
                border: 1px solid #e9ecef;
            }
        </style>
        """, unsafe_allow_html=True)

# Charger les styles
load_css()

def init_database():
    """Initialiser la base de données"""
    db = Database()
    return db

def afficher_hero():
    """Afficher le bandeau principal avec le formulaire de recherche."""
    settings = get_site_settings()
    company_name = settings.get("company_name", "AUTO-IMMO")
    logo_path = settings.get("logo_path")

    initials = "".join(part[0] for part in company_name.split() if part).upper()
    if not initials:
        initials = "AI"
    initials = initials[:3]

    if logo_path:
        logo_html = f'<img src="{escape(logo_path)}" alt="{escape(company_name)}" class="hero__logo" />'
    else:
        logo_html = f'<div class="hero__logo hero__logo--placeholder">{escape(initials)}</div>'

    defaults = st.session_state.setdefault(
        "search_inputs",
        {
            "categorie": "toutes",
            "type_annonce": "tous",
            "ville": "",
            "prix_min": 0,
            "prix_max": 0,
        },
    )

    st.markdown(
        f"""
        <section class="hero">
            <div class="hero__content">
                <div class="hero__brand">
                    {logo_html}
                    <div class="hero__brand-name">{escape(company_name)}</div>
                </div>
                <div class="hero__title">{escape(company_name)} – trouvez le bien qui vous ressemble</div>
                <div class="hero__subtitle">
                    Immobilier, véhicules et matériel informatique sélectionnés par l'équipe {escape(company_name)}.
                </div>
                <div class="hero__badges">
                    <span class="hero__badge">Nouveautés quotidiennes</span>
                    <span class="hero__badge">Visibilité nationale</span>
                    <span class="hero__badge">Contact direct vendeur</span>
                </div>
            </div>
            <div class="search-panel">
                <h3>Recherchez un bien sur {escape(company_name)}</h3>
        """,
        unsafe_allow_html=True,
    )

    with st.form("search_form"):
        col1, col2, col3 = st.columns((2, 1, 1))

        categorie_values = [value for value, _ in CATEGORIES_OPTIONS]
        categorie_index = categorie_values.index(defaults["categorie"])
        categorie = col1.selectbox(
            "Catégorie",
            options=categorie_values,
            index=categorie_index,
            format_func=lambda key: CATEGORY_LABELS[key],
        )

        type_values = [value for value, _ in TYPE_OPTIONS]
        type_index = type_values.index(defaults["type_annonce"])
        type_annonce = col2.selectbox(
            "Type d'annonce",
            options=type_values,
            index=type_index,
            format_func=lambda key: TYPE_LABELS[key],
        )

        villes_options = [""] + VILLES_GABON
        try:
            ville_index = villes_options.index(defaults["ville"])
        except ValueError:
            ville_index = 0
        ville = col3.selectbox("Ville", options=villes_options, index=ville_index)

        prix_col_1, prix_col_2 = st.columns(2)
        prix_min = prix_col_1.number_input(
            "Budget min (FCFA)",
            min_value=0,
            step=100_000,
            value=int(defaults["prix_min"]),
        )
        prix_max = prix_col_2.number_input(
            "Budget max (FCFA)",
            min_value=0,
            step=100_000,
            value=int(defaults["prix_max"]),
        )

        submit = st.form_submit_button("Rechercher")

    st.markdown("</div></section>", unsafe_allow_html=True)

    if submit:
        st.session_state.search_inputs = {
            "categorie": categorie,
            "type_annonce": type_annonce,
            "ville": ville,
            "prix_min": prix_min,
            "prix_max": prix_max,
        }
        st.session_state.page_numero = 1

    actifs = st.session_state.get("search_inputs", defaults)

    filtres = {}
    if actifs["categorie"] != "toutes":
        filtres["categorie"] = actifs["categorie"]
    if actifs["type_annonce"] != "tous":
        filtres["type_annonce"] = actifs["type_annonce"]
    if actifs["ville"]:
        filtres["ville"] = actifs["ville"]
    if actifs["prix_min"] > 0:
        filtres["prix_min"] = actifs["prix_min"]
    if actifs["prix_max"] > 0 and actifs["prix_max"] >= actifs["prix_min"]:
        filtres["prix_max"] = actifs["prix_max"]

    return filtres, actifs

def afficher_categories():
    """Afficher les catégories principales."""
    st.markdown("### Explorez nos univers")

    db = Database()
    stats = {
        "immobilier": len(db.obtenir_annonces({"categorie": "immobilier", "statut": "publie"})),
        "vehicules": len(db.obtenir_annonces({"categorie": "vehicules", "statut": "publie"})),
        "informatique": len(db.obtenir_annonces({"categorie": "informatique", "statut": "publie"})),
    }

    categories = [
        {
            "key": "immobilier",
            "title": "Immobilier",
            "description": "Maisons, appartements et terrains sélectionnés sur tout le territoire.",
            "count": stats["immobilier"],
            "tag": "Mandats premium",
            "tag_class": "performance-high",
            "cta": "Voir l'immobilier",
        },
        {
            "key": "vehicules",
            "title": "Véhicules",
            "description": "Voitures, utilitaires et deux-roues prêts à prendre la route gabonaise.",
            "count": stats["vehicules"],
            "tag": "Révisés",
            "tag_class": "performance-high",
            "cta": "Voir les véhicules",
        },
        {
            "key": "informatique",
            "title": "Informatique",
            "description": "Ordinateurs, smartphones et accessoires high-tech récents.",
            "count": stats["informatique"],
            "tag": "Bon plan",
            "tag_class": "performance-medium",
            "cta": "Voir l'informatique",
        },
    ]

    colonnes = st.columns(len(categories))
    for colonne, data in zip(colonnes, categories):
        with colonne:
            st.markdown(
                f"""
                <div class="category-card">
                    <div class="category-card__label">{data['title']}</div>
                    <div class="category-card__description">{data['description']}</div>
                    <div class="category-card__stats">
                        <span>{data['count']} annonces actives</span>
                        <span class="performance-indicator {data['tag_class']}">{data['tag']}</span>
                    </div>
                </div>
                """,
                unsafe_allow_html=True,
            )

            if st.button(data["cta"], key=f"cat_{data['key']}", use_container_width=True):
                st.session_state.filtre_categorie = data["key"]
                st.session_state.page_numero = 1
                st.rerun()

def afficher_annonce_card(annonce):
    """Afficher une carte d'annonce avec un design inspiré de SeLoger."""
    photos = annonce.get('photos') or []
    vignette = photos[0] if photos else ""

    if vignette:
        safe_url = escape(vignette)
        media_html = f'<div class="annonce-card__media" style="background-image: url(\'{safe_url}\');"></div>'
    else:
        media_html = '<div class="annonce-card__media annonce-card__media--empty">Visuel à venir</div>'

    localisation = annonce.get('ville', '') or ''
    if annonce.get('quartier'):
        localisation += f", {annonce['quartier']}"

    categorie = annonce.get('categorie', '').title()
    type_annonce = annonce.get('type_annonce', '').title()
    meta = f"{categorie} · {type_annonce}" if categorie or type_annonce else ""
    if annonce.get('surface'):
        meta += f" · {annonce['surface']} m²"

    date_reference = annonce.get('date_modification') or annonce.get('date_creation')
    badge_label = f"Mise à jour {format_date(date_reference)}" if date_reference else "Annonce vérifiée"

    description = (annonce.get('description') or '').strip()
    if len(description) > 220:
        description = description[:217].rstrip() + "…"

    html = f"""
    <div class="annonce-card">
        {media_html}
        <div class="annonce-card__body">
            <div class="annonce-card__heading">
                <h4 class="annonce-card__title">{escape(annonce['titre'])}</h4>
                <span class="annonce-card__price">{escape(format_prix(annonce['prix']))}</span>
            </div>
            <div class="annonce-card__meta">
                <span>{escape(localisation)}</span>
                <span>{escape(meta)}</span>
            </div>
            <p class="annonce-card__description">{escape(description)}</p>
            <div class="annonce-card__footer">
                <div class="annonce-card__stats">
                    <span><strong>{annonce.get('vues', 0)}</strong> vues</span>
                    <span><strong>{annonce.get('partages', 0)}</strong> partages</span>
                </div>
                <span class="performance-indicator performance-high">{escape(badge_label)}</span>
            </div>
        </div>
    </div>
    """

    st.markdown(html, unsafe_allow_html=True)

    actions_col1, actions_col2 = st.columns([1, 1])
    with actions_col1:
        if st.button("Voir la fiche", key=f"voir_{annonce['id']}", use_container_width=True):
            st.session_state.annonce_selectionnee = annonce['id']
            st.session_state.page = 'detail_annonce'
            st.rerun()

    with actions_col2:
        contact_nom = annonce.get('contact_nom', '')
        if contact_nom:
            st.caption(f"Contact : {escape(contact_nom)}")
        else:
            st.caption("Contact disponible dans la fiche")
def afficher_liste_annonces(filtres, criteres):
    """Afficher la liste des annonces avec pagination."""
    db = Database()

    page_actuelle = st.session_state.get('page_numero', 1)
    annonces_par_page = 9
    offset = (page_actuelle - 1) * annonces_par_page

    annonces = db.obtenir_annonces(filtres, limit=annonces_par_page, offset=offset)

    if not annonces:
        st.info("Aucune annonce ne correspond à votre recherche pour le moment.")
        return

    chips = []
    if criteres.get('categorie') and criteres['categorie'] != 'toutes':
        chips.append(CATEGORY_LABELS[criteres['categorie']])
    if criteres.get('type_annonce') and criteres['type_annonce'] != 'tous':
        chips.append(TYPE_LABELS[criteres['type_annonce']])
    if criteres.get('ville'):
        chips.append(criteres['ville'])
    if criteres.get('prix_min') or criteres.get('prix_max'):
        min_label = f"{int(criteres.get('prix_min', 0)):,}".replace(',', ' ')
        max_label = f"{int(criteres.get('prix_max', 0)):,}".replace(',', ' ')
        if criteres.get('prix_min') and criteres.get('prix_max'):
            chips.append(f"Budget {min_label} - {max_label} FCFA")
        elif criteres.get('prix_min'):
            chips.append(f"Budget ≥ {min_label} FCFA")
        elif criteres.get('prix_max'):
            chips.append(f"Budget ≤ {max_label} FCFA")

    chips_html = "".join(f'<span class="results-header__chip">{escape(c)}</span>' for c in chips)

    st.markdown(
        f"""
        <div class="results-header">
            <div class="results-header__count">{len(annonces)} annonce(s) sélectionnée(s)</div>
            <div class="results-header__filters">{chips_html}</div>
        </div>
        """,
        unsafe_allow_html=True,
    )

    for annonce in annonces:
        afficher_annonce_card(annonce)

    pagination = st.container()
    with pagination:
        st.markdown('<div class="pagination-bar">', unsafe_allow_html=True)
        prev_col, label_col, next_col = st.columns([1, 1, 1])

        with prev_col:
            if page_actuelle > 1 and st.button("← Précédent", key=f"prev_{page_actuelle}"):
                st.session_state.page_numero = page_actuelle - 1
                st.rerun()

        with label_col:
            st.markdown(f'<div class="pagination-bar__label">Page {page_actuelle}</div>', unsafe_allow_html=True)

        with next_col:
            if len(annonces) == annonces_par_page and st.button("Suivant →", key=f"next_{page_actuelle}"):
                st.session_state.page_numero = page_actuelle + 1
                st.rerun()

        st.markdown('</div>', unsafe_allow_html=True)
def afficher_statistiques_globales():
    """Afficher les statistiques globales du site."""
    db = Database()

    total_immobilier = len(db.obtenir_annonces({"categorie": "immobilier", "statut": "publie"}))
    total_vehicules = len(db.obtenir_annonces({"categorie": "vehicules", "statut": "publie"}))
    total_informatique = len(db.obtenir_annonces({"categorie": "informatique", "statut": "publie"}))
    total_annonces = total_immobilier + total_vehicules + total_informatique

    st.markdown("### Les chiffres clés")

    st.markdown(
        f"""
        <div class="stats-grid">
            <div class="stats-card">
                <h3>{total_annonces}</h3>
                <p>Annonces actives</p>
            </div>
            <div class="stats-card">
                <h3>{total_immobilier}</h3>
                <p>Biens immobiliers</p>
            </div>
            <div class="stats-card">
                <h3>{total_vehicules}</h3>
                <p>Véhicules</p>
            </div>
            <div class="stats-card">
                <h3>{total_informatique}</h3>
                <p>Matériel informatique</p>
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )
def main():
    """Fonction principale"""
    init_database()
    initialiser_session()

    if st.session_state.get("page") == CONNEXION_PAGE or st.session_state.get("role") is None:
        afficher_page_connexion()
        return

    afficher_sidebar()

    page = st.session_state.get("page", ACCUEIL_PAGE)

    if page == ACCUEIL_PAGE:
        filtres, criteres = afficher_hero()

        afficher_categories()
        st.markdown("---")

        if st.session_state.get("filtre_categorie"):
            categorie = st.session_state.pop("filtre_categorie")
            filtres["categorie"] = categorie
            criteres["categorie"] = categorie

            search_inputs = st.session_state.get("search_inputs", {})
            search_inputs["categorie"] = categorie
            st.session_state.search_inputs = search_inputs
            st.session_state.page_numero = 1

        afficher_liste_annonces(filtres, criteres)
        st.markdown("---")
        afficher_statistiques_globales()

    elif page == "detail_annonce":
        from pages.detail_annonce import afficher_detail_annonce

        annonce_id = st.session_state.get("annonce_selectionnee")
        if annonce_id:
            afficher_detail_annonce(annonce_id)
        else:
            st.error("Aucune annonce sélectionnée")
            if st.button("Retour à l'accueil"):
                st.session_state.page = ACCUEIL_PAGE
                st.rerun()

    elif page == "admin":
        if st.session_state.get("role") != "admin":
            st.error("Accès réservé à l'administrateur.")
            st.session_state.page = ACCUEIL_PAGE
            st.rerun()
        from pages.admin import main as admin_main

        admin_main()

    elif page == "analytics":
        if st.session_state.get("role") not in ("admin", "analyst"):
            st.error("Accès réservé à l'administrateur ou à l'analyste.")
            st.session_state.page = ACCUEIL_PAGE
            st.rerun()
        from pages.analytics import main as analytics_main

        analytics_main()

    elif page == "mentions_legales":
        from pages.mentions_legales import main as mentions_main

        mentions_main()

    elif page == "politique_confidentialite":
        from pages.politique_confidentialite import main as politique_main

        politique_main()


if __name__ == "__main__":
    main()



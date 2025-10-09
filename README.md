# 🏠 Immo Gabon - Site de Petites Annonces

Site de petites annonces multi-catégories pour le Gabon, développé avec Streamlit et hébergé sur Streamlit Community Cloud.

## 🎯 Fonctionnalités

### 📋 Catalogue Public
- **3 catégories principales** : Immobilier, Véhicules, Matériel Informatique
- **Filtres avancés** : Prix, localisation, catégorie, type d'annonce
- **Recherche responsive** : Optimisé mobile-first
- **Fiches détaillées** : Photos, descriptions complètes, informations spécifiques

### 🔧 Administration
- **Interface admin** : Création, édition, suppression d'annonces
- **Gestion des médias** : Upload et optimisation automatique des photos
- **Statuts d'annonces** : Brouillon, publié, expiré, archivé
- **Authentification sécurisée** : Rôles admin et analyste

### 📊 Analytics & Reporting
- **Tracking complet** : Vues, clics contact, partages sociaux
- **Sources UTM** : Suivi des canaux de trafic
- **Export CSV** : Données pour facturation
- **Tableau de bord** : Métriques en temps réel

### 📱 Partage Social
- **WhatsApp** : Partage direct avec deep-link
- **Facebook** : Intégration Facebook Sharer
- **Instagram** : Copie de lien pour stories
- **Tracking UTM** : Attribution des sources

### ⚖️ Conformité Légale
- **Loi gabonaise** : Conforme à la loi n°005/2025 sur le commerce
- **Protection des données** : Politique de confidentialité complète
- **Mentions légales** : Informations légales requises

## 🚀 Installation

### Prérequis
- Python 3.10+
- pip (gestionnaire de paquets Python)

### Installation rapide

1. **Cloner le projet**
```bash
git clone https://github.com/votre-username/immo-gabon.git
cd immo-gabon
```

2. **Installer les dépendances**
```bash
pip install -r requirements.txt
```

3. **Configuration initiale**
```bash
python setup.py
```

4. **Lancer l'application**
```bash
streamlit run app.py
```

## ⚙️ Configuration

### Secrets Streamlit
Éditez `.streamlit/secrets.toml` :

```toml
[auth]
cookie_name = "immo_gabon_auth"
cookie_key = "votre-clé-secrète-unique"
cookie_expiry_days = 30

[admin]
admin_email = "admin@votre-domaine.com"

[app]
app_name = "Immo Gabon"
base_url = "https://votre-app.streamlit.app"
contact_email = "contact@votre-domaine.com"
contact_phone = "+241-XX-XX-XX-XX"
```

### Authentification
Par défaut, deux comptes sont configurés :
- **Admin** : Gestion complète des annonces
- **Analyste** : Accès lecture seule aux analytics

## 📁 Structure du Projet

```
immo/
├── app.py                 # Application principale
├── requirements.txt       # Dépendances Python
├── setup.py              # Script de configuration
├── config.toml           # Configuration Streamlit
├── .streamlit/
│   └── secrets.toml      # Secrets (non versionné)
├── pages/                # Pages de l'application
│   ├── admin.py          # Interface d'administration
│   ├── analytics.py      # Tableau de bord analyste
│   ├── detail_annonce.py # Page de détail d'annonce
│   ├── mentions_legales.py
│   └── politique_confidentialite.py
├── models/               # Modèles de données
│   ├── database.py       # Gestion base de données
│   └── annonce_models.py # Modèles d'annonces
├── utils/                # Utilitaires
│   ├── auth.py           # Authentification
│   ├── helpers.py        # Fonctions utilitaires
│   └── demo_data.py      # Données de démonstration
├── assets/               # Ressources statiques
│   └── style.css         # Styles CSS personnalisés
├── data/                 # Base de données SQLite
├── uploads/              # Photos uploadées
└── README.md
```

## 🎨 Design & UX

### Palette de Couleurs
- **Primaire** : #FF6B35 (Orange Gabon)
- **Secondaire** : #F7931E (Orange clair)
- **Accents** : Couleurs du drapeau gabonais

### Responsive Design
- **Mobile-first** : Optimisé pour smartphones
- **Tablettes** : Interface adaptée
- **Desktop** : Expérience complète

### Accessibilité
- **Contraste AA** : Lisibilité optimale
- **Navigation clavier** : Support complet
- **Textes alternatifs** : Images décrites

## 📊 Analytics & Facturation

### Métriques Suivies
- **Vues d'annonces** : Compteur par annonce
- **Clics contact** : WhatsApp, téléphone, email
- **Partages sociaux** : Facebook, WhatsApp, Instagram
- **Sources UTM** : Attribution du trafic

### Modèle de Facturation Suggéré
- **Vues** : 10 FCFA par vue
- **Clics contact** : 50 FCFA par clic
- **Partages** : 25 FCFA par partage

### Export des Données
- **Format CSV** : Compatible Excel
- **Période personnalisable** : Rapports flexibles
- **Données anonymisées** : Respect de la confidentialité

## 🌐 Déploiement Streamlit Cloud

### Étapes de Déploiement

1. **Créer un repository GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/votre-username/immo-gabon.git
git push -u origin main
```

2. **Connecter à Streamlit Cloud**
- Aller sur [share.streamlit.io](https://share.streamlit.io)
- Connecter votre compte GitHub
- Sélectionner le repository
- Configurer les secrets dans l'interface web

3. **Configuration des Secrets**
Dans l'interface Streamlit Cloud, ajouter :
```toml
[auth]
cookie_name = "immo_gabon_auth"
cookie_key = "votre-clé-production"

[admin]
admin_email = "admin@votre-domaine.com"

[app]
base_url = "https://votre-app.streamlit.app"
```

### Limitations Streamlit Community Cloud
- **Ressources** : CPU et mémoire limitées
- **Concurrence** : Utilisateurs simultanés limités
- **Stockage** : Fichiers temporaires uniquement
- **Domaine** : Sous-domaine streamlit.app

## 🔒 Sécurité

### Authentification
- **Cookies sécurisés** : Sessions chiffrées
- **Mots de passe hachés** : bcrypt
- **Expiration automatique** : Sessions limitées dans le temps

### Protection des Données
- **Chiffrement en transit** : HTTPS obligatoire
- **Minimisation** : Collecte limitée aux besoins
- **Anonymisation** : Analytics sans données personnelles

## 🆘 Support & Maintenance

### Logs & Monitoring
- **Streamlit Cloud** : Logs automatiques
- **Erreurs** : Tracking des exceptions
- **Performance** : Métriques d'usage

### Sauvegarde
- **Base SQLite** : Sauvegarde régulière recommandée
- **Photos** : Stockage externe pour production
- **Configuration** : Versionning Git

## 📈 Roadmap V2

### Fonctionnalités Prévues
- **Comptes vendeurs** : Inscription publique
- **Messagerie interne** : Chat intégré
- **Paiements en ligne** : Boost d'annonces
- **Domaine personnalisé** : TLD propre
- **API REST** : Intégrations tierces

### Améliorations Techniques
- **Base PostgreSQL** : Scalabilité
- **CDN** : Optimisation images
- **Cache Redis** : Performance
- **Tests automatisés** : CI/CD

## 📞 Contact

**Développement** : [Votre nom]  
**Email** : contact@immo-gabon.com  
**Support** : Créer un ticket GitHub

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

---

**🇬🇦 Fait avec ❤️ pour le Gabon**

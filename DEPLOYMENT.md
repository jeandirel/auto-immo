# 🚀 Guide de Déploiement - Immo Gabon

Guide complet pour déployer l'application sur Streamlit Community Cloud.

## 📋 Prérequis

- Compte GitHub
- Compte Streamlit Cloud (gratuit)
- Application configurée localement

## 🔧 Préparation du Déploiement

### 1. Configuration des Secrets

Éditez `.streamlit/secrets.toml` avec vos vraies valeurs :

```toml
[auth]
cookie_name = "immo_gabon_auth"
cookie_key = "votre-clé-secrète-unique-32-caractères"
cookie_expiry_days = 30

[admin]
admin_email = "admin@votre-domaine.com"

[analytics]
export_key = "votre-clé-export-analytics"

[app]
app_name = "Immo Gabon"
base_url = "https://votre-app.streamlit.app"
contact_email = "contact@votre-domaine.com"
contact_phone = "+241-XX-XX-XX-XX"
```

### 2. Création du Repository GitHub

```bash
# Initialiser Git
git init

# Ajouter tous les fichiers
git add .

# Premier commit
git commit -m "Initial commit - Immo Gabon v1.0"

# Ajouter l'origine GitHub
git remote add origin https://github.com/votre-username/immo-gabon.git

# Pousser vers GitHub
git push -u origin main
```

### 3. Fichiers à Exclure (.gitignore)

Créez un fichier `.gitignore` :

```
# Secrets
.streamlit/secrets.toml

# Base de données locale
data/*.db

# Uploads locaux
uploads/*
!uploads/.gitkeep

# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
env/
venv/
.venv/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db
```

## 🌐 Déploiement sur Streamlit Cloud

### 1. Connexion à Streamlit Cloud

1. Allez sur [share.streamlit.io](https://share.streamlit.io)
2. Connectez-vous avec votre compte GitHub
3. Cliquez sur "New app"

### 2. Configuration de l'Application

- **Repository** : `votre-username/immo-gabon`
- **Branch** : `main`
- **Main file path** : `app.py`
- **App URL** : `immo-gabon` (ou votre choix)

### 3. Configuration des Secrets

Dans l'interface Streamlit Cloud, section "Secrets" :

```toml
[auth]
cookie_name = "immo_gabon_auth"
cookie_key = "votre-clé-production-32-caractères"
cookie_expiry_days = 30

[admin]
admin_email = "admin@votre-domaine.com"

[analytics]
export_key = "votre-clé-export-production"

[app]
app_name = "Immo Gabon"
base_url = "https://immo-gabon.streamlit.app"
contact_email = "contact@votre-domaine.com"
contact_phone = "+241-XX-XX-XX-XX"
```

### 4. Déploiement

1. Cliquez sur "Deploy!"
2. Attendez la compilation (2-5 minutes)
3. L'application sera disponible à `https://votre-app.streamlit.app`

## 🔐 Configuration de l'Authentification

### Génération des Mots de Passe

Utilisez ce script Python pour générer des mots de passe hachés :

```python
import streamlit_authenticator as stauth

# Générer des hashs pour admin et analyste
passwords = ['mot_de_passe_admin', 'mot_de_passe_analyste']
hashed_passwords = stauth.Hasher(passwords).generate()

print("Admin hash:", hashed_passwords[0])
print("Analyste hash:", hashed_passwords[1])
```

### Configuration des Utilisateurs

Modifiez `utils/auth.py` avec les vrais hashs :

```python
config = {
    'credentials': {
        'usernames': {
            'admin': {
                'email': 'admin@votre-domaine.com',
                'name': 'Administrateur',
                'password': 'hash_généré_admin',
                'role': 'admin'
            },
            'analyste': {
                'email': 'analyste@votre-domaine.com',
                'name': 'Analyste',
                'password': 'hash_généré_analyste',
                'role': 'analyste'
            }
        }
    }
}
```

## 📊 Optimisations pour Streamlit Cloud

### 1. Limitations à Respecter

- **CPU** : Limité, éviter les calculs lourds
- **Mémoire** : ~1GB, optimiser les images
- **Stockage** : Temporaire, utiliser base externe pour production
- **Concurrence** : Limitée, optimiser les requêtes

### 2. Optimisations Recommandées

```python
# Cache des données
@st.cache_data(ttl=300)  # 5 minutes
def load_annonces():
    return db.obtenir_annonces()

# Optimisation des images
def optimize_image(image_path, max_size=(800, 600)):
    with Image.open(image_path) as img:
        img.thumbnail(max_size, Image.Resampling.LANCZOS)
        img.save(image_path, optimize=True, quality=85)
```

### 3. Monitoring et Logs

- Utilisez `st.error()` pour les erreurs importantes
- Loggez les événements critiques
- Surveillez les métriques dans l'interface Streamlit Cloud

## 🔄 Mise à Jour de l'Application

### Déploiement Continu

```bash
# Faire des modifications
git add .
git commit -m "Nouvelle fonctionnalité"
git push origin main
```

L'application se redéploie automatiquement à chaque push.

### Rollback en Cas de Problème

```bash
# Revenir au commit précédent
git revert HEAD
git push origin main
```

## 🛠️ Maintenance

### 1. Sauvegarde des Données

Pour la production, migrez vers une base externe :
- PostgreSQL (Supabase, Neon)
- MongoDB Atlas
- Firebase Firestore

### 2. Monitoring

- Surveillez les logs Streamlit Cloud
- Configurez des alertes pour les erreurs
- Suivez les métriques d'usage

### 3. Sécurité

- Changez régulièrement les clés secrètes
- Surveillez les tentatives de connexion
- Mettez à jour les dépendances

## 🌍 Configuration du Domaine Personnalisé

### Option 1 : Sous-domaine Streamlit

Utilisez `https://votre-app.streamlit.app` (gratuit)

### Option 2 : Domaine Personnalisé

Pour un domaine personnalisé, considérez :
- Déploiement sur Heroku/Railway/Render
- Configuration DNS CNAME
- Certificat SSL automatique

## 📞 Support et Dépannage

### Problèmes Courants

1. **Erreur de mémoire** : Optimisez les images et données
2. **Timeout** : Réduisez les requêtes lourdes
3. **Secrets non trouvés** : Vérifiez la configuration

### Logs et Debug

```python
import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Dans votre code
logger.info("Application démarrée")
logger.error(f"Erreur: {error}")
```

### Contact Support

- **Streamlit Community** : [forum.streamlit.io](https://forum.streamlit.io)
- **Documentation** : [docs.streamlit.io](https://docs.streamlit.io)
- **GitHub Issues** : Pour les bugs spécifiques

---

## ✅ Checklist de Déploiement

- [ ] Repository GitHub créé et configuré
- [ ] Secrets configurés dans Streamlit Cloud
- [ ] Mots de passe admin/analyste générés
- [ ] Application déployée et accessible
- [ ] Tests de fonctionnalités effectués
- [ ] Données de démonstration chargées
- [ ] Monitoring configuré
- [ ] Documentation mise à jour

**🎉 Votre application Immo Gabon est maintenant en ligne !**

"""
Script de configuration et initialisation de l'application
Immo Gabon - Site de petites annonces
"""

import os
import sys
from pathlib import Path

def verifier_structure():
    """Vérifier que tous les dossiers nécessaires existent"""
    dossiers_requis = [
        'pages', 'components', 'models', 'utils', 
        'assets', 'data', 'uploads', '.streamlit'
    ]
    
    print("🔍 Vérification de la structure du projet...")
    
    for dossier in dossiers_requis:
        if not os.path.exists(dossier):
            os.makedirs(dossier, exist_ok=True)
            print(f"📁 Dossier créé: {dossier}")
        else:
            print(f"✅ Dossier existant: {dossier}")

def initialiser_base_donnees():
    """Initialiser la base de données"""
    print("\n🗄️ Initialisation de la base de données...")
    
    try:
        from models.database import Database
        db = Database()
        print("✅ Base de données initialisée avec succès")
        return True
    except Exception as e:
        print(f"❌ Erreur lors de l'initialisation de la base: {e}")
        return False

def generer_donnees_demo():
    """Générer des données de démonstration"""
    print("\n🎭 Génération des données de démonstration...")
    
    try:
        from utils.demo_data import generer_donnees_demo
        generer_donnees_demo()
        return True
    except Exception as e:
        print(f"❌ Erreur lors de la génération des données: {e}")
        return False

def verifier_dependances():
    """Vérifier que toutes les dépendances sont installées"""
    print("\n📦 Vérification des dépendances...")
    
    dependances_requises = [
        'streamlit',
        'streamlit_authenticator',
        'pandas',
        'PIL',
        'plotly',
        'requests'
    ]
    
    dependances_manquantes = []
    
    for dep in dependances_requises:
        try:
            __import__(dep)
            print(f"✅ {dep}")
        except ImportError:
            dependances_manquantes.append(dep)
            print(f"❌ {dep} - MANQUANT")
    
    if dependances_manquantes:
        print(f"\n⚠️ Dépendances manquantes: {', '.join(dependances_manquantes)}")
        print("Installez-les avec: pip install -r requirements.txt")
        return False
    
    print("✅ Toutes les dépendances sont installées")
    return True

def creer_fichier_secrets():
    """Créer un fichier de secrets d'exemple"""
    secrets_path = Path('.streamlit/secrets.toml')
    
    if not secrets_path.exists():
        print("\n🔐 Création du fichier secrets.toml...")
        
        secrets_content = """# Configuration des secrets pour l'authentification et les APIs
# À remplir avec les vraies valeurs lors du déploiement

[auth]
# Configuration streamlit-authenticator
cookie_name = "immo_gabon_auth"
cookie_key = "your-random-cookie-key-change-this"
cookie_expiry_days = 30

[admin]
# Email de l'administrateur principal (commanditaire)
admin_email = "admin@example.com"

[analytics]
# Clé pour l'export des données analytics
export_key = "your-analytics-export-key"

[app]
# Configuration générale de l'application
app_name = "Immo Gabon"
base_url = "https://your-app.streamlit.app"
contact_email = "contact@example.com"
contact_phone = "+241-XX-XX-XX-XX"
"""
        
        with open(secrets_path, 'w', encoding='utf-8') as f:
            f.write(secrets_content)
        
        print("✅ Fichier secrets.toml créé")
        print("⚠️ N'oubliez pas de modifier les valeurs par défaut!")
    else:
        print("✅ Fichier secrets.toml existant")

def afficher_instructions():
    """Afficher les instructions de démarrage"""
    print("\n" + "="*60)
    print("🎉 CONFIGURATION TERMINÉE!")
    print("="*60)
    print("\n📋 PROCHAINES ÉTAPES:")
    print("\n1. 🔐 Configurez vos secrets:")
    print("   - Éditez .streamlit/secrets.toml")
    print("   - Ajoutez vos vraies clés et informations")
    
    print("\n2. 🚀 Lancez l'application:")
    print("   streamlit run app.py")
    
    print("\n3. 👤 Connexion admin:")
    print("   - Utilisateur: admin")
    print("   - Mot de passe: (à configurer dans secrets.toml)")
    
    print("\n4. 📊 Accès analyste:")
    print("   - Utilisateur: analyste")
    print("   - Mot de passe: (à configurer dans secrets.toml)")
    
    print("\n5. 🌐 Déploiement sur Streamlit Cloud:")
    print("   - Créez un repo GitHub")
    print("   - Connectez-le à Streamlit Cloud")
    print("   - Configurez les secrets dans l'interface web")
    
    print("\n📚 FONCTIONNALITÉS DISPONIBLES:")
    print("   ✅ Catalogue public d'annonces")
    print("   ✅ Interface d'administration")
    print("   ✅ Analytics et reporting")
    print("   ✅ Partage social (WhatsApp, Facebook, Instagram)")
    print("   ✅ Pages légales conformes (Gabon)")
    print("   ✅ Design responsive mobile-first")
    
    print("\n🆘 SUPPORT:")
    print("   - Documentation: README.md")
    print("   - Issues: Créez un ticket GitHub")
    
    print("\n" + "="*60)

def main():
    """Fonction principale de configuration"""
    print("🏠 IMMO GABON - Configuration initiale")
    print("="*50)
    
    # Vérifications préliminaires
    if not verifier_dependances():
        print("\n❌ Configuration interrompue - dépendances manquantes")
        sys.exit(1)
    
    # Configuration de la structure
    verifier_structure()
    
    # Initialisation de la base de données
    if not initialiser_base_donnees():
        print("\n❌ Configuration interrompue - problème base de données")
        sys.exit(1)
    
    # Création des fichiers de configuration
    creer_fichier_secrets()
    
    # Génération des données de démonstration
    reponse = input("\n❓ Voulez-vous générer des données de démonstration? (o/N): ")
    if reponse.lower() in ['o', 'oui', 'y', 'yes']:
        generer_donnees_demo()
    
    # Instructions finales
    afficher_instructions()

if __name__ == "__main__":
    main()

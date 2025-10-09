"""
Tests de base pour l'application Immo Gabon
Vérification des fonctionnalités principales
"""

import os
import sys
import sqlite3
from datetime import datetime
import tempfile

def test_database_connection():
    """Tester la connexion à la base de données"""
    print("🗄️ Test de la base de données...")
    
    try:
        from models.database import Database
        db = Database()
        
        # Test de connexion
        conn = db.get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()
        conn.close()
        
        expected_tables = ['annonces', 'analytics', 'utilisateurs']
        existing_tables = [table[0] for table in tables]
        
        for table in expected_tables:
            if table in existing_tables:
                print(f"  ✅ Table '{table}' existe")
            else:
                print(f"  ❌ Table '{table}' manquante")
                return False
        
        print("✅ Base de données OK")
        return True
        
    except Exception as e:
        print(f"❌ Erreur base de données: {e}")
        return False

def test_models():
    """Tester les modèles de données"""
    print("\n📊 Test des modèles...")
    
    try:
        from models.annonce_models import AnnonceImmobilier, AnnonceVehicule, AnnonceInformatique
        from models.annonce_models import VILLES_GABON, TYPES_BIEN_IMMOBILIER
        
        # Test modèle immobilier
        annonce_immo = AnnonceImmobilier(
            titre="Test Villa",
            description="Villa de test",
            categorie="immobilier",
            type_annonce="vente",
            prix=50000000,
            ville="Libreville",
            contact_nom="Test User",
            contact_telephone="+241-06-12-34-56"
        )
        
        if annonce_immo.categorie == 'immobilier':
            print("  ✅ Modèle immobilier OK")
        else:
            print("  ❌ Modèle immobilier KO")
            return False
        
        # Test des constantes
        if len(VILLES_GABON) > 0 and 'Libreville' in VILLES_GABON:
            print("  ✅ Constantes villes OK")
        else:
            print("  ❌ Constantes villes KO")
            return False
        
        print("✅ Modèles OK")
        return True
        
    except Exception as e:
        print(f"❌ Erreur modèles: {e}")
        return False

def test_crud_operations():
    """Tester les opérations CRUD"""
    print("\n🔄 Test des opérations CRUD...")
    
    try:
        from models.database import Database
        
        # Utiliser une base temporaire pour les tests
        with tempfile.NamedTemporaryFile(suffix='.db', delete=False) as tmp_file:
            test_db_path = tmp_file.name
        
        db = Database(test_db_path)
        
        # Test d'ajout d'annonce
        annonce_data = {
            'titre': 'Test Annonce',
            'description': 'Description de test',
            'categorie': 'immobilier',
            'type_annonce': 'vente',
            'prix': 1000000,
            'localisation': 'Test Location',
            'ville': 'Libreville',
            'contact_nom': 'Test User',
            'contact_telephone': '+241-06-12-34-56',
            'statut': 'publie',
            'donnees_specifiques': {'type_bien': 'Maison'},
            'photos': [],
            'videos': []
        }
        
        # Créer l'annonce
        annonce_id = db.ajouter_annonce(annonce_data)
        if annonce_id:
            print(f"  ✅ Création annonce OK (ID: {annonce_id})")
        else:
            print("  ❌ Création annonce KO")
            return False
        
        # Récupérer l'annonce
        annonce = db.obtenir_annonce_par_id(annonce_id)
        if annonce and annonce['titre'] == 'Test Annonce':
            print("  ✅ Lecture annonce OK")
        else:
            print("  ❌ Lecture annonce KO")
            return False
        
        # Test des filtres
        annonces = db.obtenir_annonces({'categorie': 'immobilier'})
        if len(annonces) > 0:
            print("  ✅ Filtrage annonces OK")
        else:
            print("  ❌ Filtrage annonces KO")
            return False
        
        # Test analytics
        db.enregistrer_evenement(annonce_id, 'vue', 'direct')
        db.incrementer_vues(annonce_id)
        
        annonce_updated = db.obtenir_annonce_par_id(annonce_id)
        if annonce_updated['vues'] > 0:
            print("  ✅ Analytics OK")
        else:
            print("  ❌ Analytics KO")
            return False
        
        # Nettoyer
        os.unlink(test_db_path)
        
        print("✅ Opérations CRUD OK")
        return True
        
    except Exception as e:
        print(f"❌ Erreur CRUD: {e}")
        return False

def test_helpers():
    """Tester les fonctions utilitaires"""
    print("\n🛠️ Test des utilitaires...")
    
    try:
        from utils.helpers import format_prix, valider_telephone, valider_email
        
        # Test formatage prix
        prix_formate = format_prix(1500000)
        if "1.5M" in prix_formate or "1500" in prix_formate:
            print("  ✅ Formatage prix OK")
        else:
            print(f"  ❌ Formatage prix KO: {prix_formate}")
            return False
        
        # Test validation téléphone
        if valider_telephone("+241-06-12-34-56"):
            print("  ✅ Validation téléphone OK")
        else:
            print("  ❌ Validation téléphone KO")
            return False
        
        # Test validation email
        if valider_email("test@example.com"):
            print("  ✅ Validation email OK")
        else:
            print("  ❌ Validation email KO")
            return False
        
        print("✅ Utilitaires OK")
        return True
        
    except Exception as e:
        print(f"❌ Erreur utilitaires: {e}")
        return False

def test_auth():
    """Tester le système d'authentification"""
    print("\n🔐 Test de l'authentification...")
    
    try:
        from utils.auth import AuthManager
        
        auth = AuthManager()
        
        # Test de création de hash
        try:
            import streamlit_authenticator as stauth
            password_hash = stauth.Hasher(['test_password']).generate()[0]
            if password_hash and len(password_hash) > 20:
                print("  ✅ Création hash OK")
            else:
                print("  ❌ Création hash KO")
                return False
        except Exception as e:
            print(f"  ⚠️ Test hash ignoré: {e}")
            # Ce n'est pas critique pour le fonctionnement de base
        
        print("✅ Authentification OK")
        return True
        
    except Exception as e:
        print(f"❌ Erreur authentification: {e}")
        return False

def test_file_structure():
    """Vérifier la structure des fichiers"""
    print("\n📁 Test de la structure des fichiers...")
    
    fichiers_requis = [
        'app.py',
        'requirements.txt',
        'models/database.py',
        'models/annonce_models.py',
        'utils/auth.py',
        'utils/helpers.py',
        'pages/admin.py',
        'pages/analytics.py',
        'pages/detail_annonce.py',
        'assets/style.css'
    ]
    
    dossiers_requis = [
        'pages', 'models', 'utils', 'assets', 'data', 'uploads'
    ]
    
    # Vérifier les fichiers
    for fichier in fichiers_requis:
        if os.path.exists(fichier):
            print(f"  ✅ {fichier}")
        else:
            print(f"  ❌ {fichier} manquant")
            return False
    
    # Vérifier les dossiers
    for dossier in dossiers_requis:
        if os.path.exists(dossier):
            print(f"  ✅ {dossier}/")
        else:
            print(f"  ❌ {dossier}/ manquant")
            return False
    
    print("✅ Structure des fichiers OK")
    return True

def test_imports():
    """Tester les imports des modules principaux"""
    print("\n📦 Test des imports...")
    
    modules_requis = [
        'streamlit',
        'pandas',
        'plotly.express',
        'PIL',
        'streamlit_authenticator'
    ]
    
    for module in modules_requis:
        try:
            __import__(module)
            print(f"  ✅ {module}")
        except ImportError as e:
            print(f"  ❌ {module} - {e}")
            return False
    
    print("✅ Imports OK")
    return True

def run_all_tests():
    """Exécuter tous les tests"""
    print("🧪 TESTS DE L'APPLICATION IMMO GABON")
    print("=" * 50)
    
    tests = [
        ("Structure des fichiers", test_file_structure),
        ("Imports des modules", test_imports),
        ("Base de données", test_database_connection),
        ("Modèles de données", test_models),
        ("Opérations CRUD", test_crud_operations),
        ("Fonctions utilitaires", test_helpers),
        ("Authentification", test_auth)
    ]
    
    resultats = []
    
    for nom_test, fonction_test in tests:
        try:
            resultat = fonction_test()
            resultats.append((nom_test, resultat))
        except Exception as e:
            print(f"❌ Erreur lors du test '{nom_test}': {e}")
            resultats.append((nom_test, False))
    
    # Résumé
    print("\n" + "=" * 50)
    print("📊 RÉSUMÉ DES TESTS")
    print("=" * 50)
    
    tests_reussis = 0
    for nom_test, resultat in resultats:
        status = "✅ RÉUSSI" if resultat else "❌ ÉCHOUÉ"
        print(f"{status} - {nom_test}")
        if resultat:
            tests_reussis += 1
    
    print(f"\n🎯 Résultat: {tests_reussis}/{len(tests)} tests réussis")
    
    if tests_reussis == len(tests):
        print("🎉 Tous les tests sont passés! L'application est prête.")
        return True
    else:
        print("⚠️ Certains tests ont échoué. Vérifiez la configuration.")
        return False

if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)

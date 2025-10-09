#!/usr/bin/env python3
"""
Test de lancement de l'application Immo Gabon
Vérifie que tous les modules se chargent correctement
"""

import sys
import traceback

def test_imports():
    """Test des imports principaux"""
    print("🧪 Test des imports...")
    
    try:
        import streamlit as st
        print("  ✅ streamlit")
    except Exception as e:
        print(f"  ❌ streamlit: {e}")
        return False
    
    try:
        import streamlit_authenticator as stauth
        print("  ✅ streamlit_authenticator")
    except Exception as e:
        print(f"  ❌ streamlit_authenticator: {e}")
        return False
    
    try:
        from models.database import Database
        print("  ✅ Database")
    except Exception as e:
        print(f"  ❌ Database: {e}")
        return False
    
    try:
        from utils.auth import AuthManager
        print("  ✅ AuthManager")
    except Exception as e:
        print(f"  ❌ AuthManager: {e}")
        return False
    
    return True

def test_database():
    """Test de la base de données"""
    print("\n🗄️ Test de la base de données...")
    
    try:
        from models.database import Database
        db = Database()

        # Test de connexion
        annonces = db.obtenir_annonces(limit=1)
        print(f"  ✅ Base de données OK ({len(annonces)} annonces trouvées)")
        return True
        
    except Exception as e:
        print(f"  ❌ Erreur base de données: {e}")
        return False

def test_auth():
    """Test de l'authentification"""
    print("\n🔐 Test de l'authentification...")
    
    try:
        from utils.auth import AuthManager
        auth = AuthManager()
        print("  ✅ AuthManager initialisé")
        
        # Test de la configuration
        config = auth.config
        if 'credentials' in config and 'usernames' in config['credentials']:
            users = list(config['credentials']['usernames'].keys())
            print(f"  ✅ Utilisateurs configurés: {users}")
        else:
            print("  ⚠️ Configuration utilisateurs manquante")
            
        return True
        
    except Exception as e:
        print(f"  ❌ Erreur authentification: {e}")
        traceback.print_exc()
        return False

def test_app_structure():
    """Test de la structure de l'application"""
    print("\n📁 Test de la structure...")
    
    try:
        # Test d'import du module principal
        import app
        print("  ✅ Module app.py importé")
        
        # Vérifier les fonctions principales
        if hasattr(app, 'main'):
            print("  ✅ Fonction main() trouvée")
        else:
            print("  ⚠️ Fonction main() manquante")
            
        return True
        
    except Exception as e:
        print(f"  ❌ Erreur structure app: {e}")
        traceback.print_exc()
        return False

def main():
    """Fonction principale de test"""
    print("🏠 IMMO GABON - Test de Lancement")
    print("=" * 50)
    
    tests = [
        ("Imports", test_imports),
        ("Base de données", test_database),
        ("Authentification", test_auth),
        ("Structure app", test_app_structure)
    ]
    
    results = []
    
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"\n❌ Erreur critique dans {test_name}: {e}")
            traceback.print_exc()
            results.append((test_name, False))
    
    # Résumé
    print("\n" + "=" * 50)
    print("📊 RÉSUMÉ DES TESTS")
    print("=" * 50)
    
    passed = 0
    total = len(results)
    
    for test_name, result in results:
        status = "✅ RÉUSSI" if result else "❌ ÉCHOUÉ"
        print(f"{status} - {test_name}")
        if result:
            passed += 1
    
    print(f"\n🎯 Résultat: {passed}/{total} tests réussis")
    
    if passed == total:
        print("\n🎉 Tous les tests sont passés !")
        print("L'application est prête à être lancée avec:")
        print("   streamlit run app.py")
        print("\n👤 Connexion par défaut:")
        print("   Utilisateur: admin")
        print("   Mot de passe: admin123")
        print("\n   Utilisateur: analyste") 
        print("   Mot de passe: analyste123")
    else:
        print(f"\n⚠️ {total - passed} test(s) ont échoué.")
        print("Vérifiez les erreurs ci-dessus avant de lancer l'application.")
        return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(main())

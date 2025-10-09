# 🚀 Guide de Lancement - Immo Gabon

## ✅ Application Prête !

L'application **Immo Gabon** est maintenant configurée et prête à l'emploi.

## 🔧 Lancement Local

### 1. Démarrer l'Application

```bash
streamlit run app.py
```

L'application sera accessible à : **http://localhost:8501**

### 2. Test de Fonctionnement

Pour vérifier que tout fonctionne :

```bash
python test_launch.py
```

## 👤 Comptes de Connexion

### Administrateur
- **Utilisateur** : `admin`
- **Mot de passe** : `admin123`
- **Accès** : Gestion complète des annonces, statistiques

### Analyste
- **Utilisateur** : `analyste`
- **Mot de passe** : `analyste123`
- **Accès** : Consultation analytics, export CSV

## 📊 Données de Démonstration

L'application contient **7 annonces de démonstration** :

### 🏠 Immobilier (3 annonces)
1. **Villa moderne 4 chambres avec piscine** - 85M FCFA
2. **Appartement 2 pièces centre-ville** - 450K FCFA/mois
3. **Terrain constructible 1000m² Owendo** - 25M FCFA

### 🚗 Véhicules (2 annonces)
4. **Toyota Camry 2018 - Excellent état** - 12M FCFA
5. **Nissan Patrol 4x4 - Parfait pour brousse** - 18M FCFA

### 💻 Informatique (2 annonces)
6. **MacBook Pro 13" 2021 - Comme neuf** - 1.2M FCFA
7. **Samsung Galaxy S22 Ultra - État impeccable** - 450K FCFA

## 🎯 Fonctionnalités Disponibles

### Interface Publique
- ✅ Catalogue d'annonces avec filtres
- ✅ Recherche par catégorie, prix, localisation
- ✅ Fiches détaillées avec galeries photos
- ✅ Partage social (WhatsApp, Facebook, Instagram)
- ✅ Design responsive mobile-first

### Administration
- ✅ Création/édition d'annonces
- ✅ Gestion des statuts (brouillon, publié, archivé)
- ✅ Upload et optimisation d'images
- ✅ Tableau de bord avec statistiques

### Analytics
- ✅ Suivi des vues, clics, partages
- ✅ Métriques par annonce et catégorie
- ✅ Sources de trafic (UTM tracking)
- ✅ Export CSV pour facturation

## 🔄 Navigation

### Pages Principales
- **Accueil** : Catalogue public avec filtres
- **Détail Annonce** : Fiche complète avec contact
- **Admin** : Interface de gestion (connexion requise)
- **Analytics** : Tableau de bord analyste (connexion requise)
- **Mentions Légales** : Conformité juridique Gabon

### Connexion
- Utilisez la barre latérale pour vous connecter
- Les menus admin/analytics apparaissent après connexion
- Bouton de déconnexion disponible en haut à droite

## 📱 Test Mobile

L'application est optimisée mobile-first. Testez sur :
- Smartphone (responsive design)
- Tablette (interface adaptée)
- Desktop (expérience complète)

## 🛠️ Personnalisation

### Modifier les Données
1. **Supprimer les données de démo** :
   ```bash
   rm data/immo_gabon.db
   python setup.py
   ```
   (Répondre 'N' pour ne pas générer de données de démo)

2. **Ajouter vos annonces** :
   - Connectez-vous en tant qu'admin
   - Utilisez l'interface "Gestion des Annonces"

### Modifier les Informations Légales
- Éditez `pages/mentions_legales.py`
- Éditez `pages/politique_confidentialite.py`
- Personnalisez avec vos informations d'entreprise

### Changer les Mots de Passe
1. Générez de nouveaux hashs :
   ```python
   import bcrypt
   password = "nouveau_mot_de_passe"
   hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
   print(hash)
   ```

2. Modifiez `utils/auth.py` avec les nouveaux hashs

## 🌐 Déploiement Production

Suivez le guide détaillé dans `DEPLOYMENT.md` pour :
- Déploiement sur Streamlit Cloud
- Configuration des secrets
- Domaine personnalisé
- Optimisations production

## 📞 Support

### Problèmes Courants
- **Port 8501 occupé** : Utilisez `streamlit run app.py --server.port 8502`
- **Erreur de base de données** : Supprimez `data/immo_gabon.db` et relancez `setup.py`
- **Problème d'authentification** : Vérifiez les mots de passe dans `utils/auth.py`

### Logs et Debug
- Les erreurs apparaissent dans le terminal Streamlit
- Utilisez `st.write()` pour déboguer dans l'interface
- Consultez la documentation Streamlit pour les problèmes avancés

## 🎉 Félicitations !

Votre site de petites annonces **Immo Gabon** est opérationnel !

### Prochaines Étapes Recommandées
1. **Testez toutes les fonctionnalités** dans le navigateur
2. **Personnalisez le contenu** selon vos besoins
3. **Configurez les informations légales** de votre entreprise
4. **Préparez le déploiement** sur Streamlit Cloud
5. **Formez vos utilisateurs** sur l'interface d'administration

---

**🇬🇦 Bonne utilisation de votre plateforme Immo Gabon !**

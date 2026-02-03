
// src/firebase/dataModel.js

/**
 * Ce fichier documente la structure des données pour la base de données Firestore.
 */

/**
 * Modèle pour un document dans la collection `annonces`.
 * 
 * /annonces/{annonceId}
 */
const annonceModel = {
  // Informations de base
  titre: "String",
  description: "String",
  prix: "Number",
  devise: "String", // ex: "XAF"

  // Catégorisation et Filtres
  categorie: "String", // ex: "vehicule", "immobilier"
  ville: "String",
  quartier: "String",

  // Média
  images: ["Array<String (URL)>"],
  imagePrincipale: "String (URL)",

  // Détails spécifiques au type d'annonce
  specificites: {
    // Pour les véhicules
    annee: "Number",
    kilometrage: "Number",
    carburant: "String",
    transmission: "String",
    
    // Pour l'immobilier
    surface: "Number",
    nombrePieces: "Number",
  },

  // Disponibilité
  disponibilite: {
    estDisponible: "Boolean",
    // ...autres champs si gestion de calendrier
  },

  // Informations sur le créateur de l'annonce
  createurId: "String", // UID de l'utilisateur (Firebase Auth)
  contact: {
    nom: "String",
    telephone: "String",
  },

  // Métadonnées du document
  status: "String", // 'active', 'vendue', 'inactive'
  createdAt: "Timestamp",
  updatedAt: "Timestamp",
};

/**
 * Modèle pour un document dans la collection `utilisateurs`.
 * 
 * /utilisateurs/{userId}
 */
const utilisateurModel = {
  nom: "String",
  email: "String",
  telephone: "String",
  photoURL: "String (URL)",
  createdAt: "Timestamp",
  // ... autres informations sur l'utilisateur
};

// Note: Ce fichier est pour la documentation et n'est pas importé dans le code.
// Il sert de référence pour le développement.

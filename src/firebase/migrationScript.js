// Script de migration localStorage → Firebase
// À exécuter UNE SEULE FOIS pour transférer les données existantes

import { createAnnonce } from './firebase/annonceService';

export const migrateLocalStorageToFirebase = async () => {
    try {
        // Vérifier si migration déjà effectuée
        const migrated = localStorage.getItem('firebase_migrated');
        if (migrated === 'true') {
            console.log('✅ Migration déjà effectuée');
            return { success: true, message: 'Déjà migré' };
        }

        // Récupérer les données localStorage
        const localData = localStorage.getItem('annonces');
        if (!localData) {
            console.log('Aucune donnée à migrer');
            localStorage.setItem('firebase_migrated', 'true');
            return { success: true, message: 'Aucune donnée' };
        }

        const annonces = JSON.parse(localData);
        console.log(`🔄 Migration de ${annonces.length} annonces vers Firebase...`);

        let successCount = 0;
        let errorCount = 0;

        // Migrer chaque annonce
        for (const annonce of annonces) {
            try {
                // Supprimer l'ancien ID local
                const { id, ...annonceData } = annonce;

                await createAnnonce(annonceData);
                successCount++;
                console.log(`✅ Migré: ${annonce.titre}`);
            } catch (error) {
                errorCount++;
                console.error(`❌ Erreur migration: ${annonce.titre}`, error);
            }
        }

        // Marquer comme migré
        localStorage.setItem('firebase_migrated', 'true');

        const result = {
            success: true,
            message: `Migration terminée: ${successCount} réussies, ${errorCount} erreurs`,
            successCount,
            errorCount
        };

        console.log('✅ ' + result.message);
        return result;

    } catch (error) {
        console.error('❌ Erreur migration:', error);
        return {
            success: false,
            message: 'Erreur lors de la migration: ' + error.message
        };
    }
};

// Fonction pour forcer une nouvelle migration (debug)
export const resetMigration = () => {
    localStorage.removeItem('firebase_migrated');
    console.log('🔄 Flag de migration réinitialisé');
};

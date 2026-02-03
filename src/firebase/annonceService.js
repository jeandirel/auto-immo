// Service de gestion des annonces avec Firebase
import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    getDocs,
    onSnapshot,
    query,
    orderBy,
    serverTimestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from './config';

const COLLECTION_NAME = 'annonces';

// Créer une annonce
export const createAnnonce = async (annonceData) => {
    try {
        const docRef = await addDoc(collection(db, COLLECTION_NAME), {
            ...annonceData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            status: 'active'
        });
        return { id: docRef.id, ...annonceData };
    } catch (error) {
        console.error("Erreur création annonce:", error);
        throw error;
    }
};

// Mettre à jour une annonce
export const updateAnnonce = async (id, updates) => {
    try {
        const annonceRef = doc(db, COLLECTION_NAME, id);
        await updateDoc(annonceRef, {
            ...updates,
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error("Erreur mise à jour annonce:", error);
        throw error;
    }
};

// Supprimer une annonce
export const deleteAnnonce = async (id) => {
    try {
        await deleteDoc(doc(db, COLLECTION_NAME, id));
    } catch (error) {
        console.error("Erreur suppression annonce:", error);
        throw error;
    }
};

// Récupérer toutes les annonces (snapshot temps réel)
export const subscribeToAnnonces = (callback) => {
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));

    return onSnapshot(q, (snapshot) => {
        const annonces = [];
        snapshot.forEach((doc) => {
            annonces.push({ id: doc.id, ...doc.data() });
        });
        callback(annonces);
    }, (error) => {
        console.error("Erreur écoute annonces:", error);
    });
};

// Récupérer toutes les annonces (une fois)
export const getAnnonces = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
        const annonces = [];
        querySnapshot.forEach((doc) => {
            annonces.push({ id: doc.id, ...doc.data() });
        });
        return annonces;
    } catch (error) {
        console.error("Erreur récupération annonces:", error);
        throw error;
    }
};

// Upload d'image vers Firebase Storage
export const uploadImage = async (file, path = 'images') => {
    try {
        const fileName = `${path}/${Date.now()}_${file.name}`;
        const storageRef = ref(storage, fileName);

        // Upload du fichier
        const snapshot = await uploadBytes(storageRef, file);

        // Récupérer l'URL publique
        const downloadURL = await getDownloadURL(snapshot.ref);

        return downloadURL;
    } catch (error) {
        console.error("Erreur upload image:", error);
        throw error;
    }
};

// Upload de vidéo vers Firebase Storage
export const uploadVideo = async (file, path = 'videos') => {
    try {
        // Limite de sécurité (100MB pour Firebase gratuit)
        if (file.size > 100 * 1024 * 1024) {
            throw new Error("Vidéo trop volumineuse (max 100MB)");
        }

        const fileName = `${path}/${Date.now()}_${file.name}`;
        const storageRef = ref(storage, fileName);

        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);

        return downloadURL;
    } catch (error) {
        console.error("Erreur upload vidéo:", error);
        throw error;
    }
};

// Supprimer un fichier du storage
export const deleteFile = async (fileURL) => {
    try {
        const fileRef = ref(storage, fileURL);
        await deleteObject(fileRef);
    } catch (error) {
        console.error("Erreur suppression fichier:", error);
        // Ne pas faire échouer si le fichier n'existe pas
    }
};

"""
Modèle de base de données pour le site de petites annonces Gabon
Gestion des annonces immobilières, véhicules et matériel informatique
"""

import sqlite3
import json
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Any
import os

class Database:
    def __init__(self, db_path: str = "data/immo_gabon.db"):
        self.db_path = db_path
        self._ensure_database_directory()
        self.init_database()
    
    def _ensure_database_directory(self):
        """S'assurer que le dossier de la base existe."""
        dossier = os.path.dirname(os.path.abspath(self.db_path))
        if dossier and not os.path.exists(dossier):
            os.makedirs(dossier, exist_ok=True)
    
    def get_connection(self):
        """Obtenir une connexion à la base de données"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn
    
    def init_database(self):
        """Initialiser la base de données avec les tables nécessaires"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # Table des annonces principales
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS annonces (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                titre TEXT NOT NULL,
                description TEXT NOT NULL,
                categorie TEXT NOT NULL CHECK (categorie IN ('immobilier', 'vehicules', 'informatique')),
                type_annonce TEXT NOT NULL CHECK (type_annonce IN ('vente', 'location')),
                prix REAL NOT NULL,
                devise TEXT DEFAULT 'FCFA',
                localisation TEXT NOT NULL,
                ville TEXT NOT NULL,
                quartier TEXT,
                contact_nom TEXT NOT NULL,
                contact_telephone TEXT NOT NULL,
                contact_email TEXT,
                contact_whatsapp TEXT,
                statut TEXT DEFAULT 'brouillon' CHECK (statut IN ('brouillon', 'publie', 'expire', 'archive')),
                date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                date_expiration TIMESTAMP,
                vues INTEGER DEFAULT 0,
                clics_contact INTEGER DEFAULT 0,
                partages INTEGER DEFAULT 0,
                donnees_specifiques TEXT,  -- JSON pour données spécifiques par catégorie
                photos TEXT,  -- JSON array des chemins photos
                videos TEXT   -- JSON array des chemins vidéos
            )
        ''')
        
        # Table des analytics/événements
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS analytics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                annonce_id INTEGER,
                type_evenement TEXT NOT NULL CHECK (type_evenement IN ('vue', 'clic_contact', 'partage')),
                source_utm TEXT,
                ip_address TEXT,
                user_agent TEXT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                donnees_supplementaires TEXT,  -- JSON pour données additionnelles
                FOREIGN KEY (annonce_id) REFERENCES annonces (id)
            )
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS settings (
                cle TEXT PRIMARY KEY,
                valeur TEXT
            )
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS utilisateurs_publics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nom TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                mot_de_passe_hash TEXT NOT NULL,
                date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')

        # Table des utilisateurs (admin/analyste)
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS utilisateurs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                nom TEXT NOT NULL,
                role TEXT NOT NULL CHECK (role IN ('admin', 'analyste')),
                actif BOOLEAN DEFAULT 1,
                date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                derniere_connexion TIMESTAMP
            )
        ''')
        
        # Index pour optimiser les requêtes
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_annonces_categorie ON annonces (categorie)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_annonces_statut ON annonces (statut)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_annonces_ville ON annonces (ville)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_annonces_prix ON annonces (prix)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_analytics_annonce ON analytics (annonce_id)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_analytics_type ON analytics (type_evenement)')
        
        conn.commit()
        conn.close()
    
    def _deserialize_annonce_row(self, row: sqlite3.Row) -> Dict[str, Any]:
        """Convertir une ligne SQL en dictionnaire avec désérialisation des champs JSON."""
        annonce = dict(row)
        for champ, valeur_par_defaut in (
            ('donnees_specifiques', {}),
            ('photos', []),
            ('videos', []),
        ):
            valeur = annonce.get(champ)
            if valeur:
                try:
                    annonce[champ] = json.loads(valeur)
                except (TypeError, json.JSONDecodeError):
                    annonce[champ] = valeur_par_defaut
            elif champ != 'donnees_specifiques':
                annonce[champ] = valeur_par_defaut
        return annonce

    def get_settings(self) -> Dict[str, Optional[str]]:
        """Récupérer l'ensemble des paramètres globaux."""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT cle, valeur FROM settings")
        resultats = {cle: valeur for cle, valeur in cursor.fetchall()}
        conn.close()
        return resultats

    def get_setting(self, cle: str, valeur_defaut: Optional[str] = None) -> Optional[str]:
        """Récupérer un paramètre spécifique."""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT valeur FROM settings WHERE cle = ?", (cle,))
        row = cursor.fetchone()
        conn.close()
        return row[0] if row and row[0] is not None else valeur_defaut

    def set_setting(self, cle: str, valeur: Optional[str]) -> None:
        """Créer ou mettre à jour un paramètre."""
        conn = self.get_connection()
        cursor = conn.cursor()
        if valeur is None:
            cursor.execute("DELETE FROM settings WHERE cle = ?", (cle,))
        else:
            cursor.execute(
                "INSERT OR REPLACE INTO settings (cle, valeur) VALUES (?, ?)",
                (cle, valeur),
            )
        conn.commit()
        conn.close()

    def creer_utilisateur_public(self, nom: str, email: str, mot_de_passe_hash: str) -> int:
        """Créer un utilisateur public."""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute(
            '''
            INSERT INTO utilisateurs_publics (nom, email, mot_de_passe_hash)
            VALUES (?, ?, ?)
            ''',
            (nom, email, mot_de_passe_hash),
        )
        user_id = cursor.lastrowid
        conn.commit()
        conn.close()
        return user_id

    def obtenir_utilisateur_public_par_email(self, email: str) -> Optional[Dict[str, Any]]:
        """Récupérer un utilisateur public par email."""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute(
            '''
            SELECT id, nom, email, mot_de_passe_hash, date_creation
            FROM utilisateurs_publics
            WHERE email = ?
            ''',
            (email,),
        )
        row = cursor.fetchone()
        conn.close()
        return dict(row) if row else None
    
    def ajouter_annonce(self, annonce_data: Dict[str, Any]) -> int:
        """Ajouter une nouvelle annonce"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # Préparer les données JSON
        donnees_specifiques = json.dumps(annonce_data.get('donnees_specifiques', {}))
        photos = json.dumps(annonce_data.get('photos', []))
        videos = json.dumps(annonce_data.get('videos', []))
        
        cursor.execute('''
            INSERT INTO annonces (
                titre, description, categorie, type_annonce, prix, devise,
                localisation, ville, quartier, contact_nom, contact_telephone,
                contact_email, contact_whatsapp, statut, date_expiration,
                donnees_specifiques, photos, videos
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            annonce_data['titre'], annonce_data['description'], 
            annonce_data['categorie'], annonce_data['type_annonce'],
            annonce_data['prix'], annonce_data.get('devise', 'FCFA'),
            annonce_data['localisation'], annonce_data['ville'],
            annonce_data.get('quartier'), annonce_data['contact_nom'],
            annonce_data['contact_telephone'], annonce_data.get('contact_email'),
            annonce_data.get('contact_whatsapp'), annonce_data.get('statut', 'brouillon'),
            annonce_data.get('date_expiration'), donnees_specifiques, photos, videos
        ))
        
        annonce_id = cursor.lastrowid
        conn.commit()
        conn.close()
        return annonce_id
    
    def mettre_a_jour_annonce(self, annonce_id: int, modifications: Dict[str, Any]) -> bool:
        """Mettre à jour une annonce existante."""
        if not modifications:
            return False

        conn = self.get_connection()
        cursor = conn.cursor()

        champs = []
        params = []

        for cle, valeur in modifications.items():
            if cle in {"donnees_specifiques", "photos", "videos"}:
                valeur = json.dumps(valeur) if valeur is not None else None
            champs.append(f"{cle} = ?")
            params.append(valeur)

        champs.append("date_modification = ?")
        params.append(datetime.now().isoformat())
        params.append(annonce_id)

        requete = f"UPDATE annonces SET {', '.join(champs)} WHERE id = ?"
        cursor.execute(requete, params)
        conn.commit()
        conn.close()
        return True
    
    def obtenir_annonces(self, filtres: Dict[str, Any] = None, limit: int = 50, offset: int = 0) -> List[Dict]:
        """Obtenir les annonces avec filtres optionnels"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        query = "SELECT * FROM annonces WHERE 1=1"
        params = []
        
        if filtres:
            if filtres.get('id'):
                query += " AND id = ?"
                params.append(filtres['id'])
            
            if filtres.get('categorie'):
                query += " AND categorie = ?"
                params.append(filtres['categorie'])
            
            if filtres.get('type_annonce'):
                query += " AND type_annonce = ?"
                params.append(filtres['type_annonce'])
            
            if filtres.get('ville'):
                query += " AND ville LIKE ?"
                params.append(f"%{filtres['ville']}%")
            
            if filtres.get('prix_min'):
                query += " AND prix >= ?"
                params.append(filtres['prix_min'])
            
            if filtres.get('prix_max'):
                query += " AND prix <= ?"
                params.append(filtres['prix_max'])
            
            if filtres.get('statut'):
                query += " AND statut = ?"
                params.append(filtres['statut'])
            elif not filtres.get('id'):
                query += " AND statut = 'publie'"  # Par défaut, seulement les annonces publiées
        
        query += " ORDER BY date_creation DESC LIMIT ? OFFSET ?"
        params.extend([limit, offset])
        
        cursor.execute(query, params)
        rows = cursor.fetchall()
        results = [self._deserialize_annonce_row(row) for row in rows]
        
        conn.close()
        return results
    
    def obtenir_annonce_par_id(self, annonce_id: int) -> Optional[Dict]:
        """Obtenir une annonce spécifique par son ID"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM annonces WHERE id = ?", (annonce_id,))
        row = cursor.fetchone()
        conn.close()
        return self._deserialize_annonce_row(row) if row else None
    
    def incrementer_vues(self, annonce_id: int):
        """Incrémenter le compteur de vues d'une annonce"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute("UPDATE annonces SET vues = vues + 1 WHERE id = ?", (annonce_id,))
        conn.commit()
        conn.close()
    
    def enregistrer_evenement(self, annonce_id: int, type_evenement: str, 
                            source_utm: str = None, ip_address: str = None, 
                            user_agent: str = None, donnees_supplementaires: Dict = None):
        """Enregistrer un événement analytics"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        donnees_json = json.dumps(donnees_supplementaires) if donnees_supplementaires else None
        
        cursor.execute('''
            INSERT INTO analytics (annonce_id, type_evenement, source_utm, ip_address, user_agent, donnees_supplementaires)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (annonce_id, type_evenement, source_utm, ip_address, user_agent, donnees_json))
        
        # Mettre à jour les compteurs dans la table annonces
        if type_evenement == 'clic_contact':
            cursor.execute("UPDATE annonces SET clics_contact = clics_contact + 1 WHERE id = ?", (annonce_id,))
        elif type_evenement == 'partage':
            cursor.execute("UPDATE annonces SET partages = partages + 1 WHERE id = ?", (annonce_id,))
        
        conn.commit()
        conn.close()

"""
Page d'analytics pour l'analyste
Consultation des métriques et export des données
"""

import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from datetime import datetime, timedelta
import json
from models.database import Database
from utils.auth import require_analyst
from utils.helpers import format_prix, format_date

def main():
    """Page principale d'analytics"""
    # Vérifier les droits d'accès
    require_analyst()
    
    st.title("📊 Analytics - Tableau de bord analyste")
    
    # Sélection de la période
    col1, col2 = st.columns(2)
    with col1:
        date_debut = st.date_input("Date de début", value=datetime.now() - timedelta(days=30))
    with col2:
        date_fin = st.date_input("Date de fin", value=datetime.now())
    
    # Convertir en datetime
    date_debut = datetime.combine(date_debut, datetime.min.time())
    date_fin = datetime.combine(date_fin, datetime.max.time())
    
    # Onglets d'analytics
    tab1, tab2, tab3, tab4 = st.tabs([
        "📈 Vue d'ensemble",
        "🎯 Performance des annonces", 
        "📱 Sources de trafic",
        "📊 Export des données"
    ])
    
    with tab1:
        vue_ensemble(date_debut, date_fin)
    
    with tab2:
        performance_annonces(date_debut, date_fin)
    
    with tab3:
        sources_trafic(date_debut, date_fin)
    
    with tab4:
        export_donnees(date_debut, date_fin)

def vue_ensemble(date_debut: datetime, date_fin: datetime):
    """Vue d'ensemble des métriques"""
    st.header("📈 Vue d'ensemble")
    
    db = Database()
    
    # Métriques principales
    col1, col2, col3, col4 = st.columns(4)
    
    # Total des vues
    conn = db.get_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT COUNT(*) FROM analytics 
        WHERE type_evenement = 'vue' 
        AND timestamp BETWEEN ? AND ?
    """, (date_debut, date_fin))
    total_vues = cursor.fetchone()[0]
    
    # Total des clics contact
    cursor.execute("""
        SELECT COUNT(*) FROM analytics 
        WHERE type_evenement = 'clic_contact' 
        AND timestamp BETWEEN ? AND ?
    """, (date_debut, date_fin))
    total_clics = cursor.fetchone()[0]
    
    # Total des partages
    cursor.execute("""
        SELECT COUNT(*) FROM analytics 
        WHERE type_evenement = 'partage' 
        AND timestamp BETWEEN ? AND ?
    """, (date_debut, date_fin))
    total_partages = cursor.fetchone()[0]
    
    # Annonces actives
    annonces_actives = len(db.obtenir_annonces({'statut': 'publie'}))
    
    conn.close()
    
    with col1:
        st.metric("👁️ Vues totales", total_vues)
    with col2:
        st.metric("📞 Clics contact", total_clics)
    with col3:
        st.metric("📤 Partages", total_partages)
    with col4:
        st.metric("📋 Annonces actives", annonces_actives)
    
    # Taux de conversion
    if total_vues > 0:
        taux_contact = (total_clics / total_vues) * 100
        taux_partage = (total_partages / total_vues) * 100
        
        col1, col2 = st.columns(2)
        with col1:
            st.metric("📈 Taux de contact", f"{taux_contact:.1f}%")
        with col2:
            st.metric("📈 Taux de partage", f"{taux_partage:.1f}%")
    
    # Graphique d'évolution temporelle
    st.subheader("📈 Évolution des interactions")
    
    conn = db.get_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT DATE(timestamp) as date, type_evenement, COUNT(*) as count
        FROM analytics 
        WHERE timestamp BETWEEN ? AND ?
        GROUP BY DATE(timestamp), type_evenement
        ORDER BY date
    """, (date_debut, date_fin))
    
    data = cursor.fetchall()
    conn.close()
    
    if data:
        df = pd.DataFrame(data, columns=['date', 'type_evenement', 'count'])
        df['date'] = pd.to_datetime(df['date'])
        
        fig = px.line(df, x='date', y='count', color='type_evenement',
                     title="Évolution des interactions par jour",
                     labels={'count': 'Nombre d\'interactions', 'date': 'Date'})
        st.plotly_chart(fig, use_container_width=True)
    else:
        st.info("Aucune donnée disponible pour cette période")

def performance_annonces(date_debut: datetime, date_fin: datetime):
    """Performance des annonces individuelles"""
    st.header("🎯 Performance des annonces")
    
    db = Database()
    conn = db.get_connection()
    cursor = conn.cursor()
    
    # Top 10 des annonces les plus vues
    cursor.execute("""
        SELECT a.id, a.titre, a.categorie, a.prix, a.ville, 
               COUNT(CASE WHEN an.type_evenement = 'vue' THEN 1 END) as vues,
               COUNT(CASE WHEN an.type_evenement = 'clic_contact' THEN 1 END) as clics,
               COUNT(CASE WHEN an.type_evenement = 'partage' THEN 1 END) as partages
        FROM annonces a
        LEFT JOIN analytics an ON a.id = an.annonce_id 
        WHERE a.statut = 'publie' 
        AND (an.timestamp BETWEEN ? AND ? OR an.timestamp IS NULL)
        GROUP BY a.id, a.titre, a.categorie, a.prix, a.ville
        ORDER BY vues DESC
        LIMIT 10
    """, (date_debut, date_fin))
    
    top_annonces = cursor.fetchall()
    conn.close()
    
    if top_annonces:
        st.subheader("🏆 Top 10 des annonces les plus vues")
        
        df_top = pd.DataFrame(top_annonces, columns=[
            'ID', 'Titre', 'Catégorie', 'Prix', 'Ville', 'Vues', 'Clics', 'Partages'
        ])
        
        # Formater le prix
        df_top['Prix'] = df_top['Prix'].apply(lambda x: format_prix(x))
        
        # Calculer le taux de conversion
        df_top['Taux contact (%)'] = (df_top['Clics'] / df_top['Vues'] * 100).round(1)
        df_top['Taux contact (%)'] = df_top['Taux contact (%)'].fillna(0)
        
        st.dataframe(df_top, use_container_width=True)
        
        # Graphique des performances
        fig = go.Figure()
        fig.add_trace(go.Bar(name='Vues', x=df_top['Titre'][:5], y=df_top['Vues'][:5]))
        fig.add_trace(go.Bar(name='Clics', x=df_top['Titre'][:5], y=df_top['Clics'][:5]))
        fig.add_trace(go.Bar(name='Partages', x=df_top['Titre'][:5], y=df_top['Partages'][:5]))
        
        fig.update_layout(
            title="Performance des 5 meilleures annonces",
            xaxis_title="Annonces",
            yaxis_title="Nombre d'interactions",
            barmode='group'
        )
        st.plotly_chart(fig, use_container_width=True)
    else:
        st.info("Aucune donnée de performance disponible")
    
    # Performance par catégorie
    st.subheader("📊 Performance par catégorie")
    
    conn = db.get_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT a.categorie,
               COUNT(CASE WHEN an.type_evenement = 'vue' THEN 1 END) as vues,
               COUNT(CASE WHEN an.type_evenement = 'clic_contact' THEN 1 END) as clics,
               COUNT(CASE WHEN an.type_evenement = 'partage' THEN 1 END) as partages,
               COUNT(DISTINCT a.id) as nb_annonces
        FROM annonces a
        LEFT JOIN analytics an ON a.id = an.annonce_id 
        WHERE a.statut = 'publie' 
        AND (an.timestamp BETWEEN ? AND ? OR an.timestamp IS NULL)
        GROUP BY a.categorie
    """, (date_debut, date_fin))
    
    perf_categories = cursor.fetchall()
    conn.close()
    
    if perf_categories:
        df_cat = pd.DataFrame(perf_categories, columns=[
            'Catégorie', 'Vues', 'Clics', 'Partages', 'Nb annonces'
        ])
        
        # Calculer les moyennes par annonce
        df_cat['Vues/annonce'] = (df_cat['Vues'] / df_cat['Nb annonces']).round(1)
        df_cat['Clics/annonce'] = (df_cat['Clics'] / df_cat['Nb annonces']).round(1)
        df_cat['Taux contact (%)'] = (df_cat['Clics'] / df_cat['Vues'] * 100).round(1)
        df_cat['Taux contact (%)'] = df_cat['Taux contact (%)'].fillna(0)
        
        st.dataframe(df_cat, use_container_width=True)
        
        # Graphique en secteurs
        fig = px.pie(df_cat, values='Vues', names='Catégorie', 
                    title="Répartition des vues par catégorie")
        st.plotly_chart(fig, use_container_width=True)

def sources_trafic(date_debut: datetime, date_fin: datetime):
    """Analyse des sources de trafic"""
    st.header("📱 Sources de trafic")
    
    db = Database()
    conn = db.get_connection()
    cursor = conn.cursor()
    
    # Sources UTM
    cursor.execute("""
        SELECT source_utm, COUNT(*) as count
        FROM analytics 
        WHERE timestamp BETWEEN ? AND ?
        AND source_utm IS NOT NULL
        GROUP BY source_utm
        ORDER BY count DESC
    """, (date_debut, date_fin))
    
    sources_utm = cursor.fetchall()
    
    if sources_utm:
        st.subheader("🔗 Sources de trafic (UTM)")
        
        df_utm = pd.DataFrame(sources_utm, columns=['Source', 'Interactions'])
        
        col1, col2 = st.columns(2)
        
        with col1:
            st.dataframe(df_utm, use_container_width=True)
        
        with col2:
            fig = px.pie(df_utm, values='Interactions', names='Source',
                        title="Répartition du trafic par source")
            st.plotly_chart(fig, use_container_width=True)
    else:
        st.info("Aucune donnée de source UTM disponible")
    
    # Partages par plateforme
    cursor.execute("""
        SELECT source_utm, COUNT(*) as count
        FROM analytics 
        WHERE type_evenement = 'partage'
        AND timestamp BETWEEN ? AND ?
        AND source_utm IS NOT NULL
        GROUP BY source_utm
        ORDER BY count DESC
    """, (date_debut, date_fin))
    
    partages_plateforme = cursor.fetchall()
    conn.close()
    
    if partages_plateforme:
        st.subheader("📤 Partages par plateforme")
        
        df_partages = pd.DataFrame(partages_plateforme, columns=['Plateforme', 'Partages'])
        
        col1, col2 = st.columns(2)
        
        with col1:
            st.dataframe(df_partages, use_container_width=True)
        
        with col2:
            fig = px.bar(df_partages, x='Plateforme', y='Partages',
                        title="Nombre de partages par plateforme")
            st.plotly_chart(fig, use_container_width=True)

def export_donnees(date_debut: datetime, date_fin: datetime):
    """Export des données pour facturation"""
    st.header("📊 Export des données")
    
    db = Database()
    
    # Résumé pour export
    st.subheader("📋 Résumé de la période")
    
    conn = db.get_connection()
    cursor = conn.cursor()
    
    # Données globales
    cursor.execute("""
        SELECT 
            COUNT(CASE WHEN type_evenement = 'vue' THEN 1 END) as vues,
            COUNT(CASE WHEN type_evenement = 'clic_contact' THEN 1 END) as clics,
            COUNT(CASE WHEN type_evenement = 'partage' THEN 1 END) as partages
        FROM analytics 
        WHERE timestamp BETWEEN ? AND ?
    """, (date_debut, date_fin))
    
    stats_globales = cursor.fetchone()
    
    col1, col2, col3 = st.columns(3)
    with col1:
        st.metric("Total vues", stats_globales[0])
    with col2:
        st.metric("Total clics", stats_globales[1])
    with col3:
        st.metric("Total partages", stats_globales[2])
    
    # Export détaillé
    if st.button("📥 Générer export CSV", type="primary"):
        # Données détaillées pour export
        cursor.execute("""
            SELECT 
                a.id as annonce_id,
                a.titre,
                a.categorie,
                a.ville,
                a.prix,
                COUNT(CASE WHEN an.type_evenement = 'vue' THEN 1 END) as vues,
                COUNT(CASE WHEN an.type_evenement = 'clic_contact' THEN 1 END) as clics_contact,
                COUNT(CASE WHEN an.type_evenement = 'partage' THEN 1 END) as partages,
                a.date_creation
            FROM annonces a
            LEFT JOIN analytics an ON a.id = an.annonce_id 
            WHERE a.statut = 'publie'
            AND (an.timestamp BETWEEN ? AND ? OR an.timestamp IS NULL)
            GROUP BY a.id, a.titre, a.categorie, a.ville, a.prix, a.date_creation
            ORDER BY vues DESC
        """, (date_debut, date_fin))
        
        donnees_export = cursor.fetchall()
        
        if donnees_export:
            df_export = pd.DataFrame(donnees_export, columns=[
                'ID Annonce', 'Titre', 'Catégorie', 'Ville', 'Prix (FCFA)',
                'Vues', 'Clics Contact', 'Partages', 'Date Création'
            ])
            
            # Ajouter des métriques calculées
            df_export['Taux Contact (%)'] = (df_export['Clics Contact'] / df_export['Vues'] * 100).round(2)
            df_export['Taux Contact (%)'] = df_export['Taux Contact (%)'].fillna(0)
            
            # Afficher un aperçu
            st.subheader("📊 Aperçu des données d'export")
            st.dataframe(df_export.head(10), use_container_width=True)
            
            # Bouton de téléchargement
            csv = df_export.to_csv(index=False, encoding='utf-8')
            st.download_button(
                label="💾 Télécharger le rapport CSV",
                data=csv,
                file_name=f"rapport_analytics_{date_debut.strftime('%Y%m%d')}_{date_fin.strftime('%Y%m%d')}.csv",
                mime="text/csv"
            )
            
            st.success("✅ Export généré avec succès!")
        else:
            st.warning("Aucune donnée à exporter pour cette période")
    
    conn.close()
    
    # Informations sur la facturation
    st.subheader("💰 Informations de facturation")
    st.info("""
    **Base de facturation suggérée:**
    - Vues d'annonces: 10 FCFA par vue
    - Clics contact: 50 FCFA par clic
    - Partages sociaux: 25 FCFA par partage
    
    Ces tarifs sont indicatifs et peuvent être ajustés selon les accords commerciaux.
    """)

if __name__ == "__main__":
    main()

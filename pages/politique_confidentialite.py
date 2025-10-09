"""
Politique de confidentialité conforme à la législation gabonaise
Protection des données personnelles
"""

from datetime import datetime

import streamlit as st


def main():
    """Page de la politique de confidentialité"""
    st.title("Politique de confidentialité")

    st.markdown(
        """
        ## Protection de vos données personnelles

        La présente politique décrit comment nous collectons, utilisons et protégeons vos données
        personnelles, conformément à la législation gabonaise sur la protection des données et à la loi n°025/2021
        sur les transactions électroniques.

        ### 1. Responsable du traitement

        **Identité :** [Nom de l'entreprise]  
        **Adresse :** [Adresse complète], Gabon  
        **Contact :** privacy@immo-gabon.com  
        **Téléphone :** +241-XX-XX-XX-XX

        ### 2. Données collectées

        #### Données collectées automatiquement
        - Adresse IP
        - Type de navigateur et version
        - Pages visitées et durée de visite
        - Date et heure de connexion
        - Site référent

        #### Données fournies volontairement
        - Nom et prénom
        - Adresse email
        - Numéro de téléphone
        - Informations sur les biens ou services proposés

        ### 3. Finalités du traitement

        Nous utilisons vos données personnelles pour :
        - Assurer le fonctionnement du site
        - Publier et gérer les annonces
        - Permettre la mise en relation entre acheteurs et vendeurs
        - Améliorer nos services
        - Respecter nos obligations légales
        - Produire des statistiques d'audience anonymisées

        ### 4. Base légale

        Le traitement de vos données repose sur :
        - Votre consentement
        - L'exécution d'un contrat
        - L'intérêt légitime
        - Une obligation légale

        ### 5. Destinataires

        Vos données personnelles peuvent être communiquées à :
        - Notre équipe technique (accès limité)
        - Nos prestataires (hébergement, maintenance)
        - Les autorités compétentes sur demande légale

        Nous ne commercialisons pas vos données personnelles.

        ### 6. Transferts de données

        Certaines données peuvent être transférées vers des pays tiers (hébergement Streamlit aux États-Unis)
        avec des garanties appropriées.

        ### 7. Durée de conservation

        - Données de navigation : 13 mois maximum  
        - Données d'annonces : durée de publication + 1 an  
        - Données de contact : 3 ans après la dernière interaction  
        - Données analytics : 2 ans pour la facturation

        ### 8. Sécurité

        Nous mettons en œuvre des mesures techniques et organisationnelles adaptées pour protéger vos données.

        ### 9. Vos droits

        Vous disposez des droits d'accès, de rectification, d'effacement, d'opposition et de portabilité.
        Pour les exercer :
        - Email : privacy@immo-gabon.com
        - Courrier : [Adresse complète], Gabon
        - Téléphone : +241-XX-XX-XX-XX

        ### 10. Cookies

        - Cookies essentiels : nécessaires au fonctionnement du site  
        - Cookies analytiques : activés avec votre consentement  
        - Gestion : via les paramètres de votre navigateur

        ### 11. Modifications de la politique

        Cette politique peut être mise à jour. Les modifications importantes seront notifiées sur cette page.

        ### 12. Mineurs

        Le site ne s'adresse pas aux mineurs de moins de 16 ans. Nous ne collectons pas sciemment
        de données les concernant.

        ---

        **Dernière mise à jour :** {last_update}
        """.format(last_update=datetime.now().strftime("%d/%m/%Y"))
    )

    if st.button("Retour à l'accueil", use_container_width=True):
        st.session_state.page = "accueil"
        st.rerun()


if __name__ == "__main__":
    main()

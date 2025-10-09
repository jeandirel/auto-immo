"""
Mentions légales conformes à la législation gabonaise
Loi n°005/2025 sur le commerce et l'e-commerce
"""

from datetime import datetime

import streamlit as st


def main():
    """Page des mentions légales"""
    st.title("Mentions légales")

    st.markdown(
        """
        ## Informations légales

        Conformément à la loi n°005/2025 portant cadre du commerce au Gabon et à la loi n°025/2021
        sur les transactions électroniques, les présentes mentions ont pour objet d'informer les utilisateurs
        du site sur l'identité de l'éditeur et les conditions d'utilisation.

        ### 1. Éditeur du site

        **Nom de l'entreprise :** [À compléter]  
        **Forme juridique :** [À compléter]  
        **Adresse du siège social :** [À compléter], Gabon  
        **Téléphone :** +241-XX-XX-XX-XX  
        **Email :** contact@immo-gabon.com  
        **Numéro d'immatriculation :** [À compléter]  
        **Numéro de registre du commerce :** [À compléter]

        ### 2. Directeur de la publication

        **Nom :** [À compléter]  
        **Qualité :** Gérant

        ### 3. Hébergement

        **Hébergeur :** Streamlit Inc.  
        **Adresse :** 85 2nd Street, San Francisco, CA 94105, États-Unis  
        **Site web :** https://streamlit.io

        ### 4. Objet du site

        Le site « Immo Gabon » est une plateforme de petites annonces permettant la publication
        et la consultation d'annonces dans les domaines suivants :
        - Immobilier (vente et location)
        - Véhicules (vente et location)
        - Matériel informatique (vente)

        ### 5. Conditions d'utilisation

        L'utilisation du site implique l'acceptation pleine et entière des conditions générales
        d'utilisation décrites dans la section dédiée.

        ### 6. Responsabilité

        L'éditeur s'efforce d'assurer au mieux de ses possibilités l'exactitude et la mise à jour
        des informations diffusées sur ce site. Toutefois, il ne peut garantir l'exactitude,
        la précision ou l'exhaustivité des informations mises à disposition.

        L'éditeur ne saurait être tenu responsable des erreurs, d'une absence de disponibilité
        des informations et/ou de la présence de virus sur son site.

        ### 7. Propriété intellectuelle

        L'ensemble de ce site relève de la législation gabonaise et internationale sur le droit
        d'auteur et la propriété intellectuelle. Tous les droits de reproduction sont réservés.

        ### 8. Protection des données personnelles

        Conformément à la loi gabonaise sur la protection des données personnelles, les utilisateurs
        disposent d'un droit d'accès, de rectification et de suppression des données les concernant.
        Pour exercer ces droits, contactez-nous à : privacy@immo-gabon.com

        ### 9. Cookies

        Ce site utilise des cookies techniques nécessaires à son fonctionnement. Leur utilisation
        ne nécessite pas le consentement de l'utilisateur.

        ### 10. Droit applicable et juridiction

        Les présentes mentions légales sont soumises au droit gabonais. En cas de litige,
        les tribunaux gabonais seront seuls compétents.

        ### 11. Contact

        Pour toute question relative aux présentes mentions légales, vous pouvez nous contacter :
        - Par email : legal@immo-gabon.com
        - Par téléphone : +241-XX-XX-XX-XX
        - Par courrier : [Adresse complète], Gabon

        ---

        **Dernière mise à jour :** {last_update}
        """.format(last_update=datetime.now().strftime("%d/%m/%Y"))
    )

    if st.button("Retour à l'accueil", use_container_width=True):
        st.session_state.page = "accueil"
        st.rerun()


if __name__ == "__main__":
    main()

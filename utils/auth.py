"""
Système d'authentification pour l'application
Gestion des rôles admin et analyste
"""

import streamlit as st
import streamlit_authenticator as stauth
from typing import Dict, Optional
import yaml
from yaml.loader import SafeLoader

class AuthManager:
    def __init__(self):
        self.config = self._load_auth_config()
        self._ensure_session_state()
        self.authenticator = stauth.Authenticate(
            credentials=self.config['credentials'],
            cookie_name=self.config['cookie']['name'],
            cookie_key=self.config['cookie']['key'],
            cookie_expiry_days=self.config['cookie']['expiry_days']
        )

    def _ensure_session_state(self):
        defaults = {
            'authentication_status': None,
            'username': None,
            'name': None,
            'logout': False,
        }
        for cle, valeur in defaults.items():
            if cle not in st.session_state:
                st.session_state[cle] = valeur
    
    def _load_auth_config(self) -> Dict:
        """Charger la configuration d'authentification"""
        # Mots de passe par défaut : admin123 et analyste123
        # Générés avec bcrypt
        default_admin_hash = '$2b$12$QzrRGtUeGhI3NtWDuN48aOhbi5ty6PEXQ5nYbAnzZklr9ldDEabRS'
        default_analyste_hash = '$2b$12$0ov1KkZnhKifnWKqESsv0OzEopCk7CxqLQ/UDEZi.ykuGvFcMd7.C'

        # Configuration par défaut - à personnaliser selon les besoins
        config = {
            'credentials': {
                'usernames': {
                    'admin': {
                        'email': st.secrets.get('admin', {}).get('admin_email', 'admin@example.com'),
                        'name': 'Administrateur',
                        'password': default_admin_hash,  # Mot de passe: admin123
                        'role': 'admin'
                    },
                    'analyste': {
                        'email': 'analyste@example.com',
                        'name': 'Analyste',
                        'password': default_analyste_hash,  # Mot de passe: analyste123
                        'role': 'analyste'
                    }
                }
            },
            'cookie': {
                'name': st.secrets.get('auth', {}).get('cookie_name', 'immo_gabon_auth'),
                'key': st.secrets.get('auth', {}).get('cookie_key', 'random_signature_key_change_this'),
                'expiry_days': st.secrets.get('auth', {}).get('cookie_expiry_days', 30)
            }
        }
        return config
    
    def login_form(self) -> tuple[str, bool, str]:
        """Afficher le formulaire de connexion"""
        try:
            # Nouvelle API de streamlit-authenticator
            self.authenticator.login(location='sidebar')

            # Récupérer les informations depuis st.session_state
            name = st.session_state.get('name', None)
            authentication_status = st.session_state.get('authentication_status', None)
            username = st.session_state.get('username', None)

            return name, authentication_status, username

        except Exception as e:
            st.error(f"Erreur d'authentification: {e}")
            return None, False, None
    
    def logout(self):
        """Déconnecter l'utilisateur"""
        try:
            self.authenticator.logout(location='sidebar')
        except Exception as e:
            # Fallback: nettoyer manuellement la session
            for key in ['name', 'authentication_status', 'username']:
                if key in st.session_state:
                    del st.session_state[key]
            st.session_state['logout'] = False
    
    def is_authenticated(self) -> bool:
        """Vérifier si l'utilisateur est authentifié"""
        return st.session_state.get('authentication_status', False)
    
    def get_current_user(self) -> Optional[Dict]:
        """Obtenir les informations de l'utilisateur connecté"""
        if self.is_authenticated():
            username = st.session_state.get('username')
            if username and username in self.config['credentials']['usernames']:
                return self.config['credentials']['usernames'][username]
        return None
    
    def get_user_role(self) -> Optional[str]:
        """Obtenir le rôle de l'utilisateur connecté"""
        user = self.get_current_user()
        return user.get('role') if user else None
    
    def is_admin(self) -> bool:
        """Vérifier si l'utilisateur est administrateur"""
        return self.get_user_role() == 'admin'
    
    def is_analyst(self) -> bool:
        """Vérifier si l'utilisateur est analyste"""
        return self.get_user_role() == 'analyste'
    
    def require_auth(self, required_role: str = None):
        """Décorateur pour protéger les pages"""
        if not self.is_authenticated():
            st.error("🔒 Vous devez vous connecter pour accéder à cette page.")
            st.stop()
        
        if required_role:
            user_role = self.get_user_role()
            if user_role != required_role and user_role != 'admin':  # Admin a accès à tout
                st.error(f"🚫 Accès refusé. Rôle requis: {required_role}")
                st.stop()
    
    def create_user_hash(self, password: str) -> str:
        """Créer un hash de mot de passe"""
        return stauth.Hasher([password]).generate()[0]

# Instance globale du gestionnaire d'authentification
auth_manager = AuthManager()

def require_admin():
    """Décorateur pour les pages admin uniquement"""
    auth_manager.require_auth('admin')

def require_analyst():
    """Décorateur pour les pages analyste (ou admin)"""
    if not auth_manager.is_authenticated():
        st.error("🔒 Vous devez vous connecter pour accéder à cette page.")
        st.stop()
    
    if not (auth_manager.is_admin() or auth_manager.is_analyst()):
        st.error("🚫 Accès refusé. Rôle analyste ou administrateur requis.")
        st.stop()

def get_current_user_info():
    """Obtenir les informations de l'utilisateur connecté"""
    return auth_manager.get_current_user()

def show_user_info():
    """Afficher les informations de l'utilisateur dans la sidebar"""
    if auth_manager.is_authenticated():
        user = auth_manager.get_current_user()
        if user:
            st.sidebar.success(f"👤 Connecté: {user['name']}")
            st.sidebar.info(f"🎭 Rôle: {user['role'].title()}")
            
            # Bouton de déconnexion
            if st.sidebar.button("🚪 Se déconnecter"):
                auth_manager.logout()
                st.rerun()



"""
Gestion des comptes utilisateurs publics (inscription, authentification).
"""

from typing import Optional, Tuple, Dict

import bcrypt

from models.database import Database


def _hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def _check_password(password: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))
    except ValueError:
        return False


def register_user(name: str, email: str, password: str) -> Tuple[bool, str]:
    name = (name or "").strip()
    email = (email or "").strip().lower()

    if not name or not email or not password:
        return False, "Veuillez renseigner nom, email et mot de passe."

    if "@" not in email or "." not in email.split("@")[-1]:
        return False, "Adresse email invalide."

    if len(password) < 6:
        return False, "Le mot de passe doit contenir au moins 6 caractères."

    db = Database()
    if db.obtenir_utilisateur_public_par_email(email):
        return False, "Un compte existe déjà avec cet email."

    hashed = _hash_password(password)
    db.creer_utilisateur_public(name, email, hashed)
    return True, "Compte créé avec succès."


def authenticate_user(email: str, password: str) -> Tuple[bool, Optional[Dict], str]:
    email = (email or "").strip().lower()
    password = password or ""

    if not email or not password:
        return False, None, "Veuillez saisir vos identifiants."

    db = Database()
    utilisateur = db.obtenir_utilisateur_public_par_email(email)

    if not utilisateur:
        return False, None, "Compte introuvable."

    if not _check_password(password, utilisateur["mot_de_passe_hash"]):
        return False, None, "Mot de passe incorrect."

    return True, utilisateur, "Connexion réussie."

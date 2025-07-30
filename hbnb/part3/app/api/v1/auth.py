from flask_restx import Namespace, Resource, fields
from flask import jsonify
from flask_jwt_extended import (create_access_token, set_access_cookies, unset_jwt_cookies, jwt_required, get_jwt_identity)
from app.services.facade import HBnBFacade
from flask import Blueprint, jsonify, render_template # Import pour les routes web
from flask import current_app as app  # importe l'instance Flask courante

# Création d’un namespace RESTX pour organiser les routes liées à l’authentification
api = Namespace('auth', description='Auth operations')

# Définition du modèle de données attendu pour la connexion (email+password)
login_model = api.model('Login', {
    'email': fields.String(required=True, description="User email"),
    'password': fields.String(required=True, description="User password")
})

# Modèle possible pour les erreurs retournées (affiliation pour Swagger/docs)
error_model = api.model('Error', {
    'error': fields.String()
})

# Création de Blueprints pour les routes d'authentification et web
auth_bp = Blueprint('auth', __name__)
web_bp = Blueprint('web', __name__)

# Route POST pour /auth/login pour effectuer la connexion
@api.route('/login', '/login/')
class Login(Resource):
    @api.expect(login_model, validate=True)            # Attend un JSON valide selon login_model
    @api.response(200, 'Success')                      # Réponses documentées
    @api.response(400, 'Email and password required', error_model)
    @api.response(401, 'Invalid credentials', error_model)
    def post(self):
        data = api.payload                             # Récupère le JSON envoyé (email, password)
        email = data.get('email')
        password = data.get('password')

        # Vérifie que les deux champs sont fournis
        if not email or not password:
            return {'error': 'Email and password are required'}, 400

        # Récupère l’utilisateur de la base par email (ta fonction métier)
        user = HBnBFacade().get_user_by_email(email)
        # Vérifie que l’utilisateur existe et que le mot de passe est correct
        if not user or not user.check_password(password):
            api.abort(401, "Invalid credentials")

        # Génère un token JWT avec l'identité utilisateur (ici son ID converti en chaîne)
        access_token = create_access_token(identity=str(user.id))

        # simple réponse JSON pour confirmer la connexion
        resp = jsonify({'login': True})

        # Ajoute dans la réponse un cookie HttpOnly avec le token JWT (accessible uniquement serveur)
        set_access_cookies(resp, access_token)

        # Retourne la réponse (200 OK par défaut)
        return resp

# Route POST pour /auth/logout pour déconnecter l'utilisateur
@api.route('/logout', '/logout/')
class Logout(Resource):
    def post(self):
        # Création d’une réponse que l’on envoie au client
        resp = jsonify({'logout': True})

        # Supprime les cookies JWT côté client via la réponse (emplacement serveur)
        unset_jwt_cookies(resp)

        # Renvoie la réponse
        return resp

# Route GET pour /auth/status afin de vérifier si l'utilisateur est connecté via JWT
@api.route('/status', '/status/', '/auth/status', '/auth/status/')
class Status(Resource):
    @jwt_required(locations=["cookies"])  # Cette route ne répond que si token JWT valide est présent (dans cookie)
    def get(self):
        # Récupère l'identité de l'utilisateur du token (ex: user.id)
        current_user = get_jwt_identity()
        app.logger.info(f"User ID from JWT: {current_user}")   # Log de debug
        if current_user:
        # Renvoie la réponse JSON confirmant l'utilisateur connecté
            return jsonify({'logged_in_as': current_user})
        else:
            return jsonify({'logged_in_as': None}), 401
        
web_bp = Blueprint('web', __name__) # Blueprint pour les routes web

@web_bp.route('/login', methods=['GET'])
def login_form():
    # Affiche la page de login HTML !
    return render_template('login.html')

@web_bp.route('/auth-home') # page d'acceuil
def auth_home():
    return render_template('auth_home.html')  # ou une autre page spécifique à l'authent

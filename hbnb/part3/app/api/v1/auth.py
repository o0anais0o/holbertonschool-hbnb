from flask_restx import Namespace, Resource, fields
from flask import jsonify
from flask_jwt_extended import (create_access_token, set_access_cookies, unset_jwt_cookies, jwt_required, get_jwt_identity)
from app.services.facade import HBnBFacade
from flask import Blueprint, jsonify, render_template, request # Import pour les routes web
from werkzeug.security import check_password_hash
from app.models.user import User

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

auth_bp = Blueprint('auth', __name__)

# Exemple simple de stockage en "mémoire" (à remplacer par ta base de données réelle)
# Ici on suppose que User.query.filter_by(email=...) retourne un user avec pwd hashé

@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Reçoit JSON avec email et password,
    vérifie les identifiants, crée un token (JWT ou session),
    renvoie un cookie ou réponse json.
    """

    data = request.get_json()
    if not data or 'email' not in data or 'password' not in data:
        return jsonify({"error": "email and password required"}), 400

    email = data['email']
    password = data['password']

    user = User.query.filter_by(email=email).first()

    if user is None:
        return jsonify({"error": "Invalid credentials"}), 401

    if not check_password_hash(user.password_hash, password):
        return jsonify({"error": "Invalid credentials"}), 401

    # Ici tu peux créer un token JWT (par ex) :
    access_token = create_access_token(identity=user.id)

    response = jsonify({"message": "login successful"})
    # Exemple : stocke le token dans un cookie HttpOnly
    response.set_cookie('access_token', access_token, httponly=True, samesite='Lax')

    return response, 200

@auth_bp.route('/logout', methods=['POST'])
def logout():
    """
    Déconnecte l'utilisateur en supprimant le cookie ou token côté client.
    """
    response = jsonify({"message": "logout successful"})
    # Supprime le cookie
    response.delete_cookie('access_token')
    return response, 200

@auth_bp.route('/status', methods=['GET'])
@jwt_required()
def status():
    current_user_id = get_jwt_identity()
    if not current_user_id:
        return jsonify({"authenticated": False}), 401

    user = User.query.get(current_user_id)
    if not user:
        return jsonify({"authenticated": False}), 401

    return jsonify({
        "authenticated": True,
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.name
        }
    }), 200

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

        # Prépare la réponse JSON à envoyer au client (le corps)
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
@api.route('/status', '/status/')
class Status(Resource):
    @jwt_required(locations=["cookies"])  # Cette route ne répond que si token JWT valide est présent (dans cookie)
    def get(self):
        # Récupère l'identité de l'utilisateur du token (ex: user.id)
        current_user = get_jwt_identity()

        # Renvoie la réponse JSON confirmant l'utilisateur connecté
        return jsonify({'logged_in_as': current_user})

web_bp = Blueprint('web', __name__) # Blueprint pour les routes web

@web_bp.route('/login', methods=['GET'])
def login_form():
    # Affiche la page de login HTML !
    return render_template('login.html')

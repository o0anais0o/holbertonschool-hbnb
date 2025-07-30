# Ce que fait ce fichier (respecter cette ordre):
# 1.Créer l’app
# 2.Configurer l’app (+ extensions)
# 3.Créer l’API Flask-RESTx avec Api(app)
# 4.Ajouter les namespaces
# 5.Enregistrer les blueprints (routes classiques)
# 6.Retourner l’app
import os
from flask import Flask
from flask_cors import CORS
from app.extensions import db, jwt
from flask_restx import Api
from flask_jwt_extended import JWTManager

jwt = JWTManager()

basedir = os.path.abspath(os.path.dirname(__file__))
# Passe un chemin absolu vers hbnb/part4/templates
template_dir = os.path.abspath(os.path.join(basedir, '../../part4/templates'))
# Chemin absolu vers part3/static (backend), où tu as tes images par ex.
static_dir = os.path.abspath(os.path.join(basedir, '../../part4/static'))
# Import du blueprint défini avec ses routes dans views.py

from app.api.v1.auth import api as auth_ns
from app.api.v1.users import api as users_ns
from app.api.v1.places import api as places_ns
from app.api.v1.amenities import api as amenities_ns
from app.api.v1.reviews import api as reviews_ns

def create_app(config_name='default'):
    print("Template dir:", template_dir)
    print("Does template dir exist?", os.path.exists(template_dir))
    print("Does index.html exist?", os.path.exists(os.path.join(template_dir, 'index.html')))
    
    # Création de l'app Flask avec dossier templates ET static personnalisés
    app = Flask(__name__, template_folder=template_dir, static_folder=static_dir)
    
    # Charger la config (ex : JWT_SECRET_KEY, DB URI, etc.)
    from config import config
    app.config.from_object(config[config_name])
   
    # CORS global, avec support des credentials (cookies, auth) et autorisation exacte de l'origine frontend http://localhost:8000
    CORS(app, supports_credentials=True, origins=["http://localhost:8000", "http://127.0.0.1:8000"])
    app.config['JWT_SECRET_KEY'] = 'secret_key' # Clé secrète pour signer les tokens, à changer en production
    app.config['JWT_TOKEN_LOCATION'] = ['cookies'] # Configure les emplacements où JWT sera cherché (ici uniquement dans les cookies)
    app.config['JWT_COOKIE_SECURE'] = False  # True si https obligatoire ; False pour dev local
    app.config['JWT_ACCESS_COOKIE_PATH'] = '/' # Configure le chemin pour cookie d’access token (optionnel)
    app.config['JWT_REFRESH_COOKIE_PATH'] = '/' # Pour pouvoir envoyer cookie cross-origin
    app.config['JWT_COOKIE_CSRF_PROTECT'] = False  # désactive CSRF pour debugger (sinon config CSRF)
    # app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///hbnb.db' # ligne a suprimer après test
    # app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False # ligne a suprimer après test
    # Initialisation des extensions Flask
    
    db.init_app(app)
    jwt.init_app(app)          # lien avec l'app Flask
    
    # Gestion explicite des requêtes OPTIONS (préflight)
    @app.before_request
    def handle_options():
        from flask import request, jsonify
        if request.method == "OPTIONS":
            response = jsonify({})
            response.status_code = 200
            response.headers.add("Access-Control-Allow-Origin", "http://localhost:8000")
            response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
            response.headers.add("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
            response.headers.add("Access-Control-Allow-Credentials", "true")
            return response
    authorizations = {
        'Bearer Auth': {
            'type': 'apiKey',
            'in': 'header',
            'name': 'Authorization',
            'description': "JWT Authorization header using Bearer scheme. Example: 'Authorization: Bearer {token}'"
        }
    }
    
    # Importer le blueprint web_bp depuis views.py
    from app.views import web_bp, auth_bp
    # Enregistrement des blueprints Flask classiques
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(web_bp)  # tes pages classiques (routes HTML)
    print("Blueprint web_bp enregistré")
    with app.app_context():
        print("Routes enregistrées :", [(rule.rule, rule.endpoint) for rule in app.url_map.iter_rules()])
    # Création d'une unique instance Api flask_restx
    api_restx = Api(
    app,
    version='1.0',
    title='HBNB API',
    description='API HBNB',
    doc='/api/v1/',  # Documentation accessible à /api/v1/
    authorizations=authorizations,
    security='Bearer Auth',
    catch_all_404s=False  # Empêche Flask-RESTx de capturer toutes les 404
)
    # Ajout des namespaces API uniquement (pas de blueprint ici)
    api_restx.add_namespace(auth_ns, path='/api/v1/auth')
    api_restx.add_namespace(users_ns, path='/api/v1/users')
    api_restx.add_namespace(places_ns, path='/api/v1/places')
    api_restx.add_namespace(reviews_ns, path='/api/v1/reviews')
    api_restx.add_namespace(amenities_ns, path='/api/v1/amenities')
    return app

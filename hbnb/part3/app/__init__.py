import os
from flask_cors import CORS
from flask_restx import Api
from flask import Flask, jsonify
from flask_jwt_extended import JWTManager
from app.extensions import db, jwt

def create_app(config_name='default'):
    basedir = os.path.abspath(os.path.dirname(__file__))
    # Passe un chemin absolu vers hbnb/part4/templates
    template_dir = os.path.abspath(os.path.join(basedir, '../../part4/templates'))

    app = Flask(__name__, template_folder=template_dir)

    # Charger la config (ex : JWT_SECRET_KEY, DB URI, etc.)
    from config import config
    app.config.from_object(config[config_name])

    # Initialisation des extensions Flask
    db.init_app(app)
    jwt.init_app(app)          # lien avec l'app Flask
    jwt = JWTManager()         # création de l'instance JWTManager

    # CORS global, avec support des credentials (cookies, auth) et autorisation exacte de l'origine frontend http://localhost:8000
    CORS(app, supports_credentials=True, origins=["http://localhost:8000", "http://127.0.0.1:8000"])
    
    # Import du Blueprint pour les routes web
    from app.api.v1.auth import auth_ns, auth_bp, web_bp 

    app.config['JWT_SECRET_KEY'] = '...secret...'
    app.config['JWT_TOKEN_LOCATION'] = ['cookies']
    app.config['JWT_COOKIE_SECURE'] = False  # True si https obligatoire ; False pour dev local
    app.config['JWT_ACCESS_COOKIE_PATH'] = '/'
    app.config['JWT_REFRESH_COOKIE_PATH'] = '/'
    # Pour pouvoir envoyer cookie cross-origin
    app.config['JWT_COOKIE_CSRF_PROTECT'] = False  # désactive CSRF pour debugger (sinon config CSRF)
    # app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///hbnb.db' # ligne a suprimer après test
    # app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False # ligne a suprimer après test

    app.register_blueprint(auth_bp, url_prefix='/api/v1/auth') # Enregistre tes blueprints dans l'app Flask
    app.register_blueprint(web_bp) # Enregistrement du Blueprint pour les routes web

    # Gestion explicite des requêtes OPTIONS (préflight)
    @app.before_request
    def handle_options():
        from flask import request
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
    
    # Définition de la route racine
    @app.route('/')   
    def accueil():
        return '<h1>Holberton HBNB API</h1>'
    
    api = Api(
        app,
        version='1.0',
        title='HBNB API',
        description='API HBNB',
        doc='/api/v1/',
        authorizations=authorizations,
        security='Bearer Auth'
    )

    from app.api.v1.users import api as users_ns
    from app.api.v1.places import api as places_ns
    from app.api.v1.amenities import api as amenities_ns
    from app.api.v1.reviews import api as reviews_ns
    from app.api.v1.auth import auth_ns, auth_bp, web_bp

    api.add_namespace(users_ns, path='/api/v1/users')
    api.add_namespace(places_ns, path='/api/v1/places')
    api.add_namespace(amenities_ns, path='/api/v1/amenities')
    api.add_namespace(reviews_ns, path='/api/v1/reviews')
    api.add_namespace(auth_ns, path='/api/v1/auth')

    return app

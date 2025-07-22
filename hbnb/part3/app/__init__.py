from flask_restx import Api
from flask import Flask, jsonify
from flask_cors import CORS
from app.extensions import db, jwt

def create_app(config_name='default'):
    from config import config

    app = Flask(__name__)
    app.config.from_object(config[config_name])
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///hbnb.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    db.init_app(app)
    jwt.init_app(app)

    # CORS global, avec support des credentials (cookies, auth)
    # et autorisation exacte de l'origine frontend http://localhost:8000
    CORS(app, resources={r"/api/*": {"origins": "http://localhost:8000"}}, supports_credentials=True)

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
    from app.api.v1.auth import api as auth_ns

    api.add_namespace(users_ns, path='/api/v1/users')
    api.add_namespace(places_ns, path='/api/v1/places')
    api.add_namespace(amenities_ns, path='/api/v1/amenities')
    api.add_namespace(reviews_ns, path='/api/v1/reviews')
    api.add_namespace(auth_ns, path='/api/v1/auth')

    return app

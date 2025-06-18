from flask import Flask
from flask_restx import Api
from api.v1.amenities import amenity_ns

def create_app():
    app = Flask(__name__)

    api = Api(app, version='1.0', title='HBnB API', description='HBnB Application API', doc='/api/v1/')


    # Placeholder for API namespaces (endpoints will be added later)
    # Additional namespaces for places, reviews, and amenities will be added later

    api.add_namespace(amenity_ns, path='/api/v1/amenities')

    return app

from flask_restx import Namespace, Resource, fields
from flask import jsonify
from flask_jwt_extended import create_access_token, set_access_cookies, unset_jwt_cookies
from app.services.facade import HBnBFacade

api = Namespace('auth', description='Auth operations')

login_model = api.model('Login', {
    'email': fields.String(required=True, description="User email"),
    'password': fields.String(required=True, description="User password")
})

error_model = api.model('Error', {
    'error': fields.String()
})

@api.route('/login', '/login/')
class Login(Resource):
    @api.expect(login_model, validate=True)
    @api.response(200, 'Success')
    @api.response(400, 'Email and password required', error_model)
    @api.response(401, 'Invalid credentials', error_model)
    def post(self):
        data = api.payload
        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            return {'error': 'Email and password are required'}, 400

        user = HBnBFacade().get_user_by_email(email)
        if not user or not user.check_password(password):
            api.abort(401, "Invalid credentials")

        # Crée le token d'accès JWT
        access_token = create_access_token(identity=str(user.id))

        # Prépare la réponse JSON simple
        resp = jsonify({'login': True})

        # Ajoute le token dans un cookie HttpOnly sécurisé
        set_access_cookies(resp, access_token)

        return resp # <-- ne pas faire (resp, 200)
    
    @api.route('/logout')
    class Logout(Resource):
        def post(self):
            resp = jsonify({'logout': True})
            unset_jwt_cookies(resp)
            return resp  # <<< retourne uniquement Response, pas (resp, 200)

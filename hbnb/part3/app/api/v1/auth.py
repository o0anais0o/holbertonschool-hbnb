from flask_restx import Namespace, Resource, fields
from flask import jsonify
from flask_jwt_extended import create_access_token, set_access_cookies, unset_jwt_cookies, jwt_required, get_jwt_identity
from app.services.facade import HBnBFacade

# Namespace RESTX pour API Auth
api = Namespace('auth', description='Auth operations')

login_model = api.model('Login', {
    'email': fields.String(required=True, description="User email"),
    'password': fields.String(required=True, description="User password")
})

error_model = api.model('Error', {
    'error': fields.String()
})

# ROUTES API REST
@api.route('/login')
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

        access_token = create_access_token(identity=str(user.id))
        resp = jsonify({'login': True})
        set_access_cookies(resp, access_token)
        return resp

@api.route('/logout')
class Logout(Resource):
    def post(self):
        resp = jsonify({'logout': True})
        unset_jwt_cookies(resp)
        return resp

@api.route('/status')
class Status(Resource):
    @jwt_required(locations=["cookies"])
    def get(self):
        current_user = get_jwt_identity()
        if current_user:
            return jsonify({'logged_in_as': current_user})
        else:
            return jsonify({'logged_in_as': None}), 401

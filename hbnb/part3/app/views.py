from flask import Blueprint, render_template

# Blueprint pour routes web (pages HTML)
web_bp = Blueprint('web', __name__)


@web_bp.route('/')
def index():
    places = [
        {'id': 1, 'name': "Appartement Moderne", 'price': 120, 'rating': 4.85, 'image': 'place1.jpg'},
        {'id': 2, 'name': "Loft Cosy en Centre-ville", 'price': 150, 'rating': 4.92, 'image': 'place2.jpg'},
        {'id': 3, 'name': "Maison de Campagne", 'price': 200, 'rating': 4.75, 'image': 'place3.jpg'},
        {'id': 4, 'name': "Chalet Montagne", 'price': 180, 'rating': 4.80, 'image': 'place4.jpg'},
        {'id': 5, 'name': "Studio Contemporain", 'price': 100, 'rating': 4.60, 'image': 'place5.jpg'},
        {'id': 6, 'name': "Villa Luxueuse", 'price': 350, 'rating': 4.95, 'image': 'place6.jpg'},
        {'id': 7, 'name': "Appartement avec Vue Mer", 'price': 220, 'rating': 4.88, 'image': 'place7.jpg'}
    ]
    return render_template('index.html', places=places)

@web_bp.route('/auth-home')
def auth_home():
    return render_template('auth_home.html')

# Création de Blueprints pour les routes d'authentification et web
auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['GET'])
def login_page():
    return render_template('login.html')

@web_bp.route('/place.html')
def place_detail():
    return render_template('place.html')


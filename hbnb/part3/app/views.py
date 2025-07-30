from flask import Blueprint, render_template

web_bp = Blueprint('web', __name__)

@web_bp.route('/')
def index():
    return "<h1>Test simple : la route racine fonctionne !</h1>"



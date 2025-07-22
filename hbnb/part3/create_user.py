from app import create_app, db
from app.models.user import User

""" 
Script Python pour créer un utilisateur minimal la base (prénom/nom - email/password).
Initialisation app + base.
Création d’un utilisateur avec les 4 champs nécessaires.
"""

def create_user(email, password, first_name='Test', last_name='User', is_admin=False):
    app = create_app()
    with app.app_context():
        db.create_all()  # crée les tables si besoin

        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            print(f"L'utilisateur {email} existe déjà.")
            return
        
        user = User(
            email=email,
            first_name=first_name,
            last_name=last_name,
            is_admin=is_admin
        )
        user.set_password(password)
        db.session.add(user)
        db.session.commit()
        print(f"Utilisateur {email} créé avec succès.")

if __name__ == '__main__':
    # Change ici les valeurs comme tu veux
    create_user('ana@example.com', '123456', 'Ana', 'Isou')

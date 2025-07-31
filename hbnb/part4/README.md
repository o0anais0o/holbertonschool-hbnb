# 🏠 HBnB - Simple Web Client

Quatrieme partie du projet ""HBnB"", application web inspirée d'Airbnb.

## 🧩 Objectifs principaux

## 1.Design
- Créer des pages pour la connexion, la liste des lieux, les détails du lieu et l'ajout d'un avis.

## 2.Login
- Mettre en œuvre la fonctionnalité de connexion à l'aide de l'API back-end.
- Enregistrer le jeton JWT renvoyé par l'API dans un cookie pour la gestion des sessions.
Authentification de connexion :
Identifiant test : ana@example.com 
Mot de passe test : 123456

## 3.Index (en cours)
- Mettre en œuvre la page principale pour afficher la liste de tous les lieux.
- Récupérer les données des lieux depuis l'API et implémenter un filtrage côté client basé sur la sélection du pays.
- S'assurer que la page redirige vers la page de connexion si l'utilisateur n'est pas authentifié.

## 4.Place details (non réalisé)
- Mettre en œuvre la vue détaillée d'un lieu.
- Récupérer les détails du lieu depuis l'API à l'aide de l'ID du lieu.
- Fournir l'accès au formulaire d'ajout d'avis si l'utilisateur est authentifié.

## 5.Add reviews (non réalisé)
- Mettre en œuvre le formulaire pour ajouter un avis sur un lieu.
- S'assurer que le formulaire est accessible uniquement aux utilisateurs authentifiés, en redirigeant les autres vers la page d'index.

## 🗃️ Structure du Projet
```
holbertonschool-hbnb/hbnb/part4
├── README.md
├── static
│   ├── images
│   │   ├── icones
│   │   │   ├── icon.png
│   │   │   ├── icon_bath.png
│   │   │   ├── icon_bed.png
│   │   │   └── icon_wifi.png
│   │   ├── logo
│   │   │   └── HBTN-hbnb-Final.png
│   │   │   
│   │   └── places
│   │       ├── place1.jpg
│   │       ├── place2.jpg
│   │       ├── place3.jpg
│   │       ├── place4.jpg
│   │       ├── place5.jpg
│   │       ├── place6.jpg
│   │       └── place7.jpg
│   ├── scripts.js
│   └── styles.css
└── templates
    ├── add_review.html
    ├── index.html
    ├── login.html
    └── place.html
```

## ⚙️ Technologies Utilisées
- Python 3.x
- Flask (micro-framework web)
- Jinja2 (moteur de template)
- HTML, CSS
- SQLAlchemy (ORM pour la gestion base de données)

## 🚀 Lancer l’application
```
# 1. Cloner le dépôt

# 2. Ce placer dans le dossier
/holbertonschool-hbnb/hbnb/part3

# 3. Créer l'environnement virtuel 
python3 -m venv venv

# 4. Activer l'environnement virtuel 
source venv/bin/activate

# 5. Installer les dépendances
pip install -r requirements.txt

# 6. Lancer le serveur
python3 run.py

# 7. Ouvrir dans un navigateur à l’adresse
http://localhost:5000
```
## ✍️ Auteurs :
[Choisy Anaïs](https://github.com/o0anais0o)
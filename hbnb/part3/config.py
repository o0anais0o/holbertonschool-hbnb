class Config:
    SECRET_KEY =  'ma_cle_secrete_flask_2025'       # clé Flask (session, CSRF)
    SQLALCHEMY_DATABASE_URI = 'sqlite:///hbnb.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = 'ma_cle_jwt_secrete_2025'      # clé JWT spécifique
    JWT_TOKEN_LOCATION = ['cookies']                # Token JWT stocké dans les cookies
    JWT_COOKIE_SECURE = False                       # Pas de HTTPS en dev
    JWT_COOKIE_CSRF_PROTECT = False                 # CSRF désactivé pour test, puis a activer plus tard
    JWT_ACCESS_COOKIE_PATH = '/'

class DevelopmentConfig(Config):
    DEBUG = True


class ProductionConfig(Config):
    DEBUG = False
    # Exemple : pour déployer sur Postgres
    # SQLALCHEMY_DATABASE_URI = 'postgresql://user:pwd@host/db'


class TestingConfig(Config):
    TESTING = True
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'  # DB en RAM pour tests
    WTF_CSRF_ENABLED = False


# Unique définition du mapping de configuration
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}

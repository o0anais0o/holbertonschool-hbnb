class Config:
    SECRET_KEY = 'dev'  # À sécuriser en prod
    SQLALCHEMY_DATABASE_URI = 'sqlite:///hbnb.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = 'jwt-secret'       #  clé secrète là où elle est déjà
    JWT_TOKEN_LOCATION = ['cookies']    # Token JWT stocké dans les cookies
    JWT_COOKIE_SECURE = False           # False car dev sans HTTPS
    JWT_COOKIE_CSRF_PROTECT = False     # Désactive CSRF pour commencer, puis a activer plus tard

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

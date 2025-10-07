import os

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'clave-secreta-desarrollo')
    SQLALCHEMY_DATABASE_URI = os.getenv(
        'DATABASE_URL',
        'mysql+pymysql://root:admin@192.168.254.158/control_vehicular1'
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Correo
    MAIL_SERVER = 'smtp.gmail.com'
    MAIL_PORT = 587
    MAIL_USE_TLS = True
    MAIL_USERNAME = os.getenv('MAIL_USER')
    MAIL_PASSWORD = os.getenv('MAIL_APP_PASS')

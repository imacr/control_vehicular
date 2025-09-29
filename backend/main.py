import os
import secrets
from datetime import datetime, timedelta
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from flask_mail import Mail, Message
from dotenv import load_dotenv




# Carga las variables de entorno desde un archivo .env para mayor seguridad
load_dotenv()

# --- 1. CONFIGURACIÓN E INICIALIZACIÓN DE LA APP ---
app = Flask(__name__)

# Configuración de CORS para permitir peticiones desde tu frontend (Vite en puerto 5173 por defecto)
# La URL del frontend se lee desde el archivo .env para flexibilidad
CORS(app, supports_credentials=True, resources={r"/*": {"origins": "http://192.168.254.158:5173"}})

# Configuración segura usando variables de entorno
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'una-clave-secreta-para-desarrollo')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'mysql+pymysql://root:admin@localhost/control_vehicular1')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Configuración de Flask-Mail para enviar correos con Gmail
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USER')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_APP_PASS')

# Inicialización de las extensiones de Flask
db = SQLAlchemy(app)
mail = Mail(app)

# --- 2. DEFINICIÓN DEL MODELO DE LA BASE DE DATOS (ORM) ---
# Esta clase debe coincidir con la estructura de tu tabla 'Usuarios' ya existente
class Usuarios(db.Model):
    __tablename__ = 'Usuarios'
    id_usuario = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(255), nullable=False)
    usuario = db.Column(db.String(50), unique=True, nullable=False)
    contraseña = db.Column(db.String(255), nullable=False)
    correo = db.Column(db.String(255), unique=True, nullable=False)
    rol = db.Column(db.String(50), nullable=False, default='usuario')
    fecha_registro = db.Column(db.TIMESTAMP, default=datetime.utcnow)
    fecha_ultimo_login = db.Column(db.TIMESTAMP, nullable=True)
    estado = db.Column(db.Enum('activo', 'inactivo'), default='activo')
    token_recuperacion = db.Column(db.String(255), nullable=True)
    token_expiracion = db.Column(db.TIMESTAMP, nullable=True)

def get_db_connection():
    # Devuelve la conexión cruda para ejecutar SQL directo
    return db.engine.raw_connection()

# --- 3. RUTAS DE LA API ---

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    app.logger.info(f"Intento de inicio de sesión para el usuario: {username}")

    if not username or not password:
        app.logger.warning("No se proporcionó usuario o contraseña.")
        return jsonify({"error": "Usuario y contraseña son requeridos"}), 400

    user = Usuarios.query.filter_by(usuario=username, estado='activo').first()

    if user:
        app.logger.info(f"Usuario encontrado: {user.usuario}, contraseña almacenada: {user.contraseña}")
        if check_password_hash(user.contraseña, password):
            user.fecha_ultimo_login = datetime.utcnow()
            db.session.commit()
            return jsonify({
                "message": "Inicio de sesión exitoso",
                "user": {"id": user.id_usuario, "username": user.usuario, "nombre": user.nombre, "rol": user.rol}
            }), 200
        else:
            app.logger.warning("Contraseña inválida proporcionada.")
    else:
        app.logger.info("Usuario no encontrado o inactivo.")

    return jsonify({"error": "Credenciales inválidas o usuario inactivo"}), 401

@app.route('/request-reset', methods=['POST'])
def request_password_reset():
    """Maneja la solicitud de recuperación de contraseña."""
    data = request.get_json()
    email = data.get('email')

    if not email:
        return jsonify({"error": "Correo electrónico requerido"}), 400

    user = Usuarios.query.filter_by(correo=email).first()
    if user:
        # Generar el token de recuperación
        token = secrets.token_urlsafe(32)
        user.token_recuperacion = token
        user.token_expiracion = datetime.utcnow() + timedelta(hours=1)
        db.session.commit()

        try:
            # Crear el enlace de restablecimiento
            reset_link = f"{os.getenv('FRONTEND_URL', 'http://localhost:5173')}/reset-password/{token}"
            msg = Message('Restablecimiento de Contraseña',
                          sender=app.config['MAIL_USERNAME'],
                          recipients=[email])
            msg.html = f"<p>Para restablecer tu contraseña, haz clic en el siguiente enlace: <a href='{reset_link}'>Restablecer Contraseña</a>. El enlace expira en 1 hora.</p>"
            mail.send(msg)
        except Exception as e:
            app.logger.error(f"Error al enviar correo de recuperación: {e}")
            return jsonify({"error": "Error al enviar el correo de recuperación."}), 500

    return jsonify({"message": "Si tu correo está registrado, recibirás un enlace."}), 200


@app.route('/reset-password/<string:token>', methods=['POST'])
def reset_password(token):
    """Maneja el cambio de contraseña a través del token."""
    data = request.get_json()
    password = data.get('password')

    if not password:
        return jsonify({"error": "La nueva contraseña es requerida"}), 400

    user = Usuarios.query.filter_by(token_recuperacion=token).filter(Usuarios.token_expiracion > datetime.utcnow()).first()

    if not user:
        return jsonify({"error": "El token es inválido o ha expirado."}), 400

    user.contraseña = generate_password_hash(password)
    user.token_recuperacion = None
    user.token_expiracion = None
    db.session.commit()

    return jsonify({"message": "Contraseña actualizada con éxito"}), 200

@app.route('/api/unidades', methods=['GET'])
def get_unidades_data():
    conn = db.engine.raw_connection()
    try:
        cursor = conn.cursor()
        query = """
        SELECT
            U.id_unidad, U.marca, U.vehiculo, U.modelo, U.color, U.sucursal, U.compra_arrendado, U.niv,
            P.placa, P.fecha_vigencia AS placa_vigencia,
            G.no_poliza, G.vigencia AS garantia_vigencia, G.aseguradora,
            C.nombre AS chofer_asignado
        FROM Unidades U
        LEFT JOIN Placas P ON U.id_unidad = P.id_unidad
        LEFT JOIN Garantias G ON U.id_unidad = G.id_unidad
        LEFT JOIN Asignaciones A ON U.id_unidad = A.id_unidad AND A.fecha_fin IS NULL
        LEFT JOIN Choferes C ON A.id_chofer = C.id_chofer
        ORDER BY U.id_unidad;
        """
        cursor.execute(query)
        columns = [col[0] for col in cursor.description]
        results = [dict(zip(columns, row)) for row in cursor.fetchall()]

        # Formatear fechas
        for unidad in results:
            if unidad['placa_vigencia']:
                unidad['placa_vigencia'] = unidad['placa_vigencia'].strftime('%Y-%m-%d')
            if unidad['garantia_vigencia']:
                unidad['garantia_vigencia'] = unidad['garantia_vigencia'].strftime('%Y-%m-%d')

        return jsonify(results), 200
    except Exception as e:
        print(f"Error al ejecutar la consulta: {e}")
        return jsonify({"error": "Error al obtener los datos de unidades"}), 500
    finally:
        cursor.close()
        conn.close()


if __name__ == '__main__':

    app.run(host='0.0.0.0', port=5000, debug=True)
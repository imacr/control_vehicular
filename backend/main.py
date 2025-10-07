import os
import secrets
from datetime import datetime, timedelta
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from flask_mail import Mail, Message
from dotenv import load_dotenv
import json
import traceback



# Carga las variables de entorno desde un archivo .env para mayor seguridad
load_dotenv()

app = Flask(__name__)

# Configuración de CORS para permitir peticiones desde tu frontend (Vite en puerto 5173 por defecto)
CORS(app, supports_credentials=True, resources={r"/*": {"origins": "http://192.168.254.158:5173"}})

# Configuración segura usando variables de entorno
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'una-clave-secreta-para-desarrollo')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'mysql+pymysql://root:admin@192.168.254.158/control_vehicular1')
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
    
class Unidades(db.Model):
    __tablename__ = "Unidades"
    id_unidad = db.Column(db.Integer, primary_key=True)
    marca = db.Column(db.String(100))
    vehiculo = db.Column(db.String(100))
    modelo = db.Column(db.Integer)
    clase_tipo = db.Column(db.String(50))
    niv = db.Column(db.String(50), unique=True)
    motor = db.Column(db.String(50))
    transmision = db.Column(db.String(50))
    combustible = db.Column(db.String(50))
    color = db.Column(db.String(50))
    telefono_gps = db.Column(db.String(20))
    sim_gps = db.Column(db.String(20))
    uid = db.Column(db.String(50))
    propietario = db.Column(db.String(255))
    sucursal = db.Column(db.String(100))
    compra_arrendado = db.Column(db.String(20))
    fecha_adquisicion = db.Column(db.Date)

    placa = db.relationship('Placas', uselist=False, backref='unidad')  # one-to-one


class Placas(db.Model):
    __tablename__ = "Placas"
    id_placa = db.Column(db.Integer, primary_key=True)
    id_unidad= db.Column(db.Integer, db.ForeignKey('Unidades.id_unidad'), nullable=False)
    folio = db.Column(db.String(50))
    placa = db.Column(db.String(10), unique=True, nullable=False)
    fecha_expedicion = db.Column(db.Date)
    fecha_vigencia = db.Column(db.Date)

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
# =======================
#USUARIOS - CREACION
# ======================= 
@app.route('/api/usuarios', methods=['POST'])
def crear_usuario():
    data = request.json
    try:
        nuevo_usuario = Usuarios(
            nombre=data.get('nombre'),
            usuario=data.get('usuario'),
            contraseña=generate_password_hash(data.get('contraseña')),
            correo=data.get('correo'),
            rol=data.get('rol')
        )
        db.session.add(nuevo_usuario)
        db.session.commit()
        return jsonify({"mensaje": "Usuario creado correctamente"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/api/usuarios', methods=['GET'])
def obtener_usuarios():
    usuarios = Usuarios.query.all()
    resultado = []
    for u in usuarios:
        resultado.append({
            'id_usuario': u.id_usuario,
            'nombre': u.nombre,
            'usuario': u.usuario,
            'correo': u.correo,
            'rol': u.rol,
            'fecha_registro': u.fecha_registro,
            'fecha_ultimo_login': u.fecha_ultimo_login,
            'estado': u.estado
        })
    return jsonify(resultado), 200

#` =======================
# RECUPERACION DE CONTRASEÑA
# =======================`
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
            #reset_link = f"{os.getenv('FRONTEND_URL', 'http://192.168.254.158:5173')}/reset-password/{token}"
            frontend_url = "http://192.168.254.158:5173"
            reset_link = f"{frontend_url}/reset-password/{token}"

            msg = Message(
                'Restablecimiento de Contraseña',
                sender=app.config['MAIL_USERNAME'],
                recipients=[email]
            )

            msg.html = f"""
            <div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: auto; padding: 30px; background-color: #000000; color: #ffffff; border-radius: 10px; text-align: center;">
                
                <h1 style="font-size: 24px; margin-bottom: 20px;">Restablece tu contraseña</h1>
                
                <p style="font-size: 16px; margin-bottom: 30px; color: #e0e0e0;">
                    Hola,<br>
                    Has solicitado restablecer tu contraseña. Haz clic en el botón a continuación.
                </p>
                
                <a href="{reset_link}" style="
                    display: inline-block;
                    padding: 12px 28px;
                    font-size: 16px;
                    font-weight: 600;
                    color: #ffffff;
                    background-color: #ff1f3c;
                    text-decoration: none;
                    border-radius: 6px;
                ">
                    Restablecer Contraseña
                </a>
                
                <p style="font-size: 14px; color: #bbbbbb; margin-top: 25px;">
                    Si no solicitaste este cambio, ignora este correo.
                </p>
                
                <p style="font-size: 12px; color: #888888;">
                    Este enlace expira en 1 hora.
                </p>
            </div>
            """
            print("Enlace de recuperación:", reset_link)


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
# =======================
#GARANTIAS - OBTENER DATOS
# =======================
@app.route('/api/garantias', methods=['GET'])
def obtener_garantias():
    conn = db.engine.raw_connection()
    cursor = None
    try:
        cursor = conn.cursor()
        query = """
        SELECT 
            g.id_garantia,
            g.id_unidad,
            u.marca,
            u.vehiculo,
            g.aseguradora,
            g.tipo_garantia,
            g.no_poliza,
            g.url_poliza,
            g.suma_asegurada,
            g.inicio_vigencia,
            g.vigencia,
            g.prima
        FROM Garantias g
        JOIN Unidades u ON g.id_unidad = u.id_unidad;
        """
        cursor.execute(query)
        garantias = cursor.fetchall()

        columnas = [desc[0] for desc in cursor.description]
        resultados = [dict(zip(columnas, fila)) for fila in garantias]

        return jsonify(resultados), 200

    except Exception as e:
        print(f"Error al obtener garantías: {e}")
        return jsonify({"error": str(e)}), 500

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()



# =======================
#UNIDADES - OBTENER DATOS
# =======================
@app.route('/api/unidades', methods=['GET'])
def get_unidades_data():
    conn = db.engine.raw_connection()
    try:
        cursor = conn.cursor()
        query = """
        SELECT
        U.id_unidad,
        U.marca,
        U.vehiculo,
        U.modelo,
        U.niv,
        P.placa,
        U.fecha_adquisicion,
        P.fecha_vigencia AS fecha_vencimiento_tarjeta,
        CASE WHEN P.fecha_vigencia < CURDATE() THEN 'Vencida' ELSE 'Activa' END AS estado_tarjeta,
        V.engomado,
        C.nombre AS chofer_asignado,
        JSON_OBJECT(
            'color', U.color,
            'clase_tipo', U.clase_tipo,
            'motor', U.motor,
            'transmision', U.transmision,
            'combustible', U.combustible,
            'sucursal', U.sucursal,
            'compra_arrendado', U.compra_arrendado,
            'propietario', U.propietario,
            'uid', U.uid,
            'telefono_gps', U.telefono_gps,
            'sim_gps', U.sim_gps,
            'no_poliza', G.no_poliza,
            'folio_verificacion', V.folio_verificacion
        ) AS mas_datos
    FROM Unidades U
    LEFT JOIN (
        SELECT * FROM Placas P1
        WHERE P1.id_placa = (SELECT P2.id_placa FROM Placas P2 WHERE P2.id_unidad = P1.id_unidad ORDER BY P2.fecha_vigencia DESC LIMIT 1)
    ) P ON U.id_unidad = P.id_unidad
    LEFT JOIN (
        SELECT * FROM Garantias G1
        WHERE G1.id_garantia = (SELECT G2.id_garantia FROM Garantias G2 WHERE G2.id_unidad = G1.id_unidad ORDER BY G2.vigencia DESC LIMIT 1)
    ) G ON U.id_unidad = G.id_unidad
    LEFT JOIN (
        SELECT * FROM VerificacionVehicular V1
        WHERE V1.id_verificacion = (SELECT V2.id_verificacion FROM VerificacionVehicular V2 WHERE V2.id_unidad = V1.id_unidad ORDER BY V2.ultima_verificacion DESC LIMIT 1)
    ) V ON U.id_unidad = V.id_unidad
    LEFT JOIN Asignaciones A ON U.id_unidad = A.id_unidad AND A.fecha_fin IS NULL
    LEFT JOIN Choferes C ON A.id_chofer = C.id_chofer
    ORDER BY U.id_unidad;

        """
        cursor.execute(query)
        columns = [col[0] for col in cursor.description]
        results = [dict(zip(columns, row)) for row in cursor.fetchall()]

        # Formatear fechas
        for unidad in results:
            if unidad['fecha_adquisicion']:
                unidad['fecha_adquisicion'] = unidad['fecha_adquisicion'].strftime('%Y-%m-%d')
            if unidad['fecha_vencimiento_tarjeta']:
                unidad['fecha_vencimiento_tarjeta'] = unidad['fecha_vencimiento_tarjeta'].strftime('%Y-%m-%d')
            if unidad['mas_datos']:
                unidad['mas_datos'] = json.loads(unidad['mas_datos'])  # Convertir JSON string a dict

        return jsonify(results), 200
    except Exception as e:
        print(f"Error al ejecutar la consulta: {e}")
        return jsonify({"error": "Error al obtener los datos de unidades"}), 500
    finally:
        cursor.close()
        conn.close()
# =======================
# PUT - Actualizar unidad
# =======================
@app.route('/api/unidades/<int:id_unidad>', methods=['PUT'])
def update_unidad(id_unidad):
    data = request.json
    conn = db.engine.raw_connection()
    try:
        cursor = conn.cursor()
        query = """
        UPDATE Unidades
        SET marca = %s,
            vehiculo = %s,
            modelo = %s,
            niv = %s,
            fecha_adquisicion = %s,
            color = %s,
            clase_tipo = %s,
            motor = %s,
            transmision = %s,
            combustible = %s,
            sucursal = %s,
            compra_arrendado = %s,
            propietario = %s,
            uid = %s,
            telefono_gps = %s,
            sim_gps = %s
        WHERE id_unidad = %s
        """
        cursor.execute(query, (
            data.get("marca"),
            data.get("vehiculo"),
            data.get("modelo"),
            data.get("niv"),
            data.get("fecha_adquisicion"),
            data.get("color"),
            data.get("clase_tipo"),
            data.get("motor"),
            data.get("transmision"),
            data.get("combustible"),
            data.get("sucursal"),
            data.get("compra_arrendado"),
            data.get("propietario"),
            data.get("uid"),
            data.get("telefono_gps"),
            data.get("sim_gps"),
            id_unidad
        ))
        conn.commit()
        return jsonify({"message": "Unidad actualizada correctamente"}), 200
    except Exception as e:
        print(f"Error al actualizar: {e}")
        return jsonify({"error": "Error al actualizar la unidad"}), 500
    finally:
        cursor.close()
        conn.close()
#ELIMINACION DE UNIDADES
@app.route('/api/unidades/<int:id_unidad>', methods=['DELETE'])
def delete_unidad(id_unidad):
    conn = db.engine.raw_connection()
    try:
        cursor = conn.cursor()
        # Eliminación directa de la unidad; los registros relacionados se borrarán en cascada
        query = "DELETE FROM Unidades WHERE id_unidad = %s"
        cursor.execute(query, (id_unidad,))
        conn.commit()
        return jsonify({"message": "Unidad eliminada correctamente"}), 200
    except Exception as e:
        print(f"❌ Error al eliminar unidad: {e}")
        return jsonify({"error": "Error al eliminar la unidad"}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/unidades', methods=['POST'])
def agregar_unidad():
    data = request.json
    try:
        nueva_unidad = Unidades(
            marca=data.get("marca"),
            vehiculo=data.get("vehiculo"),
            modelo=data.get("modelo"),
            clase_tipo=data.get("clase_tipo"),
            niv=data.get("niv"),
            motor=data.get("motor"),
            transmision=data.get("transmision"),
            combustible=data.get("combustible"),
            color=data.get("color"),
            telefono_gps=data.get("telefono_gps"),
            sim_gps=data.get("sim_gps"),
            uid=data.get("uid"),
            propietario=data.get("propietario"),
            sucursal=data.get("sucursal"),
            compra_arrendado=data.get("compra_arrendado"),
            fecha_adquisicion=data.get("fecha_adquisicion")
        )

        # Asignación de placa (one-to-one)
        nueva_placa = Placas(
            folio=data.get("folio"),
            placa=data.get("placa"),
            fecha_expedicion=data.get("fecha_expedicion"),
            fecha_vigencia=data.get("fecha_vigencia")
        )

        nueva_unidad.placa = nueva_placa  # ✅ Asignación correcta

        db.session.add(nueva_unidad)
        db.session.commit()

        return jsonify({"mensaje": "Unidad y placa registradas exitosamente."}), 201

    except Exception as e:
        db.session.rollback()
        print(traceback.format_exc())  # para debug
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':

    app.run(host='0.0.0.0', port=5000, debug=True)
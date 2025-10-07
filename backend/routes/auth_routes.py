import os, secrets
from datetime import datetime, timedelta
from flask import Blueprint, jsonify, request
from werkzeug.security import generate_password_hash, check_password_hash
from ..models import Usuarios
from .. import db
from ..utils.mailer import enviar_correo_reset

auth_bp = Blueprint("auth_bp", __name__)

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"error": "Usuario y contraseña requeridos"}), 400

    user = Usuarios.query.filter_by(usuario=username, estado="activo").first()
    if user and check_password_hash(user.contraseña, password):
        user.fecha_ultimo_login = datetime.utcnow()
        db.session.commit()
        return jsonify({
            "message": "Inicio de sesión exitoso",
            "user": {"id": user.id_usuario, "nombre": user.nombre, "rol": user.rol}
        }), 200

    return jsonify({"error": "Credenciales inválidas"}), 401


@auth_bp.route("/request-reset", methods=["POST"])
def request_reset():
    data = request.get_json()
    email = data.get("email")
    if not email:
        return jsonify({"error": "Correo requerido"}), 400

    user = Usuarios.query.filter_by(correo=email).first()
    if user:
        token = secrets.token_urlsafe(32)
        user.token_recuperacion = token
        user.token_expiracion = datetime.utcnow() + timedelta(hours=1)
        db.session.commit()

        reset_link = f"http://192.168.254.158:5173/reset-password/{token}"
        enviar_correo_reset(email, reset_link)

    return jsonify({"message": "Si el correo está registrado, recibirás un enlace."}), 200


@auth_bp.route("/reset-password/<token>", methods=["POST"])
def reset_password(token):
    data = request.get_json()
    password = data.get("password")

    if not password:
        return jsonify({"error": "Contraseña requerida"}), 400

    user = Usuarios.query.filter_by(token_recuperacion=token).filter(
        Usuarios.token_expiracion > datetime.utcnow()).first()

    if not user:
        return jsonify({"error": "Token inválido o expirado"}), 400

    user.contraseña = generate_password_hash(password)
    user.token_recuperacion = None
    user.token_expiracion = None
    db.session.commit()
    return jsonify({"message": "Contraseña actualizada con éxito"}), 200

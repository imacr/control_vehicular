from flask import Blueprint, jsonify, request
from main import db
import json

unidades_bp = Blueprint("unidades_bp", __name__, url_prefix="/api/unidades")

@unidades_bp.route("/", methods=["GET"])
def get_unidades():
    conn = db.engine.raw_connection()
    try:
        cursor = conn.cursor()
        query = """
        SELECT U.id_unidad, U.marca, U.vehiculo, U.modelo, U.niv,
               P.placa, U.fecha_adquisicion, P.fecha_vigencia AS fecha_vencimiento_tarjeta
        FROM Unidades U
        LEFT JOIN Placas P ON U.id_unidad = P.id_unidad
        ORDER BY U.id_unidad;
        """
        cursor.execute(query)
        columns = [col[0] for col in cursor.description]
        data = [dict(zip(columns, row)) for row in cursor.fetchall()]
        return jsonify(data), 200
    finally:
        cursor.close()
        conn.close()

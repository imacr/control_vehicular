from flask import Flask, jsonify, request, session
from flask_cors import CORS
from flask_mysqldb import MySQL
from functools import wraps

app = Flask(__name__)
CORS(app)

# MySQL configuration
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = 'admin'
app.config['MYSQL_DB'] = 'control_vehicular'
app.config['SECRET_KEY'] = 'supersecretkey'

mysql = MySQL(app)

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'logged_in' not in session:
            return jsonify({"error": "Unauthorized"}), 401
        return f(*args, **kwargs)
    return decorated_function

@app.route('/login', methods=['POST'])
def login_route():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    cursor = mysql.connection.cursor()
    cursor.execute("SELECT id_usuario FROM users WHERE nombre = %s AND contrasenia = %s", (username, password))
    user_id = cursor.fetchone()
    cursor.close()

    if user_id:
        session['logged_in'] = True
        return jsonify({"message": "Login successful", "username": username}), 200
    else:
        return jsonify({"error": "Credenciales inválidas"}), 401

@app.route('/logout', methods=['POST'])
def logout_route():
    session.pop('logged_in', None)
    return jsonify({"message": "Logout successful"}), 200

@app.route('/api/usuarios', methods=['GET'])
@login_required
def get_usuarios():
    cursor = mysql.connection.cursor()
    cursor.execute("SELECT id_usuario, nombre, email FROM usuarios")
    data = cursor.fetchall()
    cursor.close()

    usuarios = []
    for row in data:
        usuarios.append({
            "id": row[0],
            "nombre": row[1],
            "email": row[2]
        })

    return jsonify(usuarios)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)   
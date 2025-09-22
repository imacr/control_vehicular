import React, { useState } from 'react';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://127.0.0.1:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        onLogin(username);
      } else {
        const data = await response.json();
        setError(data.error || 'Credenciales inválidas');
      }
    } catch (err) {
      setError('Error de conexión con el servidor. Asegúrate de que Flask esté corriendo.');
      console.error('Login fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>
        {`
          .login-container {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background: #1a1a1a;
            color: #fff;
            font-family: 'Inter', sans-serif;
          }

          .login-card {
            background: #2c2c2c;
            padding: 2.5rem;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
            width: 90%;
            max-width: 400px;
            text-align: center;
            transition: transform 0.3s ease-in-out;
          }

          .login-card:hover {
            transform: translateY(-5px);
          }

          .login-title {
            font-size: 2rem;
            margin-bottom: 2rem;
            color: #fff;
          }

          .login-form {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
          }

          .login-form input {
            padding: 1rem;
            border-radius: 8px;
            border: 1px solid #444;
            background: #3a3a3a;
            color: #fff;
            outline: none;
            font-size: 1rem;
            transition: border-color 0.3s;
          }

          .login-form input:focus {
            border-color: #e53e3e;
          }

          .login-button {
            padding: 1rem;
            border: none;
            border-radius: 8px;
            background: #e53e3e;
            color: #fff;
            font-size: 1.1rem;
            font-weight: bold;
            cursor: pointer;
            transition: background-color 0.3s, transform 0.2s;
          }

          .login-button:hover {
            background: #c53030;
            transform: translateY(-2px);
          }

          .login-button:disabled {
            background: #666;
            cursor: not-allowed;
          }

          .error-message {
            color: #e53e3e;
            margin-bottom: 1rem;
          }
        `}
      </style>
      <div className="login-container">
        <div className="login-card">
          <h2 className="login-title">Acceder</h2>
          {error && <p className="error-message">{error}</p>}
          <form onSubmit={handleSubmit} className="login-form">
            <input
              type="text"
              placeholder="Usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
            <button type="submit" disabled={loading} className="login-button">
              {loading ? 'Cargando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Login;
    import React, { useState } from 'react';
    import { Link, useNavigate } from "react-router-dom";
    import logo from '../assets/fibra.png';
    import styles from './Login.module.css'; 

    const Login = ({ onLogin }) => {
        const [username, setUsername] = useState('');
        const [password, setPassword] = useState('');
        const [error, setError] = useState('');
        const [loading, setLoading] = useState(false);
        const [showPassword, setShowPassword] = useState(false);

        const handleSubmit = async (e) => {
            e.preventDefault();
            setLoading(true);
            setError('');

            try {
                const response = await fetch('http://localhost:5000/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username, password }),
                });

                if (response.ok) {
                    // --- INICIO DE LA CORRECCIÓN ---
                    const data = await response.json(); // 1. Lee la respuesta completa del servidor.
                    onLogin(data.user); // 2. Envía el objeto de usuario completo a App.jsx.
                    // --- FIN DE LA CORRECCIÓN ---
                } else {
                    const data = await response.json();
                    setError(data.error || 'Credenciales inválidas');
                }
            } catch (err) {
                setError('Error de conexión. No se pudo contactar al servidor.');
                console.error('Login fetch error:', err);
            } finally {
                setLoading(false);
            }
        };

        return (
            // ... tu JSX se mantiene exactamente igual ...
            <div className={styles.loginContainer}>
                <div className={styles.loginCard}>
                    <img className={styles.logo_login} src={logo} alt="Logo FIBRATEC" />
                    <h1 className={styles.loginTitle}>Inicio de Sesion</h1>
                    
                    {error && <p className={styles.errorMessage}>{error}</p>}
                    
                    <form onSubmit={handleSubmit} className={styles.loginForm}>
                        <div className={styles.inputContainer}>
                            <i className={`fa-solid fa-user ${styles.icon}`}></i>
                            <input
                                type="text"
                                placeholder="Usuario"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className={styles.inputContainer}>
                            <i className={`fa-solid fa-lock ${styles.icon}`}></i>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Contraseña"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={loading}
                            />
                            <i 
                                className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'} ${styles.passwordToggleIcon}`}
                                onClick={() => setShowPassword(!showPassword)}
                            ></i>
                        </div>

                        <div className={styles.optionsContainer}>
                            <Link to="/request-reset" className={styles.forgotPassword}>
                                ¿Olvidaste tu contraseña?
                            </Link>
                        </div>
                        
                        <button type="submit" disabled={loading} className={styles.loginButton}>
                            {loading ? 'INGRESANDO...' : 'ENTRAR'}
                        </button>
                    </form>
                </div>
            </div>
        );
    };

    export default Login;
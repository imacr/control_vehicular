  import React, { useState, useEffect } from "react";
  import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
  import Sidebar from "./components/Sidebar";
  import Header from "./components/Header";
  import Dashboard from "./pages/Dashboard";
  import Usuarios from "./pages/Usuarios";
  import Login from "./components/Login";
  import "./App.css";
  import 'bootstrap/dist/css/bootstrap.min.css';

  function AppContent({ isLoggedIn, onLogin, onLogout, loading }) {
    const navigate = useNavigate();

    useEffect(() => {
      if (!loading) {
        if (isLoggedIn) {
          navigate('/');
        } else {
          navigate('/login');
        }
      }
    }, [isLoggedIn, navigate, loading]);

    return (
      <div className="app-container">
        {loading ? (
          <div>Loading...</div> // Componente de carga
        ) : isLoggedIn ? (
          <>
            <Sidebar />
            <div className="main-content">
              <Header onLogout={onLogout} />
              <div className="content">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/usuarios" element={<Usuarios />} />
                </Routes>
              </div>
            </div>
          </>
        ) : (
          <div className="full-screen-login">
            <Login onLogin={onLogin} /> {/* Asegúrate de que ocupa toda la pantalla */}
          </div>
        )}
      </div>
    );
  }

  export default function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true); // Estado de carga

    useEffect(() => {
      const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
      setIsLoggedIn(loggedIn);
      setLoading(false); // Cambia a false después de verificar
    }, []);

    const handleLogin = () => {
      setIsLoggedIn(true);
      localStorage.setItem('isLoggedIn', 'true');
    };

    const handleLogout = () => {
      setIsLoggedIn(false);
      localStorage.removeItem('isLoggedIn');
    };

    return (
      <Router>
        <AppContent isLoggedIn={isLoggedIn} onLogin={handleLogin} onLogout={handleLogout} loading={loading} />
      </Router>
    );
  }
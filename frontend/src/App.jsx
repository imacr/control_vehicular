import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// Componentes y Páginas
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Login from "./components/Login";
import Dashboard from "./pages/Dashboard";
import Usuarios from "./pages/Usuarios";
import RequestReset from "./pages/RequestReset";
import ResetPassword from "./pages/ResetPassword";

// Estilos
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";

function AppContent({ isLoggedIn, onLogin, onLogout, loading }) {
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const toggleSidebar = () => setSidebarVisible(!sidebarVisible);

  if (loading) {
    return <div className="centered-loader">Cargando...</div>; // Un loader más visible
  }

  return (
    <div className="app-container">
      {isLoggedIn ? (
        // --- LAYOUT PARA USUARIOS AUTENTICADOS ---
        <>
          {sidebarVisible && <Sidebar />}
          <div className={`main-content ${sidebarVisible ? "" : "full-width"}`}>
            <Header onLogout={onLogout} toggleSidebar={toggleSidebar} />
            <div className="content">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/usuarios" element={<Usuarios />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </div>
        </>
      ) : (
        // --- LAYOUT PARA USUARIOS NO AUTENTICADOS ---
        <div className="full-screen-login">
          <Routes>
            <Route path="/login" element={<Login onLogin={onLogin} />} />
            <Route path="/request-reset" element={<RequestReset />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    setIsLoggedIn(loggedIn);
    setLoading(false);
  }, []);

  const handleLogin = (/* podrías recibir datos del usuario aquí, como el token */) => {
    localStorage.setItem("isLoggedIn", "true");
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    setIsLoggedIn(false);
  };

  return (
    <Router>
      <AppContent
        isLoggedIn={isLoggedIn}
        onLogin={handleLogin}
        onLogout={handleLogout}
        loading={loading}
      />
    </Router>
  );
}
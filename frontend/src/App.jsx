import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Dashboard from "./pages/Dashboard";
import Usuarios from "./pages/Usuarios";
import Login from "./components/Login";
import "./App.css";
import 'bootstrap/dist/css/bootstrap.min.css';

// Esta función es un componente envoltorio que decide qué renderizar
function AppContent({ isLoggedIn, onLogin, onLogout }) {
  const navigate = useNavigate();

  // Redirecciona al usuario si el estado de autenticación cambia
  React.useEffect(() => {
    if (isLoggedIn) {
      navigate('/');
    } else {
      navigate('/login');
    }
  }, [isLoggedIn, navigate]);

  return (
    <div className="app-container">
      {isLoggedIn ? (
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
        <Login onLogin={onLogin} />
      )}
    </div>
  );
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
    <Router>
      <AppContent isLoggedIn={isLoggedIn} onLogin={handleLogin} onLogout={handleLogout} />
    </Router>
  );
}
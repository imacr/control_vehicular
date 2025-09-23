import React, { useState } from "react";
import "./Header.css";

export default function Header({ onLogout }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleLogout = () => {
    onLogout(); // Llama la función para cerrar sesión
    setDropdownOpen(false); // Cierra el menú desplegable
  };

  return (
    <header className="header">
      <div className="user">
        <div>
          <span>👤</span>
          <a href="#" onClick={toggleDropdown} className="session-link">
            Sesión
          </a>
        </div>

        {dropdownOpen && (
          <div className="dropdown-menu">
            <button onClick={handleLogout}>Cerrar sesión</button>
          </div>
        )}
      </div>
     
    </header>
  );
}
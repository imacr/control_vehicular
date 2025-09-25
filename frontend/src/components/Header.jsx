import React, { useState } from "react";

import "./Header.css";



const Header = ({ onLogout, toggleSidebar }) => {

  return (
    <header className="header">
      <button onClick={toggleSidebar}>Toggle Sidebar</button>
      <button onClick={onLogout}>Cerrar Sesión</button>
    </header>
  );
}

export default Header;
import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import logo from "../assets/logo.jpg";
import "./Sidebar.css";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const toggleSidebar = () => setIsOpen(!isOpen);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      {isMobile && (
        <button className="menu-btn" onClick={toggleSidebar}>
          <i class="fa-solid fa-house"></i>
        </button>
      )}
      {isMobile && isOpen && <div className="overlay" onClick={toggleSidebar}></div>}

      <div className={`sidebar ${isMobile ? (isOpen ? "open" : "") : ""}`}>
        <div className="sidebar-header">
          <img src={logo} alt="Logo" className="logo" />
          {isMobile && (
            <button className="close-btn" onClick={toggleSidebar}>

            </button>
          )}
        </div>

        <nav className="sidebar-menu">
          <NavLink to="/" className={({ isActive }) => isActive ? "active" : ""}>
            <i className="fa fa-th-large"></i> Dashboard
          </NavLink>
          <NavLink to="/usuarios" className={({ isActive }) => isActive ? "active" : ""}>
            <i className="fa fa-users"></i> Usuarios
          </NavLink>
          <NavLink to="/unidades" className={({ isActive }) => isActive ? "active" : ""}>
            <i className="fa fa-car"></i> Unidades
          </NavLink>
        </nav>

      </div>
    </>
  );
};

export default Sidebar;

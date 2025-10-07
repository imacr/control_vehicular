import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import logo from "../assets/logo.jpg";
import "./Sidebar.css";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showSubmenu, setShowSubmenu] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => setIsOpen(!isOpen);
  const toggleSubmenu = (e) => {
    e.preventDefault(); // evita recarga inmediata
    setShowSubmenu(!showSubmenu);
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      {isMobile && (
        <button className="menu-btn" onClick={toggleSidebar}>
          <i className="fa-solid fa-house"></i>
        </button>
      )}
      {isMobile && isOpen && <div className="overlay" onClick={toggleSidebar}></div>}

      <div className={`sidebar ${isMobile ? (isOpen ? "open" : "") : ""}`}>
        <div className="sidebar-header">
          <img src={logo} alt="Logo" className="logo" />
          {isMobile && (
            <button className="close-btn" onClick={toggleSidebar}></button>
          )}
        </div>

        <nav className="sidebar-menu">
          {/* === Dashboard con submenú === */}
                      <div
            className="menu-item"
            onMouseEnter={() => !clicked && setShowSubmenu(true)}   // hover abre solo si no se clickeó
            onMouseLeave={() => !clicked && setShowSubmenu(false)} // hover cierra solo si no se clickeó

          >
            <NavLink
              to="/"
              className={({ isActive }) => (isActive ? "active" : "")}
              onClick={(e) => {
                const isIconClick = e.target.closest(".submenu-toggle");
                if (isIconClick) toggleSubmenu(e);
                else {
                  setShowSubmenu(!showSubmenu); // también se despliega al hacer clic
                  navigate("/"); // clic normal -> navega al Dashboard
                }
              }}
            >
              <i className="fa fa-th-large"></i> Dashboard
              <i
                className={`fa submenu-toggle fa-chevron-${showSubmenu ? "down" : "right"}`}
                style={{ marginLeft: "auto" }}
              ></i>
            </NavLink>

            {showSubmenu && (
              <div className="submenu">
                <NavLink to="/reportes" className={({ isActive }) => (isActive ? "active" : "")}>
                  <i className="fa fa-bar-chart"></i> Reportes
                </NavLink>
                <NavLink to="/estadisticas" className={({ isActive }) => (isActive ? "active" : "")}>
                  <i className="fa fa-line-chart"></i> Estadísticas
                </NavLink>
              </div>
            )}
          </div>
          <NavLink to="/unidades" className={({ isActive }) => isActive ? "active" : ""}>
            <i className="fa fa-car"></i> Unidades
          </NavLink>
          {/* === Usuarios === */}
          <NavLink
            to="/usuarios"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            
            <i className="fa fa-users"></i> Usuarios
          </NavLink>

          <NavLink
            to="/garantias"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            
            <i className="fa fa-users"></i> Garantias
          </NavLink>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;












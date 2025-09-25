import React, { useState } from "react";
import { Link } from "react-router-dom";
import { CDBSidebar, CDBSidebarContent, CDBSidebarHeader, CDBSidebarMenu, CDBSidebarMenuItem, CDBSidebarFooter } from "cdbreact";
import "./Sidebar.css";
import logo from '../assets/logo.jpg';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <CDBSidebar textColor="#ffffff" backgroundColor="#000000" className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <CDBSidebarHeader className="logo">
        <img src={logo} alt="Logo" className="logop" />
        <div className="menu-toggle" onClick={toggleSidebar}>
          <i className={`fa ${isCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'}`} />
        </div>
      </CDBSidebarHeader>
      <CDBSidebarHeader prefix={<i className="fa fa-bars" />}>Menu</CDBSidebarHeader>
      <CDBSidebarContent>
        <CDBSidebarMenu>
          <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
            <CDBSidebarMenuItem icon="th-large" className="cdb-sidebar-menu-item">Dashboard</CDBSidebarMenuItem>
          </Link>
          <Link to="/usuarios" style={{ textDecoration: "none", color: "inherit" }}>
            <CDBSidebarMenuItem icon="sticky-note" className="cdb-sidebar-menu-item">Usuarios</CDBSidebarMenuItem>
          </Link>
          <Link to="/metrics" style={{ textDecoration: "none", color: "inherit" }}>
            <CDBSidebarMenuItem icon="credit-card">Métricas</CDBSidebarMenuItem>
          </Link>
        </CDBSidebarMenu>
      </CDBSidebarContent>
      <CDBSidebarFooter style={{ textAlign: "center", padding: "20px 5px" }}>
        Sidebar Footer
      </CDBSidebarFooter>
    </CDBSidebar>
  );
};

export default Sidebar;
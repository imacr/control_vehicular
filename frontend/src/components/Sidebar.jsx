import React from "react";
import { Link } from "react-router-dom";
import { CDBSidebar, CDBSidebarContent, CDBSidebarHeader, CDBSidebarMenu, CDBSidebarMenuItem, CDBSidebarFooter } from "cdbreact";
import "./Sidebar.css";
import logo from '../assets/logo.jpg';
const Sidebar = () => {
  return (
    <CDBSidebar textColor="#ffffffff" backgroundColor="#000000ff">
      <CDBSidebarHeader className="logo"><img src={logo} alt="" className="logop"/></CDBSidebarHeader>
      <CDBSidebarHeader prefix={<i className="fa fa-bars" />}>Menu</CDBSidebarHeader>
      <CDBSidebarContent>
        <CDBSidebarMenu>
          <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
            <CDBSidebarMenuItem icon="th-large" className="cdb-sidebar-menu-item">Dashboard</CDBSidebarMenuItem>
          </Link>
          <Link to="/usuarios"  style={{ textDecoration: "none", color: "inherit" }}>
            <CDBSidebarMenuItem icon="sticky-note" className="cdb-sidebar-menu-item">Usuarios</CDBSidebarMenuItem>
          </Link>
          <Link to="/metrics" style={{ textDecoration: "none", color: "inherit" }}>
            <CDBSidebarMenuItem className="cdb-sidebar-menu-item" icon="credit-card">Métricas</CDBSidebarMenuItem>
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

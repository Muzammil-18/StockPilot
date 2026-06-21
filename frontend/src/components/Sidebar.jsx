import React from 'react';
import { NavLink } from 'react-router-dom';

function Sidebar({ isOpen, toggleSidebar }) {
  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 10px' }}>
        <img src="/stockpilotlogo.png" alt="StockPilot Logo" style={{ height: '60px', marginBottom: '10px' }} />
        {/* <span style={{ fontSize: '18px', fontWeight: '800' }}>StockPilot</span> */}
      </div>
      <ul className="sidebar-menu">
        <li className="sidebar-item" onClick={toggleSidebar}>
          <NavLink to="/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <span className="sidebar-icon">📊</span> Dashboard
          </NavLink>
        </li>
        <li className="sidebar-item" onClick={toggleSidebar}>
          <NavLink to="/products" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <span className="sidebar-icon">📦</span> Products
          </NavLink>
        </li>
        <li className="sidebar-item" onClick={toggleSidebar}>
          <NavLink to="/customers" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <span className="sidebar-icon">👥</span> Customers
          </NavLink>
        </li>
        <li className="sidebar-item" onClick={toggleSidebar}>
          <NavLink to="/invoices" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <span className="sidebar-icon">📄</span> Invoices
          </NavLink>
        </li>
        <li className="sidebar-item" onClick={toggleSidebar}>
          <NavLink to="/reports" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <span className="sidebar-icon">📈</span> Reports
          </NavLink>
        </li>
      </ul>
    </aside>
  );
}

export default Sidebar;
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

function Layout({ children, title }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="main-content">
        <Navbar title={title} toggleSidebar={toggleSidebar} />
        <main className="page-container">{children}</main>
      </div>
    </div>
  );
}

export default Layout;

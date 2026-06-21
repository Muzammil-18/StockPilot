import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Navbar({ title, toggleSidebar }) {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const userObj = JSON.parse(userStr);
        setUserName(userObj.name || '');
      } catch (e) {
        setUserName('');
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="nav-left">
        <button className="menu-toggle" onClick={toggleSidebar}>
          ☰
        </button>
        <h1 className="nav-title">{title}</h1>
      </div>
      <div className="nav-right">
        <span className="user-name">Welcome, {userName}</span>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import './Navbar.css';

const Navbar = () => {
  const { user, setUser } = useUser(); // ⬅️ use setUser instead of logout
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token'); // Remove JWT
    setUser(null);                    // Clear user state
    navigate('/');                    // Go to home
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">MySocial</div>
      <ul className="navbar-links">
        {user ? (
          <>
            <li><Link to="/">Feed</Link></li>
            <li><Link to="/profile">Profile</Link></li>
            <li><button onClick={handleLogout}>Logout</button></li>
          </>
        ) : (
          <>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/register">Register</Link></li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Car, Search, PlusCircle, UserCheck, LogOut, LogIn, UserPlus, Menu, X } from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeMenu = () => setMobileMenuOpen(false);

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/rides" className="nav-brand" onClick={closeMenu}>
          <div className="nav-brand-icon">
            <Car size={20} strokeWidth={2.4} />
          </div>
          <span>Campus Carpool</span>
        </Link>

        <button
          className="nav-mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle Navigation"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <ul className={`nav-links ${mobileMenuOpen ? 'open' : ''}`}>
          {isAuthenticated ? (
            <>
              <li>
                <NavLink
                  to="/rides"
                  end
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  <Search size={16} strokeWidth={2.2} />
                  <span>Find Rides</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/rides/create"
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  <PlusCircle size={16} strokeWidth={2.2} />
                  <span>Post a Ride</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/my-rides"
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  <UserCheck size={16} strokeWidth={2.2} />
                  <span>My Rides</span>
                </NavLink>
              </li>
              {user && (
                <li className="nav-user-badge">
                  <div className="nav-user-avatar">
                    {getInitials(user.name)}
                  </div>
                  <span>{user.name}</span>
                </li>
              )}
              <li>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    closeMenu();
                    handleLogout();
                  }}
                  style={{ gap: '0.4rem' }}
                >
                  <LogOut size={14} />
                  <span>Logout</span>
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <NavLink
                  to="/rides"
                  end
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  <Search size={16} strokeWidth={2.2} />
                  <span>Browse Rides</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/login"
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  <LogIn size={16} strokeWidth={2.2} />
                  <span>Sign In</span>
                </NavLink>
              </li>
              <li>
                <Link
                  to="/register"
                  className="btn btn-primary btn-sm"
                  onClick={closeMenu}
                  style={{ gap: '0.4rem' }}
                >
                  <UserPlus size={15} />
                  <span>Join Network</span>
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;

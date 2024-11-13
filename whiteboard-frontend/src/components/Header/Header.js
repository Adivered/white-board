// Header.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <header>
      <nav>
        <ul>
          <li><Link to="/whiteboard">Whiteboard</Link></li>
          <li className="dropdown">
            <button onClick={toggleDropdown}>Profile</button>
            {dropdownOpen && (
              <ul className="dropdown-menu">
                <li><Link to="/login">Login</Link></li>
                <li><Link to="/signup">Sign Up</Link></li>
              </ul>
            )}
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
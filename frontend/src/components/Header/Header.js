import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';
import { useAuth } from '../../Context/AuthContext';

const Header = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { setAuth } = useAuth();

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleLogout = () => {
    fetch('/logout', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((res) => res.json().then(data => ({ status: res.status, body: data })))
      .then(({ status, body }) => {
        if (status === 200) {
          localStorage.removeItem("session");
          setAuth(false);
          window.location.reload();
          console.log("User logged out successfully");
        } else {
          console.error('Error logging user out:', body.message);
        }
      })
      .catch((err) => {
        console.error('Error exitting room:', err);
      });
  };

  useEffect(() => {
    const handleScroll = () => {
      const header = document.querySelector('header');
      if (window.scrollY > 50) {
        header.classList.add('shrink');
      } else {
        header.classList.remove('shrink');
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header>
      <div className="nav-container">
      <nav className="nav-bar">
        <ul className="menu">
          <li className="dropdown">
            <button onClick={toggleDropdown}></button>
            {dropdownOpen && (
              <ul className="dropdown-menu">
                <li><Link to="/login">Login</Link></li>
                <li><Link to="/signup">Sign Up</Link></li>
                <li><Link to="/" onClick={handleLogout}>Logout</Link></li>

              </ul>
            )}
          </li>
          <li className="logo"><p>Whiteboard. io</p></li>

        </ul>
      </nav>
      </div>
    </header>
  );
};

export default Header;
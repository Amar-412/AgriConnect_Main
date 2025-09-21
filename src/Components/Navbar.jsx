import React, { useState, useEffect } from 'react';
import './App.css'; // Import the CSS file here
import { useAuth } from './context/AuthContext';

const Navbar = ({ setActivePage }) => {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location, setLocation] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false); // Ensures that menu closes when clicking on a link or outside
  };

  // Get user's location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation(`https://www.google.com/maps?q=${latitude},${longitude}`);
          setErrorMessage(''); // Clear any previous error messages
        },
        (error) => {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              setErrorMessage("User denied the request for Geolocation.");
              break;
            case error.POSITION_UNAVAILABLE:
              setErrorMessage("Location information is unavailable.");
              break;
            case error.TIMEOUT:
              setErrorMessage("The request to get user location timed out.");
              break;
            case error.UNKNOWN_ERROR:
              setErrorMessage("An unknown error occurred.");
              break;
            default:
              setErrorMessage("An error occurred while retrieving location.");
          }
        }
      );
    } else {
      setErrorMessage("Geolocation is not supported by this browser.");
    }
  }, []);

  const handleSOSClick = () => {
    if (location) {
      const message = `Emergency! Here is my location: ${location}`;
      const phoneNumber = "9693004650"; // Replace with the actual number if needed

      // Open the messaging app with the pre-filled message
      window.open(`sms:${phoneNumber}?body=${encodeURIComponent(message)}`);

      // Initiate the call
      setTimeout(() => {
        window.location.href = `tel:${phoneNumber}`;
      }, 500); // Delay the call slightly to allow the SMS app to open
    } else {
      alert(errorMessage || "Location not available. Please try again.");
    }
  };

  return (
    <>
      <nav>
        <div className="navbar-brand">
          <img src="images/logo.png" alt="Agri Sustain Logo" className="navbar-logo" onClick={() => setActivePage('Home')} style={{ cursor: 'pointer' }} />
          <span onClick={() => setActivePage('Home')} style={{ cursor: 'pointer' }}>
            Agri Connect
          </span>
        </div>
        <ul className={`nav-links ${isMobileMenuOpen ? 'nav-active' : ''}`}>
          <li><a href="#" onClick={() => setActivePage('Home')}>Home</a></li>
          <li><a href="#" onClick={() => setActivePage('About')}>Scheme</a></li>
          <li><a href="#" onClick={() => setActivePage('Projects')}>Crops</a></li>
          <li><a href="#" onClick={() => setActivePage('Contact')}>Contact</a></li>
          <li>
            <a className='sos1' onClick={handleSOSClick} style={{ cursor: 'pointer' }}>
              <img className='sos' src="images/help.png" alt="Help" />
            </a>
          </li>
          {!user && <li><a href="#" onClick={() => setActivePage('Login')}>Login</a></li>}
          {!user && <li><a href="#" onClick={() => setActivePage('Register')}>Register</a></li>}
          {user && <li><a href="#" onClick={() => setActivePage('Dashboard')}>Dashboard</a></li>}
          {user && <li><a href="#" onClick={() => { logout(); setActivePage('Home'); }}>Logout</a></li>}
          {user && (
            <li style={{ marginLeft: '16px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: '#5eed3a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'black',
                fontWeight: 'bold',
                fontSize: '16px',
                cursor: 'pointer',
                transition: 'transform 0.2s ease',
                border: '2px solid white'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
              }}
              title={`Logged in as ${user.name}`}
              >
                {user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U'}
              </div>
            </li>
          )}
        </ul>
        <div 
          className={`hamburger ${isMobileMenuOpen ? 'open' : ''}`} 
          onClick={toggleMobileMenu}
        >
          <div></div>
          <div></div>
          <div></div>
        </div>
        {/* Mobile menu */}
        <ul className={`nav-links-mobile ${isMobileMenuOpen ? 'nav-active' : ''}`}>
          <li><a className='nav-tag' href="#" onClick={() => { setActivePage('Home'); closeMobileMenu(); }}>Home</a></li>
          <li><a className='nav-tag' href="#" onClick={() => { setActivePage('About'); closeMobileMenu(); }}>Scheme</a></li>
          <li><a className='nav-tag' href="#" onClick={() => { setActivePage('Projects'); closeMobileMenu(); }}>Crops</a></li>
          <li><a className='nav-tag' href="#" onClick={() => { setActivePage('Contact'); closeMobileMenu(); }}>Contact</a></li>
          <li>
            <a className='sos1' onClick={handleSOSClick} style={{ cursor: 'pointer' }}>
              <img className='sos' src="images/help.png" alt="Help" />
            </a>
          </li>
          {!user && <li><a className='nav-tag' href="#" onClick={() => { setActivePage('Login'); closeMobileMenu(); }}>Login</a></li>}
          {!user && <li><a className='nav-tag' href="#" onClick={() => { setActivePage('Register'); closeMobileMenu(); }}>Register</a></li>}
          {user && <li><a className='nav-tag' href="#" onClick={() => { setActivePage('Dashboard'); closeMobileMenu(); }}>Dashboard</a></li>}
          {user && <li><a className='nav-tag' href="#" onClick={() => { logout(); setActivePage('Home'); closeMobileMenu(); }}>Logout</a></li>}
          {user && (
            <li style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '16px' }}>
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                background: '#5eed3a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'black',
                fontWeight: 'bold',
                fontSize: '18px',
                cursor: 'pointer',
                transition: 'transform 0.2s ease',
                border: '2px solid white'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
              }}
              title={`Logged in as ${user.name}`}
              >
                {user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U'}
              </div>
            </li>
          )}
        </ul>
      </nav>
      {/* Background overlay when menu is active */}
      {isMobileMenuOpen && (
        <div className={`overlay active`} onClick={closeMobileMenu}></div>
      )}
    </>
  );
};

export default Navbar;

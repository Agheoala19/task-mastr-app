import React from 'react';
import './Navbar.css';
import { FaSearch } from 'react-icons/fa';

function Navbar() {
    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <h1>TaskMastr</h1>
            </div>

            <ul className="nav-links">
                <li className="nav-item"><a href="#acasa" className="nav-link">Acasă</a></li>
                <li className="nav-item"><a href="#taskuri" className="nav-link">Task-uri</a></li>
                <li className="nav-item"><a href="#logare" className="nav-link">Logare</a></li>
                <li className="nav-item"><a href="#inregistrare" className="nav-link nav-btn">Înregistrare</a></li>

                <li className="nav-item search-container">
                    <FaSearch className="search-icon" />
                </li>
            </ul>
        </nav>
    );
}

export default Navbar;
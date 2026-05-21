import React from 'react';
import './Navbar.css';
import NotificariDropdown from './NotificariDropdown';
import { FaSearch } from 'react-icons/fa';

function Navbar({ isLoggedIn, onLogout, onNavigate, onSearch }) {
    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <h1>TaskMastR</h1>
            </div>

            <ul className="nav-links">
                <li className="nav-item">
                    <button onClick={() => onNavigate(isLoggedIn ? 'tasks' : 'login')} className="nav-link" style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit', color: 'inherit' }}>
                        Acasa
                    </button>
                </li>

                {!isLoggedIn ? (
                    <>
                        <li className="nav-item">
                            <button onClick={() => onNavigate('login')} className="nav-link" style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit', color: 'inherit' }}>
                                Logare
                            </button>
                        </li>
                        <li className="nav-item">
                            <button onClick={() => onNavigate('register')} className="nav-link nav-btn" style={{ background: '#11998e', color: 'white', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit' }}>
                                Inregistrare
                            </button>
                        </li>
                    </>
                ) : (
                    <>
                        <NotificariDropdown />
                        <li className="nav-item">
                            <button onClick={() => onNavigate('profil')} className="nav-link" style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit', color: 'inherit' }}>
                                Profil
                            </button>
                        </li>
                        <li className="nav-item">
                            <button onClick={onLogout} className="nav-link nav-btn" style={{ background: '#d32f2f', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit', color: 'white' }}>
                                Iesire cont
                            </button>
                        </li>
                    </>
                )}

                <li className="nav-item search-container" style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f1f1f1', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                    <FaSearch className="search-icon" style={{ color: '#888', marginRight: '5px' }} />
                    <input
                        type="text"
                        placeholder="Cauta anunturi..."
                        onChange={(e) => onSearch(e.target.value)}
                        style={{ border: 'none', background: 'transparent', outline: 'none', padding: '0.3rem', width: '150px' }}
                    />
                </li>
            </ul>
        </nav>
    );
}

export default Navbar;
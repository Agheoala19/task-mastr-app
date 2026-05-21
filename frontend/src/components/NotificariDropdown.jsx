import React, { useState, useEffect, useRef } from 'react';
import api from '../api';
import { FaBell } from 'react-icons/fa';

function NotificariDropdown() {
    const [notificari, setNotificari] = useState([]);
    const [meniuDeschis, setMeniuDeschis] = useState(false);
    const dropdownRef = useRef(null);

    const fetchNotificari = async () => {
        try {
            const response = await api.get('/notificari');
            setNotificari(response.data);
        } catch (error) {
            console.error("Eroare la preluarea notificarilor:", error);
        }
    };

    useEffect(() => {
        fetchNotificari();
        const interval = setInterval(fetchNotificari, 15000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setMeniuDeschis(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleMeniu = async () => {
        const stareNoua = !meniuDeschis;
        setMeniuDeschis(stareNoua);

        if (stareNoua && notificari.some(n => !n.citita)) {
            try {
                await api.put('/notificari/citite');
                setNotificari(notificari.map(n => ({ ...n, citita: true })));
            } catch (error) {
                console.error("Eroare la marcarea notificarilor:", error);
            }
        }
    };

    const notificariNecitite = notificari.filter(n => !n.citita).length;

    return (
        <div ref={dropdownRef} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <button
                onClick={toggleMeniu}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', position: 'relative', padding: '0.5rem' }}
            >
                <FaBell size={24} color="#11998e" />

                {notificariNecitite > 0 && (
                    <span style={{
                        position: 'absolute', top: '0', right: '0',
                        backgroundColor: '#d32f2f', color: 'white',
                        borderRadius: '50%', padding: '2px 6px',
                        fontSize: '0.7rem', fontWeight: 'bold'
                    }}>
                        {notificariNecitite}
                    </span>
                )}
            </button>

            {meniuDeschis && (
                <div style={{
                    position: 'absolute', top: '45px', right: '0',
                    width: '320px', maxHeight: '400px', overflowY: 'auto',
                    backgroundColor: 'white', border: '1px solid #e0e0e0',
                    borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    zIndex: 1000, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '10px'
                }}>
                    <h4 style={{ margin: '0 0 10px 0', borderBottom: '2px solid #38ef7d', paddingBottom: '5px', color: '#333' }}>
                        Notificări
                    </h4>

                    {notificari.length === 0 ? (
                        <p style={{ margin: 0, color: '#888', fontSize: '0.9rem', textAlign: 'center' }}>Nu ai nicio notificare.</p>
                    ) : (
                        notificari.map(notificare => (
                            <div key={notificare._id} style={{
                                padding: '10px',
                                borderRadius: '6px',
                                backgroundColor: notificare.citita ? '#f9f9f9' : '#eafaf1',
                                borderLeft: notificare.citita ? 'none' : '4px solid #11998e',
                                fontSize: '0.9rem', color: '#444'
                            }}>
                                {notificare.mesaj}
                                <div style={{ fontSize: '0.75rem', color: '#999', marginTop: '5px' }}>
                                    {new Date(notificare.createdAt).toLocaleString('ro-RO')}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

export default NotificariDropdown;
import React, { useState, useEffect, useRef } from 'react';
import api from '../api';

function NotificariDropdown({ onNavigate, utilizatorCurent }) {
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

    const handleClickNotificare = (id_task) => {
        setMeniuDeschis(false);
        if (onNavigate) {
            if (utilizatorCurent?.rol === 'administrator') {
                onNavigate('tasks', id_task);
            } else {
                onNavigate('profil', id_task);
            }
        }
    };

    const notificariNecitite = notificari.filter(n => !n.citita).length;

    return (
        <div ref={dropdownRef} className="relative flex items-center">
            <button
                onClick={toggleMeniu}
                className="relative p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-all bg-transparent border-none cursor-pointer flex items-center justify-center"
            >
                <span className="material-symbols-outlined">notifications</span>

                {notificariNecitite > 0 && (
                    <span className="absolute top-1 right-1 w-[18px] h-[18px] bg-error rounded-full border-2 border-surface flex items-center justify-center text-white text-[10px] font-bold">
                        {notificariNecitite}
                    </span>
                )}
            </button>

            {meniuDeschis && (
                <div className="absolute top-[50px] right-0 w-[350px] bg-white rounded-xl shadow-xl border border-surface-container-highest overflow-hidden z-[1000] flex flex-col">
                    <div className="p-4 border-b border-surface-container-highest flex justify-between items-center bg-surface-bright">
                        <h4 className="font-bold text-on-surface font-label-md m-0">Notificări</h4>
                    </div>

                    <div className="max-h-[380px] overflow-y-auto">
                        {notificari.length === 0 ? (
                            <div className="py-12 flex flex-col items-center justify-center text-center px-8">
                                <div className="w-16 h-16 rounded-full bg-surface-container-low flex items-center justify-center mb-4">
                                    <span className="material-symbols-outlined text-[40px] text-outline-variant">notifications_off</span>
                                </div>
                                <p className="text-on-surface font-semibold m-0">Nu ai nicio notificare.</p>
                            </div>
                        ) : (
                            notificari.map(notificare => (
                                <div
                                    key={notificare._id}
                                    onClick={() => handleClickNotificare(notificare.id_task)}
                                    className={`relative flex gap-4 p-4 border-b border-surface-container-highest group cursor-pointer transition-colors ${notificare.citita
                                        ? 'bg-white hover:bg-surface-container-low'
                                        : 'bg-primary-container/10 hover:bg-primary-container/20'
                                        }`}
                                >
                                    {!notificare.citita && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
                                    )}

                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${notificare.citita ? 'bg-surface-container-highest' : 'bg-primary-container'
                                        }`}>
                                        <span className={`material-symbols-outlined ${notificare.citita ? 'text-on-surface-variant' : 'text-on-primary-container'
                                            }`}>
                                            {notificare.citita ? 'chat' : 'task_alt'}
                                        </span>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p className={`m-0 leading-tight ${notificare.citita
                                            ? 'text-on-surface-variant font-medium text-label-md'
                                            : 'text-on-surface font-semibold text-label-md'
                                            }`}>
                                            {notificare.mesaj}
                                        </p>
                                        <span className="text-outline text-[11px] font-medium mt-2 block">
                                            {new Date(notificare.createdAt).toLocaleString('ro-RO')}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default NotificariDropdown;
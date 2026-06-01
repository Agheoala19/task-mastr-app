import React, { useState, useEffect } from 'react';
import api from '../api';

function AdminDashboard({ utilizatorCurent }) {
    const [utilizatori, setUtilizatori] = useState([]);
    const [taskuri, setTaskuri] = useState([]);
    const [tabActiv, setTabActiv] = useState('utilizatori');

    useEffect(() => {
        if (utilizatorCurent?.rol === 'administrator') {
            fetchUtilizatori();
            fetchToateTaskurile();
        }
    }, [utilizatorCurent]);

    const fetchUtilizatori = async () => {
        try {
            const res = await api.get('/admin/utilizatori');
            setUtilizatori(res.data);
        } catch (error) {
            console.error("Eroare fetching utilizatori", error);
        }
    };

    const fetchToateTaskurile = async () => {
        try {
            const res = await api.get('/taskuri');
            const taskuriActive = res.data.filter(t =>
                t.status_task === 'deschis' || t.status_task === 'in desfasurare'
            );
            setTaskuri(taskuriActive);
        } catch (error) {
            console.error("Eroare fetching task-uri", error);
        }
    };

    const handleStergeUtilizator = async (id) => {
        if (!window.confirm("Ești sigur că vrei să ștergi acest utilizator?")) return;
        try {
            await api.delete(`/admin/utilizatori/${id}`);
            setUtilizatori(utilizatori.filter(u => u._id !== id));
        } catch (error) {
            alert("Eroare la ștergere.");
        }
    };

    const handleStergeTask = async (id) => {
        if (!window.confirm("Ești sigur că vrei să ștergi acest anunț?")) return;
        try {
            await api.delete(`/taskuri/${id}`);
            setTaskuri(taskuri.filter(t => t._id !== id));
        } catch (error) {
            alert("Eroare la ștergere.");
        }
    };

    if (utilizatorCurent?.rol !== 'administrator') return <div className="p-8 text-center text-error">Nu ai acces!</div>;

    return (
        <div className="max-w-container-max mx-auto px-4 md:px-8 py-8">
            <header className="mb-8">
                <h1 className="font-headline-xl text-primary m-0">Panou Administrator</h1>
                <p className="text-on-surface-variant m-0 mt-2">Gestionează utilizatorii și anunțurile active ale platformei.</p>
            </header>

            <div className="flex gap-4 mb-6 border-b border-outline-variant pb-2">
                <button
                    onClick={() => setTabActiv('utilizatori')}
                    className={`font-label-md px-4 py-2 border-none cursor-pointer rounded-t-lg transition-colors ${tabActiv === 'utilizatori' ? 'bg-primary text-white' : 'bg-surface-container text-on-surface hover:bg-surface-container-high'}`}
                >
                    Utilizatori ({utilizatori.length})
                </button>
                <button
                    onClick={() => setTabActiv('taskuri')}
                    className={`font-label-md px-4 py-2 border-none cursor-pointer rounded-t-lg transition-colors ${tabActiv === 'taskuri' ? 'bg-primary text-white' : 'bg-surface-container text-on-surface hover:bg-surface-container-high'}`}
                >
                    Anunțuri Active ({taskuri.length})
                </button>
            </div>

            <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant overflow-hidden">
                {tabActiv === 'utilizatori' ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-surface-container-low text-on-surface-variant font-label-md">
                                    <th className="p-4 border-b border-outline-variant">Nume Complet</th>
                                    <th className="p-4 border-b border-outline-variant">Email</th>
                                    <th className="p-4 border-b border-outline-variant">Rol</th>
                                    <th className="p-4 border-b border-outline-variant text-right">Acțiuni</th>
                                </tr>
                            </thead>
                            <tbody>
                                {utilizatori.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="p-8 text-center text-on-surface-variant italic">Nu există utilizatori.</td>
                                    </tr>
                                ) : utilizatori.map(u => (
                                    <tr key={u._id} className="border-b border-outline-variant hover:bg-surface-bright">
                                        <td className="p-4 font-semibold">{u.nume} {u.prenume}</td>
                                        <td className="p-4">{u.email}</td>
                                        <td className="p-4 uppercase text-xs tracking-wider">{u.rol}</td>
                                        <td className="p-4 text-right">
                                            {u.rol !== 'administrator' && (
                                                <button onClick={() => handleStergeUtilizator(u._id)} className="bg-error text-white border-none px-3 py-1 rounded cursor-pointer hover:opacity-90 transition-all">Șterge</button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-surface-container-low text-on-surface-variant font-label-md">
                                    <th className="p-4 border-b border-outline-variant">Titlu Anunț</th>
                                    <th className="p-4 border-b border-outline-variant">Buget</th>
                                    <th className="p-4 border-b border-outline-variant">Status</th>
                                    <th className="p-4 border-b border-outline-variant text-right">Acțiuni</th>
                                </tr>
                            </thead>
                            <tbody>
                                {taskuri.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="p-8 text-center text-on-surface-variant italic">Nu există anunțuri active în acest moment.</td>
                                    </tr>
                                ) : taskuri.map(t => (
                                    <tr key={t._id} className="border-b border-outline-variant hover:bg-surface-bright">
                                        <td className="p-4 font-semibold line-clamp-1 max-w-xs">{t.titlu}</td>
                                        <td className="p-4">{t.buget_estimativ} RON</td>
                                        <td className="p-4 uppercase text-[10px] tracking-wider font-bold text-primary">{t.status_task}</td>
                                        <td className="p-4 text-right">
                                            <button onClick={() => handleStergeTask(t._id)} className="bg-error text-white border-none px-3 py-1 rounded cursor-pointer hover:opacity-90 transition-all">Șterge</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminDashboard;
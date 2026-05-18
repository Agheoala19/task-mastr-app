import React, { useState, useEffect } from 'react';
import api from '../api';

function Profil({ utilizatorCurent }) {
    const [taskuri, setTaskuri] = useState([]);
    const [aplicari, setAplicari] = useState([]);
    const [loading, setLoading] = useState(true);

    const idUser = utilizatorCurent?.id || utilizatorCurent?._id;
    const rolUser = utilizatorCurent?.rol;

    useEffect(() => {
        const incarcaDate = async () => {
            try {
                if (rolUser === 'beneficiar') {
                    const response = await api.get('/taskuri');
                    const toateTaskurile = response.data;
                    const filtrate = toateTaskurile.filter(t => t.id_beneficiar?._id === idUser || t.id_beneficiar === idUser);
                    setTaskuri(filtrate);
                } else if (rolUser === 'prestator') {
                    const response = await api.get('/aplicari/prestator/mele');
                    setAplicari(response.data);
                }
            } catch (error) {
                console.error("Eroare la incarcarea istoricului:", error);
            } finally {
                setLoading(false);
            }
        };

        incarcaDate();
    }, [idUser, rolUser]);

    const handleFinalizareTask = async (idTask) => {
        if (!window.confirm('Esti sigur ca vrei sa marchezi acest task ca finalizat?')) return;

        try {
            await api.put(`/taskuri/${idTask}/finalizeaza`);
            // Actualizam interfata pe loc, fara sa facem un nou request la server
            setTaskuri(taskuri.map(t => t._id === idTask ? { ...t, status_task: 'finalizat' } : t));
            alert('Task-ul a fost finalizat cu succes!');
        } catch (error) {
            console.error("Eroare la finalizare:", error);
            alert(error.response?.data?.mesaj || 'A aparut o eroare la finalizarea task-ului.');
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '0 1rem' }}>
            <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', border: '1px solid #e0e0e0', marginBottom: '2rem' }}>
                <h2 style={{ color: '#11998e', marginTop: 0 }}>Profilul Meu</h2>
                <p><strong>Identificator utilizator:</strong> {idUser}</p>
                <p><strong>Rol cont:</strong> {rolUser === 'beneficiar' ? 'Client (Beneficiar)' : 'Mester (Prestator)'}</p>
            </div>

            <div style={{ borderBottom: '2px solid #38ef7d', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
                <h3 style={{ color: '#11998e', margin: 0 }}>
                    {rolUser === 'beneficiar' ? 'Anunturile mele postate' : 'Ofertele mele trimise'}
                </h3>
            </div>

            {loading ? (
                <div>Se incarca istoricul...</div>
            ) : rolUser === 'beneficiar' ? (
                taskuri.length === 0 ? (
                    <p>Nu ai postat niciun anunt inca.</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {taskuri.map(task => (
                            <div key={task._id} style={{ border: '1px solid #e0e0e0', borderRadius: '8px', padding: '1.5rem', backgroundColor: 'white' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <h4 style={{ margin: '0 0 0.5rem 0' }}>{task.titlu}</h4>
                                    <span style={{ backgroundColor: '#38ef7d', color: 'white', padding: '4px 8px', borderRadius: '12px', fontWeight: 'bold' }}>
                                        {task.buget_estimativ} RON
                                    </span>
                                </div>
                                <p style={{ color: '#666', margin: '0.5rem 0' }}>{task.descriere}</p>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                                    <p style={{ margin: 0, fontSize: '0.9rem', color: task.status_task === 'finalizat' ? '#11998e' : '#555', fontWeight: task.status_task === 'finalizat' ? 'bold' : 'normal' }}>
                                        Status: {task.status_task}
                                    </p>

                                    {task.status_task === 'in desfasurare' && (
                                        <button
                                            onClick={() => handleFinalizareTask(task._id)}
                                            style={{ backgroundColor: '#11998e', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                                        >
                                            Finalizeaza Task
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )
            ) : (
                aplicari.length === 0 ? (
                    <p>Nu ai aplicat la niciun anunt inca.</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {aplicari.map(aplicare => (
                            <div key={aplicare._id} style={{ border: '1px solid #e0e0e0', borderRadius: '8px', padding: '1.5rem', backgroundColor: 'white' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <h4 style={{ margin: '0 0 0.5rem 0' }}>Task: {aplicare.id_task?.titlu || 'Anunt sters'}</h4>
                                    <span style={{ backgroundColor: '#f39c12', color: 'white', padding: '4px 8px', borderRadius: '12px', fontWeight: 'bold' }}>
                                        Oferta ta: {aplicare.pret_propus} RON
                                    </span>
                                </div>
                                <p style={{ color: '#666', margin: '0.5rem 0' }}>Mesajul tau: {aplicare.mesaj_oferta}</p>
                                <p style={{ margin: 0, fontSize: '0.9rem', color: '#555' }}>Status oferta: {aplicare.status_aplicare}</p>
                            </div>
                        ))}
                    </div>
                )
            )}
        </div>
    );
}

export default Profil;
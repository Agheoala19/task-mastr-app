import React, { useState, useEffect } from 'react';
import api from '../api';
import AdaugaTask from './AdaugaTask';
import { FaStar } from 'react-icons/fa';

function TaskList({ utilizatorCurent, termenCautare = '' }) {
    const [taskuri, setTaskuri] = useState([]);
    const [loading, setLoading] = useState(true);
    const [arataFormular, setArataFormular] = useState(false);

    const idUser = utilizatorCurent?.id || utilizatorCurent?._id;
    const rolUser = utilizatorCurent?.rol;

    const fetchTaskuri = async () => {
        setLoading(true);
        try {
            const response = await api.get('/taskuri');
            setTaskuri(response.data);
        } catch (error) {
            console.error("Eroare la preluarea task-urilor:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTaskuri();
    }, []);

    const handleAplica = async (id_task) => {
        const mesaj = prompt("Introdu un scurt mesaj pentru client:");
        if (!mesaj) return;

        const pret = prompt("Introdu pretul propus (RON):");
        if (!pret) return;

        try {
            await api.post('/aplicari', {
                id_task: id_task,
                mesaj_oferta: mesaj,
                pret_propus: Number(pret)
            });
            alert("Ai aplicat cu succes la acest anunt!");

            const response = await api.get(`/aplicari/task/${id_task}`);
            setOferte(prevOferte => ({ ...prevOferte, [id_task]: response.data }));
        } catch (error) {
            console.error("Eroare la aplicare:", error);
            alert(error.response?.data?.mesaj || "Eroare la trimiterea ofertei.");
        }
    };

    const handleTaskNouAdaugat = () => {
        setArataFormular(false);
        fetchTaskuri();
    };

    const taskuriFiltrate = taskuri.filter(task => {
        const titlu = task.titlu || '';
        const descriere = task.descriere || '';
        const locatie = task.locatie || '';
        const cautare = termenCautare || '';

        return titlu.toLowerCase().includes(cautare.toLowerCase()) ||
            descriere.toLowerCase().includes(cautare.toLowerCase()) ||
            locatie.toLowerCase().includes(cautare.toLowerCase());
    });

    if (loading) return <div style={{ textAlign: 'center', marginTop: '2rem' }}>Se incarca anunturile...</div>;

    return (
        <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '0 1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #38ef7d', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
                <h2 style={{ color: '#11998e', margin: 0 }}>Anunturi Recente</h2>

                {rolUser === 'beneficiar' && !arataFormular && (
                    <button
                        onClick={() => setArataFormular(true)}
                        style={{ backgroundColor: '#11998e', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        + Adauga Anunt
                    </button>
                )}
            </div>

            {arataFormular && (
                <AdaugaTask
                    onTaskAdaugat={handleTaskNouAdaugat}
                    onAnulare={() => setArataFormular(false)}
                />
            )}

            {taskuriFiltrate.length === 0 ? (
                <p>Nu exista niciun anunt care sa corespunda cautarii.</p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {taskuriFiltrate.map((task) => {
                        const isOwner = task.id_beneficiar?._id === idUser || task.id_beneficiar === idUser;

                        return (
                            <div key={task._id} style={{ border: '1px solid #e0e0e0', borderRadius: '8px', padding: '1.5rem', backgroundColor: 'white' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <h3 style={{ margin: '0 0 0.5rem 0' }}>{task.titlu}</h3>
                                    <span style={{ backgroundColor: '#38ef7d', color: 'white', padding: '4px 8px', borderRadius: '12px', fontWeight: 'bold' }}>
                                        {task.buget_estimativ} RON
                                    </span>
                                </div>

                                {task.status_task === 'in desfasurare' && (
                                    <div style={{ color: '#d32f2f', fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                                        Acest task este in desfasurare.
                                    </div>
                                )}

                                <p style={{ color: '#666' }}>{task.descriere}</p>

                                {task.imagine && (
                                    <div style={{ margin: '1rem 0' }}>
                                        <img
                                            src={`http://localhost:5000${task.imagine}`}
                                            alt="Imagine atasata"
                                            style={{ maxWidth: '100%', maxHeight: '250px', borderRadius: '6px', objectFit: 'cover', display: 'block' }}
                                        />
                                    </div>
                                )}

                                <p style={{ margin: '0.5rem 0', fontSize: '0.9rem', color: '#555' }}>Locatie: {task.locatie}</p>

                                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>

                                    {rolUser === 'prestator' && task.status_task === 'deschis' && (
                                        <button
                                            onClick={() => handleAplica(task._id)}
                                            style={{ padding: '0.5rem 1rem', backgroundColor: '#f39c12', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                                        >
                                            Aplica la acest task
                                        </button>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    );
}

export default TaskList;
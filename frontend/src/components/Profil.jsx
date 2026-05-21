import React, { useState, useEffect } from 'react';
import api from '../api';
import { FaStar } from 'react-icons/fa';

function Profil({ utilizatorCurent }) {
    const [dateUser, setDateUser] = useState(null);
    const [taskuri, setTaskuri] = useState([]);
    const [aplicari, setAplicari] = useState([]);
    const [loading, setLoading] = useState(true);
    const [oferte, setOferte] = useState({});

    const [taskDeFinalizat, setTaskDeFinalizat] = useState(null);
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comentariu, setComentariu] = useState('');

    const [taskDeEditat, setTaskDeEditat] = useState(null);
    const [editForm, setEditForm] = useState({ titlu: '', descriere: '', buget_estimativ: '', locatie: '', imagine: null });

    const idUser = utilizatorCurent?.id || utilizatorCurent?._id;
    const rolUser = utilizatorCurent?.rol;

    const incarcaDate = async () => {
        try {
            const responseUser = await api.get('/auth/me');
            setDateUser(responseUser.data);

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

    useEffect(() => {
        incarcaDate();
    }, [idUser, rolUser]);

    const fetchTaskuri = async () => {
        try {
            const response = await api.get('/taskuri');
            const toateTaskurile = response.data;
            const filtrate = toateTaskurile.filter(t => t.id_beneficiar?._id === idUser || t.id_beneficiar === idUser);
            setTaskuri(filtrate);
        } catch (error) {
            console.error("Eroare la preluarea task-urilor:", error);
        }
    };

    const handleStergeTask = async (idTask) => {
        if (!window.confirm('Esti sigur ca vrei sa stergi acest anunt? Actiunea este ireversibila.')) return;

        try {
            await api.delete(`/taskuri/${idTask}`);
            setTaskuri(taskuri.filter(t => t._id !== idTask));
            alert('Anunt sters cu succes!');
        } catch (error) {
            console.error("Eroare la stergere:", error);
            alert(error.response?.data?.mesaj || 'A aparut o eroare la stergerea anuntului.');
        }
    };

    const deschideFereastraEditare = (task) => {
        setTaskDeEditat(task._id);
        setEditForm({
            titlu: task.titlu,
            descriere: task.descriere,
            buget_estimativ: task.buget_estimativ,
            locatie: task.locatie,
            imagine: null
        });
        setTaskDeFinalizat(null);
    };

    const trimiteEditare = async (idTask) => {
        try {
            const formData = new FormData();
            formData.append('titlu', editForm.titlu);
            formData.append('descriere', editForm.descriere);
            formData.append('buget_estimativ', editForm.buget_estimativ);
            formData.append('locatie', editForm.locatie);
            if (editForm.imagine) {
                formData.append('imagine', editForm.imagine);
            }

            const response = await api.put(`/taskuri/${idTask}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setTaskuri(taskuri.map(t => t._id === idTask ? response.data.task : t));
            setTaskDeEditat(null);
            alert('Anunt actualizat cu succes!');
        } catch (error) {
            console.error("Eroare la editare:", error);
            alert(error.response?.data?.mesaj || 'A aparut o eroare la editare.');
        }
    };

    const deschideFereastraRecenzie = (idTask) => {
        setTaskDeFinalizat(idTask);
        setRating(0);
        setComentariu('');
        setTaskDeEditat(null);
    };

    const incarcaOferte = async (id_task) => {
        if (oferte[id_task]) return;
        try {
            const response = await api.get(`/aplicari/task/${id_task}`);
            setOferte(prevOferte => ({ ...prevOferte, [id_task]: response.data }));
        } catch (error) {
            console.error("Eroare la preluarea ofertelor:", error);
        }
    };

    const handleAcceptaOferta = async (id_aplicare) => {
        try {
            await api.put(`/aplicari/${id_aplicare}/accepta`);
            alert('Oferta a fost acceptata cu succes!');
            fetchTaskuri();
        } catch (error) {
            console.error("Eroare la acceptare:", error);
            alert(error.response?.data?.mesaj || 'A aparut o eroare.');
        }
    };

    const trimiteFinalizare = async (idTask) => {
        if (rating < 1) {
            alert("Te rugam sa selectezi cel putin o stea (nota minima este 1).");
            return;
        }
        try {
            await api.put(`/taskuri/${idTask}/finalizeaza`, { rating, comentariu });
            setTaskuri(taskuri.map(t => t._id === idTask ? { ...t, status_task: 'finalizat' } : t));
            setTaskDeFinalizat(null);
            alert('Task finalizat cu succes! Recenzia a fost trimisa.');
        } catch (error) {
            console.error("Eroare la finalizare:", error);
            alert(error.response?.data?.mesaj || 'A aparut o eroare.');
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '0 1rem' }}>
            <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', border: '1px solid #e0e0e0', marginBottom: '2rem' }}>
                <h2 style={{ color: '#11998e', marginTop: 0 }}>Profilul Meu</h2>
                <p><strong>Nume:</strong> {dateUser?.nume} {dateUser?.prenume}</p>
                <p><strong>Email:</strong> {dateUser?.email}</p>
                <p><strong>Rol cont:</strong> {rolUser === 'beneficiar' ? 'Client (Beneficiar)' : 'Mester (Prestator)'}</p>

                {rolUser === 'prestator' && (
                    <div style={{ display: 'flex', alignItems: 'center', marginTop: '1rem', padding: '1rem', backgroundColor: '#fff3cd', borderRadius: '8px', borderLeft: '4px solid #f39c12', width: 'fit-content' }}>
                        <strong style={{ marginRight: '10px' }}>Rating-ul tău platformă:</strong>
                        {dateUser?.rating_mediu > 0 ? (
                            <span style={{ display: 'flex', alignItems: 'center', color: '#f39c12', fontSize: '1.2rem', fontWeight: 'bold' }}>
                                <FaStar style={{ marginRight: '5px' }} /> {dateUser.rating_mediu} / 5
                            </span>
                        ) : (
                            <span style={{ color: '#888' }}>Nu ai primit nicio recenzie încă.</span>
                        )}
                    </div>
                )}
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

                                {task.imagine && (
                                    <div style={{ margin: '1rem 0' }}>
                                        <img
                                            src={`http://localhost:5000${task.imagine}`}
                                            alt="Imagine atasata"
                                            style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '6px', objectFit: 'cover', display: 'block' }}
                                        />
                                    </div>
                                )}

                                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                    <button
                                        onClick={() => incarcaOferte(task._id)}
                                        style={{ padding: '0.5rem 1rem', backgroundColor: '#11998e', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                    >
                                        Vezi Ofertele
                                    </button>
                                </div>

                                {oferte[task._id] && (
                                    <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f1f8f5', borderRadius: '8px', borderLeft: '4px solid #11998e' }}>
                                        <h4 style={{ margin: '0 0 1rem 0', color: '#11998e' }}>Oferte primite:</h4>
                                        {oferte[task._id].length === 0 ? (
                                            <p style={{ margin: 0, fontSize: '0.9rem' }}>Nicio oferta inca.</p>
                                        ) : (
                                            oferte[task._id].map(oferta => (
                                                <div key={oferta._id} style={{ borderBottom: '1px solid #ddd', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                            <strong>{oferta.id_prestator?.nume || 'Mester'} {oferta.id_prestator?.prenume || ''}</strong>
                                                            {oferta.id_prestator?.rating_mediu > 0 ? (
                                                                <span style={{ display: 'flex', alignItems: 'center', color: '#f39c12', fontSize: '0.95rem', fontWeight: 'bold' }}>
                                                                    <FaStar style={{ marginRight: '3px', marginTop: '-2px' }} /> {oferta.id_prestator.rating_mediu}
                                                                </span>
                                                            ) : (
                                                                <span style={{ fontSize: '0.8rem', color: '#888' }}>(Fara recenzii)</span>
                                                            )}
                                                        </div>

                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                            <strong style={{ color: '#d32f2f' }}>Cere: {oferta.pret_propus} RON</strong>
                                                            {task.status_task === 'deschis' && (
                                                                <button
                                                                    onClick={() => handleAcceptaOferta(oferta._id)}
                                                                    style={{ backgroundColor: '#28a745', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                                                                >
                                                                    Accepta
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <p style={{ margin: 0, fontSize: '0.9rem', fontStyle: 'italic' }}>"{oferta.mesaj_oferta}"</p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                                    <p style={{ margin: 0, fontSize: '0.9rem', color: task.status_task === 'finalizat' ? '#11998e' : '#555', fontWeight: task.status_task === 'finalizat' ? 'bold' : 'normal' }}>
                                        Status: {task.status_task}
                                    </p>

                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        {task.status_task === 'deschis' && (
                                            <>
                                                <button
                                                    onClick={() => deschideFereastraEditare(task)}
                                                    style={{ backgroundColor: '#f39c12', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                                                >
                                                    Editeaza
                                                </button>
                                                <button
                                                    onClick={() => handleStergeTask(task._id)}
                                                    style={{ backgroundColor: '#d32f2f', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                                                >
                                                    Sterge Anunt
                                                </button>
                                            </>
                                        )}

                                        {task.status_task === 'in desfasurare' && taskDeFinalizat !== task._id && (
                                            <button
                                                onClick={() => deschideFereastraRecenzie(task._id)}
                                                style={{ backgroundColor: '#11998e', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                                            >
                                                Finalizeaza Task
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {taskDeEditat === task._id && (
                                    <div style={{ marginTop: '1.5rem', padding: '1.5rem', backgroundColor: '#fffdf5', borderRadius: '8px', borderLeft: '4px solid #f39c12' }}>
                                        <h4 style={{ margin: '0 0 1rem 0', color: '#f39c12' }}>Editeaza Anuntul</h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '1rem' }}>
                                            <input type="text" value={editForm.titlu} onChange={e => setEditForm({ ...editForm, titlu: e.target.value })} placeholder="Titlu" style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
                                            <textarea value={editForm.descriere} onChange={e => setEditForm({ ...editForm, descriere: e.target.value })} placeholder="Descriere" style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', minHeight: '80px' }} />
                                            <input type="number" value={editForm.buget_estimativ} onChange={e => setEditForm({ ...editForm, buget_estimativ: e.target.value })} placeholder="Buget (RON)" style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
                                            <input type="text" value={editForm.locatie} onChange={e => setEditForm({ ...editForm, locatie: e.target.value })} placeholder="Locatie" style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />

                                            <label style={{ fontSize: '0.9rem', color: '#555', marginTop: '5px' }}>Inlocuieste imaginea (optional):</label>
                                            <input type="file" accept="image/*" onChange={e => setEditForm({ ...editForm, imagine: e.target.files[0] })} />
                                        </div>
                                        <div style={{ display: 'flex', gap: '1rem' }}>
                                            <button onClick={() => trimiteEditare(task._id)} style={{ backgroundColor: '#f39c12', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                                                Salveaza Modificarile
                                            </button>
                                            <button onClick={() => setTaskDeEditat(null)} style={{ backgroundColor: '#aaa', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                                                Anuleaza
                                            </button>
                                        </div>
                                    </div>
                                )}
                                {taskDeFinalizat === task._id && (
                                    <div style={{ marginTop: '1.5rem', padding: '1.5rem', backgroundColor: '#f1f8f5', borderRadius: '8px', borderLeft: '4px solid #11998e' }}>
                                        <h4 style={{ margin: '0 0 1rem 0', color: '#11998e' }}>Acorda o nota mesterului</h4>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '1rem' }}>
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <div key={star} style={{ position: 'relative', cursor: 'pointer', width: '30px', height: '30px' }}>
                                                    <FaStar size={30} color="#e4e5e9" style={{ position: 'absolute', top: 0, left: 0 }} />
                                                    <div style={{ position: 'absolute', top: 0, left: 0, overflow: 'hidden', width: (hoverRating || rating) >= star ? '100%' : (hoverRating || rating) === star - 0.5 ? '50%' : '0%' }}>
                                                        <FaStar size={30} color="#ffc107" />
                                                    </div>
                                                    <div style={{ position: 'absolute', top: 0, left: 0, width: '50%', height: '100%', zIndex: 1 }} onMouseEnter={() => setHoverRating(star - 0.5)} onMouseLeave={() => setHoverRating(0)} onClick={() => setRating(star - 0.5)} />
                                                    <div style={{ position: 'absolute', top: 0, right: 0, width: '50%', height: '100%', zIndex: 1 }} onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)} onClick={() => setRating(star)} />
                                                </div>
                                            ))}
                                            <span style={{ marginLeft: '15px', fontSize: '1.2rem', fontWeight: 'bold', color: '#f39c12' }}>
                                                {hoverRating || rating} / 5
                                            </span>
                                        </div>
                                        <textarea placeholder="Lasa un comentariu despre cum a decurs lucrarea (optional)..." value={comentariu} onChange={(e) => setComentariu(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc', minHeight: '80px', marginBottom: '1rem', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                                        <div style={{ display: 'flex', gap: '1rem' }}>
                                            <button onClick={() => trimiteFinalizare(task._id)} style={{ backgroundColor: '#11998e', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                                                Trimite Recenzia
                                            </button>
                                            <button onClick={() => setTaskDeFinalizat(null)} style={{ backgroundColor: '#d32f2f', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                                                Anuleaza
                                            </button>
                                        </div>
                                    </div>
                                )}
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
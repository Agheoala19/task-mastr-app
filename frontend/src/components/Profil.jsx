import React, { useState, useEffect } from 'react';
import api from '../api';
import { FaStar } from 'react-icons/fa';

function Profil({ utilizatorCurent, taskTarget }) {
    const [dateUser, setDateUser] = useState(null);
    const [taskuri, setTaskuri] = useState([]);
    const [aplicari, setAplicari] = useState([]);
    const [loading, setLoading] = useState(true);
    const [oferte, setOferte] = useState({});

    const [modEditareProfil, setModEditareProfil] = useState(false);
    const [profilForm, setProfilForm] = useState({ nume: '', prenume: '', bio: '', avatar: null });

    const [taskDeFinalizat, setTaskDeFinalizat] = useState(null);
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comentariu, setComentariu] = useState('');

    const [taskDeEditat, setTaskDeEditat] = useState(null);
    const [editForm, setEditForm] = useState({ titlu: '', descriere: '', buget_estimativ: '', locatie: '', imagine: null });

    const [taskDeSters, setTaskDeSters] = useState(null);
    const [notificare, setNotificare] = useState(null);

    const afiseazaNotificare = (tip, text) => {
        setNotificare({ tip, text });
        setTimeout(() => setNotificare(null), 4000);
    };

    const formateazaTimpul = (dataDb) => {
        if (!dataDb) return '';
        const dataPostare = new Date(dataDb);
        const acum = new Date();
        const diffMs = acum - dataPostare;
        const diffOre = Math.floor(diffMs / (1000 * 60 * 60));

        if (diffOre === 0) return "Postat recent";
        if (diffOre < 24) return `Postat acum ${diffOre} ${diffOre === 1 ? 'oră' : 'ore'}`;

        const ieri = new Date();
        ieri.setDate(ieri.getDate() - 1);
        if (dataPostare.getDate() === ieri.getDate() && dataPostare.getMonth() === ieri.getMonth() && dataPostare.getFullYear() === ieri.getFullYear()) {
            return "Postat ieri";
        }
        return dataPostare.toLocaleDateString('ro-RO');
    };

    const idUser = utilizatorCurent?.id || utilizatorCurent?._id;
    const rolUser = utilizatorCurent?.rol;

    const incarcaDate = async () => {
        try {
            const responseUser = await api.get('/auth/me');
            setDateUser(responseUser.data);

            setProfilForm({
                nume: responseUser.data.nume || '',
                prenume: responseUser.data.prenume || '',
                bio: responseUser.data.bio || '',
                avatar: null
            });

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

    useEffect(() => {
        if (taskTarget && !loading) {
            setTimeout(() => {
                const element = document.getElementById(`task-${taskTarget}`);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    element.style.boxShadow = '0 0 15px #11998e';
                    setTimeout(() => element.style.boxShadow = '0 12px 20px -8px rgba(79, 95, 119, 0.06)', 3000);
                }
            }, 300);
        }
    }, [taskTarget, loading, taskuri, aplicari]);

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

    const handleSalvaProfil = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('nume', profilForm.nume);
            formData.append('prenume', profilForm.prenume);
            formData.append('bio', profilForm.bio);
            if (profilForm.avatar) {
                formData.append('avatar', profilForm.avatar);
            }

            const response = await api.put('/auth/me', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setDateUser(response.data.utilizator);
            setModEditareProfil(false);
            afiseazaNotificare('succes', 'Profilul tău a fost actualizat cu succes!');
        } catch (error) {
            afiseazaNotificare('eroare', error.response?.data?.mesaj || 'A apărut o eroare la salvare.');
        }
    };

    const trimiteStergere = async (idTask) => {
        try {
            await api.delete(`/taskuri/${idTask}`);
            setTaskuri(taskuri.filter(t => t._id !== idTask));
            setTaskDeSters(null);
            afiseazaNotificare('succes', 'Anunțul a fost șters cu succes!');
        } catch (error) {
            afiseazaNotificare('eroare', error.response?.data?.mesaj || 'Eroare la ștergere.');
        }
    };

    const deschideFereastraEditare = (task) => {
        setTaskDeEditat(task._id);
        setEditForm({ titlu: task.titlu, descriere: task.descriere, buget_estimativ: task.buget_estimativ, locatie: task.locatie, imagine: null });
        setTaskDeFinalizat(null);
        setTaskDeSters(null);
    };

    const trimiteEditare = async (idTask) => {
        try {
            const formData = new FormData();
            formData.append('titlu', editForm.titlu);
            formData.append('descriere', editForm.descriere);
            formData.append('buget_estimativ', editForm.buget_estimativ);
            formData.append('locatie', editForm.locatie);
            if (editForm.imagine) formData.append('imagine', editForm.imagine);

            const response = await api.put(`/taskuri/${idTask}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            setTaskuri(taskuri.map(t => t._id === idTask ? response.data.task : t));
            setTaskDeEditat(null);
            afiseazaNotificare('succes', 'Anunț actualizat cu succes!');
        } catch (error) {
            afiseazaNotificare('eroare', error.response?.data?.mesaj || 'Eroare la editare.');
        }
    };

    const deschideFereastraRecenzie = (idTask) => {
        setTaskDeFinalizat(idTask);
        setRating(0);
        setComentariu('');
        setTaskDeEditat(null);
        setTaskDeSters(null);
    };

    const toggleOferte = async (id_task) => {
        if (oferte[id_task]) {
            setOferte(prevOferte => {
                const copieOferte = { ...prevOferte };
                delete copieOferte[id_task];
                return copieOferte;
            });
        } else {
            try {
                const response = await api.get(`/aplicari/task/${id_task}`);
                setOferte(prevOferte => ({ ...prevOferte, [id_task]: response.data }));
            } catch (error) {
                console.error("Eroare oferte:", error);
            }
        }
    };

    const handleAcceptaOferta = async (id_aplicare) => {
        try {
            await api.put(`/aplicari/${id_aplicare}/accepta`);
            afiseazaNotificare('succes', 'Oferta a fost acceptată cu succes!');
            fetchTaskuri();
        } catch (error) {
            afiseazaNotificare('eroare', error.response?.data?.mesaj || 'Eroare la acceptarea ofertei.');
        }
    };

    const trimiteFinalizare = async (idTask) => {
        if (rating < 1) {
            afiseazaNotificare('eroare', "Te rugăm să selectezi cel puțin o stea.");
            return;
        }
        try {
            await api.put(`/taskuri/${idTask}/finalizeaza`, { rating, comentariu });
            setTaskuri(taskuri.map(t => t._id === idTask ? { ...t, status_task: 'finalizat' } : t));
            setTaskDeFinalizat(null);
            afiseazaNotificare('succes', 'Task finalizat și recenzie acordată cu succes!');
        } catch (error) {
            afiseazaNotificare('eroare', error.response?.data?.mesaj || 'Eroare la finalizare.');
        }
    };

    const avatarDefault = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";

    const taskuriSortate = [...taskuri].sort((a, b) => {
        if (a.status_task === 'finalizat' && b.status_task !== 'finalizat') return 1;
        if (a.status_task !== 'finalizat' && b.status_task === 'finalizat') return -1;
        return new Date(b.createdAt) - new Date(a.createdAt);
    });

    const aplicariSortate = [...aplicari].filter(a => a.id_task).sort((a, b) => {
        const statusA = a.id_task?.status_task || '';
        const statusB = b.id_task?.status_task || '';
        if (statusA === 'finalizat' && statusB !== 'finalizat') return 1;
        if (statusA !== 'finalizat' && statusB === 'finalizat') return -1;
        return new Date(b.createdAt) - new Date(a.createdAt);
    });

    const taskuriDeschise = taskuri.filter(t => t.status_task === 'deschis');
    const aplicariInAsteptare = aplicariSortate.filter(a => a.status_aplicare === 'in așteptare');
    const anunturiActiveMesaj = rolUser === 'beneficiar' ? `Ai ${taskuriDeschise.length} anunțuri deschise.` : `Ai trimis oferte la ${aplicariInAsteptare.length} anunțuri.`;

    if (loading) return <div className="text-center mt-8 font-body-md text-on-surface-variant">Se încarcă profilul...</div>;

    return (
        <div className="max-w-container-max mx-auto px-4 md:px-8 py-8 relative">

            {notificare && (
                <div className={`fixed top-5 right-5 z-[1000] text-white px-8 py-4 rounded-lg shadow-lg font-bold transition-opacity duration-300 ${notificare.tip === 'succes' ? 'bg-[#28a745]' : 'bg-[#d32f2f]'}`}>
                    {notificare.tip === 'succes' ? '✅ ' : '❌ '} {notificare.text}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8">

                <aside className="md:col-span-4 lg:col-span-3 space-y-6">
                    <div className="bg-surface-container-lowest rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-surface-variant">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="relative">
                                <div className="w-32 h-32 rounded-full border-4 border-primary/10 p-1">
                                    <img
                                        src={dateUser?.avatar ? `http://localhost:5000${dateUser.avatar}` : avatarDefault}
                                        alt="Avatar"
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                </div>
                                <button
                                    onClick={() => setModEditareProfil(!modEditareProfil)}
                                    className="absolute bottom-1 right-1 bg-primary text-on-primary p-2 rounded-full hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer border-none"
                                >
                                    <span className="material-symbols-outlined text-[18px]">edit</span>
                                </button>
                            </div>
                            <div>
                                <h1 className="font-headline-md text-headline-md text-on-surface m-0">{dateUser?.nume} {dateUser?.prenume}</h1>
                                <p className="text-on-surface-variant text-body-md m-0 mt-1">{dateUser?.email}</p>
                            </div>
                            <span className="bg-secondary-container text-on-secondary-container px-4 py-1 rounded-full text-label-md font-label-md">
                                {rolUser === 'beneficiar' ? 'Client (Beneficiar)' : 'Meșter (Prestator)'}
                            </span>
                        </div>

                        <div className="mt-8 pt-6 border-t border-surface-variant">
                            <h3 className="font-label-md text-label-md text-primary uppercase tracking-wider mb-4">Bio Profesional</h3>
                            <p className="text-on-surface-variant text-body-md italic leading-relaxed m-0">
                                {dateUser?.bio ? dateUser.bio : "Nu ai adăugat nicio descriere (bio) încă. Editează profilul pentru a o adăuga."}
                            </p>
                        </div>

                        {rolUser === 'prestator' && (
                            <div className="mt-6 bg-surface-container-low p-4 rounded-lg text-center">
                                <div className="flex items-center justify-center text-[#f39c12] mb-1">
                                    <span className="font-bold text-headline-md m-0">{dateUser?.rating_mediu > 0 ? dateUser.rating_mediu : '-'}</span>
                                    <span className="material-symbols-outlined text-[20px] ml-1" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                </div>
                                <span className="text-label-sm text-on-surface-variant">{dateUser?.rating_mediu > 0 ? 'Rating Mediu' : 'Fără recenzii încă'}</span>
                            </div>
                        )}
                    </div>
                </aside>

                <section className="md:col-span-8 lg:col-span-9 space-y-6 lg:space-y-8">

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 bg-primary rounded-2xl p-8 text-on-primary relative overflow-hidden flex flex-col justify-between min-h-[200px]">
                            <div className="relative z-10">
                                <h2 className="font-headline-lg text-headline-lg m-0 mb-2">Salutare, {dateUser?.prenume}!</h2>
                                <p className="text-on-primary-container opacity-90 max-w-md m-0">{anunturiActiveMesaj}</p>
                            </div>
                            <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-primary-container rounded-full opacity-20 blur-3xl"></div>
                        </div>
                        <div className="bg-surface-container-lowest border border-surface-variant rounded-2xl p-6 flex flex-col justify-center items-center text-center shadow-sm">
                            <span className="material-symbols-outlined text-tertiary text-4xl mb-2">verified_user</span>
                            <h4 className="font-label-md text-label-md text-on-surface m-0">Cont Verificat</h4>
                            <p className="text-label-sm text-on-surface-variant mt-1 m-0">Ești un utilizator de încredere în comunitatea TaskMastR.</p>
                        </div>
                    </div>

                    {modEditareProfil && (
                        <div className="bg-surface-container-lowest rounded-xl p-8 border border-surface-variant shadow-sm transition-all duration-300">
                            <h3 className="font-headline-md text-headline-md text-on-surface mb-6 mt-0">Setări Profil</h3>
                            <form onSubmit={handleSalvaProfil} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <label className="block">
                                        <span className="text-label-md text-on-surface-variant">Nume</span>
                                        <input type="text" value={profilForm.nume} onChange={e => setProfilForm({ ...profilForm, nume: e.target.value })} required className="mt-1 block w-full rounded-lg border border-outline-variant bg-surface-container-low text-body-md focus:border-primary focus:ring-primary focus:ring-2 outline-none p-3" />
                                    </label>
                                    <label className="block">
                                        <span className="text-label-md text-on-surface-variant">Prenume</span>
                                        <input type="text" value={profilForm.prenume} onChange={e => setProfilForm({ ...profilForm, prenume: e.target.value })} required className="mt-1 block w-full rounded-lg border border-outline-variant bg-surface-container-low text-body-md focus:border-primary focus:ring-primary focus:ring-2 outline-none p-3" />
                                    </label>
                                </div>
                                <div className="space-y-4">
                                    <label className="block">
                                        <span className="text-label-md text-on-surface-variant">Bio Profesional</span>
                                        <textarea value={profilForm.bio} onChange={e => setProfilForm({ ...profilForm, bio: e.target.value })} className="mt-1 block w-full rounded-lg border border-outline-variant bg-surface-container-low text-body-md focus:border-primary focus:ring-primary focus:ring-2 outline-none p-3" rows="4"></textarea>
                                    </label>
                                    <label className="block">
                                        <span className="text-label-md text-on-surface-variant">Schimbă Poza</span>
                                        <input type="file" accept="image/*" onChange={e => setProfilForm({ ...profilForm, avatar: e.target.files[0] })} className="mt-1 block w-full text-label-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-surface-container-highest cursor-pointer" />
                                        {profilForm.avatar && (
                                            <img src={URL.createObjectURL(profilForm.avatar)} alt="Preview" className="mt-2 w-16 h-16 rounded-full object-cover border-2 border-primary" />
                                        )}
                                    </label>
                                </div>
                                <div className="md:col-span-2 flex items-center gap-4 pt-4 border-t border-surface-variant">
                                    <button type="submit" className="px-6 py-2.5 bg-primary text-on-primary rounded-lg font-label-md shadow-sm border-none cursor-pointer hover:brightness-110 transition-all">Salvează Modificările</button>
                                    <button type="button" onClick={() => setModEditareProfil(false)} className="text-on-surface-variant font-label-md hover:text-error transition-colors bg-transparent border-none cursor-pointer">Anulează</button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="space-y-6">
                        <div className="flex items-center justify-between border-b border-surface-variant pb-2">
                            <h3 className="font-headline-md text-headline-md text-on-surface m-0 pb-2 border-b-2 border-primary">
                                {rolUser === 'beneficiar' ? 'Anunțurile mele' : 'Ofertele mele'}
                            </h3>
                        </div>

                        {rolUser === 'beneficiar' ? (
                            taskuriSortate.length === 0 ? (
                                <p className="text-on-surface-variant italic">Nu ai postat niciun anunț încă.</p>
                            ) : (
                                <div className="space-y-6">
                                    {taskuriSortate.map(task => (
                                        <div id={`task-${task._id}`} key={task._id} className={`bg-surface-container-lowest rounded-xl border border-surface-variant overflow-hidden transition-all duration-300 shadow-[0_4px_12px_rgba(0,0,0,0.05)] ${task.status_task === 'finalizat' ? 'opacity-80' : ''}`}>
                                            <div className="p-6">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <span className={`${task.status_task === 'finalizat' ? 'bg-surface-variant text-on-surface-variant' : 'bg-tertiary-container/10 text-tertiary'} text-label-sm font-label-md px-3 py-1 rounded-full mb-3 inline-block uppercase tracking-wider`}>
                                                            {task.status_task}
                                                        </span>
                                                        <h3 className="font-headline-md text-headline-md text-on-surface m-0">{task.titlu}</h3>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-primary font-bold text-headline-md m-0">{task.buget_estimativ} RON</span>
                                                        <p className="text-label-sm text-on-surface-variant m-0">Buget</p>
                                                    </div>
                                                </div>
                                                <p className="text-on-surface-variant text-body-md line-clamp-2 mb-4 whitespace-pre-line">{task.descriere}</p>

                                                {task.imagine && (
                                                    <img src={`http://localhost:5000${task.imagine}`} alt="Atașament" className="w-full max-w-[300px] h-32 object-cover rounded-lg border border-surface-variant mb-4" />
                                                )}

                                                <div className="flex flex-wrap items-center justify-between pt-4 border-t border-surface-variant gap-4">
                                                    <div className="flex gap-4">
                                                        <span className="flex items-center gap-1 text-on-surface-variant text-label-sm">
                                                            <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                                                            {formateazaTimpul(task.createdAt)}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        <button onClick={() => toggleOferte(task._id)} className={`px-4 py-2 rounded-lg font-label-md transition-colors border-none cursor-pointer ${oferte[task._id] ? 'bg-surface-container-high text-on-surface' : 'bg-primary-container text-on-primary-container hover:brightness-105'}`}>
                                                            {oferte[task._id] ? 'Ascunde Oferte' : 'Vezi Oferte'}
                                                        </button>
                                                        {task.status_task === 'deschis' && (
                                                            <>
                                                                <button onClick={() => deschideFereastraEditare(task)} className="px-4 py-2 border border-outline-variant text-on-surface hover:bg-surface-container rounded-lg font-label-md transition-colors cursor-pointer bg-transparent">Editează</button>
                                                                <button onClick={() => { setTaskDeSters(task._id); setTaskDeEditat(null); setTaskDeFinalizat(null); }} className="px-4 py-2 bg-error-container text-on-error-container hover:brightness-95 rounded-lg font-label-md transition-colors cursor-pointer border-none">Șterge</button>
                                                            </>
                                                        )}
                                                        {task.status_task === 'in desfasurare' && taskDeFinalizat !== task._id && (
                                                            <button onClick={() => deschideFereastraRecenzie(task._id)} className="px-4 py-2 bg-primary text-on-primary rounded-lg font-label-md hover:brightness-110 transition-colors cursor-pointer border-none shadow-sm">Finalizează</button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {taskDeSters === task._id && (
                                                <div className="bg-error-container/20 p-6 border-t border-error/20">
                                                    <h4 className="text-error font-headline-md m-0 mb-2">Confirmi ștergerea?</h4>
                                                    <p className="text-on-surface-variant text-body-md m-0 mb-4">Acțiunea este permanentă și ireversibilă.</p>
                                                    <div className="flex gap-2">
                                                        <button onClick={() => trimiteStergere(task._id)} className="bg-error text-on-error px-6 py-2 rounded-lg font-label-md cursor-pointer border-none hover:opacity-90">Da, șterge</button>
                                                        <button onClick={() => setTaskDeSters(null)} className="bg-surface-container-highest text-on-surface px-6 py-2 rounded-lg font-label-md cursor-pointer border-none hover:bg-outline-variant">Anulează</button>
                                                    </div>
                                                </div>
                                            )}

                                            {taskDeEditat === task._id && (
                                                <div className="bg-surface-container-low p-6 border-t border-surface-variant">
                                                    <h4 className="text-primary font-headline-md m-0 mb-4">Editează Anunțul</h4>
                                                    <div className="space-y-4">
                                                        <input type="text" value={editForm.titlu} onChange={e => setEditForm({ ...editForm, titlu: e.target.value })} className="w-full p-3 rounded-lg border border-outline-variant outline-none focus:border-primary" />
                                                        <textarea value={editForm.descriere} onChange={e => setEditForm({ ...editForm, descriere: e.target.value })} className="w-full p-3 rounded-lg border border-outline-variant outline-none focus:border-primary" rows="3"></textarea>
                                                        <div className="flex gap-4">
                                                            <input type="number" value={editForm.buget_estimativ} onChange={e => setEditForm({ ...editForm, buget_estimativ: e.target.value })} className="flex-1 p-3 rounded-lg border border-outline-variant outline-none focus:border-primary" />
                                                            <select value={editForm.locatie} onChange={e => setEditForm({ ...editForm, locatie: e.target.value })} className="flex-1 p-3 rounded-lg border border-outline-variant outline-none cursor-pointer">
                                                                <option value="București">București</option>
                                                                <option value="Cluj-Napoca">Cluj-Napoca</option>
                                                                <option value="Timișoara">Timișoara</option>
                                                                <option value="Iași">Iași</option>
                                                            </select>
                                                        </div>
                                                        <div className="flex gap-2 pt-2">
                                                            <button onClick={() => trimiteEditare(task._id)} className="bg-primary text-on-primary px-6 py-2 rounded-lg font-label-md cursor-pointer border-none hover:opacity-90">Salvează</button>
                                                            <button onClick={() => setTaskDeEditat(null)} className="bg-surface-container-highest text-on-surface px-6 py-2 rounded-lg font-label-md cursor-pointer border-none hover:bg-outline-variant">Anulează</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {taskDeFinalizat === task._id && (
                                                <div className="bg-surface-container-low p-6 border-t border-surface-variant flex flex-col items-center">
                                                    <span className="material-symbols-outlined text-primary text-4xl mb-2">rate_review</span>
                                                    <h4 className="font-headline-md text-headline-md text-on-surface m-0 mb-2">Evaluează Specialistul</h4>
                                                    <div className="flex gap-2 mb-4">
                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                            <div key={star} className="relative cursor-pointer w-8 h-8">
                                                                <span className="material-symbols-outlined absolute top-0 left-0 text-3xl text-outline-variant" style={{ fontVariationSettings: "'FILL' 0" }}>star</span>
                                                                <div className="absolute top-0 left-0 overflow-hidden" style={{ width: (hoverRating || rating) >= star ? '100%' : (hoverRating || rating) === star - 0.5 ? '50%' : '0%' }}>
                                                                    <span className="material-symbols-outlined text-3xl text-[#f39c12]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                                                </div>
                                                                <div className="absolute top-0 left-0 w-1/2 h-full z-10" onMouseEnter={() => setHoverRating(star - 0.5)} onMouseLeave={() => setHoverRating(0)} onClick={() => setRating(star - 0.5)} />
                                                                <div className="absolute top-0 right-0 w-1/2 h-full z-10" onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)} onClick={() => setRating(star)} />
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <textarea placeholder="Lasă un comentariu (opțional)..." value={comentariu} onChange={(e) => setComentariu(e.target.value)} className="w-full p-3 rounded-lg border border-outline-variant outline-none focus:border-primary mb-4" rows="2"></textarea>
                                                    <div className="flex gap-2">
                                                        <button onClick={() => trimiteFinalizare(task._id)} className="bg-primary text-on-primary px-6 py-2 rounded-lg font-label-md cursor-pointer border-none hover:opacity-90">Trimite Recenzia</button>
                                                        <button onClick={() => setTaskDeFinalizat(null)} className="bg-surface-container-highest text-on-surface px-6 py-2 rounded-lg font-label-md cursor-pointer border-none hover:bg-outline-variant">Anulează</button>
                                                    </div>
                                                </div>
                                            )}

                                            {oferte[task._id] && (
                                                <div className="bg-surface-container-low p-6 border-t border-surface-variant">
                                                    <h4 className="font-label-md text-label-md text-on-surface mb-4 mt-0">Oferte primite</h4>
                                                    {oferte[task._id].length === 0 ? (
                                                        <p className="text-on-surface-variant italic text-sm m-0">Nu ai primit nicio ofertă încă.</p>
                                                    ) : (
                                                        <div className="space-y-4">
                                                            {oferte[task._id].map(oferta => (
                                                                <div key={oferta._id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-surface-container-lowest p-4 rounded-lg border border-surface-variant gap-4">
                                                                    <div className="flex items-center gap-4">
                                                                        <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container font-bold uppercase">
                                                                            {oferta.id_prestator?.nume?.charAt(0)}{oferta.id_prestator?.prenume?.charAt(0)}
                                                                        </div>
                                                                        <div>
                                                                            <p className="font-label-md text-label-md text-on-surface m-0">{oferta.id_prestator?.nume} {oferta.id_prestator?.prenume}</p>
                                                                            <div className="flex items-center gap-1 text-[#f39c12] mt-1">
                                                                                <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                                                                <span className="text-label-sm text-on-surface-variant">{oferta.id_prestator?.rating_mediu > 0 ? oferta.id_prestator.rating_mediu : 'Fără recenzii'}</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-auto w-full">
                                                                        <div className="text-left sm:text-right">
                                                                            <p className="font-bold text-on-surface m-0">{oferta.pret_propus} RON</p>
                                                                            <p className="text-label-sm text-on-surface-variant italic m-0 line-clamp-1 max-w-[150px]">"{oferta.mesaj_oferta}"</p>
                                                                        </div>
                                                                        {task.status_task === 'deschis' && (
                                                                            <button onClick={() => handleAcceptaOferta(oferta._id)} className="px-4 py-2 bg-primary text-on-primary rounded-md font-label-md text-label-sm hover:scale-105 transition-transform cursor-pointer border-none shadow-sm">
                                                                                Acceptă
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )
                        ) : (
                            aplicariSortate.length === 0 ? (
                                <p className="text-on-surface-variant italic">Nu ai trimis nicio ofertă încă.</p>
                            ) : (
                                <div className="space-y-6">
                                    {aplicariSortate.map(aplicare => (
                                        <div id={`task-${aplicare.id_task?._id || aplicare.id_task}`} key={aplicare._id} className="bg-surface-container-lowest rounded-xl border border-surface-variant p-6 shadow-sm">
                                            <div className="flex justify-between items-start mb-4 border-b border-surface-variant pb-4">
                                                <div>
                                                    <p className="text-label-sm text-on-surface-variant m-0 mb-1">Ofertă pentru anunțul:</p>
                                                    <h3 className="font-headline-md text-headline-md text-on-surface m-0">{aplicare.id_task?.titlu || 'Anunț șters'}</h3>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-primary font-bold text-headline-md m-0">{aplicare.pret_propus} RON</span>
                                                    <p className="text-label-sm text-on-surface-variant m-0">Oferta mea</p>
                                                </div>
                                            </div>
                                            <div className="bg-surface-container-low p-4 rounded-lg mb-4">
                                                <p className="text-label-sm text-on-surface-variant m-0 mb-1">Mesajul trimis clientului:</p>
                                                <p className="text-on-surface text-body-md italic m-0">"{aplicare.mesaj_oferta}"</p>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-label-sm text-on-surface-variant">{formateazaTimpul(aplicare.createdAt)}</span>
                                                <span className={`px-3 py-1 rounded-full text-label-sm font-bold uppercase tracking-wider ${aplicare.status_aplicare === 'respins' ? 'bg-error-container text-on-error-container' :
                                                    (aplicare.id_task?.status_task === 'finalizat' ? 'bg-surface-variant text-on-surface-variant' : 'bg-primary-container text-on-primary-container')
                                                    }`}>
                                                    {(aplicare.status_aplicare === 'acceptata' || aplicare.status_aplicare === 'acceptat') && aplicare.id_task?.status_task === 'finalizat'
                                                        ? 'Proiect Finalizat'
                                                        : aplicare.status_aplicare}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}

export default Profil;
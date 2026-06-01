import React, { useState, useEffect } from 'react';
import api from '../api';

const eliminaDiacritice = (text) => {
    if (!text) return "";
    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
};

function TaskList({ utilizatorCurent, termenCautare, onNavigate }) {
    const [taskuri, setTaskuri] = useState([]);
    const [loading, setLoading] = useState(true);
    const [paginaCurenta, setPaginaCurenta] = useState(1);
    const [totalPagini, setTotalPagini] = useState(1);
    const [arataFormular, setArataFormular] = useState(false);
    const [formTask, setFormTask] = useState({
        titlu: '',
        categorie: 'Reparații și Întreținere',
        descriere: '',
        buget_estimativ: '',
        locatie: 'București',
        imagine: null
    });
    const [notificare, setNotificare] = useState(null);

    const [taskPentruAplicare, setTaskPentruAplicare] = useState(null);
    const [formAplicare, setFormAplicare] = useState({ pret: '', mesaj: '' });

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
        if (dataPostare.getDate() === ieri.getDate() &&
            dataPostare.getMonth() === ieri.getMonth() &&
            dataPostare.getFullYear() === ieri.getFullYear()) {
            return "Postat ieri";
        }
        return dataPostare.toLocaleDateString('ro-RO');
    };

    useEffect(() => {
        const fetchTaskuriPaginate = async () => {
            setLoading(true);
            try {
                const response = await api.get(`/taskuri/feed?page=${paginaCurenta}&limit=5`);
                setTaskuri(response.data.taskuri);
                setTotalPagini(response.data.totalPages);
            } catch (error) {
                console.error("Eroare la preluarea task-urilor:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTaskuriPaginate();
    }, [paginaCurenta]);

    const handleCreazaTask = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            const titluComplet = `[${formTask.categorie}] ${formTask.titlu}`;

            formData.append('titlu', titluComplet);
            formData.append('descriere', formTask.descriere);
            formData.append('buget_estimativ', formTask.buget_estimativ);
            formData.append('locatie', formTask.locatie);
            if (formTask.imagine) {
                formData.append('imagine', formTask.imagine);
            }

            await api.post('/taskuri', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            afiseazaNotificare('succes', 'Anunțul tău a fost publicat cu succes!');
            setFormTask({ titlu: '', categorie: 'Reparații și Întreținere', descriere: '', buget_estimativ: '', locatie: 'București', imagine: null });
            setArataFormular(false);

            const response = await api.get(`/taskuri/feed?page=${paginaCurenta}&limit=5`);
            setTaskuri(response.data.taskuri);
            setTotalPagini(response.data.totalPages);
        } catch (error) {
            console.error(error);
            afiseazaNotificare('eroare', 'A apărut o eroare la publicarea anunțului.');
        }
    };

    const deschideFereastraAplicare = (task) => {
        setTaskPentruAplicare(task._id);
        setFormAplicare({ pret: task.buget_estimativ || '', mesaj: '' });
    };

    const handleTrimiteAplicare = async (idTask) => {
        if (!formAplicare.pret || !formAplicare.mesaj) {
            afiseazaNotificare("eroare", "Te rugăm să completezi ambele câmpuri!");
            return;
        }
        try {
            await api.post('/aplicari', {
                id_task: idTask,
                pret_propus: formAplicare.pret,
                mesaj_oferta: formAplicare.mesaj
            });
            afiseazaNotificare('succes', 'Ofertă trimisă cu succes!');
            setTaskPentruAplicare(null);
        } catch (error) {
            afiseazaNotificare('eroare', error.response?.data?.mesaj || "Eroare la trimiterea ofertei.");
        }
    };

    const taskuriFiltrate = taskuri.filter(task => {
        if (!termenCautare) return true;
        const textCautat = eliminaDiacritice(termenCautare);
        return (
            eliminaDiacritice(task.titlu).includes(textCautat) ||
            eliminaDiacritice(task.descriere).includes(textCautat) ||
            eliminaDiacritice(task.locatie).includes(textCautat)
        );
    });

    const avatarDefault = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";

    if (loading) return <div className="text-center mt-8 font-body-md text-on-surface-variant">Se încarcă anunțurile...</div>;

    const esteFormularDeschis = arataFormular && utilizatorCurent?.rol === 'beneficiar';

    return (
        <div className="max-w-container-max mx-auto px-4 md:px-8 py-8 relative">

            {notificare && (
                <div className={`fixed top-5 right-5 z-[1000] text-white px-8 py-4 rounded-lg shadow-lg font-bold transition-opacity duration-300 ${notificare.tip === 'succes' ? 'bg-[#28a745]' : 'bg-[#d32f2f]'}`}>
                    {notificare.tip === 'succes' ? '✅ ' : '❌ '} {notificare.text}
                </div>
            )}

            <section className="pb-8 text-center">
                <h1 className="font-headline-xl text-headline-xl text-on-surface mb-2 mt-0">Anunțuri Disponibile</h1>
                <p className="font-body-lg text-body-lg text-on-surface-variant m-0">Găsește proiecte noi și extinde-ți portofoliul astăzi.</p>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

                <div className={`transition-all duration-500 ease-in-out ${esteFormularDeschis ? 'lg:col-span-7' : 'lg:col-span-8 lg:col-start-3'} space-y-6`}>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-headline-md text-headline-md text-on-surface m-0">
                            {termenCautare ? `Rezultate pentru "${termenCautare}"` : "Proiecte Recente"}
                        </h2>
                        {utilizatorCurent && utilizatorCurent.rol === 'beneficiar' && (
                            <button
                                onClick={() => setArataFormular(!arataFormular)}
                                className="px-6 py-2.5 bg-primary text-on-primary rounded-full font-label-md font-bold hover:opacity-90 transition-all shadow-sm cursor-pointer border-none"
                            >
                                {arataFormular ? 'Închide Formularul' : '+ Postează Anunț Nou'}
                            </button>
                        )}
                    </div>

                    {taskuriFiltrate.length === 0 ? (
                        <p className="text-on-surface-variant italic p-6 bg-surface-container-lowest rounded-xl border border-outline-variant text-center">
                            {termenCautare ? `Nu s-au găsit anunțuri care să conțină "${termenCautare}".` : "Nu există anunțuri deschise în acest moment."}
                        </p>
                    ) : (
                        <div className="space-y-6">
                            {taskuriFiltrate.map(task => (
                                <div key={task._id} className="task-card bg-surface-container-lowest border border-outline-variant p-6 rounded-xl transition-all duration-300 hover:shadow-[0_12px_24px_-10px_rgba(0,104,96,0.15)] hover:border-transparent">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={task.id_beneficiar?.avatar ? `http://localhost:5000${task.id_beneficiar.avatar}` : avatarDefault}
                                                alt="Avatar"
                                                className="w-12 h-12 rounded-full object-cover"
                                            />
                                            <div>
                                                <h3 className="font-label-md text-label-md text-on-surface m-0">{task.id_beneficiar?.nume} {task.id_beneficiar?.prenume}</h3>
                                                <p className="text-label-sm font-label-sm text-outline m-0 mt-1">{formateazaTimpul(task.createdAt)}</p>
                                            </div>
                                        </div>
                                        <div className="bg-primary-container px-4 py-2 rounded-lg">
                                            <span className="font-headline-md text-headline-md text-on-primary-container">{task.buget_estimativ} RON</span>
                                        </div>
                                    </div>

                                    <h2 className="font-headline-md text-headline-md text-on-surface mb-2 mt-4">{task.titlu}</h2>

                                    <div className="flex items-center gap-2 text-outline mb-4">
                                        <span className="material-symbols-outlined text-[20px]" data-icon="location_on">location_on</span>
                                        <span className="text-label-md font-label-md">{task.locatie}</span>
                                    </div>

                                    <p className="font-body-md text-body-md text-on-surface-variant mb-6 whitespace-pre-line">
                                        {task.descriere}
                                    </p>

                                    {task.imagine && (
                                        <img
                                            src={`http://localhost:5000${task.imagine}`}
                                            alt="Imagine atașată"
                                            className="w-full max-h-[300px] object-cover rounded-lg mb-6"
                                        />
                                    )}

                                    {utilizatorCurent && utilizatorCurent.rol === 'prestator' && (
                                        <div className="flex justify-end items-center border-t border-outline-variant/30 pt-4 mt-4">
                                            <button
                                                onClick={() => deschideFereastraAplicare(task)}
                                                className="bg-[#ff9800] hover:bg-[#f57c00] text-white px-6 py-2.5 rounded-lg font-label-md text-label-md transition-transform active:scale-95 shadow-md cursor-pointer border-none"
                                            >
                                                Aplică la acest anunț
                                            </button>
                                        </div>
                                    )}

                                    {taskPentruAplicare === task._id && (
                                        <div className="bg-surface-container-low p-6 border-t border-surface-variant mt-4 rounded-b-xl">
                                            <h4 className="text-primary font-headline-md m-0 mb-4">Trimite Oferta Ta</h4>
                                            <div className="space-y-4">
                                                <input
                                                    type="number"
                                                    placeholder="Preț propus (RON)"
                                                    value={formAplicare.pret}
                                                    onChange={e => setFormAplicare({ ...formAplicare, pret: e.target.value })}
                                                    className="w-full p-3 rounded-lg border border-outline-variant outline-none focus:border-primary"
                                                />
                                                <textarea
                                                    placeholder="Mesaj pentru client (de ce ești potrivit pentru lucrare?)..."
                                                    value={formAplicare.mesaj}
                                                    onChange={e => setFormAplicare({ ...formAplicare, mesaj: e.target.value })}
                                                    className="w-full p-3 rounded-lg border border-outline-variant outline-none focus:border-primary"
                                                    rows="3"
                                                ></textarea>
                                                <div className="flex gap-2 pt-2">
                                                    <button
                                                        onClick={() => handleTrimiteAplicare(task._id)}
                                                        className="bg-primary text-on-primary px-6 py-2 rounded-lg font-label-md cursor-pointer border-none hover:opacity-90"
                                                    >
                                                        Trimite
                                                    </button>
                                                    <button
                                                        onClick={() => setTaskPentruAplicare(null)}
                                                        className="bg-surface-container-highest text-on-surface px-6 py-2 rounded-lg font-label-md cursor-pointer border-none hover:bg-outline-variant"
                                                    >
                                                        Anulează
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                </div>
                            ))}
                        </div>
                    )}

                    {totalPagini > 1 && !termenCautare && (
                        <div className="flex items-center justify-between pt-8">
                            <button
                                onClick={() => setPaginaCurenta(prev => Math.max(prev - 1, 1))}
                                disabled={paginaCurenta === 1}
                                className="flex items-center gap-2 px-4 py-2 border border-outline-variant rounded-lg font-label-md text-label-md hover:bg-surface-container transition-colors disabled:opacity-50 cursor-pointer bg-transparent"
                            >
                                <span className="material-symbols-outlined" data-icon="arrow_back">arrow_back</span>
                                Înapoi
                            </button>
                            <span className="font-body-md text-body-md text-on-surface-variant">
                                Pagina <span className="font-bold text-on-surface">{paginaCurenta}</span> din {totalPagini}
                            </span>
                            <button
                                onClick={() => setPaginaCurenta(prev => Math.min(prev + 1, totalPagini))}
                                disabled={paginaCurenta === totalPagini}
                                className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg font-label-md text-label-md hover:brightness-110 transition-all disabled:opacity-50 border-none cursor-pointer"
                            >
                                Înainte
                                <span className="material-symbols-outlined" data-icon="arrow_forward">arrow_forward</span>
                            </button>
                        </div>
                    )}
                </div>

                {esteFormularDeschis && (
                    <aside className="lg:col-span-5">
                        <div className="sticky top-24 bg-surface-container-low p-6 rounded-2xl border border-outline-variant max-h-[80vh] overflow-y-auto shadow-sm">
                            <h2 className="font-headline-md text-headline-md text-on-surface mb-4 mt-0">Adaugă un Anunț Nou</h2>
                            <form onSubmit={handleCreazaTask} className="space-y-3">

                                <div>
                                    <label className="block text-label-sm font-label-md text-on-surface-variant mb-1">Domeniu Serviciu</label>
                                    <select
                                        value={formTask.categorie}
                                        onChange={e => setFormTask({ ...formTask, categorie: e.target.value })}
                                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2.5 text-body-md focus:ring-2 focus:ring-primary outline-none cursor-pointer"
                                    >
                                        <option value="Reparații și Întreținere">Reparații și Întreținere</option>
                                        <option value="Curățenie">Curățenie</option>
                                        <option value="Construcții și Amenajări">Construcții și Amenajări</option>
                                        <option value="IT și Tehnologie">IT și Tehnologie</option>
                                        <option value="Grădinărit">Grădinărit</option>
                                        <option value="Transport și Mutări">Transport și Mutări</option>
                                        <option value="Altele">Altele</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-label-sm font-label-md text-on-surface-variant mb-1">Titlu Anunț</label>
                                    <input
                                        type="text"
                                        value={formTask.titlu}
                                        onChange={e => setFormTask({ ...formTask, titlu: e.target.value })}
                                        placeholder="Ex: Caut instalator"
                                        required
                                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2.5 text-body-md focus:ring-2 focus:ring-primary outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-label-sm font-label-md text-on-surface-variant mb-1">Descriere Detaliată</label>
                                    <textarea
                                        value={formTask.descriere}
                                        onChange={e => setFormTask({ ...formTask, descriere: e.target.value })}
                                        placeholder="Descrie ce ai nevoie, condiții, etc..."
                                        required
                                        rows="3"
                                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2.5 text-body-md focus:ring-2 focus:ring-primary outline-none resize-y"
                                    ></textarea>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-label-sm font-label-md text-on-surface-variant mb-1">Buget (RON)</label>
                                        <input
                                            type="number"
                                            value={formTask.buget_estimativ}
                                            onChange={e => setFormTask({ ...formTask, buget_estimativ: e.target.value })}
                                            placeholder="Ex: 500"
                                            required
                                            className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2.5 text-body-md focus:ring-2 focus:ring-primary outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-label-sm font-label-md text-on-surface-variant mb-1">Locație</label>
                                        <select
                                            value={formTask.locatie}
                                            onChange={e => setFormTask({ ...formTask, locatie: e.target.value })}
                                            className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2.5 text-body-md focus:ring-2 focus:ring-primary outline-none cursor-pointer"
                                        >
                                            <option value="București">București</option>
                                            <option value="Cluj-Napoca">Cluj-Napoca</option>
                                            <option value="Timișoara">Timișoara</option>
                                            <option value="Iași">Iași</option>
                                            <option value="Constanța">Constanța</option>
                                            <option value="Brașov">Brașov</option>
                                            <option value="Craiova">Craiova</option>
                                            <option value="Galați">Galați</option>
                                            <option value="Ploiești">Ploiești</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-label-sm font-label-md text-on-surface-variant mb-1">Încarcă o Imagine (Opțional)</label>
                                    <div className="border border-dashed border-outline-variant rounded-xl p-3 text-center hover:border-primary transition-colors bg-surface-container-lowest">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={e => setFormTask({ ...formTask, imagine: e.target.files[0] })}
                                            className="w-full text-label-sm font-label-sm text-outline file:mr-2 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary-container file:text-on-primary-container hover:file:opacity-90 cursor-pointer"
                                        />
                                        {formTask.imagine && (
                                            <div className="mt-3">
                                                <p className="text-[10px] font-bold text-primary mb-1 text-left m-0">Previzualizare:</p>
                                                <img
                                                    src={URL.createObjectURL(formTask.imagine)}
                                                    alt="Preview"
                                                    className="w-full h-24 object-cover rounded-lg border border-outline-variant"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-2">
                                    <button
                                        type="submit"
                                        className="w-full bg-primary text-on-primary py-2.5 rounded-xl font-headline-md text-label-md shadow-lg hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer border-none"
                                    >
                                        Postează Anunțul
                                    </button>
                                </div>
                            </form>
                        </div>
                    </aside>
                )}
            </div>
        </div>
    );
}

export default TaskList;
import React, { useState, useEffect, useRef } from 'react';
import api from '../api';

function Chat({ utilizatorCurent }) {
    const [meniuDeschis, setMeniuDeschis] = useState(false);
    const [conversatii, setConversatii] = useState([]);
    const [chatActiv, setChatActiv] = useState(null);
    const [mesaje, setMesaje] = useState([]);
    const [mesajNou, setMesajNou] = useState('');

    const mesajeEndRef = useRef(null);
    const chatContainerRef = useRef(null);
    const avatarDefault = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";

    const fetchConversatii = async () => {
        try {
            const response = await api.get('/mesaje/conversatii');
            setConversatii(response.data);
        } catch (error) {
            console.error("Eroare conversatii:", error);
        }
    };

    useEffect(() => {
        if (!utilizatorCurent) return;
        fetchConversatii();
        const int = setInterval(fetchConversatii, 5000);
        return () => clearInterval(int);
    }, [utilizatorCurent]);

    const totalNecitite = conversatii.reduce((acc, conv) => acc + conv.necitite, 0);
    const afisajNecitite = totalNecitite >= 10 ? '+10' : totalNecitite;

    useEffect(() => {
        if (!chatActiv) return;

        const fetchDataChat = async () => {
            try {
                await api.put(`/mesaje/citite/${chatActiv.task._id}`);
                const res = await api.get(`/mesaje/task/${chatActiv.task._id}`);
                setMesaje(res.data);
                fetchConversatii();
            } catch (error) {
                console.error("Eroare la chat:", error);
            }
        };

        fetchDataChat();
        const int = setInterval(fetchDataChat, 3000);
        return () => clearInterval(int);
    }, [chatActiv]);

    useEffect(() => {
        mesajeEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [mesaje]);

    useEffect(() => {
        const handleClickInAfara = (event) => {
            if (chatContainerRef.current && !chatContainerRef.current.contains(event.target)) {
                setMeniuDeschis(false);
            }
        };
        document.addEventListener('mousedown', handleClickInAfara);
        return () => {
            document.removeEventListener('mousedown', handleClickInAfara);
        };
    }, []);

    const handleTrimite = async (e) => {
        e.preventDefault();
        if (!mesajNou.trim() || !chatActiv) return;

        try {
            await api.post('/mesaje', {
                id_task: chatActiv.task._id,
                id_destinatar: chatActiv.partener._id,
                continut: mesajNou
            });
            setMesajNou('');
            const res = await api.get(`/mesaje/task/${chatActiv.task._id}`);
            setMesaje(res.data);
        } catch (error) {
            console.error("Eroare la trimitere:", error);
        }
    };

    if (!utilizatorCurent) return null;

    return (
        <div ref={chatContainerRef} className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50 flex flex-col items-end">

            {meniuDeschis && (
                <div className="flex flex-col w-[340px] sm:w-[380px] h-[500px] sm:h-[560px] bg-white rounded-xl shadow-[0_12px_40px_rgba(79,95,119,0.12)] border border-outline-variant mb-4 overflow-hidden origin-bottom-right transition-all duration-300">

                    {!chatActiv ? (
                        <div className="flex flex-col h-full bg-white">
                            <header className="p-4 bg-primary text-on-primary flex justify-between items-center shrink-0">
                                <h2 className="font-headline-md text-headline-md m-0">Mesajele Mele</h2>
                                <button onClick={() => setMeniuDeschis(false)} className="p-1 hover:bg-primary-container rounded-full transition-colors cursor-pointer border-none bg-transparent flex items-center text-white">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </header>

                            <div className="flex-1 overflow-y-auto p-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                                {conversatii.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center px-4 opacity-70">
                                        <span className="material-symbols-outlined text-5xl text-outline mb-2">forum</span>
                                        <p className="text-on-surface-variant text-label-md m-0">Nu ai nicio conversație activă în acest moment.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-1">
                                        {conversatii.map(conv => (
                                            <div
                                                key={conv.task._id}
                                                onClick={() => setChatActiv(conv)}
                                                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors relative group ${conv.necitite > 0 ? 'bg-surface-container hover:bg-surface-container-high' : 'hover:bg-surface-container-low'
                                                    }`}
                                            >
                                                <div className="relative">
                                                    <img
                                                        src={conv.partener.avatar ? `http://localhost:5000${conv.partener.avatar}` : avatarDefault}
                                                        alt="Avatar"
                                                        className="w-12 h-12 rounded-full object-cover border border-outline-variant"
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-baseline">
                                                        <h3 className={`font-label-md truncate m-0 ${conv.necitite > 0 ? 'text-on-surface font-bold' : 'text-on-surface-variant'}`}>
                                                            {conv.partener.nume} {conv.partener.prenume}
                                                        </h3>
                                                    </div>
                                                    <p className="text-label-sm text-primary font-semibold truncate m-0 mt-0.5">{conv.task.titlu}</p>
                                                </div>
                                                {conv.necitite > 0 && (
                                                    <div className="w-2.5 h-2.5 bg-error rounded-full shrink-0 shadow-sm"></div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col h-full bg-surface">
                            <header className="p-4 bg-surface-container-lowest border-b border-outline-variant flex items-center gap-3 shrink-0">
                                <button onClick={() => setChatActiv(null)} className="p-1 hover:bg-surface-container-low rounded-full transition-colors text-primary flex items-center cursor-pointer border-none bg-transparent">
                                    <span className="material-symbols-outlined">arrow_back</span>
                                </button>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-label-md text-on-surface truncate m-0">{chatActiv.partener.nume} {chatActiv.partener.prenume}</h3>
                                    <p className="text-[12px] text-on-surface-variant truncate m-0 mt-0.5">{chatActiv.task.titlu}</p>
                                </div>
                            </header>

                            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-surface" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                                {mesaje.length === 0 ? (
                                    <p className="text-center text-outline text-[13px] mt-4">Trimite un prim mesaj pentru a începe conversația!</p>
                                ) : (
                                    mesaje.map(m => {
                                        const isMine = m.id_expeditor?._id === utilizatorCurent?.id || m.id_expeditor === utilizatorCurent?.id;
                                        // Formatam ora daca exista data
                                        const timeStr = m.createdAt ? new Date(m.createdAt).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' }) : '';

                                        return (
                                            <div key={m._id} className={`flex flex-col ${isMine ? 'items-end ml-auto' : 'items-start'} max-w-[85%]`}>
                                                <div className={`px-4 py-2 text-body-md shadow-sm ${isMine
                                                    ? 'bg-primary text-white rounded-[12px_12px_2px_12px]'
                                                    : 'bg-surface-container-high text-on-surface rounded-[12px_12px_12px_2px]'
                                                    }`}>
                                                    {m.continut}
                                                </div>
                                                {timeStr && (
                                                    <span className={`text-[10px] text-on-surface-variant mt-1 ${isMine ? 'mr-1' : 'ml-1'}`}>
                                                        {timeStr}
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                                <div ref={mesajeEndRef} />
                            </div>

                            <form onSubmit={handleTrimite} className="p-3 sm:p-4 bg-surface-container-lowest border-t border-outline-variant flex gap-2 items-end">
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        value={mesajNou}
                                        onChange={e => setMesajNou(e.target.value)}
                                        placeholder="Scrie un mesaj..."
                                        className="w-full py-2.5 px-4 bg-surface-container-low rounded-full border border-transparent focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary text-body-md outline-none transition-all"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={!mesajNou.trim()}
                                    className="bg-primary text-on-primary w-11 h-11 rounded-full hover:bg-primary-container transition-all active:scale-95 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer border-none shadow-sm shrink-0"
                                >
                                    <span className="material-symbols-outlined" style={{ marginLeft: '4px' }}>send</span>
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            )}

            <button
                onClick={() => setMeniuDeschis(!meniuDeschis)}
                className="w-14 h-14 md:w-16 md:h-16 bg-primary text-on-primary rounded-full shadow-[0_4px_14px_rgba(0,104,96,0.4)] flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 relative cursor-pointer border-none group"
            >
                {totalNecitite > 0 && !meniuDeschis && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-error text-white text-[11px] font-bold flex items-center justify-center rounded-full border-2 border-surface shadow-sm z-10">
                        {afisajNecitite}
                    </div>
                )}
                <span className="material-symbols-outlined text-[28px] md:text-[32px] transition-transform duration-300 group-hover:rotate-12">
                    {meniuDeschis ? 'close' : 'chat_bubble'}
                </span>
            </button>

        </div>
    );
}

export default Chat;
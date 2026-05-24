import React, { useState, useEffect, useRef } from 'react';
import api from '../api';

function Chat({ utilizatorCurent }) {
    const [meniuDeschis, setMeniuDeschis] = useState(false);
    const [conversatii, setConversatii] = useState([]);
    const [chatActiv, setChatActiv] = useState(null);
    const [mesaje, setMesaje] = useState([]);
    const [mesajNou, setMesajNou] = useState('');

    const mesajeEndRef = useRef(null);

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
        <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999 }}>

            {meniuDeschis && (
                <div style={{
                    position: 'absolute', bottom: '70px', right: '0', width: '350px', height: '450px',
                    backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '12px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', overflow: 'hidden'
                }}>

                    {!chatActiv ? (
                        <>
                            <div style={{ backgroundColor: '#2c3e50', padding: '15px', color: 'white', fontWeight: 'bold' }}>
                                Mesajele Mele
                            </div>
                            <div style={{ flex: 1, overflowY: 'auto', padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {conversatii.length === 0 ? (
                                    <p style={{ textAlign: 'center', color: '#888', marginTop: '2rem' }}>Nu ai nicio conversatie activa.</p>
                                ) : (
                                    conversatii.map(conv => (
                                        <div
                                            key={conv.task._id}
                                            onClick={() => setChatActiv(conv)}
                                            style={{
                                                padding: '12px', borderRadius: '8px', cursor: 'pointer', border: '1px solid #eee',
                                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                backgroundColor: conv.necitite > 0 ? 'white' : '#f0f0f0' // Alb pt necitite, Gri pt citite
                                            }}
                                        >
                                            <div>
                                                <div style={{ fontWeight: conv.necitite > 0 ? 'bold' : 'normal', color: '#333', fontSize: '0.95rem' }}>
                                                    {conv.partener.nume} {conv.partener.prenume}
                                                </div>
                                                <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '3px' }}>
                                                    Anunt: {conv.task.titlu}
                                                </div>
                                            </div>

                                            {/* Badge numar mesaje pt fiecare conversatie */}
                                            {conv.necitite > 0 && (
                                                <div style={{ backgroundColor: '#e74c3c', color: 'white', borderRadius: '50%', padding: '4px 8px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                                    {conv.necitite}
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            <div style={{ backgroundColor: '#2c3e50', padding: '12px 15px', color: 'white', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <button onClick={() => setChatActiv(null)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.2rem', padding: '0 5px' }}>
                                    ←
                                </button>
                                <div>
                                    <div style={{ fontWeight: 'bold' }}>{chatActiv.partener.nume}</div>
                                    <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>{chatActiv.task.titlu}</div>
                                </div>
                            </div>

                            <div style={{ flex: 1, overflowY: 'auto', padding: '15px', display: 'flex', flexDirection: 'column', gap: '10px', backgroundColor: '#f9f9f9' }}>
                                {mesaje.length === 0 ? (
                                    <p style={{ textAlign: 'center', color: '#888', fontSize: '0.9rem' }}>Niciun mesaj. Trimite un salut!</p>
                                ) : (
                                    mesaje.map(m => {
                                        const isMine = m.id_expeditor?._id === utilizatorCurent?.id || m.id_expeditor === utilizatorCurent?.id;
                                        return (
                                            <div key={m._id} style={{ alignSelf: isMine ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                                                <div style={{
                                                    backgroundColor: isMine ? '#11998e' : '#e0e0e0', color: isMine ? 'white' : '#333',
                                                    padding: '8px 12px', borderRadius: '15px', borderBottomRightRadius: isMine ? '0' : '15px', borderBottomLeftRadius: isMine ? '15px' : '0'
                                                }}>
                                                    {m.continut}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                                <div ref={mesajeEndRef} />
                            </div>

                            <form onSubmit={handleTrimite} style={{ display: 'flex', borderTop: '1px solid #ddd', backgroundColor: 'white' }}>
                                <input type="text" value={mesajNou} onChange={e => setMesajNou(e.target.value)} placeholder="Scrie un mesaj..." style={{ flex: 1, padding: '12px', border: 'none', outline: 'none' }} />
                                <button type="submit" style={{ backgroundColor: 'transparent', color: '#11998e', border: 'none', padding: '0 15px', cursor: 'pointer', fontWeight: 'bold' }}>
                                    Trimite
                                </button>
                            </form>
                        </>
                    )}
                </div>
            )}

            <button
                onClick={() => setMeniuDeschis(!meniuDeschis)}
                style={{
                    width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#2c3e50', color: 'white',
                    border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)', position: 'relative'
                }}
            >
                <svg width="28" height="28" fill="white" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"></path></svg>

                {totalNecitite > 0 && (
                    <div style={{
                        position: 'absolute', top: '-5px', right: '-5px', backgroundColor: '#e74c3c', color: 'white',
                        borderRadius: '50%', minWidth: '22px', height: '22px', fontSize: '0.8rem', fontWeight: 'bold',
                        display: 'flex', justifyContent: 'center', alignItems: 'center', border: '2px solid white'
                    }}>
                        {afisajNecitite}
                    </div>
                )}
            </button>
        </div>
    );
}

export default Chat;
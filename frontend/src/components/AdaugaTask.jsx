import React, { useState } from 'react';
import api from '../api';

function AdaugaTask({ onTaskAdaugat, onAnulare }) {
    const [titlu, setTitlu] = useState('');
    const [descriere, setDescriere] = useState('');
    const [locatie, setLocatie] = useState('');
    const [buget, setBuget] = useState('');
    const [loading, setLoading] = useState(false);
    const [eroare, setEroare] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setEroare('');

        try {
            await api.post('/taskuri', {
                titlu,
                descriere,
                locatie,
                buget_estimativ: Number(buget)
            });
            onTaskAdaugat();
        } catch (error) {
            console.error("Eroare la adaugare task:", error);
            setEroare(error.response?.data?.mesaj || 'A aparut o eroare la publicarea anuntului.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', border: '1px solid #11998e', marginBottom: '2rem', boxShadow: '0 4px 6px rgba(17, 153, 142, 0.1)' }}>
            <h3 style={{ marginTop: 0, color: '#11998e' }}>Posteaza un Anunt Nou</h3>

            {eroare && <div style={{ color: 'red', marginBottom: '1rem' }}>{eroare}</div>}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.3rem' }}>Titlu scurt (ex: Reparatie teava)</label>
                    <input type="text" value={titlu} onChange={(e) => setTitlu(e.target.value)} required style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
                </div>

                <div>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.3rem' }}>Descriere detaliata</label>
                    <textarea value={descriere} onChange={(e) => setDescriere(e.target.value)} required rows="3" style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.3rem' }}>Locatie (Sector / Oraș)</label>
                        <input type="text" value={locatie} onChange={(e) => setLocatie(e.target.value)} required style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.3rem' }}>Buget estimat (RON)</label>
                        <input type="number" value={buget} onChange={(e) => setBuget(e.target.value)} required style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <button type="submit" disabled={loading} style={{ flex: 1, padding: '0.8rem', backgroundColor: '#11998e', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                        {loading ? 'Se publica...' : 'Publica Anuntul'}
                    </button>
                    <button type="button" onClick={onAnulare} style={{ flex: 1, padding: '0.8rem', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                        Anuleaza
                    </button>
                </div>
            </form>
        </div>
    );
}

export default AdaugaTask;
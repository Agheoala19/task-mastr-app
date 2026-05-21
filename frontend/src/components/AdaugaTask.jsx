import React, { useState } from 'react';
import api from '../api';

function AdaugaTask({ onTaskAdaugat, onAnulare }) {
    const [titlu, setTitlu] = useState('');
    const [descriere, setDescriere] = useState('');
    const [buget, setBuget] = useState('');
    const [locatie, setLocatie] = useState('');
    const [imagine, setImagine] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('titlu', titlu);
            formData.append('descriere', descriere);
            formData.append('buget_estimativ', buget);
            formData.append('locatie', locatie);
            if (imagine) {
                formData.append('imagine', imagine);
            }

            await api.post('/taskuri', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            alert('Anunt adaugat cu succes!');
            onTaskAdaugat();
        } catch (error) {
            console.error('Eroare la adaugare task:', error);
            alert('Eroare la adaugarea anuntului.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e0e0e0', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ margin: 0, color: '#11998e' }}>Adauga un anunt nou</h3>

            <input type="text" placeholder="Titlu anunt" value={titlu} onChange={(e) => setTitlu(e.target.value)} required style={{ padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc' }} />
            <textarea placeholder="Descriere detaliata" value={descriere} onChange={(e) => setDescriere(e.target.value)} required style={{ padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc', minHeight: '100px' }} />
            <input type="number" placeholder="Buget estimativ (RON)" value={buget} onChange={(e) => setBuget(e.target.value)} required style={{ padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc' }} />
            <input type="text" placeholder="Locatie (Oras, Sector)" value={locatie} onChange={(e) => setLocatie(e.target.value)} required style={{ padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc' }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.9rem', color: '#555', fontWeight: 'bold' }}>Adauga o imagine relevanta:</label>
                <input type="file" accept="image/*" onChange={(e) => setImagine(e.target.files[0])} style={{ fontSize: '0.9rem' }} />
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <button type="submit" disabled={loading} style={{ flex: 1, backgroundColor: '#11998e', color: 'white', border: 'none', padding: '0.8rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                    {loading ? 'Se salveaza...' : 'Publica Anunt'}
                </button>
                <button type="button" onClick={onAnulare} style={{ flex: 1, backgroundColor: '#d32f2f', color: 'white', border: 'none', padding: '0.8rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                    Anuleaza
                </button>
            </div>
        </form>
    );
}

export default AdaugaTask;
import React, { useState } from 'react';
import api from '../api';

function Inregistrare({ onInregistrareSuccess, onInapoiLaLogin }) {
    const [nume, setNume] = useState('');
    const [prenume, setPrenume] = useState('');
    const [email, setEmail] = useState('');
    const [parola, setParola] = useState('');
    const [telefon, setTelefon] = useState('');
    const [rol, setRol] = useState('beneficiar');
    const [eroare, setEroare] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setEroare('');
        setLoading(true);

        try {
            const response = await api.post('/auth/inregistrare', {
                nume, prenume, email, parola, telefon, rol
            });
            localStorage.setItem('token', response.data.token);
            onInregistrareSuccess();
        } catch (error) {
            setEroare(error.response?.data?.mesaj || 'Eroare la inregistrare.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '4rem auto', padding: '2rem', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <h2 style={{ color: '#11998e', textAlign: 'center', marginBottom: '1.5rem' }}>Creare Cont Nou</h2>

            {eroare && <div style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>{eroare}</div>}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
                    <label style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input type="radio" value="beneficiar" checked={rol === 'beneficiar'} onChange={(e) => setRol(e.target.value)} />
                        Vreau Mester
                    </label>
                    <label style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input type="radio" value="prestator" checked={rol === 'prestator'} onChange={(e) => setRol(e.target.value)} />
                        Sunt Mester
                    </label>
                </div>

                <input type="text" placeholder="Nume" value={nume} onChange={(e) => setNume(e.target.value)} required style={{ padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc' }} />
                <input type="text" placeholder="Prenume" value={prenume} onChange={(e) => setPrenume(e.target.value)} required style={{ padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc' }} />
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc' }} />
                <input type="password" placeholder="Parola" value={parola} onChange={(e) => setParola(e.target.value)} required style={{ padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc' }} />
                <input type="tel" placeholder="Telefon" value={telefon} onChange={(e) => setTelefon(e.target.value)} required style={{ padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc' }} />

                <button type="submit" disabled={loading} style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#11998e', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                    {loading ? 'Se creeaza...' : 'Inregistrare'}
                </button>

                <button type="button" onClick={onInapoiLaLogin} style={{ padding: '0.5rem', backgroundColor: 'transparent', color: '#11998e', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                    Ai deja cont? Logheaza-te aici
                </button>
            </form>
        </div>
    );
}

export default Inregistrare;
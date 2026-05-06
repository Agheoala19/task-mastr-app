import React, { useState } from 'react';
import api from '../api';

function Login({ onLoginSuccess, onGoToRegister }) {
    const [email, setEmail] = useState('');
    const [parola, setParola] = useState('');
    const [eroare, setEroare] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setEroare('');
        setLoading(true);

        try {
            const response = await api.post('/auth/logare', { email, parola });
            localStorage.setItem('token', response.data.token);
            onLoginSuccess();
        } catch (error) {
            setEroare(error.response?.data?.mesaj || 'Eroare la conectare. Verifica datele!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '4rem auto', padding: '2rem', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <h2 style={{ color: '#11998e', textAlign: 'center', marginBottom: '1.5rem' }}>Conectare Cont</h2>

            {eroare && (
                <div style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '10px', borderRadius: '4px', marginBottom: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>
                    {eroare}
                </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                />

                <input
                    type="password"
                    placeholder="Parola"
                    value={parola}
                    onChange={(e) => setParola(e.target.value)}
                    required
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                />

                <button
                    type="submit"
                    disabled={loading}
                    style={{ marginTop: '1rem', padding: '1rem', backgroundColor: loading ? '#ccc' : '#11998e', color: 'white', border: 'none', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '1rem' }}
                >
                    {loading ? 'Se conecteaza...' : 'Intra in cont'}
                </button>

                <button
                    type="button"
                    onClick={onGoToRegister}
                    style={{ marginTop: '0.5rem', padding: '0.5rem', backgroundColor: 'transparent', color: '#11998e', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                >
                    Nu ai cont? Inregistreaza-te aici
                </button>
            </form>
        </div>
    );
}

export default Login;
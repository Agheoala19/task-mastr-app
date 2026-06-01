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
    const [arataParola, setArataParola] = useState(false);

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
            setEroare(error.response?.data?.mesaj || 'Eroare la înregistrare. Verifică datele!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-background min-h-[calc(100vh-64px)] flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary-fixed opacity-10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-secondary-container opacity-20 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="w-full max-w-[500px] relative z-10">
                <div className="flex justify-center mb-6">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>task_alt</span>
                        <span className="font-headline-md text-headline-md font-bold text-primary">TaskMastR</span>
                    </div>
                </div>

                <div className="bg-surface-container-lowest shadow-[0_20px_25px_-5px_rgba(79,95,119,0.05),0_10px_10px_-5px_rgba(79,95,119,0.04)] rounded-xl border border-outline-variant p-6 md:p-10">
                    <header className="text-center mb-6">
                        <h1 className="font-headline-lg text-headline-lg text-on-surface mb-2 mt-0">Creare Cont Nou</h1>
                        <p className="font-body-md text-body-md text-on-surface-variant m-0">Alătură-te comunității și începe imediat</p>
                    </header>

                    {eroare && (
                        <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-lg flex items-center gap-3 border border-error/20">
                            <span className="material-symbols-outlined text-error">error</span>
                            <p className="font-label-md text-label-md m-0">{eroare}</p>
                        </div>
                    )}

                    <form className="space-y-5" onSubmit={handleSubmit}>

                        <div className="space-y-2 mb-2">
                            <label className="font-label-md text-label-md text-on-surface-variant">Cu ce scop îți creezi contul?</label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setRol('beneficiar')}
                                    className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all cursor-pointer ${rol === 'beneficiar'
                                        ? 'border-primary bg-primary-container/10 text-primary'
                                        : 'border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low'
                                        }`}
                                >
                                    <span className="material-symbols-outlined text-3xl">person_search</span>
                                    <span className="font-bold text-label-md">Caut Meșter</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRol('prestator')}
                                    className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all cursor-pointer ${rol === 'prestator'
                                        ? 'border-primary bg-primary-container/10 text-primary'
                                        : 'border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low'
                                        }`}
                                >
                                    <span className="material-symbols-outlined text-3xl">handyman</span>
                                    <span className="font-bold text-label-md">Sunt Meșter</span>
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="font-label-md text-label-sm text-on-surface-variant">Nume</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="material-symbols-outlined text-outline text-[18px] group-focus-within:text-primary transition-colors">person</span>
                                    </div>
                                    <input
                                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-2.5 pl-10 pr-4 text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                                        type="text"
                                        placeholder="Popescu"
                                        value={nume}
                                        onChange={(e) => setNume(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="font-label-md text-label-sm text-on-surface-variant">Prenume</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="material-symbols-outlined text-outline text-[18px] group-focus-within:text-primary transition-colors">person</span>
                                    </div>
                                    <input
                                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-2.5 pl-10 pr-4 text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                                        type="text"
                                        placeholder="Andrei"
                                        value={prenume}
                                        onChange={(e) => setPrenume(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="font-label-md text-label-sm text-on-surface-variant">Email</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-outline text-[18px] group-focus-within:text-primary transition-colors">mail</span>
                                </div>
                                <input
                                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-2.5 pl-10 pr-4 text-on-surface font-body-md placeholder:text-outline-variant focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                                    type="email"
                                    placeholder="exemplu@taskmastr.ro"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="font-label-md text-label-sm text-on-surface-variant">Telefon</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-outline text-[18px] group-focus-within:text-primary transition-colors">phone</span>
                                </div>
                                <input
                                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-2.5 pl-10 pr-4 text-on-surface font-body-md placeholder:text-outline-variant focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                                    type="tel"
                                    placeholder="07XX XXX XXX"
                                    value={telefon}
                                    onChange={(e) => setTelefon(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="font-label-md text-label-sm text-on-surface-variant">Parola</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-outline text-[18px] group-focus-within:text-primary transition-colors">lock</span>
                                </div>
                                <input
                                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-2.5 pl-10 pr-12 text-on-surface font-body-md placeholder:text-outline-variant focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                                    type={arataParola ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={parola}
                                    onChange={(e) => setParola(e.target.value)}
                                    required
                                />
                                <button
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-outline-variant hover:text-outline transition-colors cursor-pointer bg-transparent border-none"
                                    type="button"
                                    onClick={() => setArataParola(!arataParola)}
                                >
                                    <span className="material-symbols-outlined text-[20px]">{arataParola ? 'visibility_off' : 'visibility'}</span>
                                </button>
                            </div>
                        </div>

                        <button
                            className="w-full mt-4 bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md py-3.5 rounded-lg shadow-sm hover:shadow-md active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 group cursor-pointer border-none disabled:opacity-70 disabled:cursor-not-allowed"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? 'Se creează contul...' : 'Finalizează Înregistrarea'}
                            {!loading && <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>}
                        </button>
                    </form>
                </div>

                <footer className="mt-8 text-center">
                    <p className="font-body-md text-body-md text-on-surface-variant m-0">
                        Ai deja un cont creat?
                        <button
                            onClick={onInapoiLaLogin}
                            className="text-primary font-bold hover:underline decoration-2 underline-offset-4 ml-1 cursor-pointer bg-transparent border-none text-body-md"
                        >
                            Loghează-te aici
                        </button>
                    </p>
                </footer>
            </div>
        </div>
    );
}

export default Inregistrare;
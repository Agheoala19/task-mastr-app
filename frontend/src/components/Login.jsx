import React, { useState } from 'react';
import api from '../api';

function Login({ onLoginSuccess, onGoToRegister }) {
    const [email, setEmail] = useState('');
    const [parola, setParola] = useState('');
    const [eroare, setEroare] = useState('');
    const [loading, setLoading] = useState(false);
    const [arataParola, setArataParola] = useState(false); // Stare pentru vizibilitatea parolei

    const handleSubmit = async (e) => {
        e.preventDefault();
        setEroare('');
        setLoading(true);

        try {
            const response = await api.post('/auth/logare', { email, parola });
            localStorage.setItem('token', response.data.token);
            onLoginSuccess();
        } catch (error) {
            setEroare(error.response?.data?.mesaj || 'Eroare la conectare. Verifică datele!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-background min-h-[calc(100vh-64px)] flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
            {/* Decorative Elements for "Organized Momentum" */}
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary-fixed opacity-10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-secondary-container opacity-20 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="w-full max-w-[440px] relative z-10">
                <div className="flex justify-center mb-8">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>task_alt</span>
                        <span className="font-headline-md text-headline-md font-bold text-primary">TaskMastR</span>
                    </div>
                </div>

                <div className="bg-surface-container-lowest shadow-[0_20px_25px_-5px_rgba(79,95,119,0.05),0_10px_10px_-5px_rgba(79,95,119,0.04)] rounded-xl border border-outline-variant p-8 md:p-10">
                    <header className="text-center mb-8">
                        <h1 className="font-headline-lg text-headline-lg text-on-surface mb-2 mt-0">Conectare Cont</h1>
                        <p className="font-body-md text-body-md text-on-surface-variant m-0">Introdu datele tale pentru a accesa platforma</p>
                    </header>

                    {eroare && (
                        <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-lg flex items-center gap-3 border border-error/20">
                            <span className="material-symbols-outlined text-error">error</span>
                            <p className="font-label-md text-label-md m-0">{eroare}</p>
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-2">
                            <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="email">Email</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-outline text-[20px] group-focus-within:text-primary transition-colors">mail</span>
                                </div>
                                <input
                                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-3.5 pl-11 pr-4 text-on-surface font-body-md placeholder:text-outline-variant focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                                    id="email"
                                    type="email"
                                    placeholder="exemplu@taskmastr.ro"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="password">Parola</label>
                                <a className="font-label-md text-label-md text-primary hover:underline decoration-2 underline-offset-4" href="#" onClick={(e) => e.preventDefault()}>Ai uitat parola?</a>
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-outline text-[20px] group-focus-within:text-primary transition-colors">lock</span>
                                </div>
                                <input
                                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-3.5 pl-11 pr-12 text-on-surface font-body-md placeholder:text-outline-variant focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                                    id="password"
                                    type={arataParola ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={parola}
                                    onChange={(e) => setParola(e.target.value)}
                                    required
                                />
                                <button
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-outline-variant hover:text-outline transition-colors cursor-pointer bg-transparent border-none"
                                    type="button"
                                    onClick={() => setArataParola(!arataParola)}
                                >
                                    <span className="material-symbols-outlined">{arataParola ? 'visibility_off' : 'visibility'}</span>
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center">
                            <input
                                className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary focus:ring-offset-0 transition-all cursor-pointer"
                                id="remember"
                                type="checkbox"
                            />
                            <label className="ml-3 font-body-md text-body-md text-on-surface-variant cursor-pointer select-none" htmlFor="remember">
                                Ține-mă minte pe acest dispozitiv
                            </label>
                        </div>

                        <button
                            className="w-full bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md py-4 rounded-lg shadow-sm hover:shadow-md active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 group cursor-pointer border-none disabled:opacity-70 disabled:cursor-not-allowed"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? 'Se conectează...' : 'Intră în cont'}
                            {!loading && <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>}
                        </button>
                    </form>


                </div>

                <footer className="mt-8 text-center">
                    <p className="font-body-md text-body-md text-on-surface-variant m-0">
                        Nu ai încă un cont?
                        <button
                            onClick={onGoToRegister}
                            className="text-primary font-bold hover:underline decoration-2 underline-offset-4 ml-1 cursor-pointer bg-transparent border-none text-body-md"
                        >
                            Înregistrează-te aici
                        </button>
                    </p>
                </footer>
            </div>
        </div>
    );
}

export default Login;
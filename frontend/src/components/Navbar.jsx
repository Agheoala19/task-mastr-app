import React from 'react';
import NotificariDropdown from './NotificariDropdown';

function Navbar({ isLoggedIn, onLogout, onNavigate, onSearch, currentView, utilizatorCurent }) {
    return (
        <header className="bg-surface sticky top-0 z-50 nav-shadow">
            <div className="flex justify-between items-center w-full px-4 md:px-8 h-16 max-w-container-max mx-auto">

                <div className="flex items-center gap-12">
                    <button
                        onClick={() => onNavigate(isLoggedIn ? 'tasks' : 'login')}
                        className="font-headline-md text-2xl font-extrabold text-primary tracking-tight bg-transparent border-none cursor-pointer"
                    >
                        TaskMastR
                    </button>

                    <nav className="hidden md:flex items-center gap-8">

                        {isLoggedIn && utilizatorCurent?.rol !== 'administrator' && (
                            <button
                                onClick={() => onNavigate('tasks')}
                                className={`${currentView === 'tasks' ? 'text-primary border-b-2 border-primary font-bold' : 'text-on-surface-variant font-medium'} pb-1 font-label-md hover:text-primary transition-colors duration-200 bg-transparent cursor-pointer border-none`}
                            >
                                Acasă
                            </button>
                        )}
                    </nav>
                </div>

                {currentView === 'tasks' && utilizatorCurent?.rol !== 'administrator' && (
                    <div className="hidden lg:flex flex-1 max-w-md mx-8">
                        <div className="relative w-full">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
                            <input
                                className="w-full bg-surface-container-low border-none rounded-full py-2 pl-10 pr-4 text-body-md focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none"
                                placeholder="Caută anunțuri..."
                                type="text"
                                onChange={(e) => onSearch(e.target.value)}
                            />
                        </div>
                    </div>
                )}

                <div className="flex items-center gap-4 md:gap-6">
                    {!isLoggedIn ? (
                        <>
                            <button
                                onClick={() => onNavigate('login')}
                                className="text-on-surface font-semibold font-label-md hover:text-primary transition-colors duration-200 bg-transparent border-none cursor-pointer"
                            >
                                Logare
                            </button>
                            <button
                                onClick={() => onNavigate('register')}
                                className="bg-primary text-on-primary px-6 py-2.5 rounded-full font-label-md font-bold hover:opacity-90 active:scale-95 transition-all shadow-sm border-none cursor-pointer"
                            >
                                Înregistrare
                            </button>
                        </>
                    ) : (
                        <>
                            {currentView === 'tasks' && utilizatorCurent?.rol !== 'administrator' && (
                                <button className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded-full lg:hidden bg-transparent border-none cursor-pointer">
                                    <span className="material-symbols-outlined">search</span>
                                </button>
                            )}

                            {utilizatorCurent?.rol !== 'administrator' && (
                                <NotificariDropdown onNavigate={onNavigate} />
                            )}

                            <div className="hidden sm:block h-8 w-[1px] bg-outline-variant mx-2"></div>

                            {utilizatorCurent?.rol !== 'administrator' && (
                                <button
                                    onClick={() => onNavigate('profil')}
                                    className={`${currentView === 'profil' ? 'text-primary border-b-2 border-primary font-bold' : 'text-on-surface-variant font-medium'} flex items-center gap-2 group p-1.5 rounded-full hover:bg-surface-container-low transition-all bg-transparent border-none cursor-pointer`}
                                >
                                    <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container">
                                        <span className="material-symbols-outlined text-[20px]" data-icon="person">person</span>
                                    </div>
                                    <span className="hidden sm:inline font-label-md text-on-surface group-hover:text-primary">Profilul meu</span>
                                </button>
                            )}

                            {utilizatorCurent?.rol === 'administrator' && (
                                <button
                                    onClick={() => onNavigate('admin')}
                                    className={`${currentView === 'admin' ? 'text-primary border-b-2 border-primary font-bold' : 'text-on-surface-variant font-medium'} pb-1 font-label-md hover:text-primary transition-colors duration-200 bg-transparent border-none cursor-pointer`}
                                >
                                    Panou Admin
                                </button>
                            )}

                            <button
                                onClick={onLogout}
                                className="ml-2 border border-outline-variant text-on-surface-variant hover:border-error hover:text-error px-4 py-2 rounded-lg font-label-md transition-all flex items-center gap-2 active:scale-95 bg-transparent cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-[18px]">logout</span>
                                <span className="hidden md:inline">Ieșire</span>
                            </button>
                        </>
                    )}
                </div>

            </div>
        </header>
    );
}

export default Navbar;
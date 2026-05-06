import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Navbar from './components/Navbar'
import TaskList from './components/TaskList'
import Login from './components/Login'
import Inregistrare from './components/Inregistrare'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [view, setView] = useState('login');
  const [utilizatorCurent, setUtilizatorCurent] = useState(null);
  const [termenCautare, setTermenCautare] = useState('');

  const decodareToken = () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUtilizatorCurent(payload);
        setIsLoggedIn(true);
      } catch (e) {
        console.error("Eroare la decodarea token-ului");
      }
    }
  };

  useEffect(() => {
    decodareToken();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setView('login');
    setUtilizatorCurent(null);
  };

  const handleAuthSuccess = () => {
    decodareToken();
  };

  return (
    <div style={{ backgroundColor: '#f9f9f9', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <Navbar
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
        onNavigate={(newView) => setView(newView)}
        onSearch={setTermenCautare}
      />

      <main>
        {!isLoggedIn ? (
          view === 'login' ? (
            <Login
              onLoginSuccess={handleAuthSuccess}
              onGoToRegister={() => setView('register')}
            />
          ) : (
            <Inregistrare
              onInregistrareSuccess={handleAuthSuccess}
              onInapoiLaLogin={() => setView('login')}
            />
          )
        ) : (
          <TaskList
            utilizatorCurent={utilizatorCurent}
            termenCautare={termenCautare}
          />
        )}
      </main>
    </div>
  )
}

export default App
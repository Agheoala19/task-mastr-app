import { useState, useEffect } from 'react'
import viteLogo from '/vite.svg'
import './App.css'
import Navbar from './components/Navbar'
import TaskList from './components/TaskList'
import Login from './components/Login'
import Inregistrare from './components/Inregistrare'
import Profil from './components/Profil'
import Chat from './components/Chat'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [view, setView] = useState('login');
  const [utilizatorCurent, setUtilizatorCurent] = useState(null);
  const [termenCautare, setTermenCautare] = useState('');
  const [taskTarget, setTaskTarget] = useState(null);

  const decodareToken = () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUtilizatorCurent(payload);
        setIsLoggedIn(true);
        setView('tasks');
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
    setTaskTarget(null);
  };

  const handleAuthSuccess = () => {
    decodareToken();
  };

  const handleNavigate = (newView, taskId = null) => {
    setView(newView);
    setTaskTarget(taskId);
  };

  return (
    <div style={{ backgroundColor: '#f9f9f9', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <Navbar
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
        onNavigate={handleNavigate}
        onSearch={setTermenCautare}
      />

      <Chat utilizatorCurent={utilizatorCurent} />

      <main>
        {!isLoggedIn ? (
          view === 'login' ? (
            <Login
              onLoginSuccess={handleAuthSuccess}
              onGoToRegister={() => handleNavigate('register')}
            />
          ) : (
            <Inregistrare
              onInregistrareSuccess={handleAuthSuccess}
              onInapoiLaLogin={() => handleNavigate('login')}
            />
          )
        ) : (
          view === 'tasks' ? (
            <TaskList
              utilizatorCurent={utilizatorCurent}
              termenCautare={termenCautare}
              onNavigate={handleNavigate}
            />
          ) : (
            <Profil
              utilizatorCurent={utilizatorCurent}
              taskTarget={taskTarget}
            />
          )
        )}
      </main>
    </div>
  )
}

export default App;
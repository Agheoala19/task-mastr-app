import { useState, useEffect } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import TaskList from './components/TaskList';
import Login from './components/Login';
import Inregistrare from './components/Inregistrare';
import Profil from './components/Profil';
import Chat from './components/Chat';
import AdminDashboard from './components/AdminDashboard';

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

  const renderContent = () => {
    if (!isLoggedIn) {
      if (view === 'register') {
        return (
          <Inregistrare
            onInregistrareSuccess={handleAuthSuccess}
            onInapoiLaLogin={() => handleNavigate('login')}
          />
        );
      }
      return (
        <Login
          onLoginSuccess={handleAuthSuccess}
          onGoToRegister={() => handleNavigate('register')}
        />
      );
    }

    if (view === 'profil') {
      return <Profil utilizatorCurent={utilizatorCurent} taskTarget={taskTarget} />;
    }
    if (view === 'admin') {
      return <AdminDashboard utilizatorCurent={utilizatorCurent} />;
    }

    return (
      <TaskList
        utilizatorCurent={utilizatorCurent}
        termenCautare={termenCautare}
        onNavigate={handleNavigate}
        taskTarget={taskTarget}
      />
    );
  };

  return (
    <div className="bg-background min-h-screen font-body-md text-on-surface">
      <Navbar
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
        onNavigate={handleNavigate}
        onSearch={setTermenCautare}
        currentView={view}
        utilizatorCurent={utilizatorCurent}
      />

      <Chat utilizatorCurent={utilizatorCurent} />

      <main>
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
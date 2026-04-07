import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import BookList from './pages/BookList';
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [page, setPage] = useState('books');
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const handleLogin = (data: any) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    setPage('books');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setPage('books');
  };

  if (loading) return null;

  if (!user) {
    return authView === 'login' 
      ? <Login onLogin={handleLogin} onSwitch={() => setAuthView('register')} />
      : <Register onRegister={handleLogin} onSwitch={() => setAuthView('login')} />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar 
        user={user} 
        onLogout={handleLogout} 
        currentPage={page} 
        setPage={setPage} 
      />
      
      <main className="pb-20">
        {page === 'books' && <BookList user={user} />}
        {page === 'dashboard' && (
          user.role === 'admin' ? <AdminDashboard /> : <StudentDashboard />
        )}
        {page === 'my-books' && <StudentDashboard />}
        {page === 'users' && (
          <div className="max-w-7xl mx-auto px-4 py-8 text-center text-slate-500">
            User management coming soon...
          </div>
        )}
      </main>
    </div>
  );
}

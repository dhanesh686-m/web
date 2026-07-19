import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import AuthView from './views/AuthView';
import CustomerView from './views/CustomerView';
import ShopkeeperView from './views/ShopkeeperView';
import DeliveryView from './views/DeliveryView';
import AdminView from './views/AdminView';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [dashboardKey, setDashboardKey] = useState(0); // Useful for force-reloading dashboards

  useEffect(() => {
    checkLoginSession();
  }, []);

  const checkLoginSession = () => {
    const session = localStorage.getItem('swift_session_user');
    if (session) {
      setCurrentUser(JSON.parse(session));
    }
  };

  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    localStorage.setItem('swift_session_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('swift_session_user');
  };

  const handleBrandClick = () => {
    // Force reload active dashboard on logo click
    setDashboardKey(prev => prev + 1);
  };

  const renderActiveDashboard = () => {
    if (!currentUser) {
      return <AuthView onAuthSuccess={handleAuthSuccess} />;
    }

    switch (currentUser.role) {
      case 'customer':
        return <CustomerView key={dashboardKey} />;
      case 'shopkeeper':
        return <ShopkeeperView key={dashboardKey} currentUser={currentUser} />;
      case 'delivery':
        return <DeliveryView key={dashboardKey} currentUser={currentUser} />;
      case 'admin':
        return <AdminView key={dashboardKey} currentUser={currentUser} onSelfSuspended={handleLogout} />;
      default:
        return <AuthView onAuthSuccess={handleAuthSuccess} />;
    }
  };

  return (
    <div className="app-root-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header 
        currentUser={currentUser} 
        onLogout={handleLogout} 
        onBrandClick={handleBrandClick} 
      />
      <main style={{ flex: 1, padding: '2rem' }}>
        {renderActiveDashboard()}
      </main>
    </div>
  );
}

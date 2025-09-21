import React, { useState } from 'react';
import Navbar from './Navbar';
import Home from './Home';
import Gov from './govschemes';
import Crops from './crops';
import Contact from './Contact';
import './App.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import Login from './auth/Login';
import Register from './auth/Register';
import AdminDashboard from './dashboards/AdminDashboard';
import FarmerDashboard from './dashboards/FarmerDashboard';
import BuyerDashboard from './dashboards/BuyerDashboard';

const DashboardSwitch = () => {
  const { user } = useAuth();
  if (!user) return null;
  if (user.role === 'admin') return <AdminDashboard />;
  if (user.role === 'farmer') return <FarmerDashboard />;
  return <BuyerDashboard />;
};

const AppShell = () => {
  const { user } = useAuth();
  const [activePage, setActivePage] = useState('Home');

  const renderPage = () => {
    if (activePage === 'Login') return <Login onSuccess={() => setActivePage('Dashboard')} onSwitchToRegister={() => setActivePage('Register')} />;
    if (activePage === 'Register') return <Register onSuccess={() => setActivePage('Login')} onSwitchToLogin={() => setActivePage('Login')} />;
    if (activePage === 'Dashboard') return <DashboardSwitch />;
    switch (activePage) {
      case 'Home':
        return <Home />;
      case 'About':
        return <Gov/>;
      case 'Projects':
        return <Crops/>;
      case 'Contact':
        return <Contact />;
      default:
        return <Home />;
    }
  };

  return (
    <div style={{ backgroundColor: 'black', color: 'white', minHeight: '100vh' }}>
      <Navbar setActivePage={setActivePage} />
      {user && activePage === 'Login' ? <DashboardSwitch /> : renderPage()}
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <DataProvider>
        <AppShell />
      </DataProvider>
    </AuthProvider>
  );
};

export default App;

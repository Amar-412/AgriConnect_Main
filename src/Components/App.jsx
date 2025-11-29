import { useEffect, useMemo, useState } from 'react';
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
import CartView from './checkout/CartView';
import BillingView from './checkout/BillingView';
import PaymentSuccessView from './checkout/PaymentSuccessView';

const VIEW_STORAGE_KEY = 'agri_app_view';
const INVOICE_STORAGE_KEY = 'agri_invoice_data';
const LAST_INVOICE_STORAGE_KEY = 'agri_last_invoice';

const viewLegacyMap = {
  Home: 'home',
  About: 'schemes',
  Projects: 'crops',
  Contact: 'contact',
  Login: 'login',
  Register: 'register',
  Dashboard: 'dashboard',
};

const readStoredString = (key, fallback) => {
  if (typeof window === 'undefined') return fallback;
  const value = window.localStorage.getItem(key);
  if (!value) return fallback;
  return viewLegacyMap[value] || value;
};

const readStoredJson = (key, fallback) => {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    return fallback;
  }
};

const DashboardSwitch = ({ onBuyNowSingleItem, onOpenCart }) => {
  const { user } = useAuth();
  if (!user) return null;
  const role = (user.role || '').toLowerCase();
  if (role === 'admin') return <AdminDashboard />; 
  if (role === 'farmer') return <FarmerDashboard />;
  return <BuyerDashboard onBuyNowSingleItem={onBuyNowSingleItem} onOpenCart={onOpenCart} />;
};

const AppShell = () => {
  const { user } = useAuth();
  const [view, setView] = useState(() => readStoredString(VIEW_STORAGE_KEY, 'home'));
  const [invoiceData, setInvoiceData] = useState(() => readStoredJson(INVOICE_STORAGE_KEY, null));
  const [lastInvoice, setLastInvoice] = useState(() => readStoredJson(LAST_INVOICE_STORAGE_KEY, null));

  const isBuyer = (user?.role || '').toLowerCase() === 'buyer';

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(VIEW_STORAGE_KEY, view);
    }
  }, [view]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (invoiceData) {
      window.localStorage.setItem(INVOICE_STORAGE_KEY, JSON.stringify(invoiceData));
    } else {
      window.localStorage.removeItem(INVOICE_STORAGE_KEY);
    }
  }, [invoiceData]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (lastInvoice) {
      window.localStorage.setItem(LAST_INVOICE_STORAGE_KEY, JSON.stringify(lastInvoice));
    }
  }, [lastInvoice]);

  useEffect(() => {
    if (!user && ['buyer-dashboard', 'dashboard', 'cart', 'billing', 'success'].includes(view)) {
      setView('home');
    }
  }, [user, view]);

  useEffect(() => {
    if (view === 'billing' && !invoiceData) {
      setView('cart');
    }
  }, [view, invoiceData]);

  const handleNavigate = (nextView) => {
    if (nextView === 'dashboard' && isBuyer) {
      setView('buyer-dashboard');
      return;
    }
    if (nextView === 'cart' && !user) {
      setView('login');
      return;
    }
    setView(nextView);
  };

  const handleProceedToBilling = (invoice) => {
    if (!invoice) return;
    setInvoiceData(invoice);
    setView('billing');
  };

  const handleBuyNowSingleItem = (invoice) => {
    handleProceedToBilling(invoice);
  };

  const handlePaymentSuccess = (completedInvoice) => {
    const invoiceToPersist = completedInvoice || (invoiceData ? { ...invoiceData, paidAt: new Date().toISOString() } : null);
    if (invoiceToPersist) {
      setInvoiceData(invoiceToPersist);
      setLastInvoice(invoiceToPersist);
    }
    setView('success');
  };

  const marketplaceView = useMemo(() => (isBuyer ? 'buyer-dashboard' : 'dashboard'), [isBuyer]);

  const renderView = () => {
    switch (view) {
      case 'home':
        return <Home />;
      case 'schemes':
        return <Gov />;
      case 'crops':
        return <Crops />;
      case 'contact':
        return <Contact />;
      case 'login':
        return (
          <Login
            onSuccess={() => handleNavigate('dashboard')}
            onSwitchToRegister={() => handleNavigate('register')}
          />
        );
      case 'register':
        return (
          <Register
            onSuccess={() => handleNavigate('login')}
            onSwitchToLogin={() => handleNavigate('login')}
          />
        );
      case 'dashboard':
      case 'buyer-dashboard':
        return (
          <DashboardSwitch
            onBuyNowSingleItem={handleBuyNowSingleItem}
            onOpenCart={() => handleNavigate('cart')}
          />
        );
      case 'cart':
        return (
          <CartView
            onProceedToBilling={handleProceedToBilling}
            onContinueShopping={() => handleNavigate(marketplaceView)}
          />
        );
      case 'billing':
        return (
          <BillingView
            invoice={invoiceData}
            onPaymentSuccess={handlePaymentSuccess}
            onBackToCart={() => handleNavigate('cart')}
          />
        );
      case 'success':
        return (
          <PaymentSuccessView
            invoice={invoiceData || lastInvoice}
            onContinueShopping={() => handleNavigate('home')}
          />
        );
      default:
        return <Home />;
    }
  };

  return (
    <div style={{ backgroundColor: 'black', color: 'white', minHeight: '100vh' }}>
      <Navbar onNavigate={handleNavigate} />
      {renderView()}
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

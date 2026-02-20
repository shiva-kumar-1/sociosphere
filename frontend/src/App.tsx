import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import BackgroundSymbols from "./components/BackgroundSymbols";
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import ServiceDetailPage from './pages/ServiceDetailPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import MessagesPage from './pages/MessagesPage';
import CustomerRequestsPage from './pages/CustomerRequestsPage';
import ProviderProfilePage from './pages/ProviderProfilePage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import LoginSuccess from "./pages/LoginSuccess";
import About from "./pages/About";
import IntroOverlay from "./components/IntroOverlay";
import ChatBot from './components/ChatBot';

function Router() {
  const { user } = useAuth();
  const [path, setPath] = useState(window.location.hash.slice(1) || '/');

  const navigate = useCallback((p: string) => {
    setPath(p);
    window.location.hash = p;
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const handler = () => setPath(window.location.hash.slice(1) || '/');
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);

  const pageTransition = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { duration: 0.25 },
  };

  /* =========================
     PUBLIC ROUTES
  ========================= */

  if (path === '/forgot-password') {
    return <ForgotPasswordPage navigate={navigate} />;
  }

  if (path.startsWith('/reset-password/')) {
    const token = path.split('/reset-password/')[1];
    return <ResetPasswordPage token={token} navigate={navigate} />;
  }

  if (path.startsWith('/login-success')) {
    return <LoginSuccess />;
  }

  /* =========================
     AUTH CHECK
  ========================= */

  if (!user) {
    return <AuthPage onAuth={() => navigate('/home')} />;
  }

  /* =========================
     PRIVATE ROUTES
  ========================= */

  const renderPage = () => {
    if (path.startsWith('/service/')) {
      const id = path.split('/service/')[1];
      return (
        <ServiceDetailPage
          key={path}
          serviceId={id}
          navigate={navigate}
        />
      );
    }

    if (path.startsWith('/providers/')) {
      const id = path.split('/providers/')[1];
      return (
        <ProviderProfilePage
          key={path}
          providerId={id}
          navigate={navigate}
        />
      );
    }

    switch (path) {
      case '/home':
      case '/':
        return <HomePage navigate={navigate} />;

      case '/admin':
        return <AdminDashboardPage navigate={navigate} />;

      case '/dashboard':
        return <DashboardPage navigate={navigate} />;

      case '/profile':
        return <ProfilePage navigate={navigate} />;

      case '/messages':
        return <MessagesPage navigate={navigate} />;

      case '/my-requests':
        return <CustomerRequestsPage navigate={navigate} />;

      case '/about':        // ✅ NEW ROUTE ADDED
        return <About />;

      default:
        return <HomePage navigate={navigate} />;
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div key={path} {...pageTransition}>
        {renderPage()}
      </motion.div>
    </AnimatePresence>
  );
}

export function App() {
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 2300); // length of intro animation

    return () => clearTimeout(timer);
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <BackgroundSymbols />
        <AnimatePresence>
          {showIntro && <IntroOverlay />}
        </AnimatePresence>

        {!showIntro && (
          <>
            <Router />
            <ChatBot />
          </>
        )}

        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#0f1428',
              color: '#fff',
              border: '1px solid rgba(0,212,255,0.3)',
              borderRadius: '12px',
            },
          }}
        />

      </AuthProvider>
    </ThemeProvider>
  );
}
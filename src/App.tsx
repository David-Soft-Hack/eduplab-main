import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import Dashboard from './pages/Dashboard';
import Modules from './pages/Modules';
import Programas from './pages/Programas';
import FormMemorandum from './pages/FormMemorandum';
import PanelAlertas from './pages/PanelAlertas';
import GeneradorInformes from './pages/GeneradorInformes';
import BitacoraDocente from './pages/BitacoraDocente';
import Login from './pages/Login';
import Splash from './pages/Splash';
import Sidebar from './components/layout/Sidebar';
import MobileNav from './components/layout/MobileNav';

import { AppProvider } from './context/AppContext';

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  return (
    <AppProvider>
      <Router>
        <AnimatePresence mode="wait">
          {loading ? (
            <Splash key="splash" />
          ) : !isAuthenticated ? (
            <Login key="login" onLogin={handleLogin} />
          ) : (
            <div key="app" className="flex min-h-screen bg-slate-50">
              <Sidebar />
              
              <main className="flex-1 pb-20 md:pb-0 md:pl-64 transition-all duration-300">
                <div className="container mx-auto p-4 md:p-8">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/modules" element={<Modules />} />
                    <Route path="/programs" element={<Programas />} />
                    <Route path="/memorandum" element={<FormMemorandum />} />
                    <Route path="/alertas" element={<PanelAlertas />} />
                    <Route path="/informes" element={<GeneradorInformes />} />
                    <Route path="/dosificacion" element={<BitacoraDocente />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </div>
              </main>

              <MobileNav />
            </div>
          )}
        </AnimatePresence>
      </Router>
    </AppProvider>
  );
};

export default App;

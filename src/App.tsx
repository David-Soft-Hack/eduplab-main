import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ThemeProvider } from './theme';
import Dashboard from './pages/Dashboard';
import Modules from './pages/Modules';
import Programas from './pages/Programas';
import FormMemorandum from './pages/FormMemorandum';
import PanelAlertas from './pages/PanelAlertas';
import GeneradorInformes from './pages/GeneradorInformes';
import BitacoraDocente from './pages/BitacoraDocente';
import Docentes from './pages/Docentes';
import Login from './pages/Login';
import Splash from './pages/Splash';
import Sidebar from './components/layout/Sidebar';
import MobileNav from './components/layout/MobileNav';

import { AppProvider, useAppContext } from './context/AppContext';

const AppContent: React.FC = () => {
  const { loading } = useAppContext();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const handleLogin = () => setIsAuthenticated(true);

  return (
    <AnimatePresence mode="wait">
      {loading ? (
        <Splash key="splash" />
      ) : !isAuthenticated ? (
        <Login key="login" onLogin={handleLogin} />
      ) : (
        <div key="app" className="flex min-h-screen bg-surface-container">
          <Sidebar />
          <main className="flex-1 pb-20 md:pb-0 md:pl-20 transition-all duration-300">
            <div className="p-4 md:p-6 max-w-7xl mx-auto">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/modules" element={<Modules />} />
                <Route path="/programs" element={<Programas />} />
                <Route path="/memorandum" element={<FormMemorandum />} />
                <Route path="/alertas" element={<PanelAlertas />} />
                <Route path="/informes" element={<GeneradorInformes />} />
                <Route path="/docentes" element={<Docentes />} />
                <Route path="/dosificacion" element={<BitacoraDocente />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </main>
          <MobileNav />
        </div>
      )}
    </AnimatePresence>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <ThemeProvider>
        <Router>
          <AppContent />
        </Router>
      </ThemeProvider>
    </AppProvider>
  );
};

export default App;

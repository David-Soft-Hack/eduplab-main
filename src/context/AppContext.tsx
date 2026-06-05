import React, { createContext, useContext, useState, useEffect } from 'react';
import { Notificacion, Memorandum, Dosificacion } from '../types';

const API = 'http://localhost:3002/api';

interface AppContextType {
  loading: boolean;
  modules: any[];
  setModules: React.Dispatch<React.SetStateAction<any[]>>;
  teachers: any[];
  setTeachers: React.Dispatch<React.SetStateAction<any[]>>;
  attendanceRecords: any[];
  setAttendanceRecords: React.Dispatch<React.SetStateAction<any[]>>;
  notifications: Notificacion[];
  setNotifications: React.Dispatch<React.SetStateAction<Notificacion[]>>;
  memorandums: Memorandum[];
  setMemorandums: React.Dispatch<React.SetStateAction<Memorandum[]>>;
  dosificaciones: Dosificacion[];
  setDosificaciones: React.Dispatch<React.SetStateAction<Dosificacion[]>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function fetchJson(url: string) {
  return fetch(`${API}${url}`).then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); });
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [modules, setModules] = useState<any[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<Notificacion[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [memorandums, setMemorandums] = useState<Memorandum[]>([]);
  const [dosificaciones, setDosificaciones] = useState<Dosificacion[]>([]);

  useEffect(() => {
    Promise.all([
      fetchJson('/docentes'),
      fetchJson('/modulos'),
      fetchJson('/memorandums'),
      fetchJson('/unidades'),
      fetchJson('/dosificaciones'),
      fetchJson('/notificaciones'),
    ]).then(([t, m, mem, u, d, n]) => {
      setTeachers(t);
      setModules(m);
      setMemorandums(mem);
      setDosificaciones(d);
      setNotifications(n);
    }).catch(err => {
      console.error('Error cargando datos del backend:', err);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <AppContext.Provider value={{
      loading,
      modules, setModules,
      teachers, setTeachers,
      attendanceRecords, setAttendanceRecords,
      notifications, setNotifications,
      memorandums, setMemorandums,
      dosificaciones, setDosificaciones,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

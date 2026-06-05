import React, { createContext, useContext, useState } from 'react';
import { Notificacion, Memorandum, Dosificacion } from '../types';

function getToday(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
}

const mockTeachers = [
  { id: 'DOC-001', nombre: 'Ing. Carlos Mendoza', email: 'carlos.mendoza@instituto.edu', telefono: '50683019284', carrera: 'Análisis de Sistemas', especialidad: 'Bases de Datos', estado: 'Activo', fechaRegistro: '2025-01-10' },
  { id: 'DOC-002', nombre: 'MSc. Elena Rostova', email: 'elena.rostova@instituto.edu', telefono: '50688776655', carrera: 'Ingeniería de Sistemas', especialidad: 'Arquitectura de Software', estado: 'Activo', fechaRegistro: '2023-05-15' },
  { id: 'DOC-003', nombre: 'Lic. Roberto Quirós', email: 'roberto.quiros@instituto.edu', telefono: '50670123456', carrera: 'Análisis de Sistemas', especialidad: 'Metodología Ágil', estado: 'Activo', fechaRegistro: '2024-03-20' },
  { id: 'DOC-004', nombre: 'Dra. Sylvia Salazar', email: 'sylvia.salazar@instituto.edu', telefono: '50687654321', carrera: 'Ciencia de Datos', especialidad: 'Inteligencia Artificial', estado: 'Activo', fechaRegistro: '2024-08-01' },
];

const mockModules = [
  { id: 'MOD-001', nombre: 'Sistemas Operativos', codPrograma: null, totalHoraAcademic: 120, totalHoraReloj: 100, carrera: 'Ingeniería de Sistemas', fechaCreacion: '2024-01-15', planningFileName: 'Planificacion_Anual_SO.pdf', estado: 'Activo' },
  { id: 'MOD-002', nombre: 'Base de Datos I', codPrograma: null, totalHoraAcademic: 96, totalHoraReloj: 80, carrera: 'Análisis de Sistemas', fechaCreacion: '2024-02-10', planningFileName: 'Planeacion_Curricular_BD.pdf', estado: 'Activo' },
  { id: 'MOD-003', nombre: 'Excel Avanzado: Fórmulas y Macros', codPrograma: null, totalHoraAcademic: 60, totalHoraReloj: 50, carrera: 'Administración', fechaCreacion: '2024-03-01', planningFileName: null, estado: 'Activo' },
  { id: 'MOD-004', nombre: 'Desarrollo Frontend con React', codPrograma: null, totalHoraAcademic: 80, totalHoraReloj: 65, carrera: 'Ingeniería de Sistemas', fechaCreacion: '2024-04-01', planningFileName: null, estado: 'Activo' },
];

const mockMemorandums = [
  { id: 'MEM-001', docenteId: 'DOC-001', docenteNombre: 'Ing. Carlos Mendoza', tipo: 'Técnica', programa: 'Técnico General en Computación', fechaEmision: getToday(-30), fechaInicio: getToday(-28), fechaFin: getToday(45), estado: 'ACTIVO' },
  { id: 'MEM-002', docenteId: 'DOC-002', docenteNombre: 'MSc. Elena Rostova', tipo: 'Curso', programa: 'Curso de Excel Avanzado', fechaEmision: getToday(-20), fechaInicio: getToday(-18), fechaFin: getToday(20), estado: 'ACTIVO' },
  { id: 'MEM-003', docenteId: 'DOC-003', docenteNombre: 'Lic. Roberto Quirós', tipo: 'Técnica', programa: 'Técnico en Desarrollo Web', fechaEmision: getToday(-15), fechaInicio: getToday(-14), fechaFin: getToday(55), estado: 'ACTIVO' },
];

const mockDosificaciones = [
  { id: 'DOS-MEM-001-MOD-001', memorandumId: 'MEM-001', docenteId: 'DOC-001', docenteNombre: 'Ing. Carlos Mendoza', moduloId: 'MOD-001', moduloNombre: 'Sistemas Operativos', fechaCreacion: getToday(-30), turno: 'Matutino', configFrecuencia: JSON.stringify({ diasClase: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'], horasSesion: 4, usarHorasReloj: false, turno: 'Matutino', fechasFeriadas: [] }) },
  { id: 'DOS-MEM-002-MOD-003', memorandumId: 'MEM-002', docenteId: 'DOC-002', docenteNombre: 'MSc. Elena Rostova', moduloId: 'MOD-003', moduloNombre: 'Excel Avanzado: Fórmulas y Macros', fechaCreacion: getToday(-20), turno: 'Matutino', configFrecuencia: JSON.stringify({ diasClase: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'], horasSesion: 4, usarHorasReloj: false, turno: 'Matutino', fechasFeriadas: [] }) },
  { id: 'DOS-MEM-003-MOD-004', memorandumId: 'MEM-003', docenteId: 'DOC-003', docenteNombre: 'Lic. Roberto Quirós', moduloId: 'MOD-004', moduloNombre: 'Desarrollo Frontend con React', fechaCreacion: getToday(-15), turno: 'Matutino', configFrecuencia: JSON.stringify({ diasClase: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'], horasSesion: 4, usarHorasReloj: false, turno: 'Matutino', fechasFeriadas: [] }) },
];

const mockNotifications = [
  { id: 'NOT-001', tipo: 'FINALIZACION_UNIDAD', docenteId: 'DOC-001', docenteNombre: 'Ing. Carlos Mendoza', moduloNombre: 'Sistemas Operativos', unidadNombre: 'Introducción a los SO y Arquitectura', fechaEvento: getToday(-10), fechaNotificacion: getToday(-10), estado: 'LEIDA', canal: 'CALENDARIO', mensaje: 'Carlos Mendoza ha finalizado la unidad "Introducción a los SO y Arquitectura" del módulo Sistemas Operativos.', metadata: null },
  { id: 'NOT-002', tipo: 'ALERTA_PREVIA', docenteId: 'DOC-001', docenteNombre: 'Ing. Carlos Mendoza', moduloNombre: 'Sistemas Operativos', unidadNombre: 'Gestión y Planificación de Procesos', fechaEvento: getToday(10), fechaNotificacion: getToday(), estado: 'PENDIENTE', canal: 'PANEL', mensaje: '⚠️ La unidad "Gestión y Planificación de Procesos" del módulo Sistemas Operativos finaliza en menos de 3 días.', metadata: JSON.stringify({ codUnidad: 'UD-SO-02', codModule: 'MOD-001' }) },
  { id: 'NOT-003', tipo: 'FINALIZACION_UNIDAD', docenteId: 'DOC-002', docenteNombre: 'MSc. Elena Rostova', moduloNombre: 'Excel Avanzado: Fórmulas y Macros', unidadNombre: 'Fórmulas Avanzadas y Funciones Anidadas', fechaEvento: getToday(-5), fechaNotificacion: getToday(-5), estado: 'ENVIADA', canal: 'WHATSAPP', mensaje: 'Elena Rostova ha finalizado la unidad "Fórmulas Avanzadas y Funciones Anidadas" del módulo Excel Avanzado.', metadata: null },
  { id: 'NOT-004', tipo: 'ALERTA_PREVIA', docenteId: 'DOC-002', docenteNombre: 'MSc. Elena Rostova', moduloNombre: 'Excel Avanzado: Fórmulas y Macros', unidadNombre: 'Tablas Dinámicas y Gráficos', fechaEvento: getToday(5), fechaNotificacion: getToday(), estado: 'PENDIENTE', canal: 'PANEL', mensaje: '⚠️ La unidad "Tablas Dinámicas y Gráficos" del módulo Excel Avanzado finaliza en menos de 3 días.', metadata: JSON.stringify({ codUnidad: 'UD-EX-02', codModule: 'MOD-003' }) },
  { id: 'NOT-005', tipo: 'ALERTA_PREVIA', docenteId: 'DOC-003', docenteNombre: 'Lic. Roberto Quirós', moduloNombre: 'Desarrollo Frontend con React', unidadNombre: 'Introducción a React y Componentes', fechaEvento: getToday(3), fechaNotificacion: getToday(), estado: 'PENDIENTE', canal: 'PANEL', mensaje: '⚠️ La unidad "Introducción a React y Componentes" del módulo Desarrollo Frontend finaliza en menos de 3 días.', metadata: JSON.stringify({ codUnidad: 'UD-DW-02', codModule: 'MOD-004' }) },
];

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

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [modules, setModules] = useState<any[]>(mockModules);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<Notificacion[]>(mockNotifications as any);
  const [teachers, setTeachers] = useState<any[]>(mockTeachers);
  const [memorandums, setMemorandums] = useState<Memorandum[]>(mockMemorandums as any);
  const [dosificaciones, setDosificaciones] = useState<Dosificacion[]>(mockDosificaciones as any);

  return (
    <AppContext.Provider value={{
      loading: false,
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

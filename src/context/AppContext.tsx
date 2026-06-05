import React, { createContext, useContext, useState } from 'react';
import { MOCK_MODULES } from '../lib/utils';
import { EstadoUnidad, TipoCarrera, Notificacion, Memorandum, Dosificacion, TipoNotificacion, EstadoNotificacion, Turno } from '../types';

interface AppContextType {
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

function getToday(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
}

const MOCK_MEMORANDUMS: Memorandum[] = [
  {
    id: 'MEM-001',
    docenteId: 'DOC-001',
    docenteNombre: 'Ing. Carlos Mendoza',
    tipo: TipoCarrera.TECNICA,
    programa: 'Técnico General en Computación',
    fechaEmision: getToday(-30),
    fechaInicio: getToday(-28),
    fechaFin: getToday(45),
    estado: 'ACTIVO',
    modulos: [
      {
        codModule: 'MOD-001',
        nombre: 'Sistemas Operativos',
        horasTotales: 120,
        unidades: [
          { id: 'UD-SO-01', nombre: 'Introducción a los SO y Arquitectura', fechaInicio: getToday(-28), fechaFin: getToday(-10), horasAsignadas: 30, estado: EstadoUnidad.FINALIZADA, codModule: 'MOD-001', ponderacion: 25 },
          { id: 'UD-SO-02', nombre: 'Gestión y Planificación de Procesos', fechaInicio: getToday(-10), fechaFin: getToday(10), horasAsignadas: 50, estado: EstadoUnidad.EN_PROGRESO, codModule: 'MOD-001', ponderacion: 45 },
          { id: 'UD-SO-03', nombre: 'Gestión de Memoria y Memoria Virtual', fechaInicio: getToday(10), fechaFin: getToday(45), horasAsignadas: 40, estado: EstadoUnidad.PENDIENTE, codModule: 'MOD-001', ponderacion: 30 },
        ],
      },
    ],
  },
  {
    id: 'MEM-002',
    docenteId: 'DOC-002',
    docenteNombre: 'MSc. Elena Rostova',
    tipo: TipoCarrera.CURSO,
    programa: 'Curso de Excel Avanzado',
    fechaEmision: getToday(-20),
    fechaInicio: getToday(-18),
    fechaFin: getToday(20),
    estado: 'ACTIVO',
    modulos: [
      {
        codModule: 'MOD-003',
        nombre: 'Excel Avanzado: Fórmulas y Macros',
        horasTotales: 60,
        unidades: [
          { id: 'UD-EX-01', nombre: 'Fórmulas Avanzadas y Funciones Anidadas', fechaInicio: getToday(-18), fechaFin: getToday(-5), horasAsignadas: 20, estado: EstadoUnidad.FINALIZADA, codModule: 'MOD-003', ponderacion: 33 },
          { id: 'UD-EX-02', nombre: 'Tablas Dinámicas y Gráficos', fechaInicio: getToday(-5), fechaFin: getToday(5), horasAsignadas: 20, estado: EstadoUnidad.EN_PROGRESO, codModule: 'MOD-003', ponderacion: 33 },
          { id: 'UD-EX-03', nombre: 'Macros y Automatización con VBA', fechaInicio: getToday(5), fechaFin: getToday(20), horasAsignadas: 20, estado: EstadoUnidad.PENDIENTE, codModule: 'MOD-003', ponderacion: 34 },
        ],
      },
    ],
  },
  {
    id: 'MEM-003',
    docenteId: 'DOC-003',
    docenteNombre: 'Lic. Roberto Quirós',
    tipo: TipoCarrera.TECNICA,
    programa: 'Técnico en Desarrollo Web',
    fechaEmision: getToday(-15),
    fechaInicio: getToday(-14),
    fechaFin: getToday(55),
    estado: 'ACTIVO',
    modulos: [
      {
        codModule: 'MOD-004',
        nombre: 'Desarrollo Frontend con React',
        horasTotales: 80,
        unidades: [
          { id: 'UD-DW-01', nombre: 'Fundamentos de HTML, CSS y JavaScript', fechaInicio: getToday(-14), fechaFin: getToday(-2), horasAsignadas: 25, estado: EstadoUnidad.FINALIZADA, codModule: 'MOD-004', ponderacion: 30 },
          { id: 'UD-DW-02', nombre: 'Introducción a React y Componentes', fechaInicio: getToday(-2), fechaFin: getToday(3), horasAsignadas: 30, estado: EstadoUnidad.EN_PROGRESO, codModule: 'MOD-004', ponderacion: 40 },
          { id: 'UD-DW-03', nombre: 'Routing, Estado y Despliegue', fechaInicio: getToday(3), fechaFin: getToday(55), horasAsignadas: 25, estado: EstadoUnidad.PENDIENTE, codModule: 'MOD-004', ponderacion: 30 },
        ],
      },
    ],
  },
];

const MOCK_DOSIFICACIONES: Dosificacion[] = MOCK_MEMORANDUMS.flatMap(m =>
  m.modulos.map(mod => ({
    id: `DOS-${m.id}-${mod.codModule}`,
    memorandumId: m.id,
    docenteId: m.docenteId,
    docenteNombre: m.docenteNombre,
    moduloId: mod.codModule,
    moduloNombre: mod.nombre,
    unidades: mod.unidades,
    fechaCreacion: m.fechaEmision,
    turno: Turno.MATUTINO,
    configFrecuencia: {
      diasClase: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'],
      horasSesion: 4,
      usarHorasReloj: false,
      turno: Turno.MATUTINO,
      fechasFeriadas: [],
    },
  }))
);

const MOCK_NOTIFICATIONS: Notificacion[] = [
  {
    id: 'NOT-001',
    tipo: TipoNotificacion.FINALIZACION_UNIDAD,
    docenteId: 'DOC-001',
    docenteNombre: 'Ing. Carlos Mendoza',
    moduloNombre: 'Sistemas Operativos',
    unidadNombre: 'Introducción a los SO y Arquitectura',
    fechaEvento: getToday(-10),
    fechaNotificacion: getToday(-10),
    estado: EstadoNotificacion.LEIDA,
    canal: 'CALENDARIO',
    mensaje: 'Carlos Mendoza ha finalizado la unidad "Introducción a los SO y Arquitectura" del módulo Sistemas Operativos.',
  },
  {
    id: 'NOT-002',
    tipo: TipoNotificacion.ALERTA_PREVIA,
    docenteId: 'DOC-001',
    docenteNombre: 'Ing. Carlos Mendoza',
    moduloNombre: 'Sistemas Operativos',
    unidadNombre: 'Gestión y Planificación de Procesos',
    fechaEvento: getToday(10),
    fechaNotificacion: getToday(),
    estado: EstadoNotificacion.PENDIENTE,
    canal: 'PANEL',
    mensaje: '⚠️ La unidad "Gestión y Planificación de Procesos" del módulo Sistemas Operativos finaliza en menos de 3 días.',
    metadata: { codUnidad: 'UD-SO-02', codModule: 'MOD-001' },
  },
  {
    id: 'NOT-003',
    tipo: TipoNotificacion.FINALIZACION_UNIDAD,
    docenteId: 'DOC-002',
    docenteNombre: 'MSc. Elena Rostova',
    moduloNombre: 'Excel Avanzado: Fórmulas y Macros',
    unidadNombre: 'Fórmulas Avanzadas y Funciones Anidadas',
    fechaEvento: getToday(-5),
    fechaNotificacion: getToday(-5),
    estado: EstadoNotificacion.ENVIADA,
    canal: 'WHATSAPP',
    mensaje: 'Elena Rostova ha finalizado la unidad "Fórmulas Avanzadas y Funciones Anidadas" del módulo Excel Avanzado.',
  },
  {
    id: 'NOT-004',
    tipo: TipoNotificacion.ALERTA_PREVIA,
    docenteId: 'DOC-002',
    docenteNombre: 'MSc. Elena Rostova',
    moduloNombre: 'Excel Avanzado: Fórmulas y Macros',
    unidadNombre: 'Tablas Dinámicas y Gráficos',
    fechaEvento: getToday(5),
    fechaNotificacion: getToday(),
    estado: EstadoNotificacion.PENDIENTE,
    canal: 'PANEL',
    mensaje: '⚠️ La unidad "Tablas Dinámicas y Gráficos" del módulo Excel Avanzado finaliza en menos de 3 días.',
    metadata: { codUnidad: 'UD-EX-02', codModule: 'MOD-003' },
  },
  {
    id: 'NOT-005',
    tipo: TipoNotificacion.ALERTA_PREVIA,
    docenteId: 'DOC-003',
    docenteNombre: 'Lic. Roberto Quirós',
    moduloNombre: 'Desarrollo Frontend con React',
    unidadNombre: 'Introducción a React y Componentes',
    fechaEvento: getToday(3),
    fechaNotificacion: getToday(),
    estado: EstadoNotificacion.PENDIENTE,
    canal: 'PANEL',
    mensaje: '⚠️ La unidad "Introducción a React y Componentes" del módulo Desarrollo Frontend finaliza en menos de 3 días.',
    metadata: { codUnidad: 'UD-DW-02', codModule: 'MOD-004' },
  },
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [modules, setModules] = useState<any[]>(MOCK_MODULES);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<Notificacion[]>(MOCK_NOTIFICATIONS);
  const [teachers, setTeachers] = useState<any[]>([
    { id: 'DOC-001', nombre: 'Ing. Carlos Mendoza', email: 'carlos.mendoza@instituto.edu', telefono: '50683019284', carrera: 'Análisis de Sistemas', especialidad: 'Bases de Datos', estado: 'Activo', fechaRegistro: '2025-01-10' },
    { id: 'DOC-002', nombre: 'MSc. Elena Rostova', email: 'elena.rostova@instituto.edu', telefono: '50688776655', carrera: 'Ingeniería de Sistemas', especialidad: 'Arquitectura de Software', estado: 'Activo', fechaRegistro: '2023-05-15' },
    { id: 'DOC-003', nombre: 'Lic. Roberto Quirós', email: 'roberto.quiros@instituto.edu', telefono: '50670123456', carrera: 'Análisis de Sistemas', especialidad: 'Metodología Ágil', estado: 'Activo', fechaRegistro: '2024-03-20' },
    { id: 'DOC-004', nombre: 'Dra. Sylvia Salazar', email: 'sylvia.salazar@instituto.edu', telefono: '50687654321', carrera: 'Ciencia de Datos', especialidad: 'Inteligencia Artificial', estado: 'Activo', fechaRegistro: '2024-08-01' },
  ]);
  const [memorandums, setMemorandums] = useState<Memorandum[]>(MOCK_MEMORANDUMS);
  const [dosificaciones, setDosificaciones] = useState<Dosificacion[]>(MOCK_DOSIFICACIONES);

  return (
    <AppContext.Provider value={{ 
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

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Mock initial data for the prototype
export const MOCK_MODULES = [
  {
    codModule: 'MOD-001',
    nombre: 'Sistemas Operativos',
    totalHoraAcademic: 120,
    totalHoraReloj: 100,
    cantidadUnidades: 3,
    carrera: 'Ingeniería de Sistemas',
    fechaCreacion: '2024-01-15',
    planningFileName: 'Planificacion_Anual_SO.pdf',
    units: [
      { codUnit: 'UN-SO-01', nombre: 'Introducción a los SO y Arquitectura', totalHoraAcademic: 30, totalHoraReloj: 25, ponderacion: 25 },
      { codUnit: 'UN-SO-02', nombre: 'Gestión y Planificación de Procesos', totalHoraAcademic: 50, totalHoraReloj: 40, ponderacion: 45 },
      { codUnit: 'UN-SO-03', nombre: 'Gestión de Memoria y Memoria Virtual', totalHoraAcademic: 40, totalHoraReloj: 35, ponderacion: 30 }
    ],
    activities: [
      { id: '1', unitId: 1, desc: 'Introducción a los SO y Arquitectura', ha: 10 },
      { id: '2', unitId: 1, desc: 'Gestión de Procesos y Hilos', ha: 20 },
      { id: '3', unitId: 2, desc: 'Planificación de CPU', ha: 15 },
      { id: '4', unitId: 2, desc: 'Sincronización de Procesos', ha: 25 },
      { id: '5', unitId: 3, desc: 'Gestión de Memoria Principal', ha: 20 },
      { id: '6', unitId: 3, desc: 'Memoria Virtual', ha: 30 }
    ]
  },
  {
    codModule: 'MOD-002',
    nombre: 'Base de Datos I',
    totalHoraAcademic: 96,
    totalHoraReloj: 80,
    cantidadUnidades: 2,
    carrera: 'Análisis de Sistemas',
    fechaCreacion: '2024-02-10',
    planningFileName: 'Planeacion_Curricular_BD.pdf',
    units: [
      { codUnit: 'UN-BD-01', nombre: 'Fundamientos de BD y Modelo E-R', totalHoraAcademic: 46, totalHoraReloj: 40, ponderacion: 55 },
      { codUnit: 'UN-BD-02', nombre: 'Lenguaje SQL y Transacciones', totalHoraAcademic: 50, totalHoraReloj: 40, ponderacion: 45 }
    ],
    activities: [
      { id: '1', unitId: 1, desc: 'Fundamentos de BD y Modelo E-R', ha: 16 },
      { id: '2', unitId: 2, desc: 'Modelo Relacional y Álgebra Relacional', ha: 20 },
      { id: '3', unitId: 3, desc: 'Lenguaje SQL - DDL y DML', ha: 30 },
      { id: '4', unitId: 4, desc: 'Normalización de BD', ha: 20 },
      { id: '5', unitId: 5, desc: 'Seguridad y Transacciones', ha: 10 }
    ]
  }
];



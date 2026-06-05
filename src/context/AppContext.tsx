import React, { createContext, useContext, useState } from 'react';
import { Notificacion, Memorandum, Dosificacion, EstadoUnidad, TipoNotificacion, EstadoNotificacion, Turno, TipoCarrera } from '../types';

function getToday(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
}

const mockTeachers = [
  { id: 'DOC-001', nombre: 'Ing. Carlos Mendoza', email: 'carlos.mendoza@instituto.edu', telefono: '50683019284', carrera: 'Técnico General en Computación', especialidad: 'Bases de Datos', estado: 'Activo', fechaRegistro: '2025-01-10' },
  { id: 'DOC-002', nombre: 'MSc. Elena Rostova', email: 'elena.rostova@instituto.edu', telefono: '50688776655', carrera: 'Curso de Excel Avanzado', especialidad: 'Arquitectura de Software', estado: 'Activo', fechaRegistro: '2023-05-15' },
  { id: 'DOC-003', nombre: 'Lic. Roberto Quirós', email: 'roberto.quiros@instituto.edu', telefono: '50670123456', carrera: 'Técnico en Desarrollo Web', especialidad: 'Metodología Ágil', estado: 'Activo', fechaRegistro: '2024-03-20' },
  { id: 'DOC-004', nombre: 'Dra. Sylvia Salazar', email: 'sylvia.salazar@instituto.edu', telefono: '50687654321', carrera: 'Técnico en Ciencia de Datos', especialidad: 'Inteligencia Artificial', estado: 'Activo', fechaRegistro: '2024-08-01' },
  { id: 'DOC-005', nombre: 'MSc. Fernando Rivas', email: 'fernando.rivas@instituto.edu', telefono: '50671234567', carrera: 'Técnico en Redes y Telecomunicaciones', especialidad: 'Redes y Seguridad', estado: 'Activo', fechaRegistro: '2024-11-10' },
  { id: 'DOC-006', nombre: 'Lic. Mariana Pineda', email: 'mariana.pineda@instituto.edu', telefono: '50672345678', carrera: 'Técnico General en Computación', especialidad: 'Desarrollo Frontend', estado: 'Activo', fechaRegistro: '2025-02-01' },
  { id: 'DOC-007', nombre: 'Ing. Luis Sandino', email: 'luis.sandino@instituto.edu', telefono: '50673456789', carrera: 'Técnico en Ciencia de Datos', especialidad: 'Machine Learning', estado: 'Inactivo', fechaRegistro: '2023-09-15' },
  { id: 'DOC-008', nombre: 'MSc. Ana Lucía Brenes', email: 'ana.brenes@instituto.edu', telefono: '50674567890', carrera: 'Curso de Excel Avanzado', especialidad: 'Gestión de Proyectos TI', estado: 'Activo', fechaRegistro: '2024-06-01' },
  { id: 'DOC-009', nombre: 'Lic. Esteban Quirós', email: 'esteban.quiros@instituto.edu', telefono: '50675678901', carrera: 'Técnico en Desarrollo Web', especialidad: 'Backend y APIs', estado: 'Inactivo', fechaRegistro: '2024-01-20' },
  { id: 'DOC-010', nombre: 'Ing. Paola Carmona', email: 'paola.carmona@instituto.edu', telefono: '50676789012', carrera: 'Técnico en Redes y Telecomunicaciones', especialidad: 'Ciberseguridad', estado: 'Activo', fechaRegistro: '2025-04-01' },
];

const mockModules = [
  {
    codModule: 'MOD-001', nombre: 'Sistemas Operativos', totalHoraAcademic: 120, totalHoraReloj: 100,
    cantidadUnidades: 3, carrera: 'Técnico General en Computación', fechaCreacion: '2024-01-15', planningFileName: 'Planificacion_Anual_SO.pdf',
    units: [
      { codUnit: 'UD-SO-01', nombre: 'Introducción a los SO y Arquitectura', totalHoraAcademic: 40, totalHoraReloj: 30, ponderacion: 25 },
      { codUnit: 'UD-SO-02', nombre: 'Gestión y Planificación de Procesos', totalHoraAcademic: 50, totalHoraReloj: 40, ponderacion: 45 },
      { codUnit: 'UD-SO-03', nombre: 'Gestión de Memoria y Memoria Virtual', totalHoraAcademic: 30, totalHoraReloj: 30, ponderacion: 30 },
    ],
  },
  {
    codModule: 'MOD-002', nombre: 'Base de Datos I', totalHoraAcademic: 96, totalHoraReloj: 80,
    cantidadUnidades: 4, carrera: 'Técnico General en Computación', fechaCreacion: '2024-02-10', planningFileName: 'Planeacion_Curricular_BD.pdf',
    units: [
      { codUnit: 'UD-BD-01', nombre: 'Modelo Entidad-Relación', totalHoraAcademic: 24, totalHoraReloj: 20, ponderacion: 25 },
      { codUnit: 'UD-BD-02', nombre: 'Álgebra Relacional y SQL Básico', totalHoraAcademic: 28, totalHoraReloj: 24, ponderacion: 30 },
      { codUnit: 'UD-BD-03', nombre: 'Normalización y Diseño Físico', totalHoraAcademic: 24, totalHoraReloj: 20, ponderacion: 25 },
      { codUnit: 'UD-BD-04', nombre: 'Transacciones y Seguridad', totalHoraAcademic: 20, totalHoraReloj: 16, ponderacion: 20 },
    ],
  },
  {
    codModule: 'MOD-003', nombre: 'Excel Avanzado: Fórmulas y Macros', totalHoraAcademic: 60, totalHoraReloj: 50,
    cantidadUnidades: 3, carrera: 'Curso de Excel Avanzado', fechaCreacion: '2024-03-01', planningFileName: null,
    units: [
      { codUnit: 'UD-EX-01', nombre: 'Fórmulas Avanzadas y Funciones Anidadas', totalHoraAcademic: 20, totalHoraReloj: 16, ponderacion: 33 },
      { codUnit: 'UD-EX-02', nombre: 'Tablas Dinámicas y Gráficos', totalHoraAcademic: 20, totalHoraReloj: 18, ponderacion: 33 },
      { codUnit: 'UD-EX-03', nombre: 'Macros y Automatización con VBA', totalHoraAcademic: 20, totalHoraReloj: 16, ponderacion: 34 },
    ],
  },
  {
    codModule: 'MOD-004', nombre: 'Desarrollo Frontend con React', totalHoraAcademic: 80, totalHoraReloj: 65,
    cantidadUnidades: 3, carrera: 'Técnico en Desarrollo Web', fechaCreacion: '2024-04-01', planningFileName: null,
    units: [
      { codUnit: 'UD-DW-01', nombre: 'Fundamentos de HTML, CSS y JavaScript', totalHoraAcademic: 24, totalHoraReloj: 20, ponderacion: 30 },
      { codUnit: 'UD-DW-02', nombre: 'Introducción a React y Componentes', totalHoraAcademic: 30, totalHoraReloj: 25, ponderacion: 40 },
      { codUnit: 'UD-DW-03', nombre: 'Routing, Estado y Despliegue', totalHoraAcademic: 26, totalHoraReloj: 20, ponderacion: 30 },
    ],
  },
  {
    codModule: 'MOD-005', nombre: 'Redes de Computadoras', totalHoraAcademic: 110, totalHoraReloj: 90,
    cantidadUnidades: 4, carrera: 'Técnico en Redes y Telecomunicaciones', fechaCreacion: '2024-05-01', planningFileName: 'Plan_Redes_MOD005.pdf',
    units: [
      { codUnit: 'UD-RD-01', nombre: 'Fundamentos de Redes y Modelo OSI', totalHoraAcademic: 28, totalHoraReloj: 22, ponderacion: 25 },
      { codUnit: 'UD-RD-02', nombre: 'Protocolos TCP/IP y Direccionamiento', totalHoraAcademic: 32, totalHoraReloj: 26, ponderacion: 30 },
      { codUnit: 'UD-RD-03', nombre: 'Enrutamiento y Conmutación', totalHoraAcademic: 28, totalHoraReloj: 24, ponderacion: 25 },
      { codUnit: 'UD-RD-04', nombre: 'Seguridad en Redes', totalHoraAcademic: 22, totalHoraReloj: 18, ponderacion: 20 },
    ],
  },
  {
    codModule: 'MOD-006', nombre: 'Estadística Aplicada', totalHoraAcademic: 80, totalHoraReloj: 65,
    cantidadUnidades: 3, carrera: 'Técnico en Ciencia de Datos', fechaCreacion: '2024-06-01', planningFileName: null,
    units: [
      { codUnit: 'UD-ES-01', nombre: 'Estadística Descriptiva', totalHoraAcademic: 28, totalHoraReloj: 22, ponderacion: 35 },
      { codUnit: 'UD-ES-02', nombre: 'Probabilidad y Distribuciones', totalHoraAcademic: 26, totalHoraReloj: 21, ponderacion: 33 },
      { codUnit: 'UD-ES-03', nombre: 'Inferencia Estadística y Pruebas', totalHoraAcademic: 26, totalHoraReloj: 22, ponderacion: 32 },
    ],
  },
  {
    codModule: 'MOD-007', nombre: 'Programación en Python', totalHoraAcademic: 120, totalHoraReloj: 100,
    cantidadUnidades: 4, carrera: 'Técnico en Ciencia de Datos', fechaCreacion: '2024-07-01', planningFileName: 'Python_Planning.pdf',
    units: [
      { codUnit: 'UD-PY-01', nombre: 'Fundamentos de Python', totalHoraAcademic: 30, totalHoraReloj: 25, ponderacion: 25 },
      { codUnit: 'UD-PY-02', nombre: 'Estructuras de Datos y POO', totalHoraAcademic: 34, totalHoraReloj: 28, ponderacion: 28 },
      { codUnit: 'UD-PY-03', nombre: 'Librerías: NumPy, Pandas, Matplotlib', totalHoraAcademic: 30, totalHoraReloj: 25, ponderacion: 25 },
      { codUnit: 'UD-PY-04', nombre: 'Introducción al Machine Learning', totalHoraAcademic: 26, totalHoraReloj: 22, ponderacion: 22 },
    ],
  },
  {
    codModule: 'MOD-008', nombre: 'Diseño UX/UI', totalHoraAcademic: 70, totalHoraReloj: 56,
    cantidadUnidades: 3, carrera: 'Técnico en Desarrollo Web', fechaCreacion: '2024-08-15', planningFileName: null,
    units: [
      { codUnit: 'UD-UX-01', nombre: 'Principios de Diseño Centrado en Usuario', totalHoraAcademic: 24, totalHoraReloj: 18, ponderacion: 34 },
      { codUnit: 'UD-UX-02', nombre: 'Wireframing y Prototipado', totalHoraAcademic: 24, totalHoraReloj: 20, ponderacion: 34 },
      { codUnit: 'UD-UX-03', nombre: 'Pruebas de Usabilidad y Accesibilidad', totalHoraAcademic: 22, totalHoraReloj: 18, ponderacion: 32 },
    ],
  },
  {
    codModule: 'MOD-009', nombre: 'Administración de Servidores', totalHoraAcademic: 100, totalHoraReloj: 80,
    cantidadUnidades: 3, carrera: 'Técnico en Redes y Telecomunicaciones', fechaCreacion: '2024-09-01', planningFileName: 'Plan_Servidores.pdf',
    units: [
      { codUnit: 'UD-SV-01', nombre: 'Windows Server: AD, DNS, DHCP', totalHoraAcademic: 36, totalHoraReloj: 28, ponderacion: 36 },
      { codUnit: 'UD-SV-02', nombre: 'Linux Server: Apache, Nginx, FTP', totalHoraAcademic: 34, totalHoraReloj: 28, ponderacion: 34 },
      { codUnit: 'UD-SV-03', nombre: 'Virtualización y Contenedores', totalHoraAcademic: 30, totalHoraReloj: 24, ponderacion: 30 },
    ],
  },
  {
    codModule: 'MOD-010', nombre: 'Inglés Técnico para TI', totalHoraAcademic: 48, totalHoraReloj: 40,
    cantidadUnidades: 2, carrera: 'Técnico General en Computación', fechaCreacion: '2024-10-01', planningFileName: null,
    units: [
      { codUnit: 'UD-EN-01', nombre: 'Technical Vocabulary & Documentation', totalHoraAcademic: 28, totalHoraReloj: 24, ponderacion: 58 },
      { codUnit: 'UD-EN-02', nombre: 'Professional Communication', totalHoraAcademic: 20, totalHoraReloj: 16, ponderacion: 42 },
    ],
  },
];

const mockMemorandums = [
  {
    id: 'MEM-001', docenteId: 'DOC-001', docenteNombre: 'Ing. Carlos Mendoza',
    tipo: TipoCarrera.TECNICA, programa: 'Técnico General en Computación',
    fechaEmision: getToday(-30), fechaInicio: getToday(-28), fechaFin: getToday(45),
    estado: 'ACTIVO' as const,
    modulos: [{
      codModule: 'MOD-001', nombre: 'Sistemas Operativos', horasTotales: 120,
      unidades: [
        { id: 'UD-SO-01', nombre: 'Introducción a los SO y Arquitectura', fechaInicio: getToday(-28), fechaFin: getToday(-10), horasAsignadas: 30, estado: EstadoUnidad.FINALIZADA, codModule: 'MOD-001', ponderacion: 25 },
        { id: 'UD-SO-02', nombre: 'Gestión y Planificación de Procesos', fechaInicio: getToday(-10), fechaFin: getToday(10), horasAsignadas: 50, estado: EstadoUnidad.EN_PROGRESO, codModule: 'MOD-001', ponderacion: 45 },
        { id: 'UD-SO-03', nombre: 'Gestión de Memoria y Memoria Virtual', fechaInicio: getToday(10), fechaFin: getToday(45), horasAsignadas: 40, estado: EstadoUnidad.PENDIENTE, codModule: 'MOD-001', ponderacion: 30 },
      ],
    }],
  },
  {
    id: 'MEM-002', docenteId: 'DOC-002', docenteNombre: 'MSc. Elena Rostova',
    tipo: TipoCarrera.CURSO, programa: 'Curso de Excel Avanzado',
    fechaEmision: getToday(-20), fechaInicio: getToday(-18), fechaFin: getToday(20),
    estado: 'ACTIVO' as const,
    modulos: [{
      codModule: 'MOD-003', nombre: 'Excel Avanzado: Fórmulas y Macros', horasTotales: 60,
      unidades: [
        { id: 'UD-EX-01', nombre: 'Fórmulas Avanzadas y Funciones Anidadas', fechaInicio: getToday(-18), fechaFin: getToday(-5), horasAsignadas: 20, estado: EstadoUnidad.FINALIZADA, codModule: 'MOD-003', ponderacion: 33 },
        { id: 'UD-EX-02', nombre: 'Tablas Dinámicas y Gráficos', fechaInicio: getToday(-5), fechaFin: getToday(5), horasAsignadas: 20, estado: EstadoUnidad.EN_PROGRESO, codModule: 'MOD-003', ponderacion: 33 },
        { id: 'UD-EX-03', nombre: 'Macros y Automatización con VBA', fechaInicio: getToday(5), fechaFin: getToday(20), horasAsignadas: 20, estado: EstadoUnidad.PENDIENTE, codModule: 'MOD-003', ponderacion: 34 },
      ],
    }],
  },
  {
    id: 'MEM-003', docenteId: 'DOC-003', docenteNombre: 'Lic. Roberto Quirós',
    tipo: TipoCarrera.TECNICA, programa: 'Técnico en Desarrollo Web',
    fechaEmision: getToday(-15), fechaInicio: getToday(-14), fechaFin: getToday(55),
    estado: 'ACTIVO' as const,
    modulos: [{
      codModule: 'MOD-004', nombre: 'Desarrollo Frontend con React', horasTotales: 80,
      unidades: [
        { id: 'UD-DW-01', nombre: 'Fundamentos de HTML, CSS y JavaScript', fechaInicio: getToday(-14), fechaFin: getToday(-2), horasAsignadas: 25, estado: EstadoUnidad.FINALIZADA, codModule: 'MOD-004', ponderacion: 30 },
        { id: 'UD-DW-02', nombre: 'Introducción a React y Componentes', fechaInicio: getToday(-2), fechaFin: getToday(3), horasAsignadas: 30, estado: EstadoUnidad.EN_PROGRESO, codModule: 'MOD-004', ponderacion: 40 },
        { id: 'UD-DW-03', nombre: 'Routing, Estado y Despliegue', fechaInicio: getToday(3), fechaFin: getToday(55), horasAsignadas: 25, estado: EstadoUnidad.PENDIENTE, codModule: 'MOD-004', ponderacion: 30 },
      ],
    }],
  },
  {
    id: 'MEM-004', docenteId: 'DOC-005', docenteNombre: 'MSc. Fernando Rivas',
    tipo: TipoCarrera.TECNICA, programa: 'Técnico en Redes y Telecomunicaciones',
    fechaEmision: getToday(-10), fechaInicio: getToday(-8), fechaFin: getToday(60),
    estado: 'ACTIVO' as const,
    modulos: [
      {
        codModule: 'MOD-005', nombre: 'Redes de Computadoras', horasTotales: 110,
        unidades: [
          { id: 'UD-RD-01', nombre: 'Fundamentos de Redes y Modelo OSI', fechaInicio: getToday(-8), fechaFin: getToday(7), horasAsignadas: 28, estado: EstadoUnidad.EN_PROGRESO, codModule: 'MOD-005', ponderacion: 25 },
          { id: 'UD-RD-02', nombre: 'Protocolos TCP/IP y Direccionamiento', fechaInicio: getToday(7), fechaFin: getToday(25), horasAsignadas: 32, estado: EstadoUnidad.PENDIENTE, codModule: 'MOD-005', ponderacion: 30 },
          { id: 'UD-RD-03', nombre: 'Enrutamiento y Conmutación', fechaInicio: getToday(25), fechaFin: getToday(45), horasAsignadas: 28, estado: EstadoUnidad.PENDIENTE, codModule: 'MOD-005', ponderacion: 25 },
          { id: 'UD-RD-04', nombre: 'Seguridad en Redes', fechaInicio: getToday(45), fechaFin: getToday(60), horasAsignadas: 22, estado: EstadoUnidad.PENDIENTE, codModule: 'MOD-005', ponderacion: 20 },
        ],
      },
      {
        codModule: 'MOD-009', nombre: 'Administración de Servidores', horasTotales: 100,
        unidades: [
          { id: 'UD-SV-01', nombre: 'Windows Server: AD, DNS, DHCP', fechaInicio: getToday(-8), fechaFin: getToday(12), horasAsignadas: 36, estado: EstadoUnidad.EN_PROGRESO, codModule: 'MOD-009', ponderacion: 36 },
          { id: 'UD-SV-02', nombre: 'Linux Server: Apache, Nginx, FTP', fechaInicio: getToday(12), fechaFin: getToday(35), horasAsignadas: 34, estado: EstadoUnidad.PENDIENTE, codModule: 'MOD-009', ponderacion: 34 },
          { id: 'UD-SV-03', nombre: 'Virtualización y Contenedores', fechaInicio: getToday(35), fechaFin: getToday(60), horasAsignadas: 30, estado: EstadoUnidad.PENDIENTE, codModule: 'MOD-009', ponderacion: 30 },
        ],
      },
    ],
  },
  {
    id: 'MEM-005', docenteId: 'DOC-004', docenteNombre: 'Dra. Sylvia Salazar',
    tipo: TipoCarrera.TECNICA, programa: 'Técnico en Ciencia de Datos',
    fechaEmision: getToday(-25), fechaInicio: getToday(-22), fechaFin: getToday(40),
    estado: 'ACTIVO' as const,
    modulos: [
      {
        codModule: 'MOD-006', nombre: 'Estadística Aplicada', horasTotales: 80,
        unidades: [
          { id: 'UD-ES-01', nombre: 'Estadística Descriptiva', fechaInicio: getToday(-22), fechaFin: getToday(-8), horasAsignadas: 28, estado: EstadoUnidad.FINALIZADA, codModule: 'MOD-006', ponderacion: 35 },
          { id: 'UD-ES-02', nombre: 'Probabilidad y Distribuciones', fechaInicio: getToday(-8), fechaFin: getToday(8), horasAsignadas: 26, estado: EstadoUnidad.EN_PROGRESO, codModule: 'MOD-006', ponderacion: 33 },
          { id: 'UD-ES-03', nombre: 'Inferencia Estadística y Pruebas', fechaInicio: getToday(8), fechaFin: getToday(40), horasAsignadas: 26, estado: EstadoUnidad.PENDIENTE, codModule: 'MOD-006', ponderacion: 32 },
        ],
      },
      {
        codModule: 'MOD-007', nombre: 'Programación en Python', horasTotales: 120,
        unidades: [
          { id: 'UD-PY-01', nombre: 'Fundamentos de Python', fechaInicio: getToday(-22), fechaFin: getToday(-5), horasAsignadas: 30, estado: EstadoUnidad.FINALIZADA, codModule: 'MOD-007', ponderacion: 25 },
          { id: 'UD-PY-02', nombre: 'Estructuras de Datos y POO', fechaInicio: getToday(-5), fechaFin: getToday(15), horasAsignadas: 34, estado: EstadoUnidad.EN_PROGRESO, codModule: 'MOD-007', ponderacion: 28 },
          { id: 'UD-PY-03', nombre: 'Librerías: NumPy, Pandas, Matplotlib', fechaInicio: getToday(15), fechaFin: getToday(30), horasAsignadas: 30, estado: EstadoUnidad.PENDIENTE, codModule: 'MOD-007', ponderacion: 25 },
          { id: 'UD-PY-04', nombre: 'Introducción al Machine Learning', fechaInicio: getToday(30), fechaFin: getToday(40), horasAsignadas: 26, estado: EstadoUnidad.PENDIENTE, codModule: 'MOD-007', ponderacion: 22 },
        ],
      },
    ],
  },
  {
    id: 'MEM-006', docenteId: 'DOC-008', docenteNombre: 'MSc. Ana Lucía Brenes',
    tipo: TipoCarrera.CURSO, programa: 'Curso de Excel Avanzado',
    fechaEmision: getToday(-40), fechaInicio: getToday(-38), fechaFin: getToday(-5),
    estado: 'FINALIZADO' as const,
    modulos: [{
      codModule: 'MOD-003', nombre: 'Excel Avanzado: Fórmulas y Macros', horasTotales: 60,
      unidades: [
        { id: 'UD-EX-01', nombre: 'Fórmulas Avanzadas y Funciones Anidadas', fechaInicio: getToday(-38), fechaFin: getToday(-25), horasAsignadas: 20, estado: EstadoUnidad.FINALIZADA, codModule: 'MOD-003', ponderacion: 33 },
        { id: 'UD-EX-02', nombre: 'Tablas Dinámicas y Gráficos', fechaInicio: getToday(-25), fechaFin: getToday(-15), horasAsignadas: 20, estado: EstadoUnidad.FINALIZADA, codModule: 'MOD-003', ponderacion: 33 },
        { id: 'UD-EX-03', nombre: 'Macros y Automatización con VBA', fechaInicio: getToday(-15), fechaFin: getToday(-5), horasAsignadas: 20, estado: EstadoUnidad.FINALIZADA, codModule: 'MOD-003', ponderacion: 34 },
      ],
    }],
  },
  {
    id: 'MEM-007', docenteId: 'DOC-006', docenteNombre: 'Lic. Mariana Pineda',
    tipo: TipoCarrera.TECNICA, programa: 'Técnico General en Computación',
    fechaEmision: getToday(-5), fechaInicio: getToday(-3), fechaFin: getToday(65),
    estado: 'ACTIVO' as const,
    modulos: [
      {
        codModule: 'MOD-002', nombre: 'Base de Datos I', horasTotales: 96,
        unidades: [
          { id: 'UD-BD-01', nombre: 'Modelo Entidad-Relación', fechaInicio: getToday(-3), fechaFin: getToday(12), horasAsignadas: 24, estado: EstadoUnidad.EN_PROGRESO, codModule: 'MOD-002', ponderacion: 25 },
          { id: 'UD-BD-02', nombre: 'Álgebra Relacional y SQL Básico', fechaInicio: getToday(12), fechaFin: getToday(30), horasAsignadas: 28, estado: EstadoUnidad.PENDIENTE, codModule: 'MOD-002', ponderacion: 30 },
          { id: 'UD-BD-03', nombre: 'Normalización y Diseño Físico', fechaInicio: getToday(30), fechaFin: getToday(48), horasAsignadas: 24, estado: EstadoUnidad.PENDIENTE, codModule: 'MOD-002', ponderacion: 25 },
          { id: 'UD-BD-04', nombre: 'Transacciones y Seguridad', fechaInicio: getToday(48), fechaFin: getToday(65), horasAsignadas: 20, estado: EstadoUnidad.PENDIENTE, codModule: 'MOD-002', ponderacion: 20 },
        ],
      },
      {
        codModule: 'MOD-010', nombre: 'Inglés Técnico para TI', horasTotales: 48,
        unidades: [
          { id: 'UD-EN-01', nombre: 'Technical Vocabulary & Documentation', fechaInicio: getToday(-3), fechaFin: getToday(20), horasAsignadas: 28, estado: EstadoUnidad.EN_PROGRESO, codModule: 'MOD-010', ponderacion: 58 },
          { id: 'UD-EN-02', nombre: 'Professional Communication', fechaInicio: getToday(20), fechaFin: getToday(65), horasAsignadas: 20, estado: EstadoUnidad.PENDIENTE, codModule: 'MOD-010', ponderacion: 42 },
        ],
      },
    ],
  },
];

const mockDosificaciones = [
  { id: 'DOS-MEM-001-MOD-001', memorandumId: 'MEM-001', docenteId: 'DOC-001', docenteNombre: 'Ing. Carlos Mendoza', moduloId: 'MOD-001', moduloNombre: 'Sistemas Operativos', fechaCreacion: getToday(-30), turno: Turno.MATUTINO, configFrecuencia: { diasClase: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'], horasSesion: 4, usarHorasReloj: false, turno: Turno.MATUTINO, fechasFeriadas: [] } },
  { id: 'DOS-MEM-002-MOD-003', memorandumId: 'MEM-002', docenteId: 'DOC-002', docenteNombre: 'MSc. Elena Rostova', moduloId: 'MOD-003', moduloNombre: 'Excel Avanzado: Fórmulas y Macros', fechaCreacion: getToday(-20), turno: Turno.MATUTINO, configFrecuencia: { diasClase: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'], horasSesion: 4, usarHorasReloj: false, turno: Turno.MATUTINO, fechasFeriadas: [] } },
  { id: 'DOS-MEM-003-MOD-004', memorandumId: 'MEM-003', docenteId: 'DOC-003', docenteNombre: 'Lic. Roberto Quirós', moduloId: 'MOD-004', moduloNombre: 'Desarrollo Frontend con React', fechaCreacion: getToday(-15), turno: Turno.MATUTINO, configFrecuencia: { diasClase: ['Lunes', 'Miércoles', 'Viernes'], horasSesion: 6, usarHorasReloj: true, turno: Turno.MATUTINO, fechasFeriadas: [] } },
  { id: 'DOS-MEM-004-MOD-005', memorandumId: 'MEM-004', docenteId: 'DOC-005', docenteNombre: 'MSc. Fernando Rivas', moduloId: 'MOD-005', moduloNombre: 'Redes de Computadoras', fechaCreacion: getToday(-10), turno: Turno.VESPERTINO, configFrecuencia: { diasClase: ['Martes', 'Jueves'], horasSesion: 5, usarHorasReloj: false, turno: Turno.VESPERTINO, fechasFeriadas: [] } },
  { id: 'DOS-MEM-004-MOD-009', memorandumId: 'MEM-004', docenteId: 'DOC-005', docenteNombre: 'MSc. Fernando Rivas', moduloId: 'MOD-009', moduloNombre: 'Administración de Servidores', fechaCreacion: getToday(-10), turno: Turno.NOCTURNO, configFrecuencia: { diasClase: ['Lunes', 'Miércoles'], horasSesion: 3, usarHorasReloj: false, turno: Turno.NOCTURNO, fechasFeriadas: [] } },
  { id: 'DOS-MEM-005-MOD-006', memorandumId: 'MEM-005', docenteId: 'DOC-004', docenteNombre: 'Dra. Sylvia Salazar', moduloId: 'MOD-006', moduloNombre: 'Estadística Aplicada', fechaCreacion: getToday(-22), turno: Turno.MATUTINO, configFrecuencia: { diasClase: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'], horasSesion: 4, usarHorasReloj: false, turno: Turno.MATUTINO, fechasFeriadas: [] } },
  { id: 'DOS-MEM-005-MOD-007', memorandumId: 'MEM-005', docenteId: 'DOC-004', docenteNombre: 'Dra. Sylvia Salazar', moduloId: 'MOD-007', moduloNombre: 'Programación en Python', fechaCreacion: getToday(-22), turno: Turno.VESPERTINO, configFrecuencia: { diasClase: ['Lunes', 'Miércoles', 'Viernes'], horasSesion: 4, usarHorasReloj: false, turno: Turno.VESPERTINO, fechasFeriadas: [] } },
  { id: 'DOS-MEM-007-MOD-002', memorandumId: 'MEM-007', docenteId: 'DOC-006', docenteNombre: 'Lic. Mariana Pineda', moduloId: 'MOD-002', moduloNombre: 'Base de Datos I', fechaCreacion: getToday(-5), turno: Turno.MATUTINO, configFrecuencia: { diasClase: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'], horasSesion: 4, usarHorasReloj: false, turno: Turno.MATUTINO, fechasFeriadas: [] } },
  { id: 'DOS-MEM-007-MOD-010', memorandumId: 'MEM-007', docenteId: 'DOC-006', docenteNombre: 'Lic. Mariana Pineda', moduloId: 'MOD-010', moduloNombre: 'Inglés Técnico para TI', fechaCreacion: getToday(-5), turno: Turno.VESPERTINO, configFrecuencia: { diasClase: ['Martes', 'Jueves'], horasSesion: 3, usarHorasReloj: false, turno: Turno.VESPERTINO, fechasFeriadas: [] } },
];

const mockNotifications = [
  { id: 'NOT-001', tipo: TipoNotificacion.FINALIZACION_UNIDAD, docenteId: 'DOC-001', docenteNombre: 'Ing. Carlos Mendoza', moduloNombre: 'Sistemas Operativos', unidadNombre: 'Introducción a los SO y Arquitectura', fechaEvento: getToday(-10), fechaNotificacion: getToday(-10), estado: EstadoNotificacion.LEIDA, canal: 'CALENDARIO', mensaje: 'Carlos Mendoza ha finalizado la unidad "Introducción a los SO y Arquitectura" del módulo Sistemas Operativos.', metadata: null },
  { id: 'NOT-002', tipo: TipoNotificacion.ALERTA_PREVIA, docenteId: 'DOC-001', docenteNombre: 'Ing. Carlos Mendoza', moduloNombre: 'Sistemas Operativos', unidadNombre: 'Gestión y Planificación de Procesos', fechaEvento: getToday(10), fechaNotificacion: getToday(), estado: EstadoNotificacion.PENDIENTE, canal: 'PANEL', mensaje: '⚠️ La unidad "Gestión y Planificación de Procesos" del módulo Sistemas Operativos finaliza en menos de 3 días.', metadata: JSON.stringify({ codUnidad: 'UD-SO-02', codModule: 'MOD-001' }) },
  { id: 'NOT-003', tipo: TipoNotificacion.FINALIZACION_UNIDAD, docenteId: 'DOC-002', docenteNombre: 'MSc. Elena Rostova', moduloNombre: 'Excel Avanzado: Fórmulas y Macros', unidadNombre: 'Fórmulas Avanzadas y Funciones Anidadas', fechaEvento: getToday(-5), fechaNotificacion: getToday(-5), estado: EstadoNotificacion.ENVIADA, canal: 'WHATSAPP', mensaje: 'Elena Rostova ha finalizado la unidad "Fórmulas Avanzadas y Funciones Anidadas" del módulo Excel Avanzado.', metadata: null },
  { id: 'NOT-004', tipo: TipoNotificacion.ALERTA_PREVIA, docenteId: 'DOC-002', docenteNombre: 'MSc. Elena Rostova', moduloNombre: 'Excel Avanzado: Fórmulas y Macros', unidadNombre: 'Tablas Dinámicas y Gráficos', fechaEvento: getToday(5), fechaNotificacion: getToday(), estado: EstadoNotificacion.PENDIENTE, canal: 'PANEL', mensaje: '⚠️ La unidad "Tablas Dinámicas y Gráficos" del módulo Excel Avanzado finaliza en menos de 3 días.', metadata: JSON.stringify({ codUnidad: 'UD-EX-02', codModule: 'MOD-003' }) },
  { id: 'NOT-005', tipo: TipoNotificacion.ALERTA_PREVIA, docenteId: 'DOC-003', docenteNombre: 'Lic. Roberto Quirós', moduloNombre: 'Desarrollo Frontend con React', unidadNombre: 'Introducción a React y Componentes', fechaEvento: getToday(3), fechaNotificacion: getToday(), estado: EstadoNotificacion.PENDIENTE, canal: 'PANEL', mensaje: '⚠️ La unidad "Introducción a React y Componentes" del módulo Desarrollo Frontend finaliza en menos de 3 días.', metadata: JSON.stringify({ codUnidad: 'UD-DW-02', codModule: 'MOD-004' }) },
  { id: 'NOT-006', tipo: TipoNotificacion.FINALIZACION_MODULO, docenteId: 'DOC-008', docenteNombre: 'MSc. Ana Lucía Brenes', moduloNombre: 'Excel Avanzado: Fórmulas y Macros', unidadNombre: null, fechaEvento: getToday(-5), fechaNotificacion: getToday(-5), estado: EstadoNotificacion.LEIDA, canal: 'CALENDARIO', mensaje: 'Ana Lucía Brenes ha completado el módulo "Excel Avanzado: Fórmulas y Macros" al 100%.', metadata: JSON.stringify({ codModule: 'MOD-003' }) },
  { id: 'NOT-007', tipo: TipoNotificacion.ALERTA_PREVIA, docenteId: 'DOC-005', docenteNombre: 'MSc. Fernando Rivas', moduloNombre: 'Redes de Computadoras', unidadNombre: 'Fundamentos de Redes y Modelo OSI', fechaEvento: getToday(7), fechaNotificacion: getToday(), estado: EstadoNotificacion.PENDIENTE, canal: 'PANEL', mensaje: '⚠️ La unidad "Fundamentos de Redes y Modelo OSI" del módulo Redes de Computadoras finaliza en menos de 3 días.', metadata: JSON.stringify({ codUnidad: 'UD-RD-01', codModule: 'MOD-005' }) },
  { id: 'NOT-008', tipo: TipoNotificacion.FINALIZACION_UNIDAD, docenteId: 'DOC-004', docenteNombre: 'Dra. Sylvia Salazar', moduloNombre: 'Estadística Aplicada', unidadNombre: 'Estadística Descriptiva', fechaEvento: getToday(-8), fechaNotificacion: getToday(-8), estado: EstadoNotificacion.LEIDA, canal: 'CALENDARIO', mensaje: 'Sylvia Salazar ha finalizado la unidad "Estadística Descriptiva" del módulo Estadística Aplicada.', metadata: null },
  { id: 'NOT-009', tipo: TipoNotificacion.RECORDATORIO, docenteId: 'DOC-006', docenteNombre: 'Lic. Mariana Pineda', moduloNombre: 'Base de Datos I', unidadNombre: null, fechaEvento: getToday(), fechaNotificacion: getToday(), estado: EstadoNotificacion.PENDIENTE, canal: 'PANEL', mensaje: '📋 Recordatorio: Revisar planificación del módulo "Base de Datos I" para la próxima semana.', metadata: null },
  { id: 'NOT-010', tipo: TipoNotificacion.ALERTA_PREVIA, docenteId: 'DOC-005', docenteNombre: 'MSc. Fernando Rivas', moduloNombre: 'Administración de Servidores', unidadNombre: 'Windows Server: AD, DNS, DHCP', fechaEvento: getToday(12), fechaNotificacion: getToday(), estado: EstadoNotificacion.ENVIADA, canal: 'WHATSAPP', mensaje: '⚠️ La unidad "Windows Server: AD, DNS, DHCP" del módulo Administración de Servidores finaliza pronto.', metadata: JSON.stringify({ codUnidad: 'UD-SV-01', codModule: 'MOD-009' }) },
  { id: 'NOT-011', tipo: TipoNotificacion.FINALIZACION_UNIDAD, docenteId: 'DOC-004', docenteNombre: 'Dra. Sylvia Salazar', moduloNombre: 'Programación en Python', unidadNombre: 'Fundamentos de Python', fechaEvento: getToday(-5), fechaNotificacion: getToday(-5), estado: EstadoNotificacion.ENVIADA, canal: 'CALENDARIO', mensaje: 'Sylvia Salazar ha finalizado la unidad "Fundamentos de Python" del módulo Programación en Python.', metadata: null },
  { id: 'NOT-012', tipo: TipoNotificacion.RECORDATORIO, docenteId: 'DOC-001', docenteNombre: 'Ing. Carlos Mendoza', moduloNombre: 'Sistemas Operativos', unidadNombre: null, fechaEvento: getToday(1), fechaNotificacion: getToday(), estado: EstadoNotificacion.PENDIENTE, canal: 'PANEL', mensaje: '📋 Recordatorio: Actualizar bitácora de Sistemas Operativos antes del viernes.', metadata: null },
  { id: 'NOT-013', tipo: TipoNotificacion.ALERTA_PREVIA, docenteId: 'DOC-004', docenteNombre: 'Dra. Sylvia Salazar', moduloNombre: 'Probabilidad y Distribuciones', unidadNombre: 'Probabilidad y Distribuciones', fechaEvento: getToday(8), fechaNotificacion: getToday(), estado: EstadoNotificacion.PENDIENTE, canal: 'PANEL', mensaje: '⚠️ La unidad "Probabilidad y Distribuciones" del módulo Estadística Aplicada finaliza en menos de 3 días.', metadata: JSON.stringify({ codUnidad: 'UD-ES-02', codModule: 'MOD-006' }) },
  { id: 'NOT-014', tipo: TipoNotificacion.FINALIZACION_UNIDAD, docenteId: 'DOC-005', docenteNombre: 'MSc. Fernando Rivas', moduloNombre: 'Redes de Computadoras', unidadNombre: 'Fundamentos de Redes y Modelo OSI', fechaEvento: getToday(7), fechaNotificacion: getToday(7), estado: EstadoNotificacion.PENDIENTE, canal: 'PANEL', mensaje: 'Fernando Rivas ha finalizado la unidad "Fundamentos de Redes y Modelo OSI" del módulo Redes de Computadoras.', metadata: null },
  { id: 'NOT-015', tipo: TipoNotificacion.FINALIZACION_MODULO, docenteId: 'DOC-003', docenteNombre: 'Lic. Roberto Quirós', moduloNombre: 'Desarrollo Frontend con React', unidadNombre: null, fechaEvento: getToday(55), fechaNotificacion: getToday(), estado: EstadoNotificacion.PENDIENTE, canal: 'PANEL', mensaje: '🏁 El módulo "Desarrollo Frontend con React" finalizará su planificación en 55 días.', metadata: JSON.stringify({ codModule: 'MOD-004' }) },
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

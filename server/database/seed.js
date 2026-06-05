import db from './db.js';

function getToday(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
}

export function seedDatabase() {
  const count = db.prepare('SELECT COUNT(*) as c FROM docentes').get();
  if (count.c > 0) return false;

  const insertDocente = db.prepare('INSERT INTO docentes (id, nombre, email, telefono, carrera, especialidad, estado, fechaRegistro) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
  insertDocente.run('DOC-001', 'Ing. Carlos Mendoza', 'carlos.mendoza@instituto.edu', '50683019284', 'Análisis de Sistemas', 'Bases de Datos', 'Activo', '2025-01-10');
  insertDocente.run('DOC-002', 'MSc. Elena Rostova', 'elena.rostova@instituto.edu', '50688776655', 'Ingeniería de Sistemas', 'Arquitectura de Software', 'Activo', '2023-05-15');
  insertDocente.run('DOC-003', 'Lic. Roberto Quirós', 'roberto.quiros@instituto.edu', '50670123456', 'Análisis de Sistemas', 'Metodología Ágil', 'Activo', '2024-03-20');
  insertDocente.run('DOC-004', 'Dra. Sylvia Salazar', 'sylvia.salazar@instituto.edu', '50687654321', 'Ciencia de Datos', 'Inteligencia Artificial', 'Activo', '2024-08-01');

  const insertModulo = db.prepare('INSERT INTO modulos (id, nombre, totalHoraAcademic, totalHoraReloj, carrera, fechaCreacion, planningFileName) VALUES (?, ?, ?, ?, ?, ?, ?)');
  insertModulo.run('MOD-001', 'Sistemas Operativos', 120, 100, 'Ingeniería de Sistemas', '2024-01-15', 'Planificacion_Anual_SO.pdf');
  insertModulo.run('MOD-002', 'Base de Datos I', 96, 80, 'Análisis de Sistemas', '2024-02-10', 'Planeacion_Curricular_BD.pdf');
  insertModulo.run('MOD-003', 'Excel Avanzado: Fórmulas y Macros', 60, 50, 'Administración', '2024-03-01', null);
  insertModulo.run('MOD-004', 'Desarrollo Frontend con React', 80, 65, 'Ingeniería de Sistemas', '2024-04-01', null);

  const insertUnit = db.prepare('INSERT INTO modulos_units (id, codModule, nombre, totalHoraAcademic, totalHoraReloj, ponderacion) VALUES (?, ?, ?, ?, ?, ?)');
  insertUnit.run('UN-SO-01', 'MOD-001', 'Introducción a los SO y Arquitectura', 30, 25, 25);
  insertUnit.run('UN-SO-02', 'MOD-001', 'Gestión y Planificación de Procesos', 50, 40, 45);
  insertUnit.run('UN-SO-03', 'MOD-001', 'Gestión de Memoria y Memoria Virtual', 40, 35, 30);
  insertUnit.run('UN-BD-01', 'MOD-002', 'Fundamentos de BD y Modelo E-R', 46, 40, 55);
  insertUnit.run('UN-BD-02', 'MOD-002', 'Lenguaje SQL y Transacciones', 50, 40, 45);

  const insertActivity = db.prepare('INSERT INTO modulos_activities (id, codModule, unitId, descripcion, ha) VALUES (?, ?, ?, ?, ?)');
  insertActivity.run('ACT-SO-1', 'MOD-001', '1', 'Introducción a los SO y Arquitectura', 10);
  insertActivity.run('ACT-SO-2', 'MOD-001', '1', 'Gestión de Procesos y Hilos', 20);
  insertActivity.run('ACT-SO-3', 'MOD-001', '2', 'Planificación de CPU', 15);
  insertActivity.run('ACT-SO-4', 'MOD-001', '2', 'Sincronización de Procesos', 25);

  const insertMem = db.prepare('INSERT INTO memorandums (id, docenteId, docenteNombre, tipo, programa, fechaEmision, fechaInicio, fechaFin, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
  insertMem.run('MEM-001', 'DOC-001', 'Ing. Carlos Mendoza', 'Técnica', 'Técnico General en Computación', getToday(-30), getToday(-28), getToday(45), 'ACTIVO');
  insertMem.run('MEM-002', 'DOC-002', 'MSc. Elena Rostova', 'Curso', 'Curso de Excel Avanzado', getToday(-20), getToday(-18), getToday(20), 'ACTIVO');
  insertMem.run('MEM-003', 'DOC-003', 'Lic. Roberto Quirós', 'Técnica', 'Técnico en Desarrollo Web', getToday(-15), getToday(-14), getToday(55), 'ACTIVO');

  const insertUd = db.prepare('INSERT INTO unidades (id, codModule, memorandumId, nombre, fechaInicio, fechaFin, horasAsignadas, estado, ponderacion) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
  insertUd.run('UD-SO-01', 'MOD-001', 'MEM-001', 'Introducción a los SO y Arquitectura', getToday(-28), getToday(-10), 30, 'FINALIZADA', 25);
  insertUd.run('UD-SO-02', 'MOD-001', 'MEM-001', 'Gestión y Planificación de Procesos', getToday(-10), getToday(10), 50, 'EN_PROGRESO', 45);
  insertUd.run('UD-SO-03', 'MOD-001', 'MEM-001', 'Gestión de Memoria y Memoria Virtual', getToday(10), getToday(45), 40, 'PENDIENTE', 30);
  insertUd.run('UD-EX-01', 'MOD-003', 'MEM-002', 'Fórmulas Avanzadas y Funciones Anidadas', getToday(-18), getToday(-5), 20, 'FINALIZADA', 33);
  insertUd.run('UD-EX-02', 'MOD-003', 'MEM-002', 'Tablas Dinámicas y Gráficos', getToday(-5), getToday(5), 20, 'EN_PROGRESO', 33);
  insertUd.run('UD-EX-03', 'MOD-003', 'MEM-002', 'Macros y Automatización con VBA', getToday(5), getToday(20), 20, 'PENDIENTE', 34);
  insertUd.run('UD-DW-01', 'MOD-004', 'MEM-003', 'Fundamentos de HTML, CSS y JavaScript', getToday(-14), getToday(-2), 25, 'FINALIZADA', 30);
  insertUd.run('UD-DW-02', 'MOD-004', 'MEM-003', 'Introducción a React y Componentes', getToday(-2), getToday(3), 30, 'EN_PROGRESO', 40);
  insertUd.run('UD-DW-03', 'MOD-004', 'MEM-003', 'Routing, Estado y Despliegue', getToday(3), getToday(55), 25, 'PENDIENTE', 30);

  const insertDos = db.prepare('INSERT INTO dosificaciones (id, memorandumId, docenteId, docenteNombre, moduloId, moduloNombre, fechaCreacion, turno, configFrecuencia) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
  insertDos.run('DOS-MEM-001-MOD-001', 'MEM-001', 'DOC-001', 'Ing. Carlos Mendoza', 'MOD-001', 'Sistemas Operativos', getToday(-30), 'Matutino', JSON.stringify({ diasClase: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'], horasSesion: 4, usarHorasReloj: false, turno: 'Matutino', fechasFeriadas: [] }));
  insertDos.run('DOS-MEM-002-MOD-003', 'MEM-002', 'DOC-002', 'MSc. Elena Rostova', 'MOD-003', 'Excel Avanzado: Fórmulas y Macros', getToday(-20), 'Matutino', JSON.stringify({ diasClase: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'], horasSesion: 4, usarHorasReloj: false, turno: 'Matutino', fechasFeriadas: [] }));
  insertDos.run('DOS-MEM-003-MOD-004', 'MEM-003', 'DOC-003', 'Lic. Roberto Quirós', 'MOD-004', 'Desarrollo Frontend con React', getToday(-15), 'Matutino', JSON.stringify({ diasClase: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'], horasSesion: 4, usarHorasReloj: false, turno: 'Matutino', fechasFeriadas: [] }));

  const insertNot = db.prepare('INSERT INTO notificaciones (id, tipo, docenteId, docenteNombre, moduloNombre, unidadNombre, fechaEvento, fechaNotificacion, estado, canal, mensaje, metadata) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
  insertNot.run('NOT-001', 'FINALIZACION_UNIDAD', 'DOC-001', 'Ing. Carlos Mendoza', 'Sistemas Operativos', 'Introducción a los SO y Arquitectura', getToday(-10), getToday(-10), 'LEIDA', 'CALENDARIO', 'Carlos Mendoza ha finalizado la unidad "Introducción a los SO y Arquitectura" del módulo Sistemas Operativos.', null);
  insertNot.run('NOT-002', 'ALERTA_PREVIA', 'DOC-001', 'Ing. Carlos Mendoza', 'Sistemas Operativos', 'Gestión y Planificación de Procesos', getToday(10), getToday(), 'PENDIENTE', 'PANEL', '⚠️ La unidad "Gestión y Planificación de Procesos" del módulo Sistemas Operativos finaliza en menos de 3 días.', JSON.stringify({ codUnidad: 'UD-SO-02', codModule: 'MOD-001' }));
  insertNot.run('NOT-003', 'FINALIZACION_UNIDAD', 'DOC-002', 'MSc. Elena Rostova', 'Excel Avanzado: Fórmulas y Macros', 'Fórmulas Avanzadas y Funciones Anidadas', getToday(-5), getToday(-5), 'ENVIADA', 'WHATSAPP', 'Elena Rostova ha finalizado la unidad "Fórmulas Avanzadas y Funciones Anidadas" del módulo Excel Avanzado.', null);
  insertNot.run('NOT-004', 'ALERTA_PREVIA', 'DOC-002', 'MSc. Elena Rostova', 'Excel Avanzado: Fórmulas y Macros', 'Tablas Dinámicas y Gráficos', getToday(5), getToday(), 'PENDIENTE', 'PANEL', '⚠️ La unidad "Tablas Dinámicas y Gráficos" del módulo Excel Avanzado finaliza en menos de 3 días.', JSON.stringify({ codUnidad: 'UD-EX-02', codModule: 'MOD-003' }));
  insertNot.run('NOT-005', 'ALERTA_PREVIA', 'DOC-003', 'Lic. Roberto Quirós', 'Desarrollo Frontend con React', 'Introducción a React y Componentes', getToday(3), getToday(), 'PENDIENTE', 'PANEL', '⚠️ La unidad "Introducción a React y Componentes" del módulo Desarrollo Frontend finaliza en menos de 3 días.', JSON.stringify({ codUnidad: 'UD-DW-02', codModule: 'MOD-004' }));

  return true;
}

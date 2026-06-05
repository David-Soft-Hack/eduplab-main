CREATE TABLE IF NOT EXISTS docentes (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  email TEXT NOT NULL,
  telefono TEXT,
  carrera TEXT,
  especialidad TEXT,
  estado TEXT DEFAULT 'Activo',
  fechaRegistro TEXT
);

CREATE TABLE IF NOT EXISTS programas (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  tipo TEXT NOT NULL,
  duracion TEXT,
  estado TEXT DEFAULT 'Activo'
);

CREATE TABLE IF NOT EXISTS modulos (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  codPrograma TEXT,
  totalHoraAcademic INTEGER,
  totalHoraReloj INTEGER,
  carrera TEXT,
  fechaCreacion TEXT,
  planningFileName TEXT,
  estado TEXT DEFAULT 'Activo'
);

CREATE TABLE IF NOT EXISTS modulos_units (
  id TEXT PRIMARY KEY,
  codModule TEXT NOT NULL,
  nombre TEXT NOT NULL,
  totalHoraAcademic INTEGER,
  totalHoraReloj INTEGER,
  ponderacion REAL
);

CREATE TABLE IF NOT EXISTS modulos_activities (
  id TEXT PRIMARY KEY,
  codModule TEXT NOT NULL,
  unitId TEXT,
  descripcion TEXT,
  ha INTEGER
);

CREATE TABLE IF NOT EXISTS memorandums (
  id TEXT PRIMARY KEY,
  docenteId TEXT NOT NULL,
  docenteNombre TEXT,
  tipo TEXT,
  programa TEXT,
  fechaEmision TEXT,
  fechaInicio TEXT,
  fechaFin TEXT,
  estado TEXT DEFAULT 'ACTIVO'
);

CREATE TABLE IF NOT EXISTS unidades (
  id TEXT PRIMARY KEY,
  codModule TEXT NOT NULL,
  memorandumId TEXT NOT NULL,
  nombre TEXT NOT NULL,
  fechaInicio TEXT,
  fechaFin TEXT,
  horasAsignadas INTEGER,
  estado TEXT DEFAULT 'PENDIENTE',
  ponderacion REAL
);

CREATE TABLE IF NOT EXISTS dosificaciones (
  id TEXT PRIMARY KEY,
  memorandumId TEXT,
  docenteId TEXT,
  docenteNombre TEXT,
  moduloId TEXT,
  moduloNombre TEXT,
  fechaCreacion TEXT,
  turno TEXT,
  configFrecuencia TEXT
);

CREATE TABLE IF NOT EXISTS notificaciones (
  id TEXT PRIMARY KEY,
  tipo TEXT NOT NULL,
  docenteId TEXT,
  docenteNombre TEXT,
  moduloNombre TEXT,
  unidadNombre TEXT,
  fechaEvento TEXT,
  fechaNotificacion TEXT,
  estado TEXT DEFAULT 'PENDIENTE',
  canal TEXT DEFAULT 'PANEL',
  mensaje TEXT,
  metadata TEXT
);

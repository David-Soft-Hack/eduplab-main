export enum TipoCarrera {
  TECNICA = "Técnica",
  CURSO = "Curso",
}

export enum EstadoUnidad {
  PENDIENTE = "PENDIENTE",
  EN_PROGRESO = "EN_PROGRESO",
  FINALIZADA = "FINALIZADA",
}

export enum TipoNotificacion {
  FINALIZACION_UNIDAD = "FINALIZACION_UNIDAD",
  FINALIZACION_MODULO = "FINALIZACION_MODULO",
  ALERTA_PREVIA = "ALERTA_PREVIA",
  RECORDATORIO = "RECORDATORIO",
}

export enum EstadoNotificacion {
  PENDIENTE = "PENDIENTE",
  ENVIADA = "ENVIADA",
  LEIDA = "LEIDA",
  ARCHIVADA = "ARCHIVADA",
}

export interface Module {
  codModule: string;
  nombre: string;
  totalHoraAcademic: number;
  totalHoraReloj: number;
  cantidadUnidades?: number;
  carrera: string;
  fechaCreacion: string;
  units?: {
    codUnit: string;
    nombre: string;
    totalHoraAcademic: number;
    totalHoraReloj: number;
    ponderacion: number;
    planningFileName?: string;
  }[];
}

export interface Unit {
  codUnit: string;
  nombre: string;
  totalHoraAcademic: number;
  totalHoraReloj: number;
  ponderacion: number;
  idModule: string;
}

export interface Activity {
  codActivity: string;
  descripcion: string;
  totalHoraAcademic: number;
  totalHoraReloj: number;
  idUnit: string;
}

export interface UnidadDidactica {
  id: string;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  horasAsignadas: number;
  estado: EstadoUnidad;
  codModule: string;
  ponderacion?: number;
}

export interface ModuloMemorandum {
  codModule: string;
  nombre: string;
  horasTotales: number;
  unidades: UnidadDidactica[];
}

export interface Memorandum {
  id: string;
  docenteId: string;
  docenteNombre: string;
  tipo: TipoCarrera;
  programa: string;
  fechaEmision: string;
  fechaInicio: string;
  fechaFin: string;
  modulos: ModuloMemorandum[];
  estado: 'ACTIVO' | 'FINALIZADO';
}

export enum Turno {
  MATUTINO = "Matutino",
  VESPERTINO = "Vespertino",
  NOCTURNO = "Nocturno",
}

export interface ConfiguracionFrecuencia {
  diasClase: string[];
  horasSesion: number;
  usarHorasReloj: boolean;
  turno: Turno;
  fechasFeriadas: string[];
}

export interface EntradaCalendario {
  fecha: string;
  codUnidad: string;
  nombreUnidad: string;
  horas: number;
  esContinuacion: boolean;
}

export interface Dosificacion {
  id: string;
  memorandumId: string;
  docenteId: string;
  docenteNombre: string;
  moduloId: string;
  moduloNombre: string;
  unidades: UnidadDidactica[];
  fechaCreacion: string;
  turno?: Turno;
  configFrecuencia?: ConfiguracionFrecuencia;
  calendario?: EntradaCalendario[];
}

export interface Notificacion {
  id: string;
  tipo: TipoNotificacion;
  docenteId: string;
  docenteNombre: string;
  moduloNombre: string;
  unidadNombre?: string;
  fechaEvento: string;
  fechaNotificacion: string;
  fechaLeida?: string;
  estado: EstadoNotificacion;
  canal: 'CALENDARIO' | 'PANEL' | 'WHATSAPP';
  mensaje: string;
  metadata?: {
    bitacoraId?: string;
    codUnidad?: string;
    codModule?: string;
  };
}

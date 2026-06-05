import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, Plus, X, Check, ArrowRight, ArrowLeft,
  Clock, Trash2, AlertTriangle, Search, Eye, BookOpen,
  ExternalLink, CheckCircle2, AlertCircle, Circle
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAppContext } from '../context/AppContext';
import { TipoCarrera, EstadoUnidad, Memorandum, ModuloMemorandum, UnidadDidactica } from '../types';
import { useNavigate } from 'react-router-dom';

interface ProgramOption {
  id: string;
  tipo: 'Técnico' | 'Curso';
  nombre: string;
}

const FormMemorandum: React.FC = () => {
  const { memorandums, setMemorandums, teachers } = useAppContext();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'LIST' | 'FORM'>('LIST');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'TODOS' | 'ACTIVO' | 'FINALIZADO'>('TODOS');
  const [selectedMemDetail, setSelectedMemDetail] = useState<Memorandum | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedMemDetail(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const [step, setStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);

  const [form, setForm] = useState({
    docenteId: '',
    tipo: TipoCarrera.TECNICA,
    programa: '',
    programaId: '',
    fechaInicio: new Date().toISOString().split('T')[0],
    fechaFin: '',
  });

  const programs = useMemo<ProgramOption[]>(() => {
    try {
      const saved = localStorage.getItem('eduplan_academic_programs');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  }, []);

  const filteredPrograms = useMemo(() =>
    programs.filter(p => {
      if (form.tipo === TipoCarrera.TECNICA) return p.tipo === 'Técnico';
      return p.tipo === 'Curso';
    }),
    [programs, form.tipo]
  );

  const handleSelectProgram = (id: string) => {
    const prog = programs.find(p => p.id === id);
    if (prog) {
      setForm(prev => ({
        ...prev,
        programaId: id,
        programa: prog.nombre,
        tipo: prog.tipo === 'Técnico' ? TipoCarrera.TECNICA : TipoCarrera.CURSO,
      }));
    }
  };

  const [modulos, setModulos] = useState<ModuloMemorandum[]>([]);
  const [currentModulo, setCurrentModulo] = useState({ codModule: '', nombre: '', horasTotales: 0 });
  const [currentUnidad, setCurrentUnidad] = useState({ nombre: '', fechaInicio: '', fechaFin: '', horasAsignadas: 0 });
  const [editingModIdx, setEditingModIdx] = useState<number | null>(null);
  const [editingUnidadIdx, setEditingUnidadIdx] = useState<number | null>(null);

  const selectedTeacher = teachers.find((t: any) => t.id === form.docenteId);

  const resetForm = () => {
    setForm({ docenteId: '', tipo: TipoCarrera.TECNICA, programa: '', programaId: '', fechaInicio: new Date().toISOString().split('T')[0], fechaFin: '' });
    setModulos([]);
    setStep(1);
  };

  const handleAddModulo = () => {
    if (!currentModulo.nombre || !currentModulo.horasTotales) return;
    const newMod: ModuloMemorandum = {
      codModule: currentModulo.codModule || `MOD-${Date.now()}`,
      nombre: currentModulo.nombre,
      horasTotales: currentModulo.horasTotales,
      unidades: [],
    };
    if (editingModIdx !== null) {
      setModulos(prev => prev.map((m, i) => i === editingModIdx ? { ...newMod, unidades: m.unidades } : m));
      setEditingModIdx(null);
    } else {
      setModulos(prev => [...prev, newMod]);
    }
    setCurrentModulo({ codModule: '', nombre: '', horasTotales: 0 });
  };

  const handleAddUnidad = (modIdx: number) => {
    if (!currentUnidad.nombre || !currentUnidad.horasAsignadas || !currentUnidad.fechaInicio || !currentUnidad.fechaFin) return;
    const newUnidad: UnidadDidactica = {
      id: `UD-${Date.now()}`,
      nombre: currentUnidad.nombre,
      fechaInicio: currentUnidad.fechaInicio,
      fechaFin: currentUnidad.fechaFin,
      horasAsignadas: currentUnidad.horasAsignadas,
      estado: EstadoUnidad.PENDIENTE,
      codModule: modulos[modIdx].codModule,
    };
    setModulos(prev => prev.map((m, i) => i === modIdx ? { ...m, unidades: [...m.unidades, newUnidad] } : m));
    setCurrentUnidad({ nombre: '', fechaInicio: '', fechaFin: '', horasAsignadas: 0 });
  };

  const handleSubmit = () => {
    if (!form.docenteId || !form.programa || !form.fechaFin || modulos.length === 0) return;
    const newMem: Memorandum = {
      id: `MEM-${Date.now()}`,
      docenteId: form.docenteId,
      docenteNombre: selectedTeacher?.nombre || 'Docente',
      tipo: form.tipo,
      programa: form.programa,
      fechaEmision: new Date().toISOString().split('T')[0],
      fechaInicio: form.fechaInicio,
      fechaFin: form.fechaFin,
      modulos,
      estado: 'ACTIVO',
    };
    setMemorandums(prev => [newMem, ...prev]);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      resetForm();
      setViewMode('LIST');
    }, 2000);
  };

  const removeModulo = (idx: number) => setModulos(prev => prev.filter((_, i) => i !== idx));
  const removeUnidad = (modIdx: number, uIdx: number) => setModulos(prev => prev.map((m, i) => i === modIdx ? { ...m, unidades: m.unidades.filter((_, j) => j !== uIdx) } : m));

  const filteredMemorandums = useMemo(() =>
    memorandums.filter(m => {
      if (statusFilter !== 'TODOS' && m.estado !== statusFilter) return false;
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return m.docenteNombre.toLowerCase().includes(term) || m.programa.toLowerCase().includes(term);
      }
      return true;
    }),
    [memorandums, searchTerm, statusFilter]
  );

  if (viewMode === 'LIST') {
    return (
      <>
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface p-4 rounded-2xl border border-outline-variant shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary rounded-xl text-on-primary-container">
              <FileText size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black text-on-surface">Memorándums</h1>
              <p className="text-on-surface-variant text-sm">Asignaciones de carga horaria registradas</p>
            </div>
          </div>
          <button
            onClick={() => { resetForm(); setViewMode('FORM'); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-on-primary rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm"
          >
            <Plus size={14} /> Nuevo Memorándum
          </button>
        </header>

        <div className="flex flex-wrap items-center gap-2 mt-3">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={13} />
            <input
              type="text"
              placeholder="Buscar por docente o programa..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-surface border border-outline-variant rounded-xl text-xs font-semibold outline-teal-500 placeholder-slate-400"
            />
          </div>
          {(['TODOS', 'ACTIVO', 'FINALIZADO'] as const).map(f => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={cn(
                "px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all border",
                statusFilter === f
                  ? "bg-primary border-primary text-on-primary"
                  : "bg-surface border-outline-variant text-on-surface-variant hover:bg-surface-container-low"
              )}
            >
              {f === 'TODOS' ? 'Todos' : f === 'ACTIVO' ? 'Activos' : 'Finalizados'}
            </button>
          ))}
          <span className="text-[10px] text-on-surface-variant font-semibold ml-auto">
            {filteredMemorandums.length} de {memorandums.length} memorándums
          </span>
        </div>

        {filteredMemorandums.length === 0 ? (
          <div className="bg-surface rounded-2xl border border-outline-variant p-8 text-center shadow-sm">
            <FileText size={40} className="text-outline-variant mx-auto mb-4" />
            <h2 className="text-lg font-black text-on-surface-variant">Sin memorándums</h2>
            <p className="text-on-surface-variant text-sm mt-1">
              {searchTerm ? 'No hay resultados para tu búsqueda.' : 'Aún no se ha registrado ningún memorándum.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3 pb-16">
            {filteredMemorandums.map((m, idx) => {
              const totalModulos = m.modulos.length;
              const totalUnidades = m.modulos.reduce((a, mod) => a + mod.unidades.length, 0);
              const totalHoras = m.modulos.reduce((a, mod) => a + mod.horasTotales, 0);
              return (
                <div
                  key={m.id}
                  className="bg-surface rounded-2xl border border-outline-variant p-4 shadow-sm hover:shadow-md transition-all cursor-pointer"
                  onClick={() => setSelectedMemDetail(m)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white text-xs font-black shrink-0 shadow-sm">
                        {m.docenteNombre.split(' ').map(n => n[0]).join('').substring(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-black text-on-surface truncate">{m.docenteNombre}</h3>
                        <p className="text-[10px] text-on-surface-variant font-semibold truncate">
                          {m.programa}
                          <span className="ml-2 px-1.5 py-0.5 bg-surface-container-high rounded text-[8px] font-black uppercase tracking-wider">
                            {m.tipo}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="flex items-center gap-3 text-[9px] font-black text-on-surface-variant">
                        <span className="flex items-center gap-1"><BookOpen size={11} /> {totalModulos} módulos</span>
                        <span className="hidden sm:flex items-center gap-1"><Clock size={11} /> {totalHoras}h</span>
                      </div>
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider",
                        m.estado === 'ACTIVO' ? "bg-primary text-on-primary-container" : "bg-surface-container-highest text-on-surface-variant"
                      )}>
                        {m.estado}
                      </span>
                      <button
                        onClick={e => { e.stopPropagation(); navigate('/dosificacion'); }}
                        title="Ver dosificación"
                        className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-primary-container rounded-lg transition-all"
                      >
                        <Eye size={15} />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-2.5 pt-2.5 border-t border-outline-variant text-[9px] text-on-surface-variant font-semibold">
                    <span>{m.fechaInicio} → {m.fechaFin}</span>
                    <span>{totalUnidades} unidades</span>
                    <span>ID: {m.id}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      <AnimatePresence>
        {selectedMemDetail && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedMemDetail(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-surface rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-surface z-10 flex items-center justify-between p-4 border-b border-outline-variant rounded-t-2xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary rounded-lg text-on-primary-container">
                    <FileText size={18} />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-on-surface">{selectedMemDetail.id}</h2>
                    <p className="text-[10px] text-on-surface-variant font-semibold">Detalle del memorándum</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedMemDetail(null)}
                  className="p-1.5 text-on-surface-variant hover:text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-4 space-y-4">
                <div className="bg-surface-container-low rounded-xl p-4 border border-outline-variant">
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 text-sm">
                    <div>
                      <span className="text-[9px] font-black text-on-surface-variant uppercase block">Docente</span>
                      <span className="font-bold text-on-surface">{selectedMemDetail.docenteNombre}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-black text-on-surface-variant uppercase block">Programa</span>
                      <span className="font-bold text-on-surface">{selectedMemDetail.programa}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-black text-on-surface-variant uppercase block">Tipo</span>
                      <span className="font-bold text-on-surface">{selectedMemDetail.tipo}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-black text-on-surface-variant uppercase block">Estado</span>
                      <span className={cn(
                        "inline-block px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider",
                        selectedMemDetail.estado === 'ACTIVO' ? "bg-primary text-on-primary-container" : "bg-surface-container-highest text-on-surface-variant"
                      )}>
                        {selectedMemDetail.estado}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-[9px] font-black text-on-surface-variant uppercase block">Periodo</span>
                      <span className="font-bold text-on-surface">{selectedMemDetail.fechaInicio} → {selectedMemDetail.fechaFin}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-[9px] font-black text-on-surface-variant uppercase block">Fecha de Emisión</span>
                      <span className="font-bold text-on-surface">{selectedMemDetail.fechaEmision}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-black text-on-surface uppercase tracking-wider mb-3 flex items-center gap-2">
                    <BookOpen size={14} className="text-primary" />
                    Módulos ({selectedMemDetail.modulos.length})
                  </h3>
                  <div className="space-y-3">
                    {selectedMemDetail.modulos.map((mod, modIdx) => {
                      const fin = mod.unidades.filter(u => u.estado === EstadoUnidad.FINALIZADA).length;
                      const prog = mod.unidades.filter(u => u.estado === EstadoUnidad.EN_PROGRESO).length;
                      const pend = mod.unidades.filter(u => u.estado === EstadoUnidad.PENDIENTE).length;
                      const pct = mod.unidades.length > 0 ? Math.round((fin / mod.unidades.length) * 100) : 0;
                      return (
                        <div key={modIdx} className="bg-surface border border-outline-variant rounded-xl p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <span className="text-[9px] font-mono font-bold text-primary">{mod.codModule}</span>
                              <h4 className="font-black text-on-surface text-sm leading-tight">{mod.nombre}</h4>
                              <span className="text-[10px] text-on-surface-variant font-semibold flex items-center gap-1 mt-0.5">
                                <Clock size={10} /> {mod.horasTotales}h totales
                              </span>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-lg font-black text-on-surface">{pct}%</span>
                              <div className="w-20 h-1.5 bg-surface-container-highest rounded-full overflow-hidden mt-0.5">
                                <div className={cn("h-full rounded-full", pct === 100 ? "bg-primary" : "bg-tertiary-container0")} style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          </div>

                          {mod.unidades.length > 0 && (
                            <div className="mt-3 space-y-1.5">
                              {mod.unidades.map((u, uIdx) => (
                                <div key={uIdx} className="flex items-center gap-2 p-2 bg-surface-container-low rounded-lg border border-outline-variant">
                                  {u.estado === EstadoUnidad.FINALIZADA ? (
                                    <CheckCircle2 size={12} className="text-primary shrink-0" />
                                  ) : u.estado === EstadoUnidad.EN_PROGRESO ? (
                                    <AlertCircle size={12} className="text-tertiary shrink-0" />
                                  ) : (
                                    <Circle size={12} className="text-outline-variant shrink-0" />
                                  )}
                                  <span className="text-[10px] font-bold text-on-surface flex-1 truncate">{u.nombre}</span>
                                  <span className="text-[8px] text-on-surface-variant font-mono">{u.horasAsignadas}h</span>
                                  <span className={cn(
                                    "px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-wider",
                                    u.estado === EstadoUnidad.FINALIZADA ? "bg-primary text-on-primary-container" :
                                    u.estado === EstadoUnidad.EN_PROGRESO ? "bg-tertiary-container text-on-tertiary-container" :
                                    "bg-surface-container-high text-on-surface-variant"
                                  )}>
                                    {u.estado === EstadoUnidad.FINALIZADA ? 'Fin' : u.estado === EstadoUnidad.EN_PROGRESO ? 'Prog' : 'Pend'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-primary-container rounded-xl p-4 border border-primary-container flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-[9px] font-black text-on-primary-container uppercase tracking-wider flex items-center gap-1">
                      <BookOpen size={12} /> {selectedMemDetail.modulos.length} módulos
                    </span>
                    <span className="text-[9px] font-black text-on-primary-container uppercase tracking-wider flex items-center gap-1">
                      <FileText size={12} /> {selectedMemDetail.modulos.reduce((a, m) => a + m.unidades.length, 0)} unidades
                    </span>
                    <span className="text-[9px] font-black text-on-primary-container uppercase tracking-wider flex items-center gap-1">
                      <Clock size={12} /> {selectedMemDetail.modulos.reduce((a, m) => a + m.horasTotales, 0)}h totales
                    </span>
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 bg-surface border-t border-outline-variant p-4 flex items-center justify-end gap-3 rounded-b-2xl">
                <button
                  onClick={() => setSelectedMemDetail(null)}
                  className="px-3 py-2 bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => { setSelectedMemDetail(null); navigate('/dosificacion'); }}
                  className="flex items-center gap-2 px-3 py-2 bg-primary hover:bg-primary/90 text-on-primary rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm"
                >
                  <ExternalLink size={12} /> Ir a Dosificación
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
    );
  }

  if (showSuccess) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500 pb-16">
        <div className="bg-surface rounded-2xl border border-outline-variant p-8 text-center shadow-sm">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={32} className="text-primary" />
          </div>
          <h2 className="text-lg font-black text-on-surface">Memorándum Registrado</h2>
          <p className="text-on-surface-variant mt-1">La asignación ha sido formalizada exitosamente.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-16">
      <header className="flex items-center gap-4 bg-surface p-4 rounded-2xl border border-outline-variant shadow-sm">
        <div className="p-3 bg-primary rounded-xl text-on-primary-container">
          <FileText size={24} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <button onClick={() => setViewMode('LIST')} className="p-1 text-on-surface-variant hover:text-primary rounded-lg transition-all">
              <ArrowLeft size={18} />
            </button>
            <h1 className="text-xl font-black text-on-surface">Registrar Memorándum</h1>
          </div>
          <p className="text-on-surface-variant text-sm ml-8">Formaliza la carga horaria de un docente</p>
        </div>
      </header>

      <div className="bg-surface rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
        <div className="p-4 border-b border-outline-variant">
          <div className="flex items-center gap-2 mb-4">
            {[1, 2, 3].map(s => (
              <div key={s} className="flex items-center gap-2">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black border-2 transition-all",
                  step >= s ? "bg-primary border-primary text-on-primary" : "border-outline-variant text-on-surface-variant"
                )}>
                  {s}
                </div>
                <span className={cn("text-[10px] font-black uppercase tracking-wider hidden sm:block", step >= s ? "text-on-primary-container" : "text-on-surface-variant")}>
                  {s === 1 ? 'Docente' : s === 2 ? 'Módulos' : 'Confirmar'}
                </span>
                {s < 3 && <div className={cn("w-6 h-px", step > s ? "bg-primary" : "bg-surface-container-highest")} />}
              </div>
            ))}
          </div>
        </div>

        <div className="p-4">
          {step === 1 && (
            <div className="space-y-5 max-w-xl">
              <div>
                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-wider block mb-1.5">Docente *</label>
                <select
                  value={form.docenteId}
                  onChange={e => setForm(prev => ({ ...prev, docenteId: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-sm font-bold text-on-surface outline-teal-500 focus:bg-surface transition-all"
                >
                  <option value="">Seleccionar docente...</option>
                  {teachers.map((t: any) => (
                    <option key={t.id} value={t.id}>{t.nombre} — {t.carrera}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-wider block mb-1.5">Tipo de Programa *</label>
                <div className="grid grid-cols-2 gap-3">
                  {[TipoCarrera.TECNICA, TipoCarrera.CURSO].map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, tipo: t }))}
                      className={cn(
                        "py-3 rounded-xl font-black text-[10px] uppercase tracking-wider border transition-all",
                        form.tipo === t ? "bg-primary border-primary text-on-primary" : "bg-surface-container-low border-outline-variant text-on-surface-variant"
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-wider block mb-1.5">Programa / Carrera *</label>
                <select
                  value={form.programaId}
                  onChange={e => handleSelectProgram(e.target.value)}
                  className="w-full px-3 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-sm font-bold text-on-surface outline-teal-500 focus:bg-surface transition-all"
                >
                  <option value="">Seleccionar programa...</option>
                  {filteredPrograms.map(p => (
                    <option key={p.id} value={p.id}>{p.nombre}</option>
                  ))}
                </select>
                {filteredPrograms.length === 0 && (
                  <p className="text-[10px] text-tertiary mt-1 flex items-center gap-1">
                    <AlertTriangle size={10} /> No hay programas registrados. Créalos en Programas.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-wider block mb-1.5">Fecha Inicio *</label>
                  <input
                    type="date"
                    value={form.fechaInicio}
                    onChange={e => setForm(prev => ({ ...prev, fechaInicio: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-sm font-bold text-on-surface outline-teal-500 focus:bg-surface transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-wider block mb-1.5">Fecha Fin *</label>
                  <input
                    type="date"
                    value={form.fechaFin}
                    onChange={e => setForm(prev => ({ ...prev, fechaFin: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-sm font-bold text-on-surface outline-teal-500 focus:bg-surface transition-all"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={() => setStep(2)}
                  disabled={!form.docenteId || !form.programaId || !form.fechaFin}
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 disabled:bg-slate-300 text-on-primary rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
                >
                  Continuar <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="grid lg:grid-cols-5 gap-6">
                <div className="lg:col-span-2 space-y-4 bg-surface-container-low p-4 rounded-xl border border-outline-variant">
                  <h3 className="text-xs font-black text-on-surface uppercase tracking-wider">Agregar Módulo</h3>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Código (ej: MOD-101)"
                      value={currentModulo.codModule}
                      onChange={e => setCurrentModulo(prev => ({ ...prev, codModule: e.target.value }))}
                      className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-xl text-xs font-bold outline-teal-500"
                    />
                    <input
                      type="text"
                      placeholder="Nombre del módulo"
                      value={currentModulo.nombre}
                      onChange={e => setCurrentModulo(prev => ({ ...prev, nombre: e.target.value }))}
                      className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-xl text-xs font-bold outline-teal-500"
                    />
                    <input
                      type="number"
                      placeholder="Horas totales"
                      value={currentModulo.horasTotales || ''}
                      onChange={e => setCurrentModulo(prev => ({ ...prev, horasTotales: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-xl text-xs font-bold outline-teal-500"
                    />
                    <button
                      onClick={handleAddModulo}
                      className="w-full py-2 bg-primary hover:bg-primary/90 text-on-primary rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
                    >
                      <Plus size={12} /> {editingModIdx !== null ? 'Actualizar' : 'Agregar'} Módulo
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-3 space-y-3">
                  <h3 className="text-xs font-black text-on-surface uppercase tracking-wider">Módulos ({modulos.length})</h3>
                  {modulos.length === 0 ? (
                    <div className="py-8 text-center text-on-surface-variant text-xs italic">No hay módulos agregados</div>
                  ) : (
                    modulos.map((mod, idx) => (
                      <div key={idx} className="bg-surface border border-outline-variant rounded-xl p-4 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <span className="text-[9px] font-mono font-bold text-primary">{mod.codModule}</span>
                            <h4 className="font-black text-on-surface text-sm leading-tight">{mod.nombre}</h4>
                            <span className="text-[10px] text-on-surface-variant font-semibold flex items-center gap-1 mt-1">
                              <Clock size={10} /> {mod.horasTotales}h totales
                            </span>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <button onClick={() => { setCurrentModulo(mod); setEditingModIdx(idx); }} className="p-1 text-on-surface-variant hover:text-primary">
                              <X size={12} />
                            </button>
                            <button onClick={() => removeModulo(idx)} className="p-1 text-on-surface-variant hover:text-error">
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>

                        <div className="border-t border-outline-variant pt-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-black text-on-surface-variant uppercase tracking-wider">Unidades ({mod.unidades.length})</span>
                            <button
                              onClick={() => setEditingUnidadIdx(idx)}
                              className="text-[9px] font-black text-primary hover:text-on-primary-container flex items-center gap-1"
                            >
                              <Plus size={10} /> Agregar Unidad
                            </button>
                          </div>

                          {editingUnidadIdx === idx && (
                            <div className="bg-surface-container-low rounded-xl p-3 space-y-2 border border-outline-variant">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <input
                                  type="text"
                                  placeholder="Nombre de la unidad"
                                  value={editingModIdx === idx ? currentUnidad.nombre : ''}
                                  onChange={e => { setCurrentUnidad(prev => ({ ...prev, nombre: e.target.value })); setEditingModIdx(idx); }}
                                  className="sm:col-span-2 px-3 py-1.5 bg-surface border border-outline-variant rounded-lg text-xs font-bold outline-teal-500"
                                />
                                <input
                                  type="date"
                                  value={currentUnidad.fechaInicio}
                                  onChange={e => setCurrentUnidad(prev => ({ ...prev, fechaInicio: e.target.value }))}
                                  className="px-3 py-1.5 bg-surface border border-outline-variant rounded-lg text-xs font-bold outline-teal-500"
                                />
                                <input
                                  type="date"
                                  value={currentUnidad.fechaFin}
                                  onChange={e => setCurrentUnidad(prev => ({ ...prev, fechaFin: e.target.value }))}
                                  className="px-3 py-1.5 bg-surface border border-outline-variant rounded-lg text-xs font-bold outline-teal-500"
                                />
                                <input
                                  type="number"
                                  placeholder="Horas"
                                  value={currentUnidad.horasAsignadas || ''}
                                  onChange={e => setCurrentUnidad(prev => ({ ...prev, horasAsignadas: parseInt(e.target.value) || 0 }))}
                                  className="px-3 py-1.5 bg-surface border border-outline-variant rounded-lg text-xs font-bold outline-teal-500"
                                />
                              </div>
                              <button
                                onClick={() => handleAddUnidad(idx)}
                                className="w-full py-1.5 bg-primary text-on-primary rounded-lg text-[9px] font-black uppercase tracking-wider"
                              >
                                <Check size={12} className="inline mr-1" /> Agregar
                              </button>
                            </div>
                          )}

                          {mod.unidades.map((u, uIdx) => (
                            <div key={uIdx} className="flex items-center justify-between gap-2 p-2 bg-surface-container-low rounded-lg border border-outline-variant">
                              <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-bold text-on-surface truncate">{u.nombre}</p>
                                <p className="text-[8px] text-on-surface-variant font-mono">{u.fechaInicio} → {u.fechaFin} • {u.horasAsignadas}h</p>
                              </div>
                              <button onClick={() => removeUnidad(idx, uIdx)} className="p-1 text-on-surface-variant hover:text-error shrink-0">
                                <X size={10} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-outline-variant">
                <button onClick={() => setStep(1)} className="flex items-center gap-2 px-5 py-2.5 bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant rounded-xl font-black text-[10px] uppercase tracking-widest transition-all">
                  <ArrowLeft size={14} /> Atrás
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={modulos.length === 0}
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 disabled:bg-slate-300 text-on-primary rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
                >
                  Revisar <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 max-w-2xl">
              <div className="bg-surface-container-low rounded-xl p-4 space-y-3 border border-outline-variant">
                <h3 className="text-xs font-black text-on-primary-container uppercase tracking-wider">Resumen del Memorándum</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-[9px] font-black text-on-surface-variant block uppercase">Docente</span><span className="font-bold text-on-surface">{selectedTeacher?.nombre}</span></div>
                  <div><span className="text-[9px] font-black text-on-surface-variant block uppercase">Programa</span><span className="font-bold text-on-surface">{form.programa}</span></div>
                  <div><span className="text-[9px] font-black text-on-surface-variant block uppercase">Tipo</span><span className="font-bold text-on-surface">{form.tipo}</span></div>
                  <div><span className="text-[9px] font-black text-on-surface-variant block uppercase">Módulos</span><span className="font-bold text-on-surface">{modulos.length}</span></div>
                  <div><span className="text-[9px] font-black text-on-surface-variant block uppercase">Periodo</span><span className="font-bold text-on-surface">{form.fechaInicio} → {form.fechaFin}</span></div>
                  <div><span className="text-[9px] font-black text-on-surface-variant block uppercase">Total Horas</span><span className="font-bold text-on-surface">{modulos.reduce((a, m) => a + m.horasTotales, 0)}h</span></div>
                </div>
              </div>

              {modulos.map((mod, idx) => (
                <div key={idx} className="bg-surface border border-outline-variant rounded-xl p-4">
                  <h4 className="font-black text-on-surface text-sm">{mod.nombre}</h4>
                  <p className="text-[10px] text-on-surface-variant font-semibold mb-2">{mod.unidades.length} unidades • {mod.horasTotales}h totales</p>
                  <div className="space-y-1.5">
                    {mod.unidades.map((u, uIdx) => (
                      <div key={uIdx} className="flex items-center justify-between p-2 bg-surface-container-low rounded-lg text-[10px]">
                        <span className="font-bold text-on-surface">{u.nombre}</span>
                        <span className="text-on-surface-variant font-mono">{u.fechaInicio} → {u.fechaFin} ({u.horasAsignadas}h)</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className="flex justify-between pt-4 border-t border-outline-variant">
                <button onClick={() => setStep(2)} className="flex items-center gap-2 px-5 py-2.5 bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant rounded-xl font-black text-[10px] uppercase tracking-widest transition-all">
                  <ArrowLeft size={14} /> Atrás
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-on-primary rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg"
                >
                  <Check size={14} /> Confirmar y Registrar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FormMemorandum;

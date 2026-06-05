import React, { useState, useMemo } from 'react';
import { 
  FileText, Plus, X, Check, ArrowRight, ArrowLeft,
  Clock, Trash2, AlertTriangle, Search, Eye, BookOpen
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
      <div className="space-y-6 animate-in fade-in duration-500 pb-16">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-teal-100 rounded-xl text-teal-700">
              <FileText size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-800">Memorándums</h1>
              <p className="text-slate-500 text-sm">Asignaciones de carga horaria registradas</p>
            </div>
          </div>
          <button
            onClick={() => { resetForm(); setViewMode('FORM'); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm"
          >
            <Plus size={14} /> Nuevo Memorándum
          </button>
        </header>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
            <input
              type="text"
              placeholder="Buscar por docente o programa..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold outline-teal-500 placeholder-slate-400"
            />
          </div>
          {(['TODOS', 'ACTIVO', 'FINALIZADO'] as const).map(f => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={cn(
                "px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all border",
                statusFilter === f
                  ? "bg-teal-600 border-teal-600 text-white"
                  : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
              )}
            >
              {f === 'TODOS' ? 'Todos' : f === 'ACTIVO' ? 'Activos' : 'Finalizados'}
            </button>
          ))}
          <span className="text-[10px] text-slate-400 font-semibold ml-auto">
            {filteredMemorandums.length} de {memorandums.length} memorándums
          </span>
        </div>

        {filteredMemorandums.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center shadow-sm">
            <FileText size={40} className="text-slate-300 mx-auto mb-4" />
            <h2 className="text-lg font-black text-slate-600">Sin memorándums</h2>
            <p className="text-slate-400 text-sm mt-1">
              {searchTerm ? 'No hay resultados para tu búsqueda.' : 'Aún no se ha registrado ningún memorándum.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredMemorandums.map((m, idx) => {
              const totalModulos = m.modulos.length;
              const totalUnidades = m.modulos.reduce((a, mod) => a + mod.unidades.length, 0);
              const totalHoras = m.modulos.reduce((a, mod) => a + mod.horasTotales, 0);
              return (
                <div key={m.id} className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 shadow-sm hover:shadow-md transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white text-xs font-black shrink-0 shadow-sm">
                        {m.docenteNombre.split(' ').map(n => n[0]).join('').substring(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-black text-slate-800 truncate">{m.docenteNombre}</h3>
                        <p className="text-[10px] text-slate-500 font-semibold truncate">
                          {m.programa}
                          <span className="ml-2 px-1.5 py-0.5 bg-slate-100 rounded text-[8px] font-black uppercase tracking-wider">
                            {m.tipo}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="flex items-center gap-3 text-[9px] font-black text-slate-500">
                        <span className="flex items-center gap-1"><BookOpen size={11} /> {totalModulos} módulos</span>
                        <span className="hidden sm:flex items-center gap-1"><Clock size={11} /> {totalHoras}h</span>
                      </div>
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider",
                        m.estado === 'ACTIVO' ? "bg-teal-100 text-teal-700" : "bg-slate-200 text-slate-500"
                      )}>
                        {m.estado}
                      </span>
                      <button
                        onClick={() => navigate('/dosificacion')}
                        title="Ver dosificación"
                        className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-all"
                      >
                        <Eye size={15} />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-2.5 pt-2.5 border-t border-slate-100 text-[9px] text-slate-400 font-semibold">
                    <span>{m.fechaInicio} → {m.fechaFin}</span>
                    <span>{totalUnidades} unidades</span>
                    <span>ID: {m.id}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500 pb-16">
        <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center shadow-sm">
          <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={32} className="text-teal-600" />
          </div>
          <h2 className="text-lg font-black text-slate-800">Memorándum Registrado</h2>
          <p className="text-slate-500 mt-1">La asignación ha sido formalizada exitosamente.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-16">
      <header className="flex items-center gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div className="p-3 bg-teal-100 rounded-xl text-teal-700">
          <FileText size={24} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <button onClick={() => setViewMode('LIST')} className="p-1 text-slate-400 hover:text-teal-600 rounded-lg transition-all">
              <ArrowLeft size={18} />
            </button>
            <h1 className="text-xl font-black text-slate-800">Registrar Memorándum</h1>
          </div>
          <p className="text-slate-500 text-sm ml-8">Formaliza la carga horaria de un docente</p>
        </div>
      </header>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-2 mb-4">
            {[1, 2, 3].map(s => (
              <div key={s} className="flex items-center gap-2">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black border-2 transition-all",
                  step >= s ? "bg-teal-600 border-teal-600 text-white" : "border-slate-300 text-slate-400"
                )}>
                  {s}
                </div>
                <span className={cn("text-[10px] font-black uppercase tracking-wider hidden sm:block", step >= s ? "text-teal-700" : "text-slate-400")}>
                  {s === 1 ? 'Docente' : s === 2 ? 'Módulos' : 'Confirmar'}
                </span>
                {s < 3 && <div className={cn("w-6 h-px", step > s ? "bg-teal-600" : "bg-slate-200")} />}
              </div>
            ))}
          </div>
        </div>

        <div className="p-6">
          {step === 1 && (
            <div className="space-y-5 max-w-xl">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">Docente *</label>
                <select
                  value={form.docenteId}
                  onChange={e => setForm(prev => ({ ...prev, docenteId: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-teal-500 focus:bg-white transition-all"
                >
                  <option value="">Seleccionar docente...</option>
                  {teachers.map((t: any) => (
                    <option key={t.id} value={t.id}>{t.nombre} — {t.carrera}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">Tipo de Programa *</label>
                <div className="grid grid-cols-2 gap-3">
                  {[TipoCarrera.TECNICA, TipoCarrera.CURSO].map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, tipo: t }))}
                      className={cn(
                        "py-3 rounded-xl font-black text-[10px] uppercase tracking-wider border transition-all",
                        form.tipo === t ? "bg-teal-600 border-teal-600 text-white" : "bg-slate-50 border-slate-200 text-slate-500"
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">Programa / Carrera *</label>
                <select
                  value={form.programaId}
                  onChange={e => handleSelectProgram(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-teal-500 focus:bg-white transition-all"
                >
                  <option value="">Seleccionar programa...</option>
                  {filteredPrograms.map(p => (
                    <option key={p.id} value={p.id}>{p.nombre}</option>
                  ))}
                </select>
                {filteredPrograms.length === 0 && (
                  <p className="text-[10px] text-amber-600 mt-1 flex items-center gap-1">
                    <AlertTriangle size={10} /> No hay programas registrados. Créalos en Programas.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">Fecha Inicio *</label>
                  <input
                    type="date"
                    value={form.fechaInicio}
                    onChange={e => setForm(prev => ({ ...prev, fechaInicio: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-teal-500 focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">Fecha Fin *</label>
                  <input
                    type="date"
                    value={form.fechaFin}
                    onChange={e => setForm(prev => ({ ...prev, fechaFin: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-teal-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={() => setStep(2)}
                  disabled={!form.docenteId || !form.programaId || !form.fechaFin}
                  className="flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
                >
                  Continuar <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="grid lg:grid-cols-5 gap-6">
                <div className="lg:col-span-2 space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-100">
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Agregar Módulo</h3>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Código (ej: MOD-101)"
                      value={currentModulo.codModule}
                      onChange={e => setCurrentModulo(prev => ({ ...prev, codModule: e.target.value }))}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-teal-500"
                    />
                    <input
                      type="text"
                      placeholder="Nombre del módulo"
                      value={currentModulo.nombre}
                      onChange={e => setCurrentModulo(prev => ({ ...prev, nombre: e.target.value }))}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-teal-500"
                    />
                    <input
                      type="number"
                      placeholder="Horas totales"
                      value={currentModulo.horasTotales || ''}
                      onChange={e => setCurrentModulo(prev => ({ ...prev, horasTotales: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-teal-500"
                    />
                    <button
                      onClick={handleAddModulo}
                      className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
                    >
                      <Plus size={12} /> {editingModIdx !== null ? 'Actualizar' : 'Agregar'} Módulo
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-3 space-y-3">
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Módulos ({modulos.length})</h3>
                  {modulos.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-xs italic">No hay módulos agregados</div>
                  ) : (
                    modulos.map((mod, idx) => (
                      <div key={idx} className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <span className="text-[9px] font-mono font-bold text-teal-600">{mod.codModule}</span>
                            <h4 className="font-black text-slate-800 text-sm leading-tight">{mod.nombre}</h4>
                            <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1 mt-1">
                              <Clock size={10} /> {mod.horasTotales}h totales
                            </span>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <button onClick={() => { setCurrentModulo(mod); setEditingModIdx(idx); }} className="p-1 text-slate-400 hover:text-teal-600">
                              <X size={12} />
                            </button>
                            <button onClick={() => removeModulo(idx)} className="p-1 text-slate-400 hover:text-red-500">
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>

                        <div className="border-t border-slate-100 pt-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Unidades ({mod.unidades.length})</span>
                            <button
                              onClick={() => setEditingUnidadIdx(idx)}
                              className="text-[9px] font-black text-teal-600 hover:text-teal-700 flex items-center gap-1"
                            >
                              <Plus size={10} /> Agregar Unidad
                            </button>
                          </div>

                          {editingUnidadIdx === idx && (
                            <div className="bg-slate-50 rounded-xl p-3 space-y-2 border border-slate-200">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <input
                                  type="text"
                                  placeholder="Nombre de la unidad"
                                  value={editingModIdx === idx ? currentUnidad.nombre : ''}
                                  onChange={e => { setCurrentUnidad(prev => ({ ...prev, nombre: e.target.value })); setEditingModIdx(idx); }}
                                  className="sm:col-span-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold outline-teal-500"
                                />
                                <input
                                  type="date"
                                  value={currentUnidad.fechaInicio}
                                  onChange={e => setCurrentUnidad(prev => ({ ...prev, fechaInicio: e.target.value }))}
                                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold outline-teal-500"
                                />
                                <input
                                  type="date"
                                  value={currentUnidad.fechaFin}
                                  onChange={e => setCurrentUnidad(prev => ({ ...prev, fechaFin: e.target.value }))}
                                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold outline-teal-500"
                                />
                                <input
                                  type="number"
                                  placeholder="Horas"
                                  value={currentUnidad.horasAsignadas || ''}
                                  onChange={e => setCurrentUnidad(prev => ({ ...prev, horasAsignadas: parseInt(e.target.value) || 0 }))}
                                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold outline-teal-500"
                                />
                              </div>
                              <button
                                onClick={() => handleAddUnidad(idx)}
                                className="w-full py-1.5 bg-teal-600 text-white rounded-lg text-[9px] font-black uppercase tracking-wider"
                              >
                                <Check size={12} className="inline mr-1" /> Agregar
                              </button>
                            </div>
                          )}

                          {mod.unidades.map((u, uIdx) => (
                            <div key={uIdx} className="flex items-center justify-between gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100">
                              <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-bold text-slate-800 truncate">{u.nombre}</p>
                                <p className="text-[8px] text-slate-500 font-mono">{u.fechaInicio} → {u.fechaFin} • {u.horasAsignadas}h</p>
                              </div>
                              <button onClick={() => removeUnidad(idx, uIdx)} className="p-1 text-slate-400 hover:text-red-500 shrink-0">
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

              <div className="flex justify-between pt-4 border-t border-slate-100">
                <button onClick={() => setStep(1)} className="flex items-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all">
                  <ArrowLeft size={14} /> Atrás
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={modulos.length === 0}
                  className="flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
                >
                  Revisar <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 max-w-2xl">
              <div className="bg-slate-50 rounded-xl p-5 space-y-3 border border-slate-200">
                <h3 className="text-xs font-black text-teal-700 uppercase tracking-wider">Resumen del Memorándum</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-[9px] font-black text-slate-400 block uppercase">Docente</span><span className="font-bold text-slate-800">{selectedTeacher?.nombre}</span></div>
                  <div><span className="text-[9px] font-black text-slate-400 block uppercase">Programa</span><span className="font-bold text-slate-800">{form.programa}</span></div>
                  <div><span className="text-[9px] font-black text-slate-400 block uppercase">Tipo</span><span className="font-bold text-slate-800">{form.tipo}</span></div>
                  <div><span className="text-[9px] font-black text-slate-400 block uppercase">Módulos</span><span className="font-bold text-slate-800">{modulos.length}</span></div>
                  <div><span className="text-[9px] font-black text-slate-400 block uppercase">Periodo</span><span className="font-bold text-slate-800">{form.fechaInicio} → {form.fechaFin}</span></div>
                  <div><span className="text-[9px] font-black text-slate-400 block uppercase">Total Horas</span><span className="font-bold text-slate-800">{modulos.reduce((a, m) => a + m.horasTotales, 0)}h</span></div>
                </div>
              </div>

              {modulos.map((mod, idx) => (
                <div key={idx} className="bg-white border border-slate-200 rounded-xl p-4">
                  <h4 className="font-black text-slate-800 text-sm">{mod.nombre}</h4>
                  <p className="text-[10px] text-slate-500 font-semibold mb-2">{mod.unidades.length} unidades • {mod.horasTotales}h totales</p>
                  <div className="space-y-1.5">
                    {mod.unidades.map((u, uIdx) => (
                      <div key={uIdx} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg text-[10px]">
                        <span className="font-bold text-slate-700">{u.nombre}</span>
                        <span className="text-slate-500 font-mono">{u.fechaInicio} → {u.fechaFin} ({u.horasAsignadas}h)</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className="flex justify-between pt-4 border-t border-slate-100">
                <button onClick={() => setStep(2)} className="flex items-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all">
                  <ArrowLeft size={14} /> Atrás
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg"
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

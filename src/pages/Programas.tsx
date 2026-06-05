import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Plus, 
  Trash2, 
  Edit3, 
  Award, 
  Tag, 
  Calendar, 
  X, 
  Check, 
  BookOpen, 
  Bookmark,
  GraduationCap,
  RotateCcw,
  Users,
  AlertCircle,
  HelpCircle,
  Hash,
  Sparkles
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAppContext } from '../context/AppContext';

interface AcademicProgram {
  id: string;
  tipo: 'Técnico' | 'Curso';
  codigoCarrera?: string; // If 'Técnico' ex: TEC-ADS-2026
  codigoCurso?: string;   // If 'Curso' ex: CUR-DB1-203
  nombre: string;
  duracion?: string;       // ex: "4 Semestres", "80 horas"
  descripcion?: string;
  fechaRegistro: string;
}

const DEFAULT_PROGRAMS: AcademicProgram[] = [
  {
    id: 'prog-1',
    tipo: 'Técnico',
    codigoCarrera: 'TEC-ADS-2026',
    nombre: 'Análisis de Sistemas',
    duracion: '4 Semestres',
    descripcion: 'Análisis sistemático, ingeniería de software, bases de datos y desarrollo de lógica estructurada.',
    fechaRegistro: '2026-01-15'
  },
  {
    id: 'prog-2',
    tipo: 'Técnico',
    codigoCarrera: 'TEC-TEL-998',
    nombre: 'Ingeniería de Sistemas',
    duracion: '5 Semestres',
    descripcion: 'Arquitectura de servidores, desarrollo fullstack, computación científica e integración de sistemas.',
    fechaRegistro: '2026-02-10'
  },
  {
    id: 'prog-3',
    tipo: 'Curso',
    codigoCurso: 'CUR-DB1-203',
    nombre: 'Bases de Datos Avanzadas',
    duracion: '60 horas',
    descripcion: 'Diseño e integridad de bases de datos relacionales, lenguaje SQL y transacciones concurrentes.',
    fechaRegistro: '2026-05-18'
  },
  {
    id: 'prog-4',
    tipo: 'Curso',
    codigoCurso: 'CUR-UXUI-05',
    nombre: 'Diseño UX/UI Avanzado',
    duracion: '40 horas',
    descripcion: 'Metodologías ágiles de diseño de interfaces centradas en el usuario final y análisis heurístico.',
    fechaRegistro: '2026-05-20'
  }
];

interface ToastAlert {
  id: string;
  message: string;
  type: 'success' | 'info' | 'danger';
}

const Programas: React.FC = () => {
  const { modules, setModules, teachers } = useAppContext();
  
  const [programs, setPrograms] = useState<AcademicProgram[]>(() => {
    const saved = localStorage.getItem('eduplan_academic_programs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_PROGRAMS;
      }
    }
    return DEFAULT_PROGRAMS;
  });

  // State managers
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTipo, setFilterTipo] = useState<'All' | 'Técnico' | 'Curso'>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<AcademicProgram | null>(null);
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastAlert[]>([]);

  // Linking helper state
  const [isLinkingModalOpen, setIsLinkingModalOpen] = useState(false);
  const [programToDelete, setProgramToDelete] = useState<AcademicProgram | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  // Form Fields
  const [tipo, setTipo] = useState<'Técnico' | 'Curso'>('Técnico');
  const [codigoCarrera, setCodigoCarrera] = useState('');
  const [codigoCurso, setCodigoCurso] = useState('');
  const [nombre, setNombre] = useState('');
  const [duracion, setDuracion] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [formError, setFormError] = useState('');

  // Persist to local storage
  useEffect(() => {
    localStorage.setItem('eduplan_academic_programs', JSON.stringify(programs));
  }, [programs]);

  // Toast helper
  const triggerToast = (message: string, type: 'success' | 'info' | 'danger' = 'success') => {
    const newToast = { id: String(Date.now()), message, type };
    setToasts(prev => [...prev, newToast]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== newToast.id));
    }, 3500);
  };

  // Open modal for Create
  const handleOpenAdd = () => {
    setEditingProgram(null);
    setTipo('Técnico');
    setCodigoCarrera('');
    setCodigoCurso('');
    setNombre('');
    setDuracion('');
    setDescripcion('');
    setFormError('');
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (prog: AcademicProgram) => {
    setEditingProgram(prog);
    setTipo(prog.tipo);
    setCodigoCarrera(prog.codigoCarrera || '');
    setCodigoCurso(prog.codigoCurso || '');
    setNombre(prog.nombre);
    setDuracion(prog.duracion || '');
    setDescripcion(prog.descripcion || '');
    setFormError('');
    setIsModalOpen(true);
  };

  // Delete program
  const handleDelete = (prog: AcademicProgram, e: React.MouseEvent) => {
    e.stopPropagation();
    setProgramToDelete(prog);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (programToDelete) {
      setPrograms(prev => prev.filter(p => p.id !== programToDelete.id));
      if (selectedProgramId === programToDelete.id) {
        setSelectedProgramId(null);
      }
      triggerToast(`Programa "${programToDelete.nombre}" eliminado exitosamente`, 'danger');
      setProgramToDelete(null);
      setIsDeleteModalOpen(false);
    }
  };

  // Seed default dataset
  const handleResetDefaults = () => {
    setIsResetModalOpen(true);
  };

  const confirmResetDefaults = () => {
    setPrograms(DEFAULT_PROGRAMS);
    setSelectedProgramId(null);
    triggerToast('Programas académicos restablecidos por defecto', 'info');
    setIsResetModalOpen(false);
  };

  // Submit form (Create / Update)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombre.trim()) {
      setFormError('El nombre del programa es obligatorio.');
      return;
    }

    if (tipo === 'Técnico' && !codigoCarrera.trim()) {
      setFormError('El código de la carrera es obligatorio para Técnicos.');
      return;
    }

    if (tipo === 'Curso' && !codigoCurso.trim()) {
      setFormError('El código del curso es obligatorio para Cursos.');
      return;
    }

    setFormError('');

    const programData: AcademicProgram = {
      id: editingProgram ? editingProgram.id : `prog-${Date.now()}`,
      tipo,
      nombre: nombre.trim(),
      duracion: duracion.trim() || undefined,
      descripcion: descripcion.trim() || undefined,
      fechaRegistro: editingProgram ? editingProgram.fechaRegistro : new Date().toISOString().split('T')[0],
      ...(tipo === 'Técnico' ? { codigoCarrera: codigoCarrera.trim() } : { codigoCurso: codigoCurso.trim() })
    };

    if (editingProgram) {
      setPrograms(prev => prev.map(p => p.id === editingProgram.id ? programData : p));
      triggerToast(`Programa "${programData.nombre}" modificado correctamente`, 'success');
    } else {
      setPrograms(prev => [programData, ...prev]);
      triggerToast(`Programa "${programData.nombre}" registrado con éxito`, 'success');
    }

    setIsModalOpen(false);
  };

  // Association Manager (Quickly assign global modules to this career/program)
  const toggleLinkModule = (modCode: string, isCurrentlyLinked: boolean, programName: string) => {
    setModules(prev => prev.map(m => {
      if (m.codModule === modCode) {
        return {
          ...m,
          carrera: isCurrentlyLinked ? 'Baja / No asignado' : programName
        };
      }
      return m;
    }));
    triggerToast(
      isCurrentlyLinked 
        ? `Módulo desvinculado de ${programName}` 
        : `Módulo asignado con éxito a ${programName}`, 
      isCurrentlyLinked ? 'info' : 'success'
    );
  };

  // Filters & Search logic
  const filteredPrograms = programs.filter(p => {
    const matchesSearch = p.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (p.codigoCarrera && p.codigoCarrera.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (p.codigoCurso && p.codigoCurso.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (p.descripcion && p.descripcion.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (filterTipo === 'All') return matchesSearch;
    return p.tipo === filterTipo && matchesSearch;
  });

  // Selected Program Details
  const activeProgram = programs.find(p => p.id === selectedProgramId);
  
  // Calculate stats dynamically based on current lists
  const totalPrograms = programs.length;
  const totalTecnicos = programs.filter(p => p.tipo === 'Técnico').length;
  const totalCursos = programs.filter(p => p.tipo === 'Curso').length;
  
  // Get linked metrics based on state matches
  const totalTeachersLinked = activeProgram 
    ? teachers.filter(t => t.carrera.toLowerCase() === activeProgram.nombre.toLowerCase()).length
    : teachers.length;

  const activeModulesForSelected = activeProgram 
    ? modules.filter(m => m.carrera.toLowerCase() === activeProgram.nombre.toLowerCase())
    : [];

  // Helper component to render inspector content logically
  const renderInspectorContent = (prog: AcademicProgram) => {
    const activeMods = modules.filter(m => m.carrera.toLowerCase() === prog.nombre.toLowerCase());
    const linkedTeachers = teachers.filter(t => t.carrera.toLowerCase() === prog.nombre.toLowerCase());

    return (
      <div className="space-y-5">
        {/* Identifier and Duration Row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant">
            <span className="text-[9px] font-bold text-on-surface-variant block uppercase tracking-wider mb-0.5">Identificador</span>
            <span className="font-black text-on-surface text-xs uppercase tracking-tight block truncate">
              {prog.tipo === 'Técnico' ? prog.codigoCarrera : prog.codigoCurso}
            </span>
          </div>
          <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant">
            <span className="text-[9px] font-bold text-on-surface-variant block uppercase tracking-wider mb-0.5">Duración</span>
            <span className="font-black text-indigo-600 text-xs block truncate">
              {prog.duracion || 'Sin definir'}
            </span>
          </div>
        </div>

        {/* Profile Objective Description */}
        {prog.descripcion && (
          <div className="p-3.5 bg-surface-container-low rounded-xl border border-outline-variant space-y-1">
            <span className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest block">Objetivo de la Carrera</span>
            <p className="text-xs text-on-surface-variant leading-relaxed font-semibold">{prog.descripcion}</p>
          </div>
        )}

        {/* Association section: Módulos Integrados */}
        <div className="space-y-2.5 pt-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <BookOpen size={12} className="text-academic-600 shrink-0" />
              <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">
                Módulos de Malla ({activeMods.length})
              </span>
            </div>
            <button 
              onClick={() => setIsLinkingModalOpen(true)}
              className="text-[10px] font-black text-academic-600 hover:text-academic-700 hover:underline flex items-center gap-0.5 transition-colors"
            >
              Administrar
            </button>
          </div>

          <div className="space-y-1.5 max-h-[140px] overflow-y-auto custom-scrollbar pr-0.5">
            {activeMods.length > 0 ? (
              activeMods.map(mod => (
                <div key={mod.codModule} className="p-2.5 bg-surface-container-low rounded-xl border border-outline-variant flex items-center justify-between gap-2 group">
                  <div className="truncate">
                    <p className="font-extrabold text-on-surface text-[11px] leading-tight truncate">{mod.nombre}</p>
                    <p className="text-[9px] text-on-surface-variant font-mono mt-0.5">{mod.codModule} • {mod.totalHoraAcademic} hrs</p>
                  </div>
                  <button
                    onClick={() => toggleLinkModule(mod.codModule, true, prog.nombre)}
                    className="text-[9px] font-extrabold text-rose-650 hover:text-rose-650 uppercase tracking-tight opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity shrink-0 bg-error-container px-2 py-1 rounded border border-error-container/40"
                  >
                    Excluir
                  </button>
                </div>
              ))
            ) : (
              <p className="text-[11px] text-slate-450 italic py-1">
                Ningún módulo de la academia está asignado actualmente a este plan curricular.
              </p>
            )}
          </div>
        </div>

        {/* Association 2: Linked Registered Teachers */}
        <div className="space-y-2.5 pt-2 border-t border-outline-variant">
          <div className="flex items-center gap-1.5">
            <Users size={12} className="text-tertiary shrink-0" />
            <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">
              Docentes Asignados ({linkedTeachers.length})
            </span>
          </div>
          <div className="space-y-1.5 max-h-[140px] overflow-y-auto custom-scrollbar pr-0.5">
            {linkedTeachers.length > 0 ? (
              linkedTeachers.map(teacher => (
                <div key={teacher.id} className="p-2 bg-surface-container-low rounded-xl border border-outline-variant flex items-center justify-between gap-2">
                  <div className="truncate flex-1 min-w-0">
                    <p className="font-bold text-on-surface text-[11px] leading-tight truncate">{teacher.nombre}</p>
                    <p className="text-[9px] text-on-surface-variant mt-0.5 truncate">{teacher.especialidad} • +{teacher.telefono}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <a
                      href={`https://api.whatsapp.com/send?phone=${teacher.telefono}&text=${encodeURIComponent(
                        `Hola ${teacher.nombre}, te saludamos de la Coordinación del Área Metodológica. Deseamos consultar sobre el avance y registro de tu bitácora escolar para el programa: ${prog.nombre}.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-1 bg-emerald-600 hover:bg-emerald-750 text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-colors inline-block text-center shadow-sm"
                    >
                      WhatsApp
                    </a>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-[11px] text-slate-450 italic py-1">
                No hay docentes asignados en este programa educativo.
              </p>
            )}
          </div>
        </div>

        {/* Program Extra Actions inside Inspector */}
        <div className="flex gap-2.5 pt-3 border-t border-outline-variant shrink-0">
          <button
            type="button"
            onClick={() => handleOpenEdit(prog)}
            className="flex-1 py-2.5 bg-surface-container-low hover:bg-surface-container-high border border-slate-150 text-on-surface-variant hover:text-on-surface rounded-xl font-black text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Edit3 size={12} />
            Editar
          </button>
          <button
            type="button"
            onClick={(e) => handleDelete(prog, e)}
            className="flex-1 py-2.5 bg-error-container hover:bg-rose-100/80 border border-error-container text-error rounded-xl font-black text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Trash2 size={12} />
            Eliminar
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-3.5 md:space-y-6 animate-in fade-in duration-500 pb-20 lg:pb-12 px-2 sm:px-0">
      
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-surface p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-outline-variant shadow-[0_2px_8px_rgba(0,0,0,0.01)] animate-in fade-in">
        <div className="space-y-0.5 sm:space-y-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="px-2 py-0.5 text-[8px] font-black text-academic-700 bg-academic-50 border border-academic-100 rounded-full tracking-widest uppercase flex items-center gap-1">
              <GraduationCap size={10} /> Catálogo
            </span>
            {programs.length !== DEFAULT_PROGRAMS.length && (
              <button 
                onClick={handleResetDefaults}
                className="px-2 py-0.5 text-[8px] font-black text-on-surface-variant bg-surface-container-low hover:bg-surface-container-high border border-slate-150 rounded-full uppercase flex items-center gap-0.5 transition-all shadow-sm"
                title="Restablecer base estandar"
              >
                <RotateCcw size={9} /> Reestablecer base
              </button>
            )}
          </div>
          <h1 className="text-xl sm:text-3xl font-display font-black text-on-surface tracking-tight leading-none">
            Cursos y Técnicos
          </h1>
          <p className="text-on-surface-variant text-[10px] sm:text-[11px] font-semibold">
            Placa de control curricular de grados escolares y módulos didácticos.
          </p>
        </div>
        
        <button 
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-1.5 px-4 sm:px-5 py-2.5 sm:py-3 bg-primary hover:bg-primary/90 text-on-primary rounded-xl font-black text-[10px] sm:text-[11px] uppercase tracking-widest transition-all shadow-md transform active:scale-95 shrink-0"
        >
          <Plus size={14} strokeWidth={3} />
          Nuevo Programa
        </button>
      </header>

      {/* Dynamic Statistics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        <div className="p-3 sm:p-4 bg-surface rounded-xl sm:rounded-2xl border border-outline-variant shadow-[0_2px_8px_rgba(0,0,0,0.01)] flex items-center justify-between gap-2">
          <div className="space-y-0.5 truncate">
            <p className="text-[8px] sm:text-[9px] font-black leading-none text-on-surface-variant uppercase tracking-widest truncate">Total Mallas</p>
            <p className="text-lg sm:text-xl font-black text-on-surface">{totalPrograms}</p>
          </div>
          <div className="p-1.5 sm:p-2 rounded-xl bg-academic-50 text-academic-600 shrink-0 border border-academic-100">
            <Award size={15} />
          </div>
        </div>

        <div className="p-3 sm:p-4 bg-surface rounded-xl sm:rounded-2xl border border-outline-variant shadow-[0_2px_8px_rgba(0,0,0,0.01)] flex items-center justify-between gap-2 cursor-pointer hover:border-academic-500/20 transition-all" onClick={() => setFilterTipo('Técnico')}>
          <div className="space-y-0.5 truncate">
            <p className="text-[8px] sm:text-[9px] font-black leading-none text-on-surface-variant uppercase tracking-widest truncate">Técnicos</p>
            <p className="text-lg sm:text-xl font-black text-on-surface">{totalTecnicos}</p>
          </div>
          <div className="p-1.5 sm:p-2 rounded-xl bg-primary-container text-primary shrink-0 border border-emerald-100">
            <GraduationCap size={15} />
          </div>
        </div>

        <div className="p-3 sm:p-4 bg-surface rounded-xl sm:rounded-2xl border border-outline-variant shadow-[0_2px_8px_rgba(0,0,0,0.01)] flex items-center justify-between gap-2 cursor-pointer hover:border-academic-500/20 transition-all" onClick={() => setFilterTipo('Curso')}>
          <div className="space-y-0.5 truncate">
            <p className="text-[8px] sm:text-[9px] font-black leading-none text-on-surface-variant uppercase tracking-widest truncate">Cursos</p>
            <p className="text-lg sm:text-xl font-black text-on-surface">{totalCursos}</p>
          </div>
          <div className="p-1.5 sm:p-2 rounded-xl bg-indigo-50 text-indigo-650 shrink-0 border border-indigo-100">
            <BookOpen size={15} />
          </div>
        </div>

        <div className="p-3 sm:p-4 bg-surface rounded-xl sm:rounded-2xl border border-outline-variant shadow-[0_2px_8px_rgba(0,0,0,0.01)] flex items-center justify-between gap-2">
          <div className="space-y-0.5 truncate">
            <p className="text-[8px] sm:text-[9px] font-black leading-none text-on-surface-variant uppercase tracking-widest truncate">Total Docentes</p>
            <p className="text-lg sm:text-xl font-black text-on-surface">{teachers.length}</p>
          </div>
          <div className="p-1.5 sm:p-2 rounded-xl bg-tertiary-container text-tertiary shrink-0 border border-amber-100">
            <Users size={15} />
          </div>
        </div>
      </div>

      {/* Control center: Search and Filters (Optimized design, NO horizontal scroll) */}
      <div className="bg-surface p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-outline-variant shadow-[0_2px_8px_rgba(0,0,0,0.01)] flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative group w-full md:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-academic-500 transition-colors" size={14} />
          <input 
            type="text" 
            placeholder="Buscar por nombre, código..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-surface-container-low border border-outline-variant rounded-xl focus:outline-none focus:ring-1 focus:ring-academic-500/30 focus:border-academic-500 transition-all font-semibold text-xs text-on-surface placeholder-slate-450 focus:bg-surface"
          />
        </div>

        <div className="w-full md:w-auto flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="flex items-center gap-1.5 text-[9px] font-black text-on-surface-variant uppercase tracking-widest leading-none">
            <span className="w-1.5 h-1.5 rounded-full bg-academic-500" />
            Filtrar:
          </div>
          <div className="grid grid-cols-3 gap-1 md:flex md:items-center md:gap-1.5 w-full md:w-auto">
            {(['All', 'Técnico', 'Curso'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterTipo(type)}
                className={cn(
                  "px-2 py-1.5 sm:px-3 sm:py-1.5 rounded-lg text-[10px] sm:text-[11px] font-bold text-center transition-all border block w-full md:w-auto",
                  filterTipo === type
                    ? "bg-primary border-primary text-on-primary shadow-sm font-extrabold"
                    : "bg-surface border-outline-variant text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low"
                )}
              >
                {type === 'All' ? 'Todos' : type === 'Técnico' ? 'Técnicos' : 'Cursos'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Split grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 items-start">
        
        {/* Main List Column */}
        <div className="lg:col-span-2 space-y-3">
          <AnimatePresence mode="popLayout">
            {filteredPrograms.length > 0 ? (
              filteredPrograms.map((prog, idx) => {
                const isSelected = selectedProgramId === prog.id;
                const matchCount = modules.filter(m => m.carrera.toLowerCase() === prog.nombre.toLowerCase()).length;
                
                return (
                  <motion.div
                    key={prog.id}
                    layoutId={`prog-item-${prog.id}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.18, delay: idx * 0.03 }}
                    onClick={() => setSelectedProgramId(isSelected ? null : prog.id)}
                    className={cn(
                      "p-3.5 sm:p-5 md:p-6 rounded-xl md:rounded-2xl bg-surface border hover:border-academic-500/40 cursor-pointer transition-all duration-200 relative group overflow-hidden border-l-[4px] flex flex-col justify-between shadow-[0_2px_8px_rgba(0,0,0,0.015)]",
                      isSelected 
                        ? "border-academic-600 ring-4 ring-academic-500/5 shadow-md" 
                        : prog.tipo === 'Técnico' 
                          ? "border-outline-variant border-l-academic-600" 
                          : "border-outline-variant border-l-indigo-600"
                    )}
                  >
                    <div>
                      {/* Top bar with Badge & Quick actions */}
                      <div className="flex items-start justify-between gap-3 mb-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "p-2 rounded-lg shrink-0",
                            prog.tipo === 'Técnico' ? "bg-academic-50 text-academic-600 border border-academic-100" : "bg-indigo-50 text-indigo-650 border border-indigo-100"
                          )}>
                            {prog.tipo === 'Técnico' ? <GraduationCap size={14} /> : <BookOpen size={14} />}
                          </div>
                          <div className="truncate">
                            <span className="text-[8px] font-black uppercase tracking-widest text-on-surface-variant block leading-none mb-0.5">
                              {prog.tipo}
                            </span>
                            <div className="flex items-center gap-1 bg-surface-container-low px-2 py-0.5 rounded border border-outline-variant text-[9px] font-mono text-on-surface-variant max-w-[150px] sm:max-w-none truncate font-semibold">
                              <Tag size={10} className="text-slate-450 shrink-0" />
                              <span className="truncate">
                                {prog.tipo === 'Técnico' ? prog.codigoCarrera : prog.codigoCurso}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Card Hover Action Bar */}
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={() => handleOpenEdit(prog)}
                            className="w-9 h-9 flex items-center justify-center rounded-lg bg-surface-container-low hover:bg-surface-container-high text-on-surface-variant hover:text-academic-600 border border-slate-150/50 transition-all shadow-sm"
                            title="Editar"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button 
                            onClick={(e) => handleDelete(prog, e)}
                            className="w-9 h-9 flex items-center justify-center rounded-lg bg-error-container hover:bg-rose-100/85 text-error hover:text-rose-650 border border-error-container/40 transition-all shadow-sm"
                            title="Eliminar"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Main Info */}
                      <h3 className="text-sm sm:text-base font-extrabold text-on-surface leading-tight mb-1 inline-flex items-center gap-1.5">
                        {prog.nombre}
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-academic-650 shrink-0 animate-pulse" />}
                      </h3>

                      {prog.descripcion && (
                        <p className="text-[11px] font-medium text-on-surface-variant leading-relaxed max-w-2xl mb-3 text-pretty line-clamp-2">
                          {prog.descripcion}
                        </p>
                      )}
                    </div>

                    {/* Footer Metadata */}
                    <div className="flex items-center justify-between pt-3 border-t border-outline-variant mt-1 text-[10px] font-bold text-on-surface-variant">
                      <div className="flex items-center gap-2 truncate">
                        <div className="flex items-center gap-1 shrink-0 text-on-surface-variant">
                          <Calendar size={10} />
                          <span>Alta: {prog.fechaRegistro}</span>
                        </div>
                        <span className="w-1 h-1 rounded-full bg-surface-container-highest shrink-0" />
                        <div className="flex items-center gap-1 text-on-surface-variant truncate font-semibold">
                          <BookOpen size={10} className="text-on-surface-variant shrink-0" />
                          <span className="truncate">{matchCount} {matchCount === 1 ? 'módulo' : 'módulos'}</span>
                        </div>
                      </div>

                      {prog.duracion && (
                        <span className="px-1.5 py-0.5 rounded bg-surface-container-low border border-outline-variant font-black text-on-surface-variant text-[8px] uppercase tracking-wider shrink-0 lg:block hidden">
                          🕒 {prog.duracion}
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="py-16 bg-surface border-2 border-dashed border-outline-variant rounded-2xl flex flex-col items-center justify-center text-center p-6 shadow-sm">
                <Bookmark className="text-on-surface-variant mb-2.5 stroke-[1.5]" size={36} />
                <h3 className="text-sm font-black text-on-surface">Ningún programa cargado</h3>
                <p className="text-slate-450 mt-1 max-w-xs text-[11px] leading-normal font-semibold">
                  Crea un registro de carrera técnica o curso de especialización independiente usando el botón superior.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* DETAILS COLUMN: Inline Inspector on Desktop (`hidden lg:block`), overlay modal bottom-sheet on mobile */}
        {/* DESKTOP PANEL */}
        <div className="hidden lg:block space-y-4">
          <AnimatePresence mode="wait">
            {activeProgram ? (
              <motion.div
                key={activeProgram.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="bg-surface border border-outline-variant rounded-2xl p-5 space-y-4 shadow-md relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-academic-600/5 rounded-full blur-2xl pointer-events-none" />
                
                {/* Header */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest bg-academic-50 text-academic-600 border border-academic-100 shadow-sm">
                      Ficha Técnica
                    </span>
                    <button 
                      onClick={() => setSelectedProgramId(null)} 
                      className="text-on-surface-variant hover:text-on-surface transition-colors text-[10px] font-extrabold"
                    >
                      Ocultar
                    </button>
                  </div>
                  <h3 className="text-base font-black text-on-surface uppercase tracking-tight pt-1 leading-tight">
                    {activeProgram.nombre}
                  </h3>
                </div>

                {/* Submalla details */}
                <div className="border-t border-outline-variant pt-3">
                  {renderInspectorContent(activeProgram)}
                </div>
              </motion.div>
            ) : (
              <div className="bg-surface border border-outline-variant border-dashed rounded-2xl p-6 text-center text-slate-450 font-bold text-[11px] flex flex-col justify-center items-center gap-2 min-h-[300px] shadow-sm">
                <HelpCircle className="text-outline-variant" size={24} />
                <p className="max-w-[200px] text-center leading-relaxed font-semibold">
                  Pulsa sobre un programa para inspeccionar su plan curricular, docentes asignados y coordinar el envío de bitácoras académicas correspondientes.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* MOBILE BOTTOM SHEET MODAL (Inspector Drawer for mobile screens) */}
      <AnimatePresence>
        {selectedProgramId && activeProgram && (
          <div className="lg:hidden fixed inset-0 z-50 flex items-end justify-center">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProgramId(null)}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            />
            {/* Smooth Spring Sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 280 }}
              className="relative w-full max-h-[80vh] bg-surface border-t border-outline-variant rounded-t-[1.75rem] p-5 pb-24 space-y-4 shadow-2xl overflow-y-auto no-scrollbar focus:outline-none"
            >
              {/* Drag Handle Indicator */}
              <div className="w-10 h-1 bg-surface-container-highest rounded-full mx-auto" onClick={() => setSelectedProgramId(null)} />
              
              {/* Header */}
              <div className="flex justify-between items-start pt-1">
                <div className="space-y-0.5">
                  <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest bg-academic-50 text-academic-600 border border-academic-100 shadow-sm">
                    Ficha Técnica
                  </span>
                  <h3 className="text-base font-black text-on-surface uppercase tracking-tight leading-snug">
                    {activeProgram.nombre}
                  </h3>
                </div>
                <button 
                  onClick={() => setSelectedProgramId(null)} 
                  className="p-1.5 bg-surface-container-low hover:bg-surface-container-high rounded-lg text-on-surface-variant transition-colors"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Inspector Content */}
              <div className="border-t border-outline-variant pt-3">
                {renderInspectorContent(activeProgram)}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-55 flex items-center justify-center p-3 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              className="relative w-full max-w-md bg-surface rounded-2xl border border-outline-variant shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="p-5 border-b border-outline-variant flex items-center justify-between bg-primary text-on-primary shrink-0">
                <div>
                  <span className="text-[10px] font-black uppercase text-indigo-100 tracking-wider">
                    {editingProgram ? 'Modificar Registro Curricular' : 'Ingresar al Catálogo Oficial'}
                  </span>
                  <h2 className="text-lg font-black text-white uppercase tracking-tight leading-none mt-1.5">
                    {editingProgram ? 'Modificar Programa' : 'Crear Programa'}
                  </h2>
                </div>
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 hover:bg-surface/10 rounded-lg transition-colors text-white"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form Body (Scrollable inside constraints) */}
              <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto custom-scrollbar flex-1 pb-16 sm:pb-5">
                {formError && (
                  <div className="p-3 bg-error-container border border-error-container rounded-xl text-[10px] font-bold text-error uppercase tracking-tight flex items-center gap-1.5">
                    <AlertCircle size={12} className="shrink-0" /> <span>{formError}</span>
                  </div>
                )}

                {/* Tipo selection */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-405 block uppercase tracking-widest">
                    Clasificación del Programa
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setTipo('Técnico')}
                      className={cn(
                        "py-2.5 rounded-xl font-black text-[10px] uppercase tracking-wider border transition-all text-center",
                        tipo === 'Técnico'
                          ? "bg-academic-600 border-academic-600 text-white shadow-md font-black"
                          : "bg-surface-container-low border-slate-150 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
                      )}
                    >
                      🎓 Carrera Técnica
                    </button>
                    <button
                      type="button"
                      onClick={() => setTipo('Curso')}
                      className={cn(
                        "py-2.5 rounded-xl font-black text-[10px] uppercase tracking-wider border transition-all text-center",
                        tipo === 'Curso'
                          ? "bg-indigo-600 border-indigo-600 text-white shadow-md font-black"
                          : "bg-surface-container-low border-slate-150 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
                      )}
                    >
                      📘 Curso Libre
                    </button>
                  </div>
                </div>

                {/* Dynamic Code fields */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-405 block uppercase tracking-widest">
                    {tipo === 'Técnico' ? 'Código de la Carrera Técnica' : 'Código de Identificación del Curso'}
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={13} />
                    <input 
                      type="text" 
                      placeholder={tipo === 'Técnico' ? "Ej. TEC-ADS-2026" : "Ej. CUR-DB1-203"}
                      value={tipo === 'Técnico' ? codigoCarrera : codigoCurso}
                      onChange={(e) => tipo === 'Técnico' ? setCodigoCarrera(e.target.value) : setCodigoCurso(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl focus:outline-none focus:ring-1 focus:ring-academic-500 focus:bg-surface transition-all font-bold text-xs text-on-surface placeholder-slate-400"
                    />
                  </div>
                </div>

                {/* Nombre */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-405 block uppercase tracking-widest">
                    Nombre del Plan de Estudios
                  </label>
                  <input 
                    type="text" 
                    placeholder="Ej. Análisis de Sistemas..."
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl focus:outline-none focus:ring-1 focus:ring-academic-500 focus:bg-surface transition-all font-bold text-xs text-on-surface placeholder-slate-400"
                  />
                </div>

                {/* Duración */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-405 block uppercase tracking-widest">
                    Duración Estimada
                  </label>
                  <input 
                    type="text" 
                    placeholder="Ej. 4 Semestres, 120 horas..."
                    value={duracion}
                    onChange={(e) => setDuracion(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl focus:outline-none focus:ring-1 focus:ring-academic-500 focus:bg-surface transition-all font-bold text-xs text-on-surface placeholder-slate-400"
                  />
                </div>

                {/* Descripción */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-405 block uppercase tracking-widest">
                    Enfoque o Perfil de Egreso
                  </label>
                  <textarea 
                    placeholder="Escriba un resumen sobre las competencias..."
                    rows={2}
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl focus:outline-none focus:ring-1 focus:ring-academic-500 focus:bg-surface transition-all font-bold text-xs text-on-surface placeholder-slate-400 resize-none"
                  />
                </div>

                {/* Action buttons (Sticky Footer Area for small screen UX) */}
                <div className="flex gap-2.5 pt-2 shrink-0">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3 bg-surface-container-low hover:bg-surface-container-high border border-slate-150 text-on-surface-variant rounded-xl font-black text-[10px] uppercase tracking-widest transition-all text-center"
                  >
                    Regresar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 bg-primary hover:bg-primary/90 text-on-primary rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-academic-600/10 transition-all text-center"
                  >
                    {editingProgram ? 'Modificar' : 'Grabar'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: Link Module Sheet (Responsive max scroll containment) */}
      <AnimatePresence>
        {isLinkingModalOpen && activeProgram && (
          <div className="fixed inset-0 z-55 flex items-center justify-center p-3 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLinkingModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              className="relative w-full max-w-lg bg-surface rounded-2xl border border-outline-variant shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              {/* Header */}
              <div className="p-5 bg-primary text-on-primary border-b border-academic-700 flex items-center justify-between shrink-0">
                <div>
                  <span className="text-[9px] font-black uppercase text-indigo-100 tracking-wider">Gestión Curricular</span>
                  <h2 className="text-base font-black text-white uppercase tracking-tight">
                    Vincular Módulos
                  </h2>
                  <p className="text-[10px] text-indigo-50 mt-0.5 max-w-xs block leading-tight">
                    Asigna asignaturas a {activeProgram.nombre}.
                  </p>
                </div>
                <button onClick={() => setIsLinkingModalOpen(false)} className="p-1.5 text-white hover:bg-surface/15 transition-all rounded-lg">
                  <X size={15} />
                </button>
              </div>

              {/* Modules list scrollable */}
              <div className="p-5 overflow-y-auto custom-scrollbar flex-1 space-y-2 pb-16 sm:pb-5 bg-surface-container-low">
                {modules.length > 0 ? (
                  modules.map(mod => {
                    const isLinked = mod.carrera.toLowerCase() === activeProgram.nombre.toLowerCase();
                    return (
                      <div 
                        key={mod.codModule}
                        className={cn(
                          "p-3 rounded-xl border transition-all flex items-center justify-between gap-3 text-xs",
                          isLinked 
                            ? "bg-academic-50 border-academic-300 text-academic-750" 
                            : "bg-surface border-outline-variant text-slate-650 hover:bg-surface-container-high/50"
                        )}
                      >
                        <div className="space-y-0.5 truncate">
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="font-extrabold text-[12px] text-on-surface truncate">{mod.nombre}</span>
                            <span className="text-[8px] font-mono bg-surface-container-high text-on-surface-variant px-1 py-0.2 rounded shrink-0">
                              {mod.codModule}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-450 truncate">
                            Asignado: <span className="text-academic-600 font-bold">{mod.carrera || 'Ninguna'}</span>
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleLinkModule(mod.codModule, isLinked, activeProgram.nombre)}
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all shrink-0",
                            isLinked 
                              ? "bg-error-container border border-error-container text-error hover:bg-rose-100" 
                              : "bg-primary text-on-primary hover:bg-academic-700 shadow-sm"
                          )}
                        >
                          {isLinked ? 'Excluir' : 'Vincular'}
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-[11px] text-on-surface-variant italic text-center py-6">
                    No hay asignaturas registradas en el sistema escolar.
                  </p>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 bg-surface border-t border-outline-variant flex justify-end shrink-0">
                <button
                  type="button"
                  onClick={() => setIsLinkingModalOpen(false)}
                  className="px-5 py-2.5 bg-primary text-on-primary rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-academic-700 transition"
                >
                  Finalizar Cambios
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: Custom Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && programToDelete && (
          <div className="fixed inset-0 z-55 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsDeleteModalOpen(false);
                setProgramToDelete(null);
              }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-sm bg-surface rounded-2xl border border-outline-variant p-6 shadow-2xl space-y-4"
            >
              <div className="text-center space-y-2">
                <div className="inline-flex p-3 bg-error-container text-error border border-error-container rounded-full">
                  <Trash2 size={24} />
                </div>
                <h3 className="text-base font-black text-on-surface uppercase tracking-tight">
                  ¿Eliminar Programa?
                </h3>
                <p className="text-[11px] text-on-surface-variant leading-relaxed font-semibold">
                  ¿Está seguro de que desea eliminar permanentemente el programa <span className="text-on-surface font-extrabold">"{programToDelete.nombre}"</span>? Esta acción no se puede deshacer y desvinculará sus docentes asociados.
                </p>
              </div>
              <div className="flex gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setProgramToDelete(null);
                  }}
                  className="flex-1 py-2.5 bg-surface-container-low hover:bg-surface-container-high text-on-surface-variant border border-outline-variant rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-sm"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-rose-600/10"
                >
                  Eliminar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 4: Custom Reset Base Confirmation Modal */}
      <AnimatePresence>
        {isResetModalOpen && (
          <div className="fixed inset-0 z-55 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsResetModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-sm bg-surface rounded-2xl border border-outline-variant p-6 shadow-2xl space-y-4"
            >
              <div className="text-center space-y-2">
                <div className="inline-flex p-3 bg-tertiary-container text-tertiary border border-amber-100 rounded-full font-bold">
                  <RotateCcw size={24} />
                </div>
                <h3 className="text-base font-black text-on-surface uppercase tracking-tight">
                  ¿Restablecer Catálogo?
                </h3>
                <p className="text-[11px] text-on-surface-variant leading-relaxed font-semibold">
                  ¿Desea restablecer el inventario de programas con el catálogo estándar del instituto? Esto borrará tus adiciones personalizadas.
                </p>
              </div>
              <div className="flex gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setIsResetModalOpen(false)}
                  className="flex-1 py-2.5 bg-surface-container-low hover:bg-surface-container-high text-on-surface-variant border border-outline-variant rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-sm"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={confirmResetDefaults}
                  className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-amber-600/10"
                >
                  Restablecer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FLOAT SYSTEM TOASTS (Positioned above footer elements so it works nicely with MobileNav overlays) */}
      <div className="fixed bottom-24 sm:bottom-6 right-4 sm:right-6 z-55 flex flex-col gap-2 max-w-xs pointer-events-none">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.12 } }}
              className={cn(
                "p-3 rounded-xl shadow-xl border text-[10px] font-black uppercase tracking-tight flex items-center gap-2 pointer-events-auto",
                t.type === 'success' ? "bg-surface border-emerald-200 text-emerald-800 shadow-[0_4px_16px_rgba(16,185,129,0.06)]" :
                t.type === 'danger' ? "bg-surface border-rose-250 text-rose-800 shadow-[0_4px_16px_rgba(244,63,94,0.06)]" :
                "bg-surface border-academic-200 text-academic-700 shadow-[0_4px_16px_rgba(0,0,0,0.04)]"
              )}
            >
              <Check size={12} className={cn(
                "shrink-0",
                t.type === 'success' ? "text-primary" :
                t.type === 'danger' ? "text-error" :
                "text-academic-600"
              )} />
              <span>{t.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

    </div>
  );
};

export default Programas;

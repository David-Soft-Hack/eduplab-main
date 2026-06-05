import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  GraduationCap, 
  Clock, 
  Layers, 
  Edit2, 
  Trash2, 
  X, 
  Check,
  ChevronDown,
  ChevronUp,
  UploadCloud,
  FileText,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  FileCheck
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { cn } from '../lib/utils';

interface ToastAlert {
  id: string;
  message: string;
  type: 'success' | 'info' | 'danger';
}

interface DidacticUnit {
  codUnit: string;
  nombre: string;
  totalHoraAcademic: number;
  totalHoraReloj: number;
  ponderacion: number;
  planningFileName?: string;
}

const Modules: React.FC = () => {
  const { modules, setModules } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Expanded modules state (to show units in the grid)
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});

  // Main Modals toggles
  const [showFormModal, setShowFormModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedModule, setSelectedModule] = useState<any>(null);

  // Stepper state (1: General Info, 2: Didactic Units)
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  // Deletion Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [moduleToDelete, setModuleToDelete] = useState<any>(null);

  // List of Academic Programs
  const [programsList, setProgramsList] = useState<string[]>([]);

  // Toast notifications
  const [toasts, setToasts] = useState<ToastAlert[]>([]);

  // Drag & Drop / File state for sub-form
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'danger' = 'success') => {
    const id = String(Date.now());
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  // Form States for main modules
  const [generalForm, setGeneralForm] = useState({
    codModule: '',
    nombre: '',
    totalHoraReloj: 0,
    totalHoraAcademic: 0,
    cantidadUnidades: 0,
    carrera: '',
    planningFileName: ''
  });

  // State for temporary units of the module being created/edited
  const [tempUnits, setTempUnits] = useState<DidacticUnit[]>([]);

  // Sub-form States for individual Didactic Unit creation/edit
  const [editingUnitIndex, setEditingUnitIndex] = useState<number | null>(null);
  const [unitForm, setUnitForm] = useState({
    codUnit: '',
    nombre: '',
    totalHoraAcademic: 0,
    totalHoraReloj: 0,
    ponderacion: 0
  });

  const [allPrograms, setAllPrograms] = useState<any[]>([]);

  // Load programs from localStorage on startup
  useEffect(() => {
    const saved = localStorage.getItem('eduplan_academic_programs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setAllPrograms(parsed);
          const names = parsed.map((p: any) => p.nombre);
          setProgramsList(names);
          return;
        }
      } catch (e) {
        // Fallback
      }
    }
    const defaultPrograms = [
      { id: 'prog-1', tipo: 'Técnico', nombre: 'Análisis de Sistemas' },
      { id: 'prog-2', tipo: 'Técnico', nombre: 'Ingeniería de Sistemas' },
      { id: 'prog-3', tipo: 'Curso', nombre: 'Bases de Datos Avanzadas' },
      { id: 'prog-4', tipo: 'Curso', nombre: 'Diseño UX/UI Avanzado' }
    ];
    setAllPrograms(defaultPrograms);
    setProgramsList(defaultPrograms.map(p => p.nombre));
  }, []);

  const selectedProgramObj = allPrograms.find(p => p.nombre === generalForm.carrera) || { tipo: 'Técnico' };
  const selectedProgramTipo = selectedProgramObj.tipo;

  // Auto-calculate clock hours from academic hours
  useEffect(() => {
    if (generalForm.totalHoraAcademic > 0) {
      const calculatedReloj = selectedProgramTipo === 'Técnico'
        ? Math.round(generalForm.totalHoraAcademic * 0.75)
        : generalForm.totalHoraAcademic;
      setGeneralForm(prev => {
        // Only update if it has changed to prevent infinite loops
        if (prev.totalHoraReloj !== calculatedReloj) {
          return { ...prev, totalHoraReloj: calculatedReloj };
        }
        return prev;
      });
    }
  }, [generalForm.totalHoraAcademic, selectedProgramTipo]);

  const resetForm = () => {
    setGeneralForm({
      codModule: '',
      nombre: '',
      totalHoraReloj: 0,
      totalHoraAcademic: 0,
      cantidadUnidades: 0,
      carrera: programsList[0] || 'Análisis de Sistemas',
      planningFileName: ''
    });
    setTempUnits([]);
    resetUnitSubForm();
    setCurrentStep(1);
    setIsEditMode(false);
    setSelectedModule(null);
  };

  const resetUnitSubForm = () => {
    setUnitForm({
      codUnit: '',
      nombre: '',
      totalHoraAcademic: 0,
      totalHoraReloj: 0,
      ponderacion: 0
    });
    setEditingUnitIndex(null);
  };

  const handleOpenAddModal = () => {
    resetForm();
    setIsEditMode(false);
    setShowFormModal(true);
  };

  const handleOpenEditModal = (module: any) => {
    setSelectedModule(module);
    setIsEditMode(true);
    setGeneralForm({
      codModule: module.codModule,
      nombre: module.nombre,
      totalHoraReloj: module.totalHoraReloj || 0,
      totalHoraAcademic: module.totalHoraAcademic || 0,
      cantidadUnidades: module.cantidadUnidades || 0,
      carrera: module.carrera || programsList[0] || 'Análisis de Sistemas',
      planningFileName: module.planningFileName || ''
    });
    setTempUnits(module.units ? [...module.units] : []);
    resetUnitSubForm();
    setCurrentStep(1);
    setShowFormModal(true);
  };

  const handleOpenDeleteModal = (module: any) => {
    setModuleToDelete(module);
    setIsDeleteModalOpen(true);
  };

  // Step Navigations
  const goToStep2 = () => {
    if (!generalForm.codModule.trim() || !generalForm.nombre.trim() || !generalForm.carrera) {
      showToast('Por favor, complete los campos obligatorios del módulo.', 'danger');
      return;
    }
    // Check if code matches any other existing module when in add mode
    if (!isEditMode && modules.some(m => m.codModule.toLowerCase() === generalForm.codModule.trim().toLowerCase())) {
      showToast('El código de módulo ingresado ya existe.', 'danger');
      return;
    }
    // Check if code matches another module code on edit mode
    if (isEditMode && selectedModule && generalForm.codModule.trim().toLowerCase() !== selectedModule.codModule.toLowerCase() &&
        modules.some(m => m.codModule.toLowerCase() === generalForm.codModule.trim().toLowerCase())) {
      showToast('El código de módulo ingresado ya pertenece a otro módulo.', 'danger');
      return;
    }

    setCurrentStep(2);
  };

  const goToStep1 = () => {
    setCurrentStep(1);
  };

  // Drag & drop file upload event handlers for Module Form (Step 1)
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setGeneralForm(prev => ({ ...prev, planningFileName: file.name }));
      showToast(`Archivo "${file.name}" cargado correctamente`, 'success');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setGeneralForm(prev => ({ ...prev, planningFileName: file.name }));
      showToast(`Archivo "${file.name}" seleccionado correctamente`, 'success');
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleAddOrUpdateUnit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!unitForm.codUnit.trim() || !unitForm.nombre.trim()) {
      showToast('Por favor ingrese al menos el código y nombre de la unidad didáctica.', 'danger');
      return;
    }

    const currentUnitData: DidacticUnit = {
      codUnit: unitForm.codUnit.trim(),
      nombre: unitForm.nombre.trim(),
      totalHoraAcademic: Number(unitForm.totalHoraAcademic),
      totalHoraReloj: Number(unitForm.totalHoraReloj),
      ponderacion: Number(unitForm.ponderacion)
    };

    if (editingUnitIndex !== null) {
      // Edit mode of a sub-unit
      setTempUnits(prev => {
        const copy = [...prev];
        copy[editingUnitIndex] = currentUnitData;
        return copy;
      });
      showToast('Unidad didáctica modificada en la lista', 'success');
    } else {
      // Create mode
      if (tempUnits.some(u => u.codUnit.toLowerCase() === currentUnitData.codUnit.toLowerCase())) {
        showToast('Ya existe una unidad didáctica con ese código en este módulo.', 'danger');
        return;
      }
      setTempUnits(prev => [...prev, currentUnitData]);
      showToast('Unidad didáctica añadida a la lista', 'success');
    }

    resetUnitSubForm();
  };

  const handleDeleteTempUnit = (index: number) => {
    setTempUnits(prev => prev.filter((_, i) => i !== index));
    showToast('Unidad eliminada', 'info');
    if (editingUnitIndex === index) {
      resetUnitSubForm();
    }
  };

  const handleEditTempUnit = (index: number) => {
    const unit = tempUnits[index];
    setUnitForm({
      codUnit: unit.codUnit,
      nombre: unit.nombre,
      totalHoraAcademic: unit.totalHoraAcademic,
      totalHoraReloj: unit.totalHoraReloj,
      ponderacion: unit.ponderacion
    });
    setEditingUnitIndex(index);
  };

  const handleSaveWholeModule = () => {
    // Collect the final whole module properties
    const totalTempPonderacion = tempUnits.reduce((acc, u) => acc + u.ponderacion, 0);
    if (tempUnits.length > 0 && totalTempPonderacion !== 100) {
      showToast(`Error: Las ponderaciones acumuladas suman ${totalTempPonderacion}%. Deben sumar exactamente 100% para cumplir la norma INATEC Masaya.`, 'danger');
      return;
    }

    const finalModule = {
      codModule: generalForm.codModule.trim(),
      nombre: generalForm.nombre.trim(),
      totalHoraReloj: Number(generalForm.totalHoraReloj),
      totalHoraAcademic: Number(generalForm.totalHoraAcademic),
      cantidadUnidades: tempUnits.length > 0 ? tempUnits.length : Number(generalForm.cantidadUnidades),
      carrera: generalForm.carrera,
      fechaCreacion: isEditMode && selectedModule ? selectedModule.fechaCreacion : new Date().toISOString().split('T')[0],
      planningFileName: generalForm.planningFileName || '',
      units: tempUnits
    };

    if (isEditMode && selectedModule) {
      // Edit Module in state
      setModules(prev => prev.map(m => 
        m.codModule === selectedModule.codModule ? finalModule : m
      ));
      showToast('Módulo formativo y planificación guardados con éxito.', 'success');
    } else {
      // New Module in State
      setModules(prev => [finalModule, ...prev]);
      showToast('Módulo formativo con unidades didácticas creado.', 'success');
    }

    setShowFormModal(false);
    resetForm();
  };

  const handleDeleteModule = () => {
    setModules(prev => prev.filter(m => m.codModule !== moduleToDelete.codModule));
    showToast('Módulo eliminado con éxito.', 'success');
    setIsDeleteModalOpen(false);
    setModuleToDelete(null);
  };

  // Aggregated units metrics
  const totalTempHoursAcademic = tempUnits.reduce((acc, u) => acc + u.totalHoraAcademic, 0);
  const totalTempHoursReloj = tempUnits.reduce((acc, u) => acc + u.totalHoraReloj, 0);
  const totalTempPonderacion = tempUnits.reduce((acc, u) => acc + u.ponderacion, 0);

  const filteredModules = modules.filter(m => 
    m.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.codModule.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.carrera.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleExpandModule = (codModule: string) => {
    setExpandedModules(prev => ({
      ...prev,
      [codModule]: !prev[codModule]
    }));
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-on-surface">Módulos Formativos</h1>
          <p className="text-on-surface-variant mt-1">Gestión centralizada de cargas horarias, unidades didácticas y planeaciones estructuradas</p>
        </div>
        <button 
          onClick={handleOpenAddModal}
          className="flex items-center justify-center gap-2 px-6 py-4 bg-primary hover:bg-primary/90 text-on-primary rounded-2xl font-bold transition-all shadow-lg shadow-academic-600/20 active:scale-95 sm:w-auto"
        >
          <Plus size={20} />
          Nuevo Módulo
        </button>
      </div>

      {/* Filters Bar */}
      <div className="relative group max-w-xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-academic-500 transition-colors" size={18} />
        <input 
          type="text" 
          placeholder="Buscar módulo por código, nombre o programa..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-11 pr-4 py-4 bg-surface rounded-2xl border border-outline-variant shadow-sm focus:ring-2 focus:ring-academic-500 transition-all font-medium outline-none text-on-surface"
        />
      </div>

      {/* Empty State */}
      {filteredModules.length === 0 && (
        <div className="bg-surface rounded-3xl border border-outline-variant p-16 text-center space-y-4 max-w-lg mx-auto shadow-sm">
          <Layers size={48} className="text-outline-variant mx-auto" />
          <h3 className="text-lg font-black text-on-surface uppercase tracking-tight">No se encontraron módulos</h3>
          <p className="text-xs text-on-surface-variant font-semibold leading-relaxed">
            Intente cambiar los términos de búsqueda o cree un nuevo módulo formativo utilizando el botón correspondiente en la parte superior.
          </p>
        </div>
      )}

      {/* Modules Grid */}
      <div className="grid md:grid-cols-2 gap-6 items-start">
        {filteredModules.map((module, idx) => {
          const isExpanded = !!expandedModules[module.codModule];
          const unitCount = module.units?.length || 0;
          return (
            <motion.div
              key={module.codModule}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="group bg-surface rounded-3xl border border-outline-variant shadow-sm hover:shadow-md hover:border-academic-100 transition-all overflow-hidden flex flex-col"
            >
              <div className="p-6 space-y-4">
                {/* Header: Code & Actions */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-black text-academic-700 bg-academic-50 border border-academic-100/50 px-2 py-0.5 rounded-lg uppercase tracking-wider inline-block mb-1.5">
                      {module.codModule}
                    </span>
                    <h3 className="text-lg font-black text-on-surface leading-tight group-hover:text-academic-600 transition-colors uppercase tracking-tight">
                      {module.nombre}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleOpenEditModal(module)}
                      className="p-1.5 text-on-surface-variant hover:text-academic-600 hover:bg-surface-container-low border border-transparent hover:border-outline-variant rounded-xl transition-all"
                      title="Editar Módulo"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleOpenDeleteModal(module)}
                      className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error-container border border-transparent hover:border-error-container rounded-xl transition-all"
                      title="Eliminar Módulo"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Belonging Program / Carrera */}
                <div className="flex flex-col gap-2">
                  <div className="px-3.5 py-2 bg-surface-container-low rounded-2xl border border-outline-variant/55 flex items-center gap-2 w-full">
                    <GraduationCap size={15} className="text-academic-500 shrink-0" />
                    <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-tight truncate">
                      Programa: <span className="text-on-surface font-extrabold">{module.carrera}</span>
                    </span>
                  </div>
                  {module.planningFileName && (
                    <div className="px-3.5 py-1.5 bg-primary-container/80 rounded-2xl border border-emerald-100 flex items-center gap-2 w-full">
                      <FileCheck size={14} className="text-primary shrink-0" />
                      <span className="text-[10px] font-black text-emerald-800 uppercase tracking-tight truncate flex items-center gap-1">
                        Planeación: <span className="text-emerald-950 font-bold normal-case select-all">{module.planningFileName}</span>
                      </span>
                    </div>
                  )}
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3.5 bg-surface-container-low/50 rounded-2xl border border-outline-variant/50 flex flex-col gap-1 hover:bg-surface hover:shadow-sm transition-all text-center">
                    <span className="text-[8px] font-black text-on-surface-variant uppercase tracking-wider block">Horas Acad.</span>
                    <div className="flex items-baseline justify-center gap-0.5">
                      <span className="text-base font-black text-on-surface">{module.totalHoraAcademic}</span>
                      <span className="text-[9px] font-bold text-on-surface-variant uppercase">ha</span>
                    </div>
                  </div>
                  
                  <div className="p-3.5 bg-surface-container-low/50 rounded-2xl border border-outline-variant/50 flex flex-col gap-1 hover:bg-surface hover:shadow-sm transition-all text-center">
                    <span className="text-[8px] font-black text-on-surface-variant uppercase tracking-wider block">Horas Reloj</span>
                    <div className="flex items-baseline justify-center gap-0.5">
                      <span className="text-base font-black text-on-surface">{module.totalHoraReloj}</span>
                      <span className="text-[9px] font-bold text-on-surface-variant uppercase">hr</span>
                    </div>
                  </div>

                  <div className="p-3.5 bg-surface-container-low/50 rounded-2xl border border-outline-variant/50 flex flex-col gap-1 hover:bg-surface hover:shadow-sm transition-all text-center">
                    <span className="text-[8px] font-black text-on-surface-variant uppercase tracking-wider block">Unidades</span>
                    <div className="flex items-baseline justify-center gap-0.5">
                      <span className="text-base font-black text-on-surface">{module.cantidadUnidades || unitCount || 0}</span>
                      <span className="text-[9px] font-bold text-on-surface-variant uppercase">uds</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Accordion / Expandable Units List */}
              <div className="border-t border-outline-variant bg-surface-container-low/40">
                <button
                  type="button"
                  onClick={() => toggleExpandModule(module.codModule)}
                  className="w-full px-6 py-3 flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-on-surface-variant hover:bg-surface-container-low transition-all"
                >
                  <span className="flex items-center gap-1.5 text-academic-700">
                    <Layers size={13} />
                    Unidades Didácticas ({unitCount})
                  </span>
                  {isExpanded ? <ChevronUp size={14} className="text-on-surface-variant" /> : <ChevronDown size={14} className="text-on-surface-variant" />}
                </button>

                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden bg-surface-container-low border-t border-outline-variant"
                    >
                      <div className="p-4 space-y-3">
                        {unitCount === 0 ? (
                          <p className="text-[10px] font-bold text-on-surface-variant italic text-center py-2">
                           No hay unidades didácticas agregadas a este módulo.
                          </p>
                        ) : (
                          module.units?.map((unit, uIdx) => (
                            <div 
                              key={unit.codUnit || uIdx} 
                              className="bg-surface border border-outline-variant/60 rounded-2xl p-3.5 space-y-2.5 shadow-sm"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <span className="text-[8px] font-mono font-bold bg-surface-container-high border border-outline-variant text-on-surface-variant px-1.5 py-0.5 rounded uppercase">
                                    {unit.codUnit}
                                  </span>
                                  <h4 className="text-xs font-black text-on-surface leading-tight mt-1">
                                    {unit.nombre}
                                  </h4>
                                </div>
                                <span className="text-[10px] font-black text-academic-700 bg-academic-50 border border-academic-100 px-2 py-0.5 rounded-lg shrink-0">
                                  {unit.ponderacion}%
                                </span>
                              </div>

                              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-dashed border-outline-variant">
                                <div className="flex gap-4">
                                  <div className="flex items-center gap-1 text-[10px] text-on-surface-variant font-semibold">
                                    <Clock size={11} className="text-on-surface-variant" />
                                    <span>{unit.totalHoraAcademic}h Acad.</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-[10px] text-on-surface-variant font-semibold">
                                    <Clock size={11} className="text-on-surface-variant" />
                                    <span>{unit.totalHoraReloj}h Reloj</span>
                                  </div>
                                </div>

                                {unit.planningFileName && (
                                  <div className="flex items-center gap-1 bg-primary-container border border-emerald-100 px-2 py-1 rounded-xl text-[9px] font-bold text-emerald-800">
                                    <FileText size={11} className="text-primary" />
                                    <span className="max-w-[120px] truncate" title={unit.planningFileName}>
                                      {unit.planningFileName}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Main Module Dialog Form (With Stepper Control) */}
      <AnimatePresence>
        {showFormModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowFormModal(false);
                resetForm();
              }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              className="relative w-full max-w-4xl bg-surface rounded-2xl sm:rounded-3xl border border-outline-variant p-4 sm:p-6 md:p-8 shadow-2xl flex flex-col my-2 sm:my-8 max-h-[94vh] sm:max-h-[85vh] overflow-y-auto overflow-x-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-outline-variant">
                <div className="pr-4">
                  <h3 className="text-base sm:text-lg font-black text-on-surface uppercase tracking-tight">
                    {isEditMode ? 'Editar Módulo' : 'Crear Módulo Formativo'}
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-on-surface-variant font-semibold mt-0.5 leading-normal">
                    Modo Stepper: Complete la información básica y luego configure las unidades didácticas.
                  </p>
                </div>
                <button 
                  onClick={() => {
                    setShowFormModal(false);
                    resetForm();
                  }} 
                  className="p-1.5 hover:bg-surface-container-high rounded-xl transition-colors text-on-surface-variant shrink-0"
                >
                  <X size={18} className="sm:hidden" />
                  <X size={20} className="hidden sm:block" />
                </button>
              </div>

              {/* Stepper Steps Bar Indicator */}
              <div className="flex items-center justify-center gap-1.5 sm:gap-4 py-3 sm:py-4 mb-1 sm:mb-2 border-b border-outline-variant">
                <div 
                  onClick={() => currentStep === 2 && goToStep1()}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-tight transition-all cursor-pointer",
                    currentStep === 1 
                      ? "bg-primary text-on-primary" 
                      : "bg-slate-105 text-on-surface-variant hover:text-on-surface"
                  )}
                >
                  <span className={cn(
                    "w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center rounded-full text-[9px] sm:text-[10px] font-bold border",
                    currentStep === 1 ? "border-white bg-academic-700" : "border-outline-variant bg-surface"
                  )}>1</span>
                  <span>
                    <span className="hidden sm:inline">Datos del Módulo</span>
                    <span className="sm:hidden">Datos</span>
                  </span>
                </div>
                
                <div className="h-px w-6 sm:h-px sm:w-8 bg-surface-container-highest" />

                <div 
                  onClick={() => currentStep === 1 && goToStep2()}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-tight transition-all cursor-pointer",
                    currentStep === 2 
                      ? "bg-primary text-on-primary" 
                      : "bg-slate-105 text-on-surface-variant hover:text-on-surface"
                  )}
                >
                  <span className={cn(
                    "w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center rounded-full text-[9px] sm:text-[10px] font-bold border",
                    currentStep === 2 ? "border-white bg-academic-700" : "border-outline-variant bg-surface"
                  )}>2</span>
                  <span>
                    <span className="hidden sm:inline">Unidades Didácticas</span>
                    <span className="sm:hidden">Unidades</span>
                  </span>
                </div>
              </div>

              {/* STEPPER CONTENT CONTAINER */}
              <div className="flex-1 min-h-[250px] sm:min-h-[300px]">
                
                {/* STEP 1: GENERAL DATA */}
                {currentStep === 1 && (
                  <div className="space-y-4 py-2 animate-in fade-in slide-in-from-left duration-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                      {/* Código del Módulo */}
                      <div>
                        <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-wider block mb-1 sm:mb-1.5">Código del Módulo *</label>
                        <input 
                          type="text" 
                          required
                          placeholder="Ej: MOD-003, MF_SO"
                          value={generalForm.codModule}
                          onChange={(e) => setGeneralForm({ ...generalForm, codModule: e.target.value })}
                          className="w-full px-3.5 py-2.5 sm:px-4 sm:py-3 bg-surface-container-low border border-slate-250 rounded-xl font-bold text-xs text-slate-705 outline-academic-500 focus:bg-surface transition-all shadow-inner"
                        />
                      </div>

                      {/* Nombre del Módulo */}
                      <div>
                        <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-wider block mb-1 sm:mb-1.5">Nombre del Módulo *</label>
                        <input 
                          type="text" 
                          required
                          placeholder="Ej: Análisis y Diseño Orientado a Objetos"
                          value={generalForm.nombre}
                          onChange={(e) => setGeneralForm({ ...generalForm, nombre: e.target.value })}
                          className="w-full px-3.5 py-2.5 sm:px-4 sm:py-3 bg-surface-container-low border border-slate-250 rounded-xl font-bold text-xs text-slate-705 outline-academic-500 focus:bg-surface transition-all shadow-inner"
                        />
                      </div>
                    </div>

                    {/* Programa select */}
                    <div>
                      <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-wider block mb-1 sm:mb-1.5">Programa al que pertenece *</label>
                      <select 
                        value={generalForm.carrera}
                        onChange={(e) => setGeneralForm({ ...generalForm, carrera: e.target.value })}
                        className="w-full px-3.5 py-2.5 sm:px-4 sm:py-3 bg-surface-container-low border border-slate-250 rounded-xl font-bold text-xs text-slate-705 outline-academic-500 focus:bg-surface transition-all shadow-inner appearance-none cursor-pointer"
                      >
                        {programsList.map(pName => (
                          <option key={pName} value={pName}>{pName}</option>
                        ))}
                      </select>
                      
                      <div className="mt-2.5 flex items-center justify-between px-4 py-2 bg-indigo-50/40 border border-indigo-100 rounded-xl">
                        <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-wide">
                          Oferta Metodológica: <span className={cn(
                            "px-2 py-0.5 rounded text-[9px] font-black uppercase inline-block ml-1.5",
                            selectedProgramTipo === 'Técnico' ? "bg-indigo-100 text-indigo-750 border border-indigo-200" : "bg-primary-container text-teal-750 border border-primary-container"
                          )}>{selectedProgramTipo}</span>
                        </span>
                        <span className="text-[9.5px] font-bold text-on-surface-variant">
                          {selectedProgramTipo === 'Técnico' ? "⏱️ Horas Académicas = 45 min (auto-conv: horas reloj x0.75)" : "⏱️ Horas Reloj = Horas Académicas (60 min)"}
                        </span>
                      </div>
                    </div>

                    {/* Hours and counts */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                      <div>
                        <label className="text-[9px] font-black text-on-surface-variant uppercase tracking-tight block mb-1 sm:mb-1.5">Horas Académicas *</label>
                        <input 
                          type="number" 
                          min="0"
                          value={generalForm.totalHoraAcademic === 0 ? '' : generalForm.totalHoraAcademic}
                          onChange={(e) => setGeneralForm({ ...generalForm, totalHoraAcademic: Math.max(0, parseInt(e.target.value) || 0) })}
                          className="w-full px-3.5 py-2.5 sm:py-3 bg-surface-container-low border border-slate-250 rounded-xl font-black text-xs text-slate-705 outline-academic-500 focus:bg-surface transition-all shadow-inner text-left sm:text-center"
                          placeholder="Ej: 120"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-black text-on-surface-variant uppercase tracking-tight block mb-1 sm:mb-1.5">Horas Reloj *</label>
                        <input 
                          type="number" 
                          min="0"
                          value={generalForm.totalHoraReloj === 0 ? '' : generalForm.totalHoraReloj}
                          onChange={(e) => setGeneralForm({ ...generalForm, totalHoraReloj: Math.max(0, parseInt(e.target.value) || 0) })}
                          className="w-full px-3.5 py-2.5 sm:py-3 bg-surface-container-low border border-slate-250 rounded-xl font-black text-xs text-slate-705 outline-academic-500 focus:bg-surface transition-all shadow-inner text-left sm:text-center"
                          placeholder="Ej: 100"
                        />
                      </div>
                      <div>
                        <label className="text-[8px] md:text-[9px] font-black text-on-surface-variant uppercase tracking-tight block mb-1 sm:mb-1.5" title="Se auto-calculará según las unidades agregadas">Límite Unidades</label>
                        <input 
                          type="number" 
                          min="0"
                          value={tempUnits.length > 0 ? tempUnits.length : (generalForm.cantidadUnidades === 0 ? '' : generalForm.cantidadUnidades)}
                          disabled={tempUnits.length > 0}
                          onChange={(e) => setGeneralForm({ ...generalForm, cantidadUnidades: Math.max(0, parseInt(e.target.value) || 0) })}
                          title={tempUnits.length > 0 ? "Se auto-calcula con el listado del paso 2" : ""}
                          className={cn(
                            "w-full px-3.5 py-2.5 sm:py-3 bg-surface-container-low border border-slate-250 rounded-xl font-black text-xs text-on-surface outline-academic-500 text-left sm:text-center",
                            tempUnits.length > 0 ? "opacity-75 bg-surface-container-high cursor-not-allowed" : "focus:bg-surface shadow-inner"
                          )}
                          placeholder="Ej: 3"
                        />
                      </div>
                    </div>

                    <div className="p-3.5 sm:p-4 bg-academic-50 border border-academic-100 rounded-xl sm:rounded-2xl flex items-start gap-2.5 sm:gap-3 mt-3.5 sm:mt-4">
                      <GraduationCap className="text-academic-500 mt-0.5 shrink-0" size={16} />
                      <div className="text-[10px] sm:text-[11px] leading-relaxed text-academic-800 font-semibold">
                        <span className="font-extrabold block">Recomendación de Horas Formativas:</span>
                        Defina de forma estimada las horas del módulo académico. Al pasar al siguiente paso, podrá registrar de forma detallada cada unidad didáctica y su ponderación porcentual del módulo.
                      </div>
                    </div>

                    {/* Didactic Planning Upload Area (With Click and Drag-Drop capability) */}
                    <div className="space-y-2 mt-4 bg-surface-container-low/50 p-4 border border-slate-150 rounded-2xl">
                      <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-wider block">Planeación Didáctica del Módulo</label>
                      
                      <div
                        onDragEnter={handleDrag}
                        onDragOver={handleDrag}
                        onDragLeave={handleDrag}
                        onDrop={handleDrop}
                        onClick={triggerFileSelect}
                        className={cn(
                          "border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5",
                          dragActive 
                            ? "border-academic-500 bg-academic-50/50" 
                            : "border-slate-250 hover:border-academic-500 hover:bg-surface-container-low bg-surface"
                        )}
                      >
                        <input 
                          ref={fileInputRef}
                          type="file" 
                          className="hidden" 
                          accept=".pdf,.doc,.docx,.xls,.xlsx"
                          onChange={handleFileChange}
                        />
                        
                        <UploadCloud size={24} className="text-on-surface-variant shrink-0" />
                        
                        <div className="text-[10px] font-black uppercase text-slate-650 tracking-wide">
                          Cargar Planeación Didáctica
                        </div>
                        <p className="text-[9px] text-on-surface-variant font-bold leading-normal">
                          Suelte su archivo PDF, Word o Excel aquí, o haga clic para seleccionar
                        </p>
                      </div>

                      {/* Active Planning File Tag displaying uploaded file name */}
                      {generalForm.planningFileName && (
                        <div className="mt-2.5 flex items-center justify-between p-2.5 rounded-xl bg-surface border border-slate-150 shadow-inner">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <FileText className="text-academic-500 shrink-0" size={15} />
                            <span className="text-[10.5px] font-black text-on-surface truncate block">
                              {generalForm.planningFileName}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setGeneralForm(prev => ({ ...prev, planningFileName: '' }));
                            }}
                            className="p-1 hover:bg-slate-105 rounded text-error hover:text-error shrink-0"
                            title="Remover planeación"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Step Navigation Button container */}
                    <div className="flex justify-end pt-4 sm:pt-6 border-t border-outline-variant mt-5 sm:mt-6">
                      <button
                        type="button"
                        onClick={goToStep2}
                        className="flex items-center gap-1.5 px-4 py-2.5 sm:px-5 sm:py-3 bg-primary hover:bg-primary/90 text-on-primary rounded-xl font-black text-[9px] sm:text-[10px] uppercase tracking-widest transition-all"
                      >
                        Continuar
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>
                )}


                {/* STEP 2: DIDACTIC UNITS OF MODULE */}
                {currentStep === 2 && (
                  <div className="space-y-6 py-2 animate-in fade-in slide-in-from-right duration-200">
                    
                    <div className="grid lg:grid-cols-12 gap-6 items-start">
                      
                      {/* Left Side: Create / Edit Unit Form block. (5 Columns) */}
                      <div className="lg:col-span-5 bg-surface-container-low/70 border border-slate-150 rounded-xl sm:rounded-2xl p-4 sm:p-5 space-y-3.5 sm:space-y-4">
                        <h4 className="text-xs font-black text-on-surface uppercase tracking-wider flex items-center gap-1.5">
                          {editingUnitIndex !== null ? 'Modificar Unidad' : 'Registrar Unidad Didáctica'}
                        </h4>

                        <div className="space-y-3 sm:space-y-3.5">
                          {/* Unit Code */}
                          <div>
                            <label className="text-[9px] font-black text-on-surface-variant uppercase tracking-tight block mb-1">Código de Unidad *</label>
                            <input 
                              type="text" 
                              placeholder="Ej: UN-01"
                              value={unitForm.codUnit}
                              onChange={(e) => setUnitForm({ ...unitForm, codUnit: e.target.value })}
                              className="w-full px-3 py-2 sm:py-2.5 bg-surface border border-slate-205 rounded-xl font-bold text-[11px] text-slate-705 outline-academic-500 transition-all shadow-inner"
                            />
                          </div>

                          {/* Unit Name */}
                          <div>
                            <label className="text-[9px] font-black text-on-surface-variant uppercase tracking-tight block mb-1">Nombre de la Unidad *</label>
                            <input 
                              type="text" 
                              placeholder="Ej: Modelado Físico y SQL"
                              value={unitForm.nombre}
                              onChange={(e) => setUnitForm({ ...unitForm, nombre: e.target.value })}
                              className="w-full px-3 py-2 sm:py-2.5 bg-surface border border-slate-205 rounded-xl font-bold text-[11px] text-slate-705 outline-academic-500 transition-all shadow-inner"
                            />
                          </div>

                          {/* Hours & Ponderacion Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-2">
                            <div>
                              <label className="text-[8px] font-black text-on-surface-variant uppercase block mb-1">Hora Acad.</label>
                              <input 
                                type="number" 
                                min="0"
                                value={unitForm.totalHoraAcademic === 0 ? '' : unitForm.totalHoraAcademic}
                                onChange={(e) => setUnitForm({ ...unitForm, totalHoraAcademic: Math.max(0, parseInt(e.target.value) || 0) })}
                                className="w-full px-2 py-2 bg-surface border border-slate-205 rounded-xl font-black text-[11px] text-slate-705 text-left sm:text-center outline-academic-500 shadow-inner"
                              />
                            </div>
                            <div>
                              <label className="text-[8px] font-black text-on-surface-variant uppercase block mb-1">Hora Reloj</label>
                              <input 
                                type="number" 
                                min="0"
                                value={unitForm.totalHoraReloj === 0 ? '' : unitForm.totalHoraReloj}
                                onChange={(e) => setUnitForm({ ...unitForm, totalHoraReloj: Math.max(0, parseInt(e.target.value) || 0) })}
                                className="w-full px-2 py-2 bg-surface border border-slate-205 rounded-xl font-black text-[11px] text-slate-705 text-left sm:text-center outline-academic-500 shadow-inner"
                              />
                            </div>
                            <div>
                              <label className="text-[8px] font-black text-on-surface-variant uppercase block mb-1" title="Porcentaje que representa de la nota completa">Ponderación (%)</label>
                              <input 
                                type="number" 
                                min="0"
                                max="100"
                                value={unitForm.ponderacion === 0 ? '' : unitForm.ponderacion}
                                onChange={(e) => setUnitForm({ ...unitForm, ponderacion: Math.max(0, Math.min(100, parseInt(e.target.value) || 0)) })}
                                className="w-full px-2 py-2 bg-surface border border-slate-205 rounded-xl font-black text-[11px] text-slate-705 text-left sm:text-center outline-academic-500 shadow-inner"
                              />
                            </div>
                          </div>

                          <div className="flex gap-2 pt-1">
                            {editingUnitIndex !== null && (
                              <button
                                type="button"
                                onClick={resetUnitSubForm}
                                className="px-2.5 py-2 bg-surface hover:bg-surface-container-high text-on-surface-variant border border-slate-205 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-sm"
                              >
                                Cancelar
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={handleAddOrUpdateUnit}
                              className="flex-1 py-2 bg-primary hover:bg-primary/90 text-on-primary rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-md shadow-academic-600/10 flex items-center justify-center gap-1.5"
                            >
                              <Check size={12} />
                              {editingUnitIndex !== null ? 'Guardar Cambios' : 'Agregar a Lista'}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Right Side: Added Didactic Units Live list. (7 Columns) */}
                      <div className="lg:col-span-7 space-y-3.5 sm:space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-outline-variant pb-2">
                          <h4 className="text-xs font-black text-on-surface uppercase tracking-tight flex items-center gap-1.5">
                            Unidades Definidas ({tempUnits.length})
                          </h4>
                          
                          {/* Warning Indicators if hours/ponderacion do not balance compared to step 1 */}
                          <div className="flex flex-wrap gap-1.5 sm:gap-2 text-[9px] font-bold">
                            <span className={cn(
                              "px-2 py-0.5 rounded-lg border",
                              totalTempPonderacion === 100 
                                ? "bg-primary-container border-emerald-100 text-emerald-800"
                                : "bg-tertiary-container border-amber-100 text-amber-800"
                            )} title="Suma de ponderaciones de las unidades">
                              Pond: {totalTempPonderacion}%
                            </span>
                            
                            <span className={cn(
                              "px-2 py-0.5 rounded-lg border",
                              totalTempHoursAcademic === generalForm.totalHoraAcademic
                                ? "bg-primary-container border-emerald-100 text-emerald-800"
                                : "bg-tertiary-container border-amber-100 text-amber-800"
                            )} title="Horas académicas de las unidades vs. módulo total">
                              H. Acad: {totalTempHoursAcademic}/{generalForm.totalHoraAcademic}h
                            </span>
                          </div>
                        </div>

                        {/* Warnings banner */}
                        {(totalTempPonderacion !== 100 || totalTempHoursAcademic !== generalForm.totalHoraAcademic) && tempUnits.length > 0 && (
                          <div className="p-2.5 sm:p-3 bg-tertiary-container rounded-xl sm:rounded-2xl border border-amber-150 flex items-start gap-2 sm:gap-2.5">
                            <AlertTriangle className="text-tertiary shrink-0 mt-0.5" size={14} />
                            <div className="text-[10px] text-amber-800 leading-normal font-semibold">
                              {totalTempPonderacion !== 100 && (
                                <p>• Las ponderaciones suman <strong className="font-extrabold">{totalTempPonderacion}%</strong>. Recomendamos completar exactamente el <span className="underline">100%</span>.</p>
                              )}
                              {totalTempHoursAcademic !== generalForm.totalHoraAcademic && (
                                <p>• Las unidades suman <strong className="font-extrabold">{totalTempHoursAcademic}h Acad.</strong> mientras que el módulo general indica <strong className="font-extrabold">{generalForm.totalHoraAcademic}h</strong>.</p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* List items scroll container */}
                        <div className="space-y-2.5 max-h-[280px] sm:max-h-[360px] overflow-y-auto pr-1">
                          {tempUnits.length === 0 ? (
                            <div className="border border-dashed border-outline-variant rounded-2xl sm:rounded-3xl p-8 sm:p-10 text-center space-y-2 text-on-surface-variant bg-surface-container-low/20">
                              <Layers size={28} className="mx-auto text-outline-variant" />
                              <p className="text-[10px] font-black uppercase tracking-tight">No se han agregado unidades</p>
                              <p className="text-[9px] font-semibold text-on-surface-variant leading-relaxed max-w-xs mx-auto">
                                Formule una unidad a la izquierda y presione "Agregar a Lista" para comenzar.
                              </p>
                            </div>
                          ) : (
                            tempUnits.map((u, index) => (
                              <div 
                                key={u.codUnit + '-' + index}
                                className={cn(
                                  "border rounded-xl sm:rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface hover:border-slate-350 transition-all shadow-sm",
                                  editingUnitIndex === index && "ring-2 ring-academic-500 border-academic-500 bg-academic-50/10"
                                )}
                              >
                                <div className="space-y-1 min-w-0 flex-1 text-left">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-[8px] font-mono font-bold bg-surface-container-high border border-outline-variant text-on-surface-variant px-1.5 py-0.5 rounded uppercase">
                                      {u.codUnit}
                                    </span>
                                    <span className="text-[9px] font-black text-academic-700 bg-academic-50 border border-academic-100 px-1.5 py-0.5 rounded">
                                      Ponderación: {u.ponderacion}%
                                    </span>
                                  </div>
                                  <h5 className="text-[11px] font-black text-on-surface leading-tight uppercase tracking-tight mt-1 truncate">
                                    {u.nombre}
                                  </h5>
                                  <div className="flex gap-3 text-[9px] text-slate-450 font-bold pt-0.5">
                                    <span>{u.totalHoraAcademic}h Académica</span>
                                    <span>{u.totalHoraReloj}h Reloj</span>
                                  </div>
                                  
                                  {u.planningFileName && (
                                    <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-primary-container border border-emerald-100 text-[8px] text-emerald-800 font-extrabold mt-1">
                                      <FileCheck size={10} className="text-emerald-500" />
                                      <span className="max-w-[150px] truncate">{u.planningFileName}</span>
                                    </div>
                                  )}
                                </div>

                                <div className="flex sm:flex-col items-center gap-1.5 shrink-0 self-start sm:self-auto pt-2 sm:pt-0 w-full sm:w-auto justify-end border-t border-outline-variant sm:border-0">
                                  <button
                                    type="button"
                                    onClick={() => handleEditTempUnit(index)}
                                    className="p-1.5 sm:p-1.5 text-on-surface-variant hover:text-academic-600 hover:bg-surface-container-low border border-outline-variant hover:border-outline-variant rounded-lg transition-all text-[9px] sm:text-[9px] font-bold flex items-center gap-1 shadow-sm bg-surface"
                                  >
                                    <Edit2 size={11} />
                                    <span>Editar</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteTempUnit(index)}
                                    className="p-1.5 sm:p-1.5 text-on-surface-variant hover:text-error hover:bg-error-container border border-outline-variant hover:border-error-container rounded-lg transition-all text-[9px] sm:text-[9px] font-bold flex items-center gap-1 shadow-sm bg-surface"
                                  >
                                    <Trash2 size={11} />
                                    <span>Borrar</span>
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Step Navigation Button container */}
                    <div className="flex items-center justify-between pt-4 sm:pt-6 border-t border-outline-variant mt-5 sm:mt-6">
                      <button
                        type="button"
                        onClick={goToStep1}
                        className="flex items-center gap-1.5 px-3.5 py-2.5 sm:px-5 sm:py-3 bg-surface-container-high hover:bg-slate-150 text-on-surface-variant rounded-xl font-black text-[9px] sm:text-[10px] uppercase tracking-widest transition-all border border-outline-variant shadow-sm"
                      >
                        <ArrowLeft size={13} />
                        Atrás
                      </button>

                      <button
                        type="button"
                        onClick={handleSaveWholeModule}
                        className="flex items-center gap-1.5 px-4 py-2.5 sm:px-6 sm:py-3 bg-primary hover:bg-primary/90 text-on-primary rounded-xl font-black text-[9px] sm:text-[10px] uppercase tracking-widest transition-all shadow-md shadow-academic-600/15"
                      >
                        <Check size={13} />
                        {isEditMode ? 'Finalizar Cambios' : 'Guardar Módulo Completo'}
                      </button>
                    </div>
                  </div>
                )}

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && moduleToDelete && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsDeleteModalOpen(false);
                setModuleToDelete(null);
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
                  ¿Eliminar Módulo?
                </h3>
                <p className="text-[11px] text-on-surface-variant leading-relaxed font-semibold">
                  ¿Está seguro de que desea eliminar permanentemente el módulo formativo <span className="text-on-surface font-extrabold">{moduleToDelete.nombre}</span>? Esta acción no se puede deshacer.
                </p>
              </div>
              <div className="flex gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setModuleToDelete(null);
                  }}
                  className="flex-1 py-2.5 bg-surface-container-low hover:bg-surface-container-high text-on-surface-variant border border-outline-variant rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-sm"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleDeleteModule}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-md shadow-rose-600/10"
                >
                  Confirmar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating System Alerts / Toasts */}
      <div className="fixed bottom-5 right-5 z-[80] flex flex-col gap-2.5 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 15, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.12 } }}
              className={cn(
                "p-3 rounded-xl shadow-xl border text-[10px] font-black uppercase tracking-tight flex items-center gap-2 pointer-events-auto shadow-slate-900/5",
                t.type === 'success' ? "bg-surface border-emerald-250 text-emerald-800 shadow-[0_4px_16px_rgba(16,185,129,0.06)]" :
                t.type === 'danger' ? "bg-surface border-rose-250 text-rose-800 shadow-[0_4px_16px_rgba(244,63,94,0.06)]" :
                "bg-surface border-academic-250 text-academic-700 shadow-[0_4px_16px_rgba(0,0,0,0.04)]"
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

export default Modules;

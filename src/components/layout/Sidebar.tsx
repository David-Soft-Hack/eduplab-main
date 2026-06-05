import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  Settings, 
  LogOut,
  GraduationCap,
  Award,
  Bell,
  FileSpreadsheet,
  ClipboardList,
  CalendarCheck
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAppContext } from '../../context/AppContext';
import { notificacionesNoLeidas } from '../../lib/notificacionEngine';

const Sidebar: React.FC = () => {
  const { notifications } = useAppContext();
  const unreadCount = notificacionesNoLeidas(notifications);

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: BookOpen, label: 'Módulos', path: '/modules' },
    { icon: Award, label: 'Programas', path: '/programs' },
    { icon: ClipboardList, label: 'Memorándum', path: '/memorandum' },
    { icon: CalendarCheck, label: 'Dosificación', path: '/dosificacion' },
    { icon: Bell, label: 'Alertas', path: '/alertas', badge: unreadCount },
    { icon: FileSpreadsheet, label: 'Informes', path: '/informes' },
  ];

  return (
    <div className="hidden md:flex flex-col w-64 bg-metodologico-900 border-r border-slate-800 fixed h-full z-10 transition-all duration-300">
      <div className="p-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-600 rounded-xl shadow-lg shadow-teal-600/20">
            <GraduationCap className="text-white" size={24} />
          </div>
          <span className="text-xl font-bold font-display text-white">EduPlan</span>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1 mt-4">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-slate-400 font-medium",
              isActive 
                ? "bg-teal-600/20 text-teal-400 shadow-sm border border-teal-600/10" 
                : "hover:bg-slate-800 hover:text-slate-200"
            )}
          >
            <item.icon size={20} className={cn("transition-colors shrink-0")} />
            <span className="flex-1">{item.label}</span>
            {item.badge !== undefined && item.badge > 0 && (
              <span className="px-1.5 py-0.5 bg-red-500 text-white text-[8px] font-black rounded-full min-w-[18px] text-center leading-none">
                {item.badge > 99 ? '99+' : item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 mt-auto border-t border-slate-800 space-y-4">
        <div className="px-2 py-3">
          <div className="bg-slate-800 rounded-2xl p-3 flex items-center gap-3 border border-slate-700">
            <div className="w-10 h-10 rounded-xl bg-teal-600/20 flex items-center justify-center font-black text-teal-400 shadow-sm border border-teal-600/20">
              MT
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-slate-200 truncate">Metodólogo</p>
              <p className="text-[10px] font-bold text-slate-500 truncate uppercase tracking-tighter">Coordinador</p>
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <button className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-slate-500 hover:bg-slate-800 hover:text-slate-300 transition-all font-bold text-xs uppercase tracking-widest">
            <Settings size={18} />
            <span>Ajustes</span>
          </button>
          <button className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-400 hover:bg-red-900/20 transition-all font-bold text-xs uppercase tracking-widest">
            <LogOut size={18} />
            <span>Salir</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

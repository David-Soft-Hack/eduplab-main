import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BookOpen, FileText, Award, ClipboardList, Bell, FileSpreadsheet, CalendarCheck } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAppContext } from '../../context/AppContext';
import { notificacionesNoLeidas } from '../../lib/notificacionEngine';

const MobileNav: React.FC = () => {
  const { notifications } = useAppContext();
  const unreadCount = notificacionesNoLeidas(notifications);

  const navItems = [
    { icon: LayoutDashboard, label: 'Inicio', path: '/' },
    { icon: CalendarCheck, label: 'Dosificar', path: '/dosificacion' },
    { icon: Bell, label: 'Alertas', path: '/alertas', badge: unreadCount },
    { icon: ClipboardList, label: 'Memorándum', path: '/memorandum' },
    { icon: FileSpreadsheet, label: 'Informes', path: '/informes' },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-metodologico-900/95 backdrop-blur-xl border-t border-slate-800 px-1 py-1.5 z-40 grid grid-cols-5 justify-items-center items-center shadow-lg safe-bottom">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) => cn(
            "flex flex-col items-center gap-1 transition-all duration-300 w-full text-center py-1 relative",
            isActive ? "text-teal-400 scale-105" : "text-slate-500 hover:text-slate-300"
          )}
        >
          <div className={cn("p-1 rounded-lg transition-all duration-300", "active:scale-95 relative")}>
            <item.icon size={18} strokeWidth={2.4} />
            {item.badge !== undefined && item.badge > 0 && (
              <span className="absolute -top-1 -right-1 px-1 py-0.5 bg-red-500 text-white text-[7px] font-black rounded-full min-w-[14px] text-center leading-none">
                {item.badge > 9 ? '9+' : item.badge}
              </span>
            )}
          </div>
          <span className="text-[7px] font-black uppercase tracking-wider block truncate w-full">{item.label}</span>
        </NavLink>
      ))}
    </div>
  );
};

export default MobileNav;

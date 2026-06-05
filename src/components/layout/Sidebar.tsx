import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Award, ClipboardList, CalendarCheck, Bell, FileSpreadsheet, GraduationCap, Users } from 'lucide-react';
import { NavigationRail } from '../ui/NavigationRail';
import { useAppContext } from '../../context/AppContext';
import { notificacionesNoLeidas } from '../../lib/notificacionEngine';

const iconSize = 20;

const navItems = [
  { key: '/', label: 'Dashboard', icon: <LayoutDashboard size={iconSize} /> },
  { key: '/modules', label: 'Módulos', icon: <BookOpen size={iconSize} /> },
  { key: '/programs', label: 'Programas', icon: <Award size={iconSize} /> },
  { key: '/docentes', label: 'Docentes', icon: <Users size={iconSize} /> },
  { key: '/memorandum', label: 'Memorándum', icon: <ClipboardList size={iconSize} /> },
  { key: '/dosificacion', label: 'Dosificación', icon: <CalendarCheck size={iconSize} /> },
  { key: '/alertas', label: 'Alertas', icon: <Bell size={iconSize} /> },
  { key: '/informes', label: 'Informes', icon: <FileSpreadsheet size={iconSize} /> },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { notifications } = useAppContext();
  const unreadCount = notificacionesNoLeidas(notifications);

  const itemsWithBadges = navItems.map(item => ({
    ...item,
    badge: item.key === '/alertas' ? unreadCount : undefined,
  }));

  const header = (
    <div className="flex flex-col items-center gap-1 px-2 py-4">
      <div className="p-2 bg-primary rounded-xl shadow-lg">
        <GraduationCap size={22} className="text-on-primary" />
      </div>
      <span className="text-[10px] font-bold text-on-surface-variant font-display tracking-tight">EduPlan</span>
    </div>
  );

  return (
    <NavigationRail
      items={itemsWithBadges}
      value={location.pathname}
      onChange={key => navigate(key)}
      header={header}
    />
  );
}

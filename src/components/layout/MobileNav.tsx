import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, CalendarCheck, Bell, ClipboardList, FileSpreadsheet, Users } from 'lucide-react';
import { NavigationBar } from '../ui/NavigationBar';
import { useAppContext } from '../../context/AppContext';
import { notificacionesNoLeidas } from '../../lib/notificacionEngine';

const iconSize = 22;

export default function MobileNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { notifications } = useAppContext();
  const unreadCount = notificacionesNoLeidas(notifications);

  const items = [
    { key: '/', label: 'Inicio', icon: <LayoutDashboard size={iconSize} /> },
    { key: '/docentes', label: 'Docentes', icon: <Users size={iconSize} /> },
    { key: '/dosificacion', label: 'Dosificar', icon: <CalendarCheck size={iconSize} /> },
    { key: '/alertas', label: 'Alertas', icon: <Bell size={iconSize} />, badge: unreadCount },
    { key: '/memorandum', label: 'Memorándum', icon: <ClipboardList size={iconSize} /> },
    { key: '/informes', label: 'Informes', icon: <FileSpreadsheet size={iconSize} /> },
  ];

  return (
    <div className="md:hidden">
      <NavigationBar
        items={items}
        value={location.pathname}
        onChange={key => navigate(key)}
      />
    </div>
  );
}

import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Calendar, Users, Settings, BookOpen } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const [pulsingTabs, setPulsingTabs] = React.useState<Record<string, boolean>>({});

  React.useEffect(() => {
    const handlePulse = (e: any) => {
      const tabPath = e.detail?.tabPath;
      if (tabPath) {
        setPulsingTabs((prev) => ({ ...prev, [tabPath]: true }));
        setTimeout(() => {
          setPulsingTabs((prev) => ({ ...prev, [tabPath]: false }));
        }, 7000);
      }
    };
    window.addEventListener('nexo_pulse_tab', handlePulse);
    return () => window.removeEventListener('nexo_pulse_tab', handlePulse);
  }, []);

  const navItems = [
    { to: '/app', label: 'Início', icon: <LayoutDashboard size={20} />, end: true },
    { to: '/app/students', label: 'Estudo', icon: <BookOpen size={20} /> },
    { to: '/app/calendar', label: 'Agenda', icon: <Calendar size={20} /> },
    { to: '/app/family', label: 'Família', icon: <Users size={20} /> },
    { to: '/app/settings', label: 'Perfil', icon: <Settings size={20} /> },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 h-20 px-2 flex items-center justify-around shadow-lg select-none">
      {navItems.map((item) => {
        const isPulsing = pulsingTabs[item.to];
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300 active:scale-95 relative ${
                isPulsing
                  ? 'text-emerald-600 dark:text-emerald-300 font-extrabold bg-emerald-500/20 animate-pulse ring-4 ring-emerald-500/50 scale-105 border-2 border-emerald-500'
                  : isActive
                  ? 'text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-950/60'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`
            }
          >
            <span className="shrink-0">{item.icon}</span>
            <span className="text-[10px] font-semibold mt-0.5 tracking-tight">{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};

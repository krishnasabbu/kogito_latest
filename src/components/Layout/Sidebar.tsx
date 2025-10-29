import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Workflow,
  Trophy,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  GitBranch
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
  const navItems = [
    { path: '/dashboard', label: 'Test Groups', icon: LayoutDashboard },
    { path: '/champion-challenge', label: 'Champion vs Challenge', icon: Trophy },
    { path: '/langgraph', label: 'LangGraph Builder', icon: GitBranch },
  ];

  return (
    <div className={`
      bg-white dark:bg-dark-surface border-r border-light-border dark:border-dark-border 
      transition-all duration-300 ease-in-out flex-shrink-0 flex flex-col
      ${isCollapsed ? 'w-16' : 'w-64'}
    `}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-light-border dark:border-dark-border min-h-[73px]">
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-wells-red to-wells-gold rounded-xl flex items-center justify-center shadow-card">
              <Workflow size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary font-wells">
                FlowForge
              </h1>
              <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary font-medium">Workflow Platform</p>
            </div>
          </div>
        )}
        
        {isCollapsed && (
          <div className="w-10 h-10 bg-gradient-to-r from-wells-red to-wells-gold rounded-xl flex items-center justify-center shadow-card mx-auto">
            <Workflow size={24} className="text-white" />
          </div>
        )}
        
        {/* Toggle Button */}
        <button
          onClick={onToggle}
          className="p-2 hover:bg-light-hover dark:hover:bg-dark-hover rounded-lg transition-all duration-200"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight size={16} className="text-light-text-secondary dark:text-dark-text-secondary" />
          ) : (
            <ChevronLeft size={16} className="text-light-text-secondary dark:text-dark-text-secondary" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map(({ path, label, icon: Icon }) => (
            <li key={path}>
              <NavLink
                to={path}
                className={({ isActive }) =>
                  `nav-item group ${
                    isActive
                      ? 'nav-item-active'
                      : ''
                  }`
                }
                title={isCollapsed ? label : undefined}
              >
                <Icon size={20} className="flex-shrink-0" />
                {!isCollapsed && (
                  <span className="font-medium truncate transition-all duration-200">{label}</span>
                )}
                
                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="absolute left-16 bg-light-surface dark:bg-dark-surface-alt text-light-text-primary dark:text-dark-text-primary text-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50 shadow-card">
                    {label}
                  </div>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-light-border dark:border-dark-border">
          <div className="text-xs text-light-text-secondary dark:text-dark-text-secondary text-center p-3 bg-light-surface dark:bg-dark-surface-alt rounded-xl font-medium border border-light-border dark:border-dark-border">
            FlowForge Platform v1.0.0
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
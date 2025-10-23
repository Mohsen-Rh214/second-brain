import React from 'react';
import { View } from '../types';
import { BrainCircuitIcon, AreaIcon, ProjectIcon, ResourceIcon, ArchiveIcon, SearchIcon, GitMergeIcon, ClipboardCheckIcon, HomeIcon } from './icons';

interface SidebarProps {
  currentView: View;
  onNavigate: (view: View) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  inboxCount: number;
}

const navItems: { view: View; label: string; icon: React.ReactElement }[] = [
  { view: 'dashboard', label: 'Home', icon: <HomeIcon className="w-5 h-5" /> },
  { view: 'review', label: 'Review', icon: <ClipboardCheckIcon className="w-5 h-5" /> },
];

const libraryItems: { view: View; label: string; icon: React.ReactElement }[] = [
  { view: 'areas', label: 'Areas', icon: <AreaIcon className="w-5 h-5" /> },
  { view: 'projects', label: 'Projects', icon: <ProjectIcon className="w-5 h-5" /> },
  { view: 'resources', label: 'Resources', icon: <ResourceIcon className="w-5 h-5" /> },
  { view: 'archives', label: 'Archives', icon: <ArchiveIcon className="w-5 h-5" /> },
  { view: 'graph', label: 'Graph', icon: <GitMergeIcon className="w-5 h-5" /> },
];

const NavItem: React.FC<{
    isActive: boolean;
    onClick: () => void;
    icon: React.ReactElement;
    label: string;
    badgeCount?: number;
}> = ({ isActive, onClick, icon, label, badgeCount }) => (
    <li>
        <button
            onClick={onClick}
            className={`w-full flex items-center justify-between p-2.5 rounded-lg transition-all duration-200 text-sm font-medium ${
                isActive 
                ? 'bg-accent/10 text-accent shadow-sm' 
                : 'text-text-secondary hover:bg-neutral hover:text-text-primary'
            }`}
        >
            <div className="flex items-center gap-3">
                {icon}
                <span>{label}</span>
            </div>
            {badgeCount && badgeCount > 0 ? (
                <span className={`px-2 py-0.5 text-xs rounded-full ${
                    isActive ? 'bg-accent text-accent-content' : 'bg-neutral-hover text-secondary-content'
                }`}>
                    {badgeCount}
                </span>
            ) : null}
        </button>
    </li>
);

const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, searchQuery, onSearchChange, inboxCount }) => {
    return (
        <aside className="w-64 h-[calc(100vh-2rem)] m-4 flex-shrink-0 flex flex-col bg-surface/80 backdrop-blur-xl border border-outline rounded-xl shadow-md">
            <header className="flex items-center gap-2 p-4 border-b border-outline-dark">
                <BrainCircuitIcon className="w-7 h-7 text-accent" />
                <h1 className="text-xl font-bold font-heading text-text-primary">Second Brain</h1>
            </header>

            <div className="p-4 border-b border-outline-dark">
              <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                  <input
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => onSearchChange(e.target.value)}
                      className="w-full bg-background/50 border border-outline rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                  />
              </div>
            </div>
            
            <nav className="flex-1 flex flex-col gap-6 overflow-y-auto custom-scrollbar p-4">
                <div>
                    <h2 className="px-2 mb-2 text-xs font-semibold text-text-tertiary uppercase tracking-wider">Menu</h2>
                    <ul className="space-y-1">
                        {navItems.map(item => (
                            <NavItem
                                key={item.view}
                                isActive={currentView === item.view}
                                onClick={() => onNavigate(item.view)}
                                icon={item.icon}
                                label={item.label}
                                badgeCount={item.view === 'dashboard' ? inboxCount : undefined}
                            />
                        ))}
                    </ul>
                </div>
                 <div>
                    <h2 className="px-2 mb-2 text-xs font-semibold text-text-tertiary uppercase tracking-wider">Library</h2>
                    <ul className="space-y-1">
                        {libraryItems.map(item => (
                            <NavItem
                                key={item.view}
                                isActive={currentView === item.view}
                                onClick={() => onNavigate(item.view)}
                                icon={item.icon}
                                label={item.label}
                            />
                        ))}
                    </ul>
                </div>
            </nav>
        </aside>
    );
};

export default Sidebar;
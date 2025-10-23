
import React from 'react';
import { View } from '../types';
import { BrainCircuitIcon, DashboardIcon, AreaIcon, ProjectIcon, ResourceIcon, ArchiveIcon, SearchIcon, InboxIcon, ListTodoIcon, GitMergeIcon, ClipboardCheckIcon } from './icons';

interface SidebarProps {
  currentView: View;
  onNavigate: (view: View) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  inboxCount: number;
}

const navItems: { view: View; label: string; icon: React.ReactElement }[] = [
  { view: 'dashboard', label: 'Dashboard', icon: <DashboardIcon className="w-5 h-5" /> },
  { view: 'inbox', label: 'Inbox', icon: <InboxIcon className="w-5 h-5" /> },
  { view: 'tasks', label: 'Tasks', icon: <ListTodoIcon className="w-5 h-5" /> },
  { view: 'review', label: 'Review', icon: <ClipboardCheckIcon className="w-5 h-5" /> },
  { view: 'areas', label: 'Areas', icon: <AreaIcon className="w-5 h-5" /> },
  { view: 'projects', label: 'Projects', icon: <ProjectIcon className="w-5 h-5" /> },
  { view: 'resources', label: 'Resources', icon: <ResourceIcon className="w-5 h-5" /> },
  { view: 'graph', label: 'Graph', icon: <GitMergeIcon className="w-5 h-5" /> },
  { view: 'archives', label: 'Archives', icon: <ArchiveIcon className="w-5 h-5" /> },
];

const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, searchQuery, onSearchChange, inboxCount }) => {
  return (
    <aside className="w-64 bg-slate-950/70 border-r border-slate-800 flex flex-col p-4 flex-shrink-0">
      <div className="flex items-center gap-2 mb-8">
        <BrainCircuitIcon className="w-8 h-8 text-emerald-400" />
        <h1 className="text-xl font-bold text-slate-100">Second Brain</h1>
      </div>

      <div className="relative mb-4">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <label htmlFor="global-search" className="sr-only">Search</label>
          <input
              id="global-search"
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-md pl-10 pr-4 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
      </div>

      <nav className="flex-grow">
        <ul>
          {navItems.map(({ view, label, icon }) => {
            const isActive = currentView === view && !searchQuery;
            const isInbox = view === 'inbox';
            return (
              <li key={view} className="mb-1">
                <button
                  onClick={() => onNavigate(view)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`w-full flex items-center justify-between gap-3 text-left px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
                    isActive
                      ? 'bg-slate-700 text-slate-100'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {icon}
                    <span>{label}</span>
                  </div>
                  {isInbox && inboxCount > 0 && (
                    <span className="bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        {inboxCount}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="text-xs text-slate-500 text-center mt-4">
        <p>Your digital mind, organized.</p>
      </div>
    </aside>
  );
};

export default Sidebar;

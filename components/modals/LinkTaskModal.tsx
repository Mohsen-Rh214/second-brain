import React, { useState } from 'react';
import { Task, Project } from '../../types';
import { XIcon, ProjectIcon, SearchIcon } from '../shared/icons';

interface LinkTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLink: (taskId: string, projectId: string) => void;
  taskToLink: Task;
  projects: Project[];
}

const LinkTaskModal: React.FC<LinkTaskModalProps> = ({ isOpen, onClose, onLink, taskToLink, projects }) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredProjects = projects.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleLink = (projectId: string) => {
    onLink(taskToLink.id, projectId);
  };

  if (!isOpen) return null;

  return (
    <div 
        className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center p-4 backdrop-blur-md"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="link-task-title"
    >
      <div 
        className="bg-surface/80 backdrop-blur-xl w-full max-w-lg max-h-[90vh] flex flex-col border border-outline rounded-xl shadow-lg"
        onClick={e => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-outline-dark flex-shrink-0">
          <h2 id="link-task-title" className="text-xl font-bold font-heading">Link Task to Project</h2>
          <button onClick={onClose} aria-label="Close" className="text-text-secondary hover:text-text-primary">
            <XIcon className="w-6 h-6" />
          </button>
        </header>
        
        <div className="p-6 flex-1 flex flex-col overflow-y-hidden">
          <p className="text-text-secondary mb-2">Linking task:</p>
          <p className="font-bold text-lg text-text-primary mb-4">{taskToLink.title}</p>

          <div className="relative mb-2">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
            <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects..."
                className="w-full bg-background/50 border border-outline rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          <ul className="flex-1 space-y-1 border border-outline-dark p-2 rounded-lg overflow-y-auto custom-scrollbar bg-background/30">
              {filteredProjects.length > 0 ? filteredProjects.map(project => (
                  <li key={project.id}>
                      <button 
                        onClick={() => handleLink(project.id)}
                        className="w-full text-left flex items-center gap-2 p-2 rounded-md hover:bg-neutral transition-colors"
                      >
                        <ProjectIcon className="w-4 h-4 text-text-secondary flex-shrink-0"/>
                        <span className="truncate">{project.title}</span>
                      </button>
                  </li>
              )) : (
                <li className="p-4 text-center text-sm text-text-tertiary">No projects found.</li>
              )}
          </ul>
        </div>
        <footer className="p-4 bg-black/5 border-t border-outline-dark mt-auto flex-shrink-0">
          <div className="flex justify-end">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium bg-secondary hover:bg-secondary-hover text-secondary-content transition-colors rounded-lg">Cancel</button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default React.memo(LinkTaskModal);
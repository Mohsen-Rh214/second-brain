import React, { useState, useEffect } from 'react';
import { InboxItem, Project, Area } from '../../types';
import { XIcon } from '../shared/icons';

interface OrganizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (itemId: string, parentIds: string[]) => void;
  item: InboxItem;
  projects: Project[];
  areas: Area[];
}

const OrganizeModal: React.FC<OrganizeModalProps> = ({ isOpen, onClose, onSave, item, projects, areas }) => {
  const [selectedParentIds, setSelectedParentIds] = useState<string[]>(item.parentIds || []);

  useEffect(() => {
    setSelectedParentIds(item.parentIds || []);
  }, [item]);

  const handleParentToggle = (parentId: string) => {
    setSelectedParentIds(prev =>
      prev.includes(parentId)
        ? prev.filter(id => id !== parentId)
        : [...prev, parentId]
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(item.id, selectedParentIds);
  };

  if (!isOpen) return null;

  const parentOptions = [
      ...areas.map(a => ({ id: a.id, title: a.title, type: 'Area' })),
      ...projects.map(p => ({ id: p.id, title: p.title, type: 'Project' })),
  ];

  return (
    <div 
        className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center p-4 backdrop-blur-md"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="organize-modal-title"
    >
      <div 
        className="bg-surface/80 backdrop-blur-xl w-full max-w-lg max-h-[90vh] flex flex-col border border-outline rounded-xl shadow-lg"
        onClick={e => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-outline-dark flex-shrink-0">
          <h2 id="organize-modal-title" className="text-xl font-bold font-heading">Organize Item</h2>
          <button onClick={onClose} aria-label="Close" className="text-text-secondary hover:text-text-primary">
            <XIcon className="w-6 h-6" />
          </button>
        </header>
        
        <form onSubmit={handleSave} className="flex-1 flex flex-col overflow-y-hidden">
          <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
              <p className="text-text-secondary mb-2">Assigning:</p>
              <p className="font-bold text-lg text-text-primary mb-4">{item.title}</p>

              <label className="block text-sm font-medium text-text-secondary mb-2">
                Select one or more Projects/Areas to link this item to:
              </label>

              <div className="space-y-2 border border-outline-dark p-2 rounded-lg max-h-64 overflow-y-auto custom-scrollbar bg-background/30">
                  {parentOptions.map(option => (
                      <div key={option.id} className="flex items-center p-1">
                          <input
                              type="checkbox"
                              id={`parent-${option.id}`}
                              checked={selectedParentIds.includes(option.id)}
                              onChange={() => handleParentToggle(option.id)}
                              className="h-4 w-4 rounded border-outline bg-surface text-accent focus:ring-accent"
                          />
                          <label htmlFor={`parent-${option.id}`} className="ml-3 block text-sm text-text-primary">
                              {option.title} <span className="text-xs text-text-tertiary">({option.type})</span>
                          </label>
                      </div>
                  ))}
              </div>
          </div>
          <footer className="p-4 bg-black/5 border-t border-outline-dark mt-auto flex-shrink-0">
              <div className="flex justify-end gap-3">
                  <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium bg-secondary hover:bg-secondary-hover text-secondary-content transition-colors rounded-lg">Cancel</button>
                  <button type="submit" className="px-4 py-2 text-sm font-medium bg-accent hover:bg-accent-hover text-accent-content transition-colors rounded-lg">Save Organization</button>
              </div>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default React.memo(OrganizeModal);
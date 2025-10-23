import React, { useState, useEffect } from 'react';
import { InboxItem, Project, Area } from '../types';
import { XIcon } from './icons';

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
        className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="organize-modal-title"
    >
      <div 
        className="bg-slate-800 rounded-lg shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-slate-700 flex-shrink-0">
          <h2 id="organize-modal-title" className="text-xl font-bold">Organize Item</h2>
          <button onClick={onClose} aria-label="Close" className="text-slate-400 hover:text-white">
            <XIcon className="w-6 h-6" />
          </button>
        </header>
        
        <form onSubmit={handleSave} className="flex-1 flex flex-col overflow-y-hidden">
          <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
              <p className="text-slate-400 mb-2">Assigning:</p>
              <p className="font-bold text-lg text-slate-100 mb-4">{item.title}</p>

              <label className="block text-sm font-medium text-slate-400 mb-2">
                Select one or more Projects/Areas to link this item to:
              </label>

              <div className="space-y-2 border border-slate-700 rounded-md p-2 max-h-64 overflow-y-auto custom-scrollbar">
                  {parentOptions.map(option => (
                      <div key={option.id} className="flex items-center">
                          <input
                              type="checkbox"
                              id={`parent-${option.id}`}
                              checked={selectedParentIds.includes(option.id)}
                              onChange={() => handleParentToggle(option.id)}
                              className="h-4 w-4 rounded border-slate-600 bg-slate-700 text-emerald-600 focus:ring-emerald-500"
                          />
                          <label htmlFor={`parent-${option.id}`} className="ml-3 block text-sm text-slate-300">
                              {option.title} <span className="text-xs text-slate-500">({option.type})</span>
                          </label>
                      </div>
                  ))}
              </div>
          </div>
          <footer className="p-4 bg-slate-900/50 border-t border-slate-700 mt-auto flex-shrink-0">
              <div className="flex justify-end gap-3">
                  <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-sm font-medium bg-slate-600 hover:bg-slate-500 text-white">Cancel</button>
                  <button type="submit" className="px-4 py-2 rounded-md text-sm font-medium bg-emerald-600 hover:bg-emerald-500 text-white">Save Organization</button>
              </div>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default OrganizeModal;

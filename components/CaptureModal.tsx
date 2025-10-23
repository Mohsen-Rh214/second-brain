

import React, { useState, useMemo, useEffect } from 'react';
import { Area, Project, Task } from '../types';
import { XIcon } from './icons';
import { ItemType, CaptureContext } from '../App';
import { NewItemPayload } from '../types';

interface CaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: NewItemPayload, itemType: ItemType, parentId: string | null) => void;
  projects: Project[];
  areas: Area[];
  context?: CaptureContext | null;
}

const itemTypesConfig: { id: ItemType; label: string }[] = [
  { id: 'note', label: 'Note' },
  { id: 'task', label: 'Task' },
  { id: 'resource', label: 'Resource' },
  { id: 'project', label: 'Project' },
];

const CaptureModal: React.FC<CaptureModalProps> = ({ isOpen, onClose, onSave, projects, areas, context }) => {
  const [activeType, setActiveType] = useState<ItemType>('note');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [description, setDescription] = useState('');
  const [parentId, setParentId] = useState<string | null>(null);
  const [priority, setPriority] = useState<Task['priority']>('Medium');
  const [dueDate, setDueDate] = useState('');


  useEffect(() => {
    if (context) {
        setActiveType(context.itemType || 'note');
        setParentId(context.parentId || null);
    } else {
        // Reset to default if no context
        setActiveType('note');
        setParentId(null);
    }
    // Reset fields when context changes or modal opens
    setTitle('');
    setContent('');
    setDescription('');
    setPriority('Medium');
    setDueDate('');
  }, [context, isOpen]);


  const parentOptions = useMemo(() => {
    const projectOpts = projects.map(p => ({ value: p.id, label: `Project: ${p.title}` }));
    const areaOpts = areas.map(a => ({ value: a.id, label: `Area: ${a.title}` }));
    return [...projectOpts, ...areaOpts];
  }, [projects, areas]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    if (activeType === 'task' && (!parentId || !projects.some(p => p.id === parentId))) {
        alert('A task must be linked to a project.');
        return;
    }
    if (activeType === 'project' && (!parentId || !areas.some(a => a.id === parentId))) {
        alert('A new project must be linked to an area.');
        return;
    }
    
    const newItem: NewItemPayload = { title, content, description, priority, dueDate };
    onSave(newItem, activeType, parentId);
  };

  if (!isOpen) return null;

  const getParentLabel = () => {
    if (activeType === 'task') return 'Link to Project';
    if (activeType === 'project') return 'Link to Area';
    return 'Link to Project or Area (Optional)';
  }

  const filteredParentOptions = useMemo(() => {
    if (activeType === 'task') {
        return parentOptions.filter(opt => opt.value.startsWith('proj-'));
    }
    if (activeType === 'project') {
        return parentOptions.filter(opt => opt.value.startsWith('area-'));
    }
    return parentOptions;
  }, [activeType, parentOptions]);

  return (
    <div 
        className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="capture-modal-title"
    >
      <div 
        className="bg-slate-800 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-slate-700 flex-shrink-0">
          <h2 id="capture-modal-title" className="text-xl font-bold">Quick Capture</h2>
          <button onClick={onClose} aria-label="Close" className="text-slate-400 hover:text-white">
            <XIcon className="w-6 h-6" />
          </button>
        </header>
        
        <form onSubmit={handleSave} className="flex-1 flex flex-col overflow-y-hidden">
          <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
              <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-400 mb-2">What are you capturing?</label>
                  <div className="flex flex-wrap gap-2">
                      {itemTypesConfig.map(({ id, label }) => (
                          <button
                              key={id}
                              type="button"
                              disabled={!!(context?.itemType)} // Disable if type is set by context
                              onClick={() => setActiveType(id)}
                              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeType === id ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'} ${context?.itemType ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                              {label}
                          </button>
                      ))}
                  </div>
              </div>
              <div className="mb-4">
                  <label htmlFor="item-title" className="sr-only">Title</label>
                  <input
                      id="item-title"
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter title..."
                      required
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-md px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
              </div>
              {activeType === 'project' && (
                <div className="mb-4">
                    <label htmlFor="item-description" className="sr-only">Description</label>
                    <textarea
                        id="item-description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        placeholder="Enter project description..."
                        className="w-full bg-slate-700/50 border border-slate-600 rounded-md px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 custom-scrollbar"
                    />
                </div>
              )}
              {(activeType === 'note' || activeType === 'resource') && (
                <div className="mb-4">
                    <label htmlFor="item-content" className="sr-only">Content</label>
                    <textarea
                        id="item-content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={5}
                        placeholder={ activeType === 'note' ? 'Write your note here...' : 'Enter URL, file path, or text...' }
                        className="w-full bg-slate-700/50 border border-slate-600 rounded-md px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 custom-scrollbar"
                    />
                </div>
              )}
               {activeType === 'task' && (
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                         <label htmlFor="task-priority" className="block text-sm font-medium text-slate-400 mb-2">Priority</label>
                         <select
                            id="task-priority"
                            value={priority}
                            onChange={(e) => setPriority(e.target.value as Task['priority'])}
                            className="w-full bg-slate-700/50 border border-slate-600 rounded-md px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                         >
                            <option>Low</option>
                            <option>Medium</option>
                            <option>High</option>
                         </select>
                    </div>
                     <div>
                         <label htmlFor="task-duedate" className="block text-sm font-medium text-slate-400 mb-2">Due Date</label>
                         <input
                            type="date"
                            id="task-duedate"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="w-full bg-slate-700/50 border border-slate-600 rounded-md px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                         />
                    </div>
                </div>
              )}
              <div>
                  <label htmlFor="item-parent" className="block text-sm font-medium text-slate-400 mb-2">
                    {getParentLabel()}
                  </label>
                  <select
                      id="item-parent"
                      value={parentId || ''}
                      disabled={!!context?.parentId} // Disable if parent is set by context
                      onChange={(e) => setParentId(e.target.value || null)}
                      className={`w-full bg-slate-700/50 border border-slate-600 rounded-md px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${context?.parentId ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                      <option value="">None</option>
                      {filteredParentOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                  </select>
              </div>
          </div>
          <footer className="p-4 bg-slate-900/50 border-t border-slate-700 mt-auto flex-shrink-0">
              <div className="flex justify-end gap-3">
                  <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-sm font-medium bg-slate-600 hover:bg-slate-500 text-white">Cancel</button>
                  <button type="submit" className="px-4 py-2 rounded-md text-sm font-medium bg-emerald-600 hover:bg-emerald-500 text-white">Save</button>
              </div>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default CaptureModal;

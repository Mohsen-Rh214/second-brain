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
  { id: 'task', label: 'Task' },
  { id: 'note', label: 'Note' },
  { id: 'resource', label: 'Resource' },
  { id: 'project', label: 'Project' },
  { id: 'area', label: 'Area' },
];

const CaptureModal: React.FC<CaptureModalProps> = ({ isOpen, onClose, onSave, projects, areas, context }) => {
  const [activeType, setActiveType] = useState<ItemType>('task');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [description, setDescription] = useState('');
  const [parentId, setParentId] = useState<string | null>(null);
  const [priority, setPriority] = useState<Task['priority']>('Medium');
  const [dueDate, setDueDate] = useState('');


  useEffect(() => {
    if (context) {
        setActiveType(context.itemType || 'task');
        setParentId(context.parentId || null);
    } else {
        // Reset to default if no context
        setActiveType('task');
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
    return [...areaOpts, ...projectOpts];
  }, [projects, areas]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    if (activeType === 'project' && (!parentId || !areas.some(a => a.id === parentId))) {
        alert('A new project must be linked to an area. If you need to create an area first, use the Command Bar (Ctrl+K).');
        return;
    }
    
    const newItem: NewItemPayload = { title, content, description, priority, dueDate };
    onSave(newItem, activeType, parentId);
  };

  if (!isOpen) return null;

  const getParentLabel = () => {
    if (activeType === 'task') return 'Link to Project (Optional)';
    if (activeType === 'project') return 'Link to Area';
    if (activeType === 'area') return ''; // No parent for area
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
        className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center p-4 backdrop-blur-md"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="capture-modal-title"
    >
      <div 
        className="bg-surface/80 backdrop-blur-xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-outline rounded-2xl shadow-lg"
        onClick={e => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-outline-dark flex-shrink-0">
          <h2 id="capture-modal-title" className="text-xl font-bold font-heading">New {activeType.charAt(0).toUpperCase() + activeType.slice(1)}</h2>
          <button onClick={onClose} aria-label="Close" className="text-text-secondary hover:text-text-primary">
            <XIcon className="w-6 h-6" />
          </button>
        </header>
        
        <form onSubmit={handleSave} className="flex-1 flex flex-col overflow-y-hidden">
          <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
              <div className="mb-4">
                  <label htmlFor="item-title" className="sr-only">Title</label>
                  <input
                      id="item-title"
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter title..."
                      required
                      className="w-full bg-background/50 border border-outline rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
                  />
              </div>
              {(activeType === 'project' || activeType === 'area') && (
                <div className="mb-4">
                    <label htmlFor="item-description" className="sr-only">Description</label>
                    <textarea
                        id="item-description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        placeholder={`Enter ${activeType} description...`}
                        className="w-full bg-background/50 border border-outline rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-1 focus:ring-accent custom-scrollbar"
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
                        className="w-full bg-background/50 border border-outline rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-1 focus:ring-accent custom-scrollbar"
                    />
                </div>
              )}
               {activeType === 'task' && (
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                         <label htmlFor="task-priority" className="block text-sm font-medium text-text-secondary mb-2">Priority</label>
                         <select
                            id="task-priority"
                            value={priority}
                            onChange={(e) => setPriority(e.target.value as Task['priority'])}
                            className="w-full bg-background/50 border border-outline rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
                         >
                            <option>Low</option>
                            <option>Medium</option>
                            <option>High</option>
                         </select>
                    </div>
                     <div>
                         <label htmlFor="task-duedate" className="block text-sm font-medium text-text-secondary mb-2">Due Date</label>
                         <input
                            type="date"
                            id="task-duedate"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="w-full bg-background/50 border border-outline rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
                         />
                    </div>
                </div>
              )}
              {getParentLabel() && (
                <div>
                    <label htmlFor="item-parent" className="block text-sm font-medium text-text-secondary mb-2">
                      {getParentLabel()}
                    </label>
                    <select
                        id="item-parent"
                        value={parentId || ''}
                        onChange={(e) => setParentId(e.target.value || null)}
                        className={`w-full bg-background/50 border border-outline rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-1 focus:ring-accent`}
                    >
                        <option value="">None</option>
                        {filteredParentOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
              )}
          </div>
          <footer className="p-4 bg-black/5 border-t border-outline-dark mt-auto flex-shrink-0">
              <div className="flex justify-end gap-3">
                  <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium bg-secondary hover:bg-secondary-hover text-secondary-content transition-colors rounded-lg">Cancel</button>
                  <button type="submit" className="px-4 py-2 text-sm font-medium bg-accent hover:bg-accent-hover text-accent-content transition-colors rounded-lg">Save</button>
              </div>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default CaptureModal;
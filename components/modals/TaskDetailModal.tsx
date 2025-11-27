import React, { useState, useEffect, useMemo } from 'react';
import { Task, Project, Note, Resource, NewItemPayload } from '../../types';
import { XIcon, ProjectIcon, CalendarIcon, FlagIcon, FileTextIcon, LinkIcon, ResourceIcon, PlusIcon, ClipboardCheckIcon, TrashIcon } from '../shared/icons';
import TagInput from '../shared/TagInput';
import TaskItem from '../shared/TaskItem';
import LinkItemSelectorModal from './LinkItemSelectorModal';

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskId: string, updates: Partial<Task>) => void;
  onAddSubtask: (parentTaskId: string, subtaskData: NewItemPayload) => void;
  onToggleSubtask: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  task: Task;
  allTasks: Task[];
  projects: Project[];
  notes: Note[];
  resources: Resource[];
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ isOpen, onClose, onSave, onAddSubtask, onToggleSubtask, onDelete, task, allTasks, projects, notes, resources }) => {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [priority, setPriority] = useState(task.priority);
  const [dueDate, setDueDate] = useState(task.dueDate ? task.dueDate.split('T')[0] : '');
  const [tags, setTags] = useState(task.tags || []);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isLinkingItems, setIsLinkingItems] = useState(false);

  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description);
    setPriority(task.priority);
    setDueDate(task.dueDate ? task.dueDate.split('T')[0] : '');
    setTags(task.tags || []);
    setIsLinkingItems(false);
  }, [task]);

  const { subtasks, linkedNotes, linkedResources, project } = useMemo(() => {
    const subtasks = allTasks.filter(t => (task.subtaskIds || []).includes(t.id));
    const linkedNotes = notes.filter(n => (task.noteIds || []).includes(n.id));
    const linkedResources = resources.filter(r => (task.resourceIds || []).includes(r.id));
    const project = projects.find(p => p.id === task.projectId);
    return { subtasks, linkedNotes, linkedResources, project };
  }, [task, allTasks, notes, resources, projects]);

  const handleSaveAndClose = () => {
    const updates: Partial<Task> = {};
    if (title !== task.title) updates.title = title;
    if (description !== task.description) updates.description = description;
    if (priority !== task.priority) updates.priority = priority;
    if (dueDate !== (task.dueDate ? task.dueDate.split('T')[0] : '')) updates.dueDate = dueDate;
    if (JSON.stringify(tags) !== JSON.stringify(task.tags || [])) updates.tags = tags;

    if (Object.keys(updates).length > 0) {
      onSave(task.id, updates);
    }
    onClose();
  };
  
  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSubtaskTitle.trim()) {
        onAddSubtask(task.id, { title: newSubtaskTitle.trim() });
        setNewSubtaskTitle('');
    }
  };

  const handleUnlink = (type: 'note' | 'resource', idToUnlink: string) => {
      let updates: Partial<Task> = {};
      if (type === 'note') {
        updates.noteIds = (task.noteIds || []).filter(id => id !== idToUnlink);
      } else {
        updates.resourceIds = (task.resourceIds || []).filter(id => id !== idToUnlink);
      }
      onSave(task.id, updates);
  }

  const handleLinkItems = (links: { noteIds: string[]; resourceIds: string[] }) => {
    const updates: Partial<Task> = {};
    updates.noteIds = [...new Set([...(task.noteIds || []), ...links.noteIds])];
    updates.resourceIds = [...new Set([...(task.resourceIds || []), ...links.resourceIds])];
    onSave(task.id, updates);
    setIsLinkingItems(false);
  }


  if (!isOpen) return null;

  return (
    <>
      <div 
          className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center p-4 backdrop-blur-md"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="task-detail-title"
      >
        <div 
          className="bg-surface/80 backdrop-blur-xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-outline rounded-2xl shadow-lg"
          onClick={e => e.stopPropagation()}
        >
          <header className="flex items-center justify-between p-4 border-b border-outline-dark flex-shrink-0">
              <input
                  id="task-detail-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-transparent border-none text-xl font-bold font-heading text-text-primary focus:outline-none focus:ring-0"
              />
            <button onClick={onClose} aria-label="Close" className="text-text-secondary hover:text-text-primary">
              <XIcon className="w-6 h-6" />
            </button>
          </header>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
              <div className="flex flex-col gap-4 text-sm">
                  <div className="flex items-center gap-2 bg-background/50 p-2 rounded-lg border border-outline">
                      <ProjectIcon className="w-4 h-4 text-text-secondary"/>
                      <span className="text-text-secondary">Project:</span>
                      <span className="font-semibold truncate">{project?.title || 'None'}</span>
                  </div>
                   <div className="flex items-center gap-2 bg-background/50 p-2 rounded-lg border border-outline">
                      <FlagIcon className="w-4 h-4 text-text-secondary"/>
                      <span className="text-text-secondary">Priority:</span>
                       <select value={priority || 'Medium'} onChange={(e) => setPriority(e.target.value as Task['priority'])} className="bg-transparent font-semibold focus:outline-none">
                          <option className="text-black bg-white">Low</option>
                          <option className="text-black bg-white">Medium</option>
                          <option className="text-black bg-white">High</option>
                      </select>
                  </div>
                   <div className="flex items-center gap-2 bg-background/50 p-2 rounded-lg border border-outline">
                      <CalendarIcon className="w-4 h-4 text-text-secondary"/>
                      <span className="text-text-secondary">Due:</span>
                      <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="bg-transparent font-semibold focus:outline-none" />
                  </div>
              </div>

              <div>
                  <label className="text-sm font-semibold text-text-secondary mb-2 flex items-center gap-2"><FileTextIcon className="w-4 h-4" /> Description</label>
                  <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                      placeholder="Add more details..."
                      className="w-full bg-background/50 border border-outline rounded-lg p-3 text-text-primary focus:outline-none focus:ring-1 focus:ring-accent custom-scrollbar"
                  />
              </div>
               <div>
                  <label className="text-sm font-semibold text-text-secondary mb-2">Tags</label>
                  <TagInput tags={tags} onTagsChange={setTags} />
              </div>

              <div>
                  <label className="text-sm font-semibold text-text-secondary mb-2 flex items-center gap-2"><ClipboardCheckIcon className="w-4 h-4" /> Subtasks</label>
                  <form onSubmit={handleAddSubtask} className="flex gap-2 mb-2">
                      <input
                          type="text"
                          value={newSubtaskTitle}
                          onChange={(e) => setNewSubtaskTitle(e.target.value)}
                          placeholder="Add a subtask..."
                          className="flex-1 bg-background/50 border border-outline px-3 py-1.5 text-sm rounded-lg focus:ring-1 focus:ring-accent focus:outline-none"
                      />
                      <button type="submit" className="px-3 py-1.5 text-sm bg-secondary hover:bg-secondary-hover rounded-lg"><PlusIcon className="w-4 h-4" /></button>
                  </form>
                  <div className="space-y-1">
                      {subtasks.map(sub => <TaskItem key={sub.id} task={sub} onToggleTask={onToggleSubtask} onUpdateTask={onSave} allTasks={allTasks} />)}
                  </div>
              </div>
              
              <div>
                  <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-semibold text-text-secondary flex items-center gap-2"><LinkIcon className="w-4 h-4" /> Linked Items</label>
                      <button onClick={() => setIsLinkingItems(true)} className="px-2 py-1 text-xs bg-secondary hover:bg-secondary-hover rounded-md flex items-center gap-1"><PlusIcon className="w-3 h-3"/> Link</button>
                  </div>
                  {linkedNotes.length > 0 || linkedResources.length > 0 ? (
                      <ul className="space-y-1">
                          {linkedNotes.map(note => (
                              <li key={note.id} className="group flex items-center justify-between p-2 bg-background/30 rounded-lg text-sm">
                                  <span className="flex items-center gap-2"><FileTextIcon className="w-4 h-4 text-text-tertiary" /> {note.title}</span>
                                  <button onClick={() => handleUnlink('note', note.id)} className="opacity-0 group-hover:opacity-100 text-text-tertiary hover:text-destructive"><XIcon className="w-3 h-3" /></button>
                              </li>
                          ))}
                          {linkedResources.map(res => (
                              <li key={res.id} className="group flex items-center justify-between p-2 bg-background/30 rounded-lg text-sm">
                                  <span className="flex items-center gap-2"><ResourceIcon className="w-4 h-4 text-text-tertiary" /> {res.title}</span>
                                  <button onClick={() => handleUnlink('resource', res.id)} className="opacity-0 group-hover:opacity-100 text-text-tertiary hover:text-destructive"><XIcon className="w-3 h-3" /></button>
                              </li>
                          ))}
                      </ul>
                  ) : (
                      <p className="text-xs text-text-tertiary text-center p-2 border-2 border-dashed border-outline-dark rounded-lg">No items linked. Link notes or resources for context.</p>
                  )}
              </div>
          </div>
          
          <footer className="p-4 bg-black/5 border-t border-outline-dark mt-auto flex-shrink-0 flex justify-between items-center">
               <button
                  type="button"
                  onClick={() => onDelete(task.id)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-destructive bg-destructive/20 hover:bg-destructive/30 transition-colors rounded-lg"
                >
                    <TrashIcon className="w-4 h-4" />
                    Delete
                </button>
                <div className="flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium bg-secondary hover:bg-secondary-hover text-secondary-content transition-colors rounded-lg">Cancel</button>
                    <button type="button" onClick={handleSaveAndClose} className="px-4 py-2 text-sm font-medium bg-accent hover:bg-accent-hover text-accent-content transition-colors rounded-lg">Save & Close</button>
                </div>
          </footer>
        </div>
      </div>
      <LinkItemSelectorModal
        isOpen={isLinkingItems}
        onClose={() => setIsLinkingItems(false)}
        onLinkItems={handleLinkItems}
        notes={notes}
        resources={resources}
        existingNoteIds={task.noteIds || []}
        existingResourceIds={task.resourceIds || []}
      />
    </>
  );
};

export default React.memo(TaskDetailModal);
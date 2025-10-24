import React, { useState, useEffect, useMemo } from 'react';
import { Resource, Task } from '../../types';
import { XIcon, ListTodoIcon } from '../shared/icons';
import TagInput from '../shared/TagInput';

interface ResourceEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (resourceId: string, title: string, content: string, tags: string[]) => void;
  resource: Resource;
  allTasks: Task[];
  onSelectTask: (taskId: string) => void;
}

const ResourceEditorModal: React.FC<ResourceEditorModalProps> = ({ isOpen, onClose, onSave, resource, allTasks, onSelectTask }) => {
  const [title, setTitle] = useState(resource.title);
  const [content, setContent] = useState(resource.content);
  const [tags, setTags] = useState(resource.tags || []);

  useEffect(() => {
    setTitle(resource.title);
    setContent(resource.content);
    setTags(resource.tags || []);
  }, [resource]);
  
  const backlinkedTasks = useMemo(() => {
    return allTasks.filter(task => (task.resourceIds || []).includes(resource.id) && task.status === 'active');
  }, [allTasks, resource.id]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    onSave(resource.id, title, content, tags);
  };

  if (!isOpen) return null;

  return (
    <div 
        className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center p-4 backdrop-blur-md"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="resource-editor-title"
    >
      <div 
        className="bg-surface/80 backdrop-blur-xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-outline rounded-2xl shadow-lg"
        onClick={e => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-outline-dark flex-shrink-0">
          <h2 id="resource-editor-title" className="text-xl font-bold font-heading">Edit Resource</h2>
          <button onClick={onClose} aria-label="Close" className="text-text-secondary hover:text-text-primary">
            <XIcon className="w-6 h-6" />
          </button>
        </header>
        
        <form onSubmit={handleSave} className="flex-1 flex flex-col overflow-y-hidden">
          <div className="p-6 flex-1 overflow-y-auto custom-scrollbar space-y-4">
              <div>
                  <label htmlFor="resource-title" className="block text-sm font-medium text-text-secondary mb-2">Title</label>
                  <input
                      id="resource-title"
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter resource title..."
                      required
                      className="w-full bg-background/50 border border-outline px-3 py-2 text-text-primary focus:outline-none focus:ring-1 focus:ring-accent rounded-lg"
                  />
              </div>
              <div>
                  <label htmlFor="resource-content" className="block text-sm font-medium text-text-secondary mb-2">Content (URL or text)</label>
                  <textarea
                      id="resource-content"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      rows={3}
                      placeholder="Enter URL or text content..."
                      className="w-full bg-background/50 border border-outline px-3 py-2 text-text-primary focus:outline-none focus:ring-1 focus:ring-accent custom-scrollbar rounded-lg"
                  />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Tags</label>
                <TagInput tags={tags} onTagsChange={setTags} />
              </div>

               {backlinkedTasks.length > 0 && (
                <div className="mt-4">
                    <label className="block text-sm font-medium text-text-secondary mb-2 flex items-center gap-2">
                        <ListTodoIcon className="w-4 h-4" />
                        Linked Tasks
                    </label>
                    <ul className="space-y-2 bg-background/50 border border-outline rounded-lg p-2">
                        {backlinkedTasks.map(task => (
                            <li key={task.id}>
                                <button 
                                    onClick={() => onSelectTask(task.id)}
                                    className="w-full text-left p-2 hover:bg-neutral rounded-md"
                                >
                                    <p className="text-sm font-medium">{task.title}</p>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
              )}
          </div>
          <footer className="p-4 bg-black/5 border-t border-outline-dark mt-auto flex-shrink-0">
              <div className="flex justify-end gap-3">
                  <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium bg-secondary hover:bg-secondary-hover text-secondary-content transition-colors rounded-lg">Cancel</button>
                  <button type="submit" className="px-4 py-2 text-sm font-medium bg-accent hover:bg-accent-hover text-accent-content transition-colors rounded-lg">Save Changes</button>
              </div>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default React.memo(ResourceEditorModal);
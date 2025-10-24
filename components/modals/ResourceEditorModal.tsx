import React, { useState, useEffect, useMemo } from 'react';
import { Resource, Task } from '../../types';
import { XIcon, ListTodoIcon, FileTextIcon, LinkIcon, ArchiveBoxIcon, TrashIcon, EditIcon } from '../shared/icons';
import TagInput from '../shared/TagInput';

interface ResourceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (resourceId: string, updates: Partial<Resource>) => void;
  onArchive: (itemId: string) => void;
  onDelete: (itemId: string) => void;
  resource: Resource;
  allTasks: Task[];
  onSelectTask: (taskId: string) => void;
}

const ResourceDetailModal: React.FC<ResourceDetailModalProps> = ({ isOpen, onClose, onSave, onArchive, onDelete, resource, allTasks, onSelectTask }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(resource.title);
  const [url, setUrl] = useState(resource.url || '');
  const [content, setContent] = useState(resource.content || '');
  const [tags, setTags] = useState(resource.tags || []);

  const resetState = () => {
    setTitle(resource.title);
    setUrl(resource.url || '');
    setContent(resource.content || '');
    setTags(resource.tags || []);
    setIsEditing(false);
  }

  useEffect(() => {
    if (isOpen) {
        resetState();
    }
  }, [resource, isOpen]);
  
  const backlinkedTasks = useMemo(() => {
    return allTasks.filter(task => (task.resourceIds || []).includes(resource.id) && task.status === 'active');
  }, [allTasks, resource.id]);

  const handleSave = () => {
    if (!title.trim()) {
        alert("Title is required.");
        return;
    }
    if (!url.trim() && !content.trim()) {
        alert("A resource must have either a URL or content.");
        return;
    }
    
    const updates: Partial<Resource> = {};
    if (title !== resource.title) updates.title = title;
    if (url !== (resource.url || '')) updates.url = url;
    if (content !== (resource.content || '')) updates.content = content;
    if (JSON.stringify(tags) !== JSON.stringify(resource.tags || [])) updates.tags = tags;

    if (Object.keys(updates).length > 0) {
      onSave(resource.id, updates);
    }
    setIsEditing(false);
  };

  const handleArchive = () => {
    onArchive(resource.id);
    onClose();
  }

  const handleDelete = () => {
    onDelete(resource.id);
  }

  const handleCancelEdit = () => {
    resetState();
  }

  if (!isOpen) return null;

  const renderViewMode = () => (
    <>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
            {resource.url && (
                <div>
                    <label className="text-sm font-semibold text-text-secondary mb-2 flex items-center gap-2"><LinkIcon className="w-4 h-4" /> URL</label>
                    <a href={resource.url.startsWith('http') ? resource.url : `https://${resource.url}`} target="_blank" rel="noopener noreferrer" className="block p-3 bg-background/50 border border-outline rounded-lg text-accent hover:underline truncate">
                        {resource.url}
                    </a>
                </div>
            )}
            {resource.content && (
                <div>
                    <label className="text-sm font-semibold text-text-secondary mb-2 flex items-center gap-2"><FileTextIcon className="w-4 h-4" /> Content / Notes</label>
                    <div className="prose prose-invert max-w-none text-text-primary text-sm p-3 bg-background/50 border border-outline rounded-lg whitespace-pre-wrap">{resource.content}</div>
                </div>
            )}
            <div>
                <label className="text-sm font-semibold text-text-secondary mb-2">Tags</label>
                <TagInput tags={tags} onTagsChange={() => {}} />
            </div>
            {backlinkedTasks.length > 0 && (
            <div>
                <label className="text-sm font-semibold text-text-secondary mb-2 flex items-center gap-2"><ListTodoIcon className="w-4 h-4" /> Linked Tasks</label>
                <ul className="space-y-2 bg-background/50 border border-outline rounded-lg p-2">
                    {backlinkedTasks.map(task => (
                        <li key={task.id}>
                            <button onClick={() => onSelectTask(task.id)} className="w-full text-left p-2 hover:bg-neutral rounded-md"><p className="text-sm font-medium">{task.title}</p></button>
                        </li>
                    ))}
                </ul>
            </div>
            )}
        </div>
        <footer className="p-4 bg-black/5 border-t border-outline-dark mt-auto flex-shrink-0 flex justify-between items-center">
            <div className="flex gap-2">
                <button type="button" onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-3 py-1.5 text-sm bg-secondary hover:bg-secondary-hover rounded-lg"><EditIcon className="w-4 h-4"/> Edit</button>
            </div>
            <div className="flex justify-end gap-3">
                <button type="button" onClick={handleArchive} className="flex items-center gap-2 px-3 py-1.5 text-sm bg-secondary hover:bg-secondary-hover rounded-lg"><ArchiveBoxIcon className="w-4 h-4"/> Archive</button>
                <button type="button" onClick={handleDelete} className="flex items-center gap-2 px-3 py-1.5 text-sm bg-destructive/20 hover:bg-destructive/30 text-destructive rounded-lg"><TrashIcon className="w-4 h-4"/> Delete</button>
            </div>
        </footer>
    </>
  );

  const renderEditMode = () => (
    <>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
            <div>
                <label htmlFor="resource-url" className="text-sm font-semibold text-text-secondary mb-2 flex items-center gap-2"><LinkIcon className="w-4 h-4" /> URL (Optional)</label>
                <input id="resource-url" type="text" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Enter URL..." className="w-full bg-background/50 border border-outline px-3 py-2 text-text-primary focus:outline-none focus:ring-1 focus:ring-accent rounded-lg" />
            </div>
            <div>
                <label htmlFor="resource-content" className="text-sm font-semibold text-text-secondary mb-2 flex items-center gap-2"><FileTextIcon className="w-4 h-4" /> Content / Notes</label>
                <textarea id="resource-content" value={content} onChange={(e) => setContent(e.target.value)} rows={5} placeholder="Enter text content or notes..." className="w-full bg-background/50 border border-outline px-3 py-2 text-text-primary focus:outline-none focus:ring-1 focus:ring-accent custom-scrollbar rounded-lg" />
            </div>
            <div>
                <label className="text-sm font-semibold text-text-secondary mb-2">Tags</label>
                <TagInput tags={tags} onTagsChange={setTags} />
            </div>
        </div>
        <footer className="p-4 bg-black/5 border-t border-outline-dark mt-auto flex-shrink-0 flex justify-end items-center">
            <div className="flex justify-end gap-3">
                <button type="button" onClick={handleCancelEdit} className="px-4 py-2 text-sm font-medium bg-secondary hover:bg-secondary-hover text-secondary-content transition-colors rounded-lg">Cancel</button>
                <button type="button" onClick={handleSave} className="px-4 py-2 text-sm font-medium bg-accent hover:bg-accent-hover text-accent-content transition-colors rounded-lg">Save Changes</button>
            </div>
        </footer>
    </>
  );

  return (
    <div 
        className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center p-4 backdrop-blur-md"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="resource-detail-title"
    >
      <div 
        className="bg-surface/80 backdrop-blur-xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-outline rounded-2xl shadow-lg"
        onClick={e => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-outline-dark flex-shrink-0">
             <input id="resource-detail-title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter resource title..." required className="w-full bg-transparent border-none text-xl font-bold font-heading text-text-primary focus:outline-none focus:ring-0 disabled:pointer-events-none" disabled={!isEditing} />
          <button onClick={onClose} aria-label="Close" className="text-text-secondary hover:text-text-primary">
            <XIcon className="w-6 h-6" />
          </button>
        </header>
        
        {isEditing ? renderEditMode() : renderViewMode()}
      </div>
    </div>
  );
};

export default React.memo(ResourceDetailModal);

import React, { useState, useEffect, useRef } from 'react';
import { Project, Task, Note, Resource } from '../types';
import { CheckSquareIcon, SquareIcon, FileTextIcon, LinkIcon, ResourceIcon, ArchiveBoxIcon, TrashIcon, EditIcon, PlusIcon, FlagIcon, CalendarIcon, EllipsisVerticalIcon } from './icons';

interface ProjectDetailProps {
    project: Project;
    tasks: Task[];
    notes: Note[];
    resources: Resource[];
    onToggleTask: (taskId: string) => void;
    onArchive: (itemId: string) => void;
    onDelete: (itemId: string) => void;
    onSelectNote: (noteId: string) => void;
    onUpdateProject: (projectId: string, updates: { title?: string, description?: string }) => void;
    onOpenCommandBar: () => void;
    onUpdateTask: (taskId: string, updates: Partial<Pick<Task, 'title' | 'priority' | 'dueDate'>>) => void;
}

const ItemCard: React.FC<{icon: React.ReactElement, title: string, children?: React.ReactNode, onAdd?: () => void, addLabel?: string}> = ({icon, title, children, onAdd, addLabel}) => (
    <div className="bg-surface/80 backdrop-blur-xl border border-outline rounded-2xl shadow-md mb-6">
        <header className="flex items-center justify-between p-4 border-b border-outline-dark">
            <div className="flex items-center gap-3">
                {icon}
                <h3 className="font-bold text-lg font-heading tracking-tight">{title}</h3>
            </div>
            {onAdd && (
                <button onClick={onAdd} aria-label={addLabel || `Add new ${title}`} className="p-1 text-text-secondary hover:bg-neutral hover:text-text-primary rounded-full transition-colors"><PlusIcon className="w-5 h-5"/></button>
            )}
        </header>
        <div className="p-4">
            {children}
        </div>
    </div>
);

const priorityClasses: Record<string, { text: string, bg: string }> = {
    High: { text: 'text-priority-high', bg: 'bg-priority-high-bg' },
    Medium: { text: 'text-priority-medium', bg: 'bg-priority-medium-bg' },
    Low: { text: 'text-priority-low', bg: 'bg-priority-low-bg' },
};

const TaskItem: React.FC<{task: Task, onToggleTask: (id: string) => void, onUpdateTask: (id: string, updates: any) => void}> = ({ task, onToggleTask, onUpdateTask }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(task.title);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditing) {
            inputRef.current?.focus();
            inputRef.current?.select();
        }
    }, [isEditing]);

    const handleSave = () => {
        if (title.trim() && title.trim() !== task.title) {
            onUpdateTask(task.id, { title: title.trim() });
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSave();
        } else if (e.key === 'Escape') {
            setTitle(task.title);
            setIsEditing(false);
        }
    };
    
    if (isEditing) {
        return (
            <li className="flex items-center gap-3 p-2 rounded-lg">
                 <button onClick={() => onToggleTask(task.id)} aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}>
                    {task.completed ? <CheckSquareIcon className="w-5 h-5 text-accent" /> : <SquareIcon className="w-5 h-5 text-text-tertiary" />}
                </button>
                <input
                    ref={inputRef}
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={handleSave}
                    onKeyDown={handleKeyDown}
                    className="flex-1 bg-background/50 border border-outline px-2 py-1 text-sm rounded-md focus:ring-1 focus:ring-accent focus:outline-none"
                />
            </li>
        )
    }

    return (
        <li className="flex items-center gap-3 p-2 group hover:bg-neutral rounded-lg transition-colors">
            <button onClick={() => onToggleTask(task.id)} aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'} className="flex-shrink-0 text-text-secondary hover:text-accent">
                {task.completed ? <CheckSquareIcon className="w-5 h-5 text-accent" /> : <SquareIcon className="w-5 h-5" />}
            </button>
            <span 
              className={`flex-1 cursor-pointer ${task.completed ? 'line-through text-text-tertiary' : ''}`}
              onDoubleClick={() => setIsEditing(true)}
            >
              {task.title}
            </span>
            {task.dueDate && (
                <div className="flex items-center gap-1 text-xs text-text-secondary">
                    <CalendarIcon className="w-4 h-4" />
                    {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </div>
            )}
            {task.priority && priorityClasses[task.priority] && (
                <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${priorityClasses[task.priority].bg} ${priorityClasses[task.priority].text}`}>
                    <FlagIcon className="w-3 h-3" />
                    {task.priority}
                </div>
            )}
        </li>
    )
}


const ActionMenu: React.FC<{ onEdit?: () => void, onArchive: () => void, onDelete: () => void }> = ({ onEdit, onArchive, onDelete }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={menuRef}>
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-text-secondary hover:bg-neutral hover:text-text-primary rounded-full transition-colors">
                <EllipsisVerticalIcon className="w-5 h-5" />
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-surface/80 backdrop-blur-xl border border-outline rounded-lg shadow-lg z-10">
                    <ul>
                        {onEdit && <li><button onClick={() => { onEdit(); setIsOpen(false); }} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm hover:bg-neutral transition-colors"><EditIcon className="w-4 h-4" /> Edit</button></li>}
                        <li><button onClick={() => { onArchive(); setIsOpen(false); }} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm hover:bg-neutral transition-colors"><ArchiveBoxIcon className="w-4 h-4" /> Archive</button></li>
                        <li><button onClick={() => { onDelete(); setIsOpen(false); }} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-destructive hover:bg-neutral transition-colors"><TrashIcon className="w-4 h-4" /> Delete</button></li>
                    </ul>
                </div>
            )}
        </div>
    )
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({ project, tasks, notes, resources, onToggleTask, onArchive, onDelete, onSelectNote, onUpdateProject, onOpenCommandBar, onUpdateTask }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(project.title);
    const [editDescription, setEditDescription] = useState(project.description);

    useEffect(() => {
        setEditTitle(project.title);
        setEditDescription(project.description);
        setIsEditing(false);
    }, [project]);

    const handleSave = () => {
        onUpdateProject(project.id, { title: editTitle, description: editDescription });
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditTitle(project.title);
        setEditDescription(project.description);
        setIsEditing(false);
    }

    return (
        <div>
            <header className="mb-8">
                <div className="flex justify-between items-start">
                    {isEditing ? (
                        <div className="flex-1 mr-4">
                            <input
                                type="text"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                className="w-full bg-background/50 border border-outline rounded-lg px-3 py-2 text-4xl font-bold mb-2 text-text-primary focus:outline-none focus:ring-1 focus:ring-accent font-heading tracking-tight"
                            />
                             <textarea
                                value={editDescription}
                                onChange={(e) => setEditDescription(e.target.value)}
                                rows={3}
                                className="w-full bg-background/50 border border-outline rounded-lg px-3 py-2 text-text-secondary focus:outline-none focus:ring-1 focus:ring-accent custom-scrollbar max-w-prose"
                            />
                             <div className="flex gap-2 mt-2">
                                <button onClick={handleSave} className="px-3 py-1.5 text-sm bg-accent hover:bg-accent-hover text-accent-content transition-colors rounded-lg">Save</button>
                                <button onClick={handleCancel} className="px-3 py-1.5 text-sm bg-secondary hover:bg-secondary-hover text-secondary-content transition-colors rounded-lg">Cancel</button>
                            </div>
                        </div>
                    ) : (
                         <div>
                            <h1 className="text-4xl font-bold mb-2 font-heading tracking-tight">{project.title}</h1>
                            <p className="text-text-secondary max-w-prose">{project.description}</p>
                        </div>
                    )}
                    <div className="flex-shrink-0 ml-4">
                       <ActionMenu 
                          onEdit={() => setIsEditing(true)}
                          onArchive={() => onArchive(project.id)}
                          onDelete={() => onDelete(project.id)}
                       />
                    </div>
                </div>
            </header>

            <ItemCard icon={<CheckSquareIcon className="w-6 h-6 text-accent" />} title="Tasks" onAdd={onOpenCommandBar}>
                {tasks.length > 0 ? (
                    <ul className="space-y-1 mb-4">
                        {tasks.map(task => (
                            <TaskItem key={task.id} task={task} onToggleTask={onToggleTask} onUpdateTask={onUpdateTask} />
                        ))}
                    </ul>
                ) : <p className="text-text-tertiary text-sm text-center py-4">No tasks yet. Add one to get started!</p>}
            </ItemCard>

            <ItemCard icon={<FileTextIcon className="w-6 h-6 text-accent" />} title="Notes" onAdd={onOpenCommandBar}>
                 {notes.length > 0 ? (
                    <ul className="space-y-2">
                        {notes.map(note => (
                            <li key={note.id}>
                                <button onClick={() => onSelectNote(note.id)} className="w-full text-left p-3 hover:bg-neutral rounded-lg transition-colors">
                                    <p className="font-semibold">{note.title}</p>
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : <p className="text-text-tertiary text-sm text-center py-4">No notes for this project yet.</p>}
            </ItemCard>

            <ItemCard icon={<ResourceIcon className="w-6 h-6 text-accent" />} title="Resources" onAdd={onOpenCommandBar}>
                 {resources.length > 0 ? (
                    <ul className="space-y-1">
                        {resources.map(resource => (
                            <li key={resource.id} className="flex items-center gap-3 p-3 hover:bg-neutral rounded-lg transition-colors">
                                {resource.type === 'link' ? <LinkIcon className="w-4 h-4 text-text-tertiary" /> : <ResourceIcon className="w-4 h-4 text-text-tertiary" />}
                                <a href={resource.type === 'link' ? resource.content : undefined} target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-accent">{resource.title}</a>
                            </li>
                        ))}
                    </ul>
                ) : <p className="text-text-tertiary text-sm text-center py-4">No resources for this project yet.</p>}
            </ItemCard>

        </div>
    );
};

export default ProjectDetail;
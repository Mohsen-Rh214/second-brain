
import React, { useState, useEffect } from 'react';
import { Project, Task, Note, Resource } from '../types';
import { CheckSquareIcon, SquareIcon, FileTextIcon, LinkIcon, ResourceIcon, ArchiveBoxIcon, TrashIcon, EditIcon, PlusIcon, FlagIcon, CalendarIcon } from './icons';
import { CaptureContext } from '../App';

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
    onAddItem: (context: CaptureContext) => void;
    onUpdateTask: (taskId: string, updates: Partial<Pick<Task, 'title' | 'priority' | 'dueDate'>>) => void;
}

const ItemCard: React.FC<{icon: React.ReactElement, title: string, children?: React.ReactNode, onAdd?: () => void}> = ({icon, title, children, onAdd}) => (
    <div className="bg-slate-800/50 rounded-lg mb-6">
        <header className="flex items-center justify-between p-4 border-b border-slate-700">
            <div className="flex items-center gap-3">
                {icon}
                <h3 className="font-bold text-lg">{title}</h3>
            </div>
            {onAdd && (
                <button onClick={onAdd} aria-label={`Add new ${title}`} className="p-1 text-slate-400 hover:bg-slate-700 hover:text-white rounded-full transition-colors"><PlusIcon className="w-5 h-5"/></button>
            )}
        </header>
        <div className="p-4">
            {children}
        </div>
    </div>
);

const priorityColors: Record<Task['priority'] & string, string> = {
    Low: 'text-sky-400',
    Medium: 'text-amber-400',
    High: 'text-red-400',
}

const TaskItem: React.FC<{task: Task, onToggleTask: (id: string) => void, onUpdateTask: (id: string, updates: any) => void}> = ({ task, onToggleTask, onUpdateTask }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({ title: task.title, priority: task.priority, dueDate: task.dueDate });

    const handleSave = () => {
        onUpdateTask(task.id, editData);
        setIsEditing(false);
    }
    const handleCancel = () => setIsEditing(false);

    if (isEditing) {
        return (
            <li className="flex flex-col gap-2 p-2 bg-slate-700/50 rounded-md">
                <input 
                    type="text" 
                    value={editData.title}
                    onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm"
                />
                <div className="flex gap-2">
                    <select
                        value={editData.priority}
                        onChange={(e) => setEditData(prev => ({...prev, priority: e.target.value as Task['priority']}))}
                        className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm"
                    >
                        <option>Low</option><option>Medium</option><option>High</option>
                    </select>
                     <input
                        type="date"
                        value={editData.dueDate ? editData.dueDate.split('T')[0] : ''}
                        onChange={(e) => setEditData(prev => ({...prev, dueDate: e.target.value }))}
                        className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm"
                    />
                </div>
                <div className="flex justify-end gap-2 mt-1">
                    <button onClick={handleCancel} className="px-2 py-1 text-xs bg-slate-600 hover:bg-slate-500 rounded">Cancel</button>
                    <button onClick={handleSave} className="px-2 py-1 text-xs bg-emerald-600 hover:bg-emerald-500 rounded">Save</button>
                </div>
            </li>
        )
    }

    return (
        <li className="flex items-center gap-3 p-2 rounded-md hover:bg-slate-700/50 group">
            <button onClick={() => onToggleTask(task.id)} aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}>
                {task.completed ? <CheckSquareIcon className="w-5 h-5 text-emerald-400" /> : <SquareIcon className="w-5 h-5 text-slate-500" />}
            </button>
            <span className={`flex-1 ${task.completed ? 'line-through text-slate-500' : ''}`}>{task.title}</span>
            {task.dueDate && (
                <div className="flex items-center gap-1 text-xs text-slate-400">
                    <CalendarIcon className="w-4 h-4" />
                    {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </div>
            )}
            {task.priority && (
                <div className={`flex items-center gap-1 text-xs font-semibold ${priorityColors[task.priority]}`}>
                    <FlagIcon className="w-4 h-4" />
                    {task.priority}
                </div>
            )}
            <button onClick={() => setIsEditing(true)} className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-white"><EditIcon className="w-4 h-4" /></button>
        </li>
    )
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({ project, tasks, notes, resources, onToggleTask, onArchive, onDelete, onSelectNote, onUpdateProject, onAddItem, onUpdateTask }) => {
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
        <div className="p-8">
            <header className="mb-8">
                <div className="flex justify-between items-start">
                    {isEditing ? (
                        <div className="flex-1 mr-4">
                            <input
                                type="text"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                className="w-full bg-slate-700/50 border border-slate-600 rounded-md px-3 py-2 text-3xl font-bold mb-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                             <textarea
                                value={editDescription}
                                onChange={(e) => setEditDescription(e.target.value)}
                                rows={3}
                                className="w-full bg-slate-700/50 border border-slate-600 rounded-md px-3 py-2 text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 custom-scrollbar max-w-prose"
                            />
                        </div>
                    ) : (
                         <div>
                            <h1 className="text-3xl font-bold mb-2">{project.title}</h1>
                            <p className="text-slate-400 max-w-prose">{project.description}</p>
                        </div>
                    )}
                    <div className="flex gap-2 flex-shrink-0 ml-4">
                        {isEditing ? (
                            <>
                                <button onClick={handleSave} className="px-3 py-2 text-sm bg-emerald-600 hover:bg-emerald-500 text-white rounded-md transition-colors">Save</button>
                                <button onClick={handleCancel} className="px-3 py-2 text-sm bg-slate-600 hover:bg-slate-500 text-white rounded-md transition-colors">Cancel</button>
                            </>
                        ) : (
                            <>
                                <button onClick={() => setIsEditing(true)} aria-label="Edit Project" className="p-2 text-slate-400 hover:bg-slate-700 hover:text-white rounded-md transition-colors"><EditIcon className="w-5 h-5"/></button>
                                <button onClick={() => onArchive(project.id)} aria-label="Archive Project" className="p-2 text-slate-400 hover:bg-slate-700 hover:text-white rounded-md transition-colors"><ArchiveBoxIcon className="w-5 h-5"/></button>
                                <button onClick={() => onDelete(project.id)} aria-label="Delete Project" className="p-2 text-slate-400 hover:bg-slate-700 hover:text-red-400 rounded-md transition-colors"><TrashIcon className="w-5 h-5"/></button>
                            </>
                        )}
                    </div>
                </div>
            </header>

            <ItemCard icon={<CheckSquareIcon className="w-6 h-6 text-amber-400" />} title="Tasks" onAdd={() => onAddItem({ parentId: project.id, itemType: 'task'})}>
                {tasks.length > 0 ? (
                    <ul className="space-y-1">
                        {tasks.map(task => (
                            <TaskItem key={task.id} task={task} onToggleTask={onToggleTask} onUpdateTask={onUpdateTask} />
                        ))}
                    </ul>
                ) : <p className="text-slate-500 text-sm">No tasks for this project yet.</p>}
            </ItemCard>

            <ItemCard icon={<FileTextIcon className="w-6 h-6 text-sky-400" />} title="Notes" onAdd={() => onAddItem({ parentId: project.id, itemType: 'note'})}>
                 {notes.length > 0 ? (
                    <ul>
                        {notes.map(note => (
                            <li key={note.id}>
                                <button onClick={() => onSelectNote(note.id)} className="w-full text-left mb-2 p-2 rounded hover:bg-slate-700/50">
                                    <p className="font-semibold">{note.title}</p>
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : <p className="text-slate-500 text-sm">No notes for this project yet.</p>}
            </ItemCard>

            <ItemCard icon={<ResourceIcon className="w-6 h-6 text-indigo-400" />} title="Resources" onAdd={() => onAddItem({ parentId: project.id, itemType: 'resource'})}>
                 {resources.length > 0 ? (
                    <ul>
                        {resources.map(resource => (
                            <li key={resource.id} className="flex items-center gap-3 mb-2 p-2 rounded hover:bg-slate-700/50">
                                {resource.type === 'link' ? <LinkIcon className="w-4 h-4 text-slate-500" /> : <ResourceIcon className="w-4 h-4 text-slate-500" />}
                                <a href={resource.type === 'link' ? resource.content : undefined} target="_blank" rel="noopener noreferrer" className="hover:underline">{resource.title}</a>
                            </li>
                        ))}
                    </ul>
                ) : <p className="text-slate-500 text-sm">No resources for this project yet.</p>}
            </ItemCard>

        </div>
    );
};

export default ProjectDetail;
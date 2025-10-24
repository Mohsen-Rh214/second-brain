import React, { useState, useEffect } from 'react';
import { Project, Task, Note, Resource, CaptureContext, NewItemPayload, ItemType } from '../../types';
import { CheckSquareIcon, FileTextIcon, LinkIcon, ResourceIcon } from '../shared/icons';
import Card from '../shared/Card';
import ActionMenu from '../shared/ActionMenu';
import TaskItem from '../shared/TaskItem';
import { useEditable } from '../../hooks/useEditable';
import CardEmptyState from '../shared/CardEmptyState';
import TagInput from '../shared/TagInput';
import TagList from '../shared/TagList';

interface ProjectDetailProps {
    project: Project;
    tasks: Task[];
    notes: Note[];
    resources: Resource[];
    onToggleTask: (taskId: string) => void;
    onArchive: (itemId: string) => void;
    onDelete: (itemId: string) => void;
    onSelectNote: (noteId: string) => void;
    onUpdateProject: (projectId: string, updates: { title?: string, description?: string, tags?: string[] }) => void;
    onOpenCaptureModal: (context: CaptureContext) => void;
    onSaveNewItem: (itemData: NewItemPayload, itemType: ItemType, parentId: string | null) => void;
    onReorderTasks: (sourceTaskId: string, targetTaskId: string) => void;
    onUpdateTask: (taskId: string, updates: Partial<Pick<Task, 'title' | 'priority' | 'dueDate'>>) => void;
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({ project, tasks, notes, resources, onToggleTask, onArchive, onDelete, onSelectNote, onUpdateProject, onOpenCaptureModal, onSaveNewItem, onReorderTasks, onUpdateTask }) => {
    
    const [isAddingTask, setIsAddingTask] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
    const [dragOverTaskId, setDragOverTaskId] = useState<string | null>(null);
    const [tags, setTags] = useState(project.tags || []);

    const titleEditor = useEditable(project.title, () => {});
    const descriptionEditor = useEditable(project.description, () => {});

    useEffect(() => {
        setTags(project.tags || []);
    }, [project]);

    const isEditing = titleEditor.isEditing || descriptionEditor.isEditing;

    const handleEdit = () => {
        titleEditor.handleEdit();
        descriptionEditor.handleEdit();
    };

    const handleSave = () => {
        const updates: { title?: string; description?: string; tags?: string[] } = {};
        if (titleEditor.value !== project.title) updates.title = titleEditor.value;
        if (descriptionEditor.value !== project.description) updates.description = descriptionEditor.value;
        if (JSON.stringify(tags) !== JSON.stringify(project.tags || [])) updates.tags = tags;
        
        if (Object.keys(updates).length > 0) {
            onUpdateProject(project.id, updates);
        }

        titleEditor.handleSave(); // Just sets isEditing to false
        descriptionEditor.handleSave();
    };
    
    const handleCancel = () => {
        titleEditor.handleCancel();
        descriptionEditor.handleCancel();
        setTags(project.tags || []);
    };
    
    const handleAddTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (newTaskTitle.trim()) {
            onSaveNewItem({ title: newTaskTitle }, 'task', project.id);
            setNewTaskTitle('');
            setIsAddingTask(false);
        }
    };


    return (
        <div>
            <header className="mb-8">
                <div className="flex justify-between items-start">
                    {isEditing ? (
                        <div className="flex-1 mr-4 space-y-4">
                            <div>
                                <label htmlFor="project-title" className="sr-only">Title</label>
                                <input
                                    id="project-title"
                                    type="text"
                                    value={titleEditor.value}
                                    onChange={(e) => titleEditor.setValue(e.target.value)}
                                    className="w-full bg-background/50 border border-outline rounded-lg px-3 py-2 text-4xl font-bold text-text-primary focus:outline-none focus:ring-1 focus:ring-accent font-heading tracking-tight"
                                />
                            </div>
                            <div>
                                <label htmlFor="project-description" className="sr-only">Description</label>
                                 <textarea
                                    id="project-description"
                                    value={descriptionEditor.value}
                                    onChange={(e) => descriptionEditor.setValue(e.target.value)}
                                    rows={3}
                                    className="w-full bg-background/50 border border-outline rounded-lg px-3 py-2 text-text-secondary focus:outline-none focus:ring-1 focus:ring-accent custom-scrollbar max-w-prose"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">Tags</label>
                                <TagInput tags={tags} onTagsChange={setTags} />
                            </div>
                             <div className="flex gap-2 mt-2">
                                <button onClick={handleSave} className="px-3 py-1.5 text-sm bg-accent hover:bg-accent-hover text-accent-content transition-all rounded-lg active:scale-95">Save</button>
                                <button onClick={handleCancel} className="px-3 py-1.5 text-sm bg-secondary hover:bg-secondary-hover text-secondary-content transition-all rounded-lg active:scale-95">Cancel</button>
                            </div>
                        </div>
                    ) : (
                         <div>
                            <h1 className="text-4xl font-bold mb-2 font-heading tracking-tight">{project.title}</h1>
                            <p className="text-text-secondary max-w-prose mb-4">{project.description}</p>
                            <TagList tags={project.tags} />
                        </div>
                    )}
                    <div className="flex-shrink-0 ml-4">
                       <ActionMenu 
                          onEdit={handleEdit}
                          onArchive={() => onArchive(project.id)}
                          onDelete={() => onDelete(project.id)}
                       />
                    </div>
                </div>
            </header>

            <Card icon={<CheckSquareIcon className="w-6 h-6" />} title="Tasks" onAdd={() => setIsAddingTask(true)} isCollapsible defaultOpen>
                {isAddingTask && (
                    <form onSubmit={handleAddTask} className="flex gap-2 mb-4 p-2 bg-background/50 rounded-lg border border-outline-dark animate-pop-in">
                        <input
                            type="text"
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            onKeyDown={(e) => e.key === 'Escape' && setIsAddingTask(false)}
                            placeholder="What needs to be done?"
                            autoFocus
                            className="flex-1 bg-transparent border-none px-2 py-1 text-sm text-text-primary focus:outline-none"
                        />
                        <button type="submit" className="px-3 py-1 text-xs font-medium bg-secondary hover:bg-secondary-hover text-secondary-content transition-all rounded-md active:scale-95">Add Task</button>
                        <button type="button" onClick={() => setIsAddingTask(false)} className="px-3 py-1 text-xs font-medium text-text-secondary hover:bg-neutral rounded-md active:scale-95">Cancel</button>
                    </form>
                )}
                {tasks.length > 0 ? (
                    <ul className="space-y-1" onDragLeave={() => setDragOverTaskId(null)}>
                        {tasks.map((task, index) => (
                            <li 
                                key={task.id} 
                                className={`relative cursor-move transition-opacity ${draggedTaskId === task.id ? 'opacity-30' : 'opacity-100'} ${index === 0 && !isAddingTask ? 'animate-pop-in' : ''}`}
                                draggable={true}
                                onDragStart={(e) => { e.dataTransfer.setData('text/plain', task.id); setDraggedTaskId(task.id); }}
                                onDragEnd={() => { setDraggedTaskId(null); setDragOverTaskId(null); }}
                                onDragOver={(e) => { e.preventDefault(); setDragOverTaskId(task.id); }}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    const sourceId = e.dataTransfer.getData('text/plain');
                                    if (sourceId && task.id && sourceId !== task.id) {
                                        onReorderTasks(sourceId, task.id);
                                    }
                                    setDraggedTaskId(null);
                                    setDragOverTaskId(null);
                                }}
                            >
                                {dragOverTaskId === task.id && draggedTaskId !== task.id && (
                                    <div className="absolute -top-1 left-2 right-2 h-1 bg-accent rounded-full" />
                                )}
                                <TaskItem task={task} onToggleTask={onToggleTask} onUpdateTask={onUpdateTask} />
                            </li>
                        ))}
                    </ul>
                ) : <CardEmptyState>Every great project starts with a single step. Add your first task.</CardEmptyState>}
            </Card>

            <Card icon={<FileTextIcon className="w-6 h-6" />} title="Notes" onAdd={() => onOpenCaptureModal({ parentId: project.id, itemType: 'note' })} isCollapsible defaultOpen>
                 {notes.length > 0 ? (
                    <ul className="space-y-2">
                        {notes.map(note => (
                            <li key={note.id}>
                                <button onClick={() => onSelectNote(note.id)} className="w-full text-left p-3 hover:bg-neutral rounded-lg transition-colors">
                                    <p className="font-semibold">{note.title}</p>
                                    <TagList tags={note.tags} className="mt-2" />
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : <CardEmptyState>Jot down ideas, meeting minutes, or inspiration.</CardEmptyState>}
            </Card>

            <Card icon={<ResourceIcon className="w-6 h-6" />} title="Resources" onAdd={() => onOpenCaptureModal({ parentId: project.id, itemType: 'resource' })} isCollapsible defaultOpen>
                 {resources.length > 0 ? (
                    <ul className="space-y-1">
                        {resources.map(resource => (
                            <li key={resource.id} className="p-3 hover:bg-neutral rounded-lg transition-colors">
                                <div className="flex items-center gap-3">
                                    {resource.type === 'link' ? <LinkIcon className="w-4 h-4 text-text-tertiary flex-shrink-0" /> : <ResourceIcon className="w-4 h-4 text-text-tertiary flex-shrink-0" />}
                                    <div className="flex-grow">
                                        <a href={resource.type === 'link' ? resource.content : undefined} target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-accent">{resource.title}</a>
                                        <TagList tags={resource.tags} className="mt-1" />
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : <CardEmptyState>Collect links, files, and snippets related to this project.</CardEmptyState>}
            </Card>

        </div>
    );
};

export default React.memo(ProjectDetail);
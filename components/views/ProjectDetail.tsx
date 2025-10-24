import React, { useState, useEffect, useMemo } from 'react';
import { Project, Task, Note, Resource, CaptureContext, NewItemPayload, ItemType, TaskStage, ProjectViewType } from '../../types';
import { CheckSquareIcon, FileTextIcon, LinkIcon, ResourceIcon, ListTodoIcon, LayoutGridIcon, PlusIcon } from '../shared/icons';
import Card from '../shared/Card';
import ActionMenu from '../shared/ActionMenu';
import TaskItem from '../shared/TaskItem';
import { useEditable } from '../../hooks/useEditable';
import CardEmptyState from '../shared/CardEmptyState';
import TagInput from '../shared/TagInput';
import TagList from '../shared/TagList';
import KanbanBoard from '../kanban/KanbanBoard';

interface ProjectDetailProps {
    project: Project;
    allTasks: Task[];
    tasks: Task[];
    notes: Note[];
    resources: Resource[];
    onToggleTask: (taskId: string) => void;
    onArchive: (itemId: string) => void;
    onDelete: (itemId: string) => void;
    onSelectNote: (noteId: string) => void;
    onSelectTask: (taskId: string) => void;
    onUpdateProject: (projectId: string, updates: { title?: string, description?: string, tags?: string[] }) => void;
    onOpenCaptureModal: (context: CaptureContext) => void;
    onSaveNewItem: (itemData: NewItemPayload, itemType: ItemType, parentId: string | null) => void;
    onReorderTasks: (sourceTaskId: string, targetTaskId: string) => void;
    onReparentTask: (taskId: string, newParentId: string) => void;
    onUpdateTask: (taskId: string, updates: Partial<Pick<Task, 'title' | 'priority' | 'dueDate'>>) => void;
    onUpdateTaskStage: (taskId: string, newStage: TaskStage) => void;
    onUpdateMultipleTaskStages: (taskIds: string[], newStage: TaskStage) => void;
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({ project, allTasks, tasks, notes, resources, onToggleTask, onArchive, onDelete, onSelectNote, onSelectTask, onUpdateProject, onOpenCaptureModal, onSaveNewItem, onReorderTasks, onReparentTask, onUpdateTask, onUpdateTaskStage, onUpdateMultipleTaskStages }) => {
    
    const [isAddingTask, setIsAddingTask] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
    const [dragOverTaskId, setDragOverTaskId] = useState<string | null>(null);
    const [reparentTargetId, setReparentTargetId] = useState<string | null>(null);
    const [tags, setTags] = useState(project.tags || []);
    const [viewType, setViewType] = useState<ProjectViewType>('list');

    const titleEditor = useEditable(project.title, () => {});
    const descriptionEditor = useEditable(project.description, () => {});

    useEffect(() => {
        setTags(project.tags || []);
    }, [project]);

    const isEditing = titleEditor.isEditing || descriptionEditor.isEditing;

    const hierarchicalTasks = useMemo(() => {
        const taskMap = new Map(allTasks.map(t => [t.id, t]));
        const getLevel = (taskId: string | null, level = 0): number => {
            if (!taskId) return 0;
            const task = taskMap.get(taskId);
            if (task?.parentId && taskMap.has(task.parentId)) {
                return getLevel(task.parentId, level + 1);
            }
            return level;
        };

        const topLevelTasks = tasks.filter(t => !t.parentId || !tasks.some(parent => parent.id === t.parentId)).sort((a,b) => tasks.indexOf(a) - tasks.indexOf(b));
        const taskTree: { task: Task; level: number }[] = [];
        const processedIds = new Set<string>();

        const buildTree = (task: Task, level: number) => {
            if (processedIds.has(task.id)) return;
            taskTree.push({ task, level });
            processedIds.add(task.id);
            
            const subtasks = tasks.filter(t => t.parentId === task.id).sort((a,b) => tasks.indexOf(a) - tasks.indexOf(b));
            subtasks.forEach(sub => buildTree(sub, level + 1));
        };

        topLevelTasks.forEach(task => buildTree(task, 0));
        
        // Add any orphaned tasks that might have been missed
        tasks.forEach(task => {
            if(!processedIds.has(task.id)) {
                 taskTree.push({ task, level: getLevel(task.parentId) });
                 processedIds.add(task.id);
            }
        });

        return taskTree;
    }, [tasks, allTasks]);


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

    const isReorderAllowed = (sourceId: string, targetId: string) => {
        const sourceTask = allTasks.find(t => t.id === sourceId);
        const targetTask = allTasks.find(t => t.id === targetId);
        return sourceTask && targetTask && sourceTask.parentId === targetTask.parentId;
    };
    
    const isReparentAllowed = (sourceId: string, targetId: string) => {
        if (sourceId === targetId) return false;

        const isDescendant = (childId: string, parentId: string): boolean => {
            const parent = allTasks.find(t => t.id === parentId);
            if (!parent) return false;
            if (parent.subtaskIds.includes(childId)) return true;
            for (const subtaskId of parent.subtaskIds) {
                if (isDescendant(childId, subtaskId)) return true;
            }
            return false;
        };

        return !isDescendant(targetId, sourceId);
    };

    const handleDragEnd = () => {
        setDraggedTaskId(null);
        setDragOverTaskId(null);
        setReparentTargetId(null);
    };

    const handleDragOver = (e: React.DragEvent<HTMLLIElement>, task: Task) => {
        if (!draggedTaskId || draggedTaskId === task.id) return;
        
        e.preventDefault();
        const rect = e.currentTarget.getBoundingClientRect();
        const threshold = rect.height * 0.4;

        if (e.clientY < rect.top + threshold || e.clientY > rect.bottom - threshold) {
            if (isReorderAllowed(draggedTaskId, task.id)) {
                setDragOverTaskId(task.id);
                setReparentTargetId(null);
            }
        } else {
            if (isReparentAllowed(draggedTaskId, task.id)) {
                setReparentTargetId(task.id);
                setDragOverTaskId(null);
            }
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLLIElement>) => {
        e.preventDefault();
        e.stopPropagation();
        const sourceId = e.dataTransfer.getData('text/plain');

        if (reparentTargetId && sourceId) {
            onReparentTask(sourceId, reparentTargetId);
        } else if (dragOverTaskId && sourceId) {
            onReorderTasks(sourceId, dragOverTaskId);
        }

        handleDragEnd();
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

            <div className="bg-surface/80 backdrop-blur-xl border border-outline rounded-2xl shadow-md mb-6">
                <header className="flex items-center justify-between p-4 border-b border-outline-dark">
                    <div className="flex items-center gap-3">
                        <div className="text-accent"><CheckSquareIcon className="w-6 h-6" /></div>
                        <h3 className="font-bold text-lg font-heading tracking-tight text-text-primary">Tasks</h3>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center bg-background/50 border border-outline-dark rounded-lg p-1">
                            <button onClick={() => setViewType('list')} title="List View" className={`p-1.5 rounded-md transition-colors ${viewType === 'list' ? 'bg-accent text-accent-content' : 'text-text-secondary hover:bg-neutral'}`}>
                                <ListTodoIcon className="w-5 h-5" />
                            </button>
                            <button onClick={() => setViewType('board')} title="Board View" className={`p-1.5 rounded-md transition-colors ${viewType === 'board' ? 'bg-accent text-accent-content' : 'text-text-secondary hover:bg-neutral'}`}>
                                <LayoutGridIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <button onClick={() => setIsAddingTask(true)} className="p-1.5 text-text-secondary hover:bg-neutral hover:text-text-primary rounded-full transition-colors">
                            <PlusIcon className="w-5 h-5" />
                        </button>
                    </div>
                </header>

                <div className="p-4">
                     {viewType === 'list' ? (
                        <>
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
                                <ul className="space-y-1" onDragLeave={handleDragEnd}>
                                    {hierarchicalTasks.map(({ task, level }, index) => (
                                        <li 
                                            key={task.id} 
                                            className={`relative transition-all duration-200 ${draggedTaskId === task.id ? 'opacity-30' : 'opacity-100'} ${index === 0 && !isAddingTask ? 'animate-pop-in' : ''} ${reparentTargetId === task.id ? 'bg-accent/20 rounded-lg' : ''}`}
                                            draggable={true}
                                            onDragStart={(e) => { e.dataTransfer.setData('text/plain', task.id); setDraggedTaskId(task.id); }}
                                            onDragEnd={handleDragEnd}
                                            onDragOver={(e) => handleDragOver(e, task)}
                                            onDrop={handleDrop}
                                        >
                                            {dragOverTaskId === task.id && draggedTaskId !== task.id && (
                                                <div className="absolute -top-1 left-2 right-2 h-1 bg-accent rounded-full" />
                                            )}
                                            <div style={{ paddingLeft: `${level * 24}px` }}>
                                                <TaskItem task={task} allTasks={allTasks} onToggleTask={onToggleTask} onUpdateTask={onUpdateTask} onSelectTask={onSelectTask} />
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : <CardEmptyState>Every great project starts with a single step. Add your first task.</CardEmptyState>}
                        </>
                    ) : (
                        <KanbanBoard tasks={tasks} allTasks={allTasks} onUpdateTaskStage={onUpdateTaskStage} onSelectTask={onSelectTask} onUpdateMultipleTaskStages={onUpdateMultipleTaskStages} />
                    )}
                </div>
            </div>

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
                                    {/* FIX: Check for resource.url instead of non-existent resource.type to determine if it's a link. */}
                                    {resource.url ? <LinkIcon className="w-4 h-4 text-text-tertiary flex-shrink-0" /> : <ResourceIcon className="w-4 h-4 text-text-tertiary flex-shrink-0" />}
                                    <div className="flex-grow">
                                        {/* FIX: Use resource.url for the href attribute and ensure it's a full URL. */}
                                        <a href={resource.url ? (resource.url.startsWith('http') ? resource.url : `https://${resource.url}`) : undefined} target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-accent">{resource.title}</a>
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

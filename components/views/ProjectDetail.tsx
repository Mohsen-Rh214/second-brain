import React, { useState, useEffect, useMemo, useRef } from 'react';
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
import { useDraggableList } from '../../hooks/useDraggableList';
import { useData } from '../../store/DataContext';
import { stripHtml } from '../../utils';

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
    onAddSubtask: (parentTaskId: string, subtaskData: NewItemPayload) => void;
    onReparentTask: (taskId: string, newParentId: string) => void;
    onUpdateTask: (taskId: string, updates: Partial<Pick<Task, 'title' | 'priority' | 'dueDate'>>) => void;
    onUpdateTaskStage: (taskId: string, newStage: TaskStage) => void;
    onUpdateMultipleTaskStages: (taskIds: string[], newStage: TaskStage) => void;
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({ project, allTasks, tasks, notes, resources, onToggleTask, onArchive, onDelete, onSelectNote, onSelectTask, onUpdateProject, onOpenCaptureModal, onSaveNewItem, onAddSubtask, onReparentTask, onUpdateTask, onUpdateTaskStage, onUpdateMultipleTaskStages }) => {
    
    const [isAddingTask, setIsAddingTask] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [addingSubtaskTo, setAddingSubtaskTo] = useState<string | null>(null);
    const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
    const [tags, setTags] = useState(project.tags || []);
    const [viewType, setViewType] = useState<ProjectViewType>('list');
    const [collapsedTasks, setCollapsedTasks] = useState<Set<string>>(new Set());
    const [activeTab, setActiveTab] = useState<'active' | 'done'>('active');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { dispatch } = useData();
    const addTaskInputRef = useRef<HTMLInputElement>(null);

    const titleEditor = useEditable(project.title, () => {});
    const descriptionEditor = useEditable(project.description, () => {});

    useEffect(() => {
        setTags(project.tags || []);
        setAddingSubtaskTo(null);
        setIsAddingTask(false);
    }, [project]);

    const isEditing = titleEditor.isEditing || descriptionEditor.isEditing;

    const { activeTasks, doneTasks } = useMemo(() => {
        const active = tasks.filter(t => t.stage !== 'Done');
        const done = tasks.filter(t => t.stage === 'Done')
            .sort((a, b) => new Date(b.completedAt || 0).getTime() - new Date(a.completedAt || 0).getTime());
        return { activeTasks: active, doneTasks: done };
    }, [tasks]);

    const taskMap = useMemo(() => new Map(allTasks.map(t => [t.id, t])), [allTasks]);
    
    const hierarchicalTasks = useMemo(() => {
        const activeTaskMapForProject = new Map(
            allTasks
                .filter(t => t.projectId === project.id && t.status === 'active' && t.stage !== 'Done')
                .map(t => [t.id, t])
        );

        const topLevelTasks = project.taskIds
            .map(id => activeTaskMapForProject.get(id))
            .filter((t): t is Task => !!t);
        
        const orderedTopLevelIds = new Set(topLevelTasks.map(t => t.id));
        activeTaskMapForProject.forEach(task => {
            if (!orderedTopLevelIds.has(task.id) && (!task.parentId || !activeTaskMapForProject.has(task.parentId))) {
                topLevelTasks.push(task);
                orderedTopLevelIds.add(task.id);
            }
        });

        const taskTree: { task: Task; level: number }[] = [];
        const visitedTasks = new Set<string>();
        
        const buildTree = (task: Task, level: number) => {
            if (visitedTasks.has(task.id)) return;
            visitedTasks.add(task.id);

            taskTree.push({ task, level });
            if (task.subtaskIds && task.subtaskIds.length > 0) {
                 task.subtaskIds
                    .map(id => activeTaskMapForProject.get(id))
                    .filter((t): t is Task => !!t)
                    .forEach(sub => buildTree(sub, level + 1));
            }
        };

        topLevelTasks.forEach(task => buildTree(task, 0));
        return taskTree;
    }, [project, allTasks]);


    const isReparentAllowed = (sourceTask: Task, targetTask: Task): boolean => {
        if (sourceTask.id === targetTask.id) return false;
        
        const isDescendant = (childId: string, parentId: string): boolean => {
            const parent = taskMap.get(parentId);
            if (!parent) return false;
            if ((parent.subtaskIds || []).includes(childId)) return true;
            for (const subtaskId of (parent.subtaskIds || [])) {
                if (isDescendant(childId, subtaskId)) return true;
            }
            return false;
        };
        return !isDescendant(targetTask.id, sourceTask.id);
    };
    
    const { draggedId, dropAction, getDragAndDropProps, getContainerProps } = useDraggableList<Task>({
        items: allTasks,
        onReorder: (sourceId, targetId) => {
            const sourceTask = taskMap.get(sourceId);
            if (sourceTask) {
                if (sourceTask.parentId) {
                    dispatch({ type: 'REORDER_CHILD_LIST', payload: {
                        parentListKey: 'tasks',
                        parentId: sourceTask.parentId,
                        childIdListKey: 'subtaskIds',
                        sourceId,
                        targetId
                    }});
                } else {
                    dispatch({ type: 'REORDER_CHILD_LIST', payload: {
                        parentListKey: 'projects',
                        parentId: project.id,
                        childIdListKey: 'taskIds',
                        sourceId,
                        targetId
                    }});
                }
            }
        },
        onReparent: (sourceId, targetId) => onReparentTask(sourceId, targetId),
        isReorderAllowed: (sourceTask, targetTask) => sourceTask.parentId === targetTask.parentId,
        isReparentAllowed,
        isPromotable: (task) => !!task.parentId,
        onPromote: (taskId) => {
            dispatch({ type: 'PROMOTE_SUBTASK', payload: { taskId } });
        },
    });


    const toggleTaskCollapse = (taskId: string) => {
        setCollapsedTasks(prev => {
            const newSet = new Set(prev);
            if (newSet.has(taskId)) {
                newSet.delete(taskId);
            } else {
                newSet.add(taskId);
            }
            return newSet;
        });
    };

    const isTaskVisible = (task: Task): boolean => {
        let current = task;
        while (current.parentId) {
            if (collapsedTasks.has(current.parentId)) {
                return false;
            }
            const parent = taskMap.get(current.parentId);
            if (!parent) break;
            current = parent;
        }
        return true;
    };
    
    const visibleTasks = useMemo(() => {
        return hierarchicalTasks.filter(({ task }) => isTaskVisible(task));
    }, [hierarchicalTasks, collapsedTasks, taskMap]);


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
            addTaskInputRef.current?.focus();
        }
    };
    
    const handleAddSubtask = (e: React.FormEvent) => {
        e.preventDefault();
        if (newSubtaskTitle.trim() && addingSubtaskTo) {
            onAddSubtask(addingSubtaskTo, { title: newSubtaskTitle.trim() });
            setNewSubtaskTitle('');
            setAddingSubtaskTo(null);
        }
    };

    const handleAddTaskFormBlur = (e: React.FocusEvent<HTMLFormElement>) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
            setIsAddingTask(false);
        }
    }
    
    const handleAddSubtaskFormBlur = (e: React.FocusEvent<HTMLFormElement>) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
            setAddingSubtaskTo(null);
        }
    }

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
                          isOpen={isMenuOpen}
                          onToggle={() => setIsMenuOpen(!isMenuOpen)}
                          onEdit={handleEdit}
                          onArchive={() => onArchive(project.id)}
                          onDelete={() => onDelete(project.id)}
                       />
                    </div>
                </div>
            </header>

            <div className="border-b border-outline-dark mb-6">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab('active')}
                        className={`whitespace-nowrap py-3 px-1 border-b-2 font-semibold text-sm transition-colors ${
                            activeTab === 'active'
                            ? 'border-accent text-accent'
                            : 'border-transparent text-text-secondary hover:text-text-primary hover:border-text-tertiary'
                        }`}
                    >
                        Active <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${activeTab === 'active' ? 'bg-accent/20 text-accent' : 'bg-surface text-text-secondary'}`}>{activeTasks.length}</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('done')}
                        className={`whitespace-nowrap py-3 px-1 border-b-2 font-semibold text-sm transition-colors ${
                            activeTab === 'done'
                            ? 'border-accent text-accent'
                            : 'border-transparent text-text-secondary hover:text-text-primary hover:border-text-tertiary'
                        }`}
                    >
                        Done <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${activeTab === 'done' ? 'bg-accent/20 text-accent' : 'bg-surface text-text-secondary'}`}>{doneTasks.length}</span>
                    </button>
                </nav>
            </div>

            {activeTab === 'active' ? (
                <div className="animate-pop-in">
                    <Card 
                        icon={<CheckSquareIcon className="w-6 h-6" />} 
                        title="Tasks"
                        className="mb-6"
                        isCollapsible
                        defaultOpen
                        onAdd={() => setIsAddingTask(true)}
                        headerPadding="p-0"
                        bodyPadding="p-4"
                    >
                        <div slot="header-content" className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-3">
                                <div className="text-accent"><CheckSquareIcon className="w-6 h-6" /></div>
                                <h3 className="font-bold text-lg font-heading tracking-tight text-text-primary">Tasks</h3>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex items-center bg-background/50 border border-outline-dark rounded-lg p-1">
                                    <button onClick={(e) => {e.stopPropagation(); setViewType('list');}} title="List View" className={`p-1.5 rounded-md transition-colors ${viewType === 'list' ? 'bg-accent text-accent-content' : 'text-text-secondary hover:bg-neutral'}`}>
                                        <ListTodoIcon className="w-5 h-5" />
                                    </button>
                                    <button onClick={(e) => {e.stopPropagation(); setViewType('board');}} title="Board View" className={`p-1.5 rounded-md transition-colors ${viewType === 'board' ? 'bg-accent text-accent-content' : 'text-text-secondary hover:bg-neutral'}`}>
                                        <LayoutGridIcon className="w-5 h-5" />
                                    </button>
                                </div>
                                <button onClick={(e) => { e.stopPropagation(); setIsAddingTask(true); }} className="p-1.5 text-text-secondary hover:bg-neutral hover:text-text-primary rounded-full transition-colors">
                                    <PlusIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        {viewType === 'list' ? (
                            <>
                                {isAddingTask && (
                                    <form onSubmit={handleAddTask} onBlur={handleAddTaskFormBlur} className="flex gap-2 mb-4 p-2 bg-background/50 rounded-lg border border-outline-dark animate-pop-in">
                                        <input
                                            ref={addTaskInputRef}
                                            type="text"
                                            value={newTaskTitle}
                                            onChange={(e) => setNewTaskTitle(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Escape' && setIsAddingTask(false)}
                                            placeholder="What needs to be done?"
                                            autoFocus
                                            className="flex-1 bg-transparent border-none px-2 py-1 text-sm text-text-primary focus:outline-none"
                                        />
                                        <button type="submit" className="px-3 py-1 text-xs font-medium bg-secondary hover:bg-secondary-hover text-secondary-content transition-all rounded-md active:scale-95">Add Task</button>
                                    </form>
                                )}
                                {activeTasks.length > 0 ? (
                                    <ul className={`space-y-1 transition-all duration-200 ${
                                        dropAction?.type === 'PROMOTE_TO_ROOT' ? 'bg-accent/20 outline-dashed outline-2 outline-offset-2 outline-accent rounded-lg p-2' : ''
                                    }`} {...getContainerProps()}>
                                        {visibleTasks.map(({ task, level }, index) => (
                                            <React.Fragment key={task.id}>
                                                <li 
                                                    {...getDragAndDropProps(task.id)}
                                                    className={`relative transition-all duration-200 ${draggedId === task.id ? 'opacity-30' : 'opacity-100'} ${index === 0 && !isAddingTask ? 'animate-pop-in' : ''} ${dropAction?.type === 'REPARENT' && dropAction.targetId === task.id ? 'bg-accent/20 rounded-lg ring-2 ring-inset ring-accent' : ''}`}
                                                >
                                                    {dropAction?.type === 'REORDER' && dropAction.targetId === task.id && (
                                                        <div className="absolute -top-4 left-0 right-0 h-8 bg-accent/20 rounded-lg border border-dashed border-accent" />
                                                    )}
                                                    <div style={{ paddingLeft: `${level * 12}px` }}>
                                                        <TaskItem 
                                                            task={task} 
                                                            allTasks={allTasks} 
                                                            notes={notes}
                                                            resources={resources}
                                                            onToggleTask={onToggleTask} 
                                                            onUpdateTask={onUpdateTask} 
                                                            onSelectTask={onSelectTask}
                                                            hasSubtasks={(task.subtaskIds?.length || 0) > 0}
                                                            isCollapsed={collapsedTasks.has(task.id)}
                                                            onToggleCollapse={() => toggleTaskCollapse(task.id)}
                                                            onArchive={onArchive}
                                                            onDelete={onDelete}
                                                            onAddSubtaskClick={() => { setAddingSubtaskTo(task.id); setNewSubtaskTitle(''); }}
                                                        />
                                                    </div>
                                                </li>
                                                {addingSubtaskTo === task.id && (
                                                    <li style={{ paddingLeft: `${(level + 1) * 24}px` }} className="py-1 animate-pop-in">
                                                        <form onSubmit={handleAddSubtask} onBlur={handleAddSubtaskFormBlur} className="flex gap-2">
                                                            <input
                                                                type="text"
                                                                value={newSubtaskTitle}
                                                                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                                                                onKeyDown={(e) => e.key === 'Escape' && setAddingSubtaskTo(null)}
                                                                placeholder="Add subtask..."
                                                                autoFocus
                                                                className="flex-1 bg-background/50 border border-outline px-2 py-1 text-sm rounded-md focus:ring-1 focus:ring-accent focus:outline-none"
                                                            />
                                                        </form>
                                                    </li>
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </ul>
                                ) : <CardEmptyState>Every great project starts with a single step. Add your first task.</CardEmptyState>}
                            </>
                        ) : (
                            <KanbanBoard tasks={activeTasks} allTasks={allTasks} onUpdateTaskStage={onUpdateTaskStage} onSelectTask={onSelectTask} onUpdateMultipleTaskStages={onUpdateMultipleTaskStages} />
                        )}
                    </Card>
                </div>
            ) : (
                <div className="animate-pop-in">
                    <Card icon={<CheckSquareIcon className="w-6 h-6 text-accent" />} title="Completed Tasks" className="mb-6">
                        {doneTasks.length > 0 ? (
                            <ul className="space-y-1">
                                {doneTasks.map(task => (
                                    <li key={task.id}>
                                        <TaskItem 
                                            task={task}
                                            allTasks={allTasks}
                                            onToggleTask={onToggleTask}
                                            onUpdateTask={onUpdateTask}
                                            onSelectTask={onSelectTask}
                                        />
                                    </li>
                                ))}
                            </ul>
                        ) : <CardEmptyState>No completed tasks in this project yet.</CardEmptyState>}
                    </Card>
                </div>
            )}


            <Card icon={<FileTextIcon className="w-6 h-6" />} title="Notes" onAdd={() => onOpenCaptureModal({ parentId: project.id, itemType: 'note' })} isCollapsible defaultOpen className="mb-6">
                 {notes.length > 0 ? (
                    <ul className="space-y-2">
                        {notes.map(note => (
                            <li key={note.id}>
                                <button onClick={() => onSelectNote(note.id)} className="w-full text-left p-3 hover:bg-neutral rounded-lg transition-colors">
                                    <p className="font-semibold">{note.title}</p>
                                    <p className="text-sm text-text-secondary truncate mt-1">{stripHtml(note.content)}</p>
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
                                    {resource.url ? <LinkIcon className="w-4 h-4 text-text-tertiary flex-shrink-0" /> : <ResourceIcon className="w-4 h-4 text-text-tertiary flex-shrink-0" />}
                                    <div className="flex-grow">
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
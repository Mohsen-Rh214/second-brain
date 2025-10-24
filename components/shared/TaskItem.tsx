import React, { useMemo } from 'react';
import { Task, Note, Resource } from '../../types';
import { CheckSquareIcon, SquareIcon, CalendarIcon, FlagIcon, LinkIcon, FileTextIcon, ClipboardCheckIcon, ChevronDownIcon, PlusIcon, ResourceIcon } from './icons';
import { useEditable } from '../../hooks/useEditable';
import TagList from './TagList';
import ActionMenu from './ActionMenu';
import { formatRelativeTime } from '../../utils';

const priorityClasses: Record<string, { text: string, bg: string }> = {
    High: { text: 'text-priority-high', bg: 'bg-priority-high-bg' },
    Medium: { text: 'text-priority-medium', bg: 'bg-priority-medium-bg' },
    Low: { text: 'text-priority-low', bg: 'bg-priority-low-bg' },
};

interface TaskItemProps {
    task: Task;
    allTasks?: Task[];
    notes?: Note[];
    resources?: Resource[];
    onToggleTask: (id: string) => void;
    onUpdateTask: (id: string, updates: Partial<Pick<Task, 'title' | 'priority' | 'dueDate'>>) => void;
    onSelectTask?: (id: string) => void;
    projectName?: string;
    onLinkTask?: (id: string) => void;
    isFadingOut?: boolean;
    // New props for project view enhancements
    hasSubtasks?: boolean;
    isCollapsed?: boolean;
    onToggleCollapse?: () => void;
    onArchive?: (id: string) => void;
    onDelete?: (id: string) => void;
    onAddSubtaskClick?: () => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ 
    task, allTasks = [], notes = [], resources = [], onToggleTask, onUpdateTask, onSelectTask, projectName, onLinkTask, isFadingOut,
    hasSubtasks, isCollapsed, onToggleCollapse, onArchive, onDelete, onAddSubtaskClick
}) => {
    const { isEditing, value, setValue, handleEdit, handleSave, handleKeyDown, inputRef } = useEditable(task.title, (newTitle) => {
      if(newTitle) onUpdateTask(task.id, { title: newTitle });
    });
    const isVisuallyCompleted = task.stage === 'Done' || isFadingOut;

    const subtaskProgress = useMemo(() => {
        if (!task.subtaskIds || task.subtaskIds.length === 0) return null;
        const completed = task.subtaskIds.filter(id => allTasks.find(t => t.id === id)?.stage === 'Done').length;
        return { completed, total: task.subtaskIds.length };
    }, [task.subtaskIds, allTasks]);

    const linkedItems = useMemo(() => {
        const linkedNotes = (task.noteIds || [])
            .map(id => notes.find(n => n.id === id))
            .filter((n): n is Note => !!n);
        const linkedResources = (task.resourceIds || [])
            .map(id => resources.find(r => r.id === id))
            .filter((r): r is Resource => !!r);
        return [...linkedNotes, ...linkedResources];
    }, [task.noteIds, task.resourceIds, notes, resources]);

    const hasLinkedItems = linkedItems.length > 0;

    const handleTitleClick = (e: React.MouseEvent) => {
        // Prevent modal from opening if we're clicking a link or other interactive element inside
        if ((e.target as HTMLElement).closest('a, button')) return;
        onSelectTask?.(task.id);
    }
    
    const handleArchive = () => onArchive?.(task.id);
    const handleDelete = () => onDelete?.(task.id);

    if (isEditing) {
        return (
            <div className="flex items-center gap-3 p-2 rounded-lg bg-background/50">
                <button onClick={() => onToggleTask(task.id)} aria-label={isVisuallyCompleted ? 'Mark as incomplete' : 'Mark as complete'}>
                    {isVisuallyCompleted ? <CheckSquareIcon className="w-5 h-5 text-accent" /> : <SquareIcon className="w-5 h-5 text-text-tertiary" />}
                </button>
                <input
                    ref={inputRef}
                    type="text"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onBlur={handleSave}
                    onKeyDown={handleKeyDown}
                    className="flex-1 bg-background/50 border border-outline px-2 py-1 text-sm rounded-md focus:ring-1 focus:ring-accent focus:outline-none"
                />
            </div>
        );
    }

    return (
        <div className="flex items-center gap-3 p-2 group hover:bg-neutral rounded-lg transition-all duration-300 ease-soft">
            {hasSubtasks && onToggleCollapse ? (
                <button onClick={onToggleCollapse} className="p-1 rounded-full hover:bg-neutral-hover text-text-secondary">
                    <ChevronDownIcon className={`w-4 h-4 transition-transform duration-200 ${isCollapsed ? '-rotate-90' : ''}`} />
                </button>
            ) : (
                <div className="w-6 h-6 flex-shrink-0"></div> // Placeholder for alignment
            )}
            <button onClick={() => onToggleTask(task.id)} aria-label={isVisuallyCompleted ? 'Mark as incomplete' : 'Mark as complete'} className="flex-shrink-0 text-text-secondary hover:text-accent">
                {isVisuallyCompleted ? <CheckSquareIcon className="w-5 h-5 text-accent" /> : <SquareIcon className="w-5 h-5" />}
            </button>
            <div onDoubleClick={handleEdit} className="flex-1 min-w-0" onClick={handleTitleClick} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onSelectTask?.(task.id)}>
                <span className={`cursor-pointer ${isVisuallyCompleted ? 'line-through text-text-tertiary' : ''}`}>{task.title}</span>
                <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-1 text-xs text-text-tertiary">
                    {projectName && <p className="text-xs text-text-secondary">{projectName}</p>}
                    <TagList tags={task.tags} />
                    {task.description && <FileTextIcon className="w-3.5 h-3.5" title="Has description" />}
                    {subtaskProgress && <span className="flex items-center gap-1" title="Subtasks"><ClipboardCheckIcon className="w-3.5 h-3.5" /> {subtaskProgress.completed}/{subtaskProgress.total}</span>}
                    {linkedItems.slice(0, 2).map(item => (
                        <span key={item.id} className="flex items-center gap-1 bg-background/50 px-1.5 py-0.5 rounded-md border border-outline">
                            {item.id.startsWith('note-') ? <FileTextIcon className="w-3 h-3" /> : <ResourceIcon className="w-3 h-3" />}
                            <span className="truncate max-w-[100px]">{item.title}</span>
                        </span>
                    ))}
                    {linkedItems.length > 2 && <span className="text-xs font-semibold bg-background/50 px-1.5 py-0.5 rounded-md border border-outline">+{linkedItems.length - 2} more</span>}
                </div>
            </div>
            
            {task.stage === 'Done' && task.completedAt ? (
                 <div 
                    className="flex items-center gap-1 text-xs text-text-tertiary ml-auto flex-shrink-0"
                    title={`Completed on ${new Date(task.completedAt).toLocaleString()}`}
                >
                    <span>{formatRelativeTime(task.completedAt)}</span>
                </div>
            ) : (
                <>
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
                </>
            )}

            {hasSubtasks && onAddSubtaskClick && (
                 <button 
                    onClick={onAddSubtaskClick} 
                    aria-label="Add subtask"
                    className="p-1 text-text-tertiary hover:text-accent opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <PlusIcon className="w-4 h-4" />
                </button>
            )}

            {!task.projectId && onLinkTask && (
                <button 
                    onClick={() => onLinkTask(task.id)} 
                    aria-label="Link task to project"
                    className="p-1 text-text-tertiary hover:text-accent opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <LinkIcon className="w-4 h-4" />
                </button>
            )}
             {(onArchive || onDelete) && (
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <ActionMenu onArchive={handleArchive} onDelete={handleDelete} />
                </div>
            )}
        </div>
    );
};

export default React.memo(TaskItem);
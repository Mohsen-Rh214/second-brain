import React, { useMemo, useState } from 'react';
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
    showHierarchy?: boolean;
}

const TaskItem: React.FC<TaskItemProps> = ({ 
    task, allTasks = [], notes = [], resources = [], onToggleTask, onUpdateTask, onSelectTask, projectName, onLinkTask, isFadingOut,
    hasSubtasks, isCollapsed, onToggleCollapse, onArchive, onDelete, onAddSubtaskClick, showHierarchy = false
}) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
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

    const handleTitleClick = (e: React.MouseEvent) => {
        if ((e.target as HTMLElement).closest('a, button')) return;
        onSelectTask?.(task.id);
    }
    
    const handleArchive = () => onArchive?.(task.id);
    const handleDelete = () => onDelete?.(task.id);

    const StatusIndicators = () => (
        <>
            {task.dueDate && task.stage !== 'Done' && (
                <div className="flex items-center gap-1 text-xs text-text-secondary">
                    <CalendarIcon className="w-4 h-4" />
                    {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </div>
            )}
            {task.priority && task.stage !== 'Done' && priorityClasses[task.priority] && (
                <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${priorityClasses[task.priority].bg} ${priorityClasses[task.priority].text}`}>
                    <FlagIcon className="w-3 h-3" />
                    {task.priority}
                </div>
            )}
            {task.stage === 'Done' && task.completedAt && (
                <div className="flex items-center gap-1 text-xs text-text-tertiary" title={`Completed on ${new Date(task.completedAt).toLocaleString()}`}>
                    <span>{formatRelativeTime(task.completedAt)}</span>
                </div>
            )}
        </>
    );

    const ActionButtons = () => (
        <>
            {hasSubtasks && onAddSubtaskClick && (
                <button onClick={onAddSubtaskClick} aria-label="Add subtask" className="p-1 text-text-tertiary hover:text-accent opacity-0 group-hover:opacity-100 transition-opacity"><PlusIcon className="w-4 h-4" /></button>
            )}
            {!task.projectId && onLinkTask && (
                <button onClick={() => onLinkTask(task.id)} aria-label="Link task to project" className="p-1 text-text-tertiary hover:text-accent opacity-0 group-hover:opacity-100 transition-opacity"><LinkIcon className="w-4 h-4" /></button>
            )}
            {(onArchive || onDelete) && (
                <div className={`transition-opacity ${isMenuOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}><ActionMenu isOpen={isMenuOpen} onToggle={() => setIsMenuOpen(!isMenuOpen)} onArchive={handleArchive} onDelete={handleDelete} /></div>
            )}
        </>
    );


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
        <div className="flex items-start gap-3 p-2 group hover:bg-neutral rounded-lg transition-all duration-300 ease-soft">
            <div className="flex-shrink-0 flex pt-1">
                {showHierarchy && (hasSubtasks && onToggleCollapse ? (
                    <button onClick={onToggleCollapse} className="p-1 rounded-full hover:bg-neutral-hover text-text-secondary -ml-1">
                        <ChevronDownIcon className={`w-4 h-4 transition-transform duration-200 ${isCollapsed ? '-rotate-90' : ''}`} />
                    </button>
                ) : showHierarchy ? (
                    <div className="w-5 h-5 flex-shrink-0"></div>
                ) : null)}
                <button onClick={() => onToggleTask(task.id)} aria-label={isVisuallyCompleted ? 'Mark as incomplete' : 'Mark as complete'} className="text-text-secondary hover:text-accent">
                    {isVisuallyCompleted ? <CheckSquareIcon className="w-5 h-5 text-accent" /> : <SquareIcon className="w-5 h-5" />}
                </button>
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2">
                    <div 
                        className="flex-1 min-w-0" 
                        onClick={handleTitleClick} 
                        role="button" 
                        tabIndex={0} 
                        onKeyDown={(e) => e.key === 'Enter' && onSelectTask?.(task.id)}
                    >
                        <span onDoubleClick={handleEdit} className={`cursor-pointer ${isVisuallyCompleted ? 'line-through text-text-tertiary' : ''}`}>{task.title}</span>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
                        <StatusIndicators />
                        <ActionButtons />
                    </div>
                </div>

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
                
                <div className="sm:hidden flex justify-between items-center mt-2">
                    <div className="flex items-center gap-2 flex-wrap">
                        <StatusIndicators />
                    </div>
                    <div className="flex items-center flex-shrink-0">
                        <ActionButtons />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default React.memo(TaskItem);

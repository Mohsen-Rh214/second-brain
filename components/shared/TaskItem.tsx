import React, { useRef } from 'react';
import { Task } from '../../types';
import { CheckSquareIcon, SquareIcon, CalendarIcon, FlagIcon, LinkIcon } from './icons';
import { useEditable } from '../../hooks/useEditable';

const priorityClasses: Record<string, { text: string, bg: string }> = {
    High: { text: 'text-priority-high', bg: 'bg-priority-high-bg' },
    Medium: { text: 'text-priority-medium', bg: 'bg-priority-medium-bg' },
    Low: { text: 'text-priority-low', bg: 'bg-priority-low-bg' },
};

interface TaskItemProps {
    task: Task;
    onToggleTask: (id: string) => void;
    onUpdateTask: (id: string, updates: Partial<Pick<Task, 'title' | 'priority' | 'dueDate'>>) => void;
    projectName?: string;
    onLinkTask?: (id: string) => void;
    isFadingOut?: boolean;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onToggleTask, onUpdateTask, projectName, onLinkTask, isFadingOut }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const titleEditor = useEditable(task.title, (newTitle) => onUpdateTask(task.id, { title: newTitle }));
    const isVisuallyCompleted = task.completed || isFadingOut;

    const handleDoubleClick = () => {
        if (!isVisuallyCompleted) {
            titleEditor.handleEdit();
            setTimeout(() => inputRef.current?.focus(), 0);
        }
    };

    if (titleEditor.isEditing) {
        return (
            <div className="flex items-center gap-3 p-2 rounded-lg">
                <button onClick={() => onToggleTask(task.id)} aria-label={isVisuallyCompleted ? 'Mark as incomplete' : 'Mark as complete'}>
                    {isVisuallyCompleted ? <CheckSquareIcon className="w-5 h-5 text-accent" /> : <SquareIcon className="w-5 h-5 text-text-tertiary" />}
                </button>
                <input
                    ref={inputRef}
                    type="text"
                    value={titleEditor.value}
                    onChange={(e) => titleEditor.setValue(e.target.value)}
                    onBlur={titleEditor.handleSave}
                    onKeyDown={titleEditor.handleKeyDown}
                    className="flex-1 bg-background/50 border border-outline px-2 py-1 text-sm rounded-md focus:ring-1 focus:ring-accent focus:outline-none"
                />
            </div>
        );
    }

    return (
        <div className="flex items-center gap-3 p-2 group hover:bg-neutral rounded-lg transition-all duration-300 ease-soft">
            <button onClick={() => onToggleTask(task.id)} aria-label={isVisuallyCompleted ? 'Mark as incomplete' : 'Mark as complete'} className="flex-shrink-0 text-text-secondary hover:text-accent">
                {isVisuallyCompleted ? <CheckSquareIcon className="w-5 h-5 text-accent" /> : <SquareIcon className="w-5 h-5" />}
            </button>
            <div className="flex-1" onDoubleClick={handleDoubleClick}>
                <span className={`cursor-pointer ${isVisuallyCompleted ? 'line-through text-text-tertiary' : ''}`}>{task.title}</span>
                {projectName && <p className="text-xs text-text-secondary">{projectName}</p>}
            </div>
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
            {!task.projectId && onLinkTask && (
                <button 
                    onClick={() => onLinkTask(task.id)} 
                    aria-label="Link task to project"
                    className="p-1 text-text-tertiary hover:text-accent opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <LinkIcon className="w-4 h-4" />
                </button>
            )}
        </div>
    );
};

export default React.memo(TaskItem);
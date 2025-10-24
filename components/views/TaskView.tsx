import React, { useState, useMemo } from 'react';
import { Task, Project } from '../../types';
import { CheckSquareIcon, SquareIcon, ListTodoIcon, FlagIcon, CalendarIcon } from '../shared/icons';
import EmptyState from '../shared/EmptyState';

interface TaskViewProps {
    tasks: Task[];
    projects: Project[];
    onToggleTask: (taskId: string) => void;
}

type GroupBy = 'project' | 'dueDate' | 'priority';

const priorityOrder: Record<string, number> = { High: 1, Medium: 2, Low: 3 };

const priorityClasses: Record<string, { text: string, bg: string }> = {
    High: { text: 'text-priority-high', bg: 'bg-priority-high-bg' },
    Medium: { text: 'text-priority-medium', bg: 'bg-priority-medium-bg' },
    Low: { text: 'text-priority-low', bg: 'bg-priority-low-bg' },
};

const TaskView: React.FC<TaskViewProps> = ({ tasks, projects, onToggleTask }) => {
    const [groupBy, setGroupBy] = useState<GroupBy>('project');

    const activeTasks = useMemo(() => tasks.filter(t => t.status === 'active'), [tasks]);

    const groupedTasks = useMemo(() => {
        if (groupBy === 'project') {
            return activeTasks.reduce((acc, task) => {
                const project = projects.find(p => p.id === task.projectId);
                const key = project ? project.title : 'No Project';
                if (!acc[key]) acc[key] = [];
                acc[key].push(task);
                return acc;
            }, {} as Record<string, Task[]>);
        }

        if (groupBy === 'priority') {
            return activeTasks.reduce((acc, task) => {
                const key = task.priority || 'No Priority';
                if (!acc[key]) acc[key] = [];
                acc[key].push(task);
                return acc;
            }, {} as Record<string, Task[]>);
        }

        if (groupBy === 'dueDate') {
             return activeTasks.reduce((acc, task) => {
                const key = task.dueDate ? new Date(task.dueDate).toDateString() : 'No Due Date';
                if (!acc[key]) acc[key] = [];
                acc[key].push(task);
                return acc;
            }, {} as Record<string, Task[]>);
        }

        return {};
    }, [activeTasks, projects, groupBy]);

    const getSortedGroupKeys = (groups: Record<string, Task[]>) => {
        const keys = Object.keys(groups);
        if (groupBy === 'priority') {
            return keys.sort((a, b) => (priorityOrder[a] || 4) - (priorityOrder[b] || 4));
        }
        if (groupBy === 'dueDate') {
            return keys.sort((a, b) => {
                if (a === 'No Due Date') return 1;
                if (b === 'No Due Date') return -1;
                return new Date(a).getTime() - new Date(b).getTime()
            });
        }
        if (groupBy === 'project') {
            return keys.sort((a, b) => {
                if (a === 'No Project') return 1;
                if (b === 'No Project') return -1;
                return a.localeCompare(b);
            });
        }
        return keys.sort();
    }

    const sortedGroupKeys = getSortedGroupKeys(groupedTasks);

    return (
        <div className="custom-scrollbar h-full">
            <header className="mb-8">
                <h1 className="text-3xl font-bold font-heading">All Tasks</h1>
                <p className="text-text-secondary">A complete list of all your active tasks.</p>
            </header>

            <div className="mb-6 flex items-center gap-4 sticky top-0 bg-background/80 backdrop-blur-sm py-4 z-10">
                <span className="text-sm font-medium text-text-secondary">Group by:</span>
                <div className="flex gap-2">
                    {(['project', 'priority', 'dueDate'] as GroupBy[]).map(option => (
                        <button
                            key={option}
                            onClick={() => setGroupBy(option)}
                            className={`px-3 py-1 text-sm transition-colors border rounded-lg ${groupBy === option ? 'bg-accent text-accent-content border-accent' : 'bg-surface/80 border-outline-dark hover:bg-neutral'}`}
                        >
                            {option === 'dueDate' ? 'Due Date' : option.charAt(0).toUpperCase() + option.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {activeTasks.length === 0 ? (
                 <EmptyState
                    icon={<ListTodoIcon />}
                    title="All Clear!"
                    description="You have no active tasks. Enjoy the peace, or capture a new task to get things moving."
                />
            ) : (
                <div className="space-y-6">
                    {sortedGroupKeys.map(groupKey => (
                        <section key={groupKey}>
                            <h2 className="text-lg font-bold text-text-primary mb-3 font-heading">{groupKey}</h2>
                            <ul className="space-y-2">
                                {groupedTasks[groupKey].map(task => (
                                     <li key={task.id} className="flex items-center gap-3 p-3 bg-surface/80 backdrop-blur-xl border border-outline rounded-xl shadow-sm">
                                        <button onClick={() => onToggleTask(task.id)} aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}>
                                            {task.completed ? <CheckSquareIcon className="w-5 h-5 text-accent" /> : <SquareIcon className="w-5 h-5 text-text-tertiary" />}
                                        </button>
                                        <div className="flex-1">
                                            <p className={`${task.completed ? 'line-through text-text-tertiary' : ''}`}>{task.title}</p>
                                            {groupBy !== 'project' && <p className="text-xs text-text-tertiary">{projects.find(p => p.id === task.projectId)?.title || 'No Project'}</p>}
                                        </div>
                                         {task.dueDate && groupBy !== 'dueDate' && (
                                            <div className="flex items-center gap-1 text-xs text-text-secondary">
                                                <CalendarIcon className="w-4 h-4" />
                                                {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                            </div>
                                        )}
                                        {task.priority && groupBy !== 'priority' && priorityClasses[task.priority] && (
                                            <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${priorityClasses[task.priority].bg} ${priorityClasses[task.priority].text}`}>
                                                <FlagIcon className="w-3 h-3" />
                                                {task.priority}
                                            </div>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </section>
                    ))}
                </div>
            )}
        </div>
    );
};

export default React.memo(TaskView);
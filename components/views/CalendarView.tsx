import React, { useState, useMemo } from 'react';
import { Task, Project, View } from '../../types';
import { ChevronLeftIcon, ChevronRightIcon } from '../shared/icons';

interface CalendarViewProps {
    tasks: Task[];
    projects: Project[];
    onNavigate: (view: View, itemId: string) => void;
}

const priorityClasses: Record<string, string> = {
    High: 'bg-priority-high',
    Medium: 'bg-priority-medium',
    Low: 'bg-priority-low',
};

const CalendarView: React.FC<CalendarViewProps> = ({ tasks, projects, onNavigate }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const tasksByDate = useMemo(() => {
        const map = new Map<string, Task[]>();
        tasks.forEach(task => {
            if (task.dueDate) {
                const dateKey = new Date(task.dueDate).toISOString().split('T')[0];
                if (!map.has(dateKey)) {
                    map.set(dateKey, []);
                }
                map.get(dateKey)!.push(task);
            }
        });
        return map;
    }, [tasks]);

    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDate = new Date(startOfMonth);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    const endDate = new Date(endOfMonth);
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));

    const days = [];
    let day = new Date(startDate);

    while (day <= endDate) {
        days.push(new Date(day));
        day.setDate(day.getDate() + 1);
    }
    
    const today = new Date();
    today.setHours(0,0,0,0);

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const handleToday = () => {
        setCurrentDate(new Date());
    };

    const handleTaskClick = (task: Task) => {
        if(task.projectId) {
            onNavigate('projects', task.projectId);
        }
    }

    return (
        <div className="flex flex-col h-full">
            <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-heading">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h1>
                    <p className="text-text-secondary">A monthly overview of your tasks.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={handleToday} className="px-3 py-1.5 text-sm bg-secondary hover:bg-secondary-hover text-secondary-content transition-all rounded-lg active:scale-95">Today</button>
                    <div className="flex items-center">
                        <button onClick={handlePrevMonth} className="p-2 text-text-secondary hover:bg-neutral rounded-full"><ChevronLeftIcon className="w-5 h-5"/></button>
                        <button onClick={handleNextMonth} className="p-2 text-text-secondary hover:bg-neutral rounded-full"><ChevronRightIcon className="w-5 h-5"/></button>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-7 gap-px text-center text-sm font-semibold text-text-secondary bg-outline-dark border border-outline-dark rounded-t-lg overflow-hidden">
                {dayNames.map(dayName => (
                    <div key={dayName} className="py-2 bg-surface">
                        <span className="hidden sm:inline">{dayName}</span>
                        <span className="sm:hidden">{dayName.charAt(0)}</span>
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-7 grid-rows-6 gap-px flex-1 bg-outline-dark border-l border-r border-b border-outline-dark rounded-b-lg overflow-hidden">
                {days.map(day => {
                    const dateKey = day.toISOString().split('T')[0];
                    const dayTasks = tasksByDate.get(dateKey) || [];
                    const isToday = day.getTime() === today.getTime();
                    const isCurrentMonth = day.getMonth() === currentDate.getMonth();

                    return (
                        <div key={dateKey} className={`relative p-1 sm:p-2 bg-surface flex flex-col ${isCurrentMonth ? '' : 'bg-background/30'}`}>
                            <span className={`absolute top-1 right-1 sm:top-2 sm:right-2 text-[10px] sm:text-xs font-bold ${isToday ? 'bg-accent text-accent-content rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center' : 'text-text-secondary'}`}>{day.getDate()}</span>
                            <div className="mt-6 sm:mt-8 space-y-1 overflow-y-auto custom-scrollbar -mr-1 sm:-mr-2 pr-1 sm:pr-2">
                                {dayTasks.map(task => (
                                    <button 
                                        key={task.id}
                                        onClick={() => handleTaskClick(task)}
                                        className={`w-full text-left p-1 sm:p-1.5 rounded text-[10px] sm:text-xs font-semibold ${priorityClasses[task.priority || 'Low'] || 'bg-secondary'}`}
                                    >
                                        <p className="truncate text-white">{task.title}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default React.memo(CalendarView);
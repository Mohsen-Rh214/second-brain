import React, { useState, useMemo } from 'react';
import { Area, Project, Task, View, InboxItem, DashboardCaptureType } from '../../types';
import { ProjectIcon, CheckSquareIcon, ArrowRightIcon, InboxIcon, FileTextIcon, TrashIcon, CalendarIcon, ResourceIcon, SquareIcon, AreaIcon, ListTodoIcon } from '../shared/icons';
import Card from '../shared/Card';
import TaskItem from '../shared/TaskItem';
import TagList from '../shared/TagList';
import { useUI } from '../../store/UIContext';
import { getItemTypeFromId, formatRelativeTime } from '../../utils';

interface DashboardProps {
  projects: Project[];
  areas: Area[];
  tasks: Task[];
  inboxItems: InboxItem[];
  onNavigate: (view: View, itemId?: string) => void;
  onToggleTask: (taskId: string) => void;
  onOrganizeItem: (item: InboxItem) => void;
  onDirectOrganizeItem: (itemId: string, newParentIds: string[]) => void;
  onDeleteItem: (itemId: string) => void;
  onSaveNewTask: (title: string) => void;
  onDashboardCapture: (content: string, type: DashboardCaptureType) => void;
  onSelectItem: (item: InboxItem) => void;
  onReorderTasks: (sourceTaskId: string, targetTaskId: string) => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onOpenLinkTaskModal: (taskId: string) => void;
  onSelectTask: (taskId: string) => void;
}

const CaptureCard = React.memo(function CaptureCard({ onCapture }: { onCapture: (content: string, type: DashboardCaptureType) => void }) {
    const [content, setContent] = useState('');
    const [type, setType] = useState<DashboardCaptureType>('note');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (content.trim()) {
            onCapture(content.trim(), type);
            setContent('');
        }
    };
    
    const typeButtons: { id: DashboardCaptureType, label: string }[] = [
        { id: 'note', label: 'Note' },
        { id: 'resource', label: 'Resource' },
        { id: 'task', label: 'Task' },
    ];
    
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'none';
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    }

    return (
        <div className="bg-surface/80 backdrop-blur-xl border border-outline rounded-2xl shadow-md p-5 flex flex-col h-full">
             <h2 className="font-bold text-lg font-heading text-text-primary mb-3 tracking-tight">Capture</h2>
             <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={3}
                    placeholder="Capture a thought, paste a link..."
                    className="w-full flex-1 bg-background/50 border border-outline px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-accent rounded-xl mb-3 custom-scrollbar"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                />
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        {typeButtons.map(btn => (
                             <button
                                key={btn.id}
                                type="button"
                                onClick={() => setType(btn.id)}
                                className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-colors duration-300 ease-soft ${
                                    type === btn.id 
                                    ? 'bg-accent text-accent-content border-accent' 
                                    : 'bg-transparent hover:bg-accent/10 border-outline-dark text-text-secondary hover:text-accent'
                                }`}
                             >
                                {btn.label}
                             </button>
                        ))}
                    </div>
                    <button type="submit" className="px-4 py-2 text-sm font-medium bg-secondary hover:bg-secondary-hover text-secondary-content transition-colors rounded-lg active:scale-95">Add</button>
                </div>
             </form>
        </div>
    );
});

const Dashboard: React.FC<DashboardProps> = ({ projects, areas, tasks, inboxItems, onNavigate, onToggleTask, onOrganizeItem, onDirectOrganizeItem, onDeleteItem, onSaveNewTask, onDashboardCapture, onSelectItem, onReorderTasks, onUpdateTask, onOpenLinkTaskModal, onSelectTask }) => {
    
    const { state: uiState, dispatch: uiDispatch } = useUI();
    const { draggedItemId, draggedItemType } = uiState;
    const [myDayTask, setMyDayTask] = useState('');
    const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
    const [dragOverTaskId, setDragOverTaskId] = useState<string | null>(null);
    const [dropTargetId, setDropTargetId] = useState<string | null>(null);
    const [isMyDayDropTarget, setIsMyDayDropTarget] = useState(false);
    const [fadingOutTaskIds, setFadingOutTaskIds] = useState<Set<string>>(new Set());

    const { myDayTasks, upcomingTasks, recentProjects, recentAreas } = useMemo(() => {
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        
        const myDayTasks = tasks.filter(t => t.status === 'active' && (
            (t.stage !== 'Done' && (t.isMyDay || (t.dueDate && new Date(t.dueDate) <= today))) ||
            fadingOutTaskIds.has(t.id) // Keep item in list while fading out
        ));

        const next7days = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        const upcomingTasksResult = tasks
            .filter(t => t.status === 'active' && t.stage !== 'Done' && t.dueDate && new Date(t.dueDate) > today && new Date(t.dueDate) <= next7days)
            .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
            .slice(0, 5);

        const recentProjects = projects
            .filter(p => p.status === 'active')
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
            .slice(0, 5);
        
        const recentAreas = areas
            .filter(p => p.status === 'active')
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
            .slice(0, 5);
        
        return { myDayTasks, upcomingTasks: upcomingTasksResult, recentProjects, recentAreas };
    }, [projects, areas, tasks, fadingOutTaskIds]);
        
    const handleAddMyDayTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (myDayTask.trim()) {
            onSaveNewTask(myDayTask.trim());
            setMyDayTask('');
        }
    }

    const handleToggleMyDayTask = (taskId: string) => {
        const task = myDayTasks.find(t => t.id === taskId);
        if (task && task.stage !== 'Done') {
            setFadingOutTaskIds(prev => new Set(prev).add(taskId));
            setTimeout(() => {
                onToggleTask(taskId);
                setFadingOutTaskIds(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(taskId);
                    return newSet;
                });
            }, 500);
        } else {
            onToggleTask(taskId);
        }
    };
    
    const handleInputDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'none';
    };

    const handleInputDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    }

    const getItemIcon = (item: InboxItem) => {
        if (item.id.startsWith('note-')) return <FileTextIcon className="w-4 h-4 text-text-tertiary" />;
        if (item.id.startsWith('res-')) return <ResourceIcon className="w-4 h-4 text-text-tertiary"/>;
        if (item.id.startsWith('task-')) return <ListTodoIcon className="w-4 h-4 text-text-tertiary"/>;
        return null;
    }


  return (
    <div className="custom-scrollbar space-y-8 h-full">
      <header className="mb-4">
        <h1 className="text-4xl font-bold text-text-primary mb-1 font-heading tracking-tight">Home</h1>
        <p className="text-text-secondary">Your command center for clarity and action.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            className="min-h-[350px] lg:min-h-[400px]"
            onDragOver={(e) => {
                if (draggedItemType === 'task') {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                }
            }}
            onDragEnter={(e) => {
                if (draggedItemType === 'task') {
                    e.preventDefault();
                    setIsMyDayDropTarget(true);
                }
            }}
            onDragLeave={() => {
                setIsMyDayDropTarget(false);
            }}
            onDrop={(e) => {
                e.preventDefault();
                if (draggedItemId && draggedItemType === 'task') {
                    onUpdateTask(draggedItemId, { isMyDay: true });
                }
                setIsMyDayDropTarget(false);
            }}
          >
            <Card 
                icon={<CheckSquareIcon className="w-6 h-6" />} 
                title="My Day"
                className={`transition-all duration-300 ease-soft ${isMyDayDropTarget ? 'bg-accent/10' : ''}`}
            >
                <form onSubmit={handleAddMyDayTask} className="flex gap-2 mb-4">
                        <input
                            type="text"
                            value={myDayTask}
                            onChange={(e) => setMyDayTask(e.target.value)}
                            placeholder="Add a task for today..."
                            className="flex-1 bg-background/50 border border-outline px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-accent rounded-lg"
                            onDragOver={handleInputDragOver}
                            onDrop={handleInputDrop}
                        />
                        <button type="submit" className="px-4 py-2 text-sm font-medium bg-secondary hover:bg-secondary-hover text-secondary-content transition-colors rounded-lg active:scale-95">Add</button>
                </form>
                {myDayTasks.length > 0 ? (
                    <ul className="flex-auto space-y-1 overflow-y-scroll overflow-x-clip custom-scrollbar -mr-2 pr-2" onDragLeave={() => setDragOverTaskId(null)}>
                        {myDayTasks.map(task => {
                            const isFading = fadingOutTaskIds.has(task.id);
                            return (
                                <li 
                                    key={task.id} 
                                    draggable={true}
                                    onDragStart={(e) => {
                                        e.dataTransfer.setData('text/plain', task.id);
                                        e.dataTransfer.effectAllowed = 'move';
                                        setDraggedTaskId(task.id);
                                    }}
                                    onDragEnd={() => {
                                        setDraggedTaskId(null);
                                        setDragOverTaskId(null);
                                    }}
                                    onDragOver={(e) => {
                                        if (draggedTaskId) {
                                            e.preventDefault();
                                            e.dataTransfer.dropEffect = 'move';
                                            setDragOverTaskId(task.id);
                                        }
                                    }}
                                    onDrop={(e) => {
                                        if (draggedTaskId) {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            const sourceId = e.dataTransfer.getData('text/plain');
                                            const targetId = task.id;
                                            if (sourceId && targetId && sourceId !== targetId) {
                                                onReorderTasks(sourceId, targetId);
                                            }
                                            setDraggedTaskId(null);
                                            setDragOverTaskId(null);
                                        }
                                    }}
                                    className={`relative cursor-move transition-opacity ${draggedTaskId === task.id ? 'opacity-30' : 'opacity-100'} ${isFading ? 'task-item-fading' : ''}`}
                                    >
                                    {dragOverTaskId === task.id && draggedTaskId !== task.id && (
                                        <div className="absolute -top-1 left-2 right-2 h-1 bg-accent rounded-full" />
                                    )}
                                    <TaskItem 
                                        task={task} 
                                        allTasks={tasks}
                                        onToggleTask={handleToggleMyDayTask} 
                                        onSelectTask={onSelectTask}
                                        projectName={task.projectId ? projects.find(p=>p.id === task.projectId)?.title : undefined}
                                        onUpdateTask={onUpdateTask}
                                        onLinkTask={onOpenLinkTaskModal}
                                        isFadingOut={isFading}
                                    />
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <p className="text-sm text-text-tertiary text-center py-4">No tasks for today. Enjoy the calm!</p>
                )}
            </Card>
          </div>
          <div className="min-h-[350px] lg:min-h-[400px]">
             <CaptureCard onCapture={onDashboardCapture} />
          </div>
          <div className="min-h-[350px] lg:min-h-[400px]">
            <Card icon={<InboxIcon className="w-6 h-6" />} title="Inbox">
                {inboxItems.length > 0 ? (
                    <ul className="space-y-2">
                        {inboxItems.map(item => (
                            <li
                                key={item.id}
                                draggable
                                onDragStart={(e) => {
                                    e.dataTransfer.setData('text/plain', item.id);
                                    const itemType = getItemTypeFromId(item.id);
                                    uiDispatch({ type: 'SET_DRAGGED_ITEM', payload: { id: item.id, type: itemType } });
                                }}
                                onDragEnd={() => uiDispatch({ type: 'SET_DRAGGED_ITEM', payload: { id: null, type: null } })}
                                className={`flex justify-between items-center p-2 group hover:bg-neutral rounded-xl transition-all duration-300 ease-soft cursor-grab ${draggedItemId === item.id ? 'opacity-30' : ''}`}
                            >
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                    {getItemIcon(item)}
                                    <div className="flex-1 min-w-0">
                                        <button onClick={() => onSelectItem(item)} className="font-medium truncate text-left w-full block hover:text-accent">{item.title}</button>
                                        <TagList tags={item.tags} className="mt-1" />
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => onOrganizeItem(item)} className="text-sm bg-accent hover:bg-accent-hover text-accent-content font-semibold px-2 py-1 transition-colors rounded-md active:scale-95">Organize</button>
                                    <button onClick={() => onDeleteItem(item.id)} className="p-1 text-text-secondary hover:text-destructive"><TrashIcon className="w-4 h-4"/></button>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-text-tertiary text-center py-4">Inbox is clear. Well done!</p>
                )}
            </Card>
          </div>
           <div className="min-h-[350px] lg:min-h-[400px]">
            <Card icon={<CalendarIcon className="w-6 h-6" />} title="Upcoming">
                {upcomingTasks.length > 0 ? (
                    <ul className="space-y-2">
                        {upcomingTasks.map(task => (
                            <li key={task.id}>
                                <button onClick={() => onSelectTask(task.id)} className="w-full text-left p-2 hover:bg-neutral rounded-lg">
                                    <div className="flex justify-between items-start">
                                        <span className="font-medium">{task.title}</span>
                                        <span className="text-xs text-text-secondary flex-shrink-0">{formatRelativeTime(task.dueDate!)}</span>
                                    </div>
                                    <p className="text-xs text-text-tertiary">{projects.find(p => p.id === task.projectId)?.title}</p>
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-text-tertiary text-center py-4">Nothing due in the next 7 days.</p>
                )}
            </Card>
          </div>
          <div className="min-h-[350px] lg:min-h-[400px]">
             <Card icon={<ProjectIcon className="w-6 h-6" />} title="Recent Projects">
                 {recentProjects.length > 0 ? (
                    <ul className="space-y-2">
                        {recentProjects.map(project => (
                            <li key={project.id}
                                onDragOver={(e) => { if (draggedItemId) e.preventDefault(); }}
                                onDragEnter={(e) => { if (draggedItemId) { e.preventDefault(); setDropTargetId(project.id); } }}
                                onDragLeave={() => { if (draggedItemId) { setDropTargetId(null); } }}
                                onDrop={(e) => {
                                    if (draggedItemId) {
                                        e.preventDefault();
                                        const itemId = e.dataTransfer.getData('text/plain');
                                        if (itemId) onDirectOrganizeItem(itemId, [project.id]);
                                        setDropTargetId(null);
                                    }
                                }}
                            >
                                <button onClick={() => onNavigate('projects', project.id)} className={`w-full flex justify-between items-center text-left p-3 rounded-xl transition-all duration-300 ease-soft hover:-translate-y-0.5 ${dropTargetId === project.id ? 'bg-accent/20 ring-2 ring-accent/80 ring-inset' : 'hover:bg-neutral'}`}>
                                    <div>
                                        <p className="font-semibold">{project.title}</p>
                                        <p className="text-xs text-text-secondary truncate">{areas.find(a => a.id === project.areaId)?.title || 'No Area'}</p>
                                    </div>
                                    <ArrowRightIcon className="w-4 h-4 text-text-tertiary"/>
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : ( <p className="text-sm text-text-tertiary text-center py-2">No active projects yet.</p> )}
            </Card>
          </div>
          <div className="min-h-[350px] lg:min-h-[400px]">
            <Card icon={<AreaIcon className="w-6 h-6" />} title="Recent Areas">
                {recentAreas.length > 0 ? (
                    <ul className="space-y-2">
                        {recentAreas.map(area => (
                            <li key={area.id}
                                onDragOver={(e) => { if (draggedItemId && (draggedItemType === 'note' || draggedItemType === 'resource')) e.preventDefault(); }}
                                onDragEnter={(e) => { if (draggedItemId && (draggedItemType === 'note' || draggedItemType === 'resource')) { e.preventDefault(); setDropTargetId(area.id); } }}
                                onDragLeave={() => { if (draggedItemId) { setDropTargetId(null); } }}
                                onDrop={(e) => {
                                    if (draggedItemId) {
                                        e.preventDefault();
                                        const itemId = e.dataTransfer.getData('text/plain');
                                        if (itemId) onDirectOrganizeItem(itemId, [area.id]);
                                        setDropTargetId(null);
                                    }
                                }}
                            >
                                <button onClick={() => onNavigate('areas', area.id)} className={`w-full flex justify-between items-center text-left p-3 rounded-xl transition-all duration-300 ease-soft hover:-translate-y-0.5 ${dropTargetId === area.id ? 'bg-accent/20 ring-2 ring-accent/80 ring-inset' : 'hover:bg-neutral'}`}>
                                    <div className="flex items-center gap-2">
                                        <AreaIcon className="w-4 h-4 text-text-secondary"/>
                                        <p className="font-semibold">{area.title}</p>
                                    </div>
                                    <ArrowRightIcon className="w-4 h-4 text-text-tertiary"/>
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : ( <p className="text-sm text-text-tertiary text-center py-2">No active areas yet.</p> )}
            </Card>
          </div>
      </div>
    </div>
  );
};

export default React.memo(Dashboard);
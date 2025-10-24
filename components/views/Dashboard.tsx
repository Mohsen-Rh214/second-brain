import React, { useState, useMemo } from 'react';
import { Area, Project, Task, View, InboxItem, DashboardCaptureType } from '../../types';
import { ProjectIcon, CheckSquareIcon, ArrowRightIcon, InboxIcon, FileTextIcon, TrashIcon, CalendarIcon, ResourceIcon, SquareIcon, AreaIcon, ListTodoIcon } from '../shared/icons';
import Card from '../shared/Card';
import TaskItem from '../shared/TaskItem';
import TagList from '../shared/TagList';

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
        <div className="bg-surface/80 backdrop-blur-xl border border-outline rounded-2xl shadow-md p-5 h-full flex flex-col">
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

const Dashboard: React.FC<DashboardProps> = ({ projects, areas, tasks, inboxItems, onNavigate, onToggleTask, onOrganizeItem, onDirectOrganizeItem, onDeleteItem, onSaveNewTask, onDashboardCapture, onSelectItem, onReorderTasks, onUpdateTask, onOpenLinkTaskModal }) => {
    
    const [myDayTask, setMyDayTask] = useState('');
    const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
    const [dragOverTaskId, setDragOverTaskId] = useState<string | null>(null);
    const [draggedInboxItemId, setDraggedInboxItemId] = useState<string | null>(null);
    const [dropTargetId, setDropTargetId] = useState<string | null>(null);
    const [isMyDayDropTarget, setIsMyDayDropTarget] = useState(false);
    const [fadingOutTaskIds, setFadingOutTaskIds] = useState<Set<string>>(new Set());

    const { myDayTasks, upcomingTasks, recentProjects, recentAreas } = useMemo(() => {
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        
        const myDayTasks = tasks.filter(t => t.status === 'active' && (
            (!t.completed && (t.isMyDay || (t.dueDate && new Date(t.dueDate) <= today))) ||
            fadingOutTaskIds.has(t.id) // Keep item in list while fading out
        ));

        const upcomingTasks = tasks.filter(t => t.status === 'active' && !t.completed && t.dueDate && new Date(t.dueDate) > today)
            .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
            .slice(0, 5);

        const recentProjects = projects
            .filter(p => p.status === 'active')
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
            .slice(0, 3);
        
        const recentAreas = areas
            .filter(p => p.status === 'active')
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
            .slice(0, 3);
        
        return { myDayTasks, upcomingTasks, recentProjects, recentAreas };
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
        if (task && !task.completed) {
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

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 grid-auto-rows-[400px]">
          {/* Row 1 */}
          <div
            onDragOver={(e) => {
                const item = inboxItems.find(i => i.id === draggedInboxItemId);
                if (item && item.id.startsWith('task-')) {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                }
            }}
            onDragEnter={(e) => {
                const item = inboxItems.find(i => i.id === draggedInboxItemId);
                if (item && item.id.startsWith('task-')) {
                    e.preventDefault();
                    setIsMyDayDropTarget(true);
                }
            }}
            onDragLeave={() => {
                setIsMyDayDropTarget(false);
            }}
            onDrop={(e) => {
                e.preventDefault();
                const itemId = e.dataTransfer.getData('text/plain');
                const item = inboxItems.find(i => i.id === itemId);
                if (item && item.id.startsWith('task-')) {
                    onUpdateTask(itemId, { isMyDay: true });
                }
                setIsMyDayDropTarget(false);
                setDraggedInboxItemId(null);
            }}
            className={`rounded-2xl transition-all duration-300 ease-soft ${isMyDayDropTarget ? 'ring-2 ring-accent/80 ring-inset' : ''}`}
          >
            <Card 
                icon={<CheckSquareIcon className="w-6 h-6" />} 
                title="My Day"
                className={`${isMyDayDropTarget ? 'bg-accent/10' : ''}`}
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
                    <>
                        <ul className="space-y-1 max-h-[220px] overflow-hidden" onDragLeave={() => setDragOverTaskId(null)}>
                            {myDayTasks.slice(0,5).map(task => {
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
                                                e.stopPropagation(); // Prevent drop on wrapper from firing
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
                                            onToggleTask={handleToggleMyDayTask} 
                                            projectName={task.projectId ? projects.find(p=>p.id === task.projectId)?.title : undefined}
                                            onUpdateTask={onUpdateTask}
                                            onLinkTask={onOpenLinkTaskModal}
                                            isFadingOut={isFading}
                                        />
                                    </li>
                                );
                            })}
                        </ul>
                        {myDayTasks.length > 5 ? 
                        <div className="mt-4 pt-2 text-center">
                            <button onClick={() => onNavigate('tasks')} className="text-sm font-semibold text-accent hover:underline">
                                View All Tasks &rarr;
                            </button>
                        </div>
                        : null}
                    </>
                ) : (
                    <p className="text-sm text-text-tertiary text-center py-4">No tasks for today. Enjoy the calm!</p>
                )}
            </Card>
          </div>

          <CaptureCard onCapture={onDashboardCapture} />

          <Card className={`max-h-[${myDayTasks.length > 5 ? '420px' : '400px'}]`} icon={<InboxIcon className="w-6 h-6" />} title="Inbox">
              {inboxItems.length > 0 ? (
                  <div>
                      <ul className="space-y-2 mb-4">
                          {inboxItems.map(item => (
                            <li
                                key={item.id}
                                draggable
                                onDragStart={(e) => {
                                    e.dataTransfer.setData('text/plain', item.id);
                                    setDraggedInboxItemId(item.id);
                                }}
                                onDragEnd={() => setDraggedInboxItemId(null)}
                                className={`flex justify-between items-center p-2 group hover:bg-neutral rounded-xl transition-all duration-300 ease-soft cursor-grab ${draggedInboxItemId === item.id ? 'opacity-30' : ''}`}
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
                      {/* {inboxItems.length > 5 &&
                        <button onClick={() => onNavigate('dashboard')} className="w-full text-center text-sm font-semibold text-accent hover:underline p-2">
                            Process all {inboxItems.length} items &rarr;
                        </button>
                      } */}
                  </div>
              ) : (
                  <p className="text-sm text-text-tertiary text-center py-4">Inbox is clear. Well done!</p>
              )}
          </Card>

          {/* Row 2 */}
          <Card className='max-h-[350px]' icon={<CalendarIcon className="w-6 h-6" />} title="Upcoming">
               {upcomingTasks.length > 0 ? (
                   <ul className="space-y-1 max-h-[250px]">
                       {upcomingTasks.map(task => (
                           <li key={task.id}>
                               <div className="flex items-center justify-between p-2 rounded-xl">
                                   <div className="flex items-center gap-3">
                                        <button onClick={() => onToggleTask(task.id)} className="text-text-secondary hover:text-accent"><SquareIcon className="w-5 h-5" /></button>
                                        <span className="flex-1">{task.title}</span>
                                   </div>
                                   <span className="text-xs text-text-secondary">{new Date(task.dueDate!).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                               </div>
                           </li>
                       ))}
                   </ul>
               ) : (
                   <p className="text-sm text-text-tertiary text-center py-4">Nothing on the horizon for the next week.</p>
               )}
          </Card>

          <Card className='max-h-[350px]' icon={<ProjectIcon className="w-6 h-6" />} title="Recent Projects">
              {recentProjects.length > 0 ? (
                  <ul className="space-y-2">
                      {recentProjects.map(project => (
                          <li key={project.id}
                            onDragOver={(e) => { if (draggedInboxItemId) e.preventDefault(); }}
                            onDragEnter={(e) => { if (draggedInboxItemId) { e.preventDefault(); setDropTargetId(project.id); } }}
                            onDragLeave={() => { if (draggedInboxItemId) { setDropTargetId(null); } }}
                            onDrop={(e) => {
                                if (draggedInboxItemId) {
                                    e.preventDefault();
                                    const itemId = e.dataTransfer.getData('text/plain');
                                    if (itemId) onDirectOrganizeItem(itemId, [project.id]);
                                    setDropTargetId(null);
                                    setDraggedInboxItemId(null);
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
              ) : ( <p className="text-sm text-text-tertiary text-center py-4">No active projects yet.</p> )}
          </Card>

          <Card className='max-h-[350px]' icon={<AreaIcon className="w-6 h-6" />} title="Recent Areas">
              {recentAreas.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                      {recentAreas.map(area => (
                          <div key={area.id}
                            onDragOver={(e) => { if (draggedInboxItemId) e.preventDefault(); }}
                            onDragEnter={(e) => { if (draggedInboxItemId) { e.preventDefault(); setDropTargetId(area.id); } }}
                            onDragLeave={() => { if (draggedInboxItemId) { setDropTargetId(null); } }}
                            onDrop={(e) => {
                                if (draggedInboxItemId) {
                                    e.preventDefault();
                                    const itemId = e.dataTransfer.getData('text/plain');
                                    if (itemId) onDirectOrganizeItem(itemId, [area.id]);
                                    setDropTargetId(null);
                                    setDraggedInboxItemId(null);
                                }
                            }}
                          >
                              <button onClick={() => onNavigate('areas', area.id)} className={`w-full aspect-square flex flex-col items-center justify-center text-center p-2 rounded-xl transition-all duration-300 ease-soft hover:-translate-y-0.5 ${dropTargetId === area.id ? 'bg-accent/20 ring-2 ring-accent/80 ring-inset' : 'hover:bg-neutral'}`}>
                                  <AreaIcon className="w-6 h-6 mb-1 text-text-secondary"/>
                                  <p className="font-semibold text-sm leading-tight">{area.title}</p>
                              </button>
                          </div>
                      ))}
                  </div>
              ) : ( <p className="text-sm text-text-tertiary text-center py-4">No active areas yet.</p> )}
          </Card>
      </div>
    </div>
  );
};

export default React.memo(Dashboard);
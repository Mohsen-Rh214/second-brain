import React, { useState, useMemo } from 'react';
import { Area, Project, Task, View, InboxItem, DashboardCaptureType } from '../../types';
import { ProjectIcon, CheckSquareIcon, ArrowRightIcon, InboxIcon, FileTextIcon, TrashIcon, CalendarIcon, ResourceIcon, SquareIcon } from '../shared/icons';
import Card from '../shared/Card';
import TaskItem from '../shared/TaskItem';

interface DashboardProps {
  projects: Project[];
  areas: Area[];
  tasks: Task[];
  inboxItems: InboxItem[];
  onNavigate: (view: View, itemId?: string) => void;
  onToggleTask: (taskId: string) => void;
  onOrganizeItem: (item: InboxItem) => void;
  onDeleteItem: (itemId: string) => void;
  onSaveNewTask: (title: string) => void;
  onDashboardCapture: (content: string, type: DashboardCaptureType) => void;
  onSelectItem: (item: InboxItem) => void;
  onReorderTasks: (sourceTaskId: string, targetTaskId: string) => void;
  onUpdateTask: (taskId: string, updates: Partial<Pick<Task, 'title' | 'priority' | 'dueDate'>>) => void;
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
                    <button type="submit" className="px-4 py-2 text-sm font-medium bg-secondary hover:bg-secondary-hover text-secondary-content transition-colors rounded-lg">Add</button>
                </div>
             </form>
        </div>
    );
});

const Dashboard: React.FC<DashboardProps> = ({ projects, areas, tasks, inboxItems, onNavigate, onToggleTask, onOrganizeItem, onDeleteItem, onSaveNewTask, onDashboardCapture, onSelectItem, onReorderTasks, onUpdateTask }) => {
    
    const [myDayTask, setMyDayTask] = useState('');
    const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
    const [dragOverTaskId, setDragOverTaskId] = useState<string | null>(null);

    const { myDayTasks, upcomingTasks, recentProjects } = useMemo(() => {
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        
        const myDayTasks = tasks.filter(t => t.status === 'active' && !t.completed && (
            (t.dueDate && new Date(t.dueDate) <= today) || t.projectId === null
        ));

        const upcomingTasks = tasks.filter(t => t.status === 'active' && !t.completed && t.dueDate && new Date(t.dueDate) > today)
            .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
            .slice(0, 5);

        const recentProjects = projects
            .filter(p => p.status === 'active')
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
            .slice(0, 5);
        
        return { myDayTasks, upcomingTasks, recentProjects };
    }, [projects, tasks]);
        
    const handleAddMyDayTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (myDayTask.trim()) {
            onSaveNewTask(myDayTask.trim());
            setMyDayTask('');
        }
    }

  return (
    <div className="custom-scrollbar space-y-8 h-full">
      <header className="mb-4">
        <h1 className="text-4xl font-bold text-text-primary mb-1 font-heading tracking-tight">Home</h1>
        <p className="text-text-secondary">Your command center for clarity and action.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          <div className="lg:col-span-1 xl:col-span-1 space-y-8">
              <CaptureCard onCapture={onDashboardCapture} />
              
              <Card 
                icon={<CheckSquareIcon className="w-6 h-6" />} 
                title="My Day"
              >
                   {myDayTasks.length > 0 ? (
                       <ul className="space-y-1 mb-4" onDragLeave={() => setDragOverTaskId(null)}>
                           {myDayTasks.map(task => (
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
                                    e.preventDefault();
                                    e.dataTransfer.dropEffect = 'move';
                                    setDragOverTaskId(task.id);
                                }}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    const sourceId = e.dataTransfer.getData('text/plain');
                                    const targetId = task.id;
                                    if (sourceId && targetId && sourceId !== targetId) {
                                        onReorderTasks(sourceId, targetId);
                                    }
                                    setDraggedTaskId(null);
                                    setDragOverTaskId(null);
                                }}
                                className={`relative cursor-move transition-opacity ${draggedTaskId === task.id ? 'opacity-30' : 'opacity-100'}`}
                                >
                                {dragOverTaskId === task.id && draggedTaskId !== task.id && (
                                    <div className="absolute -top-1 left-2 right-2 h-1 bg-accent rounded-full" />
                                )}
                                <TaskItem 
                                    task={task} 
                                    onToggleTask={onToggleTask} 
                                    projectName={task.projectId ? projects.find(p=>p.id === task.projectId)?.title : undefined}
                                    onUpdateTask={onUpdateTask}
                                />
                               </li>
                           ))}
                       </ul>
                   ) : (
                       <p className="text-sm text-text-tertiary text-center py-4">No tasks for today. Enjoy the calm!</p>
                   )}
                   <form onSubmit={handleAddMyDayTask} className="flex gap-2">
                        <input
                            type="text"
                            value={myDayTask}
                            onChange={(e) => setMyDayTask(e.target.value)}
                            placeholder="Add a task for today..."
                            className="flex-1 bg-background/50 border border-outline px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-accent rounded-lg"
                        />
                        <button type="submit" className="px-4 py-2 text-sm font-medium bg-secondary hover:bg-secondary-hover text-secondary-content transition-colors rounded-lg">Add</button>
                    </form>
              </Card>
          </div>

          <div className="lg:col-span-1 xl:col-span-1 space-y-8">
             <Card icon={<InboxIcon className="w-6 h-6" />} title="Inbox">
                  {inboxItems.length > 0 ? (
                      <div>
                          <ul className="space-y-2 mb-4">
                              {inboxItems.slice(0, 5).map(item => (
                                  <li key={item.id} className="flex justify-between items-center p-2 group hover:bg-neutral rounded-xl transition-all duration-300 ease-soft">
                                      <button onClick={() => onSelectItem(item)} className="flex items-center gap-2 text-left">
                                          {item.id.startsWith('note-') ? <FileTextIcon className="w-4 h-4 text-text-tertiary" /> : <ResourceIcon className="w-4 h-4 text-text-tertiary"/>}
                                          <span className="font-medium truncate group-hover:text-accent">{item.title}</span>
                                      </button>
                                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                          <button onClick={() => onOrganizeItem(item)} className="text-sm bg-accent hover:bg-accent-hover text-accent-content font-semibold px-2 py-1 transition-colors rounded-md">Organize</button>
                                          <button onClick={() => onDeleteItem(item.id)} className="p-1 text-text-secondary hover:text-destructive"><TrashIcon className="w-4 h-4"/></button>
                                      </div>
                                  </li>
                              ))}
                          </ul>
                          {inboxItems.length > 5 &&
                            <button onClick={() => onNavigate('dashboard')} className="w-full text-center text-sm font-semibold text-accent hover:underline p-2">
                                Process all {inboxItems.length} items &rarr;
                            </button>
                          }
                      </div>
                  ) : (
                      <p className="text-sm text-text-tertiary text-center py-4">Inbox is clear. Well done!</p>
                  )}
             </Card>
              <Card icon={<CalendarIcon className="w-6 h-6" />} title="Upcoming">
                   {upcomingTasks.length > 0 ? (
                       <ul className="space-y-1">
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
          </div>

          <div className="lg:col-span-2 xl:col-span-1 space-y-8">
              <Card icon={<ProjectIcon className="w-6 h-6" />} title="Recent Projects">
                  {recentProjects.length > 0 ? (
                      <ul className="space-y-2">
                          {recentProjects.map(project => (
                              <li key={project.id}>
                                  <button onClick={() => onNavigate('projects', project.id)} className="w-full flex justify-between items-center text-left p-3 hover:bg-neutral rounded-xl transition-all duration-300 ease-soft hover:-translate-y-0.5">
                                      <div>
                                        <p className="font-semibold">{project.title}</p>
                                        <p className="text-xs text-text-secondary truncate">{areas.find(a => a.id === project.areaId)?.title || 'No Area'}</p>
                                      </div>
                                      <ArrowRightIcon className="w-4 h-4 text-text-tertiary"/>
                                  </button>
                              </li>
                          ))}
                      </ul>
                  ) : (
                       <p className="text-sm text-text-tertiary text-center py-4">No active projects yet.</p>
                  )}
              </Card>
          </div>
      </div>
    </div>
  );
};

export default React.memo(Dashboard);
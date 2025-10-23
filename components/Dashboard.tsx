import React, { useState } from 'react';
import { Area, Project, Task, Note, Resource, View, InboxItem } from '../types';
import { DashboardCaptureType } from '../App';
import { ProjectIcon, CheckSquareIcon, ArrowRightIcon, InboxIcon, FileTextIcon, SquareIcon, TrashIcon, CalendarIcon, ResourceIcon } from './icons';

interface DashboardProps {
  projects: Project[];
  areas: Area[];
  tasks: Task[];
  notes: Note[];
  resources: Resource[];
  inboxItems: InboxItem[];
  onNavigate: (view: View, itemId?: string) => void;
  onToggleTask: (taskId: string) => void;
  onOrganizeItem: (item: InboxItem) => void;
  onDeleteItem: (itemId: string) => void;
  onSaveNewTask: (title: string) => void;
  onDashboardCapture: (content: string, type: DashboardCaptureType) => void;
  onSelectItem: (item: InboxItem) => void;
}

const Widget: React.FC<{ icon: React.ReactElement; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
  <div className="bg-surface/80 backdrop-blur-xl border border-outline rounded-xl shadow-md h-full flex flex-col">
    <header className="flex items-center gap-3 p-4 border-b border-outline-dark">
      <div className="text-accent">{icon}</div>
      <h2 className="font-bold text-lg font-heading text-text-primary">{title}</h2>
    </header>
    <div className="p-4 flex-1">{children}</div>
  </div>
);

const TaskItem: React.FC<{ task: Task, onToggleTask: (id: string) => void, projectName?: string }> = ({ task, onToggleTask, projectName }) => (
    <div className="flex items-start gap-3 p-2 group hover:bg-neutral rounded-lg transition-colors">
        <button onClick={() => onToggleTask(task.id)} aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'} className="mt-1 flex-shrink-0 text-text-secondary hover:text-accent transition-colors">
            {task.completed ? <CheckSquareIcon className="w-5 h-5 text-accent" /> : <SquareIcon className="w-5 h-5" />}
        </button>
        <div className="flex-1">
            <span className={`transition-colors ${task.completed ? 'line-through text-text-tertiary' : ''}`}>{task.title}</span>
            {projectName && <p className="text-xs text-text-secondary">{projectName}</p>}
        </div>
    </div>
);

const CaptureCard: React.FC<{ onCapture: (content: string, type: DashboardCaptureType) => void }> = ({ onCapture }) => {
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
        <div className="bg-surface/80 backdrop-blur-xl border border-outline rounded-xl shadow-md p-4 h-full flex flex-col">
             <h2 className="font-bold text-lg font-heading text-text-primary mb-3">Capture</h2>
             <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={3}
                    placeholder="Capture a thought, paste a link..."
                    className="w-full flex-1 bg-background/50 border border-outline px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-accent rounded-lg mb-3 custom-scrollbar"
                />
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        {typeButtons.map(btn => (
                             <button
                                key={btn.id}
                                type="button"
                                onClick={() => setType(btn.id)}
                                className={`px-3 py-1 text-xs font-semibold rounded-full border transition-colors ${
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
};


const Dashboard: React.FC<DashboardProps> = ({ projects, tasks, inboxItems, onNavigate, onToggleTask, onOrganizeItem, onDeleteItem, onSaveNewTask, onDashboardCapture, onSelectItem }) => {
    
    const [myDayTask, setMyDayTask] = useState('');

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
        
    const handleAddMyDayTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (myDayTask.trim()) {
            onSaveNewTask(myDayTask.trim());
            setMyDayTask('');
        }
    }

  return (
    <div className="custom-scrollbar space-y-6 h-full">
      <header className="mb-4">
        <h1 className="text-3xl font-bold text-text-primary mb-1 font-heading">Home</h1>
        <p className="text-text-secondary">Your command center for clarity and action.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Column 1: Capture & My Day */}
          <div className="lg:col-span-1 xl:col-span-1 space-y-6">
              <CaptureCard onCapture={onDashboardCapture} />
              
              <Widget icon={<CheckSquareIcon className="w-6 h-6" />} title="My Day">
                   {myDayTasks.length > 0 ? (
                       <ul className="space-y-1 mb-4">
                           {myDayTasks.map(task => (
                               <li key={task.id}><TaskItem task={task} onToggleTask={onToggleTask} projectName={task.projectId ? projects.find(p=>p.id === task.projectId)?.title : undefined} /></li>
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
              </Widget>
          </div>

          {/* Column 2: Inbox & Upcoming */}
          <div className="lg:col-span-1 xl:col-span-1 space-y-6">
             <Widget icon={<InboxIcon className="w-6 h-6" />} title="Inbox">
                  {inboxItems.length > 0 ? (
                      <div>
                          <ul className="space-y-2 mb-4">
                              {inboxItems.slice(0, 5).map(item => (
                                  <li key={item.id} className="flex justify-between items-center p-2 group hover:bg-neutral rounded-lg">
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
             </Widget>
              <Widget icon={<CalendarIcon className="w-6 h-6" />} title="Upcoming">
                   {upcomingTasks.length > 0 ? (
                       <ul className="space-y-1">
                           {upcomingTasks.map(task => (
                               <li key={task.id}>
                                   <div className="flex items-center justify-between p-2 rounded-lg">
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
              </Widget>
          </div>

          {/* Column 3: Recent Projects */}
          <div className="lg:col-span-2 xl:col-span-1 space-y-6">
              <Widget icon={<ProjectIcon className="w-6 h-6" />} title="Recent Projects">
                  {recentProjects.length > 0 ? (
                      <ul className="space-y-2">
                          {recentProjects.map(project => (
                              <li key={project.id}>
                                  <button onClick={() => onNavigate('projects', project.id)} className="w-full flex justify-between items-center text-left p-3 hover:bg-neutral rounded-lg transition-all duration-200">
                                      <div>
                                        <p className="font-semibold">{project.title}</p>
                                        <p className="text-xs text-text-secondary truncate">{projects.find(p => p.id === project.areaId)?.title || 'No Area'}</p>
                                      </div>
                                      <ArrowRightIcon className="w-4 h-4 text-text-tertiary"/>
                                  </button>
                              </li>
                          ))}
                      </ul>
                  ) : (
                       <p className="text-sm text-text-tertiary text-center py-4">No active projects yet.</p>
                  )}
              </Widget>
          </div>
      </div>
    </div>
  );
};

export default Dashboard;

import React from 'react';
import { Area, Project, Task, Note, Resource, BaseItem } from '../types';
import { View } from '../types';
import { AreaIcon, ProjectIcon, CheckSquareIcon, ArrowRightIcon, InboxIcon, FileTextIcon, ResourceIcon } from './icons';

interface DashboardProps {
  projects: Project[];
  areas: Area[];
  tasks: Task[];
  notes: Note[];
  resources: Resource[];
  inboxCount: number;
  onNavigate: (view: View, itemId?: string) => void;
}

const StatCard: React.FC<{ icon: React.ReactElement; label: string; value: number }> = ({ icon, label, value }) => (
  <div className="bg-slate-800/50 p-6 rounded-lg flex items-center gap-4">
    <div className="bg-slate-700 p-3 rounded-full">
        {icon}
    </div>
    <div>
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-slate-400">{label}</p>
    </div>
  </div>
);

const getItemType = (item: BaseItem) => {
    if (item.id.startsWith('area-')) return 'area';
    if (item.id.startsWith('proj-')) return 'project';
    if (item.id.startsWith('task-')) return 'task';
    if (item.id.startsWith('note-')) return 'note';
    if (item.id.startsWith('res-')) return 'resource';
    return 'unknown';
}

const itemIcons: { [key: string]: React.ReactElement } = {
    area: <AreaIcon className="w-5 h-5 text-emerald-400" />,
    project: <ProjectIcon className="w-5 h-5 text-sky-400" />,
    task: <CheckSquareIcon className="w-5 h-5 text-amber-400" />,
    note: <FileTextIcon className="w-5 h-5 text-fuchsia-400" />,
    resource: <ResourceIcon className="w-5 h-5 text-indigo-400" />,
};

const Dashboard: React.FC<DashboardProps> = ({ projects, areas, tasks, notes, resources, inboxCount, onNavigate }) => {
    const activeProjects = projects.filter(p => p.status === 'active').length;
    const activeAreas = areas.filter(a => a.status === 'active').length;
    const incompleteTasks = tasks.filter(t => t.status === 'active' && !t.completed).length;

    const allActiveItems = [
        ...projects.filter(p => p.status === 'active'),
        ...areas.filter(a => a.status === 'active'),
        ...tasks.filter(t => t.status === 'active'),
        ...notes.filter(n => n.status === 'active'),
        ...resources.filter(r => r.status === 'active'),
    ];

    const recentItems = allActiveItems
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 5);
        
    const handleRecentItemClick = (item: BaseItem) => {
        const type = getItemType(item);
        switch (type) {
            case 'area':
                onNavigate('areas', item.id);
                break;
            case 'project':
                onNavigate('projects', item.id);
                break;
            case 'task':
                onNavigate('projects', (item as Task).projectId);
                break;
            case 'note':
            case 'resource':
                const parentProjectId = (item as Note | Resource).parentIds.find(id => id.startsWith('proj-'));
                if (parentProjectId) {
                    onNavigate('projects', parentProjectId);
                } else {
                    const parentAreaId = (item as Note | Resource).parentIds.find(id => id.startsWith('area-'));
                    if (parentAreaId) onNavigate('areas', parentAreaId);
                }
                break;
        }
    }

  return (
    <div className="p-8 custom-scrollbar">
      <h1 className="text-3xl font-bold text-slate-100 mb-2">Welcome Back</h1>
      <p className="text-slate-400 mb-8">Here's a snapshot of your digital mind. Ready to create something amazing?</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard icon={<ProjectIcon className="w-6 h-6 text-sky-400" />} label="Active Projects" value={activeProjects} />
        <StatCard icon={<AreaIcon className="w-6 h-6 text-emerald-400" />} label="Active Areas" value={activeAreas} />
        <StatCard icon={<CheckSquareIcon className="w-6 h-6 text-amber-400" />} label="Pending Tasks" value={incompleteTasks} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-800/50 p-6 rounded-lg">
              <h2 className="font-bold text-lg flex items-center gap-2 mb-3">
                <InboxIcon className="w-5 h-5 text-emerald-400" />
                <span>Action Items</span>
              </h2>
              <div className="bg-slate-700/50 p-4 rounded-md flex justify-between items-center">
                  <div>
                      <p className="font-semibold">{inboxCount} {inboxCount === 1 ? 'item' : 'items'} need organizing</p>
                      <p className="text-sm text-slate-400">Process your inbox to keep your mind clear.</p>
                  </div>
                  <button onClick={() => onNavigate('inbox')} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold px-4 py-2 rounded-md transition-colors">
                      Process Inbox
                      <ArrowRightIcon className="w-4 h-4" />
                  </button>
              </div>
          </div>
           <div className="bg-slate-800/50 p-6 rounded-lg">
              <h2 className="font-bold text-lg mb-3">Recent Activity</h2>
              {recentItems.length > 0 ? (
                <ul className="space-y-2">
                    {recentItems.map(item => {
                        const type = getItemType(item);
                        return (
                           <li key={item.id}>
                               <button onClick={() => handleRecentItemClick(item)} className="w-full flex items-center gap-3 text-left p-2 rounded-md hover:bg-slate-700/50 transition-colors">
                                   {itemIcons[type]}
                                   <span className="flex-1 font-medium truncate">{item.title}</span>
                                   <span className="text-xs text-slate-500">{new Date(item.updatedAt).toLocaleDateString()}</span>
                               </button>
                           </li>
                        )
                    })}
                </ul>
              ) : (
                <p className="text-sm text-slate-500">No recent activity to show.</p>
              )}
          </div>
      </div>
    </div>
  );
};

export default Dashboard;

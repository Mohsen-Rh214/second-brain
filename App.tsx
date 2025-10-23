import React, { useState, useEffect } from 'react';
import { Area, Project, Task, Note, Resource, NewItemPayload, InboxItem, View } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import CaptureModal from './components/CaptureModal';
import NoteEditorModal from './components/NoteEditorModal';
import ResourceEditorModal from './components/ResourceEditorModal';
import ProjectView from './components/ProjectView';
import AreaView from './components/AreaView';
import ArchiveView from './components/ArchiveView';
import ResourceView from './components/ResourceView';
import SearchView from './components/SearchView';
import OrganizeModal from './components/OrganizeModal';
import { initialAreas, initialProjects, initialTasks, initialNotes, initialResources } from './constants';
import { PlusIcon } from './components/icons';
import TaskView from './components/TaskView';
import ReviewView from './components/ReviewView';
import GraphView from './components/GraphView';
import CommandBar from './components/CommandBar';


// A simple hook to manage state with localStorage
function useStickyState<T>(defaultValue: T, key: string): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    try {
      const stickyValue = window.localStorage.getItem(key);
      return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue;
    } catch (error) {
      console.error(`Error reading localStorage key “${key}”:`, error);
      return defaultValue;
    }
  });

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}

export type ItemType = 'note' | 'task' | 'resource' | 'project' | 'area';
export type DashboardCaptureType = 'note' | 'task' | 'resource';

export type CaptureContext = {
    parentId: string | null;
    itemType?: ItemType;
}

const App: React.FC = () => {
  const [areas, setAreas] = useStickyState<Area[]>(initialAreas, 'sb-areas');
  const [projects, setProjects] = useStickyState<Project[]>(initialProjects, 'sb-projects');
  const [tasks, setTasks] = useStickyState<Task[]>(initialTasks, 'sb-tasks');
  const [notes, setNotes] = useStickyState<Note[]>(initialNotes, 'sb-notes');
  const [resources, setResources] = useStickyState<Resource[]>(initialResources, 'sb-resources');
  
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [activeAreaId, setActiveAreaId] = useState<string | null>(null);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  const [isCaptureModalOpen, setCaptureModalOpen] = useState(false);
  const [captureContext, setCaptureContext] = useState<CaptureContext | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingResourceId, setEditingResourceId] = useState<string | null>(null);
  const [organizingItem, setOrganizingItem] = useState<InboxItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCommandBarOpen, setCommandBarOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);


  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
          if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
              e.preventDefault();
              setCommandBarOpen(prev => !prev);
          }
           if (e.key === 'Escape') {
              setCommandBarOpen(false);
           }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const showToast = (message: string) => {
      setToastMessage(message);
      setTimeout(() => setToastMessage(null), 3000);
  };


  const getItemTypeFromId = (id: string): ItemType | null => {
    if (id.startsWith('area-')) return 'area';
    if (id.startsWith('proj-')) return 'project';
    if (id.startsWith('task-')) return 'task';
    if (id.startsWith('note-')) return 'note';
    if (id.startsWith('res-')) return 'resource';
    return null;
  }
  
  const handleNavigate = (view: View, itemId: string | null = null) => {
    setSearchQuery(''); // Clear search on navigation
    setCurrentView(view);
    setActiveProjectId(null); // Reset active IDs
    setActiveAreaId(null);

    if (view === 'projects' && itemId) {
        setActiveProjectId(itemId);
    }
    if (view === 'areas' && itemId) {
        setActiveAreaId(itemId);
    }
  };

  const handleOpenCaptureModal = (context: CaptureContext | null = null) => {
    setCaptureContext(context);
    setCaptureModalOpen(true);
  }
  
  const createNewItem = (prefix: string, data: any) => ({
      id: `${prefix}-${Date.now()}`,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'active' as const,
  });

  const handleDashboardCapture = (content: string, type: DashboardCaptureType) => {
    let title = content.length > 50 ? content.substring(0, 50) + '...' : content;
    
    if (type === 'note') {
        const newNote: Note = createNewItem('note', { title, content: content, parentIds: [] });
        setNotes(prev => [...prev, newNote]);
    } else if (type === 'task') {
        const newTask: Task = createNewItem('task', { title: content, projectId: null, completed: false });
        setTasks(prev => [...prev, newTask]);
    } else if (type === 'resource') {
        let resourceContent = content;
        // Simple check if it's a URL
        if (content.match(/^https?:\/\//)) {
             try {
                const url = new URL(content);
                title = url.hostname.replace('www.', '');
             } catch {
                title = 'Link Resource';
             }
        } else {
            title = 'Text Resource';
        }
        const newResource: Resource = createNewItem('res', { title, type: 'link', content: resourceContent, parentIds: [] });
        setResources(prev => [...prev, newResource]);
    }
    showToast(`New ${type} added to Inbox!`);
  };

  const handleSaveNewItem = (itemData: NewItemPayload, itemType: ItemType, parentId: string | null) => {
    switch (itemType) {
        case 'note': {
            const newNote: Note = createNewItem('note', { title: itemData.title, content: itemData.content || '', parentIds: parentId ? [parentId] : [] });
            setNotes(prev => [...prev, newNote]);
            if (parentId?.startsWith('proj-')) {
                setProjects(prev => prev.map(p => p.id === parentId ? { ...p, noteIds: [...p.noteIds, newNote.id] } : p));
            }
            break;
        }
        case 'task': {
            const newTask: Task = createNewItem('task', { title: itemData.title, projectId: parentId, completed: false, dueDate: itemData.dueDate || undefined, priority: itemData.priority || undefined });
            setTasks(prev => [...prev, newTask]);
            if (parentId?.startsWith('proj-')) {
                setProjects(prev => prev.map(p => p.id === parentId ? { ...p, taskIds: [...p.taskIds, newTask.id] } : p));
            }
            break;
        }
        case 'resource': {
            const newResource: Resource = createNewItem('res', { title: itemData.title, type: itemData.type || 'text', content: itemData.content || '', parentIds: parentId ? [parentId] : [] });
            setResources(prev => [...prev, newResource]);
            if (parentId?.startsWith('proj-')) {
                setProjects(prev => prev.map(p => p.id === parentId ? { ...p, resourceIds: [...p.resourceIds, newResource.id] } : p));
            }
            break;
        }
        case 'project': {
            const newProject: Project = createNewItem('proj', { title: itemData.title, description: itemData.description || '', areaId: parentId, taskIds: [], noteIds: [], resourceIds: [] });
            setProjects(prev => [...prev, newProject]);
            if (parentId?.startsWith('area-')) {
                setAreas(prev => prev.map(a => a.id === parentId ? { ...a, projectIds: [...a.projectIds, newProject.id] } : a));
            }
            break;
        }
        case 'area': {
            const newArea: Area = createNewItem('area', { title: itemData.title, description: itemData.description || '', projectIds: [] });
            setAreas(prev => [...prev, newArea]);
            break;
        }
    }
    setCaptureModalOpen(false);
  };

  const handleToggleTask = (taskId: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed, updatedAt: new Date().toISOString() } : task
    ));
  }

  const handleUpdateTask = (taskId: string, updates: Partial<Pick<Task, 'title' | 'priority' | 'dueDate'>>) => {
      const now = new Date().toISOString();
      setTasks(tasks.map(task => 
          task.id === taskId ? { ...task, ...updates, updatedAt: now } : task
      ));
  }

  const handleUpdateItemStatus = (itemId: string, status: 'active' | 'archived') => {
      const now = new Date().toISOString();
      const updater = (item: any) => item.id === itemId ? { ...item, status, updatedAt: now } : item;

      const itemType = getItemTypeFromId(itemId);
      switch(itemType) {
          case 'area': setAreas(areas.map(updater)); break;
          case 'project': setProjects(projects.map(updater)); break;
          case 'task': setTasks(tasks.map(updater)); break;
          case 'note': setNotes(notes.map(updater)); break;
          case 'resource': setResources(resources.map(updater)); break;
      }
  }

  const handleArchiveItem = (itemId: string) => handleUpdateItemStatus(itemId, 'archived');
  const handleRestoreItem = (itemId: string) => handleUpdateItemStatus(itemId, 'active');
  
  const handleDeleteItem = (itemId: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this item? This action cannot be undone.")) return;

    const itemType = getItemTypeFromId(itemId);
    switch(itemType) {
        case 'area': setAreas(areas.filter(i => i.id !== itemId)); break;
        case 'project': setProjects(projects.filter(i => i.id !== itemId)); break;
        case 'task': setTasks(tasks.filter(i => i.id !== itemId)); break;
        case 'note': setNotes(notes.filter(i => i.id !== itemId)); break;
        case 'resource': setResources(resources.filter(i => i.id !== itemId)); break;
    }
  }

  const handleUpdateNote = (noteId: string, title: string, content: string) => {
    const now = new Date().toISOString();
    setNotes(notes.map(n => n.id === noteId ? { ...n, title, content, updatedAt: now } : n));
    setEditingNoteId(null);
  };

  const handleUpdateResource = (resourceId: string, title: string, content: string) => {
    const now = new Date().toISOString();
    setResources(resources.map(r => r.id === resourceId ? { ...r, title, content, updatedAt: now } : r));
    setEditingResourceId(null);
  }
  
  const handleUpdateProject = (projectId: string, updates: { title?: string, description?: string }) => {
    const now = new Date().toISOString();
    setProjects(projects.map(p => p.id === projectId ? { ...p, ...updates, updatedAt: now } : p));
  }

  const handleUpdateArea = (areaId: string, updates: { title?: string, description?: string }) => {
    const now = new Date().toISOString();
    setAreas(areas.map(a => a.id === areaId ? { ...a, ...updates, updatedAt: now } : a));
  }

  const handleOrganizeItem = (itemId: string, newParentIds: string[]) => {
    const now = new Date().toISOString();
    const itemType = getItemTypeFromId(itemId);

    if (itemType === 'note') {
        setNotes(notes.map(n => n.id === itemId ? { ...n, parentIds: newParentIds, updatedAt: now } : n));
    } else if (itemType === 'resource') {
        setResources(resources.map(r => r.id === itemId ? { ...r, parentIds: newParentIds, updatedAt: now } : r));
    }
    
    // Add item to new parents
    newParentIds.forEach(pid => {
        if (pid.startsWith('proj-')) {
            setProjects(projs => projs.map(p => {
                if (p.id === pid) {
                    const idArray = itemType === 'note' ? p.noteIds : p.resourceIds;
                    if (!idArray.includes(itemId)) {
                        return { ...p, [itemType === 'note' ? 'noteIds' : 'resourceIds']: [...idArray, itemId] };
                    }
                }
                return p;
            }));
        }
    });
    setOrganizingItem(null);
  }

  const handleMarkReviewed = (itemIds: string[], type: 'project' | 'area') => {
      const now = new Date().toISOString();
      if (type === 'project') {
          setProjects(projs => projs.map(p => itemIds.includes(p.id) ? {...p, lastReviewed: now, updatedAt: now} : p));
      } else {
          setAreas(ars => ars.map(a => itemIds.includes(a.id) ? {...a, lastReviewed: now, updatedAt: now} : a));
      }
  }

  const handleSelectItem = (item: InboxItem) => {
    if (item.id.startsWith('note-')) {
        setEditingNoteId(item.id);
    } else if (item.id.startsWith('res-')) {
        setEditingResourceId(item.id);
    }
  }
  
  const handleCommand = (command: { id: string, type: string }) => {
    setCommandBarOpen(false);
    
    if (command.type === 'action') {
        const itemType = command.id.split('-')[1] as ItemType;
        handleOpenCaptureModal({ parentId: null, itemType });
    } else if (command.type === 'navigation') {
        const view = command.id.split('-')[1] as View;
        handleNavigate(view);
    } else if (command.type === 'item') {
        const itemType = getItemTypeFromId(command.id);
        switch (itemType) {
            case 'area': handleNavigate('areas', command.id); break;
            case 'project': handleNavigate('projects', command.id); break;
            case 'task': {
                const task = tasks.find(t => t.id === command.id);
                if (task?.projectId) handleNavigate('projects', task.projectId);
                else handleNavigate('dashboard');
                break;
            }
            case 'note': setEditingNoteId(command.id); break;
            case 'resource': setEditingResourceId(command.id); break;
        }
    }
  };

  const inboxItems = [
      ...notes.filter(n => n.status === 'active' && n.parentIds.length === 0),
      ...resources.filter(r => r.status === 'active' && r.parentIds.length === 0)
  ];

  const renderView = () => {
    if (searchQuery) {
        return <SearchView 
            query={searchQuery}
            areas={areas}
            projects={projects}
            tasks={tasks}
            notes={notes}
            resources={resources}
            onNavigate={handleNavigate}
        />
    }

    switch (currentView) {
      case 'dashboard':
      case 'inbox': // Inbox is now part of the dashboard
      case 'tasks': // Tasks are on dashboard and their own page
        return <Dashboard 
            projects={projects} 
            areas={areas} 
            tasks={tasks} 
            notes={notes}
            resources={resources}
            inboxItems={inboxItems}
            onNavigate={handleNavigate}
            onToggleTask={handleToggleTask}
            onOrganizeItem={setOrganizingItem}
            onDeleteItem={handleDeleteItem}
            onSaveNewTask={(title) => handleSaveNewItem({ title }, 'task', null)}
            onDashboardCapture={handleDashboardCapture}
            onSelectItem={handleSelectItem}
        />;
      
      case 'projects':
        return <ProjectView 
            projects={projects.filter(p => p.status === 'active')} 
            activeProjectId={activeProjectId} 
            onSelectProject={setActiveProjectId}
            tasks={tasks.filter(t => t.status === 'active')}
            notes={notes.filter(n => n.status === 'active')}
            resources={resources.filter(r => r.status === 'active')}
            onToggleTask={handleToggleTask}
            onArchive={handleArchiveItem}
            onDelete={handleDeleteItem}
            onSelectNote={setEditingNoteId}
            onUpdateProject={handleUpdateProject}
            onOpenCommandBar={() => setCommandBarOpen(true)}
            onOpenCaptureModal={handleOpenCaptureModal}
            onUpdateTask={handleUpdateTask}
            />;
      case 'areas':
          return <AreaView
              areas={areas.filter(a => a.status === 'active')}
              activeAreaId={activeAreaId}
              onSelectArea={setActiveAreaId}
              projects={projects.filter(p => p.status === 'active')}
              notes={notes.filter(n => n.status === 'active')}
              resources={resources.filter(r => r.status === 'active')}
              onArchive={handleArchiveItem}
              onDelete={handleDeleteItem}
              onSelectNote={setEditingNoteId}
              onUpdateArea={handleUpdateArea}
              onOpenCommandBar={() => setCommandBarOpen(true)}
              onOpenCaptureModal={handleOpenCaptureModal}
              onNavigate={handleNavigate}
          />;
      
      case 'resources':
          return <ResourceView 
              resources={resources.filter(r => r.status === 'active')}
              projects={projects}
              areas={areas}
              onArchive={handleArchiveItem}
              onDelete={handleDeleteItem}
              onOpenCaptureModal={handleOpenCaptureModal}
            />
      case 'archives':
          const allItems = [...areas, ...projects, ...tasks, ...notes, ...resources];
          return <ArchiveView 
            items={allItems}
            onRestore={handleRestoreItem}
            onDelete={handleDeleteItem}
            />;
      case 'graph':
          return <GraphView 
            areas={areas.filter(a => a.status === 'active')}
            projects={projects.filter(p => p.status === 'active')}
            notes={notes.filter(n => n.status === 'active')}
            resources={resources.filter(r => r.status === 'active')}
            onNavigate={handleNavigate}
          />
      case 'review':
          return <ReviewView
            inboxCount={inboxItems.length}
            projects={projects.filter(p => p.status === 'active')}
            areas={areas.filter(a => a.status === 'active')}
            tasks={tasks.filter(t => t.status === 'active' && !t.completed)}
            onNavigate={handleNavigate}
            onMarkReviewed={handleMarkReviewed}
          />
      default:
        // This case should ideally never be reached
        return <p>Unknown view: {currentView}</p>;
    }
  };
  
  const editingNote = notes.find(n => n.id === editingNoteId);
  const editingResource = resources.find(r => r.id === editingResourceId);

  return (
    <div className="h-screen w-screen bg-transparent text-text-primary flex overflow-hidden font-sans">
      <Sidebar 
        currentView={currentView} 
        onNavigate={handleNavigate}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        inboxCount={inboxItems.length}
      />
      <main className="flex-1 flex flex-col overflow-y-hidden">
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {renderView()}
        </div>
      </main>

      <button 
        onClick={() => handleOpenCaptureModal()} 
        className="absolute bottom-8 right-8 bg-accent hover:bg-accent-hover text-accent-content p-4 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-accent-hover transition-all duration-200 group"
        aria-label="Capture new item"
        >
        <PlusIcon className="w-6 h-6"/>
         <span className="sr-only">Capture new item</span>
      </button>
      
      {toastMessage && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-surface backdrop-blur-md border border-outline px-4 py-2 rounded-xl shadow-lg text-sm text-text-primary animate-fade-in-out">
              {toastMessage}
          </div>
      )}

      {isCommandBarOpen && <CommandBar isOpen={isCommandBarOpen} onClose={() => setCommandBarOpen(false)} onCommand={handleCommand} areas={areas} projects={projects} notes={notes} resources={resources} tasks={tasks}/>}
      {isCaptureModalOpen && <CaptureModal isOpen={isCaptureModalOpen} onClose={() => setCaptureModalOpen(false)} onSave={handleSaveNewItem} projects={projects} areas={areas} context={captureContext}/>}
      {editingNote && <NoteEditorModal isOpen={!!editingNote} onClose={() => setEditingNoteId(null)} note={editingNote} onSave={handleUpdateNote} projects={projects} areas={areas} allNotes={notes} />}
      {editingResource && <ResourceEditorModal isOpen={!!editingResource} onClose={() => setEditingResourceId(null)} resource={editingResource} onSave={handleUpdateResource} />}
      {organizingItem && <OrganizeModal isOpen={!!organizingItem} onClose={() => setOrganizingItem(null)} item={organizingItem} projects={projects} areas={areas} onSave={handleOrganizeItem} />}
    </div>
  );
};

export default App;

import React, { useState, useEffect } from 'react';
import { Area, Project, Task, Note, Resource, NewItemPayload, InboxItem, View } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import CaptureModal from './components/CaptureModal';
import NoteEditorModal from './components/NoteEditorModal';
import ProjectView from './components/ProjectView';
import AreaView from './components/AreaView';
import ArchiveView from './components/ArchiveView';
import ResourceView from './components/ResourceView';
import SearchView from './components/SearchView';
import InboxView from './components/InboxView';
import OrganizeModal from './components/OrganizeModal';
import { initialAreas, initialProjects, initialTasks, initialNotes, initialResources } from './constants';
import { PlusIcon } from './components/icons';
import TaskView from './components/TaskView';
import ReviewView from './components/ReviewView';
import GraphView from './components/GraphView';


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
  const [organizingItem, setOrganizingItem] = useState<InboxItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');


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

  const handleSaveNewItem = (itemData: NewItemPayload, itemType: ItemType, parentId: string | null) => {
    const now = new Date().toISOString();
    
    const createNewItem = (prefix: string, data: any) => ({
        id: `${prefix}-${Date.now()}`,
        ...data,
        createdAt: now,
        updatedAt: now,
        status: 'active' as const,
    });

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
            if (!parentId || !parentId.startsWith('proj-')) { alert("A task must be linked to a project."); return; }
            const newTask: Task = createNewItem('task', { title: itemData.title, projectId: parentId, completed: false, dueDate: itemData.dueDate || undefined, priority: itemData.priority || undefined });
            setTasks(prev => [...prev, newTask]);
            setProjects(prev => prev.map(p => p.id === parentId ? { ...p, taskIds: [...p.taskIds, newTask.id] } : p));
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
            if (!parentId || !parentId.startsWith('area-')) { alert("A project must be linked to an area."); return; }
            const newProject: Project = createNewItem('proj', { title: itemData.title, description: itemData.description || '', areaId: parentId, taskIds: [], noteIds: [], resourceIds: [] });
            setProjects(prev => [...prev, newProject]);
            setAreas(prev => prev.map(a => a.id === parentId ? { ...a, projectIds: [...a.projectIds, newProject.id] } : a));
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
        // Similar logic could be added for areas if they directly hold notes/resources
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
        return <Dashboard 
            projects={projects} 
            areas={areas} 
            tasks={tasks} 
            notes={notes}
            resources={resources}
            inboxCount={inboxItems.length}
            onNavigate={handleNavigate}
        />;
      case 'inbox':
        return <InboxView
          items={inboxItems}
          onSelectItem={item => item.id.startsWith('note-') ? setEditingNoteId(item.id) : null}
          onOrganizeItem={setOrganizingItem}
        />
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
            onAddItem={handleOpenCaptureModal}
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
              onAddItem={handleOpenCaptureModal}
              onNavigate={handleNavigate}
          />;
      case 'tasks':
          return <TaskView tasks={tasks.filter(t => t.status === 'active')} projects={projects} onToggleTask={handleToggleTask} />
      case 'resources':
          return <ResourceView 
              resources={resources.filter(r => r.status === 'active')}
              projects={projects}
              areas={areas}
              onArchive={handleArchiveItem}
              onDelete={handleDeleteItem}
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
        const exhaustiveCheck: never = currentView;
        return <p>Unknown view: {exhaustiveCheck as string}</p>;
    }
  };
  
  const editingNote = notes.find(n => n.id === editingNoteId);

  return (
    <div className="h-screen w-screen bg-slate-900 text-slate-100 flex overflow-hidden">
      <Sidebar 
        currentView={currentView} 
        onNavigate={handleNavigate}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        inboxCount={inboxItems.length}
      />
      <main className="flex-1 flex flex-col overflow-y-auto">
        {renderView()}
      </main>

      <button 
        onClick={() => handleOpenCaptureModal()} 
        className="absolute bottom-8 right-8 bg-emerald-500 hover:bg-emerald-400 text-white rounded-full p-4 shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-emerald-500 transition-transform duration-150 ease-in-out transform hover:scale-110"
        aria-label="Quick Capture"
        >
        <PlusIcon className="w-8 h-8"/>
      </button>

      {isCaptureModalOpen && <CaptureModal isOpen={isCaptureModalOpen} onClose={() => setCaptureModalOpen(false)} onSave={handleSaveNewItem} projects={projects} areas={areas} context={captureContext}/>}
      {editingNote && <NoteEditorModal isOpen={!!editingNote} onClose={() => setEditingNoteId(null)} note={editingNote} onSave={handleUpdateNote}/>}
      {organizingItem && <OrganizeModal isOpen={!!organizingItem} onClose={() => setOrganizingItem(null)} item={organizingItem} projects={projects} areas={areas} onSave={handleOrganizeItem} />}
    </div>
  );
};

export default App;

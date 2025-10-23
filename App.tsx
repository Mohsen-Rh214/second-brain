import React, { useCallback, useMemo, useEffect } from 'react';
import { View, ItemType, DashboardCaptureType, CaptureContext, InboxItem } from './types';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './components/views/Dashboard';
import CaptureModal from './components/modals/CaptureModal';
import NoteEditorModal from './components/modals/NoteEditorModal';
import ResourceEditorModal from './components/modals/ResourceEditorModal';
import ProjectView from './components/views/ProjectView';
import AreaView from './components/views/AreaView';
import ArchiveView from './components/views/ArchiveView';
import ResourceView from './components/views/ResourceView';
import SearchView from './components/views/SearchView';
import OrganizeModal from './components/modals/OrganizeModal';
import { PlusIcon } from './components/shared/icons';
import TaskView from './components/views/TaskView';
import ReviewView from './components/views/ReviewView';
import GraphView from './components/views/GraphView';
import CommandBar from './components/modals/CommandBar';
import { useData } from './store/DataContext';
import { useUI } from './store/UIContext';
import { getItemTypeFromId } from './utils';

const App: React.FC = () => {
  const { state: dataState, dispatch: dataDispatch } = useData();
  const { areas, projects, tasks, notes, resources } = dataState;

  const { state: uiState, dispatch: uiDispatch } = useUI();
  const { 
    currentView, activeAreaId, activeProjectId, isCaptureModalOpen, captureContext,
    editingNoteId, editingResourceId, organizingItem, searchQuery, isCommandBarOpen, toastMessage
  } = uiState;

  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
          if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
              e.preventDefault();
              uiDispatch({ type: 'SET_COMMAND_BAR_OPEN', payload: !isCommandBarOpen });
          }
           if (e.key === 'Escape') {
              uiDispatch({ type: 'SET_COMMAND_BAR_OPEN', payload: false });
           }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandBarOpen, uiDispatch]);

  const showToast = useCallback((message: string) => {
      uiDispatch({ type: 'SHOW_TOAST', payload: message });
      setTimeout(() => uiDispatch({ type: 'SHOW_TOAST', payload: null }), 3000);
  }, [uiDispatch]);

  const handleNavigate = useCallback((view: View, itemId: string | null = null) => {
    uiDispatch({ type: 'SET_VIEW', payload: { view, itemId } });
  }, [uiDispatch]);

  const handleOpenCaptureModal = useCallback((context: CaptureContext | null = null) => {
    uiDispatch({ type: 'SET_CAPTURE_MODAL', payload: { isOpen: true, context } });
  }, [uiDispatch]);

  const handleDashboardCapture = useCallback((content: string, type: DashboardCaptureType) => {
    dataDispatch({ type: 'DASHBOARD_CAPTURE', payload: { content, type } });
    showToast(`New ${type} added to Inbox!`);
  }, [dataDispatch, showToast]);

  const handleSaveNewItem = useCallback((itemData, itemType, parentId) => {
      dataDispatch({ type: 'ADD_ITEM', payload: { itemData, itemType, parentId } });
      uiDispatch({ type: 'SET_CAPTURE_MODAL', payload: { isOpen: false } });
  }, [dataDispatch, uiDispatch]);
  
  const handleToggleTask = useCallback((taskId: string) => {
    dataDispatch({ type: 'TOGGLE_TASK', payload: { taskId } });
  }, [dataDispatch]);

  const handleReorderTasks = useCallback((sourceTaskId: string, targetTaskId: string) => {
      dataDispatch({ type: 'REORDER_TASKS', payload: { sourceTaskId, targetTaskId } });
  }, [dataDispatch]);

  const handleUpdateTask = useCallback((taskId, updates) => {
      dataDispatch({ type: 'UPDATE_TASK', payload: { taskId, updates } });
  }, [dataDispatch]);
  
  const handleUpdateItemStatus = useCallback((itemId, status) => {
      dataDispatch({ type: 'UPDATE_ITEM_STATUS', payload: { itemId, status } });
  }, [dataDispatch]);

  const handleArchiveItem = useCallback((itemId: string) => handleUpdateItemStatus(itemId, 'archived'), [handleUpdateItemStatus]);
  const handleRestoreItem = useCallback((itemId: string) => handleUpdateItemStatus(itemId, 'active'), [handleUpdateItemStatus]);
  
  const handleDeleteItem = useCallback((itemId: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this item? This action cannot be undone.")) return;
    dataDispatch({ type: 'DELETE_ITEM', payload: { itemId } });
  }, [dataDispatch]);

  const handleUpdateNote = useCallback((noteId, title, content) => {
    dataDispatch({ type: 'UPDATE_NOTE', payload: { noteId, title, content } });
    uiDispatch({ type: 'SET_EDITING_NOTE', payload: null });
  }, [dataDispatch, uiDispatch]);

  const handleDraftFromNote = useCallback((sourceNoteId: string) => {
    dataDispatch({
        type: 'DRAFT_FROM_NOTE',
        payload: {
            sourceNoteId,
            onDraftCreated: (newNoteId) => {
                uiDispatch({ type: 'SET_EDITING_NOTE', payload: newNoteId });
                showToast('New draft created from note!');
            }
        }
    });
  }, [dataDispatch, showToast, uiDispatch]);

  const handleUpdateResource = useCallback((resourceId, title, content) => {
    dataDispatch({ type: 'UPDATE_RESOURCE', payload: { resourceId, title, content } });
    uiDispatch({ type: 'SET_EDITING_RESOURCE', payload: null });
  }, [dataDispatch, uiDispatch]);
  
  const handleUpdateProject = useCallback((projectId, updates) => {
    dataDispatch({ type: 'UPDATE_PROJECT', payload: { projectId, updates } });
  }, [dataDispatch]);

  const handleUpdateArea = useCallback((areaId, updates) => {
    dataDispatch({ type: 'UPDATE_AREA', payload: { areaId, updates } });
  }, [dataDispatch]);

  const handleOrganizeItem = useCallback((itemId, newParentIds) => {
    dataDispatch({ type: 'ORGANIZE_ITEM', payload: { itemId, newParentIds } });
    uiDispatch({ type: 'SET_ORGANIZING_ITEM', payload: null });
  }, [dataDispatch, uiDispatch]);

  const handleMarkReviewed = useCallback((itemIds, type) => {
      dataDispatch({ type: 'MARK_REVIEWED', payload: { itemIds, type } });
  }, [dataDispatch]);

  const handleSelectItem = useCallback((item: InboxItem) => {
    if (item.id.startsWith('note-')) {
        uiDispatch({ type: 'SET_EDITING_NOTE', payload: item.id });
    } else if (item.id.startsWith('res-')) {
        uiDispatch({ type: 'SET_EDITING_RESOURCE', payload: item.id });
    }
  }, [uiDispatch]);
  
  const handleCommand = useCallback((command: { id: string, type: string }) => {
    uiDispatch({ type: 'SET_COMMAND_BAR_OPEN', payload: false });
    
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
            case 'note': uiDispatch({ type: 'SET_EDITING_NOTE', payload: command.id }); break;
            case 'resource': uiDispatch({ type: 'SET_EDITING_RESOURCE', payload: command.id }); break;
        }
    }
  }, [tasks, handleOpenCaptureModal, handleNavigate, uiDispatch]);

  const inboxItems = useMemo(() => [
      ...notes.filter(n => n.status === 'active' && n.parentIds.length === 0),
      ...resources.filter(r => r.status === 'active' && r.parentIds.length === 0)
  ], [notes, resources]);

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
      case 'inbox':
        return <Dashboard 
            projects={projects} 
            areas={areas} 
            tasks={tasks} 
            inboxItems={inboxItems}
            onNavigate={handleNavigate}
            onToggleTask={handleToggleTask}
            onOrganizeItem={(item) => uiDispatch({ type: 'SET_ORGANIZING_ITEM', payload: item })}
            onDeleteItem={handleDeleteItem}
            onSaveNewTask={(title) => handleSaveNewItem({ title }, 'task', null)}
            onDashboardCapture={handleDashboardCapture}
            onSelectItem={handleSelectItem}
            onReorderTasks={handleReorderTasks}
            onUpdateTask={handleUpdateTask}
        />;
      
      case 'tasks':
        return <TaskView 
            tasks={tasks.filter(t => t.status === 'active')}
            projects={projects}
            onToggleTask={handleToggleTask}
        />;
      
      case 'projects':
        return <ProjectView 
            projects={projects.filter(p => p.status === 'active')} 
            activeProjectId={activeProjectId} 
            onSelectProject={(id) => uiDispatch({ type: 'SET_ACTIVE_PROJECT', payload: id })}
            tasks={tasks.filter(t => t.status === 'active')}
            notes={notes.filter(n => n.status === 'active')}
            resources={resources.filter(r => r.status === 'active')}
            onToggleTask={handleToggleTask}
            onArchive={handleArchiveItem}
            onDelete={handleDeleteItem}
            onSelectNote={(id) => uiDispatch({ type: 'SET_EDITING_NOTE', payload: id })}
            onUpdateProject={handleUpdateProject}
            onOpenCaptureModal={handleOpenCaptureModal}
            onUpdateTask={handleUpdateTask}
            />;
      case 'areas':
          return <AreaView
              areas={areas.filter(a => a.status === 'active')}
              activeAreaId={activeAreaId}
              onSelectArea={(id) => uiDispatch({ type: 'SET_ACTIVE_AREA', payload: id })}
              projects={projects.filter(p => p.status === 'active')}
              notes={notes.filter(n => n.status === 'active')}
              resources={resources.filter(r => r.status === 'active')}
              onArchive={handleArchiveItem}
              onDelete={handleDeleteItem}
              onSelectNote={(id) => uiDispatch({ type: 'SET_EDITING_NOTE', payload: id })}
              onUpdateArea={handleUpdateArea}
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
        return <p>Unknown view: {currentView}</p>;
    }
  };
  
  const editingNote = notes.find(n => n.id === editingNoteId);
  const editingResource = resources.find(r => r.id === editingResourceId);

  return (
    <div className="h-screen w-screen bg-transparent text-text-primary flex overflow-hidden font-sans">
      <Sidebar 
        onNavigate={handleNavigate}
        inboxCount={inboxItems.length}
      />
      <main className="flex-1 flex flex-col overflow-y-hidden">
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          {renderView()}
        </div>
      </main>

      <button 
        onClick={() => handleOpenCaptureModal()} 
        className="absolute bottom-8 right-8 bg-accent hover:bg-accent-hover text-accent-content p-4 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-accent-hover transition-transform duration-300 ease-soft"
        aria-label="Capture new item"
        >
        <PlusIcon className="w-6 h-6"/>
         <span className="sr-only">Capture new item</span>
      </button>
      
      {toastMessage && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-surface backdrop-blur-xl border border-outline px-6 py-3 rounded-xl shadow-lg text-sm text-text-primary animate-fade-in-out">
              {toastMessage}
          </div>
      )}

      {isCommandBarOpen && <CommandBar isOpen={isCommandBarOpen} onClose={() => uiDispatch({ type: 'SET_COMMAND_BAR_OPEN', payload: false })} onCommand={handleCommand} areas={areas} projects={projects} notes={notes} resources={resources} tasks={tasks}/>}
      {isCaptureModalOpen && <CaptureModal isOpen={isCaptureModalOpen} onClose={() => uiDispatch({ type: 'SET_CAPTURE_MODAL', payload: { isOpen: false }})} onSave={handleSaveNewItem} projects={projects} areas={areas} context={captureContext}/>}
      {editingNote && <NoteEditorModal isOpen={!!editingNote} onClose={() => uiDispatch({ type: 'SET_EDITING_NOTE', payload: null })} note={editingNote} onSave={handleUpdateNote} onDraftFromNote={handleDraftFromNote} projects={projects} areas={areas} allNotes={notes} />}
      {editingResource && <ResourceEditorModal isOpen={!!editingResource} onClose={() => uiDispatch({ type: 'SET_EDITING_RESOURCE', payload: null })} resource={editingResource} onSave={handleUpdateResource} />}
      {organizingItem && <OrganizeModal isOpen={!!organizingItem} onClose={() => uiDispatch({ type: 'SET_ORGANIZING_ITEM', payload: null })} item={organizingItem} projects={projects} areas={areas} onSave={handleOrganizeItem} />}
    </div>
  );
};

export default App;
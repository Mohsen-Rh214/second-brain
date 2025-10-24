import React, { useCallback, useMemo, useEffect } from 'react';
import { View, ItemType, DashboardCaptureType, CaptureContext, InboxItem, NewItemPayload, Task, TaskStage, Resource } from './types';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './components/views/Dashboard';
import CaptureModal from './components/modals/CaptureModal';
import NoteEditorModal from './components/modals/NoteEditorModal';
import ResourceDetailModal from './components/modals/ResourceEditorModal';
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
import SettingsView from './components/views/SettingsView';
import CommandBar from './components/modals/CommandBar';
import LinkTaskModal from './components/modals/LinkTaskModal';
import TaskDetailModal from './components/modals/TaskDetailModal';
import { useData } from './store/DataContext';
import { useUI } from './store/UIContext';
import { getItemTypeFromId } from './utils';
import CalendarView from './components/views/CalendarView';

const App: React.FC = () => {
  const { state: dataState, dispatch: dataDispatch } = useData();
  const { areas, projects, tasks, notes, resources } = dataState;

  const { state: uiState, dispatch: uiDispatch } = useUI();
  const { 
    currentView, activeAreaId, activeProjectId, isCaptureModalOpen, captureContext,
    editingNoteId, editingResourceId, editingTaskId, organizingItem, searchQuery, isCommandBarOpen, toastMessage,
    linkingTask
  } = uiState;

    const handleOpenCaptureModal = useCallback((context: CaptureContext | null = null) => {
    uiDispatch({ type: 'SET_CAPTURE_MODAL', payload: { isOpen: true, context } });
  }, [uiDispatch]);

  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
          const target = e.target as HTMLElement;
          const isEditingText = ['INPUT', 'TEXTAREA'].includes(target.tagName) || target.isContentEditable;

          // Universal Escape handler
          if (e.key === 'Escape') {
              if (isCommandBarOpen) {
                  uiDispatch({ type: 'SET_COMMAND_BAR_OPEN', payload: false });
              } else if (isCaptureModalOpen) {
                  uiDispatch({ type: 'SET_CAPTURE_MODAL', payload: { isOpen: false }});
              } else if (editingNoteId) {
                  uiDispatch({ type: 'SET_EDITING_NOTE', payload: null });
              } else if (editingTaskId) {
                  uiDispatch({ type: 'SET_EDITING_TASK', payload: null });
              } else if (editingResourceId) {
                  uiDispatch({ type: 'SET_EDITING_RESOURCE', payload: null });
              } else if (organizingItem) {
                  uiDispatch({ type: 'SET_ORGANIZING_ITEM', payload: null });
              } else if (linkingTask) {
                  uiDispatch({ type: 'SET_LINKING_TASK', payload: null });
              } else if (isEditingText) {
                  target.blur();
              }
              return;
          }
          
          // Don't run other shortcuts if editing text
          if (isEditingText) return;

          if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
              e.preventDefault();
              uiDispatch({ type: 'SET_COMMAND_BAR_OPEN', payload: !isCommandBarOpen });
          } else if (e.key === 'c' && !e.metaKey && !e.ctrlKey) {
              e.preventDefault();
              uiDispatch({ type: 'SET_COMMAND_BAR_OPEN', payload: true });
          } else if (e.key === 'n' && !e.metaKey && !e.ctrlKey) {
              e.preventDefault();
              handleOpenCaptureModal({ parentId: null, itemType: 'note' });
          } else if (e.key === 't' && !e.metaKey && !e.ctrlKey) {
              e.preventDefault();
              handleOpenCaptureModal({ parentId: null, itemType: 'task' });
          }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandBarOpen, isCaptureModalOpen, editingNoteId, editingResourceId, editingTaskId, organizingItem, linkingTask, uiDispatch, handleOpenCaptureModal]);

  const showToast = useCallback((message: string) => {
      uiDispatch({ type: 'SHOW_TOAST', payload: message });
      setTimeout(() => uiDispatch({ type: 'SHOW_TOAST', payload: null }), 3000);
  }, [uiDispatch]);

  const handleNavigate = useCallback((view: View, itemId: string | null = null) => {
    uiDispatch({ type: 'SET_VIEW', payload: { view, itemId } });
  }, [uiDispatch]);

  const handleSaveNewItem = useCallback((itemData: NewItemPayload, itemType: ItemType, parentId: string | null) => {
      dataDispatch({ type: 'ADD_ITEM', payload: { itemData, itemType, parentId } });
      // Only close modal if it's the source, not for dashboard inline creation
      if(isCaptureModalOpen) {
        uiDispatch({ type: 'SET_CAPTURE_MODAL', payload: { isOpen: false } });
      }
  }, [dataDispatch, uiDispatch, isCaptureModalOpen]);

  const handleCreateTaskFromNote = useCallback((itemData: NewItemPayload, parentId: string | null) => {
      dataDispatch({ type: 'ADD_ITEM', payload: { itemData, itemType: 'task', parentId } });
      showToast('Task created and linked!');
  }, [dataDispatch, showToast]);
  
  const handleAddSubtask = useCallback((parentTaskId: string, subtaskData: NewItemPayload) => {
    dataDispatch({ type: 'ADD_SUBTASK', payload: { parentTaskId, subtaskData } });
  }, [dataDispatch]);

  const handleDashboardCapture = useCallback((content: string, type: DashboardCaptureType) => {
    if (type === 'task') {
        handleSaveNewItem({ title: content, isMyDay: false }, 'task', null);
    } else {
        dataDispatch({ type: 'ADD_INBOX_ITEM', payload: { content, type } });
    }
    showToast(`New ${type} added to Inbox!`);
  }, [dataDispatch, showToast, handleSaveNewItem]);
  
  const handleToggleTask = useCallback((taskId: string) => {
    dataDispatch({ type: 'TOGGLE_TASK', payload: { taskId } });
  }, [dataDispatch]);

  const handleReorderTasks = useCallback((sourceTaskId: string, targetTaskId: string) => {
      dataDispatch({ type: 'REORDER_TASKS', payload: { sourceTaskId, targetTaskId } });
  }, [dataDispatch]);
  
  const handleReparentTask = useCallback((taskId: string, newParentId: string) => {
      dataDispatch({ type: 'REPARENT_TASK', payload: { taskId, newParentId } });
  }, [dataDispatch]);

  const handleUpdateTask = useCallback((taskId: string, updates: Partial<Task>) => {
      dataDispatch({ type: 'UPDATE_TASK', payload: { taskId, updates } });
  }, [dataDispatch]);

  const handleUpdateTaskStage = useCallback((taskId: string, newStage: TaskStage) => {
    dataDispatch({ type: 'UPDATE_TASK_STAGE', payload: { taskId, newStage } });
  }, [dataDispatch]);
  
  const handleUpdateMultipleTaskStages = useCallback((taskIds: string[], newStage: TaskStage) => {
    dataDispatch({ type: 'UPDATE_MULTIPLE_TASK_STAGES', payload: { taskIds, newStage } });
  }, [dataDispatch]);

  const handleUpdateItemStatus = useCallback((itemId: string, status: 'active' | 'archived') => {
      dataDispatch({ type: 'UPDATE_ITEM_STATUS', payload: { itemId, status } });
  }, [dataDispatch]);

  const handleArchiveItem = useCallback((itemId: string) => handleUpdateItemStatus(itemId, 'archived'), [handleUpdateItemStatus]);
  const handleRestoreItem = useCallback((itemId: string) => handleUpdateItemStatus(itemId, 'active'), [handleUpdateItemStatus]);
  
  const handleDeleteItem = useCallback((itemId: string) => {
    const itemType = getItemTypeFromId(itemId);
    const message = itemType === 'task'
        ? "Are you sure you want to delete this task? If it's a parent task, its subtasks will not be deleted but will become orphaned."
        : "Are you sure you want to permanently delete this item? This action cannot be undone.";

    if (!window.confirm(message)) return;
    dataDispatch({ type: 'DELETE_ITEM', payload: { itemId } });
  }, [dataDispatch]);

  const handleUpdateNote = useCallback((noteId: string, title: string, content: string, tags: string[]) => {
    dataDispatch({ type: 'UPDATE_NOTE', payload: { noteId, title, content, tags } });
    uiDispatch({ type: 'SET_EDITING_NOTE', payload: null });
  }, [dataDispatch, uiDispatch]);

  const handleDraftFromNote = useCallback((sourceNoteId: string) => {
    const newNoteId = `note-${Date.now()}`;
    dataDispatch({
        type: 'DRAFT_FROM_NOTE',
        payload: {
            sourceNoteId,
            newNoteId,
        }
    });
    uiDispatch({ type: 'SET_EDITING_NOTE', payload: newNoteId });
    showToast('New draft created from note!');
  }, [dataDispatch, showToast, uiDispatch]);

  const handleUpdateResource = useCallback((resourceId: string, updates: Partial<Resource>) => {
    dataDispatch({ type: 'UPDATE_RESOURCE', payload: { resourceId, updates } });
  }, [dataDispatch]);
  
  const handleUpdateProject = useCallback((projectId: string, updates: { title?: string, description?: string, tags?: string[] }) => {
    dataDispatch({ type: 'UPDATE_PROJECT', payload: { projectId, updates } });
  }, [dataDispatch]);

  const handleUpdateArea = useCallback((areaId: string, updates: { title?: string, description?: string, tags?: string[] }) => {
    dataDispatch({ type: 'UPDATE_AREA', payload: { areaId, updates } });
  }, [dataDispatch]);

  const handleOrganizeItem = useCallback((itemId: string, newParentIds: string[]) => {
    dataDispatch({ type: 'ORGANIZE_ITEM', payload: { itemId, newParentIds } });
    uiDispatch({ type: 'SET_ORGANIZING_ITEM', payload: null });
    showToast('Item organized!');
  }, [dataDispatch, uiDispatch, showToast]);

  const handleMarkReviewed = useCallback((itemIds: string[], type: 'project' | 'area') => {
      dataDispatch({ type: 'MARK_REVIEWED', payload: { itemIds, type } });
  }, [dataDispatch]);

  const handleSelectItem = useCallback((item: InboxItem) => {
    if (item.id.startsWith('note-')) {
        uiDispatch({ type: 'SET_EDITING_NOTE', payload: item.id });
    } else if (item.id.startsWith('res-')) {
        uiDispatch({ type: 'SET_EDITING_RESOURCE', payload: item.id });
    } else if (item.id.startsWith('task-')) {
        uiDispatch({ type: 'SET_EDITING_TASK', payload: item.id });
    }
  }, [uiDispatch]);
  
  const handleOpenLinkTaskModal = useCallback((taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        uiDispatch({ type: 'SET_LINKING_TASK', payload: task });
    }
  }, [tasks, uiDispatch]);

  const handleLinkTask = useCallback((taskId: string, projectId: string) => {
      dataDispatch({ type: 'ORGANIZE_ITEM', payload: { itemId: taskId, newParentIds: [projectId] }});
      uiDispatch({ type: 'SET_LINKING_TASK', payload: null });
      showToast('Task linked to project!');
  }, [dataDispatch, uiDispatch, showToast]);
  
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
            case 'task': uiDispatch({ type: 'SET_EDITING_TASK', payload: command.id }); break;
            case 'note': uiDispatch({ type: 'SET_EDITING_NOTE', payload: command.id }); break;
            case 'resource': uiDispatch({ type: 'SET_EDITING_RESOURCE', payload: command.id }); break;
        }
    }
  }, [handleOpenCaptureModal, handleNavigate, uiDispatch]);

  const inboxItems = useMemo(() => [
      ...notes.filter(n => n.status === 'active' && n.parentIds.length === 0),
      ...resources.filter(r => r.status === 'active' && r.parentIds.length === 0),
      ...tasks.filter(t => t.status === 'active' && t.projectId === null && t.stage !== 'Done' && !t.isMyDay)
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()), [notes, resources, tasks]);

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
            onDirectOrganizeItem={handleOrganizeItem}
            onDeleteItem={handleDeleteItem}
            onSaveNewTask={(title) => handleSaveNewItem({ title, isMyDay: true }, 'task', null)}
            onDashboardCapture={handleDashboardCapture}
            onSelectItem={handleSelectItem}
            onReorderTasks={handleReorderTasks}
            onUpdateTask={handleUpdateTask}
            onOpenLinkTaskModal={handleOpenLinkTaskModal}
            onSelectTask={(id) => uiDispatch({ type: 'SET_EDITING_TASK', payload: id })}
        />;
      
      case 'tasks':
        return <TaskView 
            tasks={tasks.filter(t => t.status === 'active')}
            projects={projects}
            onToggleTask={handleToggleTask}
            onSelectTask={(id) => uiDispatch({ type: 'SET_EDITING_TASK', payload: id })}
        />;
      
      case 'projects':
        return <ProjectView 
            projects={projects.filter(p => p.status === 'active')} 
            activeProjectId={activeProjectId} 
            onSelectProject={(id) => uiDispatch({ type: 'SET_ACTIVE_PROJECT', payload: id })}
            allTasks={tasks}
            tasks={tasks.filter(t => t.status === 'active')}
            notes={notes.filter(n => n.status === 'active')}
            resources={resources.filter(r => r.status === 'active')}
            onToggleTask={handleToggleTask}
            onArchive={handleArchiveItem}
            onDelete={handleDeleteItem}
            onSelectNote={(id) => uiDispatch({ type: 'SET_EDITING_NOTE', payload: id })}
            onSelectTask={(id) => uiDispatch({ type: 'SET_EDITING_TASK', payload: id })}
            onUpdateProject={handleUpdateProject}
            onOpenCaptureModal={handleOpenCaptureModal}
            onSaveNewItem={handleSaveNewItem}
            onReorderTasks={handleReorderTasks}
            onReparentTask={handleReparentTask}
            onUpdateTask={handleUpdateTask}
            onUpdateTaskStage={handleUpdateTaskStage}
            onUpdateMultipleTaskStages={handleUpdateMultipleTaskStages}
            />;
      case 'areas':
          return <AreaView
              areas={areas.filter(a => a.status === 'active')}
              activeAreaId={activeAreaId}
              onSelectArea={(id) => uiDispatch({ type: 'SET_ACTIVE_AREA', payload: id })}
              projects={projects.filter(p => p.status === 'active')}
              tasks={tasks.filter(t => t.status === 'active')}
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
              onEditResource={(id) => uiDispatch({ type: 'SET_EDITING_RESOURCE', payload: id })}
              onNavigate={handleNavigate}
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
            tasks={tasks.filter(t => t.status === 'active' && t.stage !== 'Done')}
            onNavigate={handleNavigate}
            onMarkReviewed={handleMarkReviewed}
          />
        case 'calendar':
          return <CalendarView
            tasks={tasks.filter(t => t.status === 'active')}
            projects={projects.filter(p => p.status === 'active')}
            onNavigate={handleNavigate}
          />
      case 'settings':
          return <SettingsView />;
      default:
        return <p>Unknown view: {currentView}</p>;
    }
  };
  
  const editingNote = notes.find(n => n.id === editingNoteId);
  const editingResource = resources.find(r => r.id === editingResourceId);
  const editingTask = tasks.find(t => t.id === editingTaskId);

  const handleSelectTaskFromModal = useCallback((taskId: string) => {
    // Close any other open item modal before opening the task modal
    if (editingNoteId) uiDispatch({ type: 'SET_EDITING_NOTE', payload: null });
    if (editingResourceId) uiDispatch({ type: 'SET_EDITING_RESOURCE', payload: null });
    
    uiDispatch({ type: 'SET_EDITING_TASK', payload: taskId });
  }, [editingNoteId, editingResourceId, uiDispatch]);


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
        onClick={() => uiDispatch({ type: 'SET_COMMAND_BAR_OPEN', payload: true })} 
        className="absolute bottom-8 right-8 bg-accent hover:bg-accent-hover text-accent-content p-4 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-accent-hover transition-transform duration-300 ease-soft active:scale-95"
        aria-label="Open command bar"
        >
        <PlusIcon className="w-6 h-6"/>
         <span className="sr-only">Open command bar</span>
      </button>
      
      {toastMessage && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-surface backdrop-blur-xl border border-outline px-6 py-3 rounded-xl shadow-lg text-sm text-text-primary animate-fade-in-out">
              {toastMessage}
          </div>
      )}

      {isCommandBarOpen && <CommandBar isOpen={isCommandBarOpen} onClose={() => uiDispatch({ type: 'SET_COMMAND_BAR_OPEN', payload: false })} onCommand={handleCommand} areas={areas} projects={projects} notes={notes} resources={resources} tasks={tasks}/>}
      {isCaptureModalOpen && <CaptureModal isOpen={isCaptureModalOpen} onClose={() => uiDispatch({ type: 'SET_CAPTURE_MODAL', payload: { isOpen: false }})} onSave={handleSaveNewItem} projects={projects} areas={areas} context={captureContext}/>}
      {editingNote && <NoteEditorModal isOpen={!!editingNote} onClose={() => uiDispatch({ type: 'SET_EDITING_NOTE', payload: null })} note={editingNote} onSave={handleUpdateNote} onDraftFromNote={handleDraftFromNote} onSaveNewItem={handleCreateTaskFromNote} projects={projects} areas={areas} allNotes={notes} allTasks={tasks} onSelectTask={handleSelectTaskFromModal} />}
      {editingResource && <ResourceDetailModal isOpen={!!editingResource} onClose={() => uiDispatch({ type: 'SET_EDITING_RESOURCE', payload: null })} resource={editingResource} onSave={handleUpdateResource} allTasks={tasks} onSelectTask={handleSelectTaskFromModal} onArchive={handleArchiveItem} onDelete={handleDeleteItem} />}
      {editingTask && <TaskDetailModal isOpen={!!editingTask} onClose={() => uiDispatch({ type: 'SET_EDITING_TASK', payload: null })} task={editingTask} onSave={handleUpdateTask} onAddSubtask={handleAddSubtask} onToggleSubtask={handleToggleTask} onDelete={handleDeleteItem} allTasks={tasks} projects={projects} notes={notes} resources={resources} />}
      {organizingItem && <OrganizeModal isOpen={!!organizingItem} onClose={() => uiDispatch({ type: 'SET_ORGANIZING_ITEM', payload: null })} item={organizingItem} projects={projects} areas={areas} onSave={handleOrganizeItem} />}
      {linkingTask && <LinkTaskModal isOpen={!!linkingTask} onClose={() => uiDispatch({ type: 'SET_LINKING_TASK', payload: null })} onLink={handleLinkTask} taskToLink={linkingTask} projects={projects} />}
    </div>
  );
};

export default App;
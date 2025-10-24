export type Status = 'active' | 'archived';

export interface BaseItem {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  status: Status;
  tags?: string[];
}

export interface Area extends BaseItem {
  description: string;
  // An area can have multiple projects.
  projectIds: string[];
  lastReviewed?: string;
}

export interface Project extends BaseItem {
  description: string;
  // A project belongs to one area.
  areaId: string | null;
  // A project can have multiple tasks, notes, and resources.
  taskIds: string[];
  noteIds: string[];
  resourceIds: string[];
  lastReviewed?: string;
}

export type TaskStage = 'To Do' | 'In Progress' | 'Done';

export interface Task extends BaseItem {
  stage: TaskStage;
  description: string;
  // A task can belong to one project, or be unorganized (projectId is null).
  projectId: string | null;
  dueDate?: string; // e.g., '2024-08-15'
  priority?: 'Low' | 'Medium' | 'High';
  isMyDay?: boolean; // True if explicitly added to My Day, not just by due date
  // For sub-tasking
  subtaskIds: string[];
  parentId: string | null;
  // For linking to other items
  noteIds: string[];
  resourceIds: string[];
}

export interface Note extends BaseItem {
  content: string; // Can be simple text or HTML
  // A note can belong to multiple projects and/or areas.
  parentIds: string[]; // Can be project IDs or area IDs
}

export interface Resource extends BaseItem {
  url?: string; // URL for link
  content?: string; // Main text for text resource or notes for a link
  // A resource can belong to multiple projects and/or areas.
  parentIds: string[]; // Can be project IDs or area IDs
}

export type NewItemPayload = {
    title: string;
    url?: string;
    content?: string;
    description?: string;
    dueDate?: string;
    priority?: 'Low' | 'Medium' | 'High';
    isMyDay?: boolean;
    tags?: string[];
    noteIds?: string[];
    resourceIds?: string[];
};

export type InboxItem = Note | Resource | Task;

export type View = 'dashboard' | 'inbox' | 'areas' | 'projects' | 'tasks' | 'resources' | 'archives' | 'graph' | 'review' | 'settings' | 'calendar';

export type ItemType = 'note' | 'task' | 'resource' | 'project' | 'area';
export type DashboardCaptureType = 'note' | 'task' | 'resource';

export type CaptureContext = {
    parentId: string | null;
    itemType?: ItemType;
}

export type ProjectViewType = 'list' | 'board';
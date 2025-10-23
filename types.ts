export type Status = 'active' | 'archived';

export interface BaseItem {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  status: Status;
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

export interface Task extends BaseItem {
  completed: boolean;
  // A task belongs to one project, or can be a standalone "My Day" task.
  projectId: string | null;
  dueDate?: string; // e.g., '2024-08-15'
  priority?: 'Low' | 'Medium' | 'High';
}

export interface Note extends BaseItem {
  content: string; // Can be simple text or HTML
  // A note can belong to multiple projects and/or areas.
  parentIds: string[]; // Can be project IDs or area IDs
}

export interface Resource extends BaseItem {
  type: 'link' | 'file' | 'text';
  content: string; // URL for link, path for file, or text content
  // A resource can belong to multiple projects and/or areas.
  parentIds: string[]; // Can be project IDs or area IDs
}

export type NewItemPayload = {
    title: string;
    content?: string;
    description?: string;
    type?: 'link' | 'file' | 'text';
    dueDate?: string;
    priority?: 'Low' | 'Medium' | 'High';
};

export type InboxItem = Note | Resource;

export type View = 'dashboard' | 'inbox' | 'areas' | 'projects' | 'tasks' | 'resources' | 'archives' | 'graph' | 'review';
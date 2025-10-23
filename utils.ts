import { ItemType } from './types';

export const getItemTypeFromId = (id: string): ItemType | null => {
    if (id.startsWith('area-')) return 'area';
    if (id.startsWith('proj-')) return 'project';
    if (id.startsWith('task-')) return 'task';
    if (id.startsWith('note-')) return 'note';
    if (id.startsWith('res-')) return 'resource';
    return null;
}

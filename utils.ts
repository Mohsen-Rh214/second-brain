import { ItemType } from './types';

export const getItemTypeFromId = (id: string): ItemType | null => {
    if (id.startsWith('area-')) return 'area';
    if (id.startsWith('proj-')) return 'project';
    if (id.startsWith('task-')) return 'task';
    if (id.startsWith('note-')) return 'note';
    if (id.startsWith('res-')) return 'resource';
    return null;
}

export const isUrl = (text: string): boolean => {
    if (!text.includes('.') || text.includes(' ')) {
        return false;
    }
    try {
        const url = new URL(text.startsWith('http') ? text : `https://${text}`);
        // The protocol check is important because new URL('foo:bar') is valid.
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (e) {
        return false;
    }
};
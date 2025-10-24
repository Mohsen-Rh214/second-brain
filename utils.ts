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

const timeUnits: { unit: Intl.RelativeTimeFormatUnit; seconds: number }[] = [
  { unit: 'year', seconds: 31536000 },
  { unit: 'month', seconds: 2592000 },
  { unit: 'week', seconds: 604800 },
  { unit: 'day', seconds: 86400 },
  { unit: 'hour', seconds: 3600 },
  { unit: 'minute', seconds: 60 },
  { unit: 'second', seconds: 1 },
];

export const formatRelativeTime = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.round((now.getTime() - date.getTime()) / 1000);

  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

  for (const { unit, seconds: unitSeconds } of timeUnits) {
    if (seconds >= unitSeconds) {
      const value = Math.round(seconds / unitSeconds);
      return rtf.format(-value, unit);
    }
  }
  return 'just now';
};
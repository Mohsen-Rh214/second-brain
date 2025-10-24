import React, { useState, useMemo } from 'react';
import { Note, Resource } from '../../types';
import { XIcon, SearchIcon, FileTextIcon, ResourceIcon } from '../shared/icons';

interface LinkItemSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLinkItems: (links: { noteIds: string[]; resourceIds: string[] }) => void;
  notes: Note[];
  resources: Resource[];
  existingNoteIds: string[];
  existingResourceIds: string[];
}

const LinkItemSelectorModal: React.FC<LinkItemSelectorModalProps> = ({
  isOpen,
  onClose,
  onLinkItems,
  notes,
  resources,
  existingNoteIds,
  existingResourceIds,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNoteIds, setSelectedNoteIds] = useState<string[]>([]);
  const [selectedResourceIds, setSelectedResourceIds] = useState<string[]>([]);

  const linkableItems = useMemo(() => {
    const lowerQuery = searchQuery.toLowerCase();

    const linkableNotes = notes
      .filter(n => !existingNoteIds.includes(n.id) && n.title.toLowerCase().includes(lowerQuery))
      .map(n => ({ ...n, type: 'note' as const }));
      
    const linkableResources = resources
      .filter(r => !existingResourceIds.includes(r.id) && r.title.toLowerCase().includes(lowerQuery))
      .map(r => ({ ...r, type: 'resource' as const }));

    return { notes: linkableNotes, resources: linkableResources };
  }, [searchQuery, notes, resources, existingNoteIds, existingResourceIds]);
  
  const handleToggleSelection = (type: 'note' | 'resource', id: string) => {
    if (type === 'note') {
        setSelectedNoteIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    } else {
        setSelectedResourceIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    }
  }

  const handleLink = () => {
    onLinkItems({ noteIds: selectedNoteIds, resourceIds: selectedResourceIds });
    onClose();
  };
  
  if (!isOpen) return null;

  return (
    <div 
        className="fixed inset-0 bg-black/30 z-[60] flex items-center justify-center p-4 backdrop-blur-sm"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="link-item-title"
    >
      <div 
        className="bg-surface/90 backdrop-blur-xl w-full max-w-lg max-h-[80vh] flex flex-col border border-outline rounded-2xl shadow-lg"
        onClick={e => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-outline-dark flex-shrink-0">
          <h2 id="link-item-title" className="text-xl font-bold font-heading">Link Items</h2>
          <button onClick={onClose} aria-label="Close" className="text-text-secondary hover:text-text-primary">
            <XIcon className="w-6 h-6" />
          </button>
        </header>

        <div className="p-4 flex-1 flex flex-col overflow-y-hidden">
            <div className="relative mb-2 flex-shrink-0">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search notes and resources..."
                    className="w-full bg-background/50 border border-outline rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                />
            </div>
            <div className="flex-1 space-y-1 border border-outline-dark p-2 rounded-lg overflow-y-auto custom-scrollbar bg-background/30">
                {linkableItems.notes.length === 0 && linkableItems.resources.length === 0 ? (
                    <p className="p-4 text-center text-sm text-text-tertiary">No items found.</p>
                ) : (
                    <>
                        {linkableItems.notes.map(note => (
                             <div key={note.id} className="flex items-center p-1">
                                <input
                                    type="checkbox"
                                    id={`link-item-${note.id}`}
                                    checked={selectedNoteIds.includes(note.id)}
                                    onChange={() => handleToggleSelection('note', note.id)}
                                    className="h-4 w-4 rounded border-outline bg-surface text-accent focus:ring-accent"
                                />
                                <label htmlFor={`link-item-${note.id}`} className="ml-3 flex items-center gap-2 text-sm text-text-primary">
                                    <FileTextIcon className="w-4 h-4 text-text-secondary" />
                                    <span>{note.title}</span>
                                </label>
                            </div>
                        ))}
                        {linkableItems.resources.map(res => (
                            <div key={res.id} className="flex items-center p-1">
                                <input
                                    type="checkbox"
                                    id={`link-item-${res.id}`}
                                    checked={selectedResourceIds.includes(res.id)}
                                    onChange={() => handleToggleSelection('resource', res.id)}
                                    className="h-4 w-4 rounded border-outline bg-surface text-accent focus:ring-accent"
                                />
                                <label htmlFor={`link-item-${res.id}`} className="ml-3 flex items-center gap-2 text-sm text-text-primary">
                                    <ResourceIcon className="w-4 h-4 text-text-secondary" />
                                    <span>{res.title}</span>
                                </label>
                            </div>
                        ))}
                    </>
                )}
            </div>
        </div>

        <footer className="p-4 bg-black/5 border-t border-outline-dark mt-auto flex-shrink-0">
          <div className="flex justify-end gap-3">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium bg-secondary hover:bg-secondary-hover text-secondary-content transition-colors rounded-lg">Cancel</button>
              <button type="button" onClick={handleLink} disabled={selectedNoteIds.length === 0 && selectedResourceIds.length === 0} className="px-4 py-2 text-sm font-medium bg-accent hover:bg-accent-hover text-accent-content transition-colors rounded-lg disabled:bg-neutral disabled:text-text-tertiary">Link Items</button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default React.memo(LinkItemSelectorModal);

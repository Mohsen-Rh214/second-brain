import React, { useState, useEffect, useMemo, useRef } from 'react';
import ReactQuill from 'react-quill';
import { Note, Project, Area } from '../types';
import { XIcon, ProjectIcon, AreaIcon, FileTextIcon, MaximizeIcon, MinimizeIcon, GitBranchIcon } from './icons';

interface NoteEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (noteId: string, title: string, content: string) => void;
  onDraftFromNote: (noteId: string) => void;
  note: Note;
  projects: Project[];
  areas: Area[];
  allNotes: Note[];
}

interface LinkableItem {
    id: string;
    title: string;
    type: 'note' | 'project' | 'area';
}

interface LinkSelectorProps {
    items: LinkableItem[];
    onSelect: (item: LinkableItem) => void;
    query: string;
    activeIndex: number;
    setActiveIndex: (index: number) => void;
}

const LinkSelector: React.FC<LinkSelectorProps> = ({ items, onSelect, query, activeIndex, setActiveIndex }) => {
    const listRef = useRef<HTMLUListElement>(null);
    
    useEffect(() => {
        // Scroll active item into view
        listRef.current?.children[activeIndex]?.scrollIntoView({
            block: 'nearest',
        });
    }, [activeIndex]);

    return (
        <div className="bg-surface/80 backdrop-blur-xl border border-outline rounded-lg shadow-lg w-96">
            <div className="p-2 border-b border-outline-dark text-sm text-text-secondary">
                Linking to: <span className="text-text-primary font-mono bg-background/50 px-1 rounded">/{query}</span>
            </div>
            <ul ref={listRef} className="max-h-60 overflow-y-auto custom-scrollbar p-1">
                {items.length > 0 ? items.map((item, index) => (
                    <li key={item.id}>
                        <button 
                            onClick={() => onSelect(item)} 
                            onMouseEnter={() => setActiveIndex(index)}
                            className={`w-full text-left flex items-center gap-2 p-2 rounded-md transition-colors ${activeIndex === index ? 'bg-accent/20' : 'hover:bg-neutral'}`}
                        >
                            {item.type === 'note' && <FileTextIcon className="w-4 h-4 text-text-secondary flex-shrink-0"/>}
                            {item.type === 'project' && <ProjectIcon className="w-4 h-4 text-text-secondary flex-shrink-0"/>}
                            {item.type === 'area' && <AreaIcon className="w-4 h-4 text-text-secondary flex-shrink-0"/>}
                            <span className="truncate">{item.title}</span>
                        </button>
                    </li>
                )) : (
                    <li className="p-2 text-center text-sm text-text-tertiary">No matching items found</li>
                )}
            </ul>
        </div>
    )
}

const NoteEditorModal: React.FC<NoteEditorModalProps> = ({ isOpen, onClose, onSave, onDraftFromNote, note, projects, areas, allNotes }) => {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [isExpanded, setExpanded] = useState(false);
  const [linkSelector, setLinkSelector] = useState<{ top: number; left: number; startPos: number; } | null>(null);
  const [linkQuery, setLinkQuery] = useState('');
  const [linkSelectorActiveIndex, setLinkSelectorActiveIndex] = useState(0);

  const quillRef = useRef<ReactQuill>(null);
  const linkSelectorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
  }, [note]);
  
  const linkableItems: LinkableItem[] = useMemo(() => [
    ...allNotes.filter(n => n.id !== note.id).map(n => ({ id: n.id, title: n.title, type: 'note' as const })),
    ...projects.map(p => ({ id: p.id, title: p.title, type: 'project' as const })),
    ...areas.map(a => ({ id: a.id, title: a.title, type: 'area' as const })),
  ], [allNotes, projects, areas, note.id]);

  const filteredLinkableItems = useMemo(() => linkableItems.filter(item => 
        item.title.toLowerCase().includes(linkQuery.toLowerCase())
    ), [linkableItems, linkQuery]);

  useEffect(() => {
    setLinkSelectorActiveIndex(0);
  }, [filteredLinkableItems.length]);

  // Effect to manage link selector logic based on text changes in the editor
  useEffect(() => {
    const quill = quillRef.current?.getEditor();
    if (!quill || !linkSelector) return;

    const handleTextChange = () => {
        const selection = quill.getSelection();
        if (!selection || selection.index < linkSelector.startPos) {
            setLinkSelector(null);
            return;
        }
        
        const text = quill.getText(linkSelector.startPos, selection.index - linkSelector.startPos);

        if (!text.startsWith('/')) {
            setLinkSelector(null);
        } else {
            setLinkQuery(text.substring(1));
        }
    };

    quill.on('text-change', handleTextChange);
    return () => { quill.off('text-change', handleTextChange); };
  }, [linkSelector]);

  // Effect to handle keyboard navigation (arrows, enter, escape) for the link selector
  useEffect(() => {
    if (!linkSelector) return;

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setLinkSelectorActiveIndex(prev => (prev + 1) % (filteredLinkableItems.length || 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setLinkSelectorActiveIndex(prev => (prev - 1 + (filteredLinkableItems.length || 1)) % (filteredLinkableItems.length || 1));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            const selectedItem = filteredLinkableItems[linkSelectorActiveIndex];
            if (selectedItem) {
                handleSelectLink(selectedItem);
            }
        } else if (e.key === 'Escape') {
            e.preventDefault();
            setLinkSelector(null);
        }
    };
    
    // Use capturing to intercept keys before Quill handles them
    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [linkSelector, linkSelectorActiveIndex, filteredLinkableItems]);

  // Effect to handle clicking outside the link selector to close it
  useEffect(() => {
    if (!linkSelector) return;
    const handleClickOutside = (event: MouseEvent) => {
        if (linkSelectorRef.current && !linkSelectorRef.current.contains(event.target as Node)) {
            setLinkSelector(null);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [linkSelector]);


  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    onSave(note.id, title, content);
  };

  const handleSelectLink = (item: LinkableItem) => {
      const quill = quillRef.current?.getEditor();
      if (quill && linkSelector) {
          const lengthToDelete = linkQuery.length + 1; // query + '/'
          const linkHtml = `&nbsp;<a href="#" data-link-id="${item.id}" class="internal-link">${item.title}</a>&nbsp;`;
          
          quill.deleteText(linkSelector.startPos, lengthToDelete, 'user');
          quill.clipboard.dangerouslyPasteHTML(linkSelector.startPos, linkHtml, 'user');
          quill.setSelection(quill.getSelection().index, 0);
          
          setLinkSelector(null);
          setLinkQuery('');
      }
  }

  const quillModules = useMemo(() => ({
    toolbar: {
        container: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'blockquote'],
            [{'list': 'ordered'}, {'list': 'bullet'}],
            ['link'],
            ['clean']
        ],
    },
    keyboard: {
        bindings: {
            slashLink: {
                key: '/',
                handler: (range) => {
                    const quill = quillRef.current?.getEditor();
                    if (!quill) return true;
                    
                    const textBefore = quill.getText(range.index - 1, 1);
                    if (range.index > 0 && textBefore.trim().length > 0) {
                        return true; // Don't trigger mid-word
                    }

                    const bounds = quill.getBounds(range.index);
                    setLinkSelector({
                        top: bounds.bottom + 5,
                        left: bounds.left,
                        startPos: range.index,
                    });
                    setLinkQuery('');
                    return true;
                }
            },
        }
    }
  }), []);
  
  const linkedItems = [...projects, ...areas].filter(p => note.parentIds.includes(p.id));

  const backlinks = useMemo(() => {
      const links: { sourceNoteId: string, sourceNoteTitle: string, context: string }[] = [];
      const regex = new RegExp(`data-link-id="${note.id}"`, 'g');
      allNotes.forEach(n => {
          if (n.id !== note.id && n.content.match(regex)) {
              const tempDiv = document.createElement('div');
              tempDiv.innerHTML = n.content;
              const snippet = tempDiv.textContent?.substring(0, 100) + '...' || '...';
              links.push({ sourceNoteId: n.id, sourceNoteTitle: n.title, context: snippet });
          }
      });
      return links;
  }, [allNotes, note.id]);

  if (!isOpen) return null;

  const modalClasses = isExpanded
    ? "w-screen h-screen max-w-full max-h-full rounded-none"
    : "w-full max-w-4xl max-h-[90vh] rounded-2xl";

  return (
    <div 
        className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center p-4 backdrop-blur-md"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="note-editor-title"
    >
      <div 
        className={`bg-surface/80 backdrop-blur-xl flex flex-col border border-outline shadow-lg transition-all duration-300 ${modalClasses}`}
        onClick={e => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-outline-dark flex-shrink-0">
          <h2 id="note-editor-title" className="text-xl font-bold font-heading">Edit Note</h2>
          <div className="flex items-center gap-2">
            <button onClick={() => setExpanded(!isExpanded)} aria-label={isExpanded ? "Contract" : "Expand"} className="text-text-secondary hover:text-text-primary">
                {isExpanded ? <MinimizeIcon className="w-5 h-5" /> : <MaximizeIcon className="w-5 h-5" />}
            </button>
            <button onClick={onClose} aria-label="Close" className="text-text-secondary hover:text-text-primary">
              <XIcon className="w-6 h-6" />
            </button>
          </div>
        </header>
        
        <form onSubmit={handleSave} className="flex-1 flex flex-col overflow-y-hidden">
          <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
              <div className="mb-4">
                  <label htmlFor="note-title" className="sr-only">Title</label>
                  <input
                      id="note-title"
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter note title..."
                      required
                      className="w-full bg-transparent border-none px-0 py-2 text-2xl font-bold font-heading text-text-primary focus:outline-none focus:ring-0"
                  />
              </div>
               {linkedItems.length > 0 && (
                  <div className="mb-4">
                      <label className="block text-sm font-medium text-text-secondary mb-2">Linked to</label>
                      <div className="flex flex-wrap gap-2">
                          {linkedItems.map(item => (
                              <span key={item.id} className="flex items-center gap-2 bg-background/50 px-2 py-1 border border-outline rounded-md text-sm">
                                  {item.id.startsWith('proj-') ? <ProjectIcon className="w-4 h-4 text-text-secondary"/> : <AreaIcon className="w-4 h-4 text-text-secondary"/>}
                                  {item.title}
                              </span>
                          ))}
                      </div>
                  </div>
              )}
              <div className="relative">
                  <ReactQuill
                    ref={quillRef}
                    theme="snow"
                    value={content}
                    onChange={setContent}
                    modules={quillModules}
                    placeholder="Distill your thoughts... Type '/' to link to other items."
                  />
                  {linkSelector && (
                      <div 
                        ref={linkSelectorRef}
                        className="absolute z-20" 
                        style={{ top: linkSelector.top, left: linkSelector.left }}
                        onMouseDown={e => e.preventDefault()}
                      >
                          <LinkSelector items={filteredLinkableItems} onSelect={handleSelectLink} query={linkQuery} activeIndex={linkSelectorActiveIndex} setActiveIndex={setLinkSelectorActiveIndex} />
                      </div>
                  )}
              </div>
              {backlinks.length > 0 && (
                <div className="mt-8">
                    <h3 className="text-lg font-semibold font-heading mb-3 border-b border-outline-dark pb-2">Linked References</h3>
                    <ul className="space-y-3">
                        {backlinks.map(link => (
                            <li key={link.sourceNoteId} className="bg-background/30 border border-outline rounded-lg p-3">
                                <p className="font-semibold text-accent text-sm mb-1">{link.sourceNoteTitle}</p>
                                <p className="text-sm text-text-secondary italic">"{link.context}"</p>
                            </li>
                        ))}
                    </ul>
                </div>
              )}
          </div>
          <footer className="p-4 bg-black/5 border-t border-outline-dark mt-auto flex-shrink-0">
              <div className="flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => onDraftFromNote(note.id)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-secondary hover:bg-secondary-hover text-secondary-content transition-colors rounded-lg"
                    title="Create a new draft based on this note"
                  >
                      <GitBranchIcon className="w-4 h-4" />
                      <span>Draft from Note</span>
                  </button>
                  <div className="flex justify-end gap-3">
                      <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium bg-secondary hover:bg-secondary-hover text-secondary-content transition-colors rounded-lg">Cancel</button>
                      <button type="submit" className="px-4 py-2 text-sm font-medium bg-accent hover:bg-accent-hover text-accent-content transition-colors rounded-lg">Save Changes</button>
                  </div>
              </div>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default React.memo(NoteEditorModal);
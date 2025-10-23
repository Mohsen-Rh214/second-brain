import React, { useState, useEffect, useMemo, useRef } from 'react';
import ReactQuill from 'react-quill';
import { Note, Project, Area } from '../types';
import { XIcon, ProjectIcon, AreaIcon, SearchIcon, FileTextIcon, Link2Icon, MaximizeIcon, MinimizeIcon } from './icons';

interface NoteEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (noteId: string, title: string, content: string) => void;
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

const LinkSelector: React.FC<{ items: LinkableItem[], onSelect: (item: LinkableItem) => void }> = ({ items, onSelect }) => {
    const [query, setQuery] = useState('');
    const filteredItems = items.filter(item => item.title.toLowerCase().includes(query.toLowerCase()));

    return (
        <div className="bg-surface/80 backdrop-blur-xl border border-outline rounded-lg shadow-lg w-96">
            <div className="p-2 border-b border-outline-dark">
                <div className="relative">
                    <SearchIcon className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                    <input
                        type="text"
                        placeholder="Search to link..."
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        className="w-full bg-transparent pl-8 pr-2 py-1 focus:outline-none"
                        autoFocus
                    />
                </div>
            </div>
            <ul className="max-h-60 overflow-y-auto custom-scrollbar p-1">
                {filteredItems.map(item => (
                    <li key={item.id}>
                        <button onClick={() => onSelect(item)} className="w-full text-left flex items-center gap-2 p-2 hover:bg-neutral rounded-md">
                            {item.type === 'note' && <FileTextIcon className="w-4 h-4 text-text-secondary flex-shrink-0"/>}
                            {item.type === 'project' && <ProjectIcon className="w-4 h-4 text-text-secondary flex-shrink-0"/>}
                            {item.type === 'area' && <AreaIcon className="w-4 h-4 text-text-secondary flex-shrink-0"/>}
                            <span className="truncate">{item.title}</span>
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    )
}


const NoteEditorModal: React.FC<NoteEditorModalProps> = ({ isOpen, onClose, onSave, note, projects, areas, allNotes }) => {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [isLinkSelectorOpen, setLinkSelectorOpen] = useState(false);
  const [isExpanded, setExpanded] = useState(false);

  const quillRef = useRef<ReactQuill>(null);

  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
  }, [note]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    onSave(note.id, title, content);
  };

  const linkableItems: LinkableItem[] = useMemo(() => [
    ...allNotes.filter(n => n.id !== note.id).map(n => ({ id: n.id, title: n.title, type: 'note' as const })),
    ...projects.map(p => ({ id: p.id, title: p.title, type: 'project' as const })),
    ...areas.map(a => ({ id: a.id, title: a.title, type: 'area' as const })),
  ], [allNotes, projects, areas, note.id]);

  const handleOpenLinkSelector = () => {
      setLinkSelectorOpen(true);
  }
  
  const handleSelectLink = (item: LinkableItem) => {
      const quill = quillRef.current?.getEditor();
      if (quill) {
          const range = quill.getSelection(true);
          const linkHtml = `&nbsp;<a href="#" data-link-id="${item.id}" class="internal-link">${item.title}</a>&nbsp;`;
          quill.clipboard.dangerouslyPasteHTML(range.index, linkHtml, 'user');
          setLinkSelectorOpen(false);
      }
  }

  const quillModules = useMemo(() => ({
    toolbar: {
        container: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'blockquote'],
            [{'list': 'ordered'}, {'list': 'bullet'}],
            ['link', 'link-item'],
            ['clean']
        ],
        handlers: {
            'link-item': handleOpenLinkSelector,
        }
    },
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
                    placeholder="Distill your thoughts here... Use the new link icon to connect ideas."
                  />
                  {isLinkSelectorOpen && (
                      <div className="absolute top-0 right-0 z-20" onMouseDown={e => e.preventDefault()}>
                          <LinkSelector items={linkableItems} onSelect={handleSelectLink} />
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
              <div className="flex justify-end gap-3">
                  <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium bg-secondary hover:bg-secondary-hover text-secondary-content transition-colors rounded-lg">Cancel</button>
                  <button type="submit" className="px-4 py-2 text-sm font-medium bg-accent hover:bg-accent-hover text-accent-content transition-colors rounded-lg">Save Changes</button>
              </div>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default NoteEditorModal;
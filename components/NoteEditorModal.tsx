

import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import { Note } from '../types';
import { XIcon } from './icons';

interface NoteEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (noteId: string, title: string, content: string) => void;
  note: Note;
}

const quillModules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'blockquote'],
    [{'list': 'ordered'}, {'list': 'bullet'}],
    ['link'],
    ['clean']
  ],
};

const NoteEditorModal: React.FC<NoteEditorModalProps> = ({ isOpen, onClose, onSave, note }) => {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);

  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
  }, [note]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    onSave(note.id, title, content);
  };

  if (!isOpen) return null;

  return (
    <div 
        className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="note-editor-title"
    >
      <div 
        className="bg-slate-800 rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-slate-700 flex-shrink-0">
          <h2 id="note-editor-title" className="text-xl font-bold">Edit Note</h2>
          <button onClick={onClose} aria-label="Close" className="text-slate-400 hover:text-white">
            <XIcon className="w-6 h-6" />
          </button>
        </header>
        
        <form onSubmit={handleSave} className="flex-1 flex flex-col overflow-y-hidden">
          <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
              <div className="mb-4">
                  <label htmlFor="note-title" className="block text-sm font-medium text-slate-400 mb-2">Title</label>
                  <input
                      id="note-title"
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter note title..."
                      required
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-md px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
              </div>
              <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Content</label>
                  <ReactQuill
                    theme="snow"
                    value={content}
                    onChange={setContent}
                    modules={quillModules}
                    placeholder="Distill your thoughts here..."
                  />
              </div>
          </div>
          <footer className="p-4 bg-slate-900/50 border-t border-slate-700 mt-auto flex-shrink-0">
              <div className="flex justify-end gap-3">
                  <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-sm font-medium bg-slate-600 hover:bg-slate-500 text-white">Cancel</button>
                  <button type="submit" className="px-4 py-2 rounded-md text-sm font-medium bg-emerald-600 hover:bg-emerald-500 text-white">Save Changes</button>
              </div>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default NoteEditorModal;

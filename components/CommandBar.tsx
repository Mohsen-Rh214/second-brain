import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Area, Project, Note, Resource, Task } from '../types';
import { AreaIcon, ProjectIcon, ResourceIcon, FileTextIcon, SearchIcon, PlusIcon, HomeIcon, ArchiveIcon, GitMergeIcon, ClipboardCheckIcon, ListTodoIcon } from './icons';

interface Command {
  id: string;
  type: 'action' | 'navigation' | 'item';
  title: string;
  category: string;
  icon: React.ReactElement;
  action: () => void;
}

interface CommandBarProps {
  isOpen: boolean;
  onClose: () => void;
  onCommand: (command: Command) => void;
  areas: Area[];
  projects: Project[];
  notes: Note[];
  resources: Resource[];
  tasks: Task[];
}

const CommandBar: React.FC<CommandBarProps> = ({ isOpen, onClose, onCommand, areas, projects, notes, resources, tasks }) => {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const baseCommands: Command[] = useMemo(() => [
    // Actions
    { id: 'new-task', type: 'action', title: 'New Task', category: 'Actions', icon: <PlusIcon className="w-5 h-5"/>, action: () => {} },
    { id: 'new-note', type: 'action', title: 'New Note', category: 'Actions', icon: <PlusIcon className="w-5 h-5"/>, action: () => {} },
    { id: 'new-resource', type: 'action', title: 'New Resource', category: 'Actions', icon: <PlusIcon className="w-5 h-5"/>, action: () => {} },
    { id: 'new-project', type: 'action', title: 'New Project', category: 'Actions', icon: <PlusIcon className="w-5 h-5"/>, action: () => {} },
    { id: 'new-area', type: 'action', title: 'New Area', category: 'Actions', icon: <PlusIcon className="w-5 h-5"/>, action: () => {} },
    // Navigation
    { id: 'go-home', type: 'navigation', title: 'Go to Home', category: 'Navigation', icon: <HomeIcon className="w-5 h-5"/>, action: () => {} },
    { id: 'go-areas', type: 'navigation', title: 'Go to Areas', category: 'Navigation', icon: <AreaIcon className="w-5 h-5"/>, action: () => {} },
    { id: 'go-projects', type: 'navigation', title: 'Go to Projects', category: 'Navigation', icon: <ProjectIcon className="w-5 h-5"/>, action: () => {} },
    { id: 'go-tasks', type: 'navigation', title: 'Go to All Tasks', category: 'Navigation', icon: <ListTodoIcon className="w-5 h-5"/>, action: () => {} },
    { id: 'go-review', type: 'navigation', title: 'Go to Review', category: 'Navigation', icon: <ClipboardCheckIcon className="w-5 h-5"/>, action: () => {} },
    { id: 'go-graph', type: 'navigation', title: 'Go to Graph', category: 'Navigation', icon: <GitMergeIcon className="w-5 h-5"/>, action: () => {} },
    { id: 'go-archives', type: 'navigation', title: 'Go to Archives', category: 'Navigation', icon: <ArchiveIcon className="w-5 h-5"/>, action: () => {} },
  ], []);

  const itemCommands: Command[] = useMemo(() => {
      const allItems = [
          ...areas.map(a => ({...a, itemType: 'area'})),
          ...projects.map(p => ({...p, itemType: 'project'})),
          ...notes.map(n => ({...n, itemType: 'note'})),
          ...resources.map(r => ({...r, itemType: 'resource'})),
          ...tasks.map(t => ({...t, itemType: 'task'})),
      ];
      return allItems.filter(item => item.status === 'active').map(item => {
          let icon = <SearchIcon className="w-5 h-5"/>;
          if (item.itemType === 'area') icon = <AreaIcon className="w-5 h-5"/>;
          if (item.itemType === 'project') icon = <ProjectIcon className="w-5 h-5"/>;
          if (item.itemType === 'note') icon = <FileTextIcon className="w-5 h-5"/>;
          if (item.itemType === 'resource') icon = <ResourceIcon className="w-5 h-5"/>;
          if (item.itemType === 'task') icon = <ListTodoIcon className="w-5 h-5"/>;
          
          return {
            id: item.id,
            type: 'item',
            title: item.title,
            category: 'Items',
            icon,
            action: () => {}
          }
      })
  }, [areas, projects, notes, resources, tasks]);

  const filteredCommands = useMemo(() => {
    const lowerQuery = query.toLowerCase();
    if (!lowerQuery) {
        const defaultActionIds = ['new-task', 'new-note', 'new-resource'];
        return baseCommands.filter(cmd => 
            cmd.type === 'navigation' || (cmd.type === 'action' && defaultActionIds.includes(cmd.id))
        );
    }

    const all = [...baseCommands, ...itemCommands];
    return all.filter(cmd => cmd.title.toLowerCase().includes(lowerQuery));
  }, [query, baseCommands, itemCommands]);
  
  const groupedCommands = useMemo(() => {
    return filteredCommands.reduce((acc, cmd) => {
      if (!acc[cmd.category]) {
        acc[cmd.category] = [];
      }
      acc[cmd.category].push(cmd);
      return acc;
    }, {} as Record<string, Command[]>);
  }, [filteredCommands]);

  const flatCommandList = useMemo(() => Object.values(groupedCommands).flat(), [groupedCommands]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex(prev => (prev + 1) % flatCommandList.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex(prev => (prev - 1 + flatCommandList.length) % flatCommandList.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (flatCommandList[activeIndex]) {
          handleSelect(flatCommandList[activeIndex]);
        }
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, activeIndex, flatCommandList]);
  
  useEffect(() => {
    resultsRef.current?.children[activeIndex]?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  const handleSelect = (command: Command) => {
    onCommand(command);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 z-50 flex items-start justify-center pt-24 backdrop-blur-md" onClick={onClose}>
      <div className="bg-surface/80 backdrop-blur-xl w-full max-w-2xl border border-outline rounded-2xl shadow-lg" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-4 p-4 border-b border-outline-dark">
          <SearchIcon className="w-5 h-5 text-text-secondary" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search..."
            className="w-full bg-transparent focus:outline-none text-lg"
          />
        </div>
        <ul ref={resultsRef} className="max-h-[50vh] overflow-y-auto custom-scrollbar p-2">
          {Object.entries(groupedCommands).map(([category, commands]) => (
            <li key={category}>
              <h3 className="text-xs font-semibold text-text-secondary px-2 pt-2 pb-1">{category}</h3>
              <ul>
                {/* Fix for: Property 'map' does not exist on type 'unknown'. */}
                {(commands as Command[]).map((cmd) => {
                    const currentIndex = flatCommandList.findIndex(c => c.id === cmd.id);
                    return (
                        <li
                            key={cmd.id}
                            onClick={() => handleSelect(cmd)}
                            onMouseEnter={() => setActiveIndex(currentIndex)}
                            className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer ${activeIndex === currentIndex ? 'bg-accent text-accent-content' : 'text-text-primary'}`}
                        >
                            <span className={activeIndex === currentIndex ? '' : 'text-text-secondary'}>{cmd.icon}</span>
                            <span>{cmd.title}</span>
                        </li>
                    )
                })}
              </ul>
            </li>
          ))}
          {filteredCommands.length === 0 && (
            <li className="p-4 text-center text-text-secondary">No results found.</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default CommandBar;
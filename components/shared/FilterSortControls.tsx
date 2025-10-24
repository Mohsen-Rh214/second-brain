import React, { useState, useRef, useEffect } from 'react';
import { FilterIcon, ArrowUpDownIcon, XIcon, ChevronDownIcon } from './icons';

interface FilterSortControlsProps {
    tags: string[];
    sortOptions: string[];
    tagFilter: string | null;
    onTagFilterChange: (tag: string | null) => void;
    sortOption: string;
    onSortChange: (option: string) => void;
}

const Dropdown: React.FC<{
    buttonContent: React.ReactNode;
    children: React.ReactNode;
}> = ({ buttonContent, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-surface/80 border border-outline rounded-lg hover:bg-neutral transition-colors"
            >
                {buttonContent}
                <ChevronDownIcon className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div 
                    onClick={() => setIsOpen(false)}
                    className="absolute right-0 mt-2 w-56 bg-surface/95 backdrop-blur-xl border border-outline rounded-lg shadow-lg z-20"
                >
                    {children}
                </div>
            )}
        </div>
    );
};

const FilterSortControls: React.FC<FilterSortControlsProps> = ({
    tags, sortOptions, tagFilter, onTagFilterChange, sortOption, onSortChange
}) => {
    return (
        <div className="flex items-center gap-2">
            <Dropdown
                buttonContent={
                    <>
                        <FilterIcon className="w-4 h-4" />
                        <span>Filter</span>
                        {tagFilter && <span className="w-1.5 h-1.5 bg-accent rounded-full"></span>}
                    </>
                }
            >
                <ul className="p-1 max-h-60 overflow-y-auto custom-scrollbar">
                    {tagFilter && (
                        <li className="border-b border-outline-dark mb-1 pb-1">
                             <button onClick={() => onTagFilterChange(null)} className="w-full text-left flex items-center justify-between px-2 py-1.5 text-sm rounded-md hover:bg-neutral text-destructive">
                                Clear Filter
                                <XIcon className="w-4 h-4" />
                            </button>
                        </li>
                    )}
                    {tags.map(tag => (
                        <li key={tag}>
                            <button
                                onClick={() => onTagFilterChange(tag)}
                                className={`w-full text-left px-2 py-1.5 text-sm rounded-md hover:bg-neutral ${tagFilter === tag ? 'bg-accent/20 font-semibold' : ''}`}
                            >
                                {tag}
                            </button>
                        </li>
                    ))}
                </ul>
            </Dropdown>

            <Dropdown
                buttonContent={
                    <>
                        <ArrowUpDownIcon className="w-4 h-4" />
                        <span>Sort</span>
                    </>
                }
            >
                <ul className="p-1">
                    {sortOptions.map(option => (
                        <li key={option}>
                             <button
                                onClick={() => onSortChange(option)}
                                className={`w-full text-left px-2 py-1.5 text-sm rounded-md hover:bg-neutral ${sortOption === option ? 'bg-accent/20 font-semibold' : ''}`}
                            >
                                {option}
                            </button>
                        </li>
                    ))}
                </ul>
            </Dropdown>
        </div>
    );
};

export default React.memo(FilterSortControls);
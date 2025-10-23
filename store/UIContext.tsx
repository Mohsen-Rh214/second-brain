import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { View, CaptureContext, InboxItem } from '../types';

interface UIState {
    currentView: View;
    activeAreaId: string | null;
    activeProjectId: string | null;
    isCaptureModalOpen: boolean;
    captureContext: CaptureContext | null;
    editingNoteId: string | null;
    editingResourceId: string | null;
    organizingItem: InboxItem | null;
    searchQuery: string;
    isCommandBarOpen: boolean;
    toastMessage: string | null;
}

type UIAction =
    | { type: 'SET_VIEW'; payload: { view: View, itemId?: string | null } }
    | { type: 'SET_ACTIVE_AREA'; payload: string | null }
    | { type: 'SET_ACTIVE_PROJECT'; payload: string | null }
    | { type: 'SET_CAPTURE_MODAL'; payload: { isOpen: boolean; context?: CaptureContext | null } }
    | { type: 'SET_EDITING_NOTE'; payload: string | null }
    | { type: 'SET_EDITING_RESOURCE'; payload: string | null }
    | { type: 'SET_ORGANIZING_ITEM'; payload: InboxItem | null }
    | { type: 'SET_SEARCH_QUERY'; payload: string }
    | { type: 'SET_COMMAND_BAR_OPEN'; payload: boolean }
    | { type: 'SHOW_TOAST'; payload: string | null };

const initialState: UIState = {
    currentView: 'dashboard',
    activeAreaId: null,
    activeProjectId: null,
    isCaptureModalOpen: false,
    captureContext: null,
    editingNoteId: null,
    editingResourceId: null,
    organizingItem: null,
    searchQuery: '',
    isCommandBarOpen: false,
    toastMessage: null,
};

const uiReducer = (state: UIState, action: UIAction): UIState => {
    switch (action.type) {
        case 'SET_VIEW':
            return {
                ...state,
                currentView: action.payload.view,
                searchQuery: '',
                activeAreaId: action.payload.view === 'areas' && action.payload.itemId ? action.payload.itemId : null,
                activeProjectId: action.payload.view === 'projects' && action.payload.itemId ? action.payload.itemId : null,
            };
        case 'SET_ACTIVE_AREA':
            return { ...state, activeAreaId: action.payload };
        case 'SET_ACTIVE_PROJECT':
            return { ...state, activeProjectId: action.payload };
        case 'SET_CAPTURE_MODAL':
            return { ...state, isCaptureModalOpen: action.payload.isOpen, captureContext: action.payload.context || null };
        case 'SET_EDITING_NOTE':
            return { ...state, editingNoteId: action.payload };
        case 'SET_EDITING_RESOURCE':
            return { ...state, editingResourceId: action.payload };
        case 'SET_ORGANIZING_ITEM':
            return { ...state, organizingItem: action.payload };
        case 'SET_SEARCH_QUERY':
            return { ...state, searchQuery: action.payload };
        case 'SET_COMMAND_BAR_OPEN':
            return { ...state, isCommandBarOpen: action.payload };
        case 'SHOW_TOAST':
            return { ...state, toastMessage: action.payload };
        default:
            return state;
    }
};

const UIContext = createContext<{ state: UIState; dispatch: React.Dispatch<UIAction> } | undefined>(undefined);

export const UIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(uiReducer, initialState);

    return (
        <UIContext.Provider value={{ state, dispatch }}>
            {children}
        </UIContext.Provider>
    );
};

export const useUI = () => {
    const context = useContext(UIContext);
    if (context === undefined) {
        throw new Error('useUI must be used within a UIProvider');
    }
    return context;
};
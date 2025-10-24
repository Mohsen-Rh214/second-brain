import React, { createContext, useContext, useReducer } from 'react';
import { View, CaptureContext, InboxItem, Task, ItemType } from '../types';

interface ConfirmModalState {
  title: string;
  message: string;
  onConfirm: () => void;
  confirmLabel?: string;
}

interface UIState {
    currentView: View;
    activeAreaId: string | null;
    activeProjectId: string | null;
    isCaptureModalOpen: boolean;
    captureContext: CaptureContext | null;
    editingNoteId: string | null;
    editingResourceId: string | null;
    editingTaskId: string | null;
    organizingItem: InboxItem | null;
    searchQuery: string;
    isCommandBarOpen: boolean;
    toastMessage: string | null;
    linkingTask: Task | null;
    confirmModal: ConfirmModalState | null;
    draggedItemId: string | null;
    draggedItemType: ItemType | null;
    isFocusMode: boolean;
}

type UIAction =
    | { type: 'SET_VIEW'; payload: { view: View, itemId?: string | null } }
    | { type: 'SET_ACTIVE_AREA'; payload: string | null }
    | { type: 'SET_ACTIVE_PROJECT'; payload: string | null }
    | { type: 'SET_CAPTURE_MODAL'; payload: { isOpen: boolean; context?: CaptureContext | null } }
    | { type: 'SET_EDITING_NOTE'; payload: string | null }
    | { type: 'SET_EDITING_RESOURCE'; payload: string | null }
    | { type: 'SET_EDITING_TASK'; payload: string | null }
    | { type: 'SET_ORGANIZING_ITEM'; payload: InboxItem | null }
    | { type: 'SET_LINKING_TASK'; payload: Task | null }
    | { type: 'SET_SEARCH_QUERY'; payload: string }
    | { type: 'SET_COMMAND_BAR_OPEN'; payload: boolean }
    | { type: 'SHOW_TOAST'; payload: string | null }
    | { type: 'OPEN_CONFIRM_MODAL'; payload: ConfirmModalState }
    | { type: 'CLOSE_CONFIRM_MODAL' }
    | { type: 'SET_DRAGGED_ITEM'; payload: { id: string | null, type: ItemType | null } }
    | { type: 'TOGGLE_FOCUS_MODE' };

const initialState: UIState = {
    currentView: 'dashboard',
    activeAreaId: null,
    activeProjectId: null,
    isCaptureModalOpen: false,
    captureContext: null,
    editingNoteId: null,
    editingResourceId: null,
    editingTaskId: null,
    organizingItem: null,
    searchQuery: '',
    isCommandBarOpen: false,
    toastMessage: null,
    linkingTask: null,
    confirmModal: null,
    draggedItemId: null,
    draggedItemType: null,
    isFocusMode: false,
};

const uiReducer = (state: UIState, action: UIAction): UIState => {
    switch (action.type) {
        case 'SET_VIEW': {
            const { view, itemId } = action.payload;
            return {
                ...state,
                currentView: view,
                searchQuery: '',
                activeAreaId: view === 'areas' ? (itemId || state.activeAreaId) : null,
                activeProjectId: view === 'projects' ? (itemId || state.activeProjectId) : null,
                isFocusMode: view !== 'areas' ? false : state.isFocusMode, // Exit focus mode if navigating away
            };
        }
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
        case 'SET_EDITING_TASK':
            return { ...state, editingTaskId: action.payload };
        case 'SET_ORGANIZING_ITEM':
            return { ...state, organizingItem: action.payload };
        case 'SET_LINKING_TASK':
            return { ...state, linkingTask: action.payload };
        case 'SET_SEARCH_QUERY':
            return { ...state, searchQuery: action.payload };
        case 'SET_COMMAND_BAR_OPEN':
            return { ...state, isCommandBarOpen: action.payload };
        case 'SHOW_TOAST':
            return { ...state, toastMessage: action.payload };
        case 'OPEN_CONFIRM_MODAL':
            return { ...state, confirmModal: action.payload };
        case 'CLOSE_CONFIRM_MODAL':
            return { ...state, confirmModal: null };
        case 'SET_DRAGGED_ITEM':
            return { ...state, draggedItemId: action.payload.id, draggedItemType: action.payload.type };
        case 'TOGGLE_FOCUS_MODE':
            return { ...state, isFocusMode: !state.isFocusMode };
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

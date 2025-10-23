import { useState, useCallback, useEffect } from 'react';

export const useEditable = (initialValue: string, onSave: (newValue: string) => void) => {
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState(initialValue);

    useEffect(() => {
        setValue(initialValue);
    }, [initialValue]);

    const handleEdit = useCallback(() => {
        setIsEditing(true);
    }, []);

    const handleSave = useCallback(() => {
        if (value.trim() && value.trim() !== initialValue) {
            onSave(value.trim());
        }
        setIsEditing(false);
    }, [value, initialValue, onSave]);

    const handleCancel = useCallback(() => {
        setValue(initialValue);
        setIsEditing(false);
    }, [initialValue]);
    
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSave();
        } else if (e.key === 'Escape') {
            handleCancel();
        }
    }, [handleSave, handleCancel]);

    return {
        isEditing,
        value,
        setValue,
        handleEdit,
        handleSave,
        handleCancel,
        handleKeyDown,
    };
};

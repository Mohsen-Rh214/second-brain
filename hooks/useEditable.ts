import React, { useState, useCallback, useEffect, useRef } from 'react';

export const useEditable = (initialValue: string, onSave: (newValue: string) => void) => {
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState(initialValue);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setValue(initialValue);
    }, [initialValue]);

    useEffect(() => {
        if (isEditing) {
            inputRef.current?.focus();
            inputRef.current?.select();
        }
    }, [isEditing]);

    const handleEdit = useCallback(() => {
        setIsEditing(true);
    }, []);

    const handleSave = useCallback(() => {
        if (value.trim() && value.trim() !== initialValue) {
            onSave(value.trim());
        } else {
            setValue(initialValue);
        }
        setIsEditing(false);
    }, [value, initialValue, onSave]);

    const handleCancel = useCallback(() => {
        setValue(initialValue);
        setIsEditing(false);
    }, [initialValue]);
    
    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
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
        inputRef,
    };
};

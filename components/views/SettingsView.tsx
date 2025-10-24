import React, { useRef } from 'react';
import { useData } from '../../store/DataContext';
import { DownloadIcon, UploadIcon } from '../shared/icons';

const SettingsView: React.FC = () => {
    const { state, dispatch } = useData();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleExportData = () => {
        try {
            const dataToExport = JSON.stringify({
                version: '1.0.0',
                exportedAt: new Date().toISOString(),
                ...state
            }, null, 2);

            const blob = new Blob([dataToExport], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            const date = new Date().toISOString().slice(0, 10);
            link.download = `second-brain-backup-${date}.json`;
            link.href = url;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Failed to export data:", error);
            alert("An error occurred while exporting your data. Please check the console for details.");
        }
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!window.confirm(
            "Are you sure you want to import this file?\n\nWARNING: This will overwrite all current data in the application. This action cannot be undone."
        )) {
            // Reset file input value
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text !== 'string') {
                    throw new Error("File could not be read.");
                }
                const data = JSON.parse(text);
                
                // Basic validation
                if (data && data.areas && data.projects && data.tasks && data.notes && data.resources) {
                    const { version, exportedAt, ...appState } = data;
                    dispatch({ type: 'REPLACE_STATE', payload: appState });
                    alert("Data imported successfully!");
                } else {
                    throw new Error("Invalid backup file format.");
                }
            } catch (error) {
                console.error("Failed to import data:", error);
                alert(`An error occurred while importing the data: ${error instanceof Error ? error.message : String(error)}`);
            } finally {
                 if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            }
        };
        reader.onerror = () => {
             alert("Error reading file.");
             if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
        reader.readAsText(file);
    };

    return (
        <div>
            <header className="mb-8">
                <h1 className="text-3xl font-bold font-heading">Settings</h1>
                <p className="text-text-secondary">Manage your application settings and data.</p>
            </header>
            
            <div className="bg-surface/80 backdrop-blur-xl border border-outline rounded-xl shadow-md p-6 max-w-2xl space-y-8">
                <div>
                    <h2 className="text-xl font-semibold mb-2 font-heading">Export Data</h2>
                    <p className="text-text-secondary mb-4">
                        Save a complete backup of your Second Brain. Export all your data into a single JSON file for backup or migration. Keep this file safe.
                    </p>
                    <button 
                        onClick={handleExportData}
                        className="flex items-center gap-2 bg-secondary hover:bg-secondary-hover text-secondary-content font-semibold px-4 py-2 transition-colors rounded-lg shadow-sm active:scale-95"
                    >
                        <DownloadIcon className="w-5 h-5" />
                        Export All Data
                    </button>
                </div>

                 <div className="border-t border-outline-dark my-6"></div>

                <div>
                    <h2 className="text-xl font-semibold mb-2 font-heading">Import Data</h2>
                    <p className="text-text-secondary mb-4">
                        Restore your Second Brain from a backup file. This will replace all current data in the application.
                    </p>
                    <button 
                        onClick={handleImportClick}
                        className="flex items-center gap-2 bg-destructive hover:bg-destructive-hover text-destructive-content font-semibold px-4 py-2 transition-colors rounded-lg shadow-sm active:scale-95"
                    >
                        <UploadIcon className="w-5 h-5" />
                        Import from Backup
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="application/json"
                        className="hidden"
                    />
                </div>
            </div>
        </div>
    );
};

export default React.memo(SettingsView);
import { useCallback, useEffect } from 'react';

export interface KeyboardShortcutsConfig {
  editMode: boolean;
  hasUnsavedChanges: boolean;
  priority: string | null;
  issueNumber?: number;
  onSetEditMode: (mode: boolean) => void;
  onSave: () => void;
  onCancel: () => void;
  onMarkComplete: () => void;
  onOpenInGitHub: () => void;
  onSetPriority: (priority: 'high' | 'medium' | 'low') => void;
  onCloseAsNotPlanned: () => void;
  onRefreshIssues: () => void;
  onOpenFirstSlackLink: () => void;
  onShowUnsavedDialog: () => void;
  onSetPendingAction: (action: { type: string; value: string }) => void;
}

export const useKeyboardShortcuts = (config: KeyboardShortcutsConfig) => {
  const {
    editMode,
    hasUnsavedChanges,
    priority,
    issueNumber,
    onSetEditMode,
    onSave,
    onCancel,
    onMarkComplete,
    onOpenInGitHub,
    onSetPriority,
    onCloseAsNotPlanned,
    onRefreshIssues,
    onOpenFirstSlackLink,
    onShowUnsavedDialog,
    onSetPendingAction
  } = config;

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Skip if user is typing in an input field
    const target = e.target as HTMLElement;
    if (target && (
      target.tagName === 'INPUT' || 
      target.tagName === 'TEXTAREA' || 
      target.contentEditable === 'true'
    )) {
      return;
    }

    // Don't process shortcuts if no issue is loaded
    if (!issueNumber) return;

    const { ctrlKey, key, shiftKey } = e;

    if (ctrlKey && !shiftKey) {
      switch (key.toLowerCase()) {
        case 'e':
          e.preventDefault();
          onSetEditMode(true);
          break;

        case 's':
          if (editMode) {
            e.preventDefault();
            onSave();
          }
          break;

        case 'c':
          if (!priority) {
            console.log('Ctrl+C detected, but no priority selected. Action blocked.');
            return;
          }
          e.preventDefault();
          onMarkComplete();
          break;

        case 'o':
          e.preventDefault();
          onOpenInGitHub();
          break;

        case 'h':
          e.preventDefault();
          if (editMode && hasUnsavedChanges) {
            onShowUnsavedDialog();
            onSetPendingAction({ type: 'setPriority', value: 'high' });
          } else {
            onSetPriority('high');
          }
          break;

        case 'm':
          e.preventDefault();
          if (editMode && hasUnsavedChanges) {
            onShowUnsavedDialog();
            onSetPendingAction({ type: 'setPriority', value: 'medium' });
          } else {
            onSetPriority('medium');
          }
          break;

        case 'l':
          e.preventDefault();
          if (editMode && hasUnsavedChanges) {
            onShowUnsavedDialog();
            onSetPendingAction({ type: 'setPriority', value: 'low' });
          } else {
            onSetPriority('low');
          }
          break;

        case 'x':
          e.preventDefault();
          onCloseAsNotPlanned();
          break;
      }
    } else if (ctrlKey && shiftKey) {
      switch (key.toLowerCase()) {
        case 'r':
          e.preventDefault();
          onRefreshIssues();
          break;

        case 's':
          e.preventDefault();
          onOpenFirstSlackLink();
          break;
      }
    } else if (key === 'Escape' && editMode) {
      // Escape should cancel edit mode
      onCancel();
    }
  }, [
    editMode,
    hasUnsavedChanges,
    priority,
    issueNumber,
    onSetEditMode,
    onSave,
    onCancel,
    onMarkComplete,
    onOpenInGitHub,
    onSetPriority,
    onCloseAsNotPlanned,
    onRefreshIssues,
    onOpenFirstSlackLink,
    onShowUnsavedDialog,
    onSetPendingAction
  ]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};
import { useCallback } from 'react';
import { useAppStore } from '../store/appStore';

export interface IssueActionsConfig {
  issueNumber?: number;
  issueHtmlUrl?: string;
  markdownContent: string;
  hasUnsavedChanges: boolean;
  priority: string | null;
  setEditMode: (mode: boolean) => void;
  setMarkdownContent: (content: string) => void;
  setShowUnsavedDialog: (show: boolean) => void;
  setRefreshStatus: (status: string) => void;
  getSlackUrls: () => string[];
}

export const useIssueActions = (config: IssueActionsConfig) => {
  const {
    issueNumber,
    issueHtmlUrl,
    markdownContent,
    hasUnsavedChanges,
    priority,
    setEditMode,
    setMarkdownContent,
    setShowUnsavedDialog,
    setRefreshStatus,
    getSlackUrls
  } = config;

  const { setPriority, closeIssueAsNotPlanned, refreshIssues } = useAppStore();

  const saveContent = useCallback(() => {
    if (issueNumber) {
      useAppStore.getState().updateIssueBody(markdownContent);
      setEditMode(false);
    }
  }, [issueNumber, markdownContent, setEditMode]);

  const cancelEdit = useCallback(() => {
    if (hasUnsavedChanges) {
      setShowUnsavedDialog(true);
    } else {
      setEditMode(false);
      // Reset content to original
      const issue = useAppStore.getState().issues.find(i => i.number === issueNumber);
      if (issue) {
        setMarkdownContent(issue.body);
      }
    }
  }, [hasUnsavedChanges, setShowUnsavedDialog, setEditMode, setMarkdownContent, issueNumber]);

  const markComplete = useCallback(() => {
    if (issueNumber && priority) {
      useAppStore.getState().markIssueComplete(issueNumber);
    }
  }, [issueNumber, priority]);

  const openInGitHub = useCallback(() => {
    if (issueHtmlUrl) {
      window.open(issueHtmlUrl, '_blank', 'noopener,noreferrer');
    }
  }, [issueHtmlUrl]);

  const handleSetPriority = useCallback((newPriority: 'high' | 'medium' | 'low') => {
    if (issueNumber) {
      setPriority(issueNumber, newPriority);
    }
  }, [issueNumber, setPriority]);

  const closeAsNotPlanned = useCallback(() => {
    if (issueNumber) {
      closeIssueAsNotPlanned(issueNumber);
    }
  }, [issueNumber, closeIssueAsNotPlanned]);

  const handleRefreshIssues = useCallback(async () => {
    setRefreshStatus('refreshing');
    try {
      const result = await refreshIssues();
      console.log('Refresh completed:', result);
      setRefreshStatus('completed');
      // Reset status after showing completion
      setTimeout(() => setRefreshStatus('idle'), 2000);
    } catch (error) {
      console.error('Refresh failed:', error);
      setRefreshStatus('idle');
    }
  }, [refreshIssues, setRefreshStatus]);

  const openFirstSlackLink = useCallback(() => {
    const slackUrls = getSlackUrls();
    if (slackUrls.length > 0) {
      window.open(slackUrls[0], '_blank', 'noopener,noreferrer');
    }
  }, [getSlackUrls]);

  const saveWithDialog = useCallback(() => {
    useAppStore.getState().updateIssueBody(markdownContent);
    setEditMode(false);
    setShowUnsavedDialog(false);
  }, [markdownContent, setEditMode, setShowUnsavedDialog]);

  return {
    saveContent,
    cancelEdit,
    markComplete,
    openInGitHub,
    handleSetPriority,
    closeAsNotPlanned,
    handleRefreshIssues,
    openFirstSlackLink,
    saveWithDialog
  };
};
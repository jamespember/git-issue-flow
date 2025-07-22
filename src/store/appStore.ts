import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { githubService } from '../services/github';
import { GitHubIssue } from '../types/github';

type FetchStatus = 'idle' | 'loading' | 'success' | 'error';

interface AppState {
  issues: GitHubIssue[];
  currentIssueIndex: number;
  fetchStatus: FetchStatus;
  sortBy: 'created' | 'updated' | 'comments';
  sortDirection: 'asc' | 'desc';
  
  searchAndLoadIssues: (query: string, batchSize?: number) => Promise<void>;
  refreshIssues: () => Promise<{ removed: number; updated: number; errors: number }>;
  nextIssue: () => void;
  prevIssue: () => void;
  updateIssueBody: (body: string) => void;
  addLabel: (issueNumber: number, label: { id: number; name: string; color: string }) => void;
  removeLabel: (issueNumber: number, labelName: string) => void;
  markIssueComplete: (issueNumber: number) => void;
  closeIssueAsNotPlanned: (issueNumber: number) => void;
  setPriority: (issueNumber: number, priority: 'high' | 'medium' | 'low') => void;
  setSortBy: (sort: 'created' | 'updated' | 'comments') => void;
  setSortDirection: (direction: 'asc' | 'desc') => void;
  updateIssueTitle: (title: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      issues: [],
      currentIssueIndex: 0,
      fetchStatus: 'idle',
      sortBy: 'created',
      sortDirection: 'asc',
      
      searchAndLoadIssues: async (query: string, batchSize = 30) => {
        console.log('[searchAndLoadIssues] called with query:', query);
        set({ fetchStatus: 'loading' });
        
        try {
          const owner = 'komo-tech';
          const repo = 'komo-platform';
          const response = await githubService.searchIssues({ owner, repo, query, per_page: batchSize });
          console.log('Loaded issues from search:', response);
          set({
            issues: response,
            fetchStatus: 'success',
            currentIssueIndex: response.length > 0 ? 0 : 0
          });
          console.log('[searchAndLoadIssues] State after load:', {
            issues: response,
            currentIssueIndex: response.length > 0 ? 0 : 0
          });
        } catch (error) {
          console.error('[searchAndLoadIssues] Error:', error);
          set({ fetchStatus: 'error' });
        }
      },
      
      setSortBy: (sortBy) => {
        set({ sortBy });
      },
      
      setSortDirection: (sortDirection) => {
        set({ sortDirection });
      },
      
      setPriority: (issueNumber, priority) => {
        // Only allow one priority label: prio-high, prio-medium, prio-low
        const PRIORITY_LABELS = ['prio-high', 'prio-medium', 'prio-low'];
        const PRIORITY_LABEL_MAP = {
          high: 'prio-high',
          medium: 'prio-medium',
          low: 'prio-low',
        };
        const { issues } = get();
        const updated = issues.map(issue => {
          if (issue.number !== issueNumber) return issue;
          // Remove any existing priority label
          const filteredLabels = issue.labels.filter(l => !PRIORITY_LABELS.includes(l.name));
          // Add the new priority label
          return {
            ...issue,
            labels: [
              ...filteredLabels,
              { id: Date.now(), name: PRIORITY_LABEL_MAP[priority], color: 'ededed' }
            ]
          };
        });
        set({ issues: updated });
      },
      
      nextIssue: () => {
        const { currentIssueIndex, issues } = get();
        if (currentIssueIndex < issues.length - 1) {
          set({ currentIssueIndex: currentIssueIndex + 1 });
        }
      },
      
      prevIssue: () => {
        const { currentIssueIndex } = get();
        if (currentIssueIndex > 0) {
          set({ currentIssueIndex: currentIssueIndex - 1 });
        }
      },
      
      updateIssueBody: (body: string) => {
        // This would require a PATCH to GitHub API in a real app
        // For now, just update local state
        const { issues, currentIssueIndex } = get();
        const updated = [...issues];
        updated[currentIssueIndex] = { ...updated[currentIssueIndex], body };
        set({ issues: updated });
      },
      
      addLabel: (issueNumber: number, label: { id: number; name: string; color: string }) => {
        const { issues } = get();
        const updated = issues.map(issue =>
          issue.number === issueNumber
            ? { ...issue, labels: [...issue.labels, label] }
            : issue
        );
        set({ issues: updated });
      },
      
      removeLabel: (issueNumber, labelName: string) => {
        const { issues } = get();
        const updated = issues.map(issue =>
          issue.number === issueNumber
            ? { ...issue, labels: issue.labels.filter(l => l.name !== labelName) }
            : issue
        );
        set({ issues: updated });
      },
      
      markIssueComplete: async (issueNumber) => {
        console.log('[markIssueComplete] called with', issueNumber);
        const { issues, currentIssueIndex } = get();
        const issue = issues.find(i => i.number === issueNumber);
        if (!issue) return;
        // Prepare labels as string[]
        const labels = issue.labels.map(l => l.name);
        // PATCH to GitHub
        try {
          await githubService.updateIssue({
            owner: 'komo-tech',
            repo: 'komo-platform',
            issueNumber: issue.number,
            title: issue.title,
            body: issue.body,
            labels,
          });
        } catch (err) {
          console.error('Failed to sync with GitHub:', err);
        }
        // Remove the completed issue from local state and fix currentIssueIndex
        const updatedIssues = issues.filter(i => i.number !== issueNumber);
        let newIndex = currentIssueIndex;
        if (updatedIssues.length === 0) {
          newIndex = 0;
        } else if (newIndex >= updatedIssues.length) {
          newIndex = updatedIssues.length - 1;
        }
        set({
          issues: updatedIssues,
          currentIssueIndex: newIndex,
        });
        console.log('[markIssueComplete] State after complete:', { issues: updatedIssues, currentIssueIndex: newIndex });
      },

      closeIssueAsNotPlanned: async (issueNumber) => {
        console.log('[closeIssueAsNotPlanned] called with', issueNumber);
        const { issues, currentIssueIndex } = get();
        const issue = issues.find(i => i.number === issueNumber);
        if (!issue) return;
        
        // Close the issue as "not planned" on GitHub
        try {
          await githubService.closeIssueAsNotPlanned({
            owner: 'komo-tech',
            repo: 'komo-platform',
            issueNumber: issue.number,
          });
        } catch (err) {
          console.error('Failed to close issue on GitHub:', err);
        }
        
        // Remove the closed issue from local state and fix currentIssueIndex
        const updatedIssues = issues.filter(i => i.number !== issueNumber);
        let newIndex = currentIssueIndex;
        if (updatedIssues.length === 0) {
          newIndex = 0;
        } else if (newIndex >= updatedIssues.length) {
          newIndex = updatedIssues.length - 1;
        }
        set({
          issues: updatedIssues,
          currentIssueIndex: newIndex,
        });
        console.log('[closeIssueAsNotPlanned] State after close:', { issues: updatedIssues, currentIssueIndex: newIndex });
      },
      
      updateIssueTitle: (title: string) => {
        const { issues, currentIssueIndex } = get();
        const updated = [...issues];
        updated[currentIssueIndex] = { ...updated[currentIssueIndex], title };
        set({ issues: updated });
      },

      refreshIssues: async () => {
        console.log('[refreshIssues] called');
        const { issues } = get();
        const owner = 'komo-tech';
        const repo = 'komo-platform';
        const currentIssue = issues[get().currentIssueIndex];

        let removedCount = 0;
        let updatedCount = 0;
        let errorCount = 0;

        // Process issues with rate limiting to be nice to GitHub's API
        for (let i = 0; i < issues.length; i++) {
          const issue = issues[i];
          try {
            const response = await githubService.fetchIssue(owner, repo, issue.number);
            if (response.state === 'closed') {
              removedCount++;
              // Remove closed issues from local state
              const updatedIssues = get().issues.filter(i => i.number !== issue.number);
              set({ issues: updatedIssues });
            } else {
              updatedCount++;
              // Update local state with refreshed data
              const updatedIssues = get().issues.map(i =>
                i.number === issue.number ? response : i
              );
              set({ issues: updatedIssues });
            }
            
            // Add a small delay between requests to be nice to GitHub's API
            if (i < issues.length - 1) {
              await new Promise(resolve => setTimeout(resolve, 100));
            }
          } catch (err) {
            console.error(`Failed to refresh issue ${issue.number}:`, err);
            errorCount++;
          }
        }

        // Get the final state after all updates
        const finalIssues = get().issues;
        
        // If the current issue was removed, adjust the index
        if (currentIssue && finalIssues.length > 0) {
          const currentIssueIndex = finalIssues.findIndex(i => i.number === currentIssue.number);
          if (currentIssueIndex === -1) {
            // Current issue was removed, reset to 0
            set({ currentIssueIndex: 0 });
          } else if (currentIssueIndex !== get().currentIssueIndex) {
            // Current issue moved to a different index
            set({ currentIssueIndex: currentIssueIndex });
          }
        } else if (finalIssues.length === 0) {
          // No issues left, reset to 0
          set({ currentIssueIndex: 0 });
        }

        console.log('[refreshIssues] State after refresh:', {
          issues: issues,
          currentIssueIndex: get().currentIssueIndex,
          removed: removedCount,
          updated: updatedCount,
          errors: errorCount
        });

        return { removed: removedCount, updated: updatedCount, errors: errorCount };
      }
    }),
    { name: 'app-store' }
  )
);
import React, { useState, useEffect, useRef } from 'react';
import { X, Plus } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { githubService } from '../services/github';
import Select, { SelectInstance } from 'react-select';

interface LabelManagerProps {
  issueNumber: number;
}

const LabelManager: React.FC<LabelManagerProps> = ({ issueNumber }) => {
  const issue = useAppStore(s => s.issues.find(i => i.number === issueNumber));
  const [showLabelForm, setShowLabelForm] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState<string>('');
  const [allLabels, setAllLabels] = useState<{ id: number; name: string; color: string }[]>([]);
  const { addLabel, removeLabel } = useAppStore();
  const selectRef = useRef<SelectInstance<{ value: string; label: string; color: string }> | null>(null);

  useEffect(() => {
    githubService.fetchLabels('komo-tech', 'komo-platform').then(setAllLabels);
  }, []);

  useEffect(() => {
    if (showLabelForm && selectRef.current) {
      selectRef.current.focus();
    }
  }, [showLabelForm]);

  if (!issue) return null;

  const handleAddLabel = (e: React.FormEvent) => {
    e.preventDefault();
    const label = allLabels.find((l) => l.name === selectedLabel);
    console.log('Selected label name:', selectedLabel);
    console.log('Label found in allLabels:', label);
    console.log('Labels before add:', issue.labels);
    if (label && !issue.labels.some((l) => l.name === label.name)) {
      addLabel(issue.number, label);
      setSelectedLabel('');
      setShowLabelForm(false);
      setTimeout(() => {
        const updatedLabels = useAppStore.getState().issues.find(i => i.number === issue.number)?.labels;
        console.log('Labels after add:', updatedLabels);
      }, 100);
    }
  };

  // Filter out labels already on the issue
  const availableLabels = allLabels.filter(label => !issue.labels.some(l => l.name === label.name));

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {issue.labels.length === 0 ? (
          <span className="text-sm text-gray-500 dark:text-gray-400">No labels</span>
        ) : (
          issue.labels.map((label) => {
            // Priority label colors
            let bg = `#${label.color}20`;
            let color = `#${label.color}`;
            if (label.name === 'prio-high') {
              bg = 'rgba(239,68,68,0.15)'; // red-500
              color = '#ef4444';
            } else if (label.name === 'prio-medium') {
              bg = 'rgba(251,191,36,0.15)'; // yellow-400
              color = '#fbbf24';
            } else if (label.name === 'prio-low') {
              bg = 'rgba(34,197,94,0.15)'; // green-500
              color = '#22c55e';
            }
            // Always use black text for contrast
            const textColor = '#111';
            return (
              <div 
                key={label.id}
                className="flex items-center gap-1 px-2 py-1 rounded-full text-sm"
                style={{ 
                  backgroundColor: bg, 
                  color: textColor,
                  border: `1px solid ${color}`
                }}
              >
                <span>{label.name}</span>
                <button 
                  onClick={() => removeLabel(issue.number, label.name)}
                  className="rounded-full p-0.5 hover:bg-black/10 transition-colors"
                  aria-label={`Remove ${label.name} label`}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })
        )}
      </div>
      {!showLabelForm ? (
        <button 
          onClick={() => setShowLabelForm(true)}
          className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add label
        </button>
      ) : (
        <form onSubmit={handleAddLabel} className="mt-2 p-3 border rounded-md dark:border-gray-700">
          <div className="flex gap-2 mb-2 items-center">
            <div className="flex-1">
              <label htmlFor="labelName" className="sr-only">Label Name</label>
              <Select
                ref={selectRef}
                inputId="labelName"
                value={availableLabels.find(l => l.name === selectedLabel)
                  ? {
                      value: selectedLabel,
                      label: selectedLabel,
                      color: `#${availableLabels.find(l => l.name === selectedLabel)?.color ?? ''}`
                    }
                  : null}
                onChange={option => setSelectedLabel(option ? option.value : '')}
                options={availableLabels.map(label => ({ value: label.name, label: label.name, color: `#${label.color}` }))}
                placeholder="Select label"
                isSearchable
                styles={{
                  option: (provided, state) => ({
                    ...provided,
                    color: '#111',
                    backgroundColor: state.isSelected ? '#e0e7ff' : state.isFocused ? '#f3f4f6' : '#fff',
                    borderLeft: `4px solid ${state.data.color}`
                  }),
                  singleValue: (provided) => ({
                    ...provided,
                    color: '#111',
                  })
                }}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button 
              type="button"
              onClick={() => setShowLabelForm(false)}
              className="px-3 py-1 text-sm rounded bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-3 py-1 text-sm rounded bg-blue-500 text-white hover:bg-blue-600 transition-colors"
              disabled={!selectedLabel}
            >
              Add
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default LabelManager;
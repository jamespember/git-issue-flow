import React, { useRef, useEffect } from 'react';

type MarkdownEditorProps = {
  value: string;
  onChange: (value: string) => void;
};

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({ value, onChange }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Handle null/undefined values by providing a default empty string
  const safeValue = value ?? '';

  useEffect(() => {
    // Focus the textarea when the component mounts
    if (textareaRef.current) {
      textareaRef.current.focus();
      
      // Auto-resize textarea based on content
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    
    // Auto-resize textarea
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={safeValue}
        onChange={handleChange}
        className="w-full min-h-[400px] p-4 border rounded-md font-mono text-sm resize-none bg-gray-50 dark:bg-gray-900 dark:border-gray-700 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition-all"
        spellCheck="false"
      />
      <div className="absolute bottom-3 right-3 text-xs text-gray-500 dark:text-gray-400">
        {safeValue.length} characters
      </div>
    </div>
  );
};

export default MarkdownEditor;
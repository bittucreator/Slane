/**
 * @author Shiva Nagendra Babu Kore
 */

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Typography from '@tiptap/extension-typography';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Underline from '@tiptap/extension-underline';
import { 
  Bold, 
  Italic, 
  Strikethrough, 
  Underline as UnderlineIcon, 
  Code, 
  Link as LinkIcon,
  Unlink,
  ExternalLink
} from 'lucide-react';
import { useCallback, useEffect, useState, useRef } from 'react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  onKeyDown?: (e: KeyboardEvent) => void;
  autoFocus?: boolean;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  placeholder = "Add description…",
  className = "",
  onKeyDown,
  autoFocus = false
}) => {
  const [showToolbar, setShowToolbar] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Handle SSR by only mounting the editor client-side
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Debounced onChange to prevent excessive updates
  const debouncedOnChange = useCallback((newContent: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = setTimeout(() => {
      onChange(newContent);
    }, 300); // 300ms debounce
  }, [onChange]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: {
          class: 'text-vscode-link underline cursor-pointer hover:opacity-80 transition-colors',
          rel: 'noopener noreferrer',
          target: '_blank',
        },
        validate: href => {
          return /^https?:\/\//.test(href);
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      Typography,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Underline,
    ],
    content,
    immediatelyRender: false, // Fix for SSR hydration
    editorProps: {
      attributes: {
        class: `prose prose-sm max-w-none focus:outline-none min-h-[80px] ${className}`,
      },
      handleKeyDown: (view, event) => {
        // Prevent Enter from submitting forms
        if (event.key === 'Enter' && !event.shiftKey && !event.ctrlKey && !event.metaKey) {
          // Allow normal Enter behavior in editor but prevent form submission
          event.stopPropagation();
          return false;
        }
        
        // Prevent all keyboard events from bubbling up to parent forms
        event.stopPropagation();
        
        if (onKeyDown) {
          onKeyDown(event);
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      const newContent = editor.getHTML();
      // Only call onChange if content actually changed
      if (newContent !== content) {
        debouncedOnChange(newContent);
      }
    },
    onSelectionUpdate: ({ editor }) => {
      const { from, to } = editor.state.selection;
      setShowToolbar(from !== to); // Show toolbar when text is selected
    },
    autofocus: autoFocus,
  });

  const setLink = useCallback(() => {
    if (!editor) return;
    
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to);
    
    // If no text is selected and cursor is not on a link
    if (from === to && !editor.isActive('link')) {
      alert('Please select some text first to create a link');
      return;
    }
    
    const previousUrl = editor.getAttributes('link').href || '';
    
    // Show different prompt based on whether we're editing existing link
    const promptText = editor.isActive('link') 
      ? 'Edit URL:' 
      : selectedText 
      ? 'Enter URL for selected text:' 
      : 'Enter URL:';
    
    let url = window.prompt(promptText, previousUrl || 'https://');

    if (url === null) {
      return;
    }

    // Remove link if URL is empty
    if (url === '' || url === 'https://') {
      editor.chain().focus().unsetLink().run();
      return;
    }

    // Add protocol if missing
    if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('mailto:')) {
      url = 'https://' + url;
    }

    // Apply the link
    if (from !== to) {
      // Text is selected, make it a link
      editor.chain().focus().setLink({ href: url }).run();
    } else {
      // No selection, but we're on a link, update it
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
  }, [editor]);

  const unsetLink = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().unsetLink().run();
  }, [editor]);

  // Handle keyboard shortcuts globally
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!editor || !editor.isFocused) return;
      
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        event.stopPropagation();
        setLink();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [editor, setLink]);

  // Update content when prop changes (but avoid infinite loops)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, { emitUpdate: false }); // Don't emit update event
    }
  }, [content, editor]);

  // Cleanup debounce timer
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Show loading state during SSR
  if (!isMounted || !editor) {
    return (
      <div className="w-full text-sm text-vscode-text bg-transparent border-none outline-none p-0 leading-relaxed min-h-[80px] flex items-start">
        <div className="text-vscode-text-muted">{placeholder}</div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Floating Toolbar - appears when text is selected */}
      {showToolbar && (
        <div className="absolute top-0 left-0 transform -translate-y-full mb-2 z-10 flex items-center gap-1 bg-white text-vscode-text rounded px-2 py-1 shadow-lg border border-vscode-border">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1.5 rounded hover:bg-vscode-sidebar transition-colors ${
              editor.isActive('bold') ? 'bg-vscode-sidebar text-white' : 'text-vscode-text'
            }`}
            title="Bold (⌘B)"
          >
            <Bold className="w-4 h-4" />
          </button>

          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1.5 rounded hover:bg-vscode-sidebar transition-colors ${
              editor.isActive('italic') ? 'bg-vscode-sidebar text-white' : 'text-vscode-text'
            }`}
            title="Italic (⌘I)"
          >
            <Italic className="w-4 h-4" />
          </button>

          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-1.5 rounded hover:bg-vscode-sidebar transition-colors ${
              editor.isActive('underline') ? 'bg-vscode-sidebar text-white' : 'text-vscode-text'
            }`}
            title="Underline (⌘U)"
          >
            <UnderlineIcon className="w-4 h-4" />
          </button>

          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`p-1.5 rounded hover:bg-vscode-sidebar transition-colors ${
              editor.isActive('strike') ? 'bg-vscode-sidebar text-white' : 'text-vscode-text'
            }`}
            title="Strikethrough"
          >
            <Strikethrough className="w-4 h-4" />
          </button>

          <button
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={`p-1.5 rounded hover:bg-vscode-sidebar transition-colors ${
              editor.isActive('code') ? 'bg-vscode-sidebar text-white' : 'text-vscode-text'
            }`}
            title="Inline Code (⌘E)"
          >
            <Code className="w-4 h-4" />
          </button>

          <div className="w-px h-4 bg-vscode-border mx-1" />

          <button
            onClick={setLink}
            className={`p-1.5 rounded hover:bg-vscode-sidebar transition-colors ${
              editor.isActive('link') ? 'bg-vscode-sidebar text-white' : 'text-vscode-text'
            }`}
            title="Link (⌘K)"
          >
            <LinkIcon className="w-4 h-4" />
          </button>

          {editor.isActive('link') && (
            <>
              <button
                onClick={unsetLink}
                className="p-1.5 rounded hover:bg-vscode-sidebar transition-colors text-vscode-text"
                title="Remove Link"
              >
                <Unlink className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => {
                  const href = editor.getAttributes('link').href;
                  if (href) {
                    window.open(href, '_blank', 'noopener,noreferrer');
                  }
                }}
                className="p-1.5 rounded hover:bg-vscode-sidebar transition-colors text-vscode-text"
                title="Open Link"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      )}

      {/* Link Bubble Menu - appears when link is selected */}
      {editor.isActive('link') && !showToolbar && (
        <div className="absolute top-0 left-0 transform -translate-y-full mb-2 z-10 flex items-center gap-1 bg-white text-vscode-text rounded px-2 py-1 shadow-lg border border-vscode-border">
          <span className="text-xs text-vscode-text-muted mr-2">Link:</span>
          <button
            onClick={setLink}
            className="p-1 rounded hover:bg-vscode-sidebar transition-colors text-vscode-text"
            title="Edit Link"
          >
            <LinkIcon className="w-3 h-3" />
          </button>
          
          <button
            onClick={() => {
              const href = editor.getAttributes('link').href;
              if (href) {
                window.open(href, '_blank', 'noopener,noreferrer');
              }
            }}
            className="p-1 rounded hover:bg-vscode-sidebar transition-colors text-vscode-text"
            title="Open Link"
          >
            <ExternalLink className="w-3 h-3" />
          </button>
          
          <button
            onClick={unsetLink}
            className="p-1 rounded hover:bg-vscode-sidebar transition-colors text-vscode-text"
            title="Remove Link"
          >
            <Unlink className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Editor Content - Wrapped to prevent form submission */}
      <div 
        onKeyDown={(e) => {
          // Prevent keyboard events from bubbling up to parent forms
          e.stopPropagation();
        }}
        onKeyPress={(e) => {
          // Prevent enter key from submitting parent forms
          if (e.key === 'Enter') {
            e.stopPropagation();
          }
        }}
      >
        <EditorContent 
          editor={editor} 
          className="w-full text-sm text-vscode-text bg-transparent border-none outline-none p-0 leading-relaxed"
          style={{
            minHeight: '80px',
          }}
        />
      </div>

      {/* Slash command hint */}
      {editor.isEmpty && (
        <div className="absolute top-20 left-0 text-xs text-vscode-text-muted pointer-events-none">
        </div>
      )}

      {/* Keyboard shortcuts info */}
      <style jsx global>{`
        .ProseMirror {
          outline: none !important;
          border: none !important;
          min-height: 80px;
        }
        
        .ProseMirror h1 {
          font-size: 1.5em;
          font-weight: 600;
          margin: 0.5em 0;
        }
        
        .ProseMirror h2 {
          font-size: 1.3em;
          font-weight: 600;
          margin: 0.4em 0;
        }
        
        .ProseMirror h3 {
          font-size: 1.1em;
          font-weight: 600;
          margin: 0.3em 0;
        }
        
        .ProseMirror ul, .ProseMirror ol {
          padding-left: 1.2em;
          margin: 0.5em 0;
        }
        
        .ProseMirror ul[data-type="taskList"] {
          list-style: none;
          padding-left: 0;
        }
        
        .ProseMirror ul[data-type="taskList"] li {
          display: flex;
          align-items: flex-start;
          margin: 0.2em 0;
        }
        
        .ProseMirror ul[data-type="taskList"] li > label {
          flex: 0 0 auto;
          margin-right: 0.5em;
          user-select: none;
        }
        
        .ProseMirror ul[data-type="taskList"] li > div {
          flex: 1 1 auto;
        }
        
        .ProseMirror blockquote {
          border-left: 3px solid var(--vscode-border);
          padding-left: 1em;
          margin: 1em 0;
          font-style: italic;
          color: var(--vscode-text-muted);
        }
        
        .ProseMirror code {
          background-color: var(--vscode-sidebar-bg);
          padding: 0.1em 0.3em;
          border-radius: 0.25em;
          font-size: 0.85em;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        }
        
        .ProseMirror pre {
          background-color: var(--vscode-sidebar-bg);
          border-radius: 0.5em;
          padding: 1em;
          margin: 1em 0;
          overflow-x: auto;
        }
        
        .ProseMirror pre code {
          background: none;
          padding: 0;
          border-radius: 0;
          font-size: inherit;
        }
        
        .ProseMirror a {
          color: var(--vscode-link);
          text-decoration: underline;
          cursor: pointer;
          position: relative;
        }
        
        .ProseMirror a:hover {
          opacity: 0.8;
          background-color: var(--vscode-list-hover);
          padding: 1px 2px;
          margin: -1px -2px;
          border-radius: 2px;
        }
        
        .ProseMirror a.ProseMirror-selectednode {
          background-color: var(--vscode-list-hover);
          padding: 1px 2px;
          margin: -1px -2px;
          border-radius: 2px;
          outline: 2px solid var(--vscode-focus-border);
          outline-offset: 1px;
        }
        
        .ProseMirror strong {
          font-weight: 600;
        }
        
        .ProseMirror em {
          font-style: italic;
        }
        
        .ProseMirror u {
          text-decoration: underline;
        }
        
        .ProseMirror s {
          text-decoration: line-through;
        }
        
        .ProseMirror p {
          margin: 0.5em 0;
        }
        
        .ProseMirror p:first-child {
          margin-top: 0;
        }
        
        .ProseMirror p:last-child {
          margin-bottom: 0;
        }
        
        .ProseMirror p.is-editor-empty:first-child::before {
          color: var(--vscode-text-muted);
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
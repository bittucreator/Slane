/**
 * @author Shiva Nagendra Babu Kore
 */

import dynamic from 'next/dynamic';

// Define the props interface
interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  onKeyDown?: (e: KeyboardEvent) => void;
  autoFocus?: boolean;
}

// Dynamically import the RichTextEditor to avoid SSR issues
const RichTextEditor = dynamic(() => import('./RichTextEditor').then(mod => ({ default: mod.RichTextEditor })), {
  ssr: false,
  loading: () => (
    <div className="w-full text-sm text-vscode-text bg-transparent border-none outline-none p-0 leading-relaxed min-h-[80px] flex items-start">
      <div className="text-vscode-text-muted">Add description…</div>
    </div>
  ),
});

export const DynamicRichTextEditor: React.FC<RichTextEditorProps> = (props) => {
  return <RichTextEditor {...props} />;
};

export default DynamicRichTextEditor;
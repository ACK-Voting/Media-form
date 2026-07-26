'use client';

import { useRef, useEffect, useCallback } from 'react';

type Props = {
  value: string;
  onChange: (html: string) => void;
  minHeight?: number;
  placeholder?: string;
};

function Sep() {
  return <span className="w-px h-5 bg-gray-200 mx-0.5 flex-shrink-0 self-center" />;
}

function Btn({ title, onClick, children }: { title: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      className="px-2 py-1 rounded text-xs font-medium text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-colors select-none flex items-center justify-center min-w-[26px]"
    >
      {children}
    </button>
  );
}

export function RichTextEditor({ value, onChange, minHeight = 220, placeholder = 'Write your content here…' }: Props) {
  const editorRef = useRef<HTMLDivElement>(null);

  // Populate only on first mount — don't sync after that to avoid cursor jumps
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = value || '';
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const emit = useCallback(() => {
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  }, [onChange]);

  function exec(cmd: string, val?: string) {
    editorRef.current?.focus();
    document.execCommand(cmd, false, val ?? undefined);
    emit();
  }

  function insertLink() {
    const selection = window.getSelection();
    const selectedText = selection?.toString() || '';
    const url = window.prompt('Enter URL (e.g. https://example.com):', 'https://');
    if (url) exec('createLink', url);
    else if (selectedText) {
      // do nothing — user cancelled
    }
  }

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/30 focus-within:border-blue-500 bg-white">

      {/* ── Toolbar ── */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-gray-100 bg-gray-50 flex-wrap">

        {/* Text style */}
        <Btn title="Bold (Ctrl+B)" onClick={() => exec('bold')}><strong>B</strong></Btn>
        <Btn title="Italic (Ctrl+I)" onClick={() => exec('italic')}><em>I</em></Btn>
        <Btn title="Underline (Ctrl+U)" onClick={() => exec('underline')}><u>U</u></Btn>

        <Sep />

        {/* Block format */}
        <Btn title="Heading" onClick={() => exec('formatBlock', 'h2')}>
          <span className="font-bold">H1</span>
        </Btn>
        <Btn title="Sub-heading" onClick={() => exec('formatBlock', 'h3')}>
          <span className="font-semibold">H2</span>
        </Btn>
        <Btn title="Normal paragraph" onClick={() => exec('formatBlock', 'p')}>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h10M4 18h16" />
          </svg>
        </Btn>
        <Btn title="Block quote" onClick={() => exec('formatBlock', 'blockquote')}>
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M6 3a1 1 0 00-1 1v4a1 1 0 001 1h2a1 1 0 001-1V4a1 1 0 00-1-1H6zM12 3a1 1 0 00-1 1v4a1 1 0 001 1h2a1 1 0 001-1V4a1 1 0 00-1-1h-2zM5 11a1 1 0 000 2v2a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 00-1-1H6a1 1 0 00-1 0zM11 11a1 1 0 000 2v2a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 00-1-1h-2a1 1 0 00-1 0z" />
          </svg>
        </Btn>

        <Sep />

        {/* Lists */}
        <Btn title="Bullet list" onClick={() => exec('insertUnorderedList')}>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
          </svg>
        </Btn>
        <Btn title="Numbered list" onClick={() => exec('insertOrderedList')}>
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8V6h1.5M3 14v-.5a1 1 0 011-1h.5a1 1 0 010 2H4a1 1 0 000 2h1" />
          </svg>
        </Btn>

        <Sep />

        {/* Link */}
        <Btn title="Insert link" onClick={insertLink}>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        </Btn>
        <Btn title="Remove link" onClick={() => exec('unlink')}>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </Btn>

        <Sep />

        {/* Clear formatting */}
        <Btn title="Clear formatting" onClick={() => exec('removeFormat')}>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </Btn>
      </div>

      {/* ── Editable area ── */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={emit}
        data-placeholder={placeholder}
        className="rich-editor-content px-4 py-3 text-sm text-gray-800 focus:outline-none leading-relaxed"
        style={{ minHeight }}
      />
    </div>
  );
}

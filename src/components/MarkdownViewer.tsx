import React, { useState } from 'react';
import {
  Copy,
  Check,
  Lightbulb,
  Bookmark,
  Tag,
  Info,
  Sparkles,
  Terminal,
} from 'lucide-react';

interface MarkdownViewerProps {
  content: string;
}

export const MarkdownViewer: React.FC<MarkdownViewerProps> = ({ content }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Helper to parse inline markdown (bold, italic, inline code, links)
  const renderInline = (text: string): React.ReactNode => {
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let keyIdx = 0;

    while (remaining.length > 0) {
      // 1. Inline code: `code`
      const codeMatch = remaining.match(/^`([^`]+)`/);
      if (codeMatch) {
        parts.push(
          <code
            key={keyIdx++}
            className="rounded bg-indigo-950/80 px-1.5 py-0.5 font-mono text-[12px] font-semibold text-indigo-200 border border-indigo-700/50"
          >
            {codeMatch[1]}
          </code>
        );
        remaining = remaining.slice(codeMatch[0].length);
        continue;
      }

      // 2. Bold italic: ***bold italic***
      const boldItalicMatch = remaining.match(/^\*\*\*([^*]+)\*\*\*/);
      if (boldItalicMatch) {
        parts.push(
          <strong key={keyIdx++} className="font-bold italic text-white">
            {boldItalicMatch[1]}
          </strong>
        );
        remaining = remaining.slice(boldItalicMatch[0].length);
        continue;
      }

      // 3. Bold text: **bold**
      const boldMatch = remaining.match(/^\*\*([^*]+)\*\*/);
      if (boldMatch) {
        parts.push(
          <strong key={keyIdx++} className="font-bold text-white">
            {boldMatch[1]}
          </strong>
        );
        remaining = remaining.slice(boldMatch[0].length);
        continue;
      }

      // 4. Italic text: *italic* or _italic_
      const italicMatch = remaining.match(/^\*([^*]+)\*/) || remaining.match(/^_([^_]+)_/);
      if (italicMatch) {
        parts.push(
          <em key={keyIdx++} className="italic text-slate-200">
            {italicMatch[1]}
          </em>
        );
        remaining = remaining.slice(italicMatch[0].length);
        continue;
      }

      // 5. Links: [text](url)
      const linkMatch = remaining.match(/^\[([^\]]+)\]\(([^)]+)\)/);
      if (linkMatch) {
        parts.push(
          <span
            key={keyIdx++}
            className="text-indigo-400 font-medium underline underline-offset-2 hover:text-indigo-300 transition-colors"
          >
            {linkMatch[1]}
          </span>
        );
        remaining = remaining.slice(linkMatch[0].length);
        continue;
      }

      // 6. Plain text before next special char
      const nextSpecial = remaining.search(/[`*_[\]]/);
      if (nextSpecial === -1) {
        parts.push(remaining);
        break;
      } else if (nextSpecial > 0) {
        parts.push(remaining.slice(0, nextSpecial));
        remaining = remaining.slice(nextSpecial);
      } else {
        // Standalone symbol without match, advance 1 char
        parts.push(remaining[0]);
        remaining = remaining.slice(1);
      }
    }

    return parts;
  };

  // Block-level parsing
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;
  let blockKey = 0;
  let h2Count = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // 1. Empty lines
    if (!trimmed) {
      i++;
      continue;
    }

    // 2. Code blocks (```)
    if (trimmed.startsWith('```')) {
      const langMatch = trimmed.match(/^```(\w+)?/);
      const language = langMatch && langMatch[1] ? langMatch[1] : 'text';
      const codeLines: string[] = [];
      const codeIndex = blockKey;
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      if (i < lines.length) i++; // consume closing ```
      const codeText = codeLines.join('\n');

      elements.push(
        <div
          key={blockKey++}
          className="group relative my-5 overflow-hidden rounded-xl border border-slate-800 bg-slate-950/90 shadow-lg"
        >
          <div className="flex items-center justify-between border-b border-slate-800/80 bg-slate-900/70 px-4 py-2 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Terminal className="h-3.5 w-3.5 text-indigo-400" />
              <span className="font-mono text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                {language}
              </span>
            </div>
            <button
              onClick={() => handleCopy(codeText, codeIndex)}
              className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              {copiedIndex === codeIndex ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-400 text-[11px] font-semibold">Đã chép</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span className="text-[11px]">Sao chép</span>
                </>
              )}
            </button>
          </div>
          <pre className="overflow-x-auto p-4 font-mono text-xs text-slate-200 leading-relaxed">
            <code>{codeText}</code>
          </pre>
        </div>
      );
      continue;
    }

    // 3. Tables (| col | col |)
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
        tableLines.push(lines[i].trim());
        i++;
      }

      if (tableLines.length >= 2) {
        const parseRow = (rowStr: string) =>
          rowStr
            .slice(1, -1)
            .split('|')
            .map((cell) => cell.trim());

        const headers = parseRow(tableLines[0]);
        // line 1 is separator |---|---|
        const rows = tableLines.slice(2).map(parseRow);

        elements.push(
          <div key={blockKey++} className="my-6 overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/50 shadow-md">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="border-b border-slate-700/80 bg-slate-800/80 text-slate-100 font-semibold">
                <tr>
                  {headers.map((h, idx) => (
                    <th key={idx} className="px-4 py-3 border-r border-slate-800/80 last:border-r-0 whitespace-nowrap">
                      {renderInline(h)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {rows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-800/40 transition-colors odd:bg-slate-900/30">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="px-4 py-3 border-r border-slate-800/60 last:border-r-0 align-top">
                        {renderInline(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        continue;
      }
    }

    // 4. Blockquotes (> ...)
    if (trimmed.startsWith('>')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        quoteLines.push(lines[i].trim().replace(/^>\s?/, ''));
        i++;
      }
      const quoteContent = quoteLines.join(' ');
      const isKeyIdea = quoteContent.includes('Ý chính');
      const isTemplate = quoteContent.includes('[Actor]');

      elements.push(
        <div
          key={blockKey++}
          className={`my-5 flex items-start gap-3.5 rounded-2xl border p-4 sm:p-5 ${
            isKeyIdea
              ? 'border-amber-500/40 bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-slate-950/50 text-amber-200 shadow-lg shadow-amber-950/20'
              : isTemplate
              ? 'border-indigo-500/40 bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-950 text-indigo-200 shadow-md'
              : 'border-slate-700/80 bg-slate-900/60 text-slate-200'
          }`}
        >
          <div
            className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
              isKeyIdea
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : isTemplate
                ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                : 'bg-slate-800 text-slate-300 border border-slate-700'
            }`}
          >
            {isKeyIdea ? (
              <Lightbulb className="h-4 w-4" />
            ) : isTemplate ? (
              <Sparkles className="h-4 w-4" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
          </div>
          <div className="flex-1 text-xs sm:text-sm leading-relaxed font-normal">
            {renderInline(quoteContent)}
          </div>
        </div>
      );
      continue;
    }

    // 5. Headings (#, ##, ###, ####)
    if (trimmed.startsWith('# ')) {
      elements.push(
        <h1
          key={blockKey++}
          className="mt-2 mb-6 text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white border-b border-slate-800 pb-4"
        >
          {renderInline(trimmed.replace(/^#\s+/, ''))}
        </h1>
      );
      i++;
      continue;
    }

    if (trimmed.startsWith('## ')) {
      const headingText = trimmed.replace(/^##\s+/, '');
      const secId = `section-${h2Count++}`;
      elements.push(
        <h2
          key={blockKey++}
          id={secId}
          className="mt-8 mb-4 flex items-center gap-2.5 text-base sm:text-lg font-bold text-white border-l-4 border-indigo-500 pl-3 scroll-mt-24"
        >
          <span>{renderInline(headingText)}</span>
        </h2>
      );
      i++;
      continue;
    }

    if (trimmed.startsWith('### ')) {
      elements.push(
        <h3 key={blockKey++} className="mt-5 mb-2 text-sm sm:text-base font-semibold text-indigo-200">
          {renderInline(trimmed.replace(/^###\s+/, ''))}
        </h3>
      );
      i++;
      continue;
    }

    if (trimmed.startsWith('#### ')) {
      elements.push(
        <h4 key={blockKey++} className="mt-4 mb-2 text-xs sm:text-sm font-semibold text-slate-300">
          {renderInline(trimmed.replace(/^####\s+/, ''))}
        </h4>
      );
      i++;
      continue;
    }

    // 6. Keywords block: **Từ khóa:** ...
    if (trimmed.startsWith('**Từ khóa:**')) {
      const rawKeywords = trimmed.replace(/^\*\*Từ khóa:\*\*\s*/, '');
      const keywords = rawKeywords.split(/[,;]/).map((k) => k.trim()).filter(Boolean);

      elements.push(
        <div
          key={blockKey++}
          className="my-6 rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-950 p-4 sm:p-5 shadow-md"
        >
          <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wider text-indigo-300">
            <Tag className="h-4 w-4 text-indigo-400" />
            <span>Từ khóa trọng tâm cần ghi nhớ</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {keywords.map((kw, idx) => (
              <span
                key={idx}
                className="rounded-lg border border-indigo-700/40 bg-indigo-950/60 px-2.5 py-1 font-mono text-xs font-semibold text-indigo-200 shadow-sm hover:border-indigo-500 hover:text-white transition-colors"
              >
                {kw}
              </span>
            ))}
          </div>
        </div>
      );
      i++;
      continue;
    }

    // 7. Source footer block: **Nguồn tổng hợp:** ...
    if (trimmed.startsWith('**Nguồn tổng hợp:**')) {
      const sourceText = trimmed.replace(/^\*\*Nguồn tổng hợp:\*\*\s*/, '');
      elements.push(
        <div
          key={blockKey++}
          className="mt-6 pt-4 border-t border-slate-800/80 flex items-center gap-2 text-xs text-slate-400"
        >
          <Info className="h-4 w-4 text-slate-500 shrink-0" />
          <span>
            <strong className="text-slate-300 font-semibold">Nguồn tổng hợp giáo trình: </strong>
            {renderInline(sourceText)}
          </span>
        </div>
      );
      i++;
      continue;
    }

    // 8. Bullet lists (- or *)
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const listItems: string[] = [];
      while (i < lines.length && (lines[i].trim().startsWith('- ') || lines[i].trim().startsWith('* '))) {
        listItems.push(lines[i].trim().replace(/^[-*]\s+/, ''));
        i++;
      }

      elements.push(
        <ul key={blockKey++} className="my-3 space-y-2 pl-1">
          {listItems.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300 leading-relaxed">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />
              <span className="flex-1">{renderInline(item)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // 9. Numbered lists (1., 2., etc.)
    if (/^\d+\.\s/.test(trimmed)) {
      const listItems: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
        listItems.push(lines[i].trim().replace(/^\d+\.\s+/, ''));
        i++;
      }

      elements.push(
        <ol key={blockKey++} className="my-3.5 space-y-2.5 pl-1">
          {listItems.map((item, idx) => (
            <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-950 border border-indigo-700/60 text-[11px] font-bold text-indigo-300">
                {idx + 1}
              </span>
              <span className="pt-0.5 flex-1">{renderInline(item)}</span>
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // 10. Horizontal rules (---)
    if (trimmed === '---') {
      elements.push(<hr key={blockKey++} className="my-6 border-slate-800" />);
      i++;
      continue;
    }

    // 11. Formula line: single line with `... = ...` or `... → ...` or `... ≈ ...`
    const isFormula =
      (trimmed.startsWith('`') && trimmed.endsWith('`') && trimmed.length > 5) ||
      (trimmed.includes('→') && !trimmed.startsWith('-') && !trimmed.startsWith('1.')) ||
      (trimmed.includes('≈') && !trimmed.startsWith('-') && !trimmed.startsWith('1.'));

    if (isFormula) {
      const cleanFormula = trimmed.replace(/^`/, '').replace(/`$/, '');
      elements.push(
        <div
          key={blockKey++}
          className="my-4 rounded-xl border border-indigo-500/30 bg-indigo-950/30 px-4 py-3 font-mono text-xs sm:text-sm text-indigo-200 shadow-inner overflow-x-auto flex items-center gap-2.5"
        >
          <span className="shrink-0 rounded bg-indigo-900/60 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-300">
            Công thức / Luồng
          </span>
          <span className="font-semibold text-white">{cleanFormula}</span>
        </div>
      );
      i++;
      continue;
    }

    // 12. Regular paragraph
    elements.push(
      <p key={blockKey++} className="my-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
        {renderInline(trimmed)}
      </p>
    );
    i++;
  }

  return <div className="space-y-1">{elements}</div>;
};

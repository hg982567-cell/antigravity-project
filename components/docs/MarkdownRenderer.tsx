import React from "react";
import { AlertCircle, AlertTriangle, Info, CheckCircle2 } from "lucide-react";

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  if (!content) return null;

  // Split lines to parse blocks
  const lines = content.split("\n");
  const blocks: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBuffer: string[] = [];
  let codeLanguage = "";
  let inList = false;
  let listItems: string[] = [];
  let isOrderedList = false;

  const flushList = () => {
    if (listItems.length > 0) {
      if (isOrderedList) {
        blocks.push(
          <ol key={`list-${blocks.length}`} className="my-4 ml-6 list-decimal space-y-2 text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
            {listItems.map((item, idx) => (
              <li key={idx} dangerouslySetInnerHTML={{ __html: renderInlineFormatting(item) }} />
            ))}
          </ol>
        );
      } else {
        blocks.push(
          <ul key={`list-${blocks.length}`} className="my-4 ml-6 list-disc space-y-2 text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
            {listItems.map((item, idx) => (
              <li key={idx} dangerouslySetInnerHTML={{ __html: renderInlineFormatting(item) }} />
            ))}
          </ul>
        );
      }
      listItems = [];
      inList = false;
    }
  };

  const renderInlineFormatting = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900 dark:text-white">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-mono text-xs border border-slate-200 dark:border-slate-700">$1</code>')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-blue-600 dark:text-blue-400 underline underline-offset-2 hover:text-blue-700">$1</a>');
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code block toggle
    if (line.trim().startsWith("```")) {
      if (inCodeBlock) {
        blocks.push(
          <div key={`code-${blocks.length}`} className="my-5 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 text-slate-100 shadow-md">
            {codeLanguage && (
              <div className="px-4 py-1.5 bg-slate-800/80 border-b border-slate-700 text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                {codeLanguage}
              </div>
            )}
            <pre className="p-4 text-xs font-mono overflow-x-auto leading-relaxed">
              <code>{codeBuffer.join("\n")}</code>
            </pre>
          </div>
        );
        codeBuffer = [];
        inCodeBlock = false;
      } else {
        flushList();
        inCodeBlock = true;
        codeLanguage = line.trim().replace("```", "");
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    // Callout boxes: > [!NOTE], > [!WARNING], > [!IMPORTANT], > [!CAUTION]
    if (line.trim().startsWith("> [!NOTE]") || line.trim().startsWith("> [!TIP]")) {
      flushList();
      const calloutLines: string[] = [];
      let j = i + 1;
      while (j < lines.length && lines[j].trim().startsWith(">")) {
        calloutLines.push(lines[j].replace(/^>\s?/, ""));
        j++;
      }
      i = j - 1;
      blocks.push(
        <div key={`note-${blocks.length}`} className="my-5 p-4 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/70 dark:bg-blue-950/30 flex gap-3 text-sm text-blue-950 dark:text-blue-200">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-xs uppercase tracking-wider text-blue-700 dark:text-blue-400 block">Note</span>
            <div dangerouslySetInnerHTML={{ __html: renderInlineFormatting(calloutLines.join(" ")) }} />
          </div>
        </div>
      );
      continue;
    }

    if (line.trim().startsWith("> [!WARNING]") || line.trim().startsWith("> [!CAUTION]") || line.trim().startsWith("> [!IMPORTANT]")) {
      flushList();
      const isDanger = line.includes("CAUTION") || line.includes("WARNING");
      const calloutLines: string[] = [];
      let j = i + 1;
      while (j < lines.length && lines[j].trim().startsWith(">")) {
        calloutLines.push(lines[j].replace(/^>\s?/, ""));
        j++;
      }
      i = j - 1;
      blocks.push(
        <div key={`warn-${blocks.length}`} className={`my-5 p-4 rounded-xl border ${isDanger ? 'border-amber-200 dark:border-amber-900/60 bg-amber-50/70 dark:bg-amber-950/30 text-amber-950 dark:text-amber-200' : 'border-purple-200 dark:border-purple-900/60 bg-purple-50/70 dark:bg-purple-950/30 text-purple-950 dark:text-purple-200'} flex gap-3 text-sm`}>
          <AlertTriangle className={`w-5 h-5 ${isDanger ? 'text-amber-600 dark:text-amber-400' : 'text-purple-600 dark:text-purple-400'} shrink-0 mt-0.5`} />
          <div className="space-y-1">
            <span className={`font-bold text-xs uppercase tracking-wider ${isDanger ? 'text-amber-700 dark:text-amber-400' : 'text-purple-700 dark:text-purple-400'} block`}>Important Notice</span>
            <div dangerouslySetInnerHTML={{ __html: renderInlineFormatting(calloutLines.join(" ")) }} />
          </div>
        </div>
      );
      continue;
    }

    // Markdown Headings (H2, H3, H4)
    if (line.startsWith("## ")) {
      flushList();
      const text = line.replace("## ", "").trim();
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      blocks.push(
        <h2 key={`h2-${blocks.length}`} id={id} className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-8 mb-4 tracking-tight scroll-mt-24 border-b border-slate-100 dark:border-slate-800 pb-2">
          {text}
        </h2>
      );
      continue;
    }

    if (line.startsWith("### ")) {
      flushList();
      const text = line.replace("### ", "").trim();
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      blocks.push(
        <h3 key={`h3-${blocks.length}`} id={id} className="text-lg font-bold text-slate-900 dark:text-white mt-6 mb-3 tracking-tight scroll-mt-24">
          {text}
        </h3>
      );
      continue;
    }

    if (line.startsWith("#### ")) {
      flushList();
      const text = line.replace("#### ", "").trim();
      blocks.push(
        <h4 key={`h4-${blocks.length}`} className="text-base font-semibold text-slate-800 dark:text-slate-200 mt-4 mb-2">
          {text}
        </h4>
      );
      continue;
    }

    // Unordered List (- or *)
    if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
      inList = true;
      isOrderedList = false;
      listItems.push(line.trim().replace(/^[-*]\s+/, ""));
      continue;
    }

    // Ordered List (1. 2. 3.)
    if (/^\d+\.\s+/.test(line.trim())) {
      inList = true;
      isOrderedList = true;
      listItems.push(line.trim().replace(/^\d+\.\s+/, ""));
      continue;
    }

    // Standard Paragraph
    if (line.trim().length > 0) {
      flushList();
      blocks.push(
        <p
          key={`p-${blocks.length}`}
          className="my-3 text-slate-700 dark:text-slate-300 text-sm leading-relaxed"
          dangerouslySetInnerHTML={{ __html: renderInlineFormatting(line) }}
        />
      );
    }
  }

  flushList();

  return <div className="docs-content space-y-1">{blocks}</div>;
}

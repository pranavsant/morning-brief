/**
 * markdown — minimal, dependency-free markdown → HTML renderer.
 *
 * Supports the subset Claude produces for the brief: headings, bold,
 * italics, links, unordered lists, and paragraphs. Output is escaped
 * before formatting to avoid injecting raw HTML.
 *
 * Layer: interfaces (presentation concern only).
 */

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function inline(text: string): string {
  return text
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a class="text-brand-600 underline hover:text-brand-700" href="$2" target="_blank" rel="noreferrer">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/_([^_]+)_/g, '<em>$1</em>');
}

export function renderMarkdown(md: string): string {
  const lines = escapeHtml(md).split('\n');
  const html: string[] = [];
  let inList = false;

  const closeList = () => {
    if (inList) {
      html.push('</ul>');
      inList = false;
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();

    if (line.startsWith('## ')) {
      closeList();
      html.push(`<h2 class="text-xl font-semibold mt-6 mb-2 text-slate-800">${inline(line.slice(3))}</h2>`);
    } else if (line.startsWith('# ')) {
      closeList();
      html.push(`<h1 class="text-2xl font-bold mt-6 mb-3 text-slate-900">${inline(line.slice(2))}</h1>`);
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      if (!inList) {
        html.push('<ul class="list-disc pl-6 space-y-1 my-2">');
        inList = true;
      }
      html.push(`<li>${inline(line.slice(2))}</li>`);
    } else if (line.length === 0) {
      closeList();
    } else {
      closeList();
      html.push(`<p class="my-2 leading-relaxed text-slate-700">${inline(line)}</p>`);
    }
  }

  closeList();
  return html.join('\n');
}

/**
 * Lightweight markdown → HTML converter for chat messages.
 * Handles headings, bold, italic, lists, horizontal rules, links, and paragraphs.
 * No external dependencies.
 */
export function renderMarkdown(md: string): string {
  let html = md
    // Escape dangerous HTML
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Heading 2
  html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>");
  // Heading 3
  html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");

  // Bold + italic (order matters)
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>");
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");

  // Inline code
  html = html.replace(/`(.+?)`/g, "<code>$1</code>");

  // Links [text](url)
  html = html.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-leaf-forest underline underline-offset-2 hover:text-leaf-sage">$1</a>'
  );

  // Horizontal rule
  html = html.replace(/^---$/gm, "<hr />");

  // Italic block quotes (lines starting with *)
  html = html.replace(/^\*([^*].+)\*$/gm, "<em>$1</em>");

  // Unordered lists — group consecutive list items
  html = html.replace(
    /((?:^- .+$\n?)+)/gm,
    (block) => {
      const items = block
        .trim()
        .split("\n")
        .map(line => `<li>${line.replace(/^- /, "")}</li>`)
        .join("");
      return `<ul>${items}</ul>`;
    }
  );

  // Ordered lists — group consecutive numbered items
  html = html.replace(
    /((?:^\d+\. .+$\n?)+)/gm,
    (block) => {
      const items = block
        .trim()
        .split("\n")
        .map(line => `<li>${line.replace(/^\d+\. /, "")}</li>`)
        .join("");
      return `<ol>${items}</ol>`;
    }
  );

  // Wrap remaining plain text lines in <p> tags
  // (lines not already inside a block element)
  const lines = html.split("\n");
  const result: string[] = [];
  let inBlock = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      inBlock = false;
      continue;
    }

    const isBlock =
      trimmed.startsWith("<h2") ||
      trimmed.startsWith("<h3") ||
      trimmed.startsWith("<ul") ||
      trimmed.startsWith("<ol") ||
      trimmed.startsWith("<hr") ||
      trimmed.startsWith("<li") ||
      trimmed.startsWith("</");

    if (isBlock) {
      inBlock = false;
      result.push(trimmed);
    } else if (trimmed.startsWith("<em>") || trimmed.startsWith("<strong>") || trimmed.startsWith("<code>")) {
      result.push(`<p>${trimmed}</p>`);
      inBlock = false;
    } else {
      result.push(`<p>${trimmed}</p>`);
      inBlock = false;
    }
  }

  return result.join("\n");
}

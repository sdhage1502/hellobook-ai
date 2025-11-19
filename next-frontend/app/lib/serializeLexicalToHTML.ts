/* eslint-disable @typescript-eslint/no-explicit-any */
import { applyInternalLinks, InternalLinkRule } from "@/app/lib/internalLinking";

export function serializeLexicalToHTML(content: any): string {
  if (!content?.root) return "<p>No content available.</p>";

  const serializeChildren = (children: any[]): string => children.map((node: any) => serializeNode(node)).join("");

  const serializeNode = (node: any): string => {
    switch (node.type) {
      case "paragraph":
        return `<p class="mb-4 leading-relaxed">${serializeChildren(node.children)}</p>`;
      case "heading": {
        const tag = node.tag || "h2";
        let headingId = node.id;
        if (!headingId && node.children) {
          const extractText = (children: any[]): string =>
            children
              .map((child: any) => {
                if (child.type === "text") return child.text || "";
                if (child.children && Array.isArray(child.children)) return extractText(child.children);
                return "";
              })
              .join("")
              .trim();

          const textContent = extractText(node.children);
          if (textContent) {
            headingId = textContent
              .toLowerCase()
              .replace(/[^\w\s-]/g, "")
              .replace(/\s+/g, "-")
              .replace(/-+/g, "-")
              .trim();
            headingId = `heading-${Date.now()}-${headingId}`;
          } else {
            headingId = `heading-${Date.now()}`;
          }
        }
        const headingClasses = {
          h1: "text-4xl font-bold my-6 scroll-mt-24",
          h2: "text-3xl font-bold my-5 scroll-mt-24",
          h3: "text-2xl font-bold my-4 scroll-mt-24",
          h4: "text-xl font-bold my-3 scroll-mt-24",
          h5: "text-lg font-bold my-3 scroll-mt-24",
          h6: "text-base font-bold my-2 scroll-mt-24",
        };
        const classes = headingClasses[tag as keyof typeof headingClasses] || "font-bold my-4 scroll-mt-24";
        return `<${tag} id="${headingId}" class="${classes}">${serializeChildren(node.children)}</${tag}>`;
      }
      case "text": {
        let text = escapeHtml(node.text || "");
        if (!text) return "";
        if (node.format) {
          if (node.format & 1) text = `<strong>${text}</strong>`;
          if (node.format & 2) text = `<em>${text}</em>`;
          if (node.format & 8) text = `<u>${text}</u>`;
          if (node.format & 4) text = `<s>${text}</s>`;
          if (node.format & 16) text = `<code class="bg-gray-100 px-1.5 py-0.5 rounded text-sm">${text}</code>`;
          if (node.format & 32) text = `<sub>${text}</sub>`;
          if (node.format & 64) text = `<sup>${text}</sup>`;
        }
        if (node.style) {
          text = `<span style="color: ${escapeHtmlAttr(node.style)}" class="inline">${text}</span>`;
        }
        return text;
      }
      case "link": {
        const url = node.fields?.url || node.url || "#";
        const newTab = node.fields?.openInNewTab || node.newTab ? ' target="_blank" rel="noopener noreferrer"' : "";
        return `<a href="${escapeHtmlAttr(url)}" class="text-blue-600 hover:text-blue-800 underline transition-colors"${newTab}>${serializeChildren(node.children)}</a>`;
      }
      case "list": {
        const ListTag = node.listType === "number" ? "ol" : "ul";
        const listClass =
          node.listType === "number" ? "list-decimal ml-6 my-4 space-y-2" : "list-disc ml-6 my-4 space-y-2";
        return `<${ListTag} class="${listClass}">${serializeChildren(node.children)}</${ListTag}>`;
      }
      case "listitem":
        return `<li class="leading-relaxed">${serializeChildren(node.children)}</li>`;
      case "quote":
        return `<blockquote class="border-l-4 border-gray-300 pl-4 py-2 my-4 italic text-gray-700 bg-gray-50">${serializeChildren(
          node.children,
        )}</blockquote>`;
      case "code":
        return `<pre class="bg-gray-900 text-gray-100 p-4 rounded-lg my-4 overflow-x-auto"><code class="text-sm font-mono">${node.children
          ?.map((child: any) => child.text)
          .join("") || ""}</code></pre>`;
      case "horizontalrule":
        return '<hr class="my-8 border-t border-gray-300" />';
      case "linebreak":
        return "<br />";
      case "upload": {
        const value = node.value;
        if (value && typeof value === "object" && value.url) {
          const alt = escapeHtml(value.alt || "");
          return `<figure class="my-6"><div class="relative w-full h-auto rounded-lg overflow-hidden"><img src="${escapeHtmlAttr(
            value.url,
          )}" alt="${alt}" class="w-full h-auto object-cover rounded-lg" /></div>${
            value.alt
              ? `<figcaption class="text-sm text-gray-600 text-center mt-2 italic">${escapeHtml(value.alt)}</figcaption>`
              : ""
          }</figure>`;
        }
        return "";
      }
      case "block": {
        const blockData = node.fields;
        if (blockData?.blockType === "customButton") {
          const text = escapeHtml(blockData.buttonText || "Learn more");
          const href = escapeHtmlAttr(blockData.buttonLink || "#");
          const styleClass = getButtonStyle(blockData.buttonStyle || "primary");
          const sizeClass = getButtonSize(blockData.buttonSize || "medium");
          const alignment = blockData.alignment || "left";
          const newTab = blockData.openInNewTab ? ' target="_blank" rel="noopener noreferrer"' : "";
          return `<div class="my-6 text-${alignment}"><a href="${href}" class="${styleClass} ${sizeClass}"${newTab}>${text}</a></div>`;
        }
        if (blockData?.blockType === "callout") {
          const type = blockData.type || "info";
          const colors: Record<string, string> = {
            info: "border-blue-500 bg-blue-50 text-blue-900",
            warning: "border-yellow-500 bg-yellow-50 text-yellow-900",
            success: "border-green-500 bg-green-50 text-green-900",
            error: "border-red-500 bg-red-50 text-red-900",
          };
          const content = escapeHtml(blockData.content || "");
          return `<div class="my-4 border-l-4 p-4 rounded ${colors[type] || colors.info}">${content}</div>`;
        }
        return "";
      }
      case "table":
        return `<div class="overflow-x-auto my-6"><table class="min-w-full border-collapse border border-gray-300"><tbody>${serializeChildren(
          node.children,
        )}</tbody></table></div>`;
      case "tablerow":
        return `<tr class="border-b border-gray-300">${serializeChildren(node.children)}</tr>`;
      case "tablecell":
        return `<td class="border border-gray-300 px-4 py-2">${serializeChildren(node.children)}</td>`;
      default:
        if (node.children && Array.isArray(node.children)) {
          return serializeChildren(node.children);
        }
        return "";
    }
  };

  const escapeHtml = (str: string): string =>
    str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");

  const escapeHtmlAttr = (str: string): string => escapeHtml(String(str));

  const getButtonStyle = (style: string): string => {
    const styles: Record<string, string> = {
      primary:
        "inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition",
      secondary:
        "inline-flex items-center justify-center px-6 py-3 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-800 transition",
      outline:
        "inline-flex items-center justify-center px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition",
      ghost:
        "inline-flex items-center justify-center px-6 py-3 text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition",
    };
    return styles[style] || styles.primary;
  };

  const getButtonSize = (size: string): string => {
    const sizes: Record<string, string> = {
      small: "text-sm px-4 py-2",
      medium: "text-base",
      large: "text-lg px-8 py-4",
    };
    return sizes[size] || sizes.medium;
  };

  return serializeChildren(content.root.children);
}

export function applyLinksToContent(content: any, rules: InternalLinkRule[] = [], site?: string): string {
  const html = serializeLexicalToHTML(content);
  if (!rules.length || !html) return html;
  const filteredRules = rules.filter((rule) => rule.isActive !== false && (!site || rule.site === site));
  const { html: linkedHtml } = applyInternalLinks(html, filteredRules, { maxTotalLinks: 50 });
  return linkedHtml;
}


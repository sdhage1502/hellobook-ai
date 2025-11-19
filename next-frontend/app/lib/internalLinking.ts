/* eslint-disable @typescript-eslint/no-explicit-any */
export interface InternalLinkRule {
  keyword: string;
  target_url: string;
  title?: string;
  nofollow?: boolean;
  priority?: number;
  max_links_per_page?: number;
  match_type?: 'word' | 'phrase' | 'regex';
  site?: string;
  isActive?: boolean;
  id?: string;
}

interface LinkStats {
  totalLinksInjected: number;
  ruleStats: Record<string, number>;
}

/**
 * Applies internal linking rules to HTML content
 * 
 * @param html - The HTML content to process
 * @param rules - Array of internal linking rules from Payload CMS
 * @param options - Additional options for link injection
 * @returns Object containing processed HTML and statistics
 */
export function applyInternalLinks(
  html: string,
  rules: InternalLinkRule[],
  options?: {
    maxTotalLinks?: number; // Global limit for safety
    avoidLinkingInTags?: string[]; // Tags to avoid linking inside (default: ['a', 'code', 'pre'])
  }
): { html: string; stats: LinkStats } {
  if (!html || !rules?.length) {
    return { html, stats: { totalLinksInjected: 0, ruleStats: {} } };
  }

  const stats: LinkStats = {
    totalLinksInjected: 0,
    ruleStats: {},
  };

  const maxTotalLinks = options?.maxTotalLinks ?? 50; // Safety limit
  const avoidTags = options?.avoidLinkingInTags ?? ['a', 'code', 'pre', 'script', 'style'];

  // Sort rules by priority (higher first) and keyword length (longer first)
  const sortedRules = [...rules].sort((a, b) => {
    const priorityDiff = (b.priority || 0) - (a.priority || 0);
    if (priorityDiff !== 0) return priorityDiff;
    return (b.keyword?.length || 0) - (a.keyword?.length || 0);
  });

  let result = html;

  for (const rule of sortedRules) {
    // Stop if we've hit the global limit
    if (stats.totalLinksInjected >= maxTotalLinks) break;

    const maxLinks = rule.max_links_per_page ?? 2;
    if (!rule.keyword || !rule.target_url || maxLinks <= 0) continue;

    // Initialize stats for this rule
    stats.ruleStats[rule.keyword] = 0;

    // Build regex pattern based on match type
    let pattern: RegExp;
    try {
      if (rule.match_type === 'regex') {
        pattern = new RegExp(rule.keyword, 'gi');
      } else if (rule.match_type === 'phrase') {
        const escaped = rule.keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        pattern = new RegExp(escaped, 'gi');
      } else {
        // Word boundary match (default)
        const escaped = rule.keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        pattern = new RegExp(`\\b${escaped}\\b`, 'gi');
      }
    } catch (error) {
      console.warn(`Invalid regex pattern for keyword "${rule.keyword}":`, error);
      continue;
    }

    let linkCount = 0;

    // Replace matches
    result = result.replace(pattern, (match, offset) => {
      // Check if we've reached the limit for this rule
      if (linkCount >= maxLinks) return match;

      // Check if we've reached the global limit
      if (stats.totalLinksInjected >= maxTotalLinks) return match;

      // Don't link if we're inside a tag we should avoid
      if (isInsideAvoidTag(result, offset, avoidTags)) {
        return match;
      }

      // Don't link if already inside an anchor tag
      if (isInsideAnchorTag(result, offset)) {
        return match;
      }

      // Build the link attributes
      const attrs = [
        `href="${rule.target_url}"`,
        rule.title ? `title="${escapeHtml(rule.title)}"` : null,
        rule.nofollow ? 'rel="nofollow"' : null,
        'class="internal-link"', // Add class for styling/tracking
      ]
        .filter(Boolean)
        .join(' ');

      linkCount++;
      stats.totalLinksInjected++;
      stats.ruleStats[rule.keyword]++;

      return `<a ${attrs}>${match}</a>`;
    });
  }

  return { html: result, stats };
}

/**
 * Check if position is inside an anchor tag
 */
function isInsideAnchorTag(html: string, position: number): boolean {
  const before = html.slice(0, position);
  const after = html.slice(position);

  // Count opening and closing anchor tags before position
  const openingBefore = (before.match(/<a\s/gi) || []).length;
  const closingBefore = (before.match(/<\/a>/gi) || []).length;

  // If we have more opening than closing, we're inside an anchor
  if (openingBefore > closingBefore) {
    // Verify by checking if there's a closing tag after
    return /<\/a>/i.test(after);
  }

  return false;
}

/**
 * Check if position is inside any of the specified tags
 */
function isInsideAvoidTag(html: string, position: number, tags: string[]): boolean {
  for (const tag of tags) {
    if (isInsideTag(html, position, tag)) {
      return true;
    }
  }
  return false;
}

/**
 * Check if position is inside a specific tag
 */
function isInsideTag(html: string, position: number, tagName: string): boolean {
  const before = html.slice(0, position);
  const after = html.slice(position);

  const openingPattern = new RegExp(`<${tagName}[\\s>]`, 'gi');
  const closingPattern = new RegExp(`</${tagName}>`, 'gi');

  const openingBefore = (before.match(openingPattern) || []).length;
  const closingBefore = (before.match(closingPattern) || []).length;

  if (openingBefore > closingBefore) {
    return closingPattern.test(after);
  }

  return false;
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

/**
 * Fetch internal link rules from Payload CMS
 */
export async function fetchInternalLinkRules(
  site: string = 'default'
): Promise<InternalLinkRule[]> {
  const CMS_URL = process.env.NEXT_PUBLIC_PAYLOAD_URL;
  
  if (!CMS_URL) {
    console.warn('NEXT_PUBLIC_PAYLOAD_URL not set, skipping internal links');
    return [];
  }

  try {
    const response = await fetch(
      `${CMS_URL}/api/internal-links?where[site][equals]=${encodeURIComponent(site)}&limit=100`,
      {
        next: { revalidate: 3600 }, // Cache for 1 hour
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch internal links: ${response.status}`);
    }

    const data = await response.json();
    return data.docs || [];
  } catch (error) {
    console.error('Error fetching internal link rules:', error);
    return [];
  }
}

/**
 * Process blog content with internal links
 * This is the main function to use in your Next.js pages
 * 
 * @example
 * ```tsx
 * const { processedHtml, stats } = await processContentWithInternalLinks(
 *   blog.contentHtml,
 *   'yourdomain.com'
 * );
 * ```
 */
export async function processContentWithInternalLinks(
  htmlContent: string,
  site: string = 'default',
  preloadedRules?: InternalLinkRule[]
): Promise<{ processedHtml: string; stats: LinkStats }> {
  const rules = preloadedRules ?? (await fetchInternalLinkRules(site));
  const { html, stats } = applyInternalLinks(htmlContent, rules);
  return { processedHtml: html, stats };
}

/**
 * Utility to convert Lexical content to HTML (if needed)
 * This is a basic implementation - you may need to adjust based on your content structure
 */
export function lexicalToHtml(content: any): string {
  if (!content?.root?.children) return ''

  const serializeChildren = (nodes: any[]): string =>
    nodes?.map((node) => serializeNode(node)).join('') ?? ''

  const serializeNode = (node: any): string => {
    if (!node) return ''

    switch (node.type) {
      case 'paragraph': {
        const inner = serializeChildren(node.children) || '<br />'
        return `<p class="mb-4 leading-relaxed">${inner}</p>`
      }

      case 'text': {
        return serializeTextNode(node)
      }

      case 'heading': {
        const HeadingTag = (node.tag || 'h2').toLowerCase()
        const classes: Record<string, string> = {
          h1: 'text-4xl font-bold my-6 scroll-mt-24',
          h2: 'text-3xl font-bold my-5 scroll-mt-24',
          h3: 'text-2xl font-bold my-4 scroll-mt-24',
          h4: 'text-xl font-bold my-3 scroll-mt-24',
          h5: 'text-lg font-bold my-3 scroll-mt-24',
          h6: 'text-base font-bold my-2 scroll-mt-24',
        }

        const id = ensureHeadingId(node)
        const inner = serializeChildren(node.children)
        const cls = classes[HeadingTag] || 'font-bold my-4 scroll-mt-24'

        return `<${HeadingTag} id="${id}" class="${cls}">${inner}</${HeadingTag}>`
      }

      case 'link': {
        const url = escapeHtmlAttr(node.fields?.url || node.url || '#')
        const openNewTab = node.fields?.openInNewTab || node.newTab
        const rel = openNewTab ? ' rel="noopener noreferrer"' : ''
        const target = openNewTab ? ' target="_blank"' : ''
        const inner = serializeChildren(node.children)

        return `<a href="${url}" class="text-blue-600 hover:text-blue-800 underline transition-colors"${target}${rel}>${inner}</a>`
      }

      case 'list': {
        const isOrdered = node.listType === 'number'
        const tag = isOrdered ? 'ol' : 'ul'
        const cls = isOrdered
          ? 'list-decimal ml-6 my-4 space-y-2'
          : 'list-disc ml-6 my-4 space-y-2'
        const inner = serializeChildren(node.children)
        return `<${tag} class="${cls}">${inner}</${tag}>`
      }

      case 'listitem':
        return `<li class="leading-relaxed">${serializeChildren(node.children)}</li>`

      case 'quote':
        return `<blockquote class="border-l-4 border-gray-300 pl-4 py-2 my-4 italic text-gray-700 bg-gray-50">${serializeChildren(
          node.children,
        )}</blockquote>`

      case 'code': {
        const text = node.children?.map((child: any) => child.text || '').join('') || ''
        return `<pre class="bg-gray-900 text-gray-100 p-4 rounded-lg my-4 overflow-x-auto"><code class="text-sm font-mono">${escapeHtml(
          text,
        )}</code></pre>`
      }

      case 'linebreak':
        return '<br />'

      case 'upload': {
        const value = node.value
        if (value && typeof value === 'object' && value.url) {
          const alt = escapeHtml(value.alt || '')
          const url = escapeHtmlAttr(value.url)
          const width = value.width || 1200
          const height = value.height || 800
          return `
            <figure class="my-6">
              <div class="relative w-full h-auto rounded-lg overflow-hidden">
                <img src="${url}" alt="${alt}" width="${width}" height="${height}" class="w-full h-auto object-cover rounded-lg" loading="lazy" />
              </div>
              ${
                alt
                  ? `<figcaption class="text-sm text-gray-600 text-center mt-2 italic">${alt}</figcaption>`
                  : ''
              }
            </figure>
          `
        }
        return ''
      }

      case 'block': {
        const blockData = node.fields
        if (blockData?.blockType === 'customButton') {
          const text = escapeHtml(blockData.buttonText || 'Learn more')
          const href = escapeHtmlAttr(blockData.buttonLink || '#')
          const styleClass = getButtonStyle(blockData.buttonStyle || 'primary')
          const sizeClass = getButtonSize(blockData.buttonSize || 'medium')
          const alignment = blockData.alignment || 'left'
          const newTab = blockData.openInNewTab
            ? ' target="_blank" rel="noopener noreferrer"'
            : ''

          return `
            <div class="my-6 text-${alignment}">
              <a href="${href}" class="${styleClass} ${sizeClass}"${newTab}>
                ${text}
              </a>
            </div>
          `
        }

        if (blockData?.blockType === 'callout') {
          const type = blockData.type || 'info'
          const colors: Record<string, string> = {
            info: 'border-blue-500 bg-blue-50 text-blue-900',
            warning: 'border-yellow-500 bg-yellow-50 text-yellow-900',
            success: 'border-green-500 bg-green-50 text-green-900',
            error: 'border-red-500 bg-red-50 text-red-900',
          }
          const content = escapeHtml(blockData.content || '')

          return `<div class="my-4 border-l-4 p-4 rounded ${colors[type] || colors.info}">${content}</div>`
        }

        return ''
      }

      case 'table':
        return `<div class="overflow-x-auto my-6"><table class="min-w-full border-collapse border border-gray-300"><tbody>${serializeChildren(
          node.children,
        )}</tbody></table></div>`

      case 'tablerow':
        return `<tr class="border-b border-gray-300">${serializeChildren(node.children)}</tr>`

      case 'tablecell':
        return `<td class="border border-gray-300 px-4 py-2">${serializeChildren(node.children)}</td>`

      default:
        if (node.children && Array.isArray(node.children)) {
          return serializeChildren(node.children)
        }
        return ''
    }
  }

  const serializeTextNode = (node: any): string => {
    let text = escapeHtml(node.text || '')

    if (!text) return ''

    const wrap = (tag: string, content: string, attrs = '') => `<${tag}${attrs}>${content}</${tag}>`

    if (node.format) {
      if (node.format & 1) text = wrap('strong', text)
      if (node.format & 2) text = wrap('em', text)
      if (node.format & 8) text = wrap('u', text)
      if (node.format & 4) text = wrap('s', text)
      if (node.format & 16) text = wrap('code', text, ' class="bg-gray-100 px-1.5 py-0.5 rounded text-sm"')
      if (node.format & 32) text = wrap('sub', text)
      if (node.format & 64) text = wrap('sup', text)
    }

    if (node.style) {
      text = `<span style="color:${escapeHtmlAttr(node.style)}" class="inline">${text}</span>`
    }

    return text
  }

  const ensureHeadingId = (node: any): string => {
    if (node.id) return node.id

    const text = node.children
      ?.map((child: any) => (child.type === 'text' ? child.text : ''))
      .join('')
      .trim()

    if (text) {
      return (
        'heading-' +
        text
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
      )
    }

    return `heading-${Math.random().toString(36).slice(2, 8)}`
  }

  const escapeHtml = (str: string): string =>
    str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')

  const escapeHtmlAttr = (str: string): string => escapeHtml(String(str))

  const getButtonStyle = (style: string): string => {
    const styles: Record<string, string> = {
      primary:
        'inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition',
      secondary:
        'inline-flex items-center justify-center px-6 py-3 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-800 transition',
      outline:
        'inline-flex items-center justify-center px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition',
      ghost:
        'inline-flex items-center justify-center px-6 py-3 text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition',
    }

    return styles[style] || styles.primary
  }

  const getButtonSize = (size: string): string => {
    const sizes: Record<string, string> = {
      small: 'text-sm px-4 py-2',
      medium: 'text-base',
      large: 'text-lg px-8 py-4',
    }
    return sizes[size] || sizes.medium
  }

  return serializeChildren(content.root.children)
}
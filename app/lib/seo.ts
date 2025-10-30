// app/lib/seo.ts
import { load } from 'cheerio';

export interface RankMathHead {
  head: string;
}


const MOCK_MAP: Record<string, string> = {
  home: 'https://mocki.io/v1/8c4fdf75-2203-4ddf-90f7-284959ef27fe', 
  features: 'https://mocki.io/v1/8c4fdf75-2203-4ddf-90f7-284959ef27fe',
  pricing: 'https://mocki.io/v1/4bae5d1a-0efb-4330-8474-8ba64bc5a2db', 
  about: 'https://mocki.io/v1/7762222e-b9d1-4aba-978a-308592eca7ac',
};

export async function getRankMathSEO(url: string): Promise<RankMathHead> {
  const path = new URL(url).pathname.slice(1) || 'home';

  const endpoint = MOCK_MAP[path] ?? MOCK_MAP['home'];

  try {
    const res = await fetch(endpoint, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error(`Mock API ${res.status}`);
    const data = await res.json();
    if (!data.head) throw new Error('Missing head field in mock response');
    return { head: data.head };
  } catch (e) {
    console.warn('Mock fetch failed → fallback', e);
    return { head: generateFallbackHead(url) };
  }
}

function generateFallbackHead(url: string): string {
  const path = new URL(url).pathname.slice(1) || 'home';
  const titles: Record<string, string> = {
    '': 'HelloBooks.ai - AI Bookkeeping Software',
    features: 'AI Features | HelloBooks.ai',
    pricing: 'Pricing Plans | HelloBooks.ai',
    about: 'About Us | HelloBooks.ai',
  };
  const descs: Record<string, string> = {
    '': 'Automate invoicing, payments, and reports with AI.',
    features: 'AI-powered categorization, OCR, reporting, and more.',
    pricing: 'Free, Pro, and Enterprise plans for all business sizes.',
    about: 'Meet the team behind the AI.',
  };

  const title = titles[path] ?? 'HelloBooks.ai';
  const desc = descs[path] ?? 'AI-powered bookkeeping';

  return `
    <title>${title}</title>
    <meta name="description" content="${desc}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${desc}">
    <meta property="og:image" content="https://hellobooks.ai/og-default.png">
    <meta name="twitter:card" content="summary_large_image">
    <link rel="canonical" href="${url}">
  `.trim();
}

export function parseHeadHTML(headHTML: string) {
  const $ = load(headHTML);
  const get = (selector: string, attr = 'content') => $(selector).attr(attr) ?? '';

  return {
    title: $('title').text(),
    description: get('meta[name="description"]'),
    ogTitle: get('meta[property="og:title"]'),
    ogDesc: get('meta[property="og:description"]'),
    ogImage: get('meta[property="og:image"]'),
    twitterTitle: get('meta[name="twitter:title"]'),
    twitterDesc: get('meta[name="twitter:description"]'),
    twitterImage: get('meta[name="twitter:image"]'),
    canonical: $('link[rel="canonical"]').attr('href') ?? '',
  };
}

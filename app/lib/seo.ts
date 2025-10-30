import { load } from 'cheerio';   

export interface RankMathHead {
  head: string;
}


const USE_REAL_RANKMATH = false;                                   
const MOCK_API_URL = 'https://mocki.io/v1/8c4fdf75-2203-4ddf-90f7-284959ef27fe'; 



export async function getRankMathSEO(url: string): Promise<RankMathHead> {
  const path = new URL(url).pathname.slice(1) || 'home';


  if (USE_REAL_RANKMATH) {
    const wpUrl = process.env.WORDPRESS_URL!;
    const apiUrl = `${wpUrl}/wp-json/rankmath/v1/getHead?url=${encodeURIComponent(url)}`;

    try {
      const res = await fetch(apiUrl, {
        next: { revalidate: 3600 },
        headers: { 'User-Agent': 'HelloBooksBot/1.0' },
      });

      if (!res.ok && res.status !== 429) {
        throw new Error(`RankMath API ${res.status}`);
      }
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Real RankMath failed → fallback', e);
    }
  }


  const endpoint = `${MOCK_API_URL}/${path}.json`;
  try {
    const res = await fetch(endpoint, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error(`Mock ${res.status}`);
    const data = await res.json();
    if (!data.head) throw new Error('Missing head field');
    return { head: data.head };
  } catch (e) {
    console.warn('Mock fetch failed → fallback', e);
  }


  return { head: generateFallbackHead(url) };
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
    robots: {
      index: !headHTML.includes('noindex'),
      follow: !headHTML.includes('nofollow'),
    },
  };
}
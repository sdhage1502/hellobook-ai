
import { getRankMathSEO, parseHeadHTML } from '../lib/seo';
import type { Metadata } from 'next';


export async function generateMetadata({ params }: { params: { slug?: string[] } }): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hellobooks.ai';
  const path = params.slug?.join('/') || 'home';
  const url = `${baseUrl}/${path}`;

  try {
    const { head } = await getRankMathSEO(url);
    const seo = parseHeadHTML(head);

    return {
      title: seo.title || `${path} | HelloBooks.ai`,
      description: seo.description || 'AI-powered bookkeeping tools for smart businesses.',
      openGraph: {
        title: seo.ogTitle || seo.title,
        description: seo.ogDesc || seo.description,
        images: seo.ogImage ? [{ url: seo.ogImage }] : undefined,
        url,
      },
      twitter: {
        title: seo.twitterTitle || seo.ogTitle,
        description: seo.twitterDesc || seo.ogDesc,
        images: seo.twitterImage ? [seo.twitterImage] : undefined,
      },
      alternates: { canonical: seo.canonical || url },
    };
  } catch (e) {
    console.warn('SEO metadata failed:', e);
    return {
      title: `${path} | HelloBooks.ai`,
      description: 'Default fallback SEO metadata.',
    };
  }
}


export async function generateStaticParams() {
  return [
    { slug: ['features'] },
    { slug: ['pricing'] },
    { slug: ['about'] },
  ];
}

export default async function Page({ params }: { params: { slug?: string[] } }) {
  const path = params.slug?.join('/') || 'home';


  const readableTitle = path
    .split('/')
    .map((w) => w.replace(/-/g, ' '))
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return (
    <main className="container mx-auto p-8 text-center">
      <h1 className="text-4xl font-bold text-gray-900">
        {readableTitle} Page
      </h1>
      <p className="mt-4 text-lg text-gray-600">
        SEO metadata RankMath API 
      </p>
    </main>
  );
}

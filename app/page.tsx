import { Metadata } from 'next';
import { getRankMathSEO, parseHeadHTML } from './lib/seo';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { FloatingButtons } from './components/FloatingButtons';

export async function generateMetadata(): Promise<Metadata> {
  const url = process.env.NEXT_PUBLIC_SITE_URL || 'https://hellobooks.ai';
  const { head } = await getRankMathSEO(url);
  const seo = parseHeadHTML(head);

  return {
    title: seo.title,
    description: seo.description,
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
}

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <HeroSection />
      <FloatingButtons />
    </div>
  );
}
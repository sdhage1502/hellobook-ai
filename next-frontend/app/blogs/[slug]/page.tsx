import { getBlog, getCompleteBlogSEO } from "@/app/lib/payloadClient";
import { lexicalToHtml, processContentWithInternalLinks } from "@/app/lib/internalLinking";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Header } from "@/app/components/Header";
import Breadcrumb from "@/app/components/blog/Breadcrumb";
import TableOfContents from "@/app/components/blog/TableOfContents";
import { FAQSection } from "@/app/components/blog/FAQSection";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getBlog(slug);

  if (!blog) {
    return { title: "Blog Not Found" };
  }

  // Get complete SEO data (merges blog SEO + SEO Pages + SEO Images)
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://yourdomain.com";
  const seo = await getCompleteBlogSEO(blog, site);
  const baseUrl = site;
  const canonical = seo.canonical || `${baseUrl}/blogs/${slug}`;

  // Get OG image URL (prioritize SEO images)
  const ogImageUrl = seo.ogImage?.url || 
    (typeof blog.featuredImage === "object" && blog.featuredImage?.url ? blog.featuredImage.url : undefined);

  // Build robots meta tag
  const robotsDirectives = [];
  if (seo.robotsIndex === false) robotsDirectives.push("noindex");
  if (seo.robotsFollow === false) robotsDirectives.push("nofollow");
  const robots = robotsDirectives.length > 0 ? robotsDirectives.join(", ") : undefined;

  return {
    title: seo.title || blog.title,
    description: typeof seo.description === 'string' ? seo.description : typeof blog.excerpt === 'string' ? blog.excerpt : undefined,
    keywords: seo.keywords?.join(", ") || undefined,
    authors: blog.author && typeof blog.author === "object" ? [{ name: blog.author.email }] : undefined,
    alternates: { canonical },
    robots,
    openGraph: {
      title: seo.title || blog.title,
      description: (seo.description as string | undefined) || (blog.excerpt as string | undefined),
      url: canonical, 
      images: ogImageUrl ? [{ url: ogImageUrl, width: 1200, height: 630, alt: blog.title }] : [],
      type: "article",
      publishedTime: blog.publishedAt || blog.createdAt,
      modifiedTime: blog.updatedAt,
      authors: blog.author && typeof blog.author === "object" ? [blog.author.email] : undefined,
      tags: blog.tags?.map((t: { tag: string }) => t.tag) ?? undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title || blog.title,
      description: typeof seo.description === 'string' ? seo.description : typeof blog.excerpt === 'string' ? blog.excerpt : undefined,
      images: ogImageUrl ? [ogImageUrl] : undefined,
    },
    // Future: Add more (e.g., structuredData injection)
  };
}

export default async function BlogDetails({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://yourdomain.com";
  const blog = await getBlog(slug);

  if (!blog) {
    return (
      <>
        <Header />
        <main className="max-w-4xl mx-auto px-6 py-20 text-center text-gray-500">
          <h2 className="text-2xl font-semibold mb-3">404 – Blog Not Found</h2>
          <p className="mb-6">The blog you&apos;re looking for doesn&apos;t exist or isn&apos;t published.</p>
          <Link href="/blogs" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Back to Blogs
          </Link>
        </main>
      </>
    );
  }

  // Get complete SEO data
  const seo = await getCompleteBlogSEO(blog, site);

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Blogs", href: "/blogs" },
    { label: blog.title, href: `/blogs/${slug}` },
  ];

  // Format published date
  const publishedDate = blog.publishedAt
    ? new Date(blog.publishedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  // Process content with internal linking (future-proof: logs stats if needed)
  const rawHtml = lexicalToHtml(blog.content);
  // If you need rules, uncomment and fix usage: const rules = await getInternalLinkRules(site);
  const { processedHtml, stats } = await processContentWithInternalLinks(rawHtml, site, undefined);
  if (process.env.NODE_ENV === 'production' && stats?.totalLinksInjected > 0) {
    console.log(`Injected ${stats.totalLinksInjected} internal links for ${slug}`);
  }

  return (
    <>
      <Header />

      <main className="max-w-7xl mx-auto px-6 md:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8 lg:gap-12">
          {/* TOC Sidebar */}
          <aside className="hidden lg:block lg:order-1 sticky top-8">
            <TableOfContents contentRef={undefined} /> {/* Pass ref if needed */}
          </aside>

          {/* Main Blog Content */}
          <section className="lg:order-2">
            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" className="mb-6">
              <Breadcrumb items={breadcrumbItems} />
            </nav>

            {/* Blog Meta */}
            <header className="mb-8">
              {blog.author && typeof blog.author === "object" && (
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <span>By {typeof blog.author === "object" ? blog.author.email : blog.author}</span>
                  {publishedDate && <span className="mx-2">•</span>}
                  {publishedDate && <time dateTime={typeof blog.publishedAt === 'string' ? blog.publishedAt : undefined}>{publishedDate}</time>}
                </div>
              )}
              {!publishedDate && blog.author && (
                <div className="text-sm text-gray-500 mb-4">By {typeof blog.author === 'object' ? blog.author.email : blog.author}</div>
              )}
              {blog.categories && blog.categories.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {blog.categories.slice(0, 3).map((cat: { category: string }, index: number) => (
                    <Link
                      key={index}
                      href={`/blogs?category=${encodeURIComponent(cat.category)}`}
                      className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 transition-colors"
                    >
                      {cat.category}
                    </Link>
                  ))}
                </div>
              )}
            </header>

            {/* Featured Image (optimized) */}
            {typeof blog.featuredImage === "object" && blog.featuredImage?.url && (
              <div className="relative w-full h-[400px] md:h-[500px] mb-10 rounded-xl overflow-hidden shadow-lg">
                <Image
                  src={blog.featuredImage.url}
                  alt={blog.featuredImage.alt || blog.title}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                />
              </div>
            )}

            {/* Blog Content with Internal Linking */}
            <article
              className="prose prose-lg max-w-none prose-img:rounded-xl prose-headings:font-bold prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline mb-12"
              id="blog-content"
              dangerouslySetInnerHTML={{ __html: processedHtml }}
            />

            {/* FAQ Section */}
            {blog.faq && blog.faq.length > 0 && <FAQSection faqs={blog.faq} />}

            {/* Schema.org JSON-LD for FAQ */}
            {blog.faq && blog.faq.length > 0 && (
              <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                  __html: JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "FAQPage",
                    mainEntity: blog.faq.map((faq) => ({
                      "@type": "Question",
                      name: faq.question,
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: lexicalToHtml(faq.answer),
                      },
                    })),
                  }),
                }}
              />
            )}

            {/* Schema.org JSON-LD for Article */}
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "BlogPosting",
                  headline: blog.title,
                  description: seo.description || blog.excerpt,
                  image: typeof blog.featuredImage === "object" && blog.featuredImage?.url
                    ? {
                        "@type": "ImageObject",
                        url: blog.featuredImage.url,
                        width: blog.featuredImage.width || 1200,
                        height: blog.featuredImage.height || 630,
                      }
                    : undefined,
                  datePublished: blog.publishedAt || blog.createdAt,
                  dateModified: blog.updatedAt,
                  author: blog.author && typeof blog.author === "object"
                    ? {
                        "@type": "Person",
                        name: blog.author.email,
                      }
                    : undefined,
                  keywords: seo.keywords?.join(", "),
                  ...(seo.structuredData || {}), // Merge additional from SEO Pages
                }),
              }}
            />

            {/* Back to Blogs */}
            <div className="mt-12 pt-8 border-t">
              <Link
                href="/blogs"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium group"
              >
                <svg
                  className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to all blogs
              </Link>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
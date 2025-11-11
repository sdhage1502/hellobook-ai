import { getBlog } from "@/app/lib/payloadClient";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { RenderLexicalRichText } from "@/app/components/rich-text/RichTextRenderer";
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

  if (!blog) return { title: "Blog Not Found" };

  const meta = blog.meta || {};
  const ogImageUrl =
    typeof meta.ogImage === "object" && meta.ogImage?.url
      ? meta.ogImage.url
      : blog.featuredImage && typeof blog.featuredImage === "object"
      ? blog.featuredImage.url
      : undefined;

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://yourdomain.com";
  const canonical =
    meta.canonical && meta.canonical.trim() !== ""
      ? meta.canonical
      : `${baseUrl}/blogs/${slug}`;

  // Extract keywords from the meta.keywords array
  const keywords = meta.keywords?.map((k) => k.keyword).join(", ") || undefined;

  // Build robots meta tag
  const robotsDirectives = [];
  if (meta.robotsIndex === false) robotsDirectives.push("noindex");
  if (meta.robotsFollow === false) robotsDirectives.push("nofollow");
  const robots =
    robotsDirectives.length > 0 ? robotsDirectives.join(", ") : undefined;

  return {
    title: meta.title ?? blog.title ?? "Untitled Blog",
    description: meta.description ?? blog.excerpt ?? undefined,
    keywords: keywords,
    authors:
      blog.author && typeof blog.author === "object"
        ? [{ name: blog.author.email }]
        : undefined,
    alternates: { canonical },
    robots: robots,
    openGraph: {
      title: meta.title ?? blog.title,
      description: meta.description ?? blog.excerpt ?? undefined,
      url: canonical,
      images: ogImageUrl ? [{ url: ogImageUrl }] : [],
      type: "article",
      publishedTime: blog.publishedAt || blog.createdAt,
      modifiedTime: blog.updatedAt,
      authors:
        blog.author && typeof blog.author === "object"
          ? [blog.author.email]
          : undefined,
      tags: blog.tags?.map((t) => t.tag) || undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title ?? blog.title,
      description: meta.description ?? blog.excerpt ?? undefined,
      images: ogImageUrl ? [ogImageUrl] : undefined,
    },
  };
}

export default async function BlogDetails({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const blog = await getBlog(slug);

  if (!blog) {
    return (
      <>
        <Header />
        <main className="max-w-4xl mx-auto px-6 py-20 text-center text-gray-500">
          <h2 className="text-2xl font-semibold mb-3">404 — Blog Not Found</h2>
          <p className="mb-6">
            The blog you&apos;re looking for doesn&apos;t exist or isn&apos;t
            published.
          </p>
          <Link
            href="/blogs"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Blogs
          </Link>
        </main>
      </>
    );
  }

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Blogs", href: "/blogs" },

    { label: blog.title },
  ];

  // Format published date
  const publishedDate = blog.publishedAt
    ? new Date(blog.publishedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <>
      <Header />

      <main className="max-w-7xl mx-auto px-6 md:px-8 py-10 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-10">
        {/* TOC Sidebar */}
        <aside className="hidden lg:block">
          <TableOfContents />
        </aside>

        {/* Main Blog Content */}
        <section>
          <Breadcrumb items={breadcrumbItems} />

          {/* Blog Header */}
          <header className="mb-8">
            {/* Categories */}
            {blog.categories && blog.categories.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {blog.categories.map((cat, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full"
                  >
                    {cat.category}
                  </span>
                ))}
              </div>
            )}

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              {blog.title}
            </h1>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
              {publishedDate && (
                <time dateTime={blog.publishedAt || ""}>{publishedDate}</time>
              )}
              {blog.author && typeof blog.author === "object" && (
                <span>By {blog.author.email}</span>
              )}
            </div>

            {/* Excerpt */}
            {blog.excerpt && (
              <p className="text-xl text-gray-600 leading-relaxed">
                {blog.excerpt}
              </p>
            )}

            {/* Tags */}
            {blog.tags && blog.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {blog.tags.map((tag, index) => (
                  <Link
                    key={index}
                    href={`/blogs/tag/${encodeURIComponent(tag.tag)}`}
                    className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                  >
                    #{tag.tag}
                  </Link>
                ))}
              </div>
            )}
          </header>

          {/* Hero Image */}
          {typeof blog.featuredImage === "object" &&
            blog.featuredImage?.url && (
              <div className="relative w-full h-[400px] md:h-[500px] mb-10 rounded-xl overflow-hidden shadow-lg">
                <Image
                  src={blog.featuredImage.url ||"/hero.jpeg"}
                  alt={blog.featuredImage.alt || blog.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}

          {/* Blog Content */}
          <article
            className="prose prose-lg max-w-none prose-img:rounded-xl prose-headings:font-bold prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline mb-12"
            id="blog-content"
          >
            <RenderLexicalRichText content={blog.content} />
          </article>

          {/* FAQ Section - New Feature */}
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
                      text: faq.answer,
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
                description: blog.excerpt,
                image:
                  typeof blog.featuredImage === "object"
                    ? blog.featuredImage?.url
                    : undefined,
                datePublished: blog.publishedAt || blog.createdAt,
                dateModified: blog.updatedAt,
                author:
                  blog.author && typeof blog.author === "object"
                    ? {
                        "@type": "Person",
                        name: blog.author.email,
                      }
                    : undefined,
                keywords: blog.meta?.keywords?.map((k) => k.keyword).join(", "),
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
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              
              Back to all blogs
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
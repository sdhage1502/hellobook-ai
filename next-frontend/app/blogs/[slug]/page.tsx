import { getBlog } from "@/app/lib/payloadClient";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { RenderLexicalRichText } from "@/app/components/rich-text/RichTextRenderer";
import {Header} from "@/app/components/Header"; 
import Breadcrumb from "@/app/components/ui/Breadcrumb";

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

  return {
    title: meta.title ?? blog.title ?? "Untitled Blog",
    description: meta.description ?? blog.excerpt ?? undefined,
    alternates: { canonical },
    openGraph: {
      title: meta.title ?? blog.title,
      description: meta.description ?? blog.excerpt ?? undefined,
      url: canonical,
      images: ogImageUrl ? [{ url: ogImageUrl }] : [],
      type: "article",
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
          <h2 className="text-2xl font-semibold mb-3">404 – Blog Not Found</h2>
          <p className="mb-6">
            The blog you're looking for doesn't exist or isn't published.
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

  return (
    <>
      <Header />
      
      <main className="max-w-4xl mx-auto px-6 py-10">
        {/* Breadcrumbs */}
        <Breadcrumb items={breadcrumbItems} />

        {/* Title & Excerpt */}
        <header className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            {blog.title}
          </h1>
          {blog.excerpt && (
            <p className="text-xl text-gray-600 leading-relaxed">
              {blog.excerpt}
            </p>
          )}
        </header>

        {/* Hero Image */}
        {typeof blog.featuredImage === "object" && blog.featuredImage?.url && (
          <div className="relative w-full h-[400px] md:h-[500px] mb-10 rounded-xl overflow-hidden shadow-lg">
            <Image
              src={blog.featuredImage.url}
              alt={blog.featuredImage.alt || blog.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Blog Content */}
        <article className="prose prose-lg max-w-none prose-img:rounded-xl prose-headings:font-bold prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline">
          <RenderLexicalRichText content={blog.content} />
        </article>

        {/* Back to Blogs Link */}
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
      </main>
    </>
  );
}
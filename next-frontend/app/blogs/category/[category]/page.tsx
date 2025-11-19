import { getBlogsByCategory, getStaticPageSEO, getInternalLinkRules } from "@/app/lib/payloadClient";
import { lexicalToHtml, processContentWithInternalLinks } from "@/app/lib/internalLinking";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Header } from "@/app/components/Header";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const decodedCategory = decodeURIComponent(category);
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://yourdomain.com";
  const seo = await getStaticPageSEO(`/blogs/category/${decodedCategory}`, site);

  return {
    title: seo?.title || `${decodedCategory} | Blog Categories`,
    description: seo?.description || `Browse all blog posts in the ${decodedCategory} category.`,
    keywords: seo?.keywords?.join(", ") || undefined,
    openGraph: {
      title: seo?.title || `${decodedCategory} | Blog Categories`,
      description: seo?.description || `Browse all blog posts in the ${decodedCategory} category.`,
      url: `${site}/blogs/category/${decodedCategory}`,
      images: seo?.ogImage ? [{ url: seo.ogImage.url, width: 1200, height: 630 }] : [],
    },
    // Future: robots, twitter from seo
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const decodedCategory = decodeURIComponent(category);
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://yourdomain.com";
  const rules = await getInternalLinkRules(site);

  const blogs = await getBlogsByCategory(decodedCategory, 100); // Limit for perf; add pagination later

  // Process excerpts with linking
  const processedBlogs = await Promise.all(
    blogs.map(async (blog: any) => {
      if (blog.excerpt) {
        const mockContent = { root: { children: [{ type: 'paragraph', children: [{ type: 'text', text: blog.excerpt }] }] } };
        const rawExcerpt = lexicalToHtml(mockContent);
        const { processedHtml: linkedExcerpt } = await processContentWithInternalLinks(rawExcerpt, site, rules);
        return { ...blog, linkedExcerpt };
      }
      return blog;
    })
  );

  return (
    <>
      <Header />

      <main className="max-w-7xl mx-auto px-6 md:px-8 py-10">
        {/* Header Section */}
        <div className="mb-12">
          <Link
            href="/blogs"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4 font-medium"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to all blogs
          </Link>

          <h1 className="text-4xl md:text-5xl font-bold mb-4">Category: {decodedCategory}</h1>
          <p className="text-xl text-gray-600">
            {processedBlogs.length} {processedBlogs.length === 1 ? "post" : "posts"} found
          </p>
        </div>

        {/* Blog Grid */}
        {processedBlogs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {processedBlogs.map((blog: any) => {
              const featuredImage = typeof blog.featuredImage === "object" && blog.featuredImage?.url ? blog.featuredImage : null;
              const publishedDate = blog.publishedAt
                ? new Date(blog.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
                : null;

              return (
                <article
                  key={blog.id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden group"
                >
                  <Link href={`/blogs/${blog.slug}`}>
                    {/* Featured Image */}
                    {featuredImage ? (
                      <div className="relative w-full h-48 overflow-hidden bg-gray-100">
                        <Image
                          src={featuredImage.url ?? ""}
                          alt={featuredImage.alt || blog.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <svg className="w-16 h-16 text-white opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}

                    {/* Content */}
                    <div className="p-6">
                      {/* Title */}
                      <h2 className="text-xl font-bold mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {blog.title}
                      </h2>

                      {/* Excerpt */}
                      {blog.linkedExcerpt ? (
                        <div className="text-gray-600 line-clamp-3 mb-4" dangerouslySetInnerHTML={{ __html: blog.linkedExcerpt }} />
                      ) : blog.excerpt ? (
                        <p className="text-gray-600 line-clamp-3 mb-4">{blog.excerpt}</p>
                      ) : null}

                      {/* Meta Info */}
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        {publishedDate && <time>{publishedDate}</time>}
                        <span className="text-blue-600 font-medium group-hover:underline">Read more →</span>
                      </div>
                    </div>
                  </Link>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-6">No blog posts found in this category.</p>
            <Link href="/blogs" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              View all blogs
            </Link>
          </div>
        )}
      </main>
    </>
  );
}
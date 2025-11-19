import Link from "next/link";
import Image from "next/image";
import { getBlogs, getAllCategories, getAllTags, getStaticPageSEO, getInternalLinkRules } from "@/app/lib/payloadClient";
import { lexicalToHtml, processContentWithInternalLinks } from "@/app/lib/internalLinking"; // For excerpts
import { Header } from "@/app/components/Header";
import Pagination from "@/app/components/blog/Pagination";
import { SearchBar } from "@/app/components/ui/SearchBar";
import type { Metadata } from "next";

interface BlogsPageProps {
  searchParams: Promise<{ page?: string; search?: string; category?: string; tag?: string }>;
}

export async function generateMetadata({ searchParams }: BlogsPageProps): Promise<Metadata> {
  const resolvedParams = await searchParams;
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://yourdomain.com";
  let slug = "/blogs";
  if (resolvedParams.category) slug = `/blogs/category/${resolvedParams.category}`;
  if (resolvedParams.tag) slug = `/blogs/tag/${resolvedParams.tag}`;
  if (resolvedParams.search) slug = `/blogs/search?q=${resolvedParams.search}`;

  const seo = await getStaticPageSEO(slug, site);

  return {
    title: seo?.title || "Blog | Latest Articles & Insights",
    description: seo?.description || "Discover our latest blog posts, tutorials, and insights on technology, development, and more.",
    keywords: seo?.keywords?.join(", ") || undefined,
    openGraph: {
      title: seo?.title || "Blog | Latest Articles & Insights",
      description: seo?.description || "Discover our latest blog posts, tutorials, and insights on technology, development, and more.",
      url: `${site}/blogs`,
      images: seo?.ogImage ? [{ url: seo.ogImage.url, width: 1200, height: 630 }] : [],
    },
    // Future: robots, twitter from seo
  };
}

export default async function BlogsPage({ searchParams }: BlogsPageProps) {
  const resolvedParams = await searchParams;
  const currentPage = Number(resolvedParams.page) || 1;
  const searchQuery = resolvedParams.search || "";
  const selectedCategory = resolvedParams.category || "";
  const selectedTag = resolvedParams.tag || "";
  const blogsPerPage = 9;
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://yourdomain.com";
  const rules = await getInternalLinkRules(site); // Cache: 1800s

  // Get blogs with pagination and search from API
  const { blogs, totalPages, totalDocs } = await getBlogs(currentPage, blogsPerPage, searchQuery);

  // Server-side filter by category/tag (future: enhance API for this)
  let filteredBlogs = blogs;
  if (selectedCategory) {
    filteredBlogs = filteredBlogs.filter((blog: any) => blog.categories?.some((cat: any) => cat.category === selectedCategory));
  }
  if (selectedTag) {
    filteredBlogs = filteredBlogs.filter((blog: any) => blog.tags?.some((tag: any) => tag.tag === selectedTag));
  }

  // Apply internal linking to excerpts (simple text simulation)
  const processedBlogs = await Promise.all(
    filteredBlogs.map(async (blog: any) => {
      if (blog.excerpt) {
        const mockContent = { root: { children: [{ type: 'paragraph', children: [{ type: 'text', text: blog.excerpt }] }] } };
        const rawExcerpt = lexicalToHtml(mockContent); // Assume lexicalToHtml handles simple text
        const { processedHtml: linkedExcerpt } = await processContentWithInternalLinks(rawExcerpt, site, rules);
        return { ...blog, linkedExcerpt };
      }
      return blog;
    })
  );

  // Get all categories and tags for filter chips
  const allCategories = await getAllCategories();
  const allTags = await getAllTags();

  const pageTitle = searchQuery
    ? "Search Results"
    : selectedCategory
    ? `Category: ${selectedCategory}`
    : selectedTag
    ? `Tag: #${selectedTag}`
    : "Latest Blogs";

  return (
    <>
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Page Header with Search */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
            {/* Title */}
            <div className="shrink-0">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
                {pageTitle}
              </h1>
              <p className="text-base sm:text-lg text-gray-600 mt-2">
                {searchQuery
                  ? `Found ${totalDocs} ${totalDocs === 1 ? "result" : "results"}`
                  : selectedCategory || selectedTag
                  ? `${processedBlogs.length} ${processedBlogs.length === 1 ? "post" : "posts"} found`
                  : "Discover insights, stories, and updates"}
              </p>
            </div>

            {/* Search Bar */}
            <div className="lg:w-96">
              <SearchBar placeholder="Search blogs..." basePath="/blogs" compact={true} />
            </div>
          </div>

          {/* Filter Chips */}
          {(allCategories.length > 0 || allTags.length > 0) && (
            <div className="space-y-4">
              {/* Categories */}
              {allCategories.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Categories:</h3>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href="/blogs"
                      className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                        !selectedCategory ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      All
                    </Link>
                    {allCategories.slice(0, 10).map((category: string) => (
                      <Link
                        key={category}
                        href={`/blogs?category=${encodeURIComponent(category)}`}
                        className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                          selectedCategory === category
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {category}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {allTags.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Tags:</h3>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href="/blogs"
                      className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                        !selectedTag ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      All
                    </Link>
                    {allTags.slice(0, 10).map((tag: string) => (
                      <Link
                        key={tag}
                        href={`/blogs?tag=${encodeURIComponent(tag)}`}
                        className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                          selectedTag === tag
                            ? "bg-purple-600 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        #{tag}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Blogs Grid */}
          {processedBlogs.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {processedBlogs.map((blog: any) => (
                  <article key={blog.id} className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                    {/* Featured Image */}
                    {typeof blog.featuredImage === "object" && blog.featuredImage?.url ? (
                      <div className="relative w-full h-48 overflow-hidden bg-gray-100">
                        <Image
                          src={blog.featuredImage.url}
                          alt={blog.featuredImage.alt || blog.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <svg className="w-12 h-12 text-white opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}

                    {/* Card Content */}
                    <div className="flex flex-col grow p-5">
                      {/* Categories */}
                      {blog.categories && blog.categories.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {blog.categories.slice(0, 2).map((cat: any, index: number) => (
                            <Link
                              key={index}
                              href={`/blogs?category=${encodeURIComponent(cat.category)}`}
                              className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors"
                            >
                              {cat.category}
                            </Link>
                          ))}
                        </div>
                      )}

                      <Link href={`/blogs/${blog.slug}`} className="group">
                        <h2 className="text-xl font-semibold mb-2 text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                          {blog.title}
                        </h2>
                      </Link>

                      {/* Excerpt with Internal Linking */}
                      {blog.linkedExcerpt ? (
                        <div
                          className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed grow"
                          dangerouslySetInnerHTML={{ __html: blog.linkedExcerpt }}
                        />
                      ) : blog.excerpt ? (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed grow">
                          {blog.excerpt}
                        </p>
                      ) : null}

                      <Link
                        href={`/blogs/${blog.slug}`}
                        className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm group mt-auto"
                      >
                        Read More
                        <svg className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  </article>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && !selectedCategory && !selectedTag && (
                <div className="flex justify-center mt-12">
                  <Pagination currentPage={currentPage} totalPages={totalPages} basePath="/blogs" searchQuery={searchQuery} />
                </div>
              )}
            </>
          ) : (
            /* Empty State */
            <div className="text-center py-16 max-w-md mx-auto">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-lg text-gray-600 mb-2">
                {searchQuery ? `No results found for "${searchQuery}"` : selectedCategory || selectedTag ? "No blogs found with this filter" : "No blogs found"}
              </p>
              <p className="text-sm text-gray-500 mb-6">
                {searchQuery || selectedCategory || selectedTag ? "Try adjusting your filters" : "Check back soon for new content!"}
              </p>
              {(searchQuery || selectedCategory || selectedTag) && (
                <Link href="/blogs" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  View all blogs
                </Link>
              )}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
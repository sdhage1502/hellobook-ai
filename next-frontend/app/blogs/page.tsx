import Link from "next/link";
import Image from "next/image";
import { getBlogs, getAllCategories, getAllTags } from "@/app/lib/payloadClient";
import { Header } from "@/app/components/Header";
import Pagination from "@/app/components/blog/Pagination";
import { SearchBar } from "@/app/components/ui/SearchBar";
import type { Metadata } from "next";

interface BlogsPageProps {
  searchParams: Promise<{ page?: string; search?: string; category?: string; tag?: string }>;
}

export const metadata: Metadata = {
  title: "Blog | Latest Articles & Insights",
  description:
    "Discover our latest blog posts, tutorials, and insights on technology, development, and more.",
};

export default async function BlogsPage({ searchParams }: BlogsPageProps) {
  const resolvedParams = await searchParams;
  const currentPage = Number(resolvedParams.page) || 1;
  const searchQuery = resolvedParams.search || "";
  const selectedCategory = resolvedParams.category || "";
  const selectedTag = resolvedParams.tag || "";
  const blogsPerPage = 9;

  // Get blogs with pagination and search from API
  const { blogs, totalPages, totalDocs } = await getBlogs(
    currentPage,
    blogsPerPage,
    searchQuery
  );

  // Filter by category/tag on client side (or modify API to support this)
  let filteredBlogs = blogs;
  if (selectedCategory) {
    filteredBlogs = filteredBlogs.filter((blog) =>
      blog.categories?.some((cat) => cat.category === selectedCategory)
    );
  }
  if (selectedTag) {
    filteredBlogs = filteredBlogs.filter((blog) =>
      blog.tags?.some((tag) => tag.tag === selectedTag)
    );
  }

  // Get all categories and tags for filter chips
  const allCategories = await getAllCategories();
  const allTags = await getAllTags();

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
                {searchQuery
                  ? "Search Results"
                  : selectedCategory
                  ? `Category: ${selectedCategory}`
                  : selectedTag
                  ? `Tag: #${selectedTag}`
                  : "Latest Blogs"}
              </h1>
              <p className="text-base sm:text-lg text-gray-600 mt-2">
                {searchQuery
                  ? `Found ${totalDocs} ${totalDocs === 1 ? "result" : "results"}`
                  : selectedCategory || selectedTag
                  ? `${filteredBlogs.length} ${filteredBlogs.length === 1 ? "post" : "posts"} found`
                  : "Discover insights, stories, and updates"}
              </p>
            </div>

            {/* Search Bar */}
            <div className="lg:w-96">
              <SearchBar
                placeholder="Search blogs..."
                basePath="/blogs"
                compact={true}
              />
            </div>
          </div>

          {/* Filter Chips */}
          {(allCategories.length > 0 || allTags.length > 0) && (
            <div className="space-y-4">
              {/* Categories */}
              {allCategories.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">
                    Categories:
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href="/blogs"
                      className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                        !selectedCategory
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      All
                    </Link>
                    {allCategories.slice(0, 10).map((category) => (
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
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">
                    Popular Tags:
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {allTags.slice(0, 15).map((tag) => (
                      <Link
                        key={tag}
                        href={`/blogs?tag=${encodeURIComponent(tag)}`}
                        className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                          selectedTag === tag
                            ? "bg-purple-600 text-white"
                            : "bg-purple-50 text-purple-700 hover:bg-purple-100"
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
        </div>

        {/* Blog Grid */}
        {filteredBlogs.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-12">
              {filteredBlogs.map((blog) => (
                <article
                  key={blog.id}
                  className="flex flex-col border border-gray-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 hover:-translate-y-1 bg-white"
                >
                  {/* Featured Image */}
                  {typeof blog.featuredImage === "object" &&
                  blog.featuredImage?.url ? (
                    <Link
                      href={`/blogs/${blog.slug}`}
                      className="block relative w-full h-52 overflow-hidden bg-gray-100"
                    >
                      <Image
                        src={blog.featuredImage.url}
                        alt={blog.featuredImage.alt || blog.title}
                        fill
                        className="object-cover transition-transform duration-300 hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </Link>
                  ) : (
                    <div className="w-full h-52 bg-linear-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                      <svg
                        className="w-16 h-16 text-blue-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                        />
                      </svg>
                    </div>
                  )}

                  {/* Card Content */}
                  <div className="flex flex-col grow p-5">
                    {/* Categories */}
                    {blog.categories && blog.categories.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {blog.categories.slice(0, 2).map((cat, index) => (
                          <span
                            key={index}
                            className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded"
                          >
                            {cat.category}
                          </span>
                        ))}
                      </div>
                    )}

                    <Link href={`/blogs/${blog.slug}`} className="group">
                      <h2 className="text-xl font-semibold mb-2 text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {blog.title}
                      </h2>
                    </Link>

                    {blog.excerpt && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed grow">
                        {blog.excerpt}
                      </p>
                    )}

                    <Link
                      href={`/blogs/${blog.slug}`}
                      className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm group mt-auto"
                    >
                      Read More
                      <svg
                        className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && !selectedCategory && !selectedTag && (
              <div className="flex justify-center">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  basePath="/blogs"
                  searchQuery={searchQuery}
                />
              </div>
            )}
          </>
        ) : (
          /* Empty State */
          <div className="text-center py-16 max-w-md mx-auto">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <p className="text-lg text-gray-600 mb-2">
              {searchQuery
                ? `No results found for "${searchQuery}"`
                : selectedCategory || selectedTag
                ? "No blogs found with this filter"
                : "No blogs found"}
            </p>
            <p className="text-sm text-gray-500 mb-6">
              {searchQuery || selectedCategory || selectedTag
                ? "Try adjusting your filters"
                : "Check back soon for new content!"}
            </p>
            {(searchQuery || selectedCategory || selectedTag) && (
              <Link
                href="/blogs"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                View all blogs
              </Link>
            )}
          </div>
        )}
      </main>
    </>
  );
}
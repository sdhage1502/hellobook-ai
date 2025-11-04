import Link from "next/link";
import Image from "next/image";
import { getBlogs } from "@/app/lib/payloadClient";
import {Header} from "@/app/components/Header"; 
import Pagination from "@/app/components/ui/Pagination";

interface BlogsPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function BlogsPage({ searchParams }: BlogsPageProps) {
  const resolvedParams = await searchParams;
  const currentPage = Number(resolvedParams.page) || 1;
  const blogsPerPage = 9;

  const allBlogs = await getBlogs();
  
  // Calculate pagination
  const totalPages = Math.ceil(allBlogs.length / blogsPerPage);
  const startIndex = (currentPage - 1) * blogsPerPage;
  const endIndex = startIndex + blogsPerPage;
  const blogs = allBlogs.slice(startIndex, endIndex);

  return (
    <>
      <Header />
      
      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Page Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-3">Latest Blogs</h1>
          <p className="text-gray-600">
            Discover insights, stories, and updates from our blog
          </p>
        </div>

        {/* Blog Grid */}
        {blogs.length > 0 ? (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogs.map((blog) => (
                <article
                  key={blog.id}
                  className="border rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 hover:-translate-y-1"
                >
                  {typeof blog.featuredImage === "object" && blog.featuredImage?.url && (
                    <Link href={`/blogs/${blog.slug}`}>
                      <div className="relative w-full h-52 overflow-hidden">
                        <Image
                          src={blog.featuredImage.url}
                          alt={blog.featuredImage.alt || blog.title}
                          fill
                          className="object-cover transition-transform duration-300 hover:scale-105"
                        />
                      </div>
                    </Link>
                  )}
                  <div className="p-5">
                    <Link href={`/blogs/${blog.slug}`}>
                      <h2 className="text-xl font-semibold mb-2 hover:text-blue-600 transition-colors">
                        {blog.title}
                      </h2>
                    </Link>
                    {blog.excerpt && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {blog.excerpt}
                      </p>
                    )}
                    <Link
                      href={`/blogs/${blog.slug}`}
                      className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm group"
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
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              basePath="/blogs"
            />
          </>
        ) : (
          /* Empty State */
          <div className="text-center py-16 text-gray-500">
            <p className="text-lg">No blogs found.</p>
          </div>
        )}
      </main>
    </>
  );
}
import Link from "next/link";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath?: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  basePath = "/blogs",
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPageUrl = (page: number) => {
    return page === 1 ? basePath : `${basePath}?page=${page}`;
  };

  const renderPageNumbers = () => {
    const pages = [];

    for (let i = 1; i <= totalPages; i++) {
      // Show first page, last page, current page, and pages around current
      const showPage =
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - 1 && i <= currentPage + 1);

      const showEllipsis =
        (i === currentPage - 2 && currentPage > 3) ||
        (i === currentPage + 2 && currentPage < totalPages - 2);

      if (showEllipsis) {
        pages.push(
          <span key={`ellipsis-${i}`} className="px-3 py-2 text-gray-400">
            ...
          </span>
        );
        continue;
      }

      if (!showPage) continue;

      pages.push(
        <Link
          key={i}
          href={getPageUrl(i)}
          className={`px-4 py-2 rounded-lg transition-colors ${
            currentPage === i
              ? "bg-blue-600 text-white font-medium"
              : "border hover:bg-gray-50"
          }`}
          aria-current={currentPage === i ? "page" : undefined}
        >
          {i}
        </Link>
      );
    }

    return pages;
  };

  return (
    <nav
      className="flex justify-center items-center gap-2 mt-12"
      aria-label="Pagination"
    >
      {/* Previous Button */}
      {currentPage > 1 ? (
        <Link
          href={getPageUrl(currentPage - 1)}
          className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
          aria-label="Previous page"
        >
          Previous
        </Link>
      ) : (
        <span className="px-4 py-2 border rounded-lg text-gray-400 cursor-not-allowed">
          Previous
        </span>
      )}

      {/* Page Numbers */}
      <div className="flex gap-1">{renderPageNumbers()}</div>

      {/* Next Button */}
      {currentPage < totalPages ? (
        <Link
          href={getPageUrl(currentPage + 1)}
          className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
          aria-label="Next page"
        >
          Next
        </Link>
      ) : (
        <span className="px-4 py-2 border rounded-lg text-gray-400 cursor-not-allowed">
          Next
        </span>
      )}
    </nav>
  );
}
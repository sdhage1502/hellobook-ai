import { Blog } from "../../../payload-cms/src/payload-types";

const BASE_URL = process.env.NEXT_PUBLIC_PAYLOAD_URL;

// Type for the API response
interface BlogsResponse {
  docs: Blog[];
  totalDocs: number;
  limit: number;
  totalPages: number;
  page: number;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
}

// Fetch all blogs with pagination and optional search
export async function getBlogs(
  page: number = 1,
  limit: number = 20,
  searchQuery?: string
): Promise<{ blogs: Blog[]; totalPages: number; totalDocs: number }> {
  try {
    let url = `${BASE_URL}/api/blogs?limit=${limit}&page=${page}&sort=-publishedAt`;
    
    // Add search query if provided
    if (searchQuery && searchQuery.trim()) {
      const encodedQuery = encodeURIComponent(searchQuery.trim());
      url += `&where[or][0][title][contains]=${encodedQuery}`;
      url += `&where[or][1][excerpt][contains]=${encodedQuery}`;
    }

    const res = await fetch(url, {
      next: { revalidate: 600 }, // ISR every 10 minutes
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch blogs: ${res.status} ${res.statusText}`);
    }

    const data: BlogsResponse = await res.json();

    return {
      blogs: data.docs,
      totalPages: data.totalPages,
      totalDocs: data.totalDocs,
    };
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return {
      blogs: [],
      totalPages: 0,
      totalDocs: 0,
    };
  }
}

// Fetch single blog by slug
export async function getBlog(slug: string): Promise<Blog | null> {
  try {
    const res = await fetch(
      `${BASE_URL}/api/blogs?where[slug][equals]=${encodeURIComponent(slug)}&depth=2`,
      {
        next: { revalidate: 600 }, // ISR every 10 minutes
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!res.ok) {
      throw new Error(`Failed to fetch blog: ${res.status} ${res.statusText}`);
    }

    const data: BlogsResponse = await res.json();
    return data.docs?.[0] || null;
  } catch (error) {
    console.error(`Error fetching blog with slug "${slug}":`, error);
    return null;
  }
}

// Fetch blogs by category
export async function getBlogsByCategory(
  category: string,
  limit: number = 100
): Promise<Blog[]> {
  try {
    const res = await fetch(
      `${BASE_URL}/api/blogs?where[categories.category][equals]=${encodeURIComponent(
        category
      )}&limit=${limit}&sort=-publishedAt`,
      {
        next: { revalidate: 600 },
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!res.ok) {
      throw new Error(
        `Failed to fetch blogs by category: ${res.status} ${res.statusText}`
      );
    }

    const data: BlogsResponse = await res.json();
    return data.docs;
  } catch (error) {
    console.error(`Error fetching blogs for category "${category}":`, error);
    return [];
  }
}

// Fetch blogs by tag
export async function getBlogsByTag(
  tag: string,
  limit: number = 100
): Promise<Blog[]> {
  try {
    const res = await fetch(
      `${BASE_URL}/api/blogs?where[tags.tag][equals]=${encodeURIComponent(
        tag
      )}&limit=${limit}&sort=-publishedAt`,
      {
        next: { revalidate: 600 },
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!res.ok) {
      throw new Error(
        `Failed to fetch blogs by tag: ${res.status} ${res.statusText}`
      );
    }

    const data: BlogsResponse = await res.json();
    return data.docs;
  } catch (error) {
    console.error(`Error fetching blogs for tag "${tag}":`, error);
    return [];
  }
}

// Get recent blogs
export async function getRecentBlogs(limit: number = 5): Promise<Blog[]> {
  try {
    const res = await fetch(
      `${BASE_URL}/api/blogs?limit=${limit}&sort=-publishedAt`,
      {
        next: { revalidate: 300 }, // 5 minutes cache for recent blogs
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!res.ok) {
      throw new Error(
        `Failed to fetch recent blogs: ${res.status} ${res.statusText}`
      );
    }

    const data: BlogsResponse = await res.json();
    return data.docs;
  } catch (error) {
    console.error("Error fetching recent blogs:", error);
    return [];
  }
}

// Get all unique categories
export async function getAllCategories(): Promise<string[]> {
  try {
    const { blogs } = await getBlogs(1, 1000); // Fetch many blogs
    const categoriesSet = new Set<string>();

    blogs.forEach((blog) => {
      if (blog.categories && Array.isArray(blog.categories)) {
        blog.categories.forEach((cat) => {
          if (cat.category) {
            categoriesSet.add(cat.category);
          }
        });
      }
    });

    return Array.from(categoriesSet).sort();
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

// Get all unique tags
export async function getAllTags(): Promise<string[]> {
  try {
    const { blogs } = await getBlogs(1, 1000); // Fetch many blogs
    const tagsSet = new Set<string>();

    blogs.forEach((blog) => {
      if (blog.tags && Array.isArray(blog.tags)) {
        blog.tags.forEach((tag) => {
          if (tag.tag) {
            tagsSet.add(tag.tag);
          }
        });
      }
    });

    return Array.from(tagsSet).sort();
  } catch (error) {
    console.error("Error fetching tags:", error);
    return [];
  }
}
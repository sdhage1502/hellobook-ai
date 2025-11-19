import { Blog } from "../../../payload-cms/src/payload-types";

const BASE_URL = process.env.NEXT_PUBLIC_PAYLOAD_URL;

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

interface SEOPage {
  id: string;
  site: string;
  slug: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: Array<{ keyword: string }>;
  canonical?: string;
  openGraph?: {
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: any;
  };
  robots?: {
    index?: boolean;
    follow?: boolean;
  };
  schema_json?: any;
}

interface SEOImage {
  id: string;
  site: string;
  page_slug: string;
  image?: any;
  image_url?: string;
  alt_text?: string;
  caption?: string;
  tags?: Array<{ tag: string }>;
}

export interface InternalLinkRule {
  id: string;
  site: string;
  keyword: string;
  target_url: string;
  title?: string;
  nofollow?: boolean;
  priority?: number;
  max_links_per_page?: number;
  match_type?: 'word' | 'phrase' | 'regex';
  isActive?: boolean;
}

// Internal Link Rules
export async function getInternalLinkRules(site?: string): Promise<InternalLinkRule[]> {
  try {
    let url = `${BASE_URL}/api/internal-links?where[isActive][equals]=true&sort=-priority&limit=100&depth=1`;
    if (site) url += `&where[site][equals]=${encodeURIComponent(site)}`;
    const res = await fetch(url, { next: { revalidate: 1800 }, headers: { "Content-Type": "application/json" } });
    if (!res.ok) throw new Error(`Failed to fetch internal links: ${res.status}`);
    const data = await res.json();
    return data.docs || [];
  } catch (error) {
    console.error("Error fetching internal link rules:", error);
    return [];
  }
}

// Blogs
export async function getBlogs(
  page: number = 1,
  limit: number = 20,
  searchQuery?: string
): Promise<{ blogs: Blog[]; totalPages: number; totalDocs: number }> {
  try {
    let url = `${BASE_URL}/api/blogs?limit=${limit}&page=${page}&sort=-publishedAt&where[_status][equals]=published&depth=2`;
    if (searchQuery?.trim()) {
      const encodedQuery = encodeURIComponent(searchQuery.trim());
      url += `&where[or][0][title][contains]=${encodedQuery}&where[or][1][excerpt][contains]=${encodedQuery}`;
    }
    const res = await fetch(url, { next: { revalidate: 600 }, headers: { "Content-Type": "application/json" } });
    if (!res.ok) throw new Error(`Failed to fetch blogs: ${res.status}`);
    const data: BlogsResponse = await res.json();
    return { blogs: data.docs, totalPages: data.totalPages, totalDocs: data.totalDocs };
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return { blogs: [], totalPages: 0, totalDocs: 0 };
  }
}

export async function getBlog(slug: string): Promise<Blog | null> {
  try {
    const res = await fetch(
      `${BASE_URL}/api/blogs?where[slug][equals]=${encodeURIComponent(slug)}&where[_status][equals]=published&depth=2`,
      { next: { revalidate: 600 }, headers: { "Content-Type": "application/json" } }
    );
    if (!res.ok) throw new Error(`Failed to fetch blog: ${res.status}`);
    const data: BlogsResponse = await res.json();
    return data.docs?.[0] || null;
  } catch (error) {
    console.error(`Error fetching blog "${slug}":`, error);
    return null;
  }
}

export async function getBlogsByCategory(category: string, limit: number = 100): Promise<Blog[]> {
  try {
    const res = await fetch(
      `${BASE_URL}/api/blogs?where[categories.category][equals]=${encodeURIComponent(category)}&limit=${limit}&sort=-publishedAt&where[_status][equals]=published&depth=2`,
      { next: { revalidate: 600 }, headers: { "Content-Type": "application/json" } }
    );
    if (!res.ok) throw new Error(`Failed to fetch blogs by category: ${res.status}`);
    const data: BlogsResponse = await res.json();
    return data.docs;
  } catch (error) {
    console.error(`Error fetching blogs for category "${category}":`, error);
    return [];
  }
}

// SEO Pages
export async function getSEOPage(slug: string, site?: string): Promise<SEOPage | null> {
  try {
    let url = `${BASE_URL}/api/seo-pages?where[slug][equals]=${encodeURIComponent(slug)}&depth=2`;
    if (site) url += `&where[site][equals]=${encodeURIComponent(site)}`;
    const res = await fetch(url, { next: { revalidate: 3600 }, headers: { "Content-Type": "application/json" } });
    if (!res.ok) throw new Error(`Failed to fetch SEO page: ${res.status}`);
    const data = await res.json();
    return data.docs?.[0] || null;
  } catch (error) {
    console.error(`Error fetching SEO page "${slug}":`, error);
    return null;
  }
}

// SEO Images
export async function getSEOImages(pageSlug: string, site?: string): Promise<SEOImage[]> {
  try {
    let url = `${BASE_URL}/api/seo-images?where[page_slug][equals]=${encodeURIComponent(pageSlug)}&depth=2`;
    if (site) url += `&where[site][equals]=${encodeURIComponent(site)}`;
    const res = await fetch(url, { next: { revalidate: 3600 }, headers: { "Content-Type": "application/json" } });
    if (!res.ok) throw new Error(`Failed to fetch SEO images: ${res.status}`);
    const data = await res.json();
    return data.docs || [];
  } catch (error) {
    console.error(`Error fetching SEO images for "${pageSlug}":`, error);
    return [];
  }
}

// Complete Blog SEO (Merge)
export async function getCompleteBlogSEO(blog: Blog, site?: string) {
  const blogSlug = `/blogs/${blog.slug}`;
  const seoPage = await getSEOPage(blogSlug, site);
  const seoImages = await getSEOImages(blogSlug, site);

  return {
    title: blog.meta?.title || seoPage?.metaTitle || blog.title,
    description: blog.meta?.description || seoPage?.metaDescription || blog.excerpt?.substring(0, 160) || 'Default blog.',
    keywords: [...(blog.meta?.keywords?.map((k: any) => k.keyword) || []), ...(seoPage?.keywords?.map((k: any) => k.keyword) || [])].filter(Boolean).slice(0, 10),
    canonical: blog.meta?.canonical || seoPage?.canonical || `/blogs/${blog.slug}`,
    ogImage: blog.meta?.ogImage || seoPage?.openGraph?.ogImage || blog.featuredImage,
    robotsIndex: blog.meta?.robotsIndex !== false && (seoPage?.robots?.index !== false),
    robotsFollow: blog.meta?.robotsFollow !== false && (seoPage?.robots?.follow !== false),
    seoImages,
    structuredData: blog.meta?.schema_json || seoPage?.schema_json || null,
  };
}

// Static Page SEO
export async function getStaticPageSEO(slug: string, site?: string) {
  const seoPage = await getSEOPage(slug, site);
  const seoImages = await getSEOImages(slug, site);
  if (!seoPage) return null;
  return {
    title: seoPage.metaTitle || 'Untitled Page',
    description: seoPage.metaDescription || '',
    keywords: seoPage.keywords?.map((k: any) => k.keyword) || [],
    canonical: seoPage.canonical || '',
    ogImage: seoPage.openGraph?.ogImage,
    robotsIndex: seoPage.robots?.index !== false,
    robotsFollow: seoPage.robots?.follow !== false,
    seoImages,
    structuredData: seoPage.schema_json || null,
  };
}

// Categories/Tags
export async function getAllCategories(): Promise<string[]> {
  try {
    const { blogs } = await getBlogs(1, 1000);
    const categoriesSet = new Set<string>();
    blogs.forEach((blog: Blog) => {
      if (blog.categories && Array.isArray(blog.categories)) {
        blog.categories.forEach((cat: any) => categoriesSet.add(cat.category));
      }
    });
    return Array.from(categoriesSet).sort();
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

export async function getAllTags(): Promise<string[]> {
  try {
    const { blogs } = await getBlogs(1, 1000);
    const tagsSet = new Set<string>();
    blogs.forEach((blog: Blog) => {
      if (blog.tags && Array.isArray(blog.tags)) {
        blog.tags.forEach((tag: any) => tagsSet.add(tag.tag));
      }
    });
    return Array.from(tagsSet).sort();
  } catch (error) {
    console.error("Error fetching tags:", error);
    return [];
  }
}
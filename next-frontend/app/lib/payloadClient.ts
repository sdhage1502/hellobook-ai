import { Blog } from "../../../payload-cms/src/payload-types";

const BASE_URL = process.env.NEXT_PUBLIC_PAYLOAD_URL;


// Fetch all blogs
export async function getBlogs(): Promise<Blog[]> {
  const res = await fetch(`${BASE_URL}/api/blogs?limit=20`, {
    next: { revalidate: 600 }, // ISR every 10 minutes
  });
  const data = await res.json();
  return data.docs;
}

// Fetch single blog by slug
export async function getBlog(slug: string): Promise<Blog | null> {
  const res = await fetch(`${BASE_URL}/api/blogs?where[slug][equals]=${slug}`, {
    next: { revalidate: 600 },
  });
  const data = await res.json();
  return data.docs?.[0] || null;
}
import type { CollectionConfig } from 'payload';

const SEOImages: CollectionConfig = {
  slug: 'seo-images',
  labels: { singular: 'SEO Image', plural: 'SEO Images' },
  admin: { useAsTitle: 'image_url' },
  access: { read: () => true, create: ({ req }) => !!req.user, update: ({ req }) => !!req.user, delete: ({ req }) => !!req.user },
  fields: [
    { name: 'site', type: 'text', required: true, defaultValue: process.env.DEFAULT_SITE || 'sync.hellobooks.ai' },
    { name: 'page_slug', type: 'text', required: true }, // e.g. '/', '/blogs/my-post'
    { name: 'image', type: 'upload', relationTo: 'media' }, // prefer managed media
    { name: 'image_url', type: 'text', admin: { description: 'Optional: absolute URL override (CDN)'} },
    { name: 'alt_text', type: 'text' },
    { name: 'caption', type: 'text' },
    {
      name: 'tags',
      type: 'array',
      fields: [{ name: 'tag', type: 'text' }],
    },
  ],
  hooks: {
    afterChange: [
      async () => {
        if (!process.env.NEXT_REVALIDATE_URL) return;
        await fetch(`${process.env.NEXT_REVALIDATE_URL}/api/revalidate`, { method: 'POST' }).catch(() => {});
      },
    ],
  },
//   admin: {
//     description: 'Preferred OG/Twitter images and alt for each route.',
//   },
};

export default SEOImages;

import type { CollectionConfig } from 'payload';

const SEOPages: CollectionConfig = {
  slug: 'seo-pages',
  labels: { singular: 'SEO Page', plural: 'SEO Pages' },
  admin: { useAsTitle: 'slug' },
  access: { read: () => true, create: ({ req }) => !!req.user, update: ({ req }) => !!req.user, delete: ({ req }) => !!req.user },
  fields: [
    { name: 'site', type: 'text', required: true, defaultValue: process.env.DEFAULT_SITE || 'sync.hellobooks.ai' },
    { name: 'slug', type: 'text', required: true, unique: true }, // e.g. '/', '/blogs/my-post', '/pricing'
    { name: 'metaTitle', type: 'text' },
    { name: 'metaDescription', type: 'textarea' },
    {
      name: 'keywords',
      type: 'array',
      fields: [{ name: 'keyword', type: 'text', required: true }],
    },
    { name: 'canonical', type: 'text' },
    {
      name: 'openGraph',
      type: 'group',
      fields: [
        { name: 'ogTitle', type: 'text' },
        { name: 'ogDescription', type: 'textarea' },
        { name: 'ogImage', type: 'upload', relationTo: 'media' },
      ],
    },
    {
      name: 'robots',
      type: 'group',
      fields: [
        { name: 'index', type: 'checkbox', defaultValue: true },
        { name: 'follow', type: 'checkbox', defaultValue: true },
      ],
    },
    { name: 'schema_json', type: 'json' }, // free-form JSON-LD
  ],
  hooks: {
    afterChange: [
      async () => {
        if (!process.env.NEXT_REVALIDATE_URL) return;
        await fetch(`${process.env.NEXT_REVALIDATE_URL}/api/revalidate`, { method: 'POST' }).catch(() => {});
      },
    ],
  },
};

export default SEOPages;

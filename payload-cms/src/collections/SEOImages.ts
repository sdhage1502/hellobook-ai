import type { CollectionConfig } from 'payload';

/**
 * SEO Images Collection
 * Optimize images for search/social/accessibility.
 */
const SEOImages: CollectionConfig = {
  slug: 'seo-images',
  labels: { singular: 'SEO Image', plural: 'SEO Images' },
  admin: {
    useAsTitle: 'alt_text',
    description: 'Optimize images for SEO/social',
    defaultColumns: ['alt_text', 'page_slug', 'site', 'updatedAt'],
    group: 'SEO',
  },
  access: { read: () => true, create: ({ req }) => !!req.user, update: ({ req }) => !!req.user, delete: ({ req }) => !!req.user },
  fields: [
    { name: 'site', type: 'text', required: true, defaultValue: process.env.DEFAULT_SITE || 'yourdomain.com', admin: { description: 'Domain', position: 'sidebar' } },
    { name: 'page_slug', type: 'text', required: true, index: true, admin: { description: 'Page slug (e.g., /blogs/tech)' } },
    { name: 'image', type: 'upload', relationTo: 'media', admin: { description: 'Upload image' } },
    { name: 'image_url', type: 'text', admin: { description: 'Direct URL (override)' } },
    { name: 'alt_text', type: 'text', maxLength: 125, admin: { description: 'Alt text (descriptive, keywords)' } },
    { name: 'caption', type: 'text', admin: { description: 'Caption' } },
    {
      name: 'tags',
      type: 'array',
      label: 'Tags',
      admin: { description: 'Keywords for image' },
      fields: [{ name: 'tag', type: 'text' }],
    },
    {
      name: 'imageType',
      type: 'select',
      label: 'Type',
      admin: { description: 'Purpose', position: 'sidebar' },
      options: [
        { label: 'Featured/Hero', value: 'featured' },
        { label: 'Content', value: 'content' },
        { label: 'Social (OG)', value: 'og' },
        { label: 'Product', value: 'product' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'dimensions',
      type: 'group',
      label: 'Dimensions',
      admin: { description: 'Px sizes', position: 'sidebar' },
      fields: [
        { name: 'width', type: 'number', admin: { description: 'Width' } },
        { name: 'height', type: 'number', admin: { description: 'Height' } },
      ],
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (!data.alt_text && data.image && typeof data.image === 'object') {
          const filename = data.image.filename || '';
          data.alt_text = filename
            .replace(/\.[^/.]+$/, '')
            .replace(/[-_]/g, ' ')
            .replace(/\b\w/g, (c: string) => c.toUpperCase());
        }
        return data;
      },
    ],
    afterChange: [
      async ({ req }) => {
        if (!process.env.NEXT_REVALIDATE_URL) return;
        try {
          await fetch(`${process.env.NEXT_REVALIDATE_URL}/api/revalidate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ collection: 'seo-images' }),
          });
        } catch (error) {
          req.payload.logger.error(`Revalidation failed: ${error instanceof Error ? error.message : String(error)}`);
        }
      },
    ],
  },
};

export default SEOImages;
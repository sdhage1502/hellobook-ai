import type { CollectionConfig } from 'payload';

/**
 * Internal Links Collection
 * Automated linking for SEO. Editors define rules; Next.js injects.
 */
const InternalLink: CollectionConfig = {
  slug: 'internal-links',
  labels: { singular: 'Internal Link Rule', plural: 'Internal Link Rules' },
  admin: {
    useAsTitle: 'keyword',
    description: 'Automated internal linking for SEO',
    defaultColumns: ['keyword', 'target_url', 'priority', 'max_links_per_page'],
    group: 'SEO',
  },
  access: { read: () => true, create: ({ req }) => !!req.user, update: ({ req }) => !!req.user, delete: ({ req }) => !!req.user },
  fields: [
    { name: 'site', type: 'text', required: true, defaultValue: process.env.DEFAULT_SITE || 'yourdomain.com', admin: { description: 'Domain (multi-site)', position: 'sidebar' } },
    { name: 'keyword', type: 'text', required: true, index: true, admin: { description: 'Keyword/phrase to link' } },
    { name: 'target_url', type: 'text', required: true, admin: { description: 'Target URL (e.g., /blogs/nextjs-guide)' } },
    { name: 'title', type: 'text', admin: { description: 'Tooltip (optional)' } },
    { name: 'nofollow', type: 'checkbox', defaultValue: false, admin: { description: 'rel="nofollow"', position: 'sidebar' } },
    { name: 'priority', type: 'number', defaultValue: 10, min: 0, max: 100, admin: { description: 'Higher = first (0-100)', position: 'sidebar' } },
    { name: 'max_links_per_page', type: 'number', defaultValue: 2, min: 0, max: 10, admin: { description: 'Max links per page (1-3 recommended)', position: 'sidebar' } },
    {
      name: 'match_type',
      type: 'select',
      options: [
        { label: 'Word (exact)', value: 'word' },
        { label: 'Phrase (exact)', value: 'phrase' },
        { label: 'Regex (advanced)', value: 'regex' },
      ],
      defaultValue: 'word',
      required: true,
      admin: { description: 'Match type', position: 'sidebar' },
    },
    { name: 'isActive', type: 'checkbox', defaultValue: true, admin: { description: 'Enable rule', position: 'sidebar' } },
    { name: 'notes', type: 'textarea', admin: { description: 'Notes' } },
  ],
  hooks: {
    afterChange: [
      async ({ req }) => {
        if (!process.env.NEXT_REVALIDATE_URL) return;
        try {
          await fetch(`${process.env.NEXT_REVALIDATE_URL}/api/revalidate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ collection: 'internal-links' }),
          });
        } catch (error) {
          req.payload.logger.error(`Revalidation failed: ${error instanceof Error ? error.message : String(error)}`);
        }
      },
    ],
  },
};

export default InternalLink;
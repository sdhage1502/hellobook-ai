import type { CollectionConfig } from 'payload';

const InternalLink: CollectionConfig = {
  slug: 'internal-links',
  labels: { singular: 'Internal Link', plural: 'Internal Links' },
  admin: { useAsTitle: 'keyword' },
  access: { read: () => true, create: ({ req }) => !!req.user, update: ({ req }) => !!req.user, delete: ({ req }) => !!req.user },
  fields: [
    { name: 'site', type: 'text', required: true, defaultValue: process.env.DEFAULT_SITE || 'sync.hellobooks.ai' },
    { name: 'keyword', type: 'text', required: true },
    { name: 'target_url', type: 'text', required: true },
    { name: 'title', type: 'text' },
    { name: 'nofollow', type: 'checkbox', defaultValue: false },
    { name: 'priority', type: 'number', defaultValue: 10, min: 0, max: 100 },
    { name: 'max_links_per_page', type: 'number', defaultValue: 2, min: 0, max: 10 },
    {
      name: 'match_type',
      type: 'select',
      options: [
        { label: 'word', value: 'word' },
        { label: 'phrase', value: 'phrase' },
        { label: 'regex', value: 'regex' },
      ],
      defaultValue: 'word',
      required: true,
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
};

export default InternalLink;

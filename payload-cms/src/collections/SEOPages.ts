import type { CollectionConfig } from 'payload';

const SEOPages: CollectionConfig = {
  slug: 'seo-pages',
  labels: {
    singular: 'SEO Page',
    plural: 'SEO Pages',
  },
  admin: {
    useAsTitle: 'slug',
    description: 'Manage SEO metadata for all website pages',
    defaultColumns: ['slug', 'metaTitle', 'site', 'updatedAt'],
    group: 'SEO',
  },
  access: {
    read: () => true,
    create: ({ req }) => !!req.user,
    update: ({ req }) => !!req.user,
    delete: ({ req }) => !!req.user,
  },
  fields: [
    {
      name: 'site',
      type: 'text',
      required: true,
      defaultValue: process.env.DEFAULT_SITE || 'yourdomain.com',
      admin: {
        description: 'Domain name (for multi-site management)',
        position: 'sidebar',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description:
          'Page URL path (e.g., /, /about, /blogs, /blogs/my-post)',
      },
    },
    {
      name: 'metaTitle',
      type: 'text',
      maxLength: 60,
      admin: {
        description: 'SEO title (50-60 characters recommended)',
      },
    },
    {
      name: 'metaDescription',
      type: 'textarea',
      maxLength: 160,
      admin: {
        description: 'Meta description (150-160 characters recommended)',
      },
    },
    {
      name: 'keywords',
      type: 'array',
      label: 'Keywords',
      maxRows: 10,
      admin: {
        description: 'Target keywords for this page (5-10 recommended)',
      },
      fields: [
        {
          name: 'keyword',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'canonical',
      type: 'text',
      admin: {
        description: 'Canonical URL (prevents duplicate content issues)',
      },
    },
    {
      name: 'openGraph',
      type: 'group',
      label: 'Social Media (Open Graph)',
      admin: {
        description: 'How this page appears when shared on social media',
      },
      fields: [
        {
          name: 'ogTitle',
          type: 'text',
          maxLength: 60,
          admin: {
            description: 'Social media title (can differ from meta title)',
          },
        },
        {
          name: 'ogDescription',
          type: 'textarea',
          maxLength: 160,
          admin: {
            description: 'Social media description',
          },
        },
        {
          name: 'ogImage',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'Social media image (1200x630px recommended)',
          },
        },
      ],
    },
    {
      name: 'robots',
      type: 'group',
      label: 'Search Engine Directives',
      admin: {
        description: 'Control how search engines crawl and index this page',
      },
      fields: [
        {
          name: 'index',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Allow search engines to index this page',
          },
        },
        {
          name: 'follow',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Allow search engines to follow links on this page',
          },
        },
      ],
    },
    {
      name: 'schema_json',
      type: 'json',
      label: 'Structured Data (JSON-LD)',
      admin: {
        description: 'Additional structured data for rich snippets (advanced)',
      },
    },
  ],
  hooks: {
    afterChange: [
      async ({ req }) => {
        // Trigger Next.js revalidation
        if (!process.env.NEXT_REVALIDATE_URL) return;

        try {
          await fetch(`${process.env.NEXT_REVALIDATE_URL}/api/revalidate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          });
        } catch (_error) {
          req.payload.logger.error('Revalidation failed:');
        }
      },
    ],
  },
};

export default SEOPages;
import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    {
      name: 'externalUrl',
      type: 'text',
      label: 'External Image URL',
      admin: {
        description: 'Paste an external image URL to use instead of uploading a file',
        condition: (data) => !data.filename,
      },
    },
  ],
  upload: {
    pasteURL: {
      allowList: [
        {
          hostname: 'payloadcms.com',
          protocol: 'https',
        },
        {
          hostname: 'unsplash.com',
          protocol: 'https',
        },
        {
          hostname: 'images.unsplash.com',
          protocol: 'https',
        },
        {
          hostname: 'your-cdn-domain.com',
          protocol: 'https',
        },
      ],
    },
  },
}


import type { CollectionConfig } from 'payload';

export const Media: CollectionConfig = {
  slug: 'media',

  admin: {
    useAsTitle: 'filename',
    group: 'Media',
    defaultColumns: ['filename', 'url'],
  },

  access: { read: () => true },

  upload: {
    staticDir: 'media',

    pasteURL: {
      allowList: [
        { hostname: 'images.unsplash.com', protocol: 'https' },
        { hostname: 'unsplash.com', protocol: 'https' },
        { hostname: 'your-cdn-domain.com', protocol: 'https' },
      ],
    },
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
        description: 'Use external CDN URL instead of upload',
        condition: (data) => !data.filename,
      },
    },
  ],
};

export default Media;

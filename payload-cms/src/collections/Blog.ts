import { CollectionConfig } from 'payload';

const Blog: CollectionConfig = {
  slug: 'blogs',
  admin: { useAsTitle: 'title' },
    access: {
    read: () => true, // anyone can read
    create: ({ req }) => !!req.user, // only logged-in users can create
    update: ({ req }) => !!req.user, // only logged-in users can update
    delete: ({ req }) => !!req.user, // only logged-in users can delete
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true },
    { name: 'excerpt', type: 'textarea' },
    { name: 'content', type: 'richText' },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'meta',
      label: 'SEO Metadata',
      type: 'group',
      fields: [
        { name: 'title', type: 'text' },
        { name: 'description', type: 'textarea' },
        { name: 'canonical', type: 'text' },
        {
          name: 'ogImage',
          type: 'upload',
          relationTo: 'media',
        },
      ],
    },
  ],
};

export default Blog;

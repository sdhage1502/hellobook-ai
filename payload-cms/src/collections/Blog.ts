import { CollectionConfig } from 'payload';
import { 
  lexicalEditor,
  BlocksFeature,
  LinkFeature,
  BoldFeature,
  ItalicFeature,
  UnderlineFeature,
  ParagraphFeature,
  UnorderedListFeature,
  OrderedListFeature,
  InlineToolbarFeature,
  FixedToolbarFeature,
} from '@payloadcms/richtext-lexical';
import { TextColorFeature, HighlightColorFeature, type Color } from '@nhayhoc/payloadcms-lexical-ext';

// Shared color palettes
const TEXT_COLORS: Color[] = [
  { type: 'button' as const, label: 'Red', color: '#dc2626' },
  { type: 'button' as const, label: 'Blue', color: '#2563eb' },
  { type: 'button' as const, label: 'Green', color: '#16a34a' },
  { type: 'button' as const, label: 'Orange', color: '#ea580c' },
  { type: 'palette' as const, label: 'Custom Color', color: '#000000' },
];

const HIGHLIGHT_COLORS: Color[] = [
  { type: 'button' as const, label: 'Yellow', color: '#fef08a' },
  { type: 'button' as const, label: 'Green', color: '#bbf7d0' },
  { type: 'button' as const, label: 'Blue', color: '#bfdbfe' },
  { type: 'palette' as const, label: 'Custom Highlight', color: '#ffffff' },
];

// Enhanced link configuration


// Basic editor features
const basicFeatures = [
  BoldFeature(),
  ItalicFeature(),
  UnderlineFeature(),
  ParagraphFeature(),
  UnorderedListFeature(),
  OrderedListFeature(),
];

// Enhanced features with colors and links
const enhancedFeatures = [
  TextColorFeature({ colors: TEXT_COLORS }),
  HighlightColorFeature({ colors: HIGHLIGHT_COLORS }),
  LinkFeature({
    fields: () => [
      {
        name: 'href',
        label: 'URL',
        type: 'text',
        required: true,
      },
      {
        name: 'openInNewTab',
        label: 'Open in new tab',
        type: 'checkbox',
        defaultValue: false,
      },
      {
        name: 'rel',
        label: 'Rel Attribute',
        type: 'select',
        hasMany: true,
        options: [
          { label: 'noopener', value: 'noopener' },
          { label: 'noreferrer', value: 'noreferrer' },
          { label: 'nofollow', value: 'nofollow' },
        ],
      },
    ],
  }),
  InlineToolbarFeature(),
  FixedToolbarFeature(),
];

const Blog: CollectionConfig = {
  slug: 'blogs',
  admin: { 
    useAsTitle: 'title',
    description: 'Manage your blog posts with advanced editing features',
  },
  access: {
    read: () => true, // anyone can read
    create: ({ req }) => !!req.user, // only logged-in users can create
    update: ({ req }) => !!req.user, // only logged-in users can update
    delete: ({ req }) => !!req.user, // only logged-in users can delete
  },
  fields: [
    { 
      name: 'title', 
      type: 'text', 
      required: true,
      admin: {
        description: 'The main title of your blog post',
      },
    },
    { 
      name: 'slug', 
      type: 'text', 
      required: true, 
      unique: true,
      admin: {
        description: 'URL-friendly version of the title (e.g., my-blog-post)',
      },
    },
    { 
      name: 'excerpt', 
      type: 'textarea',
      admin: {
        description: 'A brief summary of your blog post (recommended 150-160 characters)',
      },
    },
    { 
      name: 'content', 
      type: 'richText',
      required: true,
      editor: lexicalEditor({
        features: () => [...basicFeatures, ...enhancedFeatures,
          // Custom Button Block
          BlocksFeature({
            blocks: [
              {
                slug: 'customButton',
                interfaceName: 'CustomButtonBlock',
                labels: {
                  singular: 'Button',
                  plural: 'Buttons',
                },
                fields: [
                  {
                    name: 'buttonText',
                    type: 'text',
                    required: true,
                    admin: {
                      description: 'Text displayed on the button',
                    },
                  },
                  {
                    name: 'buttonLink',
                    type: 'text',
                    required: true,
                    admin: {
                      description: 'URL where the button will navigate (e.g., https://example.com or /about)',
                    },
                  },
                  {
                    name: 'buttonStyle',
                    type: 'select',
                    required: true,
                    defaultValue: 'primary',
                    options: [
                      { label: 'Primary', value: 'primary' },
                      { label: 'Secondary', value: 'secondary' },
                      { label: 'Outline', value: 'outline' },
                      { label: 'Ghost', value: 'ghost' },
                    ],
                    admin: {
                      description: 'Visual style of the button',
                    },
                  },
                  {
                    name: 'openInNewTab',
                    type: 'checkbox',
                    defaultValue: false,
                    admin: {
                      description: 'Open link in a new browser tab',
                    },
                  },
                  {
                    name: 'buttonSize',
                    type: 'select',
                    defaultValue: 'medium',
                    options: [
                      { label: 'Small', value: 'small' },
                      { label: 'Medium', value: 'medium' },
                      { label: 'Large', value: 'large' },
                    ],
                  },
                  {
                    name: 'alignment',
                    type: 'select',
                    defaultValue: 'left',
                    options: [
                      { label: 'Left', value: 'left' },
                      { label: 'Center', value: 'center' },
                      { label: 'Right', value: 'right' },
                    ],
                  },
                ],
              },
              {
                slug: 'callout',
                interfaceName: 'CalloutBlock',
                labels: {
                  singular: 'Callout Box',
                  plural: 'Callout Boxes',
                },
                fields: [
                  {
                    name: 'content',
                    type: 'textarea',
                    required: true,
                    admin: {
                      description: 'Content to display in the callout box',
                    },
                  },
                  {
                    name: 'type',
                    type: 'select',
                    required: true,
                    defaultValue: 'info',
                    options: [
                      { label: 'Info', value: 'info' },
                      { label: 'Warning', value: 'warning' },
                      { label: 'Success', value: 'success' },
                      { label: 'Error', value: 'error' },
                    ],
                  },
                ],
              },
            ],
          }),
        ],
      }),
      admin: {
        description: 'Main content of your blog post with rich formatting options',
      },
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Main image for the blog post (recommended: 1200x630px)',
      },
    },
    // FAQ Section - New Feature
    {
      name: 'faq',
      type: 'array',
      label: 'FAQ Section',
      admin: {
        description: 'Add frequently asked questions and answers related to this blog post',
      },
      fields: [
        {
          name: 'question',
          type: 'text',
          required: true,
          admin: {
            description: 'The question',
          },
        },
        {
          name: 'answer',
          type: 'richText',
          required: true,
              editor: lexicalEditor({
            features: () => [...basicFeatures, ...enhancedFeatures],
          }),
          admin: {
            description: 'The answer to the question (supports rich text formatting)',
          },
        },
      ],
    },
    // Enhanced SEO Metadata
    {
      name: 'meta',
      label: 'SEO Metadata',
      type: 'group',
      admin: {
        description: 'Search engine optimization settings',
      },
      fields: [
        { 
          name: 'title', 
          type: 'text',
          admin: {
            description: 'SEO title (recommended: 50-60 characters)',
          },
        },
        { 
          name: 'description', 
          type: 'textarea',
          admin: {
            description: 'SEO description (recommended: 150-160 characters)',
          },
        },
        // Keywords Field - New Feature
        {
          name: 'keywords',
          type: 'array',
          label: 'Keywords',
          admin: {
            description: 'Add relevant keywords for SEO (one keyword per entry)',
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
            description: 'Canonical URL to prevent duplicate content issues',
          },
        },
        {
          name: 'ogImage',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'Image for social media sharing (recommended: 1200x630px)',
          },
        },
        {
          name: 'robotsIndex',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Allow search engines to index this page',
          },
        },
        {
          name: 'robotsFollow',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Allow search engines to follow links on this page',
          },
        },
      ],
    },
    // Publishing options
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        description: 'When this post was/will be published',
      },
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        position: 'sidebar',
        description: 'Author of this blog post',
      },
    },
    {
      name: 'categories',
      type: 'array',
      label: 'Categories',
      admin: {
        position: 'sidebar',
        description: 'Categorize your blog post',
      },
      fields: [
        {
          name: 'category',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'tags',
      type: 'array',
      label: 'Tags',
      admin: {
        position: 'sidebar',
        description: 'Add tags for better organization',
      },
      fields: [
        {
          name: 'tag',
          type: 'text',
          required: true,
        },
      ],
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        // Auto-generate slug from title if not provided
        if (data.title && !data.slug) {
          data.slug = data.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
        }
        
        // Set publishedAt to current date if not set and creating new post
        if (!data.publishedAt && !data.id) {
          data.publishedAt = new Date().toISOString();
        }
        
        return data;
      },
    ],
  },

  
};

export default Blog;
import { CollectionConfig } from 'payload';
import { 
  lexicalEditor,
  BlocksFeature,
  LinkFeature,
  BoldFeature,
  ItalicFeature,
  UnderlineFeature,
  ParagraphFeature,
  HeadingFeature,
  UnorderedListFeature,
  OrderedListFeature,
  InlineToolbarFeature,
  FixedToolbarFeature,
  UploadFeature,
} from '@payloadcms/richtext-lexical';
import { TextColorFeature, HighlightColorFeature, type Color } from '@nhayhoc/payloadcms-lexical-ext';

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

type LexicalNode = {
  type?: string
  text?: string
  children?: LexicalNode[]
  fields?: {
    blockType?: string
    buttonText?: string
    buttonLink?: string
    content?: string
    type?: string
    [key: string]: unknown
  }
}

const basicFeatures = [
  BoldFeature(),
  ItalicFeature(),
  UnderlineFeature(),
  ParagraphFeature(),
  HeadingFeature({
    enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
  }),
  UnorderedListFeature(),
  OrderedListFeature(),
  UploadFeature({
    collections: {
      media: {
        fields: [],
      },
    },
  }),
];

const enhancedFeatures = [
  TextColorFeature({ colors: TEXT_COLORS }),
  HighlightColorFeature({ colors: HIGHLIGHT_COLORS }),
  LinkFeature({
    enabledCollections: [],
    fields: [
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
        admin: {
          description: 'Relationship attributes for the link',
        },
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
    description: 'Manage blog posts with SEO optimization',
    defaultColumns: ['title', 'slug', 'publishedAt', '_status'],
    livePreview: {
      url: ({ data }) => {
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
        return `${baseUrl}/blogs/${data.slug}`;
      },
    },
  },
  versions: {
    drafts: {
      autosave: {
        interval: 375,
      },
    },
    maxPerDoc: 50,
  },
  access: {
    read: ({ req }) => {
      if (req.user) return true;
      return {
        _status: { equals: 'published' },
      };
    },
    create: ({ req }) => !!req.user,
    update: ({ req }) => !!req.user,
    delete: ({ req }) => !!req.user,
  },
  fields: [
    { 
      name: 'title', 
      type: 'text', 
      required: true,
      admin: {
        description: 'Main blog title (50-60 characters recommended)',
      },
    },
    { 
      name: 'slug', 
      type: 'text', 
      required: true, 
      unique: true,
      index: true,
      admin: {
        description: 'URL-friendly slug (auto-generated from title)',
      },
    },
    { 
      name: 'excerpt', 
      type: 'textarea',
      maxLength: 160,
      admin: {
        description: 'Brief summary (150-160 characters)',
      },
    },
    { 
      name: 'content', 
      type: 'richText',
      // Not required to allow saving drafts without content
      // Will be validated on publish via hooks if needed
      editor: lexicalEditor({
        features: () => [...basicFeatures, ...enhancedFeatures,
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
                    // Required only if button block is used
                    // Validation handled at block level
                  },
                  {
                    name: 'buttonLink',
                    type: 'text',
                    // Required only if button block is used
                    // Validation handled at block level
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
                  },
                  {
                    name: 'openInNewTab',
                    type: 'checkbox',
                    defaultValue: false,
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
                    // Required only if callout block is used
                    // Validation handled at block level
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
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
      // Not required to allow saving drafts without image
      // Will be validated on publish via hooks if needed
      admin: {
        description: 'Featured image (1200x630px recommended)',
        position: 'sidebar',
      },
    },
    {
      name: 'faq',
      type: 'array',
      label: 'FAQ Section',
      admin: {
        description: 'FAQs for featured snippets',
        initCollapsed: true,
      },
      fields: [
        {
          name: 'question',
          type: 'text',
          required: true,
        },
        {
          name: 'answer',
          type: 'richText',
          required: true,
          editor: lexicalEditor({
            features: () => [...basicFeatures, ...enhancedFeatures],
          }),
        },
      ],
    },
    // Blog-specific SEO (overrides SEO Pages)
    {
      name: 'meta',
      label: 'SEO Metadata',
      type: 'group',
      admin: {
        description: 'Override global SEO settings for this post',
      },
      fields: [
        { 
          name: 'title', 
          type: 'text',
          maxLength: 60,
          admin: {
            description: 'SEO title (leave blank to use post title)',
          },
        },
        { 
          name: 'description', 
          type: 'textarea',
          maxLength: 160,
          admin: {
            description: 'Meta description (leave blank to use excerpt)',
          },
        },
        {
          name: 'keywords',
          type: 'array',
          label: 'Focus Keywords',
          maxRows: 5,
          admin: {
            description: 'Target keywords (3-5 recommended)',
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
            description: 'Canonical URL (optional)',
          },
        },
        {
          name: 'ogImage',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'Social media image (uses featured image if blank)',
          },
        },
        {
          name: 'robotsIndex',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'robotsFollow',
          type: 'checkbox',
          defaultValue: true,
        },
      ],
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'categories',
      type: 'array',
      maxRows: 3,
      admin: {
        position: 'sidebar',
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
      maxRows: 10,
      admin: {
        position: 'sidebar',
      },
      fields: [
        {
          name: 'tag',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'readingTime',
      type: 'number',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Auto-calculated reading time (minutes)',
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, operation, req }) => {
        // Auto-generate slug
        if (data.title && !data.slug) {
          data.slug = data.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
        }
        
        // Validate content when publishing (not for drafts)
        // Check if content exists and has meaningful content
        if (data._status === 'published') {
          // Skip validation if content is not provided (will be caught by field validation)
          if (!data.content) {
            return data;
          }
          
          const hasContent = data.content && 
                            data.content.root && 
                            data.content.root.children && 
                            Array.isArray(data.content.root.children) &&
                            data.content.root.children.length > 0;
          
          if (!hasContent) {
            // Don't throw error here - let Payload handle it with a better message
            return data;
          }
          
          // Check if content has actual text (not just empty paragraphs or blocks)
          let hasTextContent = false;
          const checkForText = (nodes: any[]): boolean => {
            for (const node of nodes) {
              // Check for text nodes with actual content
              if (node.type === 'text' && node.text && typeof node.text === 'string' && node.text.trim().length > 0) {
                return true;
              }
              
              // Check for headings with text
              if ((node.type === 'heading' || node.type === 'h1' || node.type === 'h2' || node.type === 'h3' || node.type === 'h4' || node.type === 'h5' || node.type === 'h6') && node.children) {
                if (checkForText(node.children)) return true;
              }
              
              // Check paragraphs
              if (node.type === 'paragraph' && node.children) {
                if (checkForText(node.children)) return true;
              }
              
              // Check list items
              if ((node.type === 'list' || node.type === 'listitem') && node.children) {
                if (checkForText(node.children)) return true;
              }
              
              // Check for blocks that might have content (buttons, callouts, etc.)
              if (node.type === 'block') {
                // Blocks like buttons/callouts are considered valid content
                if (node.fields?.blockType) {
                  return true;
                }
              }
              
              // Recursively check children
              if (node.children && Array.isArray(node.children) && node.children.length > 0) {
                if (checkForText(node.children)) return true;
              }
            }
            return false;
          };
          
          hasTextContent = checkForText(data.content.root.children);
          
          // Only validate if we have structure but no actual content
          if (hasContent && !hasTextContent) {
            // Check if there are any blocks (buttons, callouts, images, etc.)
            const hasBlocks = data.content.root.children.some((node: any) => 
              node.type === 'block' || 
              node.type === 'upload' ||
              (node.type === 'paragraph' && node.children?.some((child: any) => child.type === 'upload'))
            );
            
            if (!hasBlocks) {
              throw new Error('Content is required when publishing. Please add some text content or save as draft.');
            }
          }
        }

        // Clean up and validate custom blocks (only when publishing)
        if (data._status === 'published' && data.content?.root?.children) {
          try {
            const processCustomBlocks = (nodes: any[]): any[] => {
              if (!Array.isArray(nodes)) return nodes;
              
              return nodes
                .map((node) => {
                  if (!node || typeof node !== 'object') return node;
                  
                  // Check for button blocks in Lexical structure
                  if (node.type === 'block' && node.fields?.blockType === 'customButton') {
                    // Get button fields, handling various data structures
                    const buttonText = node.fields?.buttonText;
                    const buttonLink = node.fields?.buttonLink;
                    
                    // Convert to strings and trim, handling null/undefined/empty
                    const textValue = (buttonText && typeof buttonText === 'string') ? buttonText.trim() : '';
                    const linkValue = (buttonLink && typeof buttonLink === 'string') ? buttonLink.trim() : '';
                    
                    const hasText = textValue.length > 0;
                    const hasLink = linkValue.length > 0;
                    
                    // If completely empty, remove the block (return null to filter out)
                    if (!hasText && !hasLink) {
                      return null;
                    }
                    
                    // If partially filled, throw error
                    if ((hasText || hasLink) && (!hasText || !hasLink)) {
                      throw new Error('Button blocks require both Button Text and Button Link to be filled when publishing. Please complete the button block or remove it.');
                    }
                  }
                  
                  // Check for callout blocks
                  if (node.type === 'block' && node.fields?.blockType === 'callout') {
                    const calloutContent = node.fields?.content;
                    const contentValue = (calloutContent && typeof calloutContent === 'string') ? calloutContent.trim() : '';
                    
                    // If empty, remove the block
                    if (!contentValue || contentValue.length === 0) {
                      return null;
                    }
                  }
                  
                  // Process children recursively (create new object to avoid mutation issues)
                  if (node.children && Array.isArray(node.children)) {
                    const processedChildren = processCustomBlocks(node.children);
                    return { ...node, children: processedChildren };
                  }
                  
                  return node;
                })
                .filter((node) => node !== null); // Remove empty blocks
            };
            
            // Create a deep copy to avoid mutation issues
            const processedChildren = processCustomBlocks(data.content.root.children);
            
            // Only update if there were changes
            if (JSON.stringify(processedChildren) !== JSON.stringify(data.content.root.children)) {
              data.content = {
                ...data.content,
                root: {
                  ...data.content.root,
                  children: processedChildren
                }
              };
            }
          } catch (error) {
            // If processing fails, log but don't break the save
            req.payload.logger.error(`Error processing custom blocks: ${error instanceof Error ? error.message : String(error)}`);
            // Don't throw - let Payload handle validation
          }
        }
        
        // Validate featured image when publishing
        if (data._status === 'published' && !data.featuredImage) {
          throw new Error('Featured image is required when publishing. Please add a featured image or save as draft.');
        }
        
        // Set publishedAt
        if (operation === 'create' && !data.publishedAt && data._status === 'published') {
          data.publishedAt = new Date().toISOString();
        }

        // Calculate reading time
        if (data.content?.root) {
          const text = JSON.stringify(data.content);
          const wordCount = text.split(/\s+/).length;
          data.readingTime = Math.ceil(wordCount / 200);
        }
        
        return data;
      },
    ],
    afterChange: [
      async ({ doc, req, operation }) => {
        if (process.env.NEXT_REVALIDATE_URL && operation === 'update') {
          try {
            await fetch(`${process.env.NEXT_REVALIDATE_URL}/api/revalidate`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                slug: doc.slug,
                collection: 'blogs',
              }),
            });
          } catch (error) {
            req.payload.logger.error(`Revalidation failed: ${error instanceof Error ? error.message : String(error)}`);
          }
        }
      },
    ],
  },
};

export default Blog;
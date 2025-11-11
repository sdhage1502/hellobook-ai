import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { s3Storage } from '@payloadcms/storage-s3'
import '@nhayhoc/payloadcms-lexical-ext/client/client.css'
import { TextColorFeature, HighlightColorFeature } from '@nhayhoc/payloadcms-lexical-ext'



import { Users } from './collections/Users'
import { Media } from './collections/Media'
import Blog from './collections/Blog'
import SEOPages from './collections/SEOPages'
import InternalLink from './collections/InternalLink'
import SEOImages from './collections/SEOImages'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    // meta: {
    //   titleSuffix: '- Blog CMS',
    //   icon: '/assets/favicon.ico',
    //   ogImage: '/assets/og-image.jpg',
    // },
    },
  },
  collections: [Users, Media, Blog, InternalLink, SEOPages, SEOImages],
  editor: lexicalEditor({
    features: ({ defaultFeatures }) => {
      return [
        ...defaultFeatures,
        TextColorFeature({
          colors: [
            { type: 'button', label: 'Red', color: '#dc2626' },
            { type: 'button', label: 'Blue', color: '#2563eb' },
            { type: 'button', label: 'Green', color: '#16a34a' },
            { type: 'button', label: 'Yellow', color: '#eab308' },
            { type: 'button', label: 'Purple', color: '#9333ea' },
            { type: 'button', label: 'Orange', color: '#ea580c' },
            { type: 'button', label: 'Pink', color: '#ec4899' },
            { type: 'button', label: 'Teal', color: '#14b8a6' },
            { type: 'button', label: 'Gray', color: '#6b7280' },
            { type: 'button', label: 'Black', color: '#000000' },
            { type: 'palette', label: 'Custom Color', color: '#000000' },
          ],
        }),
        HighlightColorFeature({
          colors: [
            { type: 'button', label: 'Yellow Highlight', color: '#fef08a' },
            { type: 'button', label: 'Green Highlight', color: '#bbf7d0' },
            { type: 'button', label: 'Blue Highlight', color: '#bfdbfe' },
            { type: 'button', label: 'Pink Highlight', color: '#fbcfe8' },
            { type: 'palette', label: 'Custom Highlight', color: '#ffffff' },
          ],
        }),
      ];
    },
  }),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URI || '',
  }),
  sharp,
  plugins: [
    payloadCloudPlugin(),
    s3Storage({
      collections: {
        media: {
          prefix: 'media',
          disableLocalStorage: true,
          generateFileURL: ({ filename, prefix }) => {
            return `https://${process.env.S3_BUCKET}.s3.${process.env.S3_REGION}.amazonaws.com/${prefix}/${filename}`
          },
        },
      },
      bucket: process.env.S3_BUCKET || '',
      config: {
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
        },
        region: process.env.S3_REGION || '',
        // Optional: Add endpoint for non-AWS S3-compatible services
        // endpoint: process.env.S3_ENDPOINT,
      },
    }),
  ],
  // CORS configuration for API access
  cors: [
    process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  ].filter(Boolean),
  csrf: [
    process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  ].filter(Boolean),
})
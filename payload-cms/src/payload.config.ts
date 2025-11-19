import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { lexicalEditor, HeadingFeature } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { azureStorage } from '@payloadcms/storage-azure'
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
  serverURL: process.env.NEXT_PUBLIC_SITE_URL,

  admin: {
    user: (Users && Users.slug) || 'users',
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
        HeadingFeature({
          enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
        }),
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
  db: mongooseAdapter({
    url: process.env.DATABASE_URI || '',
  }),

  sharp,

  plugins: [
    payloadCloudPlugin(),


    ...(process.env.AZURE_STORAGE_CONNECTION_STRING
      ? [
          azureStorage({
            collections: { media: true },
            allowContainerCreate:
              process.env.AZURE_STORAGE_ALLOW_CONTAINER_CREATE === 'true',
            baseURL: process.env.AZURE_STORAGE_ACCOUNT_BASEURL || '',
            connectionString: process.env.AZURE_STORAGE_CONNECTION_STRING,
            containerName: process.env.AZURE_STORAGE_CONTAINER_NAME || 'media',
            clientUploads:
              process.env.AZURE_STORAGE_CLIENT_UPLOADS === 'true',
           
          }),
        ]
      : []),
  ],

  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },

  cors: [
    process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  ],
  csrf: [
    process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  ],
});
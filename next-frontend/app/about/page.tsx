import React from 'react'
import type { Metadata } from 'next'
import { Header } from '@/app/components/Header'

// Function to fetch SEO metadata from Payload CMS
async function getAboutPageSEO() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_PAYLOAD_URL
    const response = await fetch(
      `${baseUrl}/api/seo-pages?where[slug][equals]=/about`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        next: { revalidate: 3600 }, // Cache for 1 hour
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch SEO metadata')
    }

    const data = await response.json()
    return data.docs[0] || null
  } catch (error) {
    console.error('Error fetching about page SEO:', error)
    return null
  }
}

// Generate metadata for the About page
export async function generateMetadata(): Promise<Metadata> {
  const seoData = await getAboutPageSEO()

  if (!seoData) {
    return {
      title: 'About Us',
      description: 'Learn more about our company and mission',
    }
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com'
  const canonical = seoData.canonical || `${baseUrl}/about`
  const ogImageUrl = seoData.openGraph?.image?.url || seoData.ogImage?.url

  // Build robots meta tag
  const robotsDirectives = []
  if (!seoData.robotsIndex) robotsDirectives.push('noindex')
  if (!seoData.robotsFollow) robotsDirectives.push('nofollow')
  const robots = robotsDirectives.length > 0 ? robotsDirectives.join(', ') : undefined

  return {
    title: seoData.metaTitle || 'About Us',
    description: seoData.metaDescription || 'Learn more about our company and mission',
    keywords: seoData.keywords
      ? (seoData.keywords as Array<{ keyword?: string }>).map((k) => k.keyword).filter(Boolean).join(', ')
      : undefined,
    // Next.js Metadata type doesn't accept a top-level `canonical` property.
    // Put canonical URL under `alternates` instead.
    alternates: { canonical },
    robots: robots,
    openGraph: {
      title: seoData.metaTitle || 'About Us',
      description: seoData.metaDescription || 'Learn more about our company',
      url: canonical,
      type: 'website',
      images: ogImageUrl ? [{ url: ogImageUrl, width: 1200, height: 630 }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: seoData.metaTitle || 'About Us',
      description: seoData.metaDescription || 'Learn more about our company',
      images: ogImageUrl ? [ogImageUrl] : undefined,
    },
  }
}

// Main About Page Component
export default async function AboutPage() {
  const seoData = await getAboutPageSEO()
  const keywordsDisplay = seoData?.keywords
    ? (seoData.keywords as Array<{ keyword?: string }>).map((k) => k.keyword).filter(Boolean).join(', ')
    : 'None'

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white">
        {/* JSON-LD Schema for Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Your Company Name',
              url: process.env.NEXT_PUBLIC_SITE_URL,
              description: seoData?.metaDescription || 'About our company',
              logo: `${process.env.NEXT_PUBLIC_SITE_URL}/logo.png`,
              sameAs: [
                'https://twitter.com/yourhandle',
                'https://facebook.com/yourpage',
                'https://linkedin.com/company/yourcompany',
              ],
            }),
          }}
        />

        <div className="max-w-4xl mx-auto px-6 py-16">
          {/* Hero Section */}
          <section className="mb-12">
            <h1 className="text-5xl font-bold mb-6 text-gray-900">
              {seoData?.metaTitle || 'About Us'}
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              {seoData?.metaDescription ||
                'Learn more about our company and mission.'}
            </p>
          </section>

          {/* SEO Metadata Display (for testing) */}
          {process.env.NODE_ENV === 'development' && (
            <section className="mb-12 p-6 bg-blue-50 border-l-4 border-blue-400">
                <h2 className="text-2xl font-bold mb-4 text-blue-900">
                  📊 SEO Metadata (Dev Mode)
                </h2>
                <div className="space-y-3">
                  {seoData ? (
                  <>
                    <div>
                      <strong>Slug:</strong> {seoData.slug}
                    </div>
                    <div>
                      <strong>Meta Title:</strong> {seoData.metaTitle}
                    </div>
                    <div>
                      <strong>Meta Description:</strong> {seoData.metaDescription}
                    </div>
                    <div>
                      <strong>Keywords:</strong>{' '}
                      {keywordsDisplay}
                    </div>
                    <div>
                      <strong>Canonical URL:</strong> {seoData.canonical}
                    </div>
                    <div>
                      <strong>Robots Index:</strong>{' '}
                      {seoData.robotsIndex !== false ? 'Yes' : 'No'}
                    </div>
                    <div>
                      <strong>Robots Follow:</strong>{' '}
                      {seoData.robotsFollow !== false ? 'Yes' : 'No'}
                    </div>
                  </>
                ) : (
                  <p className="text-red-600">
                    No SEO metadata found. Create an SEO Page entry for /about in Payload CMS.
                  </p>
                )}
              </div>
            </section>
          )}

          {/* Main Content */}
          <section className="prose max-w-none">
            <h2 className="text-3xl font-bold mb-4">Our Story</h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              Add your company story here. This content can be managed through
              your Payload CMS or edited directly in this component.
            </p>

            <h2 className="text-3xl font-bold mb-4 mt-8">Our Mission</h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              Define your mission and core values. This section helps build
              trust with your visitors and improves SEO through structured
              content.
            </p>

            <h2 className="text-3xl font-bold mb-4 mt-8">Our Team</h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              Introduce your team members and their expertise. Having detailed About content with author information is beneficial for SEO.
            </p>
          </section>

          {/* Contact CTA */}
          <section className="mt-12 p-8 bg-linear-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <h3 className="text-2xl font-bold mb-4">Get in Touch</h3>
            <p className="text-gray-700 mb-6">
              Have questions? We&apos;d love to hear from you. Contact us today!
            </p>
            <a
              href="/contact"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Contact Us
            </a>
          </section>
        </div>
      </main>
    </>
  )
}
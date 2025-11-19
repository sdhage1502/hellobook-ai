/**
 * Revalidation API Route
 * Triggers Next.js ISR (Incremental Static Regeneration) when content changes in Payload CMS
 * 
 * Usage: Payload CMS calls this endpoint via afterChange hooks
 * 
 * File location: app/api/revalidate/route.ts
 */

import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge'; // Optional: Use edge runtime for faster response

/**
 * POST /api/revalidate
 * Revalidates specific paths based on the collection that changed
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slug, collection, path } = body;

    console.log('Revalidation request:', { slug, collection, path });

    // Revalidate based on collection type
    switch (collection) {
      case 'blogs':
        if (slug) {
          // Revalidate specific blog post
          revalidatePath(`/blogs/${slug}`);
          console.log(`Revalidated: /blogs/${slug}`);
        }
        // Always revalidate blog listing
        revalidatePath('/blogs');
        console.log('Revalidated: /blogs');
        break;

      case 'seo-pages':
      case 'seo-images':
      case 'internal-links':
        // These affect multiple pages, so revalidate layout
        revalidatePath('/', 'layout');
        console.log('Revalidated: entire site');
        break;

      default:
        // If specific path provided, use it
        if (path) {
          revalidatePath(path);
          console.log(`Revalidated: ${path}`);
        } else {
          // Fallback: revalidate everything
          revalidatePath('/', 'layout');
          console.log('Revalidated: entire site (fallback)');
        }
    }

    return NextResponse.json({ 
      revalidated: true, 
      now: Date.now(),
      message: 'Successfully revalidated'
    });

  } catch (err) {
    console.error('Revalidation error:', err);
    return NextResponse.json({ 
      revalidated: false, 
      error: String(err),
      message: 'Revalidation failed'
    }, { status: 500 });
  }
}

/**
 * GET /api/revalidate?secret=xxx
 * Manual revalidation endpoint (secured with secret)
 * Usage: Call this to manually revalidate when needed
 */
export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret');
  const path = request.nextUrl.searchParams.get('path');
  
  // Verify secret to prevent unauthorized revalidation
  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ 
      error: 'Invalid secret',
      message: 'Set REVALIDATE_SECRET in environment variables'
    }, { status: 401 });
  }

  try {
    if (path) {
      // Revalidate specific path
      revalidatePath(path);
      console.log(`Manual revalidation: ${path}`);
      
      return NextResponse.json({ 
        revalidated: true,
        path: path,
        now: Date.now()
      });
    } else {
      // Revalidate everything
      revalidatePath('/', 'layout');
      console.log('Manual revalidation: entire site');
      
      return NextResponse.json({ 
        revalidated: true,
        message: 'Revalidated entire site',
        now: Date.now()
      });
    }
  } catch (err) {
    console.error('Manual revalidation error:', err);
    return NextResponse.json({ 
      revalidated: false, 
      error: String(err) 
    }, { status: 500 });
  }
}

/**
 * OPTIONS handler for CORS preflight
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

/**
 * SETUP INSTRUCTIONS:
 * 
 * 1. Add to your .env.local:
 *    REVALIDATE_SECRET=your-random-secret-key
 * 
 * 2. In Payload CMS .env, add:
 *    NEXT_REVALIDATE_URL=https://yourdomain.com
 * 
 * 3. Test manually:
 *    GET /api/revalidate?secret=your-secret&path=/blogs/test
 * 
 * 4. From Payload hooks, send:
 *    POST /api/revalidate
 *    Body: { slug: "blog-slug", collection: "blogs" }
 * 
 * TROUBLESHOOTING:
 * 
 * - If revalidation not working, check:
 *   1. Environment variables are set correctly
 *   2. Payload CMS can reach your Next.js site
 *   3. Check Next.js logs for revalidation messages
 *   4. Verify ISR is enabled (not in dev mode)
 * 
 * - Test with curl:
 *   curl -X POST https://yourdomain.com/api/revalidate \
 *     -H "Content-Type: application/json" \
 *     -d '{"slug":"test","collection":"blogs"}'
 */
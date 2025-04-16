import { NextRequest, NextResponse } from 'next/server';
import { scrapeWebpage } from '@/utils/scraper';
import { parseArticleWithAI } from '@/utils/ai';

// Add rate limiting for production
const RATE_LIMIT = 10; // requests per minute
const ipRequestCounts = new Map<string, { count: number, timestamp: number }>();

/**
 * Clean up rate limiting data every hour
 */
setInterval(() => {
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  for (const [ip, data] of ipRequestCounts.entries()) {
    if (data.timestamp < oneHourAgo) {
      ipRequestCounts.delete(ip);
    }
  }
}, 60 * 60 * 1000);

/**
 * POST handler for /api/analyze
 * Accepts a URL, scrapes the webpage, and analyzes it with AI
 */
export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    
    // Rate limiting in production
    if (process.env.NODE_ENV === 'production') {
      const now = Date.now();
      const prevRequest = ipRequestCounts.get(ip);
      
      // Reset count if last request was more than a minute ago
      if (prevRequest && now - prevRequest.timestamp > 60 * 1000) {
        ipRequestCounts.set(ip, { count: 1, timestamp: now });
      } 
      // Otherwise increment count
      else if (prevRequest) {
        if (prevRequest.count >= RATE_LIMIT) {
          return NextResponse.json(
            { error: 'Rate limit exceeded. Please try again later.' }, 
            { status: 429 }
          );
        }
        ipRequestCounts.set(ip, { count: prevRequest.count + 1, timestamp: prevRequest.timestamp });
      } 
      // First request from this IP
      else {
        ipRequestCounts.set(ip, { count: 1, timestamp: now });
      }
    }
    
    // Parse request body
    const body = await request.json();
    const { url } = body;
    
    // Validate URL
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }
    
    // Basic URL validation
    try {
      new URL(url);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }
    
    // Get API keys from headers
    const openaiKey = request.headers.get('X-OpenAI-Key') || process.env.OPENAI_API_KEY || '';
    const geminiKey = request.headers.get('X-Gemini-Key') || process.env.GEMINI_API_KEY || '';
    // Use gemini as default provider if not specified
    const rawProvider = request.headers.get('X-API-Provider') || process.env.API_PROVIDER || 'gemini';
    // Validate provider is one of the allowed values
    const apiProvider = (rawProvider === 'openai' || rawProvider === 'gemini') ? rawProvider : 'gemini';
    
    // Validate API keys based on provider
    if (apiProvider === 'openai' && !openaiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key is required for OpenAI provider' }, 
        { status: 400 }
      );
    }
    
    if (apiProvider === 'gemini' && !geminiKey) {
      return NextResponse.json(
        { error: 'Gemini API key is required for Gemini provider' }, 
        { status: 400 }
      );
    }
    
    // Scrape the webpage
    const { title, content, source, author, date, featuredImage, images } = await scrapeWebpage(url);
    
    // Check if we successfully scraped content
    if (!content || content.length < 100) {
      return NextResponse.json(
        { error: 'Failed to extract meaningful content from the URL' },
        { status: 422 }
      );
    }
    
    // Analyze with AI
    const parsedArticle = await parseArticleWithAI(
      title,
      content,
      source,
      author || 'Unknown',
      date || new Date().toISOString(),
      url,
      featuredImage,
      images,
      apiProvider,
      openaiKey,
      geminiKey
    );
    
    return NextResponse.json(parsedArticle);
  } catch (error: any) {
    console.error('Error in analyze API:', error);
    
    // Return appropriate error responses based on error type
    if (error.message.includes('timeout') || error.message.includes('ECONNABORTED')) {
      return NextResponse.json(
        { error: 'Request timed out. The website may be too slow to respond.' },
        { status: 504 }
      );
    }
    
    if (error.message.includes('rate limit')) {
      return NextResponse.json(
        { error: 'AI provider rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }
    
    if (error.message.includes('API key')) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
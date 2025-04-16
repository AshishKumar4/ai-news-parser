import { NextResponse } from 'next/server';
import { scrapeWebpage } from '@/utils/scraper';
import { parseArticleWithAI } from '@/utils/ai';

export async function POST(request: Request) {
  try {
    // Extract API keys from headers
    const openaiKey = request.headers.get('X-OpenAI-Key') || process.env.OPENAI_API_KEY || '';
    const geminiKey = request.headers.get('X-Gemini-Key') || process.env.GEMINI_API_KEY || '';
    const apiProvider = request.headers.get('X-API-Provider') || process.env.API_PROVIDER || 'gemini';

    // Get URL from request body
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Step 1: Scrape the webpage content
    const { 
      title, 
      content, 
      source, 
      author = 'Unknown', 
      date = 'Unknown',
      featuredImage,
      images 
    } = await scrapeWebpage(url);

    // Step 2: Parse the content with the selected AI provider (using the centralized utility function)
    const parsedArticle = await parseArticleWithAI(
      title, content, source, author, date, url, featuredImage, images,
      apiProvider, openaiKey, geminiKey
    );

    return NextResponse.json(parsedArticle);
  } catch (error: any) {
    console.error('Error in analyze route:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to analyze article' },
      { status: 500 }
    );
  }
}
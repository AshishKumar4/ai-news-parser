import { NextResponse } from 'next/server';
import { scrapeWebpage } from '@/utils/scraper';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: Request) {
  try {
    // Extract API keys from headers
    const openaiKey = request.headers.get('X-OpenAI-Key') || process.env.OPENAI_API_KEY || '';
    const geminiKey = request.headers.get('X-Gemini-Key') || process.env.GEMINI_API_KEY || '';
    const apiProvider = request.headers.get('X-API-Provider') || process.env.API_PROVIDER || 'openai';

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

    // Step 2: Parse the content with the selected AI provider
    const parsedArticle = await parseArticleWithSelectedAI(
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

async function parseArticleWithSelectedAI(
  title: string,
  content: string,
  source: string,
  author: string,
  date: string,
  url: string,
  featuredImage: any,
  images: any[],
  apiProvider: string,
  openaiKey: string,
  geminiKey: string
) {
  try {
    if (apiProvider === 'gemini') {
      return await parseWithGemini(title, content, source, author, date, url, featuredImage, images, geminiKey);
    } else {
      return await parseWithOpenAI(title, content, source, author, date, url, featuredImage, images, openaiKey);
    }
  } catch (error) {
    console.error('Error parsing with AI:', error);
    throw new Error('Failed to analyze article content. Please check your API key and try again.');
  }
}

async function parseWithOpenAI(
  title: string,
  content: string,
  source: string,
  author: string,
  date: string,
  url: string,
  featuredImage: any,
  images: any[],
  apiKey: string
) {
  const openai = new OpenAI({ apiKey });
  
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: `You are an expert journalist that specializes in analyzing news articles and providing structured summaries. 
        Parse the provided article and create a smart story format with the following structure:
        1. A concise summary of the entire article
        2. 3-5 key highlights from the article (important points)
        3. Detailed sections breaking down different aspects of the article. Create logical section titles that fit the content.
        Each section must include:
           - A brief summary for that specific section
           - 2-3 key highlights specific to that section
        
        Return the data in JSON format only with the structure: 
        {
          "summary": "concise summary here",
          "highlights": ["highlight 1", "highlight 2", ...],
          "sections": [
            { 
              "title": "Section Title 1", 
              "content": "Section content...",
              "summary": "Brief summary for this section",
              "highlights": ["Section-specific highlight 1", "Section-specific highlight 2"] 
            },
            { 
              "title": "Section Title 2", 
              "content": "More content...",
              "summary": "Brief summary for this section",
              "highlights": ["Section-specific highlight 1", "Section-specific highlight 2"] 
            }
          ]
        }`
      },
      {
        role: "user",
        content: `Title: ${title}\nContent: ${content}\n\nAnalyze this article and return the structured data.`
      }
    ],
    response_format: { type: "json_object" }
  });

  const result = JSON.parse(response.choices[0].message.content || '{}');
  
  return formatParsedArticle(result, title, source, author, date, url, featuredImage, images);
}

async function parseWithGemini(
  title: string,
  content: string,
  source: string,
  author: string,
  date: string,
  url: string,
  featuredImage: any,
  images: any[],
  apiKey: string
) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  
  const prompt = `You are an expert journalist that specializes in analyzing news articles and providing structured summaries.
  Parse the provided article and create a smart story format with the following structure:
  1. A concise summary of the entire article
  2. 3-5 key highlights from the article (important points)
  3. Detailed sections breaking down different aspects of the article. Create logical section titles that fit the content.
  Each section must include:
     - A brief summary for that specific section
     - 2-3 key highlights specific to that section
  
  Article Title: ${title}
  Article Content: ${content}
  
  Return the data in JSON format only with the structure:
  {
    "summary": "concise summary here",
    "highlights": ["highlight 1", "highlight 2", ...],
    "sections": [
      { 
        "title": "Section Title 1", 
        "content": "Section content...",
        "summary": "Brief summary for this section",
        "highlights": ["Section-specific highlight 1", "Section-specific highlight 2"] 
      },
      { 
        "title": "Section Title 2", 
        "content": "More content...",
        "summary": "Brief summary for this section",
        "highlights": ["Section-specific highlight 1", "Section-specific highlight 2"] 
      }
    ]
  }`;

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();
  
  // Extract JSON from the response (in case there's any additional text)
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  const jsonString = jsonMatch ? jsonMatch[0] : '{}';
  const parsedResult = JSON.parse(jsonString);
  
  return formatParsedArticle(parsedResult, title, source, author, date, url, featuredImage, images);
}

function formatParsedArticle(
  result: any, 
  title: string, 
  source: string, 
  author: string, 
  date: string, 
  url: string,
  featuredImage: any,
  images: any[]
) {
  return {
    metadata: {
      title,
      source,
      author,
      date,
      url,
      featuredImage,
      images
    },
    summary: result.summary || '',
    highlights: (result.highlights || []).map((item: string) => ({ content: item })),
    sections: (result.sections || []).map((section: any, index: number) => ({
      id: `section-${index}`,
      title: section.title,
      content: section.content,
      summary: section.summary || '',
      highlights: (section.highlights || []).map((highlight: string) => ({ content: highlight }))
    }))
  };
}
import { ParsedArticle } from '@/types';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Parses an article using the selected AI provider (OpenAI or Gemini)
 * 
 * @param title Article title
 * @param content Article content
 * @param source Source of the article
 * @param author Article author
 * @param date Publication date
 * @param url Article URL
 * @param featuredImage Featured image for the article
 * @param images Additional article images
 * @param apiProvider Which AI provider to use ('openai' or 'gemini')
 * @param openaiKey Optional OpenAI API key
 * @param geminiKey Optional Gemini API key
 * @returns Parsed article data
 */
export async function parseArticleWithAI(
  title: string,
  content: string,
  source: string,
  author: string,
  date: string,
  url: string,
  featuredImage: any = undefined,
  images: any[] = [],
  apiProvider: string = 'openai',
  openaiKey: string = process.env.OPENAI_API_KEY || '',
  geminiKey: string = process.env.GEMINI_API_KEY || ''
): Promise<ParsedArticle> {
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
  featuredImage: any = undefined,
  images: any[] = [],
  apiKey: string = process.env.OPENAI_API_KEY || ''
): Promise<ParsedArticle> {
  const openai = new OpenAI({ apiKey });
  
  const response = await openai.chat.completions.create({
    model: "gpt-4.1",
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
  featuredImage: any = undefined,
  images: any[] = [],
  apiKey: string = process.env.GEMINI_API_KEY || ''
): Promise<ParsedArticle> {
  if (!apiKey) {
    throw new Error('Gemini API key is required');
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
  
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
): ParsedArticle {
  return {
    metadata: {
      title,
      source,
      author,
      date,
      url,
      description: result.summary || '', // Add description using the article summary
      featuredImage,
      images
    },
    summary: result.summary || '',
    highlights: (result.highlights || []).map((item: string) => ({ content: item })),
    sections: (result.sections || []).map((section: any, index: number) => ({
      id: `section-${index}`,
      title: section.title,
      subtitle: section.title ? `Details about ${section.title.toLowerCase()}` : '', // Add a generated subtitle
      content: section.content,
      summary: section.summary || '',
      highlights: (section.highlights || []).map((highlight: string) => ({ content: highlight }))
    }))
  };
}
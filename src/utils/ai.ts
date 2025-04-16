import { ParsedArticle } from '@/types';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function parseArticleWithAI(
  title: string,
  content: string,
  source: string,
  author: string,
  date: string,
  url: string,
  featuredImage: any = undefined,
  images: any[] = []
): Promise<ParsedArticle> {
  try {
    const apiProvider = process.env.API_PROVIDER || 'openai';
    
    if (apiProvider === 'gemini') {
      return await parseWithGemini(title, content, source, author, date, url, featuredImage, images);
    } else {
      return await parseWithOpenAI(title, content, source, author, date, url, featuredImage, images);
    }
  } catch (error) {
    console.error('Error parsing article with AI:', error);
    throw new Error('Failed to analyze the article content. Please try again.');
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
  images: any[] = []
): Promise<ParsedArticle> {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo", // Changed from "gpt-4.1" to a valid model
    messages: [
      {
        role: "system",
        content: `You are an expert journalist that specializes in analyzing news articles and providing structured summaries. 
        Parse the provided article and create a smart story format with the following structure:
        1. A concise summary of the entire article
        2. 3-5 key highlights from the article (important points)
        3. Detailed sections breaking down different aspects of the article. Create logical section titles that fit the content.
        Return the data in JSON format only with the structure: 
        {
          "summary": "concise summary here",
          "highlights": ["highlight 1", "highlight 2", ...],
          "sections": [
            { "title": "Section Title 1", "content": "Section content..." },
            { "title": "Section Title 2", "content": "More content..." }
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
  images: any[] = []
): Promise<ParsedArticle> {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  
  const prompt = `You are an expert journalist that specializes in analyzing news articles and providing structured summaries.
  Parse the provided article and create a smart story format with the following structure:
  1. A concise summary of the entire article
  2. 3-5 key highlights from the article (important points)
  3. Detailed sections breaking down different aspects of the article. Create logical section titles that fit the content.
  
  Article Title: ${title}
  Article Content: ${content}
  
  Return the data in JSON format only with the structure:
  {
    "summary": "concise summary here",
    "highlights": ["highlight 1", "highlight 2", ...],
    "sections": [
      { "title": "Section Title 1", "content": "Section content..." },
      { "title": "Section Title 2", "content": "More content..." }
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
  featuredImage: any = undefined,
  images: any[] = []
): ParsedArticle {
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
      content: section.content
    }))
  };
}
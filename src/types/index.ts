/**
 * Represents a section of an article with its content and highlights
 */
export interface Section {
  id: string;
  title: string;
  subtitle?: string;
  content: string;
  summary?: string;
  highlights?: StoryHighlight[];
}

/**
 * Represents a key highlight or important point from an article
 */
export interface StoryHighlight {
  content: string;
}

/**
 * Represents an image from an article with URL and alt text
 */
export interface ArticleImage {
  url: string;
  alt: string;
}

/**
 * Contains all metadata about an article
 */
export interface ArticleMetadata {
  title: string;
  source: string;
  author: string;
  date: string;
  url: string;
  description?: string;
  featuredImage?: ArticleImage;
  images: ArticleImage[];
}

/**
 * Represents a fully parsed article with all its components
 */
export interface ParsedArticle {
  metadata: ArticleMetadata;
  summary: string;
  highlights: StoryHighlight[];
  sections: Section[];
}

/**
 * Represents AI provider configuration options
 */
export interface AIProviderConfig {
  provider: 'openai' | 'gemini';
  openaiKey?: string;
  geminiKey?: string;
}
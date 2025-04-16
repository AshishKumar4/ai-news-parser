export interface Section {
  id: string;
  title: string;
  content: string;
  summary?: string;
  highlights?: StoryHighlight[];
}

export interface StoryHighlight {
  content: string;
}

export interface ArticleImage {
  url: string;
  alt: string;
}

export interface ArticleMetadata {
  title: string;
  source: string;
  author: string;
  date: string;
  url: string;
  featuredImage?: ArticleImage;
  images: ArticleImage[];
}

export interface ParsedArticle {
  metadata: ArticleMetadata;
  summary: string;
  highlights: StoryHighlight[];
  sections: Section[];
}
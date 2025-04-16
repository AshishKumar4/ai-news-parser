import axios from 'axios';
import * as cheerio from 'cheerio';
import { ArticleImage } from '@/types';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import type { CheerioAPI } from 'cheerio';

interface ScrapedArticle {
  title: string;
  content: string;
  source: string;
  author?: string;
  date?: string;
  featuredImage?: ArticleImage;
  images: ArticleImage[];
}

/**
 * Scrapes a webpage for article content using multiple strategies
 * 
 * @param url URL to scrape
 * @returns Extracted article data including title, content, metadata and images
 */
export async function scrapeWebpage(url: string): Promise<ScrapedArticle> {
  try {
    // Fetch the webpage content with timeout and proper headers
    const response = await axios.get(url, { 
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    const html = response.data;
    
    // Apply both Readability and Cheerio strategies for best results
    const readabilityResult = extractWithReadability(html, url);
    const cheerioResult = extractWithCheerio(html, url);
    
    // Combine results, preferring Readability for content extraction
    // and using Cheerio for better metadata and image extraction
    const defaultSource = new URL(url).hostname.replace('www.', '');
    return {
      title: readabilityResult.title || cheerioResult.title,
      content: readabilityResult.content || cheerioResult.content,
      source: cheerioResult.source || readabilityResult.source || defaultSource,
      author: cheerioResult.author || readabilityResult.author,
      date: cheerioResult.date || readabilityResult.date,
      featuredImage: cheerioResult.featuredImage || readabilityResult.featuredImage,
      images: [...new Map([...cheerioResult.images, ...(readabilityResult.images || [])].map(
        img => [img.url, img]
      )).values()]  // Remove duplicate images
    };
  } catch (error) {
    console.error('Error scraping webpage:', error);
    if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
      throw new Error('Request timed out. The website may be too slow to respond.');
    }
    throw new Error('Failed to scrape webpage. Please check the URL and try again.');
  }
}

/**
 * Extract article content using Mozilla's Readability library
 */
function extractWithReadability(html: string, url: string): Partial<ScrapedArticle> {
  try {
    // Parse with JSDOM and Readability
    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();
    
    if (!article) {
      return {}; // Readability couldn't parse the article
    }
    
    // Extract images from parsed article content
    const contentDom = new JSDOM(article.content ?? '');
    const images: ArticleImage[] = [];
    const imgElements = contentDom.window.document.querySelectorAll('img');
    
    imgElements.forEach(img => {
      const src = img.getAttribute('src');
      const alt = img.getAttribute('alt') || '';
      
      if (src && !src.startsWith('data:') && 
          !src.includes('pixel.') && !src.includes('tracker.') && 
          !src.includes('avatar') && !src.includes('logo')) {
        let fullUrl = src;
        try {
          // Convert relative URLs to absolute
          if (!src.startsWith('http')) {
            fullUrl = new URL(src, url).toString();
          }
          images.push({ url: fullUrl, alt });
        } catch (e) {
          // Skip invalid URLs
        }
      }
    });
    
    // Extract hostname as a fallback source
    const hostname = new URL(url).hostname.replace('www.', '');
    
    return {
      title: article.title ?? '',
      content: article.textContent ?? '',
      source: hostname,
      author: article.byline || undefined,
      date: article.siteName || undefined,
      images
    };
  } catch (error) {
    console.error('Readability extraction failed:', error);
    return {}; // Return empty object to fall back to Cheerio
  }
}

/**
 * Extract article content using Cheerio with advanced selectors
 */
function extractWithCheerio(html: string, url: string): ScrapedArticle {
  const $ = cheerio.load(html);
  const hostname = new URL(url).hostname;
  
  // Extract title with multiple strategies
  const title = extractTitle($, hostname);
  
  // Extract content with comprehensive selection logic
  const content = extractContent($);
  
  // Extract source/publisher with fallbacks
  const source = extractSource($, hostname);
  
  // Extract author with multiple strategies
  const author = extractAuthor($);
  
  // Extract date with multiple strategies
  const date = extractDate($);
  
  // Extract images with smart filtering
  const images = extractImages($, url);
  
  // Get featured image (first or most prominent)
  const featuredImage = images.length > 0 ? images[0] : undefined;
  
  return {
    title,
    content,
    source,
    author,
    date,
    featuredImage,
    images
  };
}

/**
 * Extract the article title using multiple strategies
 */
function extractTitle($: CheerioAPI, hostname: string): string {
  // Try multiple title selectors
  const titleSelectors = [
    'meta[property="og:title"]',
    'meta[name="twitter:title"]',
    'meta[name="title"]',
    'h1.article-title',
    'h1.entry-title',
    'h1.post-title',
    'h1.headline',
    'h1',
    '.article-title',
    '.entry-title',
    '.post-title',
    '.headline',
    'title'
  ];
  
  let title = '';
  
  // Try each selector until we find a title
  for (const selector of titleSelectors) {
    if (selector === 'title') {
      title = $(selector).text().trim();
    } else {
      title = $(selector).attr('content') || $(selector).text().trim();
    }
    if (title) break;
  }
  
  // Clean up title
  const sourceMatch = hostname.replace('www.', '').split('.')[0];
  
  // Remove source name and any separators like " | " or " - " at the end of the title
  title = title.replace(new RegExp(`\\s*[\\|\\-\\:]\\s*${sourceMatch}.*$`, 'i'), '');
  title = title.replace(/\s*\|\s*.*$/, ''); // Remove anything after a pipe symbol
  title = title.replace(/\s*\-\s*.*$/, ''); // Remove anything after a dash
  title = title.replace(/\s*:\s*.*$/, ''); // Remove anything after a colon if at the end
  
  return title.trim();
}

/**
 * Extract content using a multi-strategy approach
 */
function extractContent($: CheerioAPI): string {
  // Article-specific selectors, ordered by priority
  const contentSelectors = [
    'article', 
    '[role="article"]', 
    '.article-content',
    '.article-body',
    '.post-content',
    '.entry-content',
    '.story-content',
    '.story-body',
    '.story',
    '.post', 
    '.content',
    '.main-content',
    '.body',
    'main',
    '#content',
    '#main'
  ];
  
  let content = '';
  let bestSelector = '';
  
  // Try each selector and keep the one that gives the most content
  for (const selector of contentSelectors) {
    const $clone = $(selector).clone();
    
    // Remove non-content elements
    $clone.find('script, style, nav, header, footer, aside, .sidebar, .comments, .related, .ad, .advertisement, .promo, .sharing, .social, .nav, .menu, form, iframe, [role="complementary"], [role="banner"], [role="contentinfo"], [role="navigation"]').remove();
    
    const selectedContent = $clone.text().trim();
    if (selectedContent && selectedContent.length > content.length) {
      content = selectedContent;
      bestSelector = selector;
    }
  }
  
  // If no content found with specific selectors, get body content but exclude obvious non-article elements
  if (!content || content.length < 500) {
    const $bodyClone = $('body').clone();
    $bodyClone.find('nav, header, footer, [role="navigation"], .navigation, .nav, .menu, .sidebar, script, style, noscript, [role="complementary"], [role="banner"], [role="contentinfo"], [role="navigation"]').remove();
    content = $bodyClone.text().trim();
  }
  
  // Clean up content
  return content.replace(/\s+/g, ' ').trim();
}

/**
 * Extract the publication source
 */
function extractSource($: CheerioAPI, hostname: string): string {
  // Try multiple selectors for source
  const sourceSelectors = [
    'meta[property="og:site_name"]',
    'meta[name="application-name"]',
    'meta[property="publisher"]',
    '.site-name',
    '.brand',
    '.publisher',
    '.publication'
  ];
  
  // Try each selector
  for (const selector of sourceSelectors) {
    const source = $(selector).attr('content') || $(selector).text().trim();
    if (source) return source;
  }
  
  // Fallback to hostname
  return hostname.replace('www.', '');
}

/**
 * Extract the article author with multiple strategies
 */
function extractAuthor($: CheerioAPI): string {
  // Author-specific selectors
  const authorSelectors = [
    'meta[name="author"]',
    'meta[property="article:author"]',
    'meta[name="dc.creator"]',
    '[rel="author"]',
    '.byline',
    '.author',
    '.byline-name',
    '.writer',
    '.creator',
    '[class*="author"]',
    '[class*="byline"]',
    '[itemprop="author"]'
  ];
  
  for (const selector of authorSelectors) {
    const author = $(selector).attr('content') || $(selector).text().trim();
    if (author) {
      // Clean up author (remove "By" or "Author:" prefixes)
      return author.replace(/^(by|author|written by)\s*:?\s*/i, '').trim();
    }
  }
  
  return 'Unknown';
}

/**
 * Extract the publication date using multiple strategies
 */
function extractDate($: CheerioAPI): string {
  // Date-specific selectors
  const dateSelectors = [
    'meta[property="article:published_time"]',
    'meta[name="date"]',
    'meta[name="pubdate"]',
    'meta[name="dc.date"]',
    '[itemprop="datePublished"]',
    'time',
    '[datetime]',
    '.date',
    '.time',
    '.published',
    '.pub-date',
    '.timestamp',
    '[class*="date"]',
    '[class*="time"]'
  ];
  
  let dateStr = '';
  
  for (const selector of dateSelectors) {
    dateStr = $(selector).attr('content') || 
              $(selector).attr('datetime') || 
              $(selector).text().trim();
    if (dateStr) {
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return date.toISOString();
      }
      return dateStr; // Return as is if we can't parse it
    }
  }
  
  // Look for date patterns in the HTML
  const htmlStr = $.html();
  const datePattern = /\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4}|\d{2}\.\d{2}\.\d{4}|\w+ \d{1,2},? \d{4}/g;
  const matches = htmlStr.match(datePattern);
  
  if (matches && matches.length > 0) {
    const date = new Date(matches[0]);
    if (!isNaN(date.getTime())) {
      return date.toISOString();
    }
    return matches[0]; // Return the matched string if we can't parse it
  }
  
  return 'Unknown';
}

/**
 * Extract article images with smart filtering
 */
function extractImages($: CheerioAPI, url: string): ArticleImage[] {
  const images: ArticleImage[] = [];
  const seenUrls = new Set<string>();
  const base = new URL(url);
  
  // Helper function to process image
  function processImage(element: any): void {
    // Check multiple sources for the image
    const imgSrc = $(element).attr('src') || 
                  $(element).attr('data-src') || 
                  $(element).attr('data-lazy-src') || 
                  $(element).attr('data-original');
                  
    if (!imgSrc) return;
    
    // Skip tracking pixels, data URLs, avatars, etc.
    if (imgSrc.startsWith('data:') || 
        imgSrc.includes('1x1') || 
        imgSrc.includes('pixel.') || 
        imgSrc.includes('tracker.') ||
        imgSrc.includes('avatar') || 
        imgSrc.includes('logo') ||
        imgSrc.length < 10) {
      return;
    }
    
    const imgAlt = $(element).attr('alt') || 
                  $(element).attr('title') || 
                  '';
    
    try {
      // Convert relative URLs to absolute
      let fullImgUrl = imgSrc;
      if (!imgSrc.startsWith('http')) {
        fullImgUrl = new URL(imgSrc, base.origin).toString();
      }
      
      // Skip duplicates
      if (!seenUrls.has(fullImgUrl)) {
        seenUrls.add(fullImgUrl);
        
        // Get image dimensions if available
        const width = parseInt($(element).attr('width') || '0');
        const height = parseInt($(element).attr('height') || '0');
        
        // Prioritize larger images
        const isPriority = width > 300 || height > 300 || 
                          $(element).parent().is('figure') ||
                          $(element).hasClass('featured') ||
                          imgSrc.includes('featured') ||
                          imgSrc.includes('hero');
                          
        // Add to our collection (priority images go first)
        if (isPriority) {
          images.unshift({
            url: fullImgUrl,
            alt: imgAlt
          });
        } else {
          images.push({
            url: fullImgUrl,
            alt: imgAlt
          });
        }
      }
    } catch (error) {
      // Skip invalid URLs
    }
  }
  
  // Get meta/og images first (usually high quality)
  const metaImages = [
    $('meta[property="og:image"]').attr('content'),
    $('meta[name="twitter:image"]').attr('content'),
    $('meta[name="twitter:image:src"]').attr('content')
  ].filter(Boolean) as string[];
  
  for (const imgSrc of metaImages) {
    if (!seenUrls.has(imgSrc)) {
      seenUrls.add(imgSrc);
      images.push({
        url: imgSrc,
        alt: $('meta[property="og:title"]').attr('content') || $('title').text() || ''
      });
    }
  }
  
  // Look for images in article containers
  const contentSelectors = [
    'article', 
    '[role="article"]', 
    '.article-content',
    '.post-content',
    '.entry-content',
    '.story-content',
    '.post', 
    '.content',
    'main'
  ];
  
  for (const selector of contentSelectors) {
    // Check for figure elements with images (likely to be content-related)
    $(selector).find('figure img').each((_, element) => processImage(element));
    
    // Check for images directly in the content
    $(selector).find('img').each((_, element) => processImage(element));
  }
  
  // If fewer than 2 images found, look more broadly
  if (images.length < 2) {
    $('img').each((_, element) => processImage(element));
  }
  
  return images;
}
import axios from 'axios';
import * as cheerio from 'cheerio';
import { ArticleImage } from '@/types';

export async function scrapeWebpage(url: string): Promise<{
  title: string;
  content: string;
  source: string;
  author?: string;
  date?: string;
  featuredImage?: ArticleImage;
  images: ArticleImage[];
}> {
  try {
    // Fetch the webpage content
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);
    
    // Extract title
    let title = $('title').text() || $('h1').first().text() || '';
    
    // Clean up title - remove source name if it appears at the end
    const sourceMatch = new URL(url).hostname.replace('www.', '').split('.')[0];
    // Remove source name and any separators like " | " or " - " at the end of the title
    title = title.replace(new RegExp(`\\s*[\\|\\-\\:]\\s*${sourceMatch}.*$`, 'i'), '');
    title = title.replace(/\s*\|\s*.*$/, ''); // Remove anything after a pipe symbol
    title = title.replace(/\s*\-\s*.*$/, ''); // Remove anything after a dash
    title = title.replace(/\s*:\s*.*$/, ''); // Remove anything after a colon if at the end
    title = title.trim();
    
    // Try to find article content
    let contentSelector = 'article, [role="article"], .article, .post, .content, main';
    let content = $(contentSelector).text();
    
    // If no content found with specific selectors, get body content
    if (!content.trim()) {
      content = $('body').text();
    }
    
    // Clean up content (remove extra whitespace)
    content = content.replace(/\s+/g, ' ').trim();
    
    // Try to extract source/publisher
    const source = $('meta[property="og:site_name"]').attr('content') || 
                  new URL(url).hostname.replace('www.', '');
    
    // Try to extract author
    const author = $('meta[name="author"]').attr('content') || 
                  $('[rel="author"]').text() || 
                  $('.author').text() || 
                  $('[class*="author"]').first().text() || 
                  '';
    
    // Try to extract date
    const date = $('meta[property="article:published_time"]').attr('content') ||
                $('meta[name="date"]').attr('content') ||
                $('time').attr('datetime') ||
                $('[class*="date"], [class*="time"], time').first().text() ||
                '';
    
    // Extract images
    const images: ArticleImage[] = [];
    
    // Find all images in the article
    const articleSelector = 'article, [role="article"], .article, .post, .content, main';
    $(articleSelector + ' img').each((_, element) => {
      const imgSrc = $(element).attr('src');
      const imgAlt = $(element).attr('alt') || '';
      
      if (imgSrc && !imgSrc.startsWith('data:') && !imgSrc.includes('avatar') && !imgSrc.includes('logo')) {
        // Try to get full URL if relative
        let fullImgUrl = imgSrc;
        if (!imgSrc.startsWith('http')) {
          const base = new URL(url);
          fullImgUrl = new URL(imgSrc, base.origin).toString();
        }
        
        images.push({
          url: fullImgUrl,
          alt: imgAlt
        });
      }
    });
    
    // If no images found in article, look in the whole document
    if (images.length === 0) {
      $('img').each((_, element) => {
        const imgSrc = $(element).attr('src');
        const imgAlt = $(element).attr('alt') || '';
        
        if (imgSrc && !imgSrc.startsWith('data:') && !imgSrc.includes('avatar') && !imgSrc.includes('logo')) {
          // Try to get full URL if relative
          let fullImgUrl = imgSrc;
          if (!imgSrc.startsWith('http')) {
            const base = new URL(url);
            fullImgUrl = new URL(imgSrc, base.origin).toString();
          }
          
          images.push({
            url: fullImgUrl,
            alt: imgAlt
          });
        }
      });
    }
    
    // Also check for meta og:image
    const ogImage = $('meta[property="og:image"]').attr('content');
    if (ogImage && !images.some(img => img.url === ogImage)) {
      images.unshift({
        url: ogImage,
        alt: title
      });
    }
    
    // Set featured image to the first image
    const featuredImage = images.length > 0 ? images[0] : undefined;
    
    return {
      title,
      content,
      source,
      author: author.trim(),
      date: date.trim(),
      featuredImage,
      images
    };
  } catch (error) {
    console.error('Error scraping webpage:', error);
    throw new Error('Failed to scrape webpage. Please check the URL and try again.');
  }
}
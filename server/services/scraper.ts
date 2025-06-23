import { storage } from "../storage";
import { ragService } from "./rag";

class ScraperService {
  async scrapeWebsite(sessionId: string, url: string): Promise<void> {
    try {
      // In a production environment, you'd use a proper web scraping library
      // For this demo, we'll simulate website content extraction
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch website: ${response.status}`);
      }
      
      const html = await response.text();
      const content = await this.extractTextFromHTML(html);
      const title = await this.extractTitleFromHTML(html);
      
      // Store website content
      const websiteContent = await storage.createWebsiteContent({
        sessionId,
        url,
        title: title || url,
        content,
      });
      
      // Generate embeddings for website content
      const embedding = ragService['simpleTextEmbedding'](content);
      await storage.updateWebsiteContentEmbedding(websiteContent.id, embedding);
      
    } catch (error) {
      console.error('Website scraping failed:', error);
      throw error;
    }
  }

  private async extractTextFromHTML(html: string): Promise<string> {
    const cheerio = await import('cheerio');
    const $ = cheerio.load(html);
    
    // Remove script, style, and navigation elements
    $('script, style, nav, header, footer, .nav, .navigation, .sidebar').remove();
    
    // Focus on main content areas
    const contentSelectors = [
      'main', 
      '[role="main"]', 
      '.main-content', 
      '.content', 
      'article', 
      '.article',
      '.post-content',
      '#content'
    ];
    
    let text = '';
    
    // Try to extract from main content areas first
    for (const selector of contentSelectors) {
      const content = $(selector).text();
      if (content && content.length > 100) {
        text = content;
        break;
      }
    }
    
    // If no main content found, extract from body
    if (!text) {
      text = $('body').text();
    }
    
    // Clean up whitespace and limit length
    text = text.replace(/\s+/g, ' ').trim();
    return text.substring(0, 8000); // Increased limit for better context
  }

  private async extractTitleFromHTML(html: string): Promise<string | null> {
    const cheerio = await import('cheerio');
    const $ = cheerio.load(html);
    
    // Try multiple title extraction methods
    let title = $('title').text().trim();
    
    if (!title) {
      title = $('h1').first().text().trim();
    }
    
    if (!title) {
      title = $('meta[property="og:title"]').attr('content') || '';
    }
    
    return title || null;
  }
}

export const scraperService = new ScraperService();

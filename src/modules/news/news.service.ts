import { Injectable, Logger } from '@nestjs/common';
import Parser from 'rss-parser';

export interface NewsArticle {
  title: string;
  link: string;
  pubDate: string;
  contentSnippet?: string;
  content?: string;
  source: string;
  guid?: string;
}

@Injectable()
export class NewsService {
  private readonly logger = new Logger(NewsService.name);
  private readonly parser: Parser;

  // For now we only fetch from a single tech feed.
  private readonly techFeeds = ['https://techcrunch.com/feed/'];

  constructor() {
    this.parser = new Parser({
      customFields: {
        item: ['content:encoded', 'media:content', 'guid'],
      },
      timeout: 10000,
    });
  }

  async getTechNews(limit = 10): Promise<NewsArticle[]> {
    const allArticles: NewsArticle[] = [];

    try {
      this.logger.log(`Fetching tech news from ${this.techFeeds.length} feeds...`);

      const feedPromises = this.techFeeds.map((feedUrl) =>
        this.fetchFeed(feedUrl).catch((error: Error) => {
          this.logger.warn(`Failed to fetch feed ${feedUrl}: ${error.message}`);
          return [];
        }),
      );

      const feedResults = await Promise.all(feedPromises);

      feedResults.forEach((articles) => {
        allArticles.push(...articles);
      });

      this.logger.log(`Fetched ${allArticles.length} total articles`);

      allArticles.sort((a, b) => {
        const dateA = new Date(a.pubDate).getTime();
        const dateB = new Date(b.pubDate).getTime();
        return dateB - dateA;
      });

      const uniqueArticles = this.removeDuplicates(allArticles);

      this.logger.log(`After deduplication: ${uniqueArticles.length} unique articles`);

      return uniqueArticles.slice(0, limit);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error fetching tech news: ${message}`);
      throw error;
    }
  }

  private async fetchFeed(feedUrl: string): Promise<NewsArticle[]> {
    try {
      const feed = await this.parser.parseURL(feedUrl);
      const source = feed.title || new URL(feedUrl).hostname;

      return (
        feed.items?.map((item) => ({
          title: item.title || 'Untitled',
          link: item.link || '',
          pubDate: (item as any).pubDate || (item as any).isoDate || new Date().toISOString(),
          contentSnippet: item.contentSnippet || item.content?.substring(0, 200) || '',
          content: item.content || (item as any)['content:encoded'] || '',
          source,
          guid: (item as any).guid || (item as any).id || item.link,
        })) ?? []
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error parsing feed ${feedUrl}: ${message}`);
      return [];
    }
  }

  private removeDuplicates(articles: NewsArticle[]): NewsArticle[] {
    const seen = new Set<string>();
    const unique: NewsArticle[] = [];

    for (const article of articles) {
      const normalizedTitle = article.title.toLowerCase().trim();
      let key: string;

      try {
        const urlDomain = new URL(article.link).hostname;
        key = `${normalizedTitle}-${urlDomain}`;
      } catch {
        key = normalizedTitle;
      }

      if (!seen.has(key)) {
        seen.add(key);
        unique.push(article);
      }
    }

    return unique;
  }
}


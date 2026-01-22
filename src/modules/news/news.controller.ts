import { Controller, Get, Query } from '@nestjs/common';
import { NewsService } from './news.service';

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get('tech')
  async getTechNews(@Query('limit') limit?: string) {
    const parsedLimit = limit ? parseInt(limit, 10) || 10 : 10;
    const data = await this.newsService.getTechNews(parsedLimit);

    return {
      success: true,
      data,
      count: data.length,
    };
  }
}


import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { NewsService } from './news.service';
import { NewsDigestService } from './news-digest.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('news')
@UseGuards(AuthGuard)
export class NewsController {
  constructor(
    private readonly newsService: NewsService,
    private readonly newsDigestService: NewsDigestService,
  ) {}

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

  @Post('digest/send')
  async sendDigest() {
    try {
      await this.newsDigestService.sendWeeklyTechDigest();
      return {
        success: true,
        message:
          'Weekly tech news digest sent successfully to all clients',
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to send digest';
      console.error('Error in sendDigest controller:', error);
      return {
        success: false,
        message: errorMessage,
        error: error instanceof Error ? error.stack : String(error),
      };
    }
  }

  /**
   * Test endpoint to simulate EventBridge scheduled event locally
   * This tests the exact same Lambda handler code that EventBridge will trigger
   */
  @Post('digest/test-eventbridge')
  async testEventBridge() {
    try {
      console.log('=== Testing EventBridge Scheduled Event Locally ===');
      
      // Import the Lambda handler
      const { handler } = await import('../../lambda.js');
      
      // Simulate EventBridge scheduled event structure
      const simulatedEvent = {
        version: '0',
        id: 'test-event-id-' + Date.now(),
        'detail-type': 'Scheduled Event',
        source: 'aws.events',
        account: '123456789012',
        time: new Date().toISOString(),
        region: 'ap-southeast-2',
        resources: [
          'arn:aws:events:ap-southeast-2:123456789012:rule/weekly-news-digest',
        ],
        detail: {},
      };

      console.log('Simulated EventBridge event:', JSON.stringify(simulatedEvent, null, 2));

      // Create a mock Lambda context
      const mockContext = {
        awsRequestId: 'test-request-id',
        functionName: 'sendWeeklyDigest',
        functionVersion: '$LATEST',
        invokedFunctionArn: 'arn:aws:lambda:ap-southeast-2:123456789012:function:sendWeeklyDigest',
        memoryLimitInMB: '512',
        getRemainingTimeInMillis: () => 30000,
      } as any;

      // Call the Lambda handler with the simulated EventBridge event
      const result = await handler(simulatedEvent, mockContext, () => {});

      console.log('Lambda handler result:', JSON.stringify(result, null, 2));

      return {
        success: true,
        message: 'EventBridge scheduled event test completed',
        event: simulatedEvent,
        lambdaResult: result,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to test EventBridge event';
      console.error('Error in testEventBridge controller:', error);
      return {
        success: false,
        message: errorMessage,
        error: error instanceof Error ? error.stack : String(error),
      };
    }
  }
}


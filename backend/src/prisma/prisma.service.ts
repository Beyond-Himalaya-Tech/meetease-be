import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { INestApplication } from '@nestjs/common';
import { createSoftDeleteExtension } from 'prisma-extension-soft-delete';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super();

    // 🔥 Apply soft delete extension
    Object.assign(
      this,
      this.$extends(
        createSoftDeleteExtension({
          models: {
            contacts: true,
          },
          defaultConfig: {
            field: 'deleted_at',
            createValue: (deleted) => (deleted ? new Date() : null),
          },
        }),
      ),
    );
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  enableShutdownHooks(app: INestApplication) {
    this.$on('beforeExit' as never, async () => {
      await app.close();
    });
  }
}

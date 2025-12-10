import { Injectable } from '@nestjs/common';
import { CreateEventTypeDto, UpdateEventTypeDto } from 'src/dto/eventsType.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class EventTypesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateEventTypeDto) {
    return await this.prisma.event_types.create({
      data: {
        title: dto.title,
        description: dto.description,
        duration_minutes: dto.duration_minutes,
        is_active: dto.is_active ?? true,
        client_tag: dto.client_tag,
        user_id: dto.user_id
      },
    });
  }

  async findAllByUser(user_id: number) {
    return await this.prisma.event_types.findMany({
      where: { user_id },
      orderBy: { created_at: 'desc' },
    });
  }

  async findOne(id: number) {
    return await this.prisma.event_types.findUnique({ where: { id } });
  }

  async update(id: number, dto: UpdateEventTypeDto) {
    return await this.prisma.event_types.update({
      where: { id },
      data: {
        ...dto
      },
    });
  }

  async remove(id: number) {
    return await this.prisma.event_types.delete({ where: { id } });
  }
}

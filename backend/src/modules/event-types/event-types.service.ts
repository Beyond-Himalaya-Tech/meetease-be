import { Injectable } from '@nestjs/common';
import { CreateEventTypeDto, UpdateEventTypeDto } from 'src/dto/eventsType.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class EventTypesService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateEventTypeDto) {
    return this.prisma.event_types.create({
      data: {
        title: dto.title,
        description: dto.description,
        duration_minutes: dto.duration_minutes,
        is_active: dto.is_active ?? true,
        client_tag: dto.client_tag,
        user_id: dto.user_id, // FK mapped correctly
      },
    });
  }

  findAllByUser(user_id: string) {
    return this.prisma.event_types.findMany({
      where: { user_id },
      orderBy: { created_at: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.event_types.findUnique({ where: { id } });
  }

  update(id: string, dto: UpdateEventTypeDto) {
    return this.prisma.event_types.update({
      where: { id },
      data: {
        ...dto
      },
    });
  }

  remove(id: string) {
    return this.prisma.event_types.delete({ where: { id } });
  }
}

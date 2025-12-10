import { Injectable } from '@nestjs/common';
import { CreateEventDataDto, UpdateEventDto } from 'src/dto/events.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateEventDataDto) {
    return this.prisma.events.create({
      data: {
        start_at: new Date(dto.start_at),
        end_at: new Date(dto.end_at),
        timezone: dto.timezone,
        location_link: dto.location_link ?? '',
        status: dto.status || "PENDING",
        calendar_event_id: dto.calendar_event_id ?? '',
        event_type_id: dto.event_type_id,
        user_id: dto.user_id,
        contact_id: dto.contact_id,
      },
    });
  }

  findAllByUser(user_id: number) {
    return this.prisma.events.findMany({
      where: { user_id },
      orderBy: { created_at: 'desc' },
      include: {
        event_types: true,
        contacts: true,
      },
    });
  }

  findFilteredByUser(where) {
    return this.prisma.events.findMany({
      where,
      orderBy: { created_at: 'desc' },
      include: {
        event_types: true,
        contacts: true,
      },
    });
  }

  findOne(id: number) {
    return this.prisma.events.findUnique({
      where: { id },
      include: {
        event_types: true,
        contacts: true,
        users: true,
      },
    });
  }

  update(id: number, dto: UpdateEventDto) {
    return this.prisma.events.update({
      where: { id },
      data: dto
    });
  }

  remove(id: number) {
    return this.prisma.events.delete({ where: { id } });
  }
}

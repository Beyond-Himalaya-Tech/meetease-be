import { Injectable } from '@nestjs/common';
import { CreateEventDataDto, UpdateEventDto } from 'src/dto/events.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateEventDataDto) {
    return await this.prisma.events.create({
      data: {
        start_at: new Date(dto.start_at),
        end_at: new Date(dto.end_at),
        timezone: dto.timezone,
        location_link: dto.location_link ?? '',
        status: dto.status || "CREATED",
        calendar_event_id: dto.calendar_event_id ?? '',
        event_type_id: dto.event_type_id,
        user_id: dto.user_id,
        contact_id: dto.contact_id,
      },
    });
  }

  async findAllByUser(user_id: number) {
    return await this.prisma.events.findMany({
      where: { user_id },
      orderBy: { created_at: 'desc' },
      include: {
        event_types: true,
        contacts: true,
      },
    });
  }

  async findFilteredByUser(where) {
    return await this.prisma.events.findMany({
      where,
      orderBy: { start_at: 'desc' },
      include: {
        event_types: true,
        contacts: true
      },
    });
  }

  async findOne(id: number) {
    return await this.prisma.events.findUnique({
      where: { id },
      include: {
        event_types: true,
        contacts: true,
        users: true,
      },
    });
  }

  async update(id: number, dto) {
    return await this.prisma.events.update({
      where: { id },
      data: dto
    });
  }

  async remove(id: number) {
    return await this.prisma.events.delete({ where: { id } });
  }

  async count(where) {
    return await this.prisma.events.count({ where });
  }
}

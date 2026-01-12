import { Injectable } from '@nestjs/common';
import { CreateSalesNoteDto, UpdateSalesNoteDto } from 'src/dto/sales-notes.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SalesNotesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, dto: CreateSalesNoteDto) {
    // If event_id is provided, verify user owns the event
    if (dto.event_id) {
      const event = await this.prisma.events.findFirst({
        where: {
          id: dto.event_id,
          user_id: userId,
        },
      });

      if (!event) {
        throw new Error('Event not found or access denied');
      }
    }

    return await this.prisma.sales_notes.create({
      data: {
        contact_id: dto.contact_id,
        user_id: userId,
        event_id: dto.event_id ?? null,
        content: dto.content,
      },
    });
  }

  async findAllByContact(contactId: number, userId: number) {
    return await this.prisma.sales_notes.findMany({
      where: { 
        contact_id: contactId,
        event_id: null, // Only sales notes (not meeting notes)
        contacts: {
          user_id: userId, // Ensure user owns the contact
        }
      },
      orderBy: { created_at: 'desc' },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });
  }

  async findAllByEvent(eventId: number, userId: number) {
    // Verify user owns the event
    const event = await this.prisma.events.findFirst({
      where: {
        id: eventId,
        user_id: userId,
      },
    });

    if (!event) {
      throw new Error('Event not found or access denied');
    }

    return await this.prisma.sales_notes.findMany({
      where: { 
        event_id: eventId, // Only meeting notes for this event
      },
      orderBy: { created_at: 'desc' },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });
  }

  async findOne(id: number, userId: number) {
    return await this.prisma.sales_notes.findFirst({
      where: { 
        id,
        contacts: {
          user_id: userId, // Ensure user owns the contact
        }
      },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });
  }

  async update(id: number, userId: number, dto: UpdateSalesNoteDto) {
    // First verify ownership
    const note = await this.findOne(id, userId);
    if (!note) {
      throw new Error('Sales note not found or access denied');
    }

    return await this.prisma.sales_notes.update({
      where: { id },
      data: {
        content: dto.content,
        updated_at: new Date(),
      },
    });
  }

  async remove(id: number, userId: number) {
    // First verify ownership
    const note = await this.findOne(id, userId);
    if (!note) {
      throw new Error('Sales note not found or access denied');
    }

    return await this.prisma.sales_notes.delete({
      where: { id },
    });
  }
}


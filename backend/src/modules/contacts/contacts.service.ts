import { Injectable } from '@nestjs/common';
import { CreateContactDto, UpdateContactDto } from 'src/dto/contacts.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ContactsService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateContactDto) {
    return this.prisma.contacts.create({
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        tag: dto.tag,
        user_id: dto.user_id, // <-- FK
      },
    });
  }

  findAllByUser(user_id: string) {
    return this.prisma.contacts.findMany({
      where: { user_id },
      orderBy: { created_at: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.contacts.findUnique({ where: { id } });
  }

  update(id: string, dto: UpdateContactDto) {
    return this.prisma.contacts.update({
      where: { id },
      data: {
        ...dto
      },
    });
  }

  remove(id: string) {
    return this.prisma.contacts.delete({ where: { id } });
  }
}

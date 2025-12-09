import { Injectable } from '@nestjs/common';
import { CreateContactDto, UpdateContactDto } from 'src/dto/contacts.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ContactsService {
  constructor(private prisma: PrismaService) {}

  create(data: CreateContactDto) {
    return this.prisma.contacts.create({
      data
    });
  }

  findAllByUser(user_id: number) {
    return this.prisma.contacts.findMany({
      where: { user_id },
      orderBy: { created_at: 'desc' },
    });
  }

  findOne(id: number) {
    return this.prisma.contacts.findUnique({ where: { id } });
  }

  update(id: number, dto: UpdateContactDto) {
    return this.prisma.contacts.update({
      where: { id },
      data: {
        ...dto
      },
    });
  }

  remove(id: number) {
    return this.prisma.contacts.delete({ where: { id } });
  }
}

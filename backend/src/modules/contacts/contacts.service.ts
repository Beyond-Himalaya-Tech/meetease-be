import { Injectable } from '@nestjs/common';
import { CreateContactDto, UpdateContactDto } from 'src/dto/contacts.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ContactsService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateContactDto) {
    return await this.prisma.contacts.create({data});
  }

  async upsert(data: CreateContactDto) {
    return await this.prisma.contacts.upsert({
      where: {
        contacts_user_id_email_unique: {
          user_id: data.user_id,
          email: data.email,
        },
      },
      update: {
        name: data.name,
        phone: data.phone,
        tag: data.tag,
        deleted_at: null
      },
      create: data,
    });
  }

  async findAllByUser(user_id: number, filter: {}) {
    return await this.prisma.contacts.findMany({
      where: { ...{user_id},  ...filter},
      orderBy: { created_at: 'desc' },
    });
  }

  async findOne(id: number) {
    return await this.prisma.contacts.findUnique({ where: { id } });
  }

  async update(id: number, dto: UpdateContactDto) {
    return await this.prisma.contacts.update({
      where: { id },
      data: {
        ...dto
      },
    });
  }

  async count(where) {
    return await this.prisma.contacts.count({ where });
  }

  async remove(id: number) {
    return await this.prisma.contacts.delete({ where: { id } });
  }

  async findDeleted(id: number) {
    return await this.prisma.contacts.findUnique({ where: { id, deleted_at: { not: null} } });
  }
}

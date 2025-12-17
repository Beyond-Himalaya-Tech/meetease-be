// src/users/users.service.ts
import { Injectable } from '@nestjs/common';
import { CreateUserDto, UpdateUserDto } from 'src/dto/users.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  create(data: CreateUserDto) {
    return this.prisma.users.create({ data });
  }

  findAll() {
    return this.prisma.users.findMany();
  }

  findOne(id: string) {
    return this.prisma.users.findUnique({ where: { id } });
  }

  update(id: string, data: UpdateUserDto) {
    return this.prisma.users.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.users.delete({ where: { id } });
  }
}


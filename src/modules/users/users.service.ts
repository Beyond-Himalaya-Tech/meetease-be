// src/users/users.service.ts
import { Injectable } from '@nestjs/common';
import { CreateUserDto, UpdateUserDto } from 'src/dto/users.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateUserDto) {
    return await this.prisma.users.create({ data });
  }

  async findAll() {
    return await this.prisma.users.findMany();
  }

  async findOne(id: number) {
    return await this.prisma.users.findUnique({ where: { id } });
  }

  async findByEmail(email: string) {
    return await this.prisma.users.findUnique({ where: { email } });
  }

  async update(id: number, data: UpdateUserDto) {
    return await this.prisma.users.update({ where: { id }, data });
  }

  async remove(id: number) {
    return await this.prisma.users.delete({ where: { id } });
  }
}


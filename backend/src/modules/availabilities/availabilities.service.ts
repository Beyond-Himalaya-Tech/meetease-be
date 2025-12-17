import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAvailabilityDto, UpdateAvailabilityDto } from 'src/dto/availabilities.dto';

@Injectable()
export class AvailabilitiesService {
  constructor(private prisma: PrismaService) {}

  create(data: CreateAvailabilityDto) {
    return this.prisma.availabilities.create({
      data,
    });
  }

  findAll() {
    return this.prisma.availabilities.findMany();
  }

  findByUser(user_id: string) {
    return this.prisma.availabilities.findMany({
      where: { user_id },
    });
  }

  findOne(id: string) {
    return this.prisma.availabilities.findUnique({
      where: { id },
    });
  }

  update(id: string, data: UpdateAvailabilityDto) {
    return this.prisma.availabilities.update({
      where: { id },
      data,
    });
  }

  remove(id: string) {
    return this.prisma.availabilities.delete({
      where: { id },
    });
  }
}

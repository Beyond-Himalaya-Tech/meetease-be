import { Prisma } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAvailabilityDto, UpdateAvailabilityDto } from 'src/dto/availabilities.dto';
import { timeStringToDate } from 'src/helpers/time.helper';

@Injectable()
export class AvailabilitiesService {
  constructor(private prisma: PrismaService) {}

  create(data: CreateAvailabilityDto) {
    return this.prisma.availabilities.create({
      data: {
        user_id: data.user_id,
        day_of_week: data.day_of_week,
        start_time: timeStringToDate(data.start_time),
        end_time: timeStringToDate(data.end_time)
      }
    });
  }

  async upsert(data: CreateAvailabilityDto) {
    return this.prisma.availabilities.upsert({
      where: {
        user_id_day_of_week: {
          user_id: data.user_id,
          day_of_week: data.day_of_week,
        },
      },
      update: {
        start_time: timeStringToDate(data.start_time),
        end_time: timeStringToDate(data.end_time),
        updated_at: new Date(),
      },
      create: {
        user_id: data.user_id,
        day_of_week: data.day_of_week,
        start_time: timeStringToDate(data.start_time),
        end_time: timeStringToDate(data.end_time),
      },
    });
  }

  findAll() {
    return this.prisma.availabilities.findMany();
  }

  findByUser(user_id: number) {
    return this.prisma.availabilities.findMany({
      where: { user_id },
    });
  }

  findOne(id: number) {
    return this.prisma.availabilities.findUnique({
      where: { id },
    });
  }

  update(id: number, data: UpdateAvailabilityDto) {
    const updateData: Prisma.availabilitiesUpdateInput = {};
    if (data.start_time)  updateData.start_time = timeStringToDate(data.start_time);
    
    if (data.end_time)  updateData.end_time = timeStringToDate(data.end_time);

    return this.prisma.availabilities.update({
      where: { id },
      data: updateData,
    });
  }

  remove(id: number) {
    return this.prisma.availabilities.delete({
      where: { id },
    });
  }
}

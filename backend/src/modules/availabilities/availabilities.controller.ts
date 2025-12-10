import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
  NotFoundException
} from '@nestjs/common';
import { AvailabilitiesService } from './availabilities.service';
import { CreateAvailabilityDto, UpdateAvailabilityDto } from 'src/dto/availabilities.dto';
import { AuthGuard } from 'src/modules/auth/auth.guard';
import { dateToTimeString } from 'src/helpers/time.helper';

@UseGuards(AuthGuard)
@Controller('availabilities')
export class AvailabilitiesController {
  constructor(private readonly availabilitiesService: AvailabilitiesService) {}

  @Post()
  async create(@Body() createUserDto: CreateAvailabilityDto, @Request() req) {
    return await this.availabilitiesService.upsert({...createUserDto, ...{user_id: req.user.id}});
  }

  @Get()
  async findAll(@Request() req) {
    const userAvailabilities = await this.availabilitiesService.findByUser(req.user.id);
    if(!userAvailabilities.length)
      throw new NotFoundException("No user availability");

    const formattedAvailabilities = userAvailabilities.map(availabilities => {
      return {
        id: availabilities.id,
        day_of_week: availabilities.day_of_week,
        start_time: dateToTimeString(availabilities.start_time),
        end_time: dateToTimeString(availabilities.end_time)
      }
    })
    return {data: formattedAvailabilities};
  }

  @Get('user/:user_id')
  async findByUser(@Param('user_id') user_id: number) {
    const userAvailabilities = await this.availabilitiesService.findByUser(user_id);
    if(!userAvailabilities.length)
      throw new NotFoundException("No user availability");

    return userAvailabilities;
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return await this.availabilitiesService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: number, @Body() dto: UpdateAvailabilityDto) {
    return await this.availabilitiesService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return await this.availabilitiesService.remove(id);
  }
}

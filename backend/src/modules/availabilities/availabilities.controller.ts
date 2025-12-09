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
import { UpdateAvailabilityDto } from 'src/dto/availabilities.dto';
import { AuthGuard } from 'src/modules/auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('availabilities')
export class AvailabilitiesController {
  constructor(private readonly availabilitiesService: AvailabilitiesService) {}

  @Post()
  async create(@Body() data, @Request() req) {
    const userAvailabilities = {
      user_id: req.user.id,
      day_of_week: data.day_of_week,
      start_time_minutes: data.start_time_minutes,
      end_time_minutes: data.end_time_minutes,
    };
    console.log(userAvailabilities);
    return await this.availabilitiesService.create(userAvailabilities);
  }

  @Get()
  async findAll(@Request() req) {
    const userAvailabilities = await this.availabilitiesService.findByUser(req.user.id);
    if(!userAvailabilities.length)
      throw new NotFoundException("No user availability");
    return userAvailabilities;
  }

  @Get('user/:user_id')
  async findByUser(@Param('user_id') user_id: string) {
    const userAvailabilities = await this.availabilitiesService.findByUser(user_id);
    if(!userAvailabilities.length)
      throw new NotFoundException("No user availability");

    return userAvailabilities;
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.availabilitiesService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateAvailabilityDto) {
    return await this.availabilitiesService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.availabilitiesService.remove(id);
  }
}

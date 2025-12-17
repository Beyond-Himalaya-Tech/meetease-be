import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { AvailabilitiesService } from './availabilities.service';
import { CreateAvailabilityDto, UpdateAvailabilityDto } from 'src/dto/availabilities.dto';

@Controller('availabilities')
export class AvailabilitiesController {
  constructor(private readonly availabilitiesService: AvailabilitiesService) {}

  @Post()
  create(@Body() dto: CreateAvailabilityDto) {
    return this.availabilitiesService.create(dto);
  }

  @Get()
  findAll() {
    return this.availabilitiesService.findAll();
  }

  @Get('user/:user_id')
  findByUser(@Param('user_id') user_id: string) {
    return this.availabilitiesService.findByUser(user_id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.availabilitiesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAvailabilityDto) {
    return this.availabilitiesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.availabilitiesService.remove(id);
  }
}

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Request
} from '@nestjs/common';
import { AvailabilitiesService } from './availabilities.service';
import { CreateAvailabilityDto, UpdateAvailabilityDto } from 'src/dto/availabilities.dto';
import { AuthGuard } from 'src/modules/auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('availabilities')
export class AvailabilitiesController {
  constructor(private readonly availabilitiesService: AvailabilitiesService) {}

  @Post()
  create(@Body() dto: CreateAvailabilityDto, @Request() req) {
    return this.availabilitiesService.create({...dto, ...{user_id: req.user.id}});
  }

  @Get()
  findAll(@Request() req) {
    return this.availabilitiesService.findByUser(req.user.id);
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

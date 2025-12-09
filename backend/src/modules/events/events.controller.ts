import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto, UpdateEventDto } from 'src/dto/events.dto';
import { AuthGuard } from '../auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('events')
export class EventsController {
  constructor(private readonly service: EventsService) {}

  @Post()
  create(@Body() dto: CreateEventDto) {
    return this.service.create(dto);
  }

  // GET /events?user_id=123
  @Get()
  findAll(@Query('user_id') user_id: number) {
    return this.service.findAllByUser(user_id);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() dto: UpdateEventDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.service.remove(id);
  }
}

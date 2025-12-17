import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { EventTypesService } from './event-types.service';
import { CreateEventTypeDto, UpdateEventTypeDto } from 'src/dto/eventsType.dto';

@Controller('event-types')
export class EventTypesController {
  constructor(private readonly service: EventTypesService) {}

  @Post()
  create(@Body() dto: CreateEventTypeDto) {
    return this.service.create(dto);
  }

  // GET /event-types?user_id=123
  @Get()
  findAll(@Query('user_id') user_id: string) {
    return this.service.findAllByUser(user_id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateEventTypeDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}

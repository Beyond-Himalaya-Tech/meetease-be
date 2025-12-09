import { Controller, Get, Post, Body, Patch, Param, Delete, Request, UseGuards, NotFoundException } from '@nestjs/common';
import { EventTypesService } from './event-types.service';
import { CreateEventTypeDto, UpdateEventTypeDto } from 'src/dto/eventsType.dto';
import { AuthGuard } from '../auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('event-types')
export class EventTypesController {
  constructor(private readonly eventTypeService: EventTypesService) {}

  @Post()
  create(@Body() dto: CreateEventTypeDto, @Request() req) {
    return this.eventTypeService.create({...dto, ...{ user_id: req.user.id }});
  }

  @Get()
  async findAll(@Request() req) {
    const userEventTypes = await this.eventTypeService.findAllByUser(req.user.id);
    if(!userEventTypes.length) {
      throw new NotFoundException("No user event types");
    }
    return userEventTypes;
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.eventTypeService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() dto: UpdateEventTypeDto) {
    return this.eventTypeService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.eventTypeService.remove(id);
  }
}

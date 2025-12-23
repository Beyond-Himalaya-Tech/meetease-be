import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { UpdateContactDto } from 'src/dto/contacts.dto';
import { AuthGuard } from '../auth/auth.guard';
import { responseFormatter } from 'src/helpers/response.helper';
import { EventTypesService } from '../event-types/event-types.service';

@UseGuards(AuthGuard)
@Controller('contacts')
export class ContactsController {
  constructor(
    private readonly contactsService: ContactsService,
    private readonly eventTypeService: EventTypesService
  ) {}

  @Post()
  async create(@Body() dto, @Request() req) {
    try {
     return responseFormatter(await this.contactsService.create({...dto, ...{ user_id: req.user.id}}));
    } catch (err) {
      throw responseFormatter(err, "error");
    }
  }

  @Get()
  async findAll(@Request() req, @Query('not_null') not_null?: string, @Query('event_type') event_type?: number) {
    try {
      const filter: Record<string, any> = {};
      if(not_null)
        not_null.split(',').forEach((field) => {
          filter[field] = { not: null };
        });

      if(event_type) {
        const eventType = await this.eventTypeService.findOne(event_type);
        if(eventType) {
          filter['tag'] = eventType.client_tag
        }
      }
      
      return responseFormatter(await this.contactsService.findAllByUser(req.user.id, filter));
    } catch (err) {
      throw responseFormatter(err, "error");
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    try {
     return responseFormatter(await this.contactsService.findOne(id));
    } catch (err) {
      throw responseFormatter(err, "error");
    }
  }

  @Patch(':id')
  async update(@Param('id') id: number, @Body() dto: UpdateContactDto) {
    try {
     return responseFormatter(await this.contactsService.update(id, dto));
    } catch (err) {
      throw responseFormatter(err, "error");
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    try {
     return responseFormatter(await this.contactsService.remove(id));
    } catch (err) {
      throw responseFormatter(err, "error");
    }
  }
}

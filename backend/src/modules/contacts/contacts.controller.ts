import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { UpdateContactDto } from 'src/dto/contacts.dto';
import { AuthGuard } from '../auth/auth.guard';
import { responseFormatter } from 'src/helpers/response.helper';

@UseGuards(AuthGuard)
@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post()
  async create(@Body() dto, @Request() req) {
    try {
     return responseFormatter(await this.contactsService.create({...dto, ...{ user_id: req.user.id}}));
    } catch (err) {
      throw responseFormatter(err, "error");
    }
  }

  @Get()
  async findAll(@Query('user_id') user_id: number) {
    try {
     return responseFormatter(await this.contactsService.findAllByUser(user_id));
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

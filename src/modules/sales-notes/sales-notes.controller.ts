import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { SalesNotesService } from './sales-notes.service';
import { CreateSalesNoteDto, UpdateSalesNoteDto } from 'src/dto/sales-notes.dto';
import { AuthGuard } from '../auth/auth.guard';
import { responseFormatter } from 'src/helpers/response.helper';

@UseGuards(AuthGuard)
@Controller('sales-notes')
export class SalesNotesController {
  constructor(private readonly salesNotesService: SalesNotesService) {}

  @Post()
  async create(@Body() dto: CreateSalesNoteDto, @Request() req) {
    try {
      return responseFormatter(await this.salesNotesService.create(req.user.id, dto));
    } catch (err) {
      throw responseFormatter(err, "error");
    }
  }

  @Get('contact/:contactId')
  async findAllByContact(@Param('contactId') contactId: number, @Request() req) {
    try {
      return responseFormatter(await this.salesNotesService.findAllByContact(Number(contactId), req.user.id));
    } catch (err) {
      throw responseFormatter(err, "error");
    }
  }

  @Get('event/:eventId')
  async findAllByEvent(@Param('eventId') eventId: number, @Request() req) {
    try {
      return responseFormatter(await this.salesNotesService.findAllByEvent(Number(eventId), req.user.id));
    } catch (err) {
      throw responseFormatter(err, "error");
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: number, @Request() req) {
    try {
      return responseFormatter(await this.salesNotesService.findOne(Number(id), req.user.id));
    } catch (err) {
      throw responseFormatter(err, "error");
    }
  }

  @Patch(':id')
  async update(@Param('id') id: number, @Body() dto: UpdateSalesNoteDto, @Request() req) {
    try {
      return responseFormatter(await this.salesNotesService.update(Number(id), req.user.id, dto));
    } catch (err) {
      throw responseFormatter(err, "error");
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: number, @Request() req) {
    try {
      return responseFormatter(await this.salesNotesService.remove(Number(id), req.user.id));
    } catch (err) {
      throw responseFormatter(err, "error");
    }
  }
}


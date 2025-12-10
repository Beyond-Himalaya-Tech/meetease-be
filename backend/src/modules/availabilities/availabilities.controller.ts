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
import { dateToTimeString } from 'src/helpers/time.helper';
import { responseFormatter, notFoundResponse } from 'src/helpers/response.helper';

@UseGuards(AuthGuard)
@Controller('availabilities')
export class AvailabilitiesController {
  constructor(private readonly availabilitiesService: AvailabilitiesService) {}

  @Post()
  async create(@Body() createUserDto: CreateAvailabilityDto, @Request() req) {
    try {
      return responseFormatter(await this.availabilitiesService.upsert({...createUserDto, ...{user_id: req.user.id}}));
    } catch (err) {
      throw responseFormatter(err, "error");
    }
  }

  @Get()
  async findAll(@Request() req) {
    try {
      const userAvailabilities = await this.availabilitiesService.findByUser({user_id: req.user.id});
      if(!userAvailabilities.length)
        throw notFoundResponse("No user availability");

      const formattedAvailabilities = userAvailabilities.map(availabilities => {
        return {
          id: availabilities.id,
          day_of_week: availabilities.day_of_week,
          start_time: dateToTimeString(availabilities.start_time),
          end_time: dateToTimeString(availabilities.end_time)
        }
      })
      return responseFormatter(formattedAvailabilities);
    } catch (err) {
      throw responseFormatter(err, "error");
    }
  }

  @Get('user/:user_id')
  async findByUser(@Param('user_id') user_id: number) {
    try {
      const userAvailabilities = await this.availabilitiesService.findByUser({user_id});
      if(!userAvailabilities.length)
        throw notFoundResponse("No user availability");

      return responseFormatter(userAvailabilities);
    } catch (err) {
      throw responseFormatter(err, "error");
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    try {
      return responseFormatter(await this.availabilitiesService.findOne(id));
    } catch (err) {
      throw responseFormatter(err, "error");
    }
  }

  @Patch(':id')
  async update(@Param('id') id: number, @Body() dto: UpdateAvailabilityDto) {
    try {
      return responseFormatter(await this.availabilitiesService.update(id, dto));
    } catch (err) {
      throw responseFormatter(err, "error");
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    try {
      return responseFormatter(await this.availabilitiesService.remove(id));
    } catch (err) {
      throw responseFormatter(err, "error");
    }
  }
}

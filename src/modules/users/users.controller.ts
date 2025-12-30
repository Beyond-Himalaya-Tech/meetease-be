// src/users/users.controller.ts
import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from 'src/dto/users.dto';
import { AuthGuard } from 'src/modules/auth/auth.guard';
import { responseFormatter } from 'src/helpers/response.helper';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    try {
      return responseFormatter(await this.usersService.create(createUserDto));
    } catch (err) {
      throw responseFormatter(err, "error");
    }
  }

  @UseGuards(AuthGuard)
  @Get()
  async findUser(@Request() req) {
    try {
      return responseFormatter(await this.usersService.findOne(req.user.id));
    } catch (err) {
      throw responseFormatter(err, "error");
    }
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: number) {
    try {
      return responseFormatter(await this.usersService.findOne(id));
    } catch (err) {
      throw responseFormatter(err, "error");
    }
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  async update(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto) {
    try {
      return responseFormatter(await this.usersService.update(id, updateUserDto));
    } catch (err) {
      throw responseFormatter(err, "error");
    }
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: number) {
    try {
      return responseFormatter(await this.usersService.remove(id));
    } catch (err) {
      throw responseFormatter(err, "error");
    }
  }
}

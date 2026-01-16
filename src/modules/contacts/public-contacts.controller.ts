import { Controller, Post, Body } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { responseFormatter } from 'src/helpers/response.helper';
import { EventTypesService } from '../event-types/event-types.service';
import { UsersService } from '../users/users.service';

@Controller('public/contacts')
export class PublicContactsController {
    constructor(
        private readonly contactsService: ContactsService,
        private readonly usersService: UsersService
    ) {}

  @Post()
  async create(@Body() dto) {
    try {
        const data = await this.usersService.findByEmail(dto.user);
        const postData = {
            user_id: data?.id || 1,
            name: dto.name,
            email: dto.email,
            phone: dto.phone,
            tag: dto.tag,
        };
        return responseFormatter(await this.contactsService.upsert(postData));
    } catch (err) {
        throw responseFormatter(err, "error");
    }
  }
}
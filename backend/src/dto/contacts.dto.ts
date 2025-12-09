export class CreateContactDto {
  user_id: number;
  name: string;
  email: string;
  phone?: string;
  tag?: string;
}

export class UpdateContactDto {
  name: string;
  email: string;
  phone?: string;
  tag?: string;
}

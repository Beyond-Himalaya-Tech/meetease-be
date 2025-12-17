export class CreateUserDto {
  email: string;
  password_hash?: string;
  name?: string;
  picture?: string;
  google_account_id?: string;
  access_token: string;
  refresh_token?: string;
  token_expiry?: Date;
}

export class UpdateUserDto {
  email?: string;
  password_hash?: string;
  name?: string;
  picture?: string;
  google_account_id?: string;
  access_token?: string;
  refresh_token?: string;
  token_expiry?: Date;
}
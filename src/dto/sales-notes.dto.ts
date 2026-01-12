import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateSalesNoteDto {
  @IsInt()
  contact_id: number;

  @IsOptional()
  @IsInt()
  event_id?: number; // If provided, it's a meeting note; if null, it's a sales note

  @IsString()
  content: string;
}

export class UpdateSalesNoteDto {
  @IsOptional()
  @IsString()
  content?: string;
}


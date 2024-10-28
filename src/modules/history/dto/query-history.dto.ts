import { IsOptional, IsString } from 'class-validator';

export class QueryHistoryDto {
  @IsString()
  @IsOptional()
  userId?: string;
}

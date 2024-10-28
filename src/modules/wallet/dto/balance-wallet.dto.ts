import { IsNumber, Min } from 'class-validator';

export class BalanceDto {
  @IsNumber()
  balance: number;
}

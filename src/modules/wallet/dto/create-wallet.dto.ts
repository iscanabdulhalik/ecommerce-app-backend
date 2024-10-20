import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class CreateWalletDto {
  @IsNotEmpty()
  @IsNumber()
  userId: string;

  @IsNumber()
  @IsPositive()
  balance: number;
}

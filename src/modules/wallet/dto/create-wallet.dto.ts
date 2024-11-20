import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class CreateWalletDto {
  @IsNotEmpty()
  userId: string;

  @IsNumber()
  @IsPositive()
  balance: number;
}

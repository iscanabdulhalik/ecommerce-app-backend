import { IsNumber, Min } from 'class-validator';

export class BuyProductDto {
  @IsNumber()
  @Min(1)
  quantity: number;
}

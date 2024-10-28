export class CreateHistoryDto {
  userId: string;
  action: string;
  details: Record<string, any>;
}

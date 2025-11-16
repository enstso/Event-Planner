export interface CreateEventDto {
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  capacity: number;
}

export interface UpdateEventDto extends Partial<CreateEventDto> {}

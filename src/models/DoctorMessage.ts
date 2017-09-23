export interface DoctorMessage
{
  id?: number;

  userId?: number;

  subject?: string;

  message?: string;

  createdAt?: Date;

  views?: number;

  senderId?: number;
} 
import { MessageGroupItem, MessageMetrics } from "../metrics/metrics";
 
export class DoctorMessageModel {
  id?: number;
  userId?: number;
  subject?: string;
  message?: string;
  createdAt?: Date;
  viewed?: boolean;
  senderId?: number;
  doctorDataId?: number;
  hosptalDataId?: number;
  email?: string;
  DoctorName?: string;
  DoctorImage?: string;
  HospitalName?: string;
  HospitalEmail?: string;
}

export class DataMessageStore {
  messages: MessageGroupItem[] = [];
  data: DoctorMessageModel[] = [];
  metrics: MessageMetrics = new MessageMetrics();
  groupedMessages = [];
  readMessages: MessageGroupItem[] = [];
  unreadMessages: MessageGroupItem[] = [];
  constructor(  ) {}
   
}
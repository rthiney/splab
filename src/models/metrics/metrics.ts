import { PulseViewModel } from "../viewmodels/pulse_model";
import { DoctorMessageModel } from "../viewmodels/index"; 
import { SurgeyStatus } from "../interfaces/ICalendarInterface";
export interface IMetric {
  name: string;
  count: number; 
  date?:Date;
}
export class SurgeryMetrics {
  cards?: Array<string> = [];
  uniqueCards?: Array<IMetric> = [];
  surgeryType?: Array<string> = [];
  uniqueSurgeryType?: Array<IMetric> = [];
  cptCodes?: Array<string> = [];
  speciality?: Array<string> = [];
  uniqueSpeciality?: Array<IMetric> = [];
  admissionStatus?: Array<string> = [];
  uniqueAdmissionStatus?: Array<IMetric> = [];
  diagnosisCodes?: Array<string> = [];
  uniqueDiag?: Array<IMetric> = [];
  uniqueCpt?: Array<IMetric> = [];
  past: number = 0;
  today: number = 0;
  future: number = 0;
}
export class MessageMetrics {
  read?: number = 0;
  unread?: number = 0;
  total?: number = 0;
}

export class SurgeryGroup {
  d: string;
  realDate: Date;
  surgeries: SurgeryGroupItem[];
  hide: boolean = false;
  constructor(date: Date) {
    this.d = date.toLocaleDateString();
    this.realDate = date;
    this.surgeries = [];
    this.hide = false;
  }
}
export class SurgeryGroupItem {
  surgery: PulseViewModel;
  cptArray: string[];
  dxArray: string[];
  hide: boolean = false;

  occurs: SurgeyStatus;
  constructor(_surgery: PulseViewModel) {
    this.surgery = _surgery;
    if (_surgery.cpt)
      this.cptArray = _surgery.cpt
        .split(",")
        .filter(
          w => !!w.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "").trim()
        )
        .sort();

    if (_surgery.diagnosisCode)
      this.dxArray = _surgery.diagnosisCode
        .split(",")
        .filter(
          w => !!w.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "").trim()
        )
        .sort();

    this.hide = false;
  }
}
export class MessageGroup {
  d: string;
  realDate: Date;
  messages: MessageGroupItem[];
  hide: boolean = false;
  constructor(date: Date) {
    this.d = date.toLocaleDateString();
    this.realDate = date;
    this.messages = [];
    this.hide = false;
  }
}
export class MessageGroupItem {
  message: DoctorMessageModel;
  views: number = 0;
  hide: boolean = false;
  read: boolean = false;
  replied: boolean = false;
  replied_on: Date;
  constructor(_o: DoctorMessageModel) {
    this.message = _o;
    this.read = _o.viewed;
  }
}

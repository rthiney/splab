

export class PulseViewModel {
  surgeryId: number;
  patient: string;
  term: Date;
  created_at: Date;
  reschedules: string;
  cancelled: boolean = false;
  completed: boolean = false;
  speciality: string;
  answers_box_id:number;
  card_id: number;
  preferenceCardName: string;
  initials: string;
  surgeryTime: string;
  admissionStatus: string;
  cpt: string;
  diagnosisCode: string;
  surgerySnapshot: boolean = true;
  hospitalId: number;
  hospitalEmail: string;
  hospital: string;
  doctorFosId: number;
  doctorEmail: string;
  doctorDataId: number;
  doctorImage: string;
  firstName: string;
  lastName: string;
  coordinatorName: string;
  coordinatorPhone: string;
  coordinatorEmail: string;
  officePhone: string;
  pager: string;
  companyName: string;
  billingCoordinatorName: string;
  billingCoordinatorPhone: string;
  billingCoordinatorEmail: string;
  managerName: string;
  managerPhone: string;
  managerEmail: string;
}

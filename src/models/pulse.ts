export interface Pulse {
         id: number;
        firstName: string;
        lastName: string;
        coordinatorName: string;
        coordinatorPhone: string;
        coordinatorEmail: string;
        billingCoordinatorName: string;
        billingCoordinatorPhone: string;
        billingCoordinatorEmail: string;
        patient: string;
        term: Date | null;
        created_at: Date | null;
        reschedules: string;
        cancelled: boolean | null;
        cpt: string;
        completed: boolean | null;
        initials: string;
        diagnosisCode: string;
        surgeryTime: Date | null;
        admissionStatus: string;
        speciality: string;
        preferencecard: string;
        preferencecat: string;
        description: string;
        hospitalname: string;
        doctor_id: number; 
    }

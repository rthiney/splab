import { HospitalInfo, FosUser, Country, State } from './../models';


export class HospitalItem implements HospitalInfo {

    id: number;

    name?: string;

    managerName?: string;

    managerPhone?: string;

    managerPager?: string;

    managerEmail?: string;

    address?: string;

    suite?: string;

    city?: string;

    postalCode?: string;

    stateId?: number;

    countryId?: number;

    stateType?: string;

    fosUser?: FosUser;

    country?: Country;

    state?: State;

    constructor(
        id: number,
         name: string
        //managerName: string,
        //managerPhone: string,
        //managerPager: string,
        //managerEmail: string,
        //address: string,
        //suite: string,
        //city: string,
        //postalCode: string,
        //stateId: number,
        //countryId: number,
        //stateType: string,
        //fosUser: string,
      //imageName: string
    ) {
        this.id = id;
        this.name = name;
        //this.managerName = managerName;
        //this.managerPhone = managerPhone;
        //this.managerPager = managerPager;

        //this.managerName = managerName;
        //this.managerPhone = managerPhone;
        //this.managerPager = managerPager;

        //this.managerEmail = managerEmail;
        //this.address = address;
        //this.suite = suite;

        //this.city = city;
        //this.postalCode = postalCode;
        //this.stateId = stateId;

        //this.countryId = countryId;
        //this.stateType = stateType;
        //this.managerPager = managerPager;



        //this.fosUser = fosUser;
    }
}
// export class SurgeryList {
//     public Id: number;
//     public Name: string;
//     public Surgeries: SurgeryItem[];
// }

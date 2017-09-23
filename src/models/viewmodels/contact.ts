export interface IContact {
  id: number;
  firstName: string;
  lastName: string;
  title: string;
  phone: string;
  mobilePhone: string;
  email: string;
  picture: string;

}
  export class Contact implements IContact
{
    id: number;
    firstName: string;
    lastName: string;
    title: string;
    phone: string;
    mobilePhone: string;
    email: string;
    picture: string; 
}
import * as moment from 'moment';
 
export class StatFilter {
  completed: boolean = true;
  cancelled: boolean = false;
  showTop: number = 10;
  startDate: string;
  endDate:string;
  constructor()
  {
    this.startDate=moment().toLocaleString();
    this.endDate=moment().add(30,'days').toLocaleString();
  }
}

import * as moment from 'moment';
import { DataSurgeryStore } from '../viewmodels/surgery_model';
 
export class StatFilter {
  completed: boolean = true;
  cancelled: boolean = false;
  showTop: number = 10;
 ed:Date;
 sd:Date;
 spanAnalysis:boolean=false;
 month1:DataSurgeryStore;
 month2:DataSurgeryStore;
  constructor()
  {
    this.ed=moment().add(-60,'days').toDate();
    this.sd=moment().add(-30,'days').toDate(); 
    
  }
}

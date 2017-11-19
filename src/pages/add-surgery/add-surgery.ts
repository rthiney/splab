import {SurgeryService} from '../../shared/surgery-services';
import {PulsePage} from '../pulse/pulse';
import {UserOptions} from '../../models/interfaces/user-options';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Surgery } from '../../models/Surgery';
import { NgForm, FormBuilder, FormGroup, Validators } from '@angular/forms';

/**
 * Generated class for the AddSurgeryPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
import moment from 'moment';
@IonicPage()
@Component({
  selector: 'page-add-surgery',
  templateUrl: 'add-surgery.html',
})
export class AddSurgeryPage {
 surgery: Surgery;
 signup: UserOptions = { username: '', password: '' };
 submitted = false;
 public form   : FormGroup;
 private formBuilder: FormBuilder = new FormBuilder();
 formGroup: FormGroup = this.formBuilder.group({
    dateFormatted: [moment().format()],
    dateFiltered: [moment().format()],
    time: [moment().format()],
    timeRounded: [moment().format()],
    time12: [moment().format()],
    minTime: [moment('2016-11-30T05:00:00+03:00').format()],
    maxTime: [moment('2016-11-30T14:00:00+03:00').format()],
    patient:'',
    surgery:''
  });
  constructor(public navCtrl: NavController, public navParams: NavParams,private _FB     : FormBuilder, private svc: SurgeryService) {
    this.form 	 = _FB.group({
        'patient'        : ['', Validators.required],
        'surgery'     : ['', Validators.minLength(10)],
        'dateFiltered' : [moment().format()],
        'time'   :  [moment().format()],
        'minTime': [moment('2016-11-30T05:00:00+03:00').format()],
       'maxTime': [moment('2016-11-30T14:00:00+03:00').format()]
     });

    // this.formGroup = new FormBuilder().group({
    //     time: [moment().format()]
    //   });
    //   this.form 	 =  _FB.group({
    //     'name'        : ['', Validators.required],
    //     'message'     : ['', Validators.minLength(10)],
    //     'time': _FB.group({
    //         dateFormatted: [moment().format()],
    //         dateFiltered: [moment().format()],
    //         time: [moment().format()],
    //         timeRounded: [moment().format()],
    //         time12: [moment().format()],
    //         minTime: [moment('2016-11-30T05:00:00+03:00').format()],
    //         maxTime: [moment('2016-11-30T14:00:00+03:00').format()]
    //  });
}

 filterDays(days: Array<number>, _month: number, _year: number): number[] {
    return days;
   }
  ionViewDidLoad() {
    console.log('ionViewDidLoad AddSurgeryPage');
  }
  onSignup(form: NgForm) {
    this.submitted = true;

    if (form.valid) {
      this.svc.addSurgery(this.surgery);
      this.navCtrl.push(PulsePage);
    }
  }
}

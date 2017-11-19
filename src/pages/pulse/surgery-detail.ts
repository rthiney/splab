
import { Component } from '@angular/core';

import { App, Events, ModalController, NavController, NavParams, Platform } from 'ionic-angular';
import { SurgeryGroup, SurgeryGroupItem, SurgeryMetrics } from '../../models/metrics/metrics';
import { PulseViewModel } from '../../models/viewmodels/pulse_model';

import { NotifyService } from '../../shared/notify.service';
import { CodeDetails } from './code-details';
import { SurgeryData } from '../../providers/surgery-data';
import { SurgeryService } from '../../shared/surgery-services';
import { Surgery } from '../../models/Surgery';
import { BillingDetails } from './billing-details';

@Component({
  selector: 'page-surgery-detail',
  templateUrl: 'surgery-detail.html'
})
export class SurgeryDetailPage {

  s: SurgeryGroupItem;
  rnd: number = Math.floor(Math.random() * 4) + 1;

  isEmailAvailable: Promise<any>;
  activeElement: Element;
  title: string;
  // the list is a child of the schedule page
  // @ViewChild('scheduleList') gets a reference to the list
  // with the variable #scheduleList, `read: List` tells it to return
  // the List and not a reference to the element

  _events: Events;
  selectedPulse: any;
  dayIndex = 0;
  queryText = "";
  excludeTracks: any = [];
  surgeries: SurgeryGroupItem[];
  todaySurgeries: SurgeryGroupItem[];
  pastSurgeries: SurgeryGroupItem[];
  futureSurgeries: SurgeryGroupItem[];
  allsurgeries: PulseViewModel[];
  shownSurgeries: number;
  dates: Array<Date>;
  groupSurgeries: SurgeryGroup[];
  groups: any = [];
  date: Date;
  dateIndex: number = 0;
  segment: string = "today";
  metrics: SurgeryMetrics = new SurgeryMetrics();
  avatar: any = {
    size: 50, // default size is 100
     fontColor: '#FFFFFF',
    border: "2px solid #d3d3d3",
    isSquare: false,
    text: 'Fuck You', //
    fixedColor:false
  };
  avatarText:string ;
  constructor(public navParams: NavParams, public platform: Platform,

    public app: App,
    public modalCtrl: ModalController,
    public navCtrl: NavController,

    private note: NotifyService,
    public events: Events,
    private surgeryData: SurgeryData,
    private _svcSurgery: SurgeryService
    //, private emailComposer: EmailComposer, private callNumber: CallNumber,
  ) {
    this.s = navParams.data;
try{
    if (this.s)
     this.avatarText =this.s.surgery.initials;
     else
     this.avatarText="No Answer";
}
catch(e){}
}

  ionViewDidLoad() {

  }
  // callPhoneNumber(p: any) {
  //   this.callNumber.callNumber(p, true)
  //     .then(() => console.log('Launched dialer!'))
  //     .catch(() =>this.note.presentError('Error launching dialer'));
  // }
  // callComposeEmail(addy: string, p: PulseViewModel) {
  //   this.emailComposer.isAvailable().then((available: boolean) => {
  //     if (available) {
  //       let email = {
  //         to: addy,
  //         subject: 'SurgiPal Mobile regarding ' + p.initials,
  //         body: 'Dear ' + p.coordinatorName + ',',
  //         isHtml: true
  //       };
  //       this.emailComposer.open(email);
  //     }
  //   }).catch(()=>  this.note.presentError('Error launching emailer'));

  // }

  sendBilling(p: SurgeryGroupItem) {
    // this.appinsightsService.trackEvent(
    //   "Sent Billing",
    //   {
    //     Surgery: p.surgery.patient,
    //     Surgeon: this.auth.name,
    //     Biller: p.surgery.billingCoordinatorName,
    //     BillerEmail: p.surgery.billingCoordinatorEmail
    //   },
    //   { Date: p.surgery.term }
    // ); // String properties: // Numeric metrics:

    let profileModal = this.modalCtrl.create(BillingDetails, p, {
      enterAnimation: "modal-slide-in",
      leaveAnimation: "modal-slide-out"
    });
    profileModal.present();

    profileModal.onWillDismiss(() => {
      // console.log('sendBilling() .onWillDismiss', data);
      // if (data.statusCode<300){
      let tst = this.note.presentToast('Success', 'here');
      tst.present();
      // }
      // if (data) {
      //   this.selectedPulse = data;
      //  this.updateSchedule();
      // }
    });
  }

  cancelSurgery(pulse: SurgeryGroupItem) {
    console.log('cancelSurgery', pulse);
    this.checkBeforeCancel().then(r => {
      if (r) {

        this._svcSurgery.markCancelled(pulse.surgery.surgeryId).then((_s: Surgery) => {
          this.note.presentToast("Cancelled", "Surgery has been cancelled.");
          this.surgeryData.model.refreshData();
          this.navCtrl.pop();
        }
          , (res: any) => console.error("Not updated", res));

        this.note.presentToast("Cancel", "Surgery has been cancelled.");
        this.navCtrl.pop();
      }
    });
  }
  checkCancelled(p: SurgeryGroupItem): boolean {
    if (!p.surgery.cancelled) {
      this.note.presentToast('Cancelled', 'Can\'t edit because this has benn cancelled');
      return true;
    }
    return false;
  }
  checkBeforeCancel(): Promise<boolean> {
    return new Promise((resolve: any, reject: any) => {
      let alert = this.note.alertCtrl.create({
        title: "Cancel Surgery?",
        message: "Are you sure?"
      });
      alert.addButton({ text: "No", handler: reject });
      alert.addButton({ text: "Yes", role: "cancel", handler: resolve });
      alert.present();
    });
  }
close(ev :SurgeryGroupItem){
console.log(ev);
}
  showEditCodes(p: SurgeryGroupItem, codeType: string) {

    if (this.checkCancelled(p))
      return;

    console.log("Selected Pulse Id ", p.surgery.surgeryId);
    // var codes:string[];
    let c = codeType === "CPT" ? p.cptArray : p.dxArray;
    let profileModal = this.modalCtrl.create(
      CodeDetails,
      { pulse: p, codes: c, type: codeType },
      {
        enterAnimation: "modal-slide-in",
        leaveAnimation: "modal-slide-out"
      }
    );
    profileModal.present();
    profileModal.onWillDismiss((data: string[]) => {
      console.log("onWillDismiss", data);
      if (data) {
        if (codeType === "CPT") {
          p.surgery.cpt = data.join(",");
          p.cptArray = data;
        }
        else {
          p.surgery.diagnosisCode = data.join(",");
          p.dxArray = data;
        }
//debugger;
        this._svcSurgery.updateCodes(p).then(() => console.log('Updated Codes'));
        this.selectedPulse = data;

      }
    });
  }
}

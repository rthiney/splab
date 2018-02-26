import { DataSurgeryStore } from './../../models/viewmodels/surgery_model';

import {
  SurgeryMetrics,
  SurgeryGroupItem,
  SurgeryGroup
} from "../../models/metrics/metrics";
import { Component, ViewChild } from "@angular/core";
import {
  AlertController,
  App,
  List,
  ModalController,
  NavController,
  LoadingController,
  Events,
  Platform
} from "ionic-angular";
import {
  BillingDetails,
  CodeDetails,
  SurgeryData
} from "./index";
import { PulseViewModel } from "./../../models/viewmodels/pulse_model";
import { AuthHttp } from "angular2-jwt";
import {
  AuthService,
  NotifyService,
  LoggerService
} from "../../shared/index";

//import { EmailComposer } from "@ionic-native/email-composer";
import { AppInsightsService } from "ng2-appinsights";
import { SurgeryService } from '../../shared/surgery-services';
import { MessageService } from '../../shared/message.service';
//import { PulseDetailPage } from '../pulse-detail/pulse-detail';
declare var window;
@Component({
  selector: "page-pulse",
  templateUrl: "pulse.html"
})
export class PulsePage {
  selectedItem: SurgeryGroupItem;
  isEmailAvailable: Promise<any>;
  activeElement: Element;
  title: string;
  // the list is a child of the schedule page
  // @ViewChild('scheduleList') gets a reference to the list
  // with the variable #scheduleList, `read: List` tells it to return
  // the List and not a reference to the element
  @ViewChild("surgeryList", { read: List })
  nosrgmessage: string = "No surgeries today";
  surgeryList: List;
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
    profileModal: any;
    constructor(
    public platform: Platform,
    private authHttp: AuthHttp,
    public app: App,
    public alertCtrl: AlertController,
    public modalCtrl: ModalController,
    public navCtrl: NavController,
    public auth: AuthService,
    private surgeryData: SurgeryData,
    private _svcSurgery: SurgeryService,
    private _svcMessage: MessageService,
    private note: NotifyService,
    private log: LoggerService,
    public loadingCtrl: LoadingController,
    public events: Events,

    private appinsightsService: AppInsightsService
  ) {

  }
  ionViewCanEnter() {
    return this.auth.authenticated();
  }
  ionViewDidLoad() {
    this.log.view("Pulse");
    this.date = new Date();
    this.title = "Today's Pulse (" + this.date.toLocaleDateString() + ")";
    this.loadWatchers();

    if (this.auth.fosId >0 ) {
      this.updateSchedule();
    }
  }

  loadWatchers() {
    this.events.subscribe("email:billing", (data: PulseViewModel, msg: any, res: any) => {
      if (!data.completed) {
        this._svcSurgery.markComplete(data.surgeryId).then(() => {
          this.note.presentToast(
            "Success",
            "Billing email sent to " + data.billingCoordinatorEmail
          );
          this.appinsightsService.trackEvent("Billing Sent");
          this._svcMessage.createBillingSendData(msg, data.surgeryId, res).then(() => {
          });
        });
      }
    });

    this.events.subscribe("email:fail", (_data: PulseViewModel, err: any) => {
      // this.activeElement.remove();
      this.log.error("email:fail", err);
    });

    this.events.subscribe("code:update", (_data: Array<string>, _codeType: string) => {
      this.navCtrl.setRoot(this.navCtrl.getActive().component);
      this.note.presentToast(
        "Success",
        "Codes Updated"
      );
    });
    this.events.subscribe("cancel:surgery", (_data: PulseViewModel) => {
      this.navCtrl.setRoot(this.navCtrl.getActive().component);
      this.note.presentToast(
        "Success",
        "Surgery cancelled"
      );
    });
  }
    sendBilling(p: SurgeryGroupItem, el: Element) {
        this.activeElement = el;
        this.selectedPulse = p;
        this.selectedItem = p;
        let profileModal = this.modalCtrl.create(BillingDetails, p, {
            enterAnimation: "modal-slide-in",
            leaveAnimation: "modal-slide-out"
        });
        profileModal.present();
        profileModal.onWillDismiss((_data: string) => {
            profileModal.dismiss();
        });
    }

  updateSegment() {
    var loader = this.loadingCtrl.create({
      content: "Refreshing...",
      dismissOnPageChange: true
    });
    loader.present();
    console.group("updateSegment");
    console.log("segment=" + this.segment);
    this.appinsightsService.trackEvent("Viewed Pulse Segment", {
      Segment: this.segment,
      Surgeon: this.auth.name
    });

    if (this.segment === "today") {
      this.surgeries = this.surgeryData.model.todaySurgeries;
      this.title = "Today's Pulse (" + this.date.toLocaleDateString() + ")";
    } else if (this.segment === "past") {
      this.surgeries = this.surgeryData.model.pastSurgeries;
      this.title = "Past Surgieres";
    } else {
      this.surgeries = this.surgeryData.model.futureSurgeries;
      this.title = "Future Surgeries";
    }

    if (this.surgeries.length === 0) {
      this.nosrgmessage = "No surgeries today";
      if (this.segment === "past")
        this.nosrgmessage = "No surgeries found. Ever.";
      else this.nosrgmessage = "No future surgeries scheduled.";
    }
    this.app.setTitle(this.title);
    loader.dismiss();
  }

  resetData() {
    this.allsurgeries = JSON.parse(JSON.stringify(this.surgeryData.model.data));
  }

  updateSchedule(reset: boolean = false, refresher: any = null) {

    // console.log("passed in reset=" + reset);

    // // Close any open sliding items when the schedule updates
    // tslint:disable-next-line:no-unused-expression
    this.surgeryList && this.surgeryList.closeSlidingItems();
    try {
      this.metrics = new SurgeryMetrics();
      this.surgeries = [];

      this.surgeryData
        .getSurgeries(this.queryText, this.excludeTracks, this.segment, reset)
        .subscribe(
        (data: DataSurgeryStore) => {
          this.metrics = data.metrics;

          //sort
          try {
            // let srt =
            data.todaySurgeries.sort((a: SurgeryGroupItem, b: SurgeryGroupItem) => {
              return new Date(a.surgery.term).getTime() - new Date(b.surgery.term).getTime();
            });
            //    this.surgeries =srt;
          } catch (error) {
            console.error('Sort Error"');
          }

          if (this.segment === "today")
            this.surgeries = data.todaySurgeries;
          else if (this.segment === "future")
            this.surgeries = data.futureSurgeries;
          else this.surgeries = data.pastSurgeries; //.filter(p => p.surgery.cancelled !== true);

          // if (this.segment == "today") this.surgeries = data.todaySurgeries;
          // else if (this.segment == "future") this.surgeries = data.futureSurgeries;
          // else this.surgeries = data.pastSurgeries;;
          console.log("Get Surgeries Complete", data);
          if (refresher) refresher.complete();
        },
        err => {
          console.error(err);
          if (refresher) refresher.complete();
        }
        );
    } catch (error) {
      console.error(error);
      if (refresher) refresher.complete();
    }
  }

  doRefresh(refresher?: any) {
    this.appinsightsService.trackEvent("Refreshed Surgery List");
    this.auth.storage.remove("surgeriesStoreDate");
    this.auth.storage.remove("surgeries");
    this.updateSchedule(true, refresher);
  }

  // private handleError(error: any): Promise<any> {
  //   console.log(error.message || error);
  //   let alert = this.note.alertCtrl.create({
  //     title: "Error",
  //     subTitle: error.message || error,
  //     buttons: ["OK"]
  //   });
  //   alert.present();
  //   console.log("PULSE PAGE", error.message || error); // for demo purposes only
  //   return Promise.reject(error.message || error);
  // }

  presentFilter() {
    //let modal = this.modalCtrl.create(ScheduleFilterPage, this.excludeTracks);
    //modal.present();
    //modal.onWillDismiss((data: any[]) => {
    //  if (data) {
    //    this.excludeTracks = data;
    //    this.updateSchedule();
    //  }
    //});
  }

  // showDetail(s: SurgeryGroupItem) {
  //   // go to the session detail page
  //   // and pass in the session data
  //   this.appinsightsService.trackEvent("Load Surgery Details", {
  //     Surgery: s.surgery.patient,
  //     Surgeon: this.auth.name
  //   });
  //   this.selectedPulse = s;
  //   this.navCtrl.push(SurgeryDetailPage, s);
  // }

  // openSocial(network: string, fab: FabContainer) {
  //   let loading = this.note.loadingCtrl.create({
  //     content: `Posting to ${network}`,
  //     duration: Math.random() * 1000 + 500
  //   });
  //   loading.onWillDismiss(() => {
  //     fab.close();
  //   });
  //   loading.present();
  // }

  // loadDetail(p: SurgeryGroupItem) {
  //   console.log("loadDetail();");
  //   this.appinsightsService.trackEvent("Load Surgery Details", {
  //     Surgery: p.surgery.patient,
  //     Surgeon: this.auth.name
  //   });
  //   this.selectedPulse = p.surgery;
  // }

  cancelSurgery(pulse: SurgeryGroupItem, _p: Element) {
 console.log('PULSE PAGE FIRE');
    this.selectedItem = pulse;
    this.checkBeforeCancel().then(r => {
      if (r) {
        this._svcSurgery.markCancelled(pulse.surgery.surgeryId).then(() => {
          pulse.hide = true;
          this.selectedItem.surgery.cancelled = true;
          //this.doRefresh();
          // p.remove();
          this.navCtrl.setRoot(this.navCtrl.getActive().component);
          this.note.presentToast("Cancel", "Surgery has been cancelled.");
          //  this.updateSchedule(true);
          this.appinsightsService.trackEvent(
            "Cancel Surgery",
            { Surgery: pulse.surgery.patient, Surgeon: this.auth.name },
            { Date: pulse.surgery.term }
          );
        });
      }
    });
  }

  checkBeforeCancel(): Promise<boolean> {
    return new Promise((resolve: any, reject: any) => {
      let alert = this.alertCtrl.create({
        title: "Cancel Surgery?",
        message: "Are you sure you want to cancel this surgery?"
      });
      alert.addButton({ text: "No", handler: reject });
      alert.addButton({ text: "Yes", role: "cancel", handler: resolve });
      alert.present();
    });
  }

  showEditCodes(p: SurgeryGroupItem, codeType: string) {
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

        this._svcSurgery.updateCodes(p).then(() => this.navCtrl.setRoot(this.navCtrl.getActive().component));

      }
    });
  }
  // this.appinsightsService.trackEvent("Show Codes", {
  //   CodeType: codeType,
  //   CodeCount: codeType === "CPT" ? p.cptArray.length : p.dxArray.length
  // });
  // this.selectedPulse
  // console.log("Selected Pulse Id ", p.surgery.surgeryId);
  // // var codes:string[];
  // var navOptions = {
  //   animation: 'ios-transition'
  // };
  // let c = codeType === "CPT" ? p.cptArray : p.dxArray;
  // this.navCtrl.push(CodeDetails, { pulse: p, codes: c, type: codeType }, navOptions   );
  // let profileModal = this.modalCtrl.create(
  //   CodeDetails,
  //   { pulse: p, codes: c, type: codeType },
  //   {
  //     enterAnimation: "modal-slide-in",
  //     leaveAnimation: "modal-slide-out"
  //   }
  // );

  // profileModal.present();
  // profileModal.onWillDismiss((data: any[]) => {
  //   console.log("onWillDismiss", data);
  //   if (data) {
  //     if (codeType == "CPT") {
  //       p.surgery.cpt = data.join(",");
  //       p.cptArray = data;
  //     }
  //     else {
  //       p.surgery.diagnosisCode = data.join(",");
  //       p.dxArray = data;
  //     }
  //     this.selectedPulse = data;
  //     this.updateSchedule();
  //   }
  // });

}

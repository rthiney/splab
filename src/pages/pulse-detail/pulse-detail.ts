
import {
  SurgeryMetrics,
  SurgeryGroupItem
  //,SurgeryGroup
} from "../../models/metrics/metrics";
import { Component, EventEmitter, Input,   Output} from "@angular/core";
import {
  AlertController,
  App,
 // List,
  ModalController,
  NavController,
  LoadingController,
  Events,
  Platform,
 //ActionSheet,
  ActionSheetController,
  ActionSheetOptions,
  Config
} from "ionic-angular";
import {
  BillingDetails,
  CodeDetails,
  SurgeryData,
  SurgeryDetailPage
} from "../pulse/index";
import { AuthHttp } from "angular2-jwt";
import {
  AuthService,
  NotifyService,
  LoggerService
} from "../../shared/index";
import {LetterAvatarDirective } from '../../directives/letter-avatar.directive';
import { AppInsightsService } from "ng2-appinsights";
import { SurgeryService } from '../../shared/surgery-services';
import { MessageService } from '../../shared/message.service';
import { IActionSheetButton } from '../../models/interfaces/IActionSheetButton';
import { Surgery } from '../../models/Surgery';

declare var window;
@Component({
  selector: "page-pulse-detail",
  templateUrl: "pulse-detail.html"
})
export class PulseDetailPage {
    @Input() s: SurgeryGroupItem;
    @Input() idx:number;
    @Output() close = new EventEmitter();
    error: any;
    @Input() avatarText:string;
    selectedItem: SurgeryGroupItem;
//   isEmailAvailable: Promise<any>;
         activeElement: Element;
//   title: string;
//   nosrgmessage: string = "No surgeries today";
//   surgeryList: List;
//   _events: Events;
   selectedPulse: any;
//   dayIndex = 0;
//   queryText = "";
//   excludeTracks: any = [];
//   surgeries: SurgeryGroupItem[];
//   todaySurgeries: SurgeryGroupItem[];
//   pastSurgeries: SurgeryGroupItem[];
//   futureSurgeries: SurgeryGroupItem[];
//   allsurgeries: PulseViewModel[];
//   shownSurgeries: number;
//   dates: Array<Date>;
//   groupSurgeries: SurgeryGroup[];
//   groups: any = [];
//   date: Date;
//   dateIndex: number = 0;
avatar: any = {
  size: 50, // default size is 100
   fontColor: '#FFFFFF',
  border: "2px solid #d3d3d3",
  isSquare: false, // if it is true then letter avatar will be in square defaule value is false
  text: '', //
  fixedColor:false //if you enable true then letter will have same color for ever default value is false
};

  segment: string = "today";
  duration:number;
  metrics: SurgeryMetrics = new SurgeryMetrics();
  constructor(
    public platform: Platform,
    private authHttp: AuthHttp,
    public app: App,
    public alertCtrl: AlertController,
    public modalCtrl: ModalController,
    public navCtrl: NavController,
    public actionSheetCtrl: ActionSheetController,
    public config: Config,
    //public inAppBrowser: InAppBrowser
    private auth: AuthService,
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
  ionViewWillEnter() {}
  ionViewDidLoad() {
   this.duration = parseInt(this.s.surgery.surgeryTime);

  // this.avatarText = this.s.surgery.initials;
    if (this.s.surgery.surgeryTime.indexOf("m") < 0)
      this.duration = this.duration * 60;
  }
  ngOnInit(): void {

  }
//   ngOnInit(): void {
//     this.route.params.forEach((params: Params) => {
//       if (params['id'] !== undefined) {
//         const id = +params['id'];
//         this.navigated = true;
           //  this.heroService.getHero(id)   ///this.surgeryData.model.data
//             .then(hero => this.hero = hero);
//       } else {
//         this.navigated = false;
//         this.hero = new Hero();
//       }
//     });
//   }

  sendBilling(p: SurgeryGroupItem, el: Element) {
    this.activeElement = el;
    this.selectedPulse = p;
    this.selectedItem = p;
    let profileModal = this.modalCtrl.create(BillingDetails, p, {
      enterAnimation: "modal-slide-in",
      leaveAnimation: "modal-slide-out"
    });
    profileModal.present();
    profileModal.onWillDismiss(() => {
      profileModal.dismiss();
    });
  }

     showDetail(s: SurgeryGroupItem) {
    // go to the session detail page
    // and pass in the session data
    this.appinsightsService.trackEvent("Load Surgery Details", {
      Surgery: s.surgery.patient,
      Surgeon: this.auth.name
    });
    this.selectedPulse = s;
    this.navCtrl.push(SurgeryDetailPage, s);
  }

  loadDetail(p: SurgeryGroupItem) {
    console.log("loadDetail();");
    this.appinsightsService.trackEvent("Load Surgery Details", {
      Surgery: p.surgery.patient,
      Surgeon: this.auth.name
    });
    this.selectedPulse = p.surgery;
  }

  cancelSurgery(pulse: SurgeryGroupItem, _p: Element) {
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
console.log(this.navCtrl.getActive().component);
this.close.emit(p);
        this._svcSurgery.updateCodes(p); //.then(() => this.navCtrl.setRoot(this.navCtrl.getActive().component));
      }
    });
  }
  openContact(name:string, email:string, phone:string) {
    let mode = this.config.get('mode');

    let actionSheet = this.actionSheetCtrl.create({
      title: 'Contact ' + name,
      buttons: [
        {
          text: `Email ( ${email} )`,
          icon: mode !== 'ios' ? 'mail' : null,
          handler: () => {
            window.open('mailto:' + email);
          }
        } as IActionSheetButton,
        {
          text: `Call ( ${phone} )`,
          icon: mode !== 'ios' ? 'call' : null,
          handler: () => {
            window.open('tel:' + phone);
          }
        } as IActionSheetButton
      ]
    } as ActionSheetOptions);

    actionSheet.present();
  }
//   callPhoneNumber(n: any, p: SurgeryGroupItem) {
//     console.log(this.platform.platforms[0]);
//     if (this.platform.is('cordova'))
//       this.note.presentAlert("Web View Issue", "Can't use this in web version.");

//     this.appinsightsService.trackEvent(
//       "Called Number",
//       {
//         Surgery: p.surgery.patient,
//         Surgeon: this.auth.name,
//         Biller: p.surgery.coordinatorName,
//         BillerEmail: p.surgery.coordinatorEmail
//       },
//       { Date: p.surgery.term }
//     ); // String properties: // Numeric metrics:
//     var number: string = n.replace(/\D/g, '');
//     this.callNumber.callNumber(number, true)
//       .then(() => console.log('Launched dialer!'))
//       .catch(() => window.location = number);
//   }

//   callComposeEmail(addy: string, p: SurgeryGroupItem) {

//     if (this.platform.is('cordova'))
//       this.note.presentAlert("Web View Issue", "Can't use this in web version");
//     try {
//       this.appinsightsService.trackEvent(
//         "Composed Email",
//         {
//           Surgery: p.surgery.patient,
//           Surgeon: this.auth.name,
//           Biller: p.surgery.coordinatorName,
//           BillerEmail: p.surgery.coordinatorEmail
//         },
//         { Date: p.surgery.term }
//       ); // String properties: // Numeric metrics:

//       this.emailComposer
//         .isAvailable()
//         .then((available: boolean) => {
//           if (available) {
//             let email = {
//               to: addy,
//               subject: "SurgiPal Mobile regarding " + p.surgery.initials,
//               body: "Dear " + p.surgery.coordinatorName + ",",
//               isHtml: true
//             };
//             this.emailComposer.open(email);
//           }
//         })
//         .catch(() => window.location.href = 'mailto:' + addy);
//     } catch (error) {
//       console.error(error);
//     }
//   }
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

//   openSocial(network: string, fab: FabContainer) {
//     let loading = this.note.loadingCtrl.create({
//       content: `Posting to ${network}`,
//       duration: Math.random() * 1000 + 500
//     });
//     loading.onWillDismiss(() => {
//       fab.close();
//     });
//     loading.present();
//   }

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

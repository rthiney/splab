import { LoginPage } from "./../login/login"; 
import { SurgeryData } from "../pulse/index";
//import { HockeyApp } from "ionic-hockeyapp";
import { AuthService } from "../../shared/auth.service";
//import { AboutPage } from "../about/about";
import { Component, ViewChild, ElementRef } from "@angular/core";
import {
  AlertController,
  NavController,
  Platform,
  Events
} from "ionic-angular";

import { SupportPage } from "../support/support";
import { NotifyService } from "../../shared/index";
import { MessageData } from "../message/index";
import { SurgeryMetrics, MessageMetrics, IMetric } from "../../models/metrics";
import { PulseViewModel } from "../../models/viewmodels/pulse_model";
declare var google: any;
export class ChartData{
  data:number[]=[];
  label:string;
}
@Component({
  selector: "page-account",
  templateUrl: "account.html"
})
export class AccountPage {

  startDate:any;
  endDate:any;
  total: number = 0;
  //_hockeyapp: any;
  events: any;
  uniq: IMetric[];
  username: string;
  surgeryCardMetrics: any;
  surgeryMetrics: SurgeryMetrics;
  messageMetrics: MessageMetrics;
  activeMetric: string;
  future: number;
  past: number;
  metrics: string[] = [
    "Admission Status",
    "Preference Cards",
    "CPT Codes",
    "Diagnosis Codes",
    "Specialties",
    "Surgeries"
  ];
  metricsSelected: string;

  @ViewChild("mapCanvas") mapElement: ElementRef;

  chartOptions: any = {
    scaleShowVerticalLines: false,
    responsive: true
  };
 
  chartLabels: string[] = ['Test 1', 'Test 2', 'Test 3', 'Test 4'];
  chartType: string = 'bar';
  chartLegend: boolean = true;
 
  chartData: any[] = [
    { data: [75, 80, 45, 100], label: 'Student A' },
    { data: [80, 55, 75, 95], label: 'Student B' }
  ];

  constructor(
    public alertCtrl: AlertController,
    public nav: NavController,
    public auth: AuthService,
    public platform: Platform,
    public event: Events,
    public _note: NotifyService,
   // _hockeyapp: HockeyApp,
    private surgerySvc: SurgeryData,
    private messageSvc: MessageData
  ) { }
  ionViewDidLoad() {
    try {

      this.metricsSelected = this.metrics[0];
      this.past = this.surgerySvc.model.metrics.past;
      this.future = this.surgerySvc.model.metrics.future;
      this.changeUnique();
      this.auth.getUsername();
    } catch (error) {

    }
  }

  completedByRange(){
    this.surgerySvc.model.data.forEach((s:PulseViewModel)=>{
          console.info(s.patient);
    });
  }

  changeUnique() {
    console.log(this.metricsSelected); 

    if (this.metricsSelected === "Admission Status") {
      this.uniq = this.surgerySvc.model.metrics.uniqueAdmissionStatus.sort(
        (a: IMetric, b: IMetric) => {
          return b.count - a.count;
        }    );
      var cd = new ChartData();
        cd.label=this.metricsSelected;
      //  var data:number[]=[];
               var labels:string[]=[];
        this.chartLabels=[];
             this.chartData=[];
        this.surgerySvc.model.metrics.uniqueAdmissionStatus.forEach(s=>{
             cd.data.push(s.count);
              labels.push(s.name);

     });
    
     // this.chartData.push(cd);
      this.chartLabels=labels;
      this.total = this.surgerySvc.model.metrics.admissionStatus.length;
    }
    if (this.metricsSelected === "Preference Cards") {
      this.uniq = this.surgerySvc.model.metrics.uniqueCards.sort(
        (a: IMetric, b: IMetric) => {
          return b.count - a.count;
        }
      );
      this.total = this.surgerySvc.model.metrics.cards.length;
    }
    if (this.metricsSelected === "CPT Codes") {
      this.uniq = this.surgerySvc.model.metrics.uniqueCpt.sort(
        (a: IMetric, b: IMetric) => {
          return b.count - a.count;
        }
      );
      this.total = this.surgerySvc.model.metrics.uniqueCpt.length;
    }
    if (this.metricsSelected === "Diagnosis Codes") {
      this.uniq = this.surgerySvc.model.metrics.uniqueDiag.sort(
        (a: IMetric, b: IMetric) => {
          return b.count - a.count;
        }
      );
      this.total = this.surgerySvc.model.metrics.uniqueDiag.length;
    }
    if (this.metricsSelected === "Specialties") {
      this.uniq = this.surgerySvc.model.metrics.uniqueSpeciality.sort(
        (a: IMetric, b: IMetric) => {
          return b.count - a.count;
        }
      );
      this.total = this.surgerySvc.model.metrics.uniqueSpeciality.length;
    }
    if (this.metricsSelected === "Surgeries") {
      this.uniq = this.surgerySvc.model.metrics.uniqueSurgeryType.sort(
        (a: IMetric, b: IMetric) => {
          return b.count - a.count;
        }
      );
      this.total = this.surgerySvc.model.metrics.uniqueSurgeryType.length;
    }
    this.activeMetric = this.metricsSelected;
  }

  updatePicture() {
    console.log("Clicked to update picture");
  }

  // Present an alert with the current username populated
  // clicking OK will update the username and display it
  // clicking Cancel will close the alert and do nothing
  changeUsername() {
    let alert = this.alertCtrl.create({
      title: "Change Username",
      buttons: ["Cancel"]
    });
    alert.addInput({
      name: "username",
      value: this.auth.name,
      placeholder: "username"
    });
    alert.addButton({
      text: "Ok",
      handler: (data: any) => {
        this.auth.name = data.username;
        this.auth.getUsername();
      }
    });

    alert.present();
  }

  logout() {
    this.auth.logout();
    this.nav.setRoot(LoginPage);
  }

  support() {
    this.nav.push(SupportPage);
  }
}

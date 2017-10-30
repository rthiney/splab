import { Pulse } from "../../models/pulse";
import { LoginPage } from "./../login/login";
import { SurgeryData } from "../pulse/index";
import Moment from "moment";
import { extendMoment } from "moment-range";

const moment = extendMoment(Moment);
//import { HockeyApp } from "ionic-hockeyapp";
import { AuthService } from "../../shared/auth.service";
//import { AboutPage } from "../about/about";
import {
  Component,
  ViewChild,
  ElementRef,
  ChangeDetectionStrategy
} from "@angular/core";
import {
  AlertController,
  NavController,
  Platform,
  Events,
  ModalController
} from "ionic-angular";

import { SupportPage } from "../support/support";
import { NotifyService } from "../../shared/index";
import { MessageData } from "../message/index";
import {
  IMetric,
  MessageMetrics,
  SurgeryGroupItem,
  SurgeryMetrics
} from "../../models/metrics/metrics";
import { PulseViewModel } from "../../models/viewmodels/pulse_model";
import { StatFilterPage } from "../stat-filter/stat-filter";
import { StatFilter } from "../../models/metrics/statfilter";
import { ChartData } from '../../models/metrics/chartdata';
import { State } from "../../models/State";
declare var google: any;

@Component({
  selector: "page-stats",
  templateUrl: "stats.html"
})
export class StatsPage {
  statFilter: StatFilter;
  startDate: Date;
  endDate: Date;
  total: number = 0;
  totalSurgeries: number = 0;
  count: number = 0;
  rng: any;
  rng2: any;
  rng3: any;
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
    "Surgeries",
    "Preference Cards",
    // "CPT Codes",
    // "Diagnosis Codes",
    "Specialties",
    "Admission Status"
  ];
  metricsSelected: string;

  @ViewChild("mapCanvas") mapElement: ElementRef;

  chartOptions: any = {
    scaleShowVerticalLines: false,
    responsive: true
  };

 chartLabels: string[] = [];

  chartType: string = "bar";

  chartLegend: boolean = true;
  chartTitle: string;
  chartData: ChartData[] = [{ data: [], label:  ''} ];



  chartLabels2: string[] =["Admin1", "SurgeryAdmin 2", "Admi 3", "Ammd 4"];

chartData2: ChartData[] = [{ data: [75, 80, 45, 100], label: "Month1" },
{ data: [5, 22, 3, 44], label: "Month2" }];
  allMetricsTitle = "All Metrics";
  allMetricsChartType: string = "line";
  allMetricsChartLegend: boolean = true;
  allMetricsChart: ChartData[] = [
    { data: [75, 80, 45, 100], label: "Default" }
  ];
  allMetricsChartLabels: string[];
  allMetricsChartOptions: any = {
    scaleShowVerticalLines: false,
    responsive: true
  };
  constructor(
    public alertCtrl: AlertController,
    public nav: NavController,
    public auth: AuthService,
    public platform: Platform,
    public event: Events,
    public _note: NotifyService,
    public modalCtrl: ModalController,
    public navCtrl: NavController,
    private surgerySvc: SurgeryData,
    private messageSvc: MessageData
  ) {
    const moment = extendMoment(Moment);
    // this.allMetricsChartLabels=this.metrics;
  }
  ionViewDidLoad() {
    this.auth.storage.get("statfilter").then(stats => {
      if (!stats) {
        this.statFilter = new StatFilter();
        this.auth.storage.set("statfilter", this.statFilter);
      } else this.statFilter = stats;

    //   var cd = new ChartData();
    //   cd.label = this.metricsSelected;
    //   //  var data:number[]=[];
    //   var labels: string[] = [];
    //   this.chartLabels = [];
    //   this.chartData = [];
    //   let d : ChartData []=[];

    //    this.surgerySvc.model.metrics.uniqueAdmissionStatus.forEach(s => {
    //     cd = new ChartData();
    //     cd.data.push(s.count);
    //     cd.label = s.name;
    //     d.push(cd);
    //   });
    //   this.chartLabels.push("Admission Status");

    //    this.surgerySvc.model.metrics.uniqueCards.forEach(s => {
    //     cd = new ChartData();
    //     cd.data.push(s.count);
    //     cd.label = s.name;
    //     d.push(cd);
    //   });
    //   this.chartLabels.push("Cards");

    //   this.chartData=d;
      // /.c
      // this.chartLabels.push("Past");
      // ///
      // this.chartData[0] = new ChartData();
      // this.chartData[0].label = "Completed";
      // this.chartData[0].data.push(
      //   this.surgerySvc.model.data.filter(
      //     p => p.completed === true
      //   ).length
      // );

      // this.chartData.push(new ChartData());
      // this.chartData[1].label = "Cancelled";
      // this.chartData[1].data.push(
      //   this.surgerySvc.model.data.filter(
      //     p => p.cancelled === true
      //   ).length
      // );
      /// END PAST
      // ///PAST
      // this.chartLabels.push("Future");
      // ///
      // this.chartData[2] = new ChartData();
      // this.chartData[2].label = "Completed";
      // this.chartData[2].data.push(
      //   this.surgerySvc.model.futureSurgeries.filter(
      //     p => p.surgery.completed === true
      //   ).length
      // );

      // this.chartData[3] = new ChartData();
      // this.chartData[3].label = "Cancelled";
      // this.chartData[3].data.push(
      //   this.surgerySvc.model.futureSurgeries.filter(
      //     p => p.surgery.cancelled === true
      //   ).length
      // );
      /// END PAST

      // this.chartData.push(new ChartData());
      // this.chartData[2].label = "Today";
      // cd.data.push(this.surgerySvc.model.metrics.today);
      // cd.label = "Today";
      // this.chartLabels.push("Today");
      // this.chartData.push(cd);

      // cd.data.push(this.surgerySvc.model.metrics.future);
      // cd.label = "Future";
      // this.chartLabels.push("Future");
      // this.chartData.push(cd);

    //  this.updateTitle();
      //this.initStats();
    });

    this.metricsSelected = this.metrics[0];
  }
  resetChart() {
    // let clone = JSON.parse(JSON.stringify(this.chartData));
    // let cloneLab = JSON.parse(JSON.stringify(this.chartLabels));

    let l = ["Test 1", "Test 2", "Test 3", "Test 4"];
    let ss = [
      { data: [75, 80, 45, 100], label: "Student A" },
      { data: [80, 55, 75, 95], label: "Student B" }
    ];
    // let l = [];
    // let ss: ChartData[] = [];
    // this.surgerySvc.model.metrics.uniqueCards.forEach(s => {
    //  var cd = new ChartData();
    //   cd.data.push(s.count);
    //   cd.label = s.name;
    //   ss.push(cd);
    // });


    // l.push("Cards");
    // this.surgerySvc.model.metrics.uniqueAdmissionStatus.forEach(s => {
    //   var cd = new ChartData();
    //    cd.data.push(s.count);
    //    cd.label = s.name;
    //    ss.push(cd);
    //  });
    //  l.push("Admissions");
    // clone[0].data = ss;
    // cloneLab = l;

    this.chartLabels = l;
    this.chartData = ss;
  }
  resetChart2() {
    // let clone = JSON.parse(JSON.stringify(this.chartData));
    // let cloneLab = JSON.parse(JSON.stringify(this.chartLabels));

    // let l = ["Test 1", "Test 2", "Test 3", "Test 4"];
    // let s = [
    //   { data: [75, 80, 45, 100], label: "Student A" },
    //   { data: [80, 55, 75, 95], label: "Student B" }
    // ];
    // clone[0].data = s;
    // cloneLab = l;
    debugger;
    this.chartLabels = this.chartLabels2;
    this.chartData =this.chartData2;
  }
  presentFilter() {
    let modal = this.modalCtrl.create(StatFilterPage, this.statFilter);
    modal.present();

    modal.onWillDismiss((data: StatFilter) => {
      if (data) {
        this.auth.storage.set("statfilter", this.statFilter);
        this.statFilter = data;
        this.startDate = this.statFilter.sd;
        this.endDate = this.statFilter.ed;
        this.updateTitle();
        this.refreshStats();
      }
    });
  }

  updateTitle() {
    this.chartTitle = `${moment(this.statFilter.sd).format(
      "MMM YYYY"
    )} to ${moment(this.statFilter.ed).format("MMM YYYY")}, completed: ${this
      .statFilter.completed}, Cancelled: ${this.statFilter.cancelled}.`;
  }
  updateChart2(_arr: IMetric[], _name: string) {
     var cd = new ChartData();
   let d: ChartData[]=[];
//     var l: string[]=[];
// this.chartData[0] = new ChartData();
// //this.chartLabels=
//     this.chartData[0].label = name;
// debugger;
//     arr.forEach(s =>{
//      // cd = new ChartData();
//      this.chartLabels.push(s.name);
//       this.chartData[0].data.push(s.count);
//     //  l.push(s.name);
//      // cd.label=s.name;
//      // d.push(cd);
//      // this.chartData.push(cd);
//     });
//     debugger;
//     // this.chartData=new ChartData[0];
//     // this.chartLabels=[];

//   // this.chartData[0] = cd;

//     //this.allMetricsChart.push(d);
//    // this.chartLabels.push(nam//e);

    let clone = JSON.parse(JSON.stringify(this.chartData));
      let cloneLab = JSON.parse(JSON.stringify(this.chartLabels));
      this.chartLabels=[];
   //   this.chartData=new ChartData[0];
   this.chartData[0].data=[];



    this.surgerySvc.model.metrics.uniqueCards.forEach(s => {
    //  cd = new ChartData();
      this.chartLabels.push( s.name);
      this.chartData[0].data.push(s.count);
      this.chartData[0].label='Performed:'; //s.name;
     // d.push(cd);
    });
   // this.chartLabels.push("Preference Cards");

  }


  refreshStats() {

    if (this.metricsSelected === "Admission Status") {
        this.updateChart2(
            this.surgerySvc.model.metrics.uniqueAdmissionStatus,
            this.metricsSelected
          );
      }
      if (this.metricsSelected === "Preference Cards") {
        this.updateChart2(
            this.surgerySvc.model.metrics.uniqueCards,
            this.metricsSelected
          );
      }
    //  this.chartLabels=this.getLabelArray();

    // let dataTemplate: Array<ChartData> = [
    //   { data: [], label: this.statFilter.sd.toLocaleDateString() },
    //   { data: [], label: this.statFilter.ed.toLocaleDateString() }
    // ];
    // let dataLabels: string[] = [];

    // let startOfMonth = moment(
    //   `${this.statFilter.sd.getFullYear()}-${this.statFilter.sd.getMonth() +
    //     1}-${moment(this.statFilter.sd).daysInMonth()}`,
    //   "YYYY-MM-DD"
    // );

    // let endOFMonth = moment(
    //   `${this.statFilter.ed.getFullYear()}-${this.statFilter.ed.getMonth() +
    //     1}-${moment(this.statFilter.ed).daysInMonth()}`,
    //   "YYYY-MM-DD"
    // );

    // //  const when  = moment('2012-05-10', 'YYYY-MM-DD');
    // this.rng = moment.range(this.statFilter.sd, startOfMonth);
    // this.rng2 = moment.range(this.statFilter.ed, endOFMonth);
    // this.rng3 = moment.range(this.statFilter.sd, endOFMonth);
    // console.log("range", this.rng);
    // console.log("range", this.rng2);

    // let range = this.surgerySvc.model.data.filter((o: PulseViewModel) => {
    //   if (o.term) {
    //     let when = moment(o.term);
    //     return (
    //       (when.within(this.rng) || when.within(this.rng2)) &&
    //       o.completed === this.statFilter.completed &&
    //       o.cancelled === this.statFilter.cancelled
    //     );
    //   }
    // });
    // this.count = range.length;
    // console.info("Range count:", range.length);

    // let index = 0;
    // let labs = this.getLabelArray(range);
    // console.log(labs);

    // switch (this.metricsSelected) {
    //   case "Admission Status":
    //     {
    //       labs.forEach(label => {
    //         var countRng1 = 0;
    //         var countRng2 = 0;
    //         countRng1 = range.filter(
    //           (s: PulseViewModel) =>
    //             s.admissionStatus === label && moment(s.term).within(this.rng)
    //         ).length;

    //         countRng2 = range.filter(
    //           (s: PulseViewModel) =>
    //             s.admissionStatus === label && moment(s.term).within(this.rng2)
    //         ).length;

    //         if (countRng1 > 0 || countRng2 > 0) {
    //           dataTemplate[0].data.push(countRng1);
    //           dataTemplate[1].data.push(countRng2);
    //           dataLabels.push(label);
    //         }
    //       });
    //     }

    //     break;
    //   case "Preference Cards":
    //   {
    //     labs.forEach(label => {
    //       var countRng1 = 0;
    //       var countRng2 = 0;
    //       countRng1 = range.filter(
    //         (s: PulseViewModel) =>
    //           s.admissionStatus === label && moment(s.term).within(this.rng)
    //       ).length;

    //       countRng2 = range.filter(
    //         (s: PulseViewModel) =>
    //           s.admissionStatus === label && moment(s.term).within(this.rng2)
    //       ).length;

    //       if (countRng1 > 0 || countRng2 > 0) {
    //         dataTemplate[0].data.push(countRng1);
    //         dataTemplate[1].data.push(countRng2);
    //         dataLabels.push(label);
    //       }
    //     });
    //   }
    //     break;
    //   case "CPT Codes":
    //   {

    //   }
    //     break;
    //   case "Diagnosis Codes":
    //   {

    //   }
    //     break;
    //   case "Specialties":
    //   {
    //     labs.forEach(label => {
    //       var countRng1 = 0;
    //       var countRng2 = 0;
    //       countRng1 = range.filter(
    //         (s: PulseViewModel) =>
    //           s.speciality === label && moment(s.term).within(this.rng)
    //       ).length;

    //       countRng2 = range.filter(
    //         (s: PulseViewModel) =>
    //           s.speciality === label && moment(s.term).within(this.rng2)
    //       ).length;

    //       if (countRng1 > 0 || countRng2 > 0) {
    //         dataTemplate[0].data.push(countRng1);
    //         dataTemplate[1].data.push(countRng2);
    //         dataLabels.push(label);
    //       }
    //     });
    //   }
    //     break;
    //   case "Surgeries":
    //   {
    //     labs.forEach(label => {
    //       var countRng1 = 0;
    //       var countRng2 = 0;
    //       countRng1 = range.filter(
    //         (s: PulseViewModel) =>
    //           s.patient === label && moment(s.term).within(this.rng)
    //       ).length;

    //       countRng2 = range.filter(
    //         (s: PulseViewModel) =>
    //           s.patient === label && moment(s.term).within(this.rng2)
    //       ).length;

    //       if (countRng1 > 0 || countRng2 > 0) {
    //         dataTemplate[0].data.push(countRng1);
    //         dataTemplate[1].data.push(countRng2);
    //         dataLabels.push(label);
    //       }
    //     });
    //   }
    //     break;
    //   default:
    //     break;
    // }

    // let la = JSON.parse(JSON.stringify(this.chartLabels));
    // la = dataLabels;
    // this.chartLabels = dataLabels;
    // let clone = JSON.parse(JSON.stringify(this.chartData));
    // clone.data = dataTemplate;
    // this.chartData = dataTemplate;
  }

  // this.count = range.length;
  // console.info("Range count:", range.length);

  //    this.surgerySvc.model.data.forEach((_s: PulseViewModel) => {});

  getLabelArray(arr: PulseViewModel[]): string[] {
    var labs: string[] = [];

    if (this.metricsSelected === "Admission Status") {
      this.surgerySvc.model.metrics.uniqueAdmissionStatus.forEach(s => {
        if (labs.indexOf(s.name) === -1) labs.push(s.name);
      });
      let labss = arr.filter(o => o.admissionStatus);
    }

    if (this.metricsSelected === "Preference Cards") {
      this.surgerySvc.model.metrics.uniqueCards.forEach(s => {
        if (labs.indexOf(s.name) === -1) labs.push(s.name);
      });
    }
    if (this.metricsSelected === "CPT Codes") {
      this.surgerySvc.model.metrics.uniqueCpt.forEach(s => {
        if (labs.indexOf(s.name) === -1) labs.push(s.name);
      });
    }
    if (this.metricsSelected === "Diagnosis Codes") {
      this.surgerySvc.model.metrics.uniqueDiag.forEach(s => {
        if (labs.indexOf(s.name) === -1) labs.push(s.name);
      });
    }
    if (this.metricsSelected === "Specialties") {
      this.surgerySvc.model.metrics.uniqueSpeciality.forEach(s => {
        if (labs.indexOf(s.name) === -1) labs.push(s.name);
      });
    }
    if (this.metricsSelected === "Surgeries") {
      this.surgerySvc.model.metrics.uniqueSurgeryType.forEach(s => {
        if (labs.indexOf(s.name) === -1) labs.push(s.name);
      });
    }
    return labs;
  }


  initStats() {
    this.allMetricsChart = [];
    this.allMetricsChartLabels = [];

    this.updateChart2(
      this.surgerySvc.model.metrics.uniqueAdmissionStatus,
      "Admission Status"
    );
    this.updateChart2(
      this.surgerySvc.model.metrics.uniqueCards,
      "Preference Cards"
    );
    this.updateChart2(this.surgerySvc.model.metrics.uniqueCpt, "CPT Codes");
    this.updateChart2(
      this.surgerySvc.model.metrics.uniqueDiag,
      "Diagnosis Codes"
    );
    //  this.updateChart2(this.surgerySvc.model.metrics.uniqueSpeciality,"Specialties" );
    this.updateChart2(
      this.surgerySvc.model.metrics.uniqueSurgeryType,
      "Surgeries"
    );
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
  getMetricCPT(codes:string, arr:string[]){

    let qt = codes
      .split(",")
      .filter(
      w =>
        !!w.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "").trim()
          .length
      );
    qt.forEach((code: string) => {
      arr.push(code.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, ""));
    });
  }

  uniqueMetrics(arr: any): IMetric[] {
    let result = arr.reduce(function (acc, curr) {
      if (typeof acc[curr] === "undefined") {
        acc[curr] = 1;
      } else {
        acc[curr] += 1;
      }
      return acc;
    }, {});
    return this.getArray(result);
  }
  getArray(arr: any): IMetric[] {
    let r: IMetric[] = [];

    for (let key in arr) {
      if (arr.hasOwnProperty(key)) {
        //   let i: IMetric = { count: arr[key], name: key };
        r.push({ count: arr[key], name: key });
      }
    }
    return r;
  }
  countMetrics(arr: any) {
    return arr.filter(function (item, i, ar) {
      // tslint:disable-next-line:no-unused-expression
      item => !!item.trim().length;
      return ar.indexOf(item) === i;
    });
  }
}

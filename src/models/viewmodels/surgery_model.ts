
import { PulseViewModel } from "./pulse_model";
import { SurgeryGroupItem, SurgeryMetrics, SurgeryGroup, IMetric } from '../metrics/metrics';

// export class SurgeryItem implements Surgery {
//   id: number;
//   surgeryName: string;
//   patientName: string;
//   surgeryDate: Date;
//   cptCodes: string;
//   dxCodes: string;
//   status: string = "new";
//   isComplete: boolean = false;
//   starttime: Date = null;
//   endtime: Date = null;
//   isBilled: boolean = false;
//   imageName: string = "person-flat.png";
//   numComments: number = 11;
//   constructor(
//     id: number,
//     surgeryName: string,
//     patientName: string,
//     surgeryDate: Date,
//     cptCodes: string,
//     dxCodes: string,
//     status: string = "new",
//     isComplete: boolean = false,
//     starttime: Date = null,
//     endtime: Date = null,
//     isBilled: boolean = false,
//     imageName: string = "person-flat.png",
//     numComments: number = 11
//   ) {
//     this.id = id;
//     this.surgeryName = surgeryName;
//     this.patientName = patientName;
//     this.surgeryDate = surgeryDate;
//     this.cptCodes = cptCodes;
//     this.dxCodes = dxCodes;
//     this.status = status;
//     this.isComplete = isComplete;
//     this.starttime = starttime;
//     this.endtime = endtime;
//     this.isBilled = isBilled;
//     this.imageName = imageName;
//     this.numComments = numComments;
//   }
// }

export class DataSurgeryStore {
  dates: Array<string>=[];
  data: Array<PulseViewModel>;
  metrics: SurgeryMetrics = new SurgeryMetrics();
  surgeries: SurgeryGroupItem[] = [];
  futureSurgeries: SurgeryGroupItem[] = [];
  pastSurgeries: SurgeryGroupItem[] = [];
  todaySurgeries: SurgeryGroupItem[] = [];
  groupedSurgeries: SurgeryGroup[] = [];
  constructor() {}

  refreshData() {
    console.group("Refresh Surgery Data");
    //sort by date
    // try {
    //   this.data.sort((a: PulseViewModel, b: PulseViewModel) => {
    //     return new Date(a.term).getDate() - new Date(b.term).getDate();
    //   });
    // } catch (error) {
    //   console.error('Sort Error"');
    // }
    this.pastSurgeries = [];
    this.futureSurgeries = [];
    this.surgeries = [];
    this.todaySurgeries = [];
    this.metrics = new SurgeryMetrics();
    this.data.sort((a: PulseViewModel, b: PulseViewModel) => {
      try {
        if (a.term !== null)
          return new Date(a.term).getTime() - new Date(b.term).getTime();
      } catch (error) {
        console.error('Sort Error"');
      }
    });
    this.data.forEach((surgery: PulseViewModel) => {
      try {

        //handles edge case
        if (surgery.cpt)
          surgery.cpt = surgery.cpt.replace("level,", "level ");
        if (surgery.diagnosisCode)
          surgery.diagnosisCode = surgery.diagnosisCode.replace(
            "level,",
            "level "
          );

        //GROUP
        let newSurgery = new SurgeryGroupItem(surgery);
        let today = new Date();
        let currentDate = new Date();
        // this.dates.push(currentDate.toLocaleDateString());

        // if (new Date(surgery.term) != currentDate) {
        currentDate = new Date(surgery.term);

        //   let newGroup: SurgeryGroup = new SurgeryGroup(currentDate);
        //   currentSurgeries = newGroup.surgeries;
        //   this.groupedSurgeries.push(newGroup);
        // }
        // currentSurgeries.push(newSurgery);
        newSurgery.occurs = "past";
        if (currentDate.toLocaleDateString() === today.toLocaleDateString()) {
          newSurgery.occurs = "today";
          this.todaySurgeries.push(newSurgery);
        }
        else if (currentDate > new Date()) {
          newSurgery.occurs = "future";
          this.futureSurgeries.push(newSurgery);
        } else this.pastSurgeries.push(newSurgery);

        if (surgery.preferenceCardName)
          this.metrics.cards.push(surgery.preferenceCardName.trim());
        if (surgery.speciality)
          this.metrics.speciality.push(surgery.speciality.trim());
        if (surgery.admissionStatus)
          this.metrics.admissionStatus.push(
            surgery.admissionStatus.trim()
          );
        if (surgery.patient)
          this.metrics.surgeryType.push(surgery.patient.trim());

        if (surgery.cpt) {
          let qt = surgery.cpt
            .split(",")
            .filter(
            w =>
              !!w.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "").trim()
                .length
            );
          qt.forEach((code: string) => {
            this.metrics.cptCodes.push(code.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, ""));
          });
        }
        if (surgery.diagnosisCode) {
          let qt = surgery.diagnosisCode
            .split(",")
            .filter(
            w =>
              !!w.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "").trim()
                .length
            );
          qt.forEach((code: string) => {
            this.metrics.diagnosisCodes.push(code.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, ""));
          });
        }
      } catch (e) {
        console.error("Error in surgery", 'Surgery', surgery, e.toString());
      }

    });
    this.calculateMetrics();
    // this.reduceGroup();

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
  calculateMetrics() {
    console.log("Processing Surgery Metrics");

    // this.groupedSurgeries = this.groupedSurgeries.sort(
    //   (a: SurgeryGroup, b: SurgeryGroup) => {
    //     return a.realDate.getDate() - b.realDate.getDate();
    //   }
    // );

    this.metrics.uniqueDiag = this.uniqueMetrics(
      this.metrics.diagnosisCodes
    );
    this.metrics.diagnosisCodes = this.countMetrics(
      this.metrics.diagnosisCodes
    );

    this.metrics.uniqueCpt = this.uniqueMetrics(
      this.metrics.cptCodes
    );
    this.metrics.cptCodes = this.countMetrics(
      this.metrics.cptCodes
    );

    //ADDMISSIONS
    this.metrics.uniqueAdmissionStatus = this.uniqueMetrics(this.metrics.admissionStatus);
    this.metrics.admissionStatus = this.countMetrics(
      this.metrics.admissionStatus
    );

    //CARDS
    this.metrics.uniqueCards = this.uniqueMetrics(
      this.metrics.cards
    );
    this.metrics.cards = this.countMetrics(this.metrics.cards);
    //SPECIALITY
    this.metrics.uniqueSpeciality = this.uniqueMetrics(this.metrics.speciality);

    this.metrics.speciality = this.countMetrics(
      this.metrics.speciality
    );

    //SURGERY TYPE
    this.metrics.uniqueSurgeryType = this.uniqueMetrics(
      this.metrics.surgeryType
    );
    this.metrics.surgeryType = this.countMetrics(
      this.metrics.surgeryType
    );

    this.metrics.future = this.futureSurgeries.length;
    this.metrics.past = this.pastSurgeries.length;
    this.metrics.today = this.todaySurgeries.length;

    //get rid of empty future groups.

  }
  reduceGroup() {
    console.group("Reduce Surgery Group");
    console.log("Old Surgery group count", this.groupedSurgeries.length);
    let newGroups: SurgeryGroup[] = [];
    this.groupedSurgeries.forEach((group: SurgeryGroup) => {
      if (group.surgeries.length > 0) newGroups.push(group);
    });
    this.groupedSurgeries = newGroups;
    console.log("New Surgery group count", this.groupedSurgeries.length);
    console.groupEnd();
  }

  public findSugeryById(id: number): SurgeryGroupItem {
    let surg = this.futureSurgeries.find(s => s.surgery.surgeryId === id);
    if (!surg)
      surg = this.todaySurgeries.find(s => s.surgery.surgeryId === id);
    if (!surg)
      surg = this.pastSurgeries.find(s => s.surgery.surgeryId === id);
    return surg;
  }
}

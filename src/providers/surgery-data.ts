
import { Events } from "ionic-angular";
import {
  SurgeryMetrics,
  SurgeryGroup,
  SurgeryGroupItem,
  IMetric
} from "../models/metrics/metrics";
import { PulseViewModel } from "../models/viewmodels/pulse_model";

import { AuthHttp } from "angular2-jwt";

import { Injectable } from "@angular/core";

import { Observable } from "rxjs/Observable";

import { AuthService, CONFIGURATION, LoggerService } from "../shared/index";
import "rxjs/add/operator/map";
import "rxjs/add/observable/of";
import { Http } from "@angular/http";
import { DataSurgeryStore } from "../models/viewmodels/surgery_model";
/// import { Database } from "./database/database";

@Injectable()
export class SurgeryData {
  loaded: boolean = false;
  model: DataSurgeryStore;
  constructor(
    public authHttp: AuthHttp,
    public http: Http,
    public auth: AuthService,
    public log: LoggerService,
    public events: Events
  ) { }
  load_(): Observable<DataSurgeryStore> {
    debugger;
    
      return this.http.get('/assets/data/surgeries-12.json')
        .map(this.processData,this);
 
  }

  load(): Observable<DataSurgeryStore> {

      if (this.model) {
        this.loaded = true;
        console.log("NOT LOADING FROM SERVER", this.model);
        return Observable.of(this.model);
      } else {
        this.loaded = false;
        //  var month = d.getUTCMonth() + 1; //months from 1-12
        //  var day = d.getUTCDate();F fF F
        //  var year = d.getUTCFullYear();
        var url =
          CONFIGURATION.baseUrls.apiUrl + "surgeries/all/" + this.auth.fosId;
        // var url = CONFIGURATION.baseUrls.apiUrl + 'surgeries/all/' + this.auth.fosId + '/' + month + '/' + day + '/0'
        //  var url = CONFIGURATION.baseUrls.apiUrl + 'surgeries/all/12';
        //   var url = CONFIGURATION.baseUrls.apiUrl + 'surgeries/today/12';
        // var url = CONFIGURATION.baseUrls.apiUrl + 'surgeries/all/12/6/1/2017';
        console.log("LOADING FROM SERVER", url);
        //  this.log.startTracking("Loading surgeries from server");
        return this.authHttp.get(url).map(this.processData, this);
      }

  }
  loadData() {
    //  this.db.getSurgeries().then(result => {
    //      this.model = <DataSurgeryStore>result;
    //    }, error => {
    //      console.log("ERROR: ", error);
    //    });
    this.auth.storage
      .get("surgeries")
      .then((dd: any) => {
        if (dd) {
          this.model = JSON.parse(dd) as DataSurgeryStore;
          this.events.publish(
            "surgeries:loadedStore",
            "DataSurgeryStore",
            this.model
          );
          this.refreshData();
          this.events.publish(
            "surgeries:metrics",
            "DataSurgeryStore LoadData",
            this.model.metrics
          );
          console.log("Loaded surgeries data from memory");
        } else
          this.events.publish("surgeries:loadedStore", "DataSurgeryStore", -1);
      })
      .catch(() => {
        this.events.publish("surgeries:loadedStore", "DataSurgeryStore", -1);
        console.error("No surgeries  data stored locally");
      });
  }
  saveData() {
    console.log("Save surgeries data");
    try {
      // this.db.saveSurgeries(new Date(), JSON.stringify(this.model));
      this.auth.storage.set("surgeriesStoreDate", new Date().toUTCString());
      this.auth.storage.set("surgeries", JSON.stringify(this.model));
    } catch (e) {
      console.error(e);
    }
  }
  processData(data: any) {
 
    console.group("Process Surgery Data");
    // just some good 'ol JS fun with objects and arrays
    // build up the data by linking speakers to sessions
    this.model = new DataSurgeryStore();
    this.model.data = data.json();
    this.refreshData();
    this.events.publish("surgeries:loaded", "SurgeryDataStore", this.model);

    console.info("Process Surgery Data Complete", this.model);
    console.groupEnd();

    return this.model;
  }
  refreshData() {
    console.group("Refresh Surgery Data");
    //sort by date
    // try {
    //   this.model.data.sort((a: PulseViewModel, b: PulseViewModel) => {
    //     return new Date(a.term).getDate() - new Date(b.term).getDate();
    //   });
    // } catch (error) {
    //   console.error('Sort Error"');
    // }
    this.model.pastSurgeries = [];
    this.model.futureSurgeries = [];
    this.model.surgeries = [];
    this.model.todaySurgeries = [];
    this.model.metrics = new SurgeryMetrics();
    this.model.data.sort((a: PulseViewModel, b: PulseViewModel) => {
      try {
        if (a.term !== null)
          return new Date(a.term).getTime() - new Date(b.term).getTime();
      } catch (error) {
        console.error('Sort Error"');
      }
    });
    this.model.data.forEach((surgery: PulseViewModel) => {
      try {
        surgery.doctorImage = this.auth.getPicture();

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
        // this.model.dates.push(currentDate.toLocaleDateString());

        // if (new Date(surgery.term) != currentDate) {
        currentDate = new Date(surgery.term);

        //   let newGroup: SurgeryGroup = new SurgeryGroup(currentDate);
        //   currentSurgeries = newGroup.surgeries;
        //   this.model.groupedSurgeries.push(newGroup);
        // }
        // currentSurgeries.push(newSurgery);
        newSurgery.occurs = "past";
        if (currentDate.toLocaleDateString() === today.toLocaleDateString()) {
          newSurgery.occurs = "today";
          this.model.todaySurgeries.push(newSurgery);
        }
        else if (currentDate > new Date()) {
          newSurgery.occurs = "future";
          this.model.futureSurgeries.push(newSurgery);
        } else this.model.pastSurgeries.push(newSurgery);

        if (surgery.preferenceCardName)
          this.model.metrics.cards.push(surgery.preferenceCardName.trim());
        if (surgery.speciality)
          this.model.metrics.speciality.push(surgery.speciality.trim());
        if (surgery.admissionStatus)
          this.model.metrics.admissionStatus.push(
            surgery.admissionStatus.trim()
          );
        if (surgery.patient)
          this.model.metrics.surgeryType.push(surgery.patient.trim());

        if (surgery.cpt) {
          let qt = surgery.cpt
            .split(",")
            .filter(
            w =>
              !!w.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "").trim()
                .length
            );
          qt.forEach((code: string) => {
            this.model.metrics.cptCodes.push(code.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, ""));
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
            this.model.metrics.diagnosisCodes.push(code.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, ""));
          });
        }
      } catch (e) {
        console.error("Error in surgery", 'Surgery', surgery, e.toString());
      }

    });
    this.calculateMetrics();
    // this.reduceGroup();
    this.saveData();
    console.info("Process Surgery Data Complete", this.model);
    console.groupEnd();
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

    // this.model.groupedSurgeries = this.model.groupedSurgeries.sort(
    //   (a: SurgeryGroup, b: SurgeryGroup) => {
    //     return a.realDate.getDate() - b.realDate.getDate();
    //   }
    // );

    this.model.metrics.uniqueDiag = this.uniqueMetrics(
      this.model.metrics.diagnosisCodes
    );
    this.model.metrics.diagnosisCodes = this.countMetrics(
      this.model.metrics.diagnosisCodes
    );

    this.model.metrics.uniqueCpt = this.uniqueMetrics(
      this.model.metrics.cptCodes
    );
    this.model.metrics.cptCodes = this.countMetrics(
      this.model.metrics.cptCodes
    );

    //ADDMISSIONS
    this.model.metrics.uniqueAdmissionStatus = this.uniqueMetrics(this.model.metrics.admissionStatus);
    this.model.metrics.admissionStatus = this.countMetrics(
      this.model.metrics.admissionStatus
    );

    //CARDS
    this.model.metrics.uniqueCards = this.uniqueMetrics(
      this.model.metrics.cards
    );
    this.model.metrics.cards = this.countMetrics(this.model.metrics.cards);
    //SPECIALITY
    this.model.metrics.uniqueSpeciality = this.uniqueMetrics(this.model.metrics.speciality);

    this.model.metrics.speciality = this.countMetrics(
      this.model.metrics.speciality
    );

    //SURGERY TYPE
    this.model.metrics.uniqueSurgeryType = this.uniqueMetrics(
      this.model.metrics.surgeryType
    );
    this.model.metrics.surgeryType = this.countMetrics(
      this.model.metrics.surgeryType
    );

    this.model.metrics.future = this.model.futureSurgeries.length;
    this.model.metrics.past = this.model.pastSurgeries.length;
    this.model.metrics.today = this.model.todaySurgeries.length;

    this.events.publish(
      "surgery:metrics",
      "DataSurgeryStore",
      this.model.metrics
    );
    //get rid of empty future groups.
    console.log("Processed Surgery Metrics Done", this.model.metrics);

  }
  reduceGroup() {
    console.group("Reduce Surgery Group");
    console.log("Old Surgery group count", this.model.groupedSurgeries.length);
    let newGroups: SurgeryGroup[] = [];
    this.model.groupedSurgeries.forEach((group: SurgeryGroup) => {
      if (group.surgeries.length > 0) newGroups.push(group);
    });
    this.model.groupedSurgeries = newGroups;
    console.log("New Surgery group count", this.model.groupedSurgeries.length);
    console.groupEnd();
  }

  getMetrics() {
    return this.load().map((data: any) => {
      let m = data.metrics;
      this.events.publish("surgery:metrics", "PulsePage", m);
      return m;
    });
  }
  findSugeryById(id: number): SurgeryGroupItem {
    let surg = this.model.futureSurgeries.find(s => s.surgery.surgeryId === id);
    if (!surg)
      surg = this.model.todaySurgeries.find(s => s.surgery.surgeryId === id);
    if (!surg)
      surg = this.model.pastSurgeries.find(s => s.surgery.surgeryId === id);
    return surg;
  }
  getSurgeries(
    _queryText = "",
    _excludeTracks: any[] = [],
    _segment = "today",
    reset = false
  ) {
    if (reset) this.model = null;
    return this.load().map((data: any) => {
      let s = data;
      s.metrics = data.metrics;
      return data;
    });
  }

  failure(error: any) {
    let errMsg = error.message
      ? error.message
      : error.status ? `${error.status} - ${error.statusText}` : "Server error";
    console.error(errMsg); // log to console instead
    return errMsg;
  }
  handleError(error) {
    console.error(error);
    return Observable.throw(error.json().error || "Server error");
  }
}
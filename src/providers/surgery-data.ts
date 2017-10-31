
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
          this.model.refreshData();
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
  public findSugeryById(id: number): SurgeryGroupItem {
    let surg = this.model.futureSurgeries.find(s => s.surgery.surgeryId === id);
    if (!surg)
      surg = this.model.todaySurgeries.find(s => s.surgery.surgeryId === id);
    if (!surg)
      surg = this.model.pastSurgeries.find(s => s.surgery.surgeryId === id);
    return surg;
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
   this.model.refreshData();
    this.events.publish("surgeries:loaded", "SurgeryDataStore", this.model);
    this.events.publish(
      "surgery:metrics",
      "DataSurgeryStore",
      this.model.metrics
    );
this.saveData();
    console.info("Process Surgery Data Complete", this.model);
    console.groupEnd();
    //this.refreshData();
    return this.model;
  }

  getMetrics() {
    return this.load().map((data: any) => {
      let m = data.metrics;
      this.events.publish("surgery:metrics", "PulsePage", m);
      return m;
    });
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

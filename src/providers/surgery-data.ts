
import { Events } from "ionic-angular";
import {
  SurgeryMetrics,
  SurgeryGroup,
  SurgeryGroupItem,
  IMetric
} from "../models/metrics/metrics";
import { PulseViewModel } from "../models/viewmodels/pulse_model";

import { AuthHttp } from "angular2-jwt";

import { Injectable, Inject } from "@angular/core";

import { Observable } from "rxjs/Observable";

import { AuthService, CONFIGURATION, LoggerService } from "../shared/index";
import "rxjs/add/operator/map";
import "rxjs/add/observable/of";
import { Http } from "@angular/http";
import { DataSurgeryStore } from "../models/viewmodels/surgery_model";
import { EnvVariables } from "../app/environment-variables/environment-variables.token";
/// import { Database } from "./database/database";
import * as moment from 'moment';
@Injectable()
export class SurgeryData {
  loaded: boolean = false;
  model: DataSurgeryStore;
  constructor(
    public authHttp: AuthHttp,
    public http: Http,
    public auth: AuthService,
    public log: LoggerService,
      public events: Events,
      @Inject(EnvVariables) public env
  ) { }
  load_(): Observable<DataSurgeryStore> {
   // debugger;

      return this.http.get('/assets/data/surgeries-12.json')
        .map(this.processData,this);

  }

    load(): Observable<DataSurgeryStore> {

        if (this.model) {
            this.loaded = true;
             this.log.console("NOT LOADING FROM SERVER", this.model);
            return Observable.of(this.model);
        } else {
            this.loaded = false;
            var url = this.env.apiUrl + "surgeries/all/" + this.auth.fosId;

             this.log.console("LOADING FROM SERVER", url);
            //  this.log.startTracking("Loading surgeries from server");
            return this.authHttp.get(url).map(this.processData, this);
        }
    }
  loadData() {
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
           this.log.console("Loaded surgeries data from memory");
        } else
          this.events.publish("surgeries:loadedStore", "DataSurgeryStore", -1);
      })
      .catch(() => {
        this.events.publish("surgeries:loadedStore", "DataSurgeryStore", -1);
         this.log.error("No surgeries  data stored locally");
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
     this.log.console("Save surgeries data");
    try {
      // this.db.saveSurgeries(new Date(), JSON.stringify(this.model));
      this.auth.storage.set("surgeriesStoreDate", new Date().toUTCString());
      this.auth.storage.set("surgeries", JSON.stringify(this.model));
    } catch (e) {
       this.log.error(e);
    }
  }
  processData(data: any) {

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
     this.log.console("Process Surgery Data Complete", this.model);
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
     this.log.error(errMsg); // log to console instead
    return errMsg;
  }
  handleError(error) {
     this.log.error(error);
    return Observable.throw(error.json().error || "Server error");
  }
}

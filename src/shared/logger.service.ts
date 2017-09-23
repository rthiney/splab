
import { AppInsightsService } from 'ng2-appinsights';
import { AzureMobile } from './app.constants';
import { Injectable } from "@angular/core";
import azureMobileClient from 'azure-mobile-apps-client';
import { Storage } from "@ionic/storage";
@Injectable()
export class LoggerService {

  user: string = 'No user found';
  logs: string[] = [];
  client: any;
  table: any;

  constructor(public insight: AppInsightsService, public storage: Storage) {
    console.log('Instance Logger');
    console.dir(this.storage);
    this.storage
      .get("profile")
      .then(profile => {
        if (profile) {
          this.storage.get("username").then(un => {
            console.warn("Logger is using " + un + " to log activities.");
            this.user = un;
          });
        }
      })
      .catch(_error => {
        console.warn("Logger couldn't get username from storage.");
      });
    // this.client = new azureMobileClient.MobileServiceClient(AzureMobile.url);
    // this.table = this.client.getTable('Log');
  }
  console(msg: any, obj?: any) {
    obj ? console.log(msg, obj) : console.log(msg);
    this.insight.trackTrace(msg, { username: this.user });
  
  }
  event(msg: any, data?: any) {
    this.log(msg, 'EVENT', false);
    this.insight.trackEvent(msg, { 'username': this.user }, data);

  }
  view(msg: any) {
    this.log(msg, 'PAGEVIEW', false);
    this.insight.trackPageView(msg, null, { username: this.user });
  
  }
  error(msg: any, data?: any) { 
    console.error('LOGGER RAW', data); 
    this.log(msg, 'ERROR', true, data);
    this.insight.trackException(data, 'SPLogger', { username: this.user });
  } 

  //toast

  private log(msg: any, logType: string, isErr: boolean, err?: any, ) {
    if (isErr) {
      console.error(msg);
      this.logError(msg, err, logType);
    }
    else 
      console.log(msg);  
  }
  private logError(_msg: any, _er: any, _logType: string) {

    // try {
    //   var newItem = {
    //     logType: logType,
    //     message: msg,
    //     error: this.failure(er),
    //     userId: -1
    //   };

    //   this.logs.push(JSON.stringify(newItem));
    //   this.table
    //     .insert(newItem)
    //     .done(function (insertedItem) {
    //       console.log('Added Log', insertedItem);
    //     }, this.failure);

    // } catch (error) {
    //   console.error('LOG ERROR', this.failure(error));
    // }
  }

  failure(error: any) {
    let errMsg = error.message
      ? error.message
      : error.status ? `${error.status} - ${error.statusText}` : "Server error";
    this.insight.trackException(error);
    console.error("ERROR LOGGER", errMsg); // log to console instead
    return errMsg;
  }
}

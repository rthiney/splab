
import { AzureMessageSendData, AzureMessageData } from './../../models/azure';
import { AuthService, AzureMobile, LoggerService } from "./../../shared/index";
import { DoctorMessageModel } from '../../models/viewmodels/doctor_message_model';
import { Component } from "@angular/core";

import {
  NavController,
  NavParams,
  Events,
  ViewController
} from "ionic-angular";

import azureMobileClient from "azure-mobile-apps-client";
import { MessageService } from '../../shared/message.service';

import { MessageGroupItem } from '../../models/metrics';

@Component({
  selector: "page-message-detail",
  templateUrl: "message-detail.html"
})
export class MessageDetailPage {
  countcomplete: boolean;
  message: DoctorMessageModel;
  messageItem: MessageGroupItem;
  client: any;
  table: any;
  messageAzure: AzureMessageData;
  messgeDataExists: any[] = [];
  constructor(
    private auth: AuthService,
    public navCtrl: NavController,
    public navParams: NavParams,
    private _service: MessageService,
    private log: LoggerService,
    public _events: Events,
    public viewCtrl: ViewController
  ) {
    // this.log.console('Loaded MessageDetailPage', this.navParams.data);
    this.message = this.navParams.data;
    console.log("Message Detail Page:", this.message);
  }
  ionViewWillEnter() {
    this.subscribeToEvents();
    this.countcomplete = false;
    this.client = new azureMobileClient.MobileServiceClient(AzureMobile.url);
    this.table = this.client.getTable("MessagesData");
    this.log.console(
      "Loaded MessageDetailPage AzureMobile URL",
      AzureMobile.url
    );
    this.saveToMobileClientTable();
    //this.getMobileDataMessage();
  }
  dismiss(_msg: DoctorMessageModel) {
    this.viewCtrl.dismiss(this.message);
  }
  subscribeToEvents() {
    this._events.subscribe("messagedata:inserted", n => {
      console.log("messagedata:inserted", n);
      this.messageAzure = n;
      this.countcomplete = true;
    });
    this._events.subscribe("messagedata:updated", n => {
      console.log("messagedata:updated", n);
      this.messageAzure = n;
      this.countcomplete = true;
    });
    this._events.subscribe("messagedata:exisits", n => {
      console.log("Message Data Exists FROM AZURE", n);
      n.forEach(o => {
        o.message_sent = JSON.parse(o.message_sent) as DoctorMessageModel;
        //  o.response=JSON.parse(o.response);
        this.messgeDataExists.push(o);
      });

    });
  }
  saveToMobileClientTable() {
    console.log("Checking for existing message data.", { 'messageid': this.message.id });
    this.table.where({ message_id: this.message.id }).read().then(res => {
      console.log('Message Found Result', res);
      if (!res[0]) {
        console.log("Message data did not exist. ", res);
        var newData = {
          message_id: this.message.id,
          viewcount: 1
        };
        console.log("Creating Message.", newData);
        this.table
          .insert(newData)
          .then((rers: AzureMessageData) => {
            this._events.publish("messagedata:inserted", rers);
          })
          .done(function (_insertedItem) { }, this.failure);
      } else {
        console.log("Found data. ");
        this.updateMessageDate(res[0]);
      }
    }, this.failure);
  }

  getMobileDataMessage() {
    this._service.getMessageSendData(this.message).then((res: Array<AzureMessageSendData>) => {
      this._events.publish("messagedata:exisits", res);
    }, this.failure);
  }

  updateMessageDate(res: any) {
    console.group("updateMessageDate()");
    console.log("updateMessageDate() Message Data ID", res.id);
    var updateData = { id: res.id, viewcount: res.viewcount + 1 };
    console.log("updateMessageDate() New Value", updateData);
    this.table
      .update(updateData)
      .then((res: AzureMessageData) => {
        console.log("updateMessageDate() Done", updateData);
        this._events.publish("messagedata:updated", res);
      })
      .done(function (updatedItem) {
        console.log("updateMessageDate() updatedItem", updatedItem);
      }, this.failure);
  }

  failure(error: any) {
    this.countcomplete = true;
    let errMsg = error.message
      ? error.message
      : error.status ? `${error.status} - ${error.statusText}` : "Server error";
    this.log.error(errMsg); // log to console instead
    return errMsg;
  }
}

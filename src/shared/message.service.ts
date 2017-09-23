//import { AzureBillingSendData } from '../models/azure/billing-send-data';
import { Injectable } from "@angular/core";
//import { FormGroup, FormBuilder } from "@angular/forms";
import { Headers } from "@angular/http";
import { AuthService, CONFIGURATION, LoggerService } from "./index";
import { DoctorMessageModel } from "../models/viewmodels/doctor_message_model";
import { PulseViewModel } from "../models/viewmodels/pulse_model";

import { DoctorMessage } from "../models/DoctorMessage";
import { AuthHttp } from "angular2-jwt";
import azureMobileClient from "azure-mobile-apps-client";
import { AzureMobile } from "./app.constants";
import { Events } from 'ionic-angular';
@Injectable()
export class MessageService {
  private headers = new Headers({ "Content-Type": "application/json" });
  client: any;
  tableReply: any;
  tableMessages: any;
  tableBilling: any;
  constructor(
    private authHttp: AuthHttp,
    private auth: AuthService,
    private events: Events,
    private log: LoggerService
  ) {
    this.client = new azureMobileClient.MobileServiceClient(AzureMobile.url);
    this.tableReply = this.client.getTable("MessageSendData");
    this.tableBilling = this.client.getTable("BillingSendData");
    this.tableMessages = this.client.getTable("MessagesData");
  }
  getAll(): Promise<DoctorMessageModel[]> {
    this.log.console("getAll:");
    var url =
      CONFIGURATION.baseUrls.apiUrl + "messages/doctors/" + this.auth.fosId;
    // var url =CONFIGURATION.apiUrls.message + '?transform=1&order=created_at,desc&filter[]=user_id,eq,' + this.auth.fosId
    console.log("Message URL:", url);
    return this.authHttp
      .get(url)
      .toPromise()
      .then(response => response.json() as DoctorMessageModel[])
      .catch(this.handleError);
  }

  //   sendEmail(emailForm: FormGroup): Promise<DoctorMessageModel>
  // {
  //          this.log.console('sendEmail:' );
  //     var url = CONFIGURATION.baseUrls.apiUrl + 'messages';
  //     console.log(emailForm.value);
  //     this.log.console('sendEmail:', emailForm);
  //   return this.authHttp
  //     .post(url,  emailForm.value  )
  //     .toPromise()
  //     .then(res => res.json())
  //     .catch(this.handleError);
  // }

  sendEmail(msg: DoctorMessageModel, message_id: number): Promise<any> {
    const url = CONFIGURATION.baseUrls.apiUrl + "messages";
    console.log("Sending Email", url);
    console.log("Sending Email", msg);
    console.log("Sending Email:message_id", message_id);

    return this.authHttp
      .post(
      url,
      JSON.stringify({
        subject: msg.subject,
        message: msg.message,
        email: msg.email,
        HospitalEmail: msg.HospitalEmail
      }),
      { headers: this.headers }
      )
      .toPromise()
      .then(res => {
        console.log("sendEmail SUCCESS!", res);
        return this.createMessageSendData(msg, message_id, res);
      })
      .catch(this.handleError);

  }

  createMessageSendData(
    msg: DoctorMessageModel,
    messageId: number,
    response: any
  ): Promise<any> {
    console.log(response);

    return this.tableReply
      .insert({
        message_id: messageId,
        response: response.status,
        message_sent: JSON.stringify(msg),
        replied_at: new Date()
      })
      .then(
      function (response) {
        console.log("createMessageSendData SUCCESS!", response);
      },
      function (_error) {
        console.log("createMessageSendData FAIL!");
      }
      );
  }

  getMessageSendData(msg: DoctorMessageModel): Promise<any> {
    console.log("getMessageSendData is checking for", msg);
    return this.tableReply.where({ message_id: msg.id }).read().then(res => {
      console.log("getMessageSendData is got", res);
      return res;
    }, function (_error) {
      console.log("getMessageSendData FAIL!");
    });
  }

  sendBillingEmail(surgery: PulseViewModel, msg: any) {
    var url =
      CONFIGURATION.baseUrls.apiUrl +
      "messages/sendbilling/" +
      surgery.surgeryId +
      "/0";
    console.log(url);
    return this.authHttp
      .get(url)
      .toPromise()
      .then(res => {
        this.events.publish("email:billing", surgery, msg, res);
      })
      .catch(err => { console.error(err); });
  }
  createBillingSendData(
    msg: any,
    messageId: number,
    response: any
  ): Promise<any> {

    return this.tableBilling
      .insert({
        surgery_id: messageId,
        response: response.status,
        message_sent: JSON.stringify(msg),
        replied_at: new Date()
      })
      .then(
      function (response) {
        console.log("createBillingSendData SUCCESS!", response);
      },
      function (error) {
        console.error("createBillingSendData FAIL!", error);
      }
      );
  }

  get(id: number): Promise<DoctorMessage> {
    this.log.console("get:");
    const url = CONFIGURATION.baseUrls.apiUrl + "messages/" + id;
    return this.authHttp
      .get(url)
      .toPromise()
      .then(response => response.json() as DoctorMessage)
      .catch(this.handleError);
  }

  update(msg: DoctorMessageModel): Promise<DoctorMessage> {
    this.log.console("MessageService:update:");
    const url = `${CONFIGURATION.baseUrls.apiPhp + "doctor_message"}/${msg.id}`;
    var newData = {
      viewcount: 23
    };
    return this.authHttp
      .put(url, JSON.stringify(newData))
      .toPromise()
      .then(() => msg)
      .catch(this.handleError);
  }

  markRead(msg: DoctorMessageModel): Promise<DoctorMessage> {
    this.log.console("MessageService:markread:");
    const url = `${CONFIGURATION.baseUrls.apiPhp + "doctor_message"}/${msg.id}`;
    var newData = {
      viewed: true
    };
    return this.authHttp
      .put(url, JSON.stringify(newData))
      .toPromise()
      .then(() => msg)
      .catch(this.handleError);
  }
  deleteMessage(msg: DoctorMessageModel): Promise<DoctorMessage> {
    this.log.console("update:");
    const url = `${CONFIGURATION.baseUrls.apiPhp + "doctor_message"}/${msg.id}`;

    return this.authHttp
      .delete(url)
      .toPromise()
      .then(() => msg)
      .catch(this.handleError);
  }

  private handleError(error: any) {
    // In a real world app, we might use a remote logging infrastructure
    // We'd also dig deeper into the error to get a better message
    let errMsg = error.message
      ? error.message
      : error.status ? `${error.status} - ${error.statusText}` : "Server error";
    console.error("handleError in Message Servicess", errMsg); // log to console instead
    return errMsg;
  }
}

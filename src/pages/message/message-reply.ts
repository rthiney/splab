import { NotifyService } from './../../shared/notify.service';
import {  AzureMobile } from './../../shared/app.constants';
import { AuthService } from './../../shared/auth.service';
import { MessageService } from '../../shared/message.service';
import { Component } from '@angular/core';
import { Platform, NavParams, ViewController, App, Events } from 'ionic-angular';
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { DoctorMessageModel } from '../../models/viewmodels/doctor_message_model'; 
import azureMobileClient from 'azure-mobile-apps-client';
// import { HockeyApp } from "ionic-hockeyapp/dist";
// import { MessageData } from "../../providers/message-data";
// declare var require: any;
// declare function escape(s:string): string;
@Component({
  templateUrl: './message-reply.html'
})
export class MessageReplyModal {

    mailForm: FormGroup;
  message: DoctorMessageModel;
  client: any;
  table: any;
  constructor(
    public app: App,
    private auth: AuthService,
    private formBuilder: FormBuilder,
    private _service: MessageService,
    public platform: Platform,
    public params: NavParams,
    public viewCtrl: ViewController,
    public loadCtrol:NotifyService,
   // private hockeyapp: HockeyApp,
  // private _msgService: MessageData,
    public events: Events
  ) {
    this.message = params.get('msg');
    this.client = new azureMobileClient.MobileServiceClient(AzureMobile.url);
    this.table = this.client.getTable('MessagesData');
    //this.surgery = this.params.get('s');
    if (this.message === undefined) {
      // this.message = new DoctorMessage(-1, '');
    //  this.message = "Add Message";
    }
    this.mailForm = this.formBuilder.group({
      to: [this.message.HospitalEmail || this.message.email, Validators.compose([Validators.minLength(5), Validators.maxLength(255), Validators.required])],
      from: [this. auth.email, Validators.compose([Validators.minLength(5), Validators.maxLength(255), Validators.required])],
      subject: ['RE:' + this.message.subject, Validators.compose([Validators.minLength(5), Validators.maxLength(255), Validators.required])],
      message: ['', Validators.compose([Validators.minLength(10), Validators.maxLength(1000), Validators.required])]
    });
    //   this.saveToMobileClientTable();

  }

  // saveToMobileClientTable() {
  //   console.log('saveToMobileClientTable', this.message)

  //   this.table
  //     .where({ message_id: this.message.id })
  //     .read()
  //     .then(res => {
  //       console.log('Read Table Response : ' + res);
  //       if (!res[0]) {
  //         this.createMessageData()
  //       } else {
  //         var updateData = { id: res[0].id, viewcount: res[0].viewcount + 1 };
  //         console.log('Updated count ==>', updateData);
  //         this.table.update(updateData).done(function (updatedItem) {

  //         }, this.failure);
  //       }
  //       console.log(res)
  //     }
  //     , this.failure);
  // }

  // updateMessageDate(res: any) {
  //   var updateData = { id: res.id, viewcount: res.viewcount + 1 };
  //   this.table.update(updateData).done(function (updatedItem) {
  //   }, this.failure);
  // }

  createMessageData() {
    try {
      console.log(' CREATING MessageData', this.message);
      this.table.insert(
        { message_id: this.message.id, viewcount: 1, replied_at: new Date() }
      )
        .then(function (_response) {
        }, function (_error) {
        });
    }
    catch (e) {
      console.error(' createMessageData()', e);
    }
  }

  failure(error: any) {
    let errMsg = (error.message) ? error.message :
      error.status ? `${error.status} - ${error.statusText}` : 'Server error';
    console.error(errMsg); // log to console instead
    return errMsg;
  }
  exists(_messageData) {

  }

newSend() {
 let c= this.loadCtrol.presentLoading("Sending Email");
  let m = new DoctorMessageModel();
  m.subject = this.mailForm.controls.subject.value;
  m.message =  this.mailForm.controls.message.value;
  m.email=this.mailForm.controls.from.value || this.message.email;
  m.HospitalEmail=this.mailForm.controls.to.value;
  //this._service.sendEmail(m, this.message.id) ;
   return this._service
           .sendEmail(m, this.message.id)
           .then(_res => {
             c.dismiss();
             this.events.publish(
               "message:service.sendEmail",
               "Success"
             );
             this.dismiss("Message Sent!");
             console.log("newSend SUCCESS");
           });
}

//   send() {

//     var helper = require('sendgrid').mail;
//     var from_email = new helper.Email('rapael@surgipal.com');
//     var to_email = new helper.Email('raphael.thiney@gmail.com');
//     var subject = 'I\'m replacing the subject tag~!!!!';
//     let msg = this.mailForm.controls.message.value;
//     var content = new helper.Content(msg);
//     var mail = new helper.Mail(from_email, subject, to_email, content);

//     var sg = require('sendgrid')(SendGridVars.key);
//     var request = sg.emptyRequest({
//       method: 'POST',
//       mode: 'no-cors',
//       path: '/v3/mail/send',
//       body: mail.toJSON()
//     });
//  ///mail.send();

// //  mail.toJSON()
//     sg.API(request)
//       .then(response => {
//         this.events.publish('email:reply', this.message);
//         console.log(response.statusCode);
//         console.log(response.body);
//         console.log(response.headers);
//         this.hockeyapp.trackEvent('Send Email Reply Sucess!' + response.toJson());
//       })
//       .catch(error => {
//         //error is an instance of SendGridError
//         //The full response is attached to error.response
//         this.hockeyapp.trackEvent('Send Email Response Error' + error.toString());
//         console.error(error.response.statusCode);
//       });

//   }
  // //With promise
  // sg.API(request)
  //   .then(response => {
  //     console.log(response.statusCode);
  //     console.log(response.body);
  //     console.log(response.headers);
  //   })
  //   .catch(error => {
  //     //error is an instance of SendGridError
  //     //The full response is attached to error.response
  //     console.log(error.response.statusCode);
  //   });

  // sendEmail() {
  //   if (this.mailForm.get('subject').value !== null) {
  //     this._service.sendEmail(this.mailForm).then(data => {
  //       this.dismiss('Sent reply email:' + this.mailForm.get('subject').value);
  //     })
  //       .catch(error => {
  //         this.dismiss('Error: ' + error.toString());
  //       });
  //   }
  //   else {
  //     this.dismiss('Dint send it...');
  //   }
  // }

  dismiss(msg: string) {
    this.viewCtrl.dismiss(msg);
  }

}

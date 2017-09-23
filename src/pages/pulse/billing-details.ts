import { Component } from "@angular/core";

import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import {
  NavParams,
  ViewController,
  Events
} from "ionic-angular";
import { PulseViewModel } from "./../../models/viewmodels/pulse_model";

import { AuthHttp } from "angular2-jwt";
import { AuthService } from "../../shared/auth.service";
import { MessageService } from "../../shared/message.service";
import { SurgeryGroupItem } from "../../models/metrics";

@Component({
  templateUrl: "billing-details.html"
})
export class BillingDetails {
  pulseItem: SurgeryGroupItem;
  surgery: PulseViewModel;
  mailForm: FormGroup;
  _events: Events;

  constructor(
    public authHttp: AuthHttp,
    public auth: AuthService,
    private formBuilder: FormBuilder,
    public params: NavParams,
    public viewCtrl: ViewController,
    public event: Events,
    private _service: MessageService
  ) {
    this._events = event;
    this.pulseItem = params.data;
    this.surgery = this.pulseItem.surgery;
    this.mailForm = this.formBuilder.group({
      to: [
        this.pulseItem.surgery.billingCoordinatorEmail,
        Validators.compose([
          Validators.minLength(0),
          Validators.maxLength(255),
          Validators.required
        ])
      ],
      from: [
        this.pulseItem.surgery.doctorEmail,
        Validators.compose([
          Validators.minLength(0),
          Validators.maxLength(255),
          Validators.required
        ])
      ],
      message: [
        "",
        Validators.compose([
          Validators.minLength(0),
          Validators.maxLength(255)
        ])
      ]
    });
  }

  dismiss(msg: string) {
    // using the injected ViewController this page
    // can "dismiss" itself and pass back data
    this.viewCtrl.dismiss(msg);
  }

  sendEmail() {

    this._service.sendBillingEmail(this.surgery, this.mailForm.controls.message.value)
      .then(res => {

        this.viewCtrl.dismiss(res);

      }).catch(err => { console.error(err); });
  }
  // var url =
  //   CONFIGURATION.baseUrls.apiUrl +
  //   "messages/sendbilling/" +
  //   this.surgery.surgeryId +
  //   "/0";
  // console.log(url);
  // return this.authHttp
  //   .get(url)
  //   .toPromise()
  //   // .then(res => {
  //   //   console.log("sendBillingl SUCCESS!", res);
  //   //   return this._service
  //   //     .createBillingSendData(
  //   //       this.mailForm.controls.message.value,
  //   //       this.surgery.surgeryId,
  //   //       res
  //   //     )
  //       .then(res => {
  //         this._events.publish("email:billing", this.surgery);
  //         this.dismiss("Message Sent!");
  //         console.log("newSend SUCCESS");
  //   })
  //   .catch(err => { console.error(err); this._events.publish("email:fail", this.surgery,err);this.dismiss("Message Send Fail!");});

  // sendEmail() {
  //   try {
  //     console.group("Send Email");
  //     console.log("Surgery", this.surgery);
  //     let d = new Date(this.surgery.term);

  //     var helper = require("sendgrid").mail;
  //     console.log("Mail Form", this.mailForm);
  //     var from_email = new helper.Email(this.surgery.doctorEmail);
  //    // var to_email = new helper.Email(this.surgery.billingCoordinatorEmail);
  //     //     var from_email = new helper.Email('raphael@surgipal.com');
  //    var to_email = new helper.Email('raphael.thiney@gmail.com');
  //     var subject =
  //       "Billing Information for " +
  //       this.surgery.initials +
  //       " performed on " +
  //       this.surgery.patient;
  //     var content = new helper.Content(
  //       "text/html",
  //       "I'm replacing the <strong>body tag</strong>"
  //     );
  //     var mail = new helper.Mail(from_email, subject, to_email, content);

  //     // var personalization = mail.getPersonalizations();
  //     var personalization = new helper.Personalization();
  //     personalization.addSubstitution(
  //       new helper.Substitution(
  //         "-surgeon-",
  //         this.surgery.firstName + " " + this.surgery.lastName
  //       )
  //     );
  //     personalization.addSubstitution(
  //       new helper.Substitution("-patient-", this.surgery.initials)
  //     );
  //     personalization.addSubstitution(
  //       new helper.Substitution("-surgeryname-", this.surgery.patient)
  //     );
  //     personalization.addSubstitution(
  //       new helper.Substitution("-cpt-", this.surgery.cpt)
  //     );
  //     personalization.addSubstitution(
  //       new helper.Substitution("-dx-", this.surgery.diagnosisCode)
  //     );
  //     personalization.addSubstitution(
  //       new helper.Substitution("-surgerydate-", d.toLocaleDateString())
  //     );
  //     personalization.addSubstitution(
  //       new helper.Substitution("-surgerytime-", d.toLocaleTimeString())
  //     );
  //     personalization.addSubstitution(
  //       new helper.Substitution(
  //         "-messageid-",
  //         this.surgery.surgeryId.toString()
  //       )
  //     );
  //     personalization.addTo(mail);
  //     mail.setTemplateId(SendGridVars.billingTemplate);
  //     var sg = require("sendgrid")(SendGridVars.key);

  //     console.log(mail.toJSON());
  //     // var sg = sendgrid(SendGridVars.key)
  //     var request = sg.emptyRequest({
  //       method: "POST",
  //       mode: "no-cors",
  //       path: "/v3/mail/send",
  //       body: mail.toJSON()
  //     });

  //     //With promise
  //     sg
  //       .API(request)
  //       .then(response => {
  //         this._events.publish("email:billing", this.surgery);
  //         console.log(response.statusCode);
  //         console.log(response.body);
  //         console.log(response.headers);
  //         console.groupEnd();
  //         this.hockeyapp.trackEvent("Send Email Sucess!" + response.toJson());
  //         this.appinsightsService.trackEvent("Send Email Success");
  //       })
  //       .catch(error => {
  //         console.groupEnd();
  //         //error is an instance of SendGridError
  //         //The full response is attached to error.response
  //         this.hockeyapp.trackEvent(
  //           "Send Email Response Error" + error.toString()
  //         );
  //               this.appinsightsService.trackException(error, "1st Catch");
  //         console.error(error.response.statusCode);
  //       });

  //     // sg.API(request, function (error, response) {
  //     //   if (error) {
  //     //     console.log('Error response received');
  //     //   }

  //     //       console.log('SEND SUCCESS!');
  //     //       this._events.publish('email:billing', response);

  //     // });
  //   } catch (e) {
  //     console.error(e);
  //     this.hockeyapp.trackEvent("Send Email Error");
  //       this.appinsightsService.trackException(e,"2nd Catch");
  //     console.groupEnd();
  //   }
  //   this.dismiss();
  // }
}

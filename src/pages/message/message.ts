import { MessageService } from "../../shared/message.service";
import { MessageMetrics, MessageGroupItem } from "../../models/metrics/metrics";
import { DoctorMessageModel } from "./../../models/viewmodels/doctor_message_model";
import { MessageReplyModal } from "./message-reply";

import { Component, ViewChild } from "@angular/core";
import {
  ActionSheet,
  ActionSheetController,
  Config,
  NavController, 
  App,
  ModalController, 
  Events,
  List
} from "ionic-angular";
// import { InAppBrowser } from "ionic-native";
import { MessageDetailPage } from "../message-detail/message-detail"; 
import { AuthService, NotifyService, LoggerService } from "../../shared/index"; 
import { MessageData } from "../../providers/message-data";
import { AppInsightsService } from "ng2-appinsights";

@Component({
  selector: "page-message",
  templateUrl: "message.html"
})
export class MessageListPage {
  title: string;
 approxItemHeight:string = '40px';
  groups: any;

  @ViewChild("messageList", { read: List })
  messageList: List;
  queryText = "";
  shownMessages: any;
  metrics: MessageMetrics;
  dates: any = [];
  confDate: string;
  groupedMessages = [];
  actionSheet: ActionSheet;
  messages: MessageGroupItem[] = [];
  messagesRead: MessageGroupItem[] = [];
  messagesUnread: MessageGroupItem[] = [];
  segment = "unread";
  constructor(
    public app: App,
    private auth: AuthService,
    private _service: MessageData,
    private _msgService: MessageService,
    public actionSheetCtrl: ActionSheetController,
    public navCtrl: NavController,
    public modalCtrl: ModalController,
    public config: Config,
    private note: NotifyService,
  private log: LoggerService,
    public events: Events,
   private appinsightsService: AppInsightsService
  ) {
    this.app.setTitle("Messages");
  }

  ionViewDidLoad() {
    this.appinsightsService.trackPageView("Messages");
    this.title = "Unread Messages";
    this.app.setTitle(this.title);
    this.segment = "unread";
    this.subscribeToEvents();
    if (this.auth.fosId !== undefined) this.updateSchedule(false);
  }

  subscribeToEvents() {
    this.events.subscribe("messagedata:markedRead", n => {
      console.log("EVENT CAPTURED: messagedata:markedRead", n);
      this.updateSchedule(true);
    });
       this.events.subscribe("message:service.sendEmail", n => {
      console.log("EVENT CAPTURED:message:service.sendEmail", n);
    //  this.updateSchedule(true);
    });

  }
  updateSchedule(refresh: boolean = false, refresher: any = null) {
    let cntl = this.note.presentLoading("Getting Messages...");
    if (refresh) this._service.model.data=[];
    this.messages = [];
    //this.metrics = null;
   // this.messageList && this.messageList.closeSlidingItems();

    try {
      this._service
        .getMessages(this.queryText, this.segment, refresh)
        .subscribe(
          (_data: any) => {
            this.messages = this.segment === "read"
              ? this._service.model.readMessages
              : this.segment === "unread"
                ? this._service.model.unreadMessages
                : this._service.model.messages;
            this.metrics = this._service.model.metrics;
            if (refresher) refresher.complete();
            cntl.dismiss();
            //  this.groups = data.surgeryType;
          },
          err => {
            console.error(err);
            cntl.dismiss();
          }
        );
    } catch (error) {
      console.error(error);
      cntl.dismiss();
    }
  }

  updateSegment() {
    this.appinsightsService.trackEvent("Email Segment", {
      Segment: this.segment,
      Surgeon: this.auth.name
    });
    if (this.segment === "unread") this.title = "Unread Messages";
    else if (this.segment === "read") this.title = "Read Messages";
    else this.title = "All Messages";
    this.updateSchedule(false);
  }

  doRefresh(refresher) {
    this.auth.storage.remove("messagesStoreDate");
    this.auth.storage.remove("messages");
    this.updateSchedule(true, refresher);
  }

  delete(msg?) {
    console.log("Delete Message", msg);
    this._msgService.deleteMessage(msg).then((_a:any) => {
      console.log("Delete DONE", msg);
      this.messages = [];
      this.updateSchedule(true);
    });
  }

  deleteGroup(grp: any) {
    grp.messages.forEach((g: DoctorMessageModel) => {
      this._msgService.deleteMessage(g).then((_a:any)  => {
        console.log("Delete DONE", g.message);
      });
    });
  }

  reply(msg?) {
    // this.insight.trackEvent('Message Reply');
    let modal = this.modalCtrl.create(MessageReplyModal, { msg: msg });
    modal.present();
    modal.onWillDismiss((data: string) => {
      if (data) {
        this.note.presentToast('Message Sent',data);
        this.updateSchedule(false);
      }
    });
  }
  showDetails(msg: MessageGroupItem) {
    try {
      console.group("Message Detail");
      if (!msg.message.viewed) {
        console.log("showDetails: Marking read");
        this._service.markRead(msg.message.id as number).then(() => {
          // debugger;
          msg.message.viewed = true;
          // let i = this._service.model.data.findIndex(m => m.id == msg.message.id);
          //  this._service.model.data[i].viewed = true;
          this._service.refreshData();
        });
      }
      // this.insight.trackEvent('Message Reply');
      let modal = this.modalCtrl.create(MessageDetailPage, msg.message);
      modal.present();
      modal.onWillDismiss((data: DoctorMessageModel) => {
        if (data) {
          this.updateSchedule(false);
          console.groupEnd();
        }
      });
    } catch (error) {
      console.error(error);
      console.groupEnd();
    }
  }

  failure(error: any) {
    let errMsg = error.message
      ? error.message
      : error.status ? `${error.status} - ${error.statusText}` : "Server error";
    this.log.error(errMsg); // log to console instead
    return errMsg;
  }
  // showContactInfo(msg: any) {
  //   let mode = this.config.get("mode");
  //   // this.insight.trackEvent('Message Contact Info');
  //   let actionSheet = this.actionSheetCtrl.create({
  //     title: "Contact " + msg,
  //     buttons: [
  //       {
  //         text: `Email ( ${msg.email} )`,
  //         icon: mode !== "ios" ? "mail" : null,
  //         handler: () => {
  //           window.open("mailto:" + msg.email);
  //         }
  //       },
  //       {
  //         text: `Call ( ${msg.phone} )`,
  //         icon: mode !== "ios" ? "call" : null,
  //         handler: () => {
  //           window.open("tel:" + msg.phone);
  //         }
  //       }
  //     ]
  //   });
  //   actionSheet.present();
  // }
}
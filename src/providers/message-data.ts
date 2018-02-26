import {MessageGroupItem, MessageGroup} from '../models/metrics/metrics';
import {DoctorMessageModel, DataMessageStore} from '../models/viewmodels/doctor_message_model';
import { Events } from "ionic-angular";
import { AuthHttp } from  'angular2-jwt';
import { Injectable } from "@angular/core";
import { Http } from "@angular/http";
import { Observable } from "rxjs/Observable";
import "rxjs/add/operator/map";
import "rxjs/add/observable/of";
import { AuthService, CONFIGURATION, LoggerService } from "../shared/index";
import { DoctorMessage } from "../models/models";
import { Storage } from "@ionic/storage";
  // tslint:disable-next-line:curly
@Injectable()

export class MessageData {
  fromStore: boolean;

  model: DataMessageStore;

  constructor(
    public authHttp: AuthHttp,
    public auth: AuthService,
    public events: Events,
      private storage: Storage,
    private log:LoggerService
  ) {}
//   load_(): any {
//     debugger;
//     if (this.model) {
//       return Observable.of(this.model);
//     } else {
//       return this.authHttp.get('assets/data/messages-12.json')
//         .map(this.processData, this);
//     }
//   }
  load(): any {
    this.fromStore = false;
    if (this.model) {
       this.log.console("NOT LOADING FROM SERVER DATA = ", this.model.data);
      return Observable.of(this.model);
    } else {
      // var url=CONFIGURATION.baseUrls.apiUrl +'surgeries/past/' + this.auth.fosId;
      // return this.http.get('assets/data/data.json')
      //   .map(this.processData, this);
       this.log.console("LOADING FROM SERVER", url);
      this.fromStore = false;
      var url =
        CONFIGURATION.baseUrls.apiUrl + "messages/doctors/" + this.auth.fosId;
       this.log.console("URL:", url);
      // this.auth.storage.get('messages').then((sve: any) => this.processData(sve))
      return this.authHttp.get(url).map(this.processData, this);
    }
  }
  loadData() {
    this.fromStore = true;
    this.storage
      .get("messages")
      .then((dd: any) => {
        if (dd) {
          this.model = JSON.parse(dd) as DataMessageStore;
           this.log.console("DataMessageStore Loaded", this.model);
       this.refreshData();
       this.events.publish("message:loadedStore", "DataMessageStore", 1);
        }

        else this.events.publish("message:loadedStore", "DataMessageStore", -1);
      })
      .catch(error => {
        this.events.publish("message:loadedStore", "DataMessageStore" ,- 1);
         this.log.error("No message  data stored locally");
        this.failure(error);
      });
  }
  saveData() {
       this.log.console("Save message data");
    try {
      this.storage.set("messagesStoreDate", new Date().toUTCString());
      this.storage.set("messages", JSON.stringify(this.model));
    } catch (e) {

       this.log.error(e);
    }
  }
  markRead(id:number): Promise<DoctorMessage> {
    const url = `${CONFIGURATION.baseUrls.apiPhp + 'doctor_message'}/${id }`;
              this.log.console("MessageDate.MarkRead URL", url);
    return this.authHttp
      .put(url, JSON.stringify({ viewed: 1 }))
      .toPromise()
      .catch(this.handleError);
  }

  refreshData(){

      try {
          let currentDate = "";
          let currentMessages = [];
          this.model.messages = [];
          this.model.unreadMessages = [];
          this.model.readMessages = [];
          this.model.groupedMessages = [];
          this.model.data.forEach((message: DoctorMessageModel) => {
              message.DoctorImage = (message.DoctorImage === null) ? 'assets/img/flat.png' : 'https://surgipal.com/uploads/avatars/' + message.DoctorImage;
              //       this.auth.getPicture(); //  (message.DoctorImage == null) ? 'assets/img/flat.png' : 'https://surgipal.com/uploads/avatars/' + message.DoctorImage;

              let d = new Date(message.createdAt);

              if (d.toLocaleDateString() !== currentDate) {
                  currentDate = d.toLocaleDateString();

                  let newGroup = new MessageGroup(d);

                  currentMessages = newGroup.messages;
                  this.model.groupedMessages.push(newGroup);
              }

              let newMessage = new MessageGroupItem(message);
              this.model.messages.push(newMessage);
              currentMessages.push(newMessage);
              //     this.log.console('Complete or not:');

              if (message.viewed !== null && message.viewed) this.model.readMessages.push(newMessage);
              else this.model.unreadMessages.push(newMessage);
          });
          this.calculateMetrics();
          this.reduceGroup();
          this.saveData();

      }
      catch (error) {
          this.log.error(error);
      }
  }
  processData(data: any) {
    try {

      // just some good 'ol JS fun with objects and arrays
      // build up the data by linking speakers to sessions
       this.model= new DataMessageStore( );
      this.model.data = data.json();

      this.model.groupedMessages = [];
      // loop through each message
      this.refreshData();
      this.saveData();
      this.events.publish("message:loaded",'DataMessageStore', this.model);

      return this.model;
    } catch (error) {
      this.failure(error);
    }
  }

  getTime(date?: Date) {
    return date !== null ? date.getTime() : 0;
  }

  sortByDueDate(): void {
    this.model.data.sort((a: DoctorMessageModel, b: DoctorMessageModel) => {
      return a.createdAt.getDate() - b.createdAt.getDate();
    });
    this.model.readMessages.sort((a: MessageGroupItem, b: MessageGroupItem) => {
      return a.message.createdAt.getDate() - b.message.createdAt.getDate();
    });
    this.model.messages.sort((a: MessageGroupItem, b: MessageGroupItem) => {
      return a.message.createdAt.getDate() - b.message.createdAt.getDate();
    });
    this.model.unreadMessages.sort(
      (a: MessageGroupItem, b: MessageGroupItem) => {
        return a.message.createdAt.getDate() - b.message.createdAt.getDate();
      }
    );
  }

  getMetrics() {
    return this.load().map((_data: any) => {
      let m = this.model.metrics;
      this.events.publish("message:metrics",'DataMessageStore', m);
      return m;
    });
  }

 calculateMetrics() {
    this.model.metrics.read = this.model.readMessages.length;
    this.model.metrics.unread = this.model.unreadMessages.length;
    this.model.metrics.total = this.model.metrics.read + this.model.metrics.unread;
    this.events.publish("message:metrics", "DataMessageStore", this.model.metrics);
  }

  reduceGroup() {
     this.log.console("Old message group count", this.model.groupedMessages.length);
    let newGroups: MessageGroup[] = [];
    this.model.groupedMessages.forEach((group: MessageGroup) => {
      if (group.messages.length > 0) newGroups.push(group);
    });
    this.model.groupedMessages = newGroups;
     this.log.console("New group count", this.model.groupedMessages.length);

  }
  getMessages(queryText = "", _segment = "unread", refresh = false) {
    if (refresh) {
      this.model= null;
    }
    return this.load().map((_data: any) => {
      let day = this.model.messages;
      this.model.metrics.unread = this.model.unreadMessages.length;
      this.model.metrics.read = this.model.readMessages.length;
      queryText = queryText.toLowerCase().replace(/,|\.|-/g, " ");
      return day;
    });
  }
  failure(error: any) {
    let errMsg = error.message
      ? error.message
      : error.status ? `${error.status} - ${error.statusText}` : "Server error";
     this.log.error(errMsg); // log to console instead
    return errMsg;
  }
  filterMessages(srg: any, queryWords: string[], segment: string) {
    let matchesQueryText = false;
    if (queryWords.length) {
      // of any query word is in the session name than it passes the query test
      queryWords.forEach((queryWord: string) => {
        try {
          if (
            srg.message.subject &&
            srg.message.subject.toLowerCase().indexOf(queryWord) > -1
          ) {
            matchesQueryText = true;
          } else if (
            srg.message.message &&
            srg.message.message.toLowerCase().indexOf(queryWord) > -1
          ) {
            matchesQueryText = true;
          } else if (
            srg.message.DoctorName &&
            srg.message.DoctorName.toLowerCase().indexOf(queryWord) > -1
          ) {
            matchesQueryText = true;
          } else if (
            srg.message.HospitalName &&
            srg.message.HospitalName.toLowerCase().indexOf(queryWord) > -1
          ) {
            matchesQueryText = true;
          }
        } catch (e) {
           this.log.error(e);
        }
      });
    } else {
      // if there are no query words then this session passes the query test
      matchesQueryText = true;
    }
    if (queryWords.length && matchesQueryText)
       this.log.console("MATCHED", matchesQueryText);

    // if the segement is 'favorites', but session is not a user favorite
    // then this session does not pass the segment test
    let matchesSegment = false;
    if (segment === "all") matchesSegment = true;
    else if (!srg.message.viewed && segment === "unread") matchesSegment = true;
    else if (srg.message.viewed && segment === "read") matchesSegment = true;

    srg.message.hide = !(matchesQueryText && matchesSegment);
  }

  //https://scotch.io/tutorials/angular-2-http-requests-with-observables    <<READ THIS

  // updateMessage (body: Object): Observable<Comment[]> {
  // let bodyString = JSON.stringify(body); // Stringify payload
  // let headers      = new Headers({ 'Content-Type': 'application/json' }); // ... Set content type to JSON
  // let options       = new RequestOptions({ headers: headers }); // Create a request option

  // return this.http.put(`${this.commentsUrl}/${body['id']}`, body, options) // ...using put request
  //                  .map((res:Response) => res.json()) // ...and calling .json() on the response to return data
  //                  .catch((error:any) => Observable.throw(error.json().error || 'Server error')); //...errors if any
  // }

  // ngOnChanges() {
  //         // Listen to the 'edit'emitted event so as populate the model
  //         // with the event payload
  //         EmitterService.get(this.data).subscribe((comment:Comment) => {
  //             this.model = comment
  //             this.editing = true;
  //         });
  //     }

  private handleError(error: any) {
    // In a real world app, we might use a remote logging infrastructure
    // We'd also dig deeper into the error to get a better message
    let errMsg = error.message
      ? error.message
      : error.status ? `${error.status} - ${error.statusText}` : "Server error";
     this.log.error("handleError in Message", errMsg); // log to console instead
    return errMsg;
  }
}

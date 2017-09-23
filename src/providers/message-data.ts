import {MessageGroupItem, MessageGroup} from '../models/metrics';
import {DoctorMessageModel, DataMessageStore} from '../models/viewmodels/doctor_message_model'; 
import { Events } from "ionic-angular"; 
import { AuthHttp } from  'angular2-jwt'; 
import { Injectable } from "@angular/core"; 
import { Http } from "@angular/http";
import { Observable } from "rxjs/Observable";
import "rxjs/add/operator/map";
import "rxjs/add/observable/of";
import { AuthService, CONFIGURATION } from "../shared/index";
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
    private storage:Storage
  ) {}
  // load(): any {
  //   debugger;
  //   if (this.model) {
  //     return Observable.of(this.model);
  //   } else {
  //     return this.authHttp.get('assets/data/messages-12.json')
  //       .map(this.processData, this);
  //   }
  // }
  load(): any {
    this.fromStore = false;
    if (this.model) {
      console.log("NOT LOADING FROM SERVER DATA = ", this.model.data);
      return Observable.of(this.model);
    } else {
      // var url=CONFIGURATION.baseUrls.apiUrl +'surgeries/past/' + this.auth.fosId;
      // return this.http.get('assets/data/data.json')
      //   .map(this.processData, this);
      console.log("LOADING FROM SERVER");
      this.fromStore = false;
      var url =
        CONFIGURATION.baseUrls.apiUrl + "messages/doctors/" + this.auth.fosId;
      console.log("URL:", url);
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
          console.log("DataMessageStore Loaded", this.model);
       this.refreshData();
       this.events.publish("message:loadedStore", "DataMessageStore", 1);
        } 
    
        else this.events.publish("message:loadedStore", "DataMessageStore", -1);
      })  
      .catch(error => {
        this.events.publish("message:loadedStore", "DataMessageStore" ,- 1);
        console.error("No message  data stored locally");
        this.failure(error);
      });
  }
  saveData() {
      console.log("Save message data");
    try {
      this.storage.set("messagesStoreDate", new Date().toUTCString());
      this.storage.set("messages", JSON.stringify(this.model));
    } catch (e) {

      console.error(e);
    }
  }
  markRead(id:number): Promise<DoctorMessage> {  
    const url = `${CONFIGURATION.baseUrls.apiPhp + 'doctor_message'}/${id }`; 
             console.log("MessageDate.MarkRead URL", url);
    return this.authHttp
      .put(url, JSON.stringify({ viewed: 1 }))
      .toPromise()
      .catch(this.handleError);
  }
 
  refreshData(){ 
        console.group("Refresh Message Data"); 
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
       //    console.log('Complete or not:');
     
       if (message.viewed !== null && message.viewed) this.model.readMessages.push(newMessage);
       else this.model.unreadMessages.push(newMessage);
     });
     this.calculateMetrics();
     this.reduceGroup();
     this.saveData();
       console.groupEnd();
       console.groupCollapsed("Refresh Message Data");
   } 
   catch (error) {} 
       console.groupEnd();
  }
  processData(data: any) {
    try {
      console.group("Processs Message Data");
      // just some good 'ol JS fun with objects and arrays
      // build up the data by linking speakers to sessions
       this.model= new DataMessageStore( );
      this.model.data = data.json(); 
   
      this.model.groupedMessages = [];
      // loop through each message 
      this.refreshData(); 
      console.groupEnd();
      console.groupCollapsed("Processs Message Data"); 
   
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
    console.group("Reduce Message Group");
    console.log("Old message group count", this.model.groupedMessages.length);
    let newGroups: MessageGroup[] = [];
    this.model.groupedMessages.forEach((group: MessageGroup) => {
      if (group.messages.length > 0) newGroups.push(group);
    });
    this.model.groupedMessages = newGroups;
    console.log("New group count", this.model.groupedMessages.length);
    console.groupEnd();
    console.groupCollapsed("Reduce Message Group");
  }
  getMessages(queryText = "", _segment = "unread", refresh = false) {
    if (refresh) {
      this.model= null;
    } 
    return this.load().map((_data: any) => {
      let day = this.model.messages;
      this.model.metrics.unread = this.model.unreadMessages.length;
      this.model.metrics.read = this.model.readMessages.length;
      //console.log('day', day);
      queryText = queryText.toLowerCase().replace(/,|\.|-/g, " ");
      //let queryWords = queryText.split(" ").filter(w => !!w.trim().length);
      //console.log('queryWords', queryWords);
      //debugger;
      // day.forEach((dt: any) => {
      //     dt.hide = true;
      //     dt.messages.forEach((msgs: any) => {
      //         msgs.message.hide = true;
      //         ///    if (msgs.message.viewed)   day.readCount++; else    day.unreadCount++;
      //         // check if this session should show or not
      //         if (!msgs.message.hide)
      //             /// day.shownMessages++;

      //             if (!msgs.message.hide && dt.hide) {
      //                 // if this session is not hidden then this group should show
      //                 console.log('Group ' + dt.d + ' changes to show because of message.', msgs.message);
      //                 dt.hide = false;
      //             }
      //     });

      // });

      return day;
    });
  }
  failure(error: any) {
    let errMsg = error.message
      ? error.message
      : error.status ? `${error.status} - ${error.statusText}` : "Server error";
    console.error(errMsg); // log to console instead
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
          console.error(e);
        }
      });
    } else {
      // if there are no query words then this session passes the query test
      matchesQueryText = true;
    }
    if (queryWords.length && matchesQueryText)
      console.log("MATCHED", matchesQueryText);

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
    console.error("handleError in Message", errMsg); // log to console instead
    return errMsg;
  }
}

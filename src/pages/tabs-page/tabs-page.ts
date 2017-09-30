

import { Component } from "@angular/core";
import { NavParams, Platform, Events } from "ionic-angular";
import { CalendarPage } from "../calendar/calendar"; 
import { PulsePage, SurgeryData } from "../pulse/index";
import { MessageListPage, MessageData } from "../message/index";
import { AboutPage } from '../about/about';
import { StatsPage } from "../stats/stats";
@Component({
  templateUrl: "tabs-page.html"
})
export class TabsPage {
  // set the root pages for each tab
  tab1Root: any = PulsePage;
  tab2Root: any = CalendarPage;
  tab3Root: any = MessageListPage;
  tab4Root: any = StatsPage;
  tab5Root: any = AboutPage;

  pulseData: number = 0;
  messageData: number = 0;
  accountData: number = 0;
  futureData: number = 0;
  statsData:number=0;
  mySelectedIndex: number;
  isAndroid: boolean = false;
  constructor(
    navParams: NavParams,
    platform: Platform,
    public events: Events,
    private surgerySvc: SurgeryData,
    private messageSvc: MessageData
  ) {
    this.mySelectedIndex = navParams.data.tabIndex || 0;
    this.isAndroid = platform.is("android");
  }
  public ionViewDidLoad() {
    try {
      this.loadListeners();
      if (this.surgerySvc !== null) {
        this.pulseData = this.surgerySvc.model.metrics.today;
        this.futureData = this.surgerySvc.model.metrics.future;
        this.statsData = this.surgerySvc.model.data.filter(o=>o.completed===true).length;
      }
      if (this.messageSvc !== null)
        this.messageData = this.messageSvc.model.metrics.unread;
    } catch (error) {
      //console.log(error, 'SurgeryModel', this.surgerySvc.model);
    }
  }
  loadListeners() {
    this.events.subscribe("message:metrics", (location, metrics) => {
      console.log("EVENT:message:metrics:" + location + " by TabPage", metrics);
      if (metrics) this.messageData = metrics.unread;
    });
    this.events.subscribe("surgery:metrics", (location, metrics) => {
      console.log("EVENT:surgery:metrics:" + location + " by TabPage", metrics);
      if (metrics) {
      this.pulseData = metrics.today;
      this.futureData = metrics.future;
      this.statsData = this.surgerySvc.model.data.filter(o=>o.completed===true).length;
      }
    });
  }
}

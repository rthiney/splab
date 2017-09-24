import { Component, ViewChild } from '@angular/core';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Storage } from '@ionic/storage';
import { AppVersion } from '@ionic-native/app-version';
import { Events, MenuController, Nav, Platform, ModalController } from 'ionic-angular';
import { AppInsightsService, SeverityLevel } from 'ng2-appinsights';

import { IPageInterface } from '../models/interfaces/IPageInterface';
import { MessageMetrics, SurgeryMetrics } from '../models/metrics';
 import { AccountPage } from '../pages/account/account';
import { CalendarPage } from '../pages/calendar/calendar';
import { LoginPage } from '../pages/login/login';
import { MessageListPage } from '../pages/message/message';
import { MessageData } from '../providers/message-data';
import { MessageService } from '../shared/message.service';
import { PulsePage } from '../pages/pulse/pulse';
import { SurgeryData } from '../providers/surgery-data';
import { SurgeryService } from '../shared/surgery-services';
import { SignupPage } from '../pages/signup/signup';
import { SupportPage } from '../pages/support/support';
import { TabsPage } from '../pages/tabs-page/tabs-page';
import { TutorialPage } from '../pages/tutorial/tutorial';
import { ConferenceData } from '../providers/conference-data';
import { UserData } from '../providers/user-data';
import { LoggerService } from '../shared/logger.service';

import { AuthHttp, AuthConfig } from 'angular2-jwt';
import { AuthService } from '../shared/auth.service';
import { NotifyService } from '../shared/notify.service';
import { AboutPage } from "../pages/about/about";

@Component({
  templateUrl: 'app.template.html',
  providers: [SurgeryData, MessageService, SurgeryService, MessageData,  LoggerService]
})
export class SurgiPalApp {
  // the root nav is a child of the root app component
  // @ViewChild(Nav) gets a reference to the app's root nav
  @ViewChild(Nav) nav: Nav;
  version: string;
  bgLoaded: boolean = false;
  isLab: boolean;
  messageMetrics: MessageMetrics;
  surgeryMetrics: SurgeryMetrics;
  // List of pages that can be navigated to from the left menu
  // the left menu only works after login
  // the login page disables the left menu
  appPages: IPageInterface[] = [

    { title: "Today", name: "TabsPage", component: TabsPage, tabComponent: PulsePage, icon: "pulse", index: 0, badgeValue: 0, color: "favorite" },
    { title: "Calendar", name: "TabsPage", component: TabsPage, tabComponent: CalendarPage, index: 1, icon: "calendar", badgeValue: 0, color: "favorite" },
    { title: "Messages", name: "TabsPage", component: TabsPage, tabComponent: MessageListPage, index: 2, icon: "mail", badgeValue: 0, color: "favorite" },
    { title: "Stats", name: "TabsPage", component: TabsPage, tabComponent: AccountPage, icon: "stats", index: 3, badgeValue: 0, color: "light" },
    { title: "About", name: "AboutPage", component: TabsPage, tabComponent: AboutPage, index: 4, icon: "information-circle", badgeValue: -1, color: "dark" }

  ];

  loggedInPages: IPageInterface[] = [
    // { title: 'Account', name: 'AccountPage', component: AccountPage, icon: 'person' },
    // { title: 'Support', name: 'SupportPage', component: SupportPage, icon: 'help' },
    { title: 'Logout', name: 'LoginPage', component: LoginPage, icon: 'log-out', logsOut: true, color: "google" }
  ];
  loggedOutPages: IPageInterface[] = [
    { title: 'Login', name: 'LoginPage', component: LoginPage, icon: 'log-in', color: "favorite"} 
  ];
  rootPage: any;
  versionNumber:any='0.4.6';
  constructor(
    public platform: Platform,
 public splashScreen: SplashScreen,
    public menu: MenuController,
    private events: Events,
    private appVersion: AppVersion,
    public auth: AuthService,
    private log: LoggerService,
    public _note: NotifyService, 
    private surgerySvc: SurgeryData,
    private messageSvc: MessageData,
    private appinsightsService: AppInsightsService,
private storage:Storage,
private  modalCtrl: ModalController
  ) {
    this.bgLoaded = false;
    this.enableMenu(false);
    this.menu.toggle();
    // Check if the user has already seen the tutorial
    this.storage.get('hasSeenTutorial')
      .then((hasSeenTutorial) => {
        if (!hasSeenTutorial)  
            this.nav.setRoot(TutorialPage);
       else  if (this.auth.authenticated()) { 
          this.nav.setRoot(TabsPage);  
          this.enableMenu(true); 
       }
          else
          this.nav.setRoot(LoginPage);
        
        this.platformReady();
      });

    // load the conference data
  //  confData.load();

    // decide which menu items should be hidden by current login status stored in local storage
    // this.userData.hasLoggedIn().then((hasLoggedIn) => {
    //   this.enableMenu(hasLoggedIn === true);
    // });
   
    this.listenToLoginEvents();
  }
  platformReady() {
    // Call any initial plugins when ready
    this.platform.ready().then(() => {
      this.appinsightsService.Init({
        instrumentationKey: "f8177abe-fb52-4eac-935a-d8e9e32cb8d3",
        enableDebug: false,
        maxAjaxCallsPerView: 50,
        verboseLogging: true
      });
      this.splashScreen.hide();

    });
  }
 
  openPage(page: IPageInterface) {
    let params = {};
 
    // the nav component was found using @ViewChild(Nav)
    // setRoot on the nav to remove previous pages and only have this page
    // we wouldn't want the back button to show in this scenario
    if (page.index) {
      params = { tabIndex: page.index };
    }

    // If we are already on tabs just change the selected tab
    // don't setRoot again, this maintains the history stack of the
    // tabs even if changing them from the menu
    if (this.nav.getActiveChildNavs().length && page.index !== undefined) {
      this.nav.getActiveChildNavs()[0].select(page.index);
      // Set the root of the nav with params if it's a tab index
    } else {
      this.nav.setRoot(page.name, params).catch((err: any) => {
        console.log(`Didn't set nav root: ${err}`);
      });
    }

    // if (page.logsOut === true) {
    //   // Give the menu time to close before changing to logged out
    //   this.userData.logout();
    // }
    if (page.logsOut === true) {
      //reset background loading..
      this.bgLoaded = false;
      this.enableMenu(false);
      this.nav.setRoot(LoginPage);
      // Give the menu time to close before changing to logged out
      setTimeout(() => {
        this.auth.logout();
      }, 1000);
    } 
  }

  openTutorial() {
    this.nav.setRoot(TutorialPage);
  } 
  setAuthenticatedUserContext() {
    try {
      this.appinsightsService.setAuthenticatedUserContext(
        this.auth.fosId.toString()
      );
    } catch (error) { }
  }
  loadDataBackground() {
    this.bgLoaded = true;
    this.setAuthenticatedUserContext();
    setTimeout(() => {
      this.surgerySvc.loadData();
      this.messageSvc.loadData(); 
    }, 3000);
  }
  listenToLoginEvents() { 
    this.events.subscribe("user:authenticated", n => {
      // if (this.platform.is('cordova')) { this.getPlatforms(); } 
      this.log.event("user:authenticated " + n, n);
      if (this.auth)
        if (this.auth.fosId > 0) {
          //     this.setAuthenticatedUserContext();
          this.nav.setRoot(TabsPage);
          this.enableMenu(true);
          this.menu.toggle();

        }
      if (!this.bgLoaded && this.auth.fosId > 0) this.loadDataBackground();
      else this.log.console(
        "condition not meet: bgLoaded" + this.bgLoaded,
        this.auth.fosId
      );
    });

    this.events.subscribe("user:loginstorage", n => { 
      this.log.event('user:loginstorage');
      this.events.publish("user:authenticated", "from EVENT user:loginstorage" + n);
    });

    this.events.subscribe("user:login", _n => {

      this.log.event('user:login');
      this.events.publish("user:authenticated", "from EVENT user:login");
    });

    this.events.subscribe("user:signup", () => {
      this.bgLoaded = false;
      this.enableMenu(false);
    });

    this.events.subscribe("user:logout", () => {

      this.appinsightsService.clearAuthenticatedUserContext();
      this.bgLoaded = false;
      this.enableMenu(false);
    });

    this.events.subscribe("message:loadedStore", (location, m) => {
      console.log(
        "EVENT FIRED message:loadedStore: by " +
        location +
        "  fired in AppComponentPage  m=",
        m
      );
      if (m === -1) this.getMessageData();
      else this.appPages[2].badgeValue = this.messageSvc.model.metrics.unread;
    });

    this.events.subscribe("surgeries:loadedStore", (location, m) => {
      console.log(
        "EVENT FIRED surgeries:loadedStore: by" +
        location +
        " fired in AppComponentPage  m=",
        m
      );
      if (m === -1) this.getSurgeryData();
      else {
        this.appPages[0].badgeValue = this.surgerySvc.model.metrics.today;
        this.appPages[1].badgeValue = this.surgerySvc.model.metrics.future;
        this.appPages[3].badgeValue = this.surgerySvc.model.pastSurgeries.filter(o=>o.surgery.completed).length;
      }
    });

    this.events.subscribe("surgery:metrics", (location, metrics) => {
      console.log(
        "EVENT:surgery:metrics:" + location + " by AppComponentPage",
        metrics
      );
      this.appPages[0].badgeValue = this.surgerySvc.model.metrics.today;
      this.appPages[1].badgeValue = this.surgerySvc.model.metrics.future;
      this.appPages[3].badgeValue = this.surgerySvc.model.pastSurgeries.filter(o=>o.surgery.completed).length;
    });
    this.events.subscribe("message:metrics", (location, metrics) => {
      console.log(
        "EVENT:message:metrics:" + location + " by AppComponentPage",
        metrics
      );
      this.appPages[2].badgeValue = this.messageSvc.model.metrics.unread;
    });

    this.events.subscribe("message:loaded", (location, m) => {
      console.log(
        "EVENT FIRED message:loaded" + location + " by AppComponentPage",
        m
      );
    });
    this.events.subscribe("surgeries:loaded", (location, m) => {
      console.log(
        "EVENT FIRED surgeries:loaded" + location + " by AppComponentPage",
        m
      );
    });

  }
  getMessageData() {
    console.log("Getting MessageData Background");
    this.messageSvc.getMetrics().subscribe(
      (data: any) => {
        this.appPages[2].badgeValue = data.unread;
        console.log("MessageData Background completed");
      },
      err => {
        console.error(err);
      },
      () => { }
    );
  }
  getSurgeryData() {
    console.log("Getting SurgeryData Background");
    this.surgerySvc.getMetrics().subscribe(
      (data: any) => {
        this.appPages[0].badgeValue = data.today;
        this.appPages[1].badgeValue = data.future;
        this.appPages[3].badgeValue = this.surgerySvc.model.pastSurgeries.filter(o=>o.surgery.completed).length;
        console.log("SurgeryData Background completed");
      },
      err => {
        console.log(err);
      },
      () => { }
    );
  }
  enableMenu(loggedIn: boolean) {
    this.menu.enable(loggedIn, 'loggedInMenu');
    this.menu.enable(!loggedIn, 'loggedOutMenu');
  }

  isActive(page: IPageInterface) {
    let childNav = this.nav.getActiveChildNavs()[0];

    // Tabs are a special case because they have their own navigation
    if (childNav) {
      if (childNav.getSelected() && childNav.getSelected().root === page.tabComponent) {
        return 'favorite';
      }
      return 'primary';
    }

    if (this.nav.getActive() && this.nav.getActive().name === page.name) {
      return 'favorite';
    }
    return 'primary';
  }
}

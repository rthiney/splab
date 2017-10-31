//import { GoogleAnalyticsEventsService } from './../shared/google-analytics.service';
import { BrowserModule } from "@angular/platform-browser";
import { HttpModule, Http } from "@angular/http";
import { NgModule, ErrorHandler } from "@angular/core";
import { IonicApp, IonicModule, IonicErrorHandler } from "ionic-angular";
import { InAppBrowser } from "@ionic-native/in-app-browser";
import { SplashScreen } from "@ionic-native/splash-screen";
import { AppVersion } from "@ionic-native/app-version";
import { Storage } from "@ionic/storage";
import { SurgiPalApp } from "./app.component";
import { AboutPage } from "../pages/about/about";
import { PopoverPage } from "../pages/about-popover/about-popover";
import { AccountPage } from "../pages/account/account";
import { LoginPage } from "../pages/login/login";
import { MapPage } from "../pages/map/map";
import { SchedulePage } from "../pages/schedule/schedule";
import { ScheduleFilterPage } from "../pages/schedule-filter/schedule-filter";
import { SessionDetailPage } from "../pages/session-detail/session-detail";
import { SignupPage } from "../pages/signup/signup";
import { SpeakerDetailPage } from "../pages/speaker-detail/speaker-detail";
import { SpeakerListPage } from "../pages/speaker-list/speaker-list";
import { TabsPage } from "../pages/tabs-page/tabs-page";
import { TutorialPage } from "../pages/tutorial/tutorial";
import { SupportPage } from "../pages/support/support";
import { ConferenceData } from "../providers/conference-data";
import { UserData } from "../providers/user-data";
import { CalendarPage } from "../pages/calendar/calendar";
import { PulsePage } from "../pages/pulse/pulse";
import { MessageListPage } from "../pages/message/message";
import { MessageDetailPage } from "../pages/message-detail/message-detail";
import { PulseDetailPage } from "../pages/pulse-detail/pulse-detail";
import { SurgeryDetailPage } from "../pages/pulse/surgery-detail";
import { CodeDetails } from "../pages/pulse/code-details";
import { CodeSearch } from "../pages/pulse/code-search";
import { BillingDetails } from "../pages/pulse/billing-details";
import { MessageReponseComponent } from "../pages/message-detail/message-response";
import { MessageReplyModal } from "../pages/message/message-reply";
import { AuthService } from "../shared/auth.service";
import { AuthHttp, AuthConfig } from "angular2-jwt";
import { NotifyService } from "../shared/notify.service";
import { SurgeryData } from "../providers/surgery-data";
import { MessageData } from "../providers/message-data";
import { MessageService } from "../shared/message.service";
import { LoggerService } from "../shared/logger.service";
import { SurgeryService } from "../shared/surgery-services";
import { AppInsightsModule } from "ng2-appinsights";
import { MomentModule } from "angular2-moment";
import { NgCalendarModule } from "ionic2-calendar";
import { ChartsModule } from "ng2-charts/charts/charts";
import "../../node_modules/chart.js/dist/Chart.bundle.min.js";
import { SimpleFormPage } from "../pages/simple-form/simple-form.page";
import { HomePage } from "../pages/home/home.page";
import { ArrayFilterPipe } from "./pipes/array-filter.pipe";
import { StatFilterPage } from "../pages/stat-filter/stat-filter";
import { StatsPage } from "../pages/stats/stats";
import {LetterAvatarDirective } from '../directives/letter-avatar.directive';

// et storage = new Storage(['sqlite', 'websql', 'indexeddb'], { name: 'surgipal_db' });
//let storage = new Storage(['sqlite', 'websql', 'indexeddb'], { name: 'surgipal_db' });
let storage = new Storage();

declare var window;
export class MyErrorHandler implements ErrorHandler {
  handleError(err: any): void {
    console.error(err);
    window.Ionic.handleNewError(err);
  }
}

export function getAuthHttp(http: any) {
  return new AuthHttp(
    new AuthConfig({
      // headerPrefix: YOUR_HEADER_PREFIX,
      noJwtError: true,
      globalHeaders: [{ Accept: "application/json" }],
      tokenGetter: () => storage.get("id_token")
    }),
    http
  );
}

@NgModule({
  declarations: [
    SurgiPalApp,
    AboutPage,
    AccountPage,
    LoginPage,
    MapPage,
    PopoverPage,
    SchedulePage,
    ScheduleFilterPage,
    SessionDetailPage,
    SignupPage,
    SpeakerDetailPage,
    SpeakerListPage,
    TabsPage,
    TutorialPage,
    SupportPage,

    //NEW
    PulsePage,
    PulseDetailPage,
    SurgeryDetailPage,
    CodeDetails,
    CodeSearch,
    BillingDetails,
    MessageListPage,
    MessageDetailPage,
    MessageReplyModal,
    MessageReponseComponent,
    StatsPage,
    StatFilterPage,
    CalendarPage,
    SimpleFormPage,
    HomePage,
    ArrayFilterPipe,
    LetterAvatarDirective
  ],
  imports: [
    BrowserModule,
    HttpModule,
    AppInsightsModule,
    HttpModule,
    MomentModule,
    ChartsModule,
    NgCalendarModule,

    // IonicModule.forRoot(SurgiPalApp, {
    //     backButtonText: 'Go Back',
    //     iconMode: 'ios',
    //     modalEnter: 'modal-slide-in',
    //     modalLeave: 'modal-slide-out',
    //     tabsPlacement: 'bottom',
    //     pageTransition: 'ios-transition'
    //   })
     IonicModule.forRoot(SurgiPalApp)

    // IonicModule.forRoot(SurgiPalApp, {}, {
    //   links: [
    //     { component: TabsPage, name: 'TabsPage', segment: 'tabs-page' },
    //     { component: SchedulePage, name: 'Schedule', segment: 'schedule' },
    //     { component: SessionDetailPage, name: 'SessionDetail', segment: 'sessionDetail/:sessionId' },
    //     { component: ScheduleFilterPage, name: 'ScheduleFilter', segment: 'scheduleFilter' },
    //     { component: SpeakerListPage, name: 'SpeakerList', segment: 'speakerList' },
    //     { component: SpeakerDetailPage, name: 'SpeakerDetail', segment: 'speakerDetail/:speakerId' },

    //     { component: CalendarPage, name: 'Calendar', segment: 'calendar' },
    //     { component: PulsePage, name: 'Pulse', segment: 'pulse' },
    //     { component: MessageListPage, name: 'Messages', segment: 'message' },
    //     { component: MessageDetailPage, name: 'MessagesDetail', segment: 'message' },

    //     { component: MapPage, name: 'Map', segment: 'map' },
    //     { component: AboutPage, name: 'About', segment: 'about' },

    //     { component: TutorialPage, name: 'Tutorial', segment: 'tutorial' },
    //     { component: SupportPage, name: 'SupportPage', segment: 'support' },
    //     { component: LoginPage, name: 'LoginPage', segment: 'login' },
    //     { component: AccountPage, name: 'AccountPage', segment: 'account' },
    //     { component: SignupPage, name: 'SignupPage', segment: 'signup' }
    //   ]
    // })
    // IonicStorageModule.forRoot({
    //   name: '__mydb',
    //   driverOrder: ['indexeddb', 'sqlite', 'websql']
    // })
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    SurgiPalApp,
    AboutPage,
    AccountPage,
    LoginPage,
    MapPage,
    PopoverPage,
    SchedulePage,
    ScheduleFilterPage,
    SessionDetailPage,
    SignupPage,
    SpeakerDetailPage,
    SpeakerListPage,
    TabsPage,
    TutorialPage,
    SupportPage,
    //NEW
    PulsePage,
    PulseDetailPage,
    SurgeryDetailPage,
    CodeDetails,
    CodeSearch,
    BillingDetails,
    MessageListPage,
    MessageDetailPage,
    MessageReplyModal,
    MessageReponseComponent,
    CalendarPage,
    StatsPage,
    StatFilterPage,
    SimpleFormPage,
    HomePage
  ],
  providers: [
   // GoogleAnalyticsEventsService,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    { provide: AuthHttp, useFactory: getAuthHttp, deps: [Http] },
    AuthService,
    //    { provide: ErrorHandler, useClass: MyErrorHandler },
    ConferenceData,
    UserData,
    InAppBrowser,
    SplashScreen,

    //{ provide: ErrorHandler, useClass: IonicErrorHandler },
    //          { provide: Storage, useFactory: provideStorage },
    Storage,
    // { provide: ErrorHandler, useClass: AppInsightsErrorHandler },
    AppVersion,
    NotifyService,
    SurgeryData,
    MessageData,
    LoggerService,
    MessageService,
    SurgeryService
  ]
})
export class AppModule {}

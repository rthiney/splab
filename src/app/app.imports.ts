import { HttpModule } from '@angular/http';
import { AppInsightsModule } from 'ng2-appinsights';
import { MomentModule } from 'angular2-moment';
import { ChartsModule } from 'ng2-charts';
import { NgCalendarModule } from 'ionic2-calendar';
import { SurgiPalApp } from './app.component';
import { AboutPage } from '../pages/about/about';
import { AccountPage } from '../pages/account/account';
import { LoginPage } from '../pages/login/login';
import { MapPage } from '../pages/map/map';
import { PopoverPage } from '../pages/about-popover/about-popover';
import { SchedulePage } from '../pages/schedule/schedule';
import { ScheduleFilterPage } from '../pages/schedule-filter/schedule-filter';
import { SessionDetailPage } from '../pages/session-detail/session-detail';
import { SignupPage } from '../pages/signup/signup';
import { SpeakerDetailPage } from '../pages/speaker-detail/speaker-detail';
import { SpeakerListPage } from '../pages/speaker-list/speaker-list';
import { TabsPage } from '../pages/tabs-page/tabs-page';
import { TutorialPage } from '../pages/tutorial/tutorial';
import { SupportPage } from '../pages/support/support';
import { PulsePage } from '../pages/pulse/pulse';
import { PulseDetailPage } from '../pages/pulse-detail/pulse-detail';
import { SurgeryDetailPage } from '../pages/pulse/surgery-detail';
import { CodeDetails } from '../pages/pulse/code-details';
import { CodeSearch } from '../pages/pulse/code-search';
import { BillingDetails } from '../pages/pulse/billing-details';
import { MessageListPage } from '../pages/message/message';
import { MessageDetailPage } from '../pages/message-detail/message-detail';
import { MessageReplyModal } from '../pages/message/message-reply';
import { MessageReponseComponent } from '../pages/message-detail/message-response';
import { StatsPage } from '../pages/stats/stats';
import { StatFilterPage } from '../pages/stat-filter/stat-filter';
import { CalendarPage } from '../pages/calendar/calendar';
import { SimpleFormPage } from '../pages/simple-form/simple-form.page';
import { HomePage } from '../pages/home/home.page';
import { ArrayFilterPipe } from './pipes/array-filter.pipe';
import { LetterAvatarDirective } from '../directives/letter-avatar.directive';
import { AuthService } from '../shared/auth.service';
import { ConferenceData } from '../providers/conference-data';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { SplashScreen } from '@ionic-native/splash-screen';
import { AppVersion } from '@ionic-native/app-version';
import { SurgeryData } from '../providers/surgery-data';
import { MessageData } from '../providers/message-data';
import { LoggerService } from '../shared/logger.service';
import { MessageService } from '../shared/message.service';
import { SurgeryService } from '../shared/surgery-services';
import { BrowserModule } from '@angular/platform-browser';
import { MultiPickerModule } from 'ion2-datetime-picker';
import { ParallaxHeaderDirective } from '../components/parallax-header/parallax-header';
import { AddSurgeryPage } from '../pages/add-surgery/add-surgery';
import { SurgeonHomePage } from '../pages/surgeon-home/surgeon-home';
import { NotifyService } from '../shared';
import { UserData } from '../providers/user-data';
import { ParallaxHeaderDirectiveModule } from '../components/parallax-header/parallax-header.module';
import { EnvironmentsModule } from './environment-variables/environment-variables.module';
export const MODULES = [
    BrowserModule,
    HttpModule,
    AppInsightsModule,
    HttpModule,
    MomentModule,
    ChartsModule,
    NgCalendarModule,
    MultiPickerModule,
    ParallaxHeaderDirectiveModule,
    EnvironmentsModule
];

export const DECLARATIONS = [
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
    //  ArrayFilterPipe,
   // LetterAvatarDirective,
  //  ParallaxHeaderDirective,
    AddSurgeryPage,
    SurgeonHomePage
];

export const PROVIDERS = [
    AuthService,
    ConferenceData,
    UserData,
    InAppBrowser,
    SplashScreen,
    AppVersion,
    NotifyService,
    SurgeryData,
    MessageData,
    LoggerService,
    MessageService,
    SurgeryService
];

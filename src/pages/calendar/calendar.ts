
import { AppInsightsService } from 'ng2-appinsights';
import { SurgeryDetailPage } from './../pulse/surgery-detail'; 
import { Component, ViewChild, } from '@angular/core';
import { NavController, App, ModalController, Events } from 'ionic-angular';
import { AuthService, LoggerService  } from "../../shared/index";
import { SurgeryData } from "../pulse/index"; 
import { SurgeryGroupItem } from "../../models/metrics/metrics";
import { CalendarComponent } from "ionic2-calendar/calendar";
import { ICalendarEvent } from '../../models/interfaces/ICalendarInterface';
@Component({
  selector: 'page-calendar',
  templateUrl: './calendar.html'
})

//https://twinssbc.github.io/Ionic2-Calendar
export class CalendarPage {

  // calendarOptions: Object = {
  //   height: 'parent',
  //   contentHeight: 'auto',
  //   fixedWeekCount: false,
  //   defaultDate: '2016-09-12',
  //   editable: true,
  //   eventLimit: true, // allow "more" link when too many events
  //   defaultView: 'agendaWeek',
  //   allDaySlot: false,
  //   minTime: '06:00:00',
  //   maxTime: '23:00:00',
  //   header: {
  //     left: '',
  //     center: 'prev, title, next',
  //     right: ''
  //   }, events: [
  //     {
  //       title: 'All Day Event',
  //       start: '2016-09-01'
  //     },
  //     {
  //       title: 'Long Event',
  //       start: '2016-09-07',
  //       end: '2016-09-10'
  //     }
  //   ]
  // };
  @ViewChild(CalendarComponent) myCalendar: CalendarComponent;
  // @ContentChild(TemplateRef) eventDetail;
  //  @Input() monthviewEventDetailTemplate:TemplateRef<IMonthViewDisplayEventTemplateContext>;
  avatar: any = {
    size: 50, // default size is 100
     fontColor: '#FFFFFF',
    border: "2px solid #d3d3d3",
    isSquare: false,  
    text: '', // 
    fixedColor:false 
  };
  calendarMode = 'month';
  eventSource;
  viewTitle;
  isToday: boolean;
  calendar = {
    mode: 'month',
    autoSelect: true,
  
    startingDayMonth: 1,
    scrollToHour: 8,
    preserveScrollPosition: true,
    currentDate: new Date(),
    dateFormatter: {
      formatMonthViewDay: function (_date: Date) {
        return _date.getDate().toString();
      },
      formatMonthViewDayHeader: function (_date: Date) {
        return 'MonMH';
      },
      formatMonthViewTitle: function (_date: Date) {
        return 'testMT';
      },
      formatWeekViewDayHeader: function (_date: Date) {
        return 'MonWH';
      },
      formatWeekViewTitle: function (_date: Date) {
        return 'testWT';
      },
      formatWeekViewHourColumn: function (_date: Date) {
        return 'testWH';
      },
      formatDayViewHourColumn: function (_date: Date) {
        return 'testDH';
      },
      formatDayViewTitle: function (_date: Date) {
        return 'testDT';
      }
    }
  };

  constructor(
    public app: App,
    public modalCtrl: ModalController,
    public navCtrl: NavController,
    public auth: AuthService,
    public events: Events,
    public appinsightsService: AppInsightsService,
    private surgeryData: SurgeryData,
    private log: LoggerService) {
  }

  ionViewDidLoad() {
    if (this.auth.fosId>-1)
    this.loadSurgeries();

  }
  loadSurgeries() {
    this.eventSource = this.createEventsFromSurgeries();
  }
  onViewTitleChanged(title) {
    this.viewTitle = title;
  }
  onEventSelected(event) {
    console.log(event);
    let surg = this.surgeryData.model.findSugeryById(event.surgery.surgeryId);
    this.showDetail(surg);
  }
  showDetail(s: SurgeryGroupItem) {
    this.navCtrl.push(SurgeryDetailPage, s);
    this.log.event("Load Surgery Details");
  }
  changeView() {
    if (this.calendarMode !== 'today')
      this.changeMode();
    else {
      this.isToday = true;
      this.today();
    }
  }

  changeMode() {
    this.calendar.mode = this.calendarMode;
  }

  today() {
    this.calendar.currentDate = new Date();
  }
  onTimeSelected(ev) {
    console.log('Selected time: ' + ev.selectedTime + ', hasEvents: ' +
      (ev.events !== undefined && ev.events.length !== 0) + ', disabled: ' + ev.disabled);
  }
  onCurrentDateChanged(event: Date) {
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    event.setHours(0, 0, 0, 0);
    this.isToday = today.getTime() === event.getTime();
  }

  createEventsFromSurgeries() {
    var events2: ICalendarEvent[] = [];
    let allsurgeries = this.surgeryData.model.futureSurgeries.concat(this.surgeryData.model.todaySurgeries, this.surgeryData.model.pastSurgeries);
    this.surgeryData.model.surgeries = allsurgeries;
    
    console.log('Calendar All Surger', allsurgeries);
    allsurgeries.forEach(s => {
      //  if (!s.surgery.cancelled) {
      try {

        var date = new Date(s.surgery.term);
        var duration = parseInt(s.surgery.surgeryTime);
        if (s.surgery.surgeryTime.indexOf("m") < 0)
          duration = duration * 60;
        var startTime = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes());
        var endTime = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes() + duration);

        events2.push({
          title: s.surgery.initials + ' - ' + s.surgery.preferenceCardName,
          startTime: startTime,
          endTime: endTime,
          surgery: s.surgery,
          allDay: false,
          occurs: s.occurs,
          minutes: duration
        });
        console.log('Calendar: Added ' + s.surgery.patient + 's:' + startTime + 'e:' + endTime);
      } catch (e) {
        console.error('Calendar: could not add ' + s.surgery.patient + ':' + s.surgery.surgeryId);
      }
      // }
    });
    // this.surgeryData.model.futureSurgeries.forEach(s => {
    //   if (!s.surgery.cancelled) {

    //     try {
    //       var date = new Date(s.surgery.term);

    //       var duration = parseInt(s.surgery.surgeryTime);
    //       if (s.surgery.surgeryTime.indexOf("m") < 0)
    //         duration = duration * 60;

    //       // var startMinute = parseInt(s.surgery.surgeryTime); //Math.floor(Math.random() * 24 * 60);
    //       // var endMinute = duration + startMinute;
    //       //var startTime = new Date ( date.getFullYear(), date.getMonth(), date.getDate(),date.getHours(), date.getMinutes());
    //       //var endTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes() + duration);
    //       //  var startTime = new Date ( Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(),date.getUTCHours(), date.getUTCMinutes()));
    //       //  var endTime = new Date ( Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(),date.getUTCHours(), date.getUTCMinutes()+ duration));
    //       var startTime = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes());
    //       var endTime = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes() + duration);

    //       events2.push({
    //         title: s.surgery.initials + ' - ' + s.surgery.patient + '(' + s.surgery.preferenceCardName + ')',
    //         startTime: startTime,
    //         endTime: endTime,
    //         surgery: s.surgery,
    //         allDay: false,
    //         status: "future"
    //       });
    //       console.log('Calendar: Added ' + s.surgery.patient + 's:' + startTime + 'e:' + endTime);
    //     } catch (e) {
    //       console.error('Calendar: could not add ' + s.surgery.patient + ':' + s.surgery.surgeryId);
    //     }
    //   }
    // });

    return events2;
  }
  onRangeChanged(ev) {
    console.log('range changed: startTime: ' + ev.startTime + ', endTime: ' + ev.endTime);
  }
  markDisabled = (date: Date) => {
    var current = new Date();
    current.setHours(0, 0, 0);
    return date < current;
  }
  
  convertUTCDateToLocalDate(date) {
    var newDate = new Date(date.getTime() + date.getTimezoneOffset() * 60 * 1000);

    var offset = date.getTimezoneOffset() / 60;
    var hours = date.getHours();

    newDate.setHours(hours - offset);

    return newDate;
  }

}
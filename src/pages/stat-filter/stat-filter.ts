import { SurgeryGroup, SurgeryGroupItem } from "../../models/metrics/metrics";
import { Component } from "@angular/core";

import { NavParams, ViewController, DateTime } from "ionic-angular";

import { ConferenceData } from "../../providers/conference-data";
import { StatFilter } from "../../models/metrics/statfilter";
import Moment from "moment";
import { extendMoment } from "moment-range";
import { SurgeryData } from "../../providers/surgery-data";
import { PulseViewModel } from "../../models/viewmodels/pulse_model";
const moment = extendMoment(Moment);
@Component({
  selector: "page-stat-filter",
  templateUrl: "stat-filter.html"
})
export class StatFilterPage {
  count2: number;
  count1: number;
  tracks: Array<{ name: string; isChecked: boolean }> = [];
  statFilter: StatFilter;
  endDate: string;
  startDate: string;
  constructor(
    public navParams: NavParams,
    public viewCtrl: ViewController,
    private svc: SurgeryData
  ) {
    const moment = extendMoment(Moment);
    // passed in array of track names that should be excluded (unchecked)
    //  let excludedTrackNames = this.navParams.data;
    this.statFilter = this.navParams.data;
    this.startDate = this.statFilter.sd.toISOString();
    this.endDate = this.statFilter.ed.toISOString();
  }
  init() {
    this.startDate = this.statFilter.sd.toISOString();
    this.endDate = this.statFilter.ed.toISOString();
    this.count1 = this.getRange(this.statFilter.sd);
    this.count2 = this.getRange(this.statFilter.ed);
  }
  resetFilters() {
    this.statFilter = new StatFilter();
    this.init();
  }
  applyFilters() {
    // Pass back a new array of track names to exclude
    // let excludedTrackNames = this.tracks.filter(c => !c.isChecked).map(c => c.name);
    this.dismiss(this.statFilter);
  }

  dismiss(data?: StatFilter) {
    // using the injected ViewController this page
    // can "dismiss" itself and pass back data
    this.viewCtrl.dismiss(data);
  }
  dateStartChange(_e) {

    let date = _e.year + "-" + _e.month + "-01";
    this.statFilter.sd = moment(date,
      "YYYY-MM-DD"
    ).toDate();
   
  //  this.count1 = this.getRange(this.statFilter.sd);
  }
  dateEndChange(_e) {
    let date = _e.year + "-" + _e.month + "-01";
    this.statFilter.ed = moment(date,
      "YYYY-MM-DD"
    ).toDate();
    //this.count2 = this.getRange(this.statFilter.ed);
  }
  getRange(d: Date): number {
    if (!this.svc.model.data) return 0;
    let som = moment(
      `${d.getFullYear()}-${d.getMonth()+1}-${moment(d).daysInMonth()}`,
      "YYYY-MM-DD"
    );

    //  const when  = moment('2012-05-10', 'YYYY-MM-DD');
    let rng = moment.range(d, som); 
    console.log('Range',rng);
    let range = this.svc.model.data.filter((o: PulseViewModel) => {
      if (o.term) {
        let when = moment(o.term);
        return (
          when.within(rng) &&
          o.completed === this.statFilter.completed &&
          o.cancelled === this.statFilter.cancelled
        );
      }
    });
    return range.length;
  }
}

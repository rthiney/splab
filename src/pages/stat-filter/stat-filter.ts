import { Component } from '@angular/core';

import { NavParams, ViewController, DateTime } from "ionic-angular";

import { ConferenceData } from '../../providers/conference-data';
import { StatFilter } from '../../models/metrics/statfilter';
 
@Component({
  selector: 'page-stat-filter',
  templateUrl: 'stat-filter.html'
})
export class StatFilterPage {
  tracks: Array<{name: string, isChecked: boolean}> = [];
statFilter:StatFilter;
  constructor(
    public confData: ConferenceData,
    public navParams: NavParams,
    public viewCtrl: ViewController
  ) {
    // passed in array of track names that should be excluded (unchecked)
  //  let excludedTrackNames = this.navParams.data;
this.statFilter = this.navParams.data;
    // this.confData.getTracks().subscribe((trackNames: string[]) => {

    //   trackNames.forEach(trackName => {
    //     this.tracks.push({
    //       name: trackName,
    //       isChecked: (excludedTrackNames.indexOf(trackName) === -1)
    //     });
    //   });

    // });
  }

  resetFilters() {
    this.statFilter = new StatFilter();
 
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
}

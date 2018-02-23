import { Component, Inject } from '@angular/core';
import { PopoverController } from 'ionic-angular';

import { PopoverPage } from '../about-popover/about-popover';
import { AuthService } from '../../shared';
import * as moment from 'moment';
import { EnvVariables } from '../../app/environment-variables/environment-variables.token';
@Component({
    selector: 'page-about',
    templateUrl: 'about.html'
})
export class AboutPage {
    timeleft: number;
    timeuntil: Date;
    lastLogin: Date;
    conferenceDate = moment().format('MMM DD, YYYY');

    constructor(
        public popoverCtrl: PopoverController,
        public auth: AuthService,
        @Inject(EnvVariables) public envVariables
    ) {
        this.conferenceDate = moment().format('MMM DD, YYYY');
        this.auth.storage.get('last_loging').then(ll => {
            if (ll) {
                this.lastLogin = moment(ll).toDate();
                this.timeuntil = moment(ll)
                    .add(15, 'minutes')
                    .toDate();
                let now = moment();
                this.timeleft = moment().diff(this.lastLogin, 'minutes');
                //   this.timeuntil=15-this.timeleft;
            }
        });
    }

    presentPopover(event: Event) {
        let popover = this.popoverCtrl.create(PopoverPage);
        popover.present({ ev: event });
    }
}

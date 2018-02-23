import { Platform } from 'ionic-angular';
import { Events } from 'ionic-angular';

import { JwtHelper } from 'angular2-jwt';
import { AppVersion } from '@ionic-native/app-version';

import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { extendMoment } from 'moment-range';
import { NavController, App } from 'ionic-angular';

import { AuthService, LoggerService } from "../../shared/index";
import * as moment from 'moment';
@Component({
    selector: 'page-login',
    templateUrl: 'login.html'
})
export class LoginPage {
    username: string;
    timeleft: number;
    timeuntil: Date;
    lastLogin: Date;
    loginAgo: Date;
    versionCode: any = '';
    versionNumber: string = '';
    login: boolean;
    user: any;
    constructor(public plat: Platform, public navCtrl: NavController, public auth: AuthService, private log: LoggerService, private events: Events, private appVersion: AppVersion) {

    this.user = {
                name: 'SurgiPal',
                profileImage: 'assets/img/icon/logo512.png',
                coverImage: 'assets/img/rooms/s2.PNG',
                occupation: 'Startup',
                location: 'Washington, D.C.',
                description: 'A physician driven cloud-based preference card system and OR platform for surgeries and procedures',
                address: '27 King\'s College Cir, Toronto, ON M5S, Canada',
                phone: '555 555 555',
                email: 'support@surgipal.com',
                whatsapp: '555 555 555',
              };
    }

    public ionViewDidLoad() {
        this.login = false;
        this.auth.storage.get("username").then(name => {
            if (name)
                this.username = name;
        });

        this.auth.storage.get("last_loging").then(ll => {
            if (ll) {
                this.lastLogin = moment(ll).toDate();
                this.timeuntil = moment(ll).add(15, 'minutes').toDate();
                let now = moment();
                this.timeleft = moment().diff( this.lastLogin, 'minutes');
                //   this.timeuntil=15-this.timeleft;
            }
        });
        this.getPlatforms();
        // if (!this.auth.authenticated())
        //  this.auth.lock.show();
        //this.auth.lock.hide();
    }
    getPlatforms() {
        if (this.plat.is('cordova')) {
            this.appVersion.getVersionNumber().then((r) => { this.versionNumber = r; this.log.console('versionNumber', r); });
            this.appVersion.getVersionCode().then((r) => { this.versionCode = r; this.log.console('versionCode', r); });
        }
    }
    onLogin() {
        this.login = true;

        if (!this.timeleft || !this.username || this.timeleft > 15)
            this.auth.login();
        else {
            this.auth.storage.set("last_loging", new Date());
            this.events.publish("user:loginstorage", this.username);
        }
    }

    onSignup() {
        this.auth.logout();
    }

    version() {
        //this.dialogs.alert(this.appVersion,'Version').then(() => console.log('Dialog dismissed')).catch(e => console.log('Error displaying dialog', e));
    }
}

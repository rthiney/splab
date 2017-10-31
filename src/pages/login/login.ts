import { Platform } from 'ionic-angular';
import { Events } from 'ionic-angular';

import { JwtHelper } from 'angular2-jwt';
import { AppVersion } from '@ionic-native/app-version';

import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { extendMoment } from 'moment-range';
import { NavController, App } from 'ionic-angular';

import { AuthService, LoggerService } from "../../shared/index";
import Moment from "moment";
const moment = extendMoment(Moment);
@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {
    username:string;
    timeleft:number;
    timeuntil:Date;
    lastLogin: Date;
loginAgo: Date;
  versionCode: any = '';
  versionNumber: string = '';
  login:boolean;
  constructor(public plat : Platform, public navCtrl: NavController, private auth: AuthService, private log: LoggerService,    private events: Events,
    private appVersion: AppVersion ) {

  }

  public ionViewDidLoad() {
    this.login =  false;
    this.auth.storage.get("username").then(name => {
        if (name)
        this.username = name;
    });

    this.auth.storage.get("last_loging").then(ll => {
        if (ll){
        this.lastLogin =moment(ll).toDate();
        this.timeuntil=moment(ll).add(15, 'minutes').toDate();
        let now = moment();
        this.timeleft=moment(new Date().valueOf()).diff(this.timeuntil, 'minutes');
     //   this.timeuntil=15-this.timeleft;

        }
    });
   this.getPlatforms();
   // if (!this.auth.authenticated())
  //  this.auth.lock.show();
 //this.auth.lock.hide();
  }
  getPlatforms() {
    if (this.plat.is('cordova')){
    this.appVersion.getVersionNumber().then((r) => { this.versionNumber = r; this.log.console('versionNumber', r); });
    this.appVersion.getVersionCode().then((r) => { this.versionCode = r; this.log.console('versionCode', r); });
    }
  }
  onLogin() {
    this.login=true;
    // if (this.lastLogin)
    // {
    //     let ll = moment(this.lastLogin).from(new Date().valueOf());
    //     this.timeleft=moment(new Date().valueOf()).diff(this.lastLogin, 'minutes');
    //     console.log(moment(new Date().valueOf()).diff(this.lastLogin, 'minutes'));

    // }

         if (  !this.timeleft || ! this.username ||  this.timeleft>15 )
            this.auth.login();
         else
            this.events.publish("user:loginstorage", this.username);
        }

    // if (!this.auth.authenticated())
    // this.auth.login();

    // let now: number = new Date().valueOf();
    // let jwtExp: number = this.jwtHelper.decodeToken(token).exp;
    // let exp: Date = new Date(0);
    // exp.setUTCSeconds(jwtExp);
    // let delay: number = exp.valueOf() - now;

    // if (form.valid) {
    //   this.auth.login(this.login.username);
    //   this.navCtrl.push(TabsPage);
    // }

  // checkforUpdateHockey() {
  //   this._hockeyapp.checkHockeyAppUpdates();
  // }
  onSignup() {
    this.auth.logout();

    //this.navCtrl.push(SignupPage);
  }

  version(){
    //this.dialogs.alert(this.appVersion,'Version').then(() => console.log('Dialog dismissed')).catch(e => console.log('Error displaying dialog', e));
  }
}

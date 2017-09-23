import { AppVersion } from '@ionic-native/app-version';
 
import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';

import { NavController, App } from 'ionic-angular';
 
import { AuthService, LoggerService } from "../../shared/index";

@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {
  versionCode: any = '';
  versionNumber: string = '';
  login:boolean;
  constructor(public navCtrl: NavController, private auth: AuthService, private log: LoggerService,  
    private appVersion: AppVersion ) {

  }

  public ionViewDidLoad() {
    this.login =  false;
 
    //this.getPlatforms();
   // if (!this.auth.authenticated())
  //  this.auth.lock.show();
 //this.auth.lock.hide();
  }
  getPlatforms() {
    console.dir(this.appVersion);
    this.appVersion.getVersionNumber().then((r) => { this.versionNumber = r; this.log.console('versionNumber', r); });
    this.appVersion.getVersionCode().then((r) => { this.versionCode = r; this.log.console('versionCode', r); });
  }
  onLogin() {
    this.login=true;
    this.auth.login();
    // if (form.valid) {
    //   this.auth.login(this.login.username);
    //   this.navCtrl.push(TabsPage);
    // }
  }
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

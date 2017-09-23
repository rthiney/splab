// import { AppInsightsService } from 'ng2-appinsights';
// import { Inject } from '@angular/core';
// import { forwardRef } from '@angular/core'; 
// import { AzureMobile } from './app.constants';
// import { Events } from "ionic-angular";
// import { Http } from "@angular/http";
// import { Storage } from "@ionic/storage";
// import azureMobileClient from "azure-mobile-apps-client";
// import { Observable } from "rxjs/Observable";
// import "rxjs/add/operator/map";
// import "rxjs/add/observable/of";
// import { Injectable } from '@angular/core';
// import { UserData } from "../models/azure/index";

// @Injectable()
// export class UserService {
//     storage: Storage = new Storage();
//     client: any;
//     table: any; 
//     user:UserData = new UserData();
//     constructor(public events: Events, public insight:AppInsightsService ) {
//       this.user=   new UserData();
//     }
//     //   login(provider: string) {
//     //       this.client = new azureMobileClient.MobileServiceClient('https://build2016-vsmobile.azurewebsites.net/');
//     //      this.client.login(provider).done(this.loginResponse.bind(this));
//     //   }

//     //   loginResponse(response: azureMobileClient.User) {
//     //       this.setUsername(response.userId);
//     //       this.userId = response.userId;
//     //       this.loggedIn = true;
//     //       this.events.publish('
//     //       this.syncFavorites();
//     //   }
//     loadUserFromProfile(profile: any) { 
//         this.user.picture = profile.picture || "";
//         this.user.created_at = profile.created_at;
//         this.user.updated_at = profile.updated_at;
//         this.user.image =
//             "https://surgipal.com/uploads/avatars/" + profile.image ||
//             "assets/img/flat.png";
//         this.user.email = profile.email || "";
//         this.user.first = profile.first || "";
//         this.user.last = profile.last || "";
//         this.user.name = profile.first + " " + profile.last;
//         this.user.fosId = profile.fos_id || "";
       
//         this.user.globalId = profile.global_client_id || "";
//         this.user.roles = profile.app_metadata.authorization.roles;
//         this.user.permissions = profile.app_metadata.authorization.permissions;
//         this.user.latitude = profile.user_metadata.geoip.latitude || "";
//         this.user.longitude = profile.user_metadata.geoip.longitude || "";
//         console.log("loadUserFromProfile");
//         this.saveToAzure();
//     }
//     saveToAzure() {
 
//         console.log('Save User To Azure');
//         this.client = new azureMobileClient.MobileServiceClient(AzureMobile.url);
//         this.table = this.client.getTable("UserData");
//         this.table
//             .where({ fosId: this.user.fosId })
//             .read()
//             .then(this.exists, this.failure);
//     }
//     exists(results) {
//         var id;
//         console.log("User Exists in Azure Table", results);
//         debugger;
//         if ((results[0] = undefined)) return;
//         this.table.insert(this).done(function (insertedItem) {
//             console.log("Added user to Azure table");
//             id = insertedItem.id;
//         }, this.failure);
//         this.user.userId = id;
//     }

//     getPicture(): string {
//         return this.user.image != null && this.user.image.length > 0
//             ? this.user.image
//             : this.user.picture;
//     }

//     setUsername(username) {
//         this.storage.set('username', username);
//     }

//     getUsername() {
//         return this.storage.get('username').then((value) => {
//             return value;
//         });
//     }

//     hasLoggedIn(): Promise<boolean> {
//         return this.storage.get('loggedIn').then(value => {
//             return value === true;
//         });
//     }

//     checkHasSeenTutorial(): Promise<string> {
//         return this.storage.get('hasSeenTutorial').then(value => {
//             return value;
//         });
//     }
//     public isAdmin() {
//         return this.user.roles.indexOf("admin") > -1;
//     }
//     public isVendor() {
//         return this.user.roles.indexOf("vendor") > -1;
//     }
//     public isHospital() {
//         return this.user.roles.indexOf("hospital") > -1;
//     }
//     public isDoctor() {
//         return this.user.roles.indexOf("physician") > -1;
//     }

//     failure(error: any) {
//         let errMsg = error.message
//             ? error.message
//             : error.status ? `${error.status} - ${error.statusText}` : "Server error";
//        this.insight.trackException(error,'UserData');
//         return errMsg;
//     }
// }
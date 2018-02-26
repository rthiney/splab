
import { LoggerService } from './logger.service';
import { Events } from "ionic-angular";
import { Http } from "@angular/http";
import { Auth0Vars, CONFIGURATION } from "./app.constants";
import { Storage } from "@ionic/storage";
import { JwtHelper, tokenNotExpired } from "angular2-jwt";
import { Injectable, NgZone } from "@angular/core";
import { Observable } from 'rxjs/Rx';
import { Cluster } from '../models/Cluster';
import { IGeoip } from '../models/interfaces/IGeoip';
import * as moment from 'moment';
//declare var WindowsAzure: any;
declare var window;
declare var Auth0: any;
declare var Auth0Lock: any;
@Injectable()
export class AuthService {

  jwtHelper: JwtHelper = new JwtHelper();
//   auth0 = new Auth0({
//     clientID: Auth0Vars.AUTH0_CLIENT_ID,
//     domain: Auth0Vars.AUTH0_DOMAIN
//   });
  lock = new Auth0Lock(Auth0Vars.AUTH0_CLIENT_ID, Auth0Vars.AUTH0_DOMAIN, {
    //https://github.com/auth0/lock#theming-options  // Username-Password-Authentication
    languageDictionary: {
      title: "SurgiPal"
    },
    allowSignUp: true,
    signUpLink: CONFIGURATION.baseUrls.server + "register/",
    rememberLastLogin: true,
    socialButtonStyle: "small",
    allowedConnections: [
      "MySqlAzure",
      "Username-Password-Authentication",
      "facebook",
      "google-oauth2"
    ],
    theme: {
      primaryColor: "#90a4ae",
      //  logo: 'http://surgipal.azurewebsites.net/assets/icon/logo512.png/SurgiPalLogoName.png'
      // logo: '/assets/img/logo.png'
      logo: "https://surgipalmobile.azurewebsites.net/assets/icon/logo512.png"
    },
    auth: {
      responseType: "token",
      redirect: false,
      params: {
        scope: "openid offline_access roles permissions email picture"
      },
      sso: false
    }
  });

  refreshToken: any;
  updated_at: any;
  created_at: any;
  name: string;
  last: any;
  first: any;
  email: any;
  image: any;
  picture: any;
  storage: Storage; // = new Storage();
  refreshSubscription: any;
  user: any;
  globalId: any;
  fosId: number = -1;
  doctorId: number;
  roles: string[] = [];
  permissions: string[] = [];
  zoneImpl: NgZone;
  idToken: string;
  latitude: string;
  longitude: string;
  _favorites: string[] = [];
  HAS_LOGGED_IN = "hasLoggedIn";
  HAS_SEEN_TUTORIAL = "hasSeenTutorial";
  client: any;
    table: any;
    geo: IGeoip;

  //   client: WindowsAzure.MobileServiceClient;
  constructor(
    public zone: NgZone,
    public http: Http,
    public events: Events,
    public _storage : Storage,
    private log: LoggerService,
  ) {
    this.storage=this._storage;
    this.zoneImpl = zone;
    // Check if there is a profile saved in local storage
    this.storage
      .get("profile")
      .then(profile => {
          if (profile) {
              console.log('Profile from storage');
              this.dumpProfileVariables(JSON.parse(profile));
              this.storage.get("id_token").then(token => {
                  this.idToken = token;

                  if (this.authenticated()) {
                      console.log('Profile from storage is authenticated');
                      this.scheduleRefresh();
                      this.events.publish("user:loginstorage", this.name);
                  }
                  else {
                      console.log('Profile from storage is NOT authenticated');
                      this.events.publish("user:logout", this.name);
                  }
              });
          }
      })
      .catch(error => {
        this.log.error('AuthService', error);
        console.error("No profile in storage.");
      });

    this.lock.on("authenticated", authResult => {
      this.storage.set(this.HAS_LOGGED_IN, true);
      this.log.console("authResult", authResult);
      this.storage.set("id_token", authResult.idToken);
      this.storage.set("last_loging", new Date());
      this.storage.set("refresh_token", authResult.refreshToken);
      this.idToken = authResult.idToken;
      // Fetch profile information
      this.lock.getProfile(authResult.idToken, (error, profile) => {
        if (error) {
          // Handle error
          console.error("getProfile", error);
          return;
        }
        this.log.console("getProfile", profile);
        console.log('Profile from login');
        this.dumpProfileVariables(profile);

        //save to tables

        this.events.publish("user:login", this.name);
        // Schedule a token refresh
        this.zoneImpl.run(() => (this.user = authResult.profile));
        this.scheduleRefresh();
      });

      this.lock.hide();

    });
  }
  dumpProfileVariables(profile: any) {
    this.storage.set("profile", JSON.stringify(profile));
    this.user = profile;
    this.picture = profile.picture || "";
    this.created_at = profile.created_at;
    this.updated_at = profile.updated_at;
    this.image =
      "https://surgipal.com/uploads/avatars/" + profile.image ||
      "assets/img/flat.png";
    this.email = profile.email || "";
    this.first = profile.first || "";
    this.last = profile.last || "";
    this.name = profile.first + " " + profile.last;
    this.storage.set("username", this.name);
    this.fosId = profile.fos_id || "";
    this.storage.set("fosId", this.fosId);
    this.globalId = profile.global_client_id || "";
    this.roles = profile.app_metadata.authorization.roles;
    this.permissions = profile.app_metadata.authorization.permissions;
    this.latitude = profile.user_metadata.geoip.latitude || "";
      this.longitude = profile.user_metadata.geoip.longitude || "";
      this.geo = profile.user_metadata.geoip;
    this.log.console("Dumped user data to Auth");
    this.saveToMobileClientTable();
  }

  saveToMobileClientTable() {
    //     console.group('Saving Profile to Azure');
    //     this.client = new azureMobileClient.MobileServiceClient(AzureMobile.url);
    //     this.table = this.client.getTable("UserData");
    //     this.table
    //       .where({ email: this.email })
    //       .read()
    //       .then(this.exists, this.failure);
    //   }
    //   exists(results) {
    //     debugger;
    //     this.log.console("User Exists in Azure Table", results[0]);

    //     if ((results[0] = undefined)) return;
    //     var newItem = new UserData();
    //     newItem.picture = this.picture;
    //     newItem.created_at = this.created_at
    //     newItem.updated_at = this.updated_at
    //     newItem.image = this.image
    //     newItem.email = this.email
    //     newItem.first = this.first
    //     newItem.last = this.last
    //     newItem.name = this.name
    //     newItem.fos_id = this.fosId
    //     newItem.global_id = this.globalId
    //     newItem.roles = this.roles
    //     newItem.permissions = this.permissions
    //     newItem.latitude = this.latitude
    //     newItem.longitude = this.longitude
    // debugger;
    //     this.table.insert(newItem).done(function (insertedItem) {
    //       this.log.console("Inserted new UserData");

    //     }, this.failure);
  }

  public getRefreshToken() {
    return new Promise(resolve => {
      this.log.console("getting a new on startup Jwt");
      this.storage.get("refresh_token").then(refresh_token => {
        this.refreshToken = refresh_token;
        this.log.console("found refresh_token", refresh_token);
        resolve(refresh_token);
      });
    });
  }

  // called on first load from app.component.ts
  public refreshJwt(refresh_token) {
    console.group("RefreshJWT");
    this.log.console("Calling refreshJwt");
    this.storage
      .get("profile")
      .then(profile => {
        if (profile) {
          this.log.console("refreshJwt profile from storage.", profile);
          this.dumpProfileVariables(JSON.parse(profile));
          ///  this.userData.loadUserFromProfile(JSON.parse(profile));

        }
      }).catch(this.failure);
    // .catch(error => {
    //   console.error("RefreshJWT No profile in storage.", error);
    // });

    return new Promise(resolve => {
      if (!refresh_token) {
        this.log.console("    resolve(false);");
        resolve(false);
        console.groupEnd();
      } else {
        this.log.console("       this.auth0.refreshToken(");
        this.lock.getClient().refreshToken(refresh_token, (err, delegationRequest) => {
          if (err) {
            // alert(err);
            this.log.console("  err    refreshToken delegationRequest");
          }
          this.log.console("got new Jwt, set token");
          try {
            this.storage.set("id_token", delegationRequest.id_token);
            this.idToken = delegationRequest.id_token;

            var authenticated: boolean = this.authenticated();
            // returns a promise<boolean> that finally
            // determines if user is truly authenticated
            resolve(authenticated);
          } catch (e) { }
        });
        console.groupEnd();
      }

    });
  }

  public authenticated():boolean {
    //  this.log.console('checking authenticated from:', source, tokenNotExpired('id_token', this.idToken))
    return tokenNotExpired("id_token", this.idToken);
  }
  public login() {
    // Show the Auth0 Lock widget
    this.lock.show();
  }

  public logout() {

    this.storage.clear();
    //debugger;
    this.storage.remove(this.HAS_LOGGED_IN);
    this.storage.remove("fosId");
    this.storage.remove("surgeries");
    this.storage.remove("surgeriesStoreDate");
    this.storage.remove("messages");
    this.storage.remove("messagesStoreDate");
    this.storage.remove("profile");
    this.storage.remove("id_token");
    this.storage.remove("refresh_token");
    this.storage.remove("username");
    this.idToken = '';
    this.zoneImpl.run(() => (this.user = null));
    // Unschedule the token refresh
    this.unscheduleRefresh();
console.log('Logout Called, is authenticated is ' + this.authenticated());
    // this.lock.show();
    this.events.publish("user:logout");
  }

  public scheduleRefresh() {
    // If the user is authenticated, use the token stream
    // provided by angular2-jwt and flatMap the token
    this.log.console("schedule a refresh");
    let source = Observable.of(this.idToken).flatMap(token => {
      // The delay to generate in this case is the difference
      // between the expiry time and the issued at time
    //    debugger;
      let jwtIat = this.jwtHelper.decodeToken(token).iat;
      let jwtExp = this.jwtHelper.decodeToken(token).exp;
      let iat = new Date(0);
        let exp = new Date(0);
        console.log('jwtIat',moment(jwtIat*1000).toDate());
        console.log('jwtExp',moment(jwtExp*1000).toDate());
        console.log('jwtlat', moment(jwtIat).toDate());
      let delay = exp.setUTCSeconds(jwtExp) - iat.setUTCSeconds(jwtIat);
      this.log.console("set delay to " + delay);
      return Observable.interval(delay);
    });

    this.refreshSubscription = source.subscribe(() => {
      this.log.console("refresh subscription, getNewJwt");
      this.getNewJwt();
    });
  }
  public startupTokenRefresh() {
    this.log.console("startup token refresh");
    // If the user is authenticated, use the token stream
    // provided by angular2-jwt and flatMap the token
    if (this.authenticated()) {
      this.log.console("user is authenticated on startup");
      this.storage
        .get("refresh_token")
        .then(refresh_token => {
          this.refreshToken = refresh_token;
          // get auth cookie from rivals
          // this.authWithRivals();
        }).catch(this.failure);
      // .catch(error => {
      //   this.log.console(error);
      // });
      let source = Observable.of(this.idToken).flatMap(token => {
        // Get the expiry time to generate
        // a delay in milliseconds
        let now: number = new Date().valueOf();
        let jwtExp: number = this.jwtHelper.decodeToken(token).exp;
        let exp: Date = new Date(0);
        exp.setUTCSeconds(jwtExp);
        let delay: number = exp.valueOf() - now;
        // let delay = 10000;
        this.storage.set("exp", delay);
          this.log.console("set delay to " + delay);

        // Use the delay in a timer to
        // run the refresh at the proper time
        return Observable.timer(delay);
      });

      // Once the delay time from above is
      // reached, get a new JWT and schedule
      // additional refreshes
      source.subscribe(() => {
        this.log.console("get a new token and schedule a refresh");
        this.getNewJwt();
        // this.navCtrl.push(TabsPage);
        this.scheduleRefresh();
      });
    }
  }
  public unscheduleRefresh() {
    // Unsubscribe fromt the refresh
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }
    public getTokenExpirationDate() {
        return this.jwtHelper.getTokenExpirationDate(this.idToken);
    }
    public tokenExpiresIn() {
        let expires = this.jwtHelper.getTokenExpirationDate(this.idToken);
        return moment(expires).fromNow();
    }
    public isTokenExpired() {
        return this.jwtHelper.isTokenExpired(this.idToken);
    }

  public getNewJwt() {
    // Get a new JWT from Auth0 using the refresh token saved
    // in local storage
    this.log.console("getting a new Jwt");
    this.storage
      .get("refresh_token")
      .then(token => {
        this.lock.getClient().refreshToken(token, (err, delegationRequest) => {
          if (err) {
            this.log.console(err);
          }
          this.log.console("got new Jwt, set token");
          this.storage.set("id_token", delegationRequest.id_token);

          this.idToken = delegationRequest.id_token;
          // return promise?  to be used by app.component?

          //    this.lock.getProfile(this.idToken, (error, profile) => {
          //   if (error) {
          //     // Handle error
          //     console.error('getProfile Refresh', error);
          //     return;
          //   }
          //   this.log.console('getProfile Refresh', profile);

          //   this.dumpProfileVariables(profile);

          // });
        });
      }).catch(this.failure);
    // .catch(error => {

    //   this.log.console(error);
    // });
  }

  hasFavorite(sessionName: string): boolean {
    return this._favorites.indexOf(sessionName) > -1;
  }

  addFavorite(sessionName: string): void {
    this._favorites.push(sessionName);
  }

  removeFavorite(sessionName: string): void {
    let index = this._favorites.indexOf(sessionName);
    if (index > -1) {
      this._favorites.splice(index, 1);
    }
  }

  getPicture(): string {
    let img = '';
    try {
      img = this.image !== null && this.image.length > 0
        ? this.image
        : this.picture;
    } catch (error) {

    }
    return img;
  }
  setUsername(username: string): void {
    this.storage.set("username", username);
  }

  getUsername(): Promise<string> {
    return this.storage.get("username").then(value => {
      return value;
    });
  }

  public success(results: any) {
    this.log.console("Auth Service:success", results.length);
    for (var i = 0; i < results.length; i++) {
      this.log.console("Auth Service Row:success", results[i]);
    }
  }

  failure(error: any) {

    let errMsg = error.message
      ? error.message
      : error.status ? `${error.status} - ${error.statusText}` : "Server error";
    this.log.error('AuthService', error);

    return errMsg;
  }
}

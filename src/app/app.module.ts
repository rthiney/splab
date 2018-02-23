import { ErrorHandler, NgModule } from '@angular/core';
import { AuthHttp, AuthConfig } from 'angular2-jwt';
import { DECLARATIONS, MODULES, PROVIDERS } from './app.imports';
import { IonicModule, IonicApp, IonicErrorHandler } from 'ionic-angular';
import { SurgiPalApp } from './app.component';
import { Http } from '@angular/http';
import { Storage } from '@ionic/storage';
import { ArrayFilterPipe } from './pipes/array-filter.pipe';
import { LetterAvatarDirective } from '../directives/letter-avatar.directive';
// import { Pro } from '@ionic/pro';
// const IonicPro = Pro.init('25a5ac9a', {
//   appVersion: "0.4.7"
// });

let storage = new Storage();

declare var window;
export class MyErrorHandler implements ErrorHandler {
    handleError(err: any): void {
        console.error(err);
        window.Ionic.handleNewError(err);
    }
}

export function getAuthHttp(http: any) {
    return new AuthHttp(
        new AuthConfig({
            // headerPrefix: YOUR_HEADER_PREFIX,
            noJwtError: true,
            globalHeaders: [{ Accept: 'application/json' }],
            tokenGetter: () => storage.get('id_token')
        }),
        http
    );
}

@NgModule({
    declarations: [DECLARATIONS, ArrayFilterPipe, LetterAvatarDirective],
    imports: [MODULES, IonicModule.forRoot(SurgiPalApp)],
    bootstrap: [IonicApp],
    entryComponents: [DECLARATIONS],
    providers: [
        Storage,
        PROVIDERS,
        { provide: ErrorHandler, useClass: IonicErrorHandler },
        { provide: AuthHttp, useFactory: getAuthHttp, deps: [Http] }
    ]
})
export class AppModule {}

// import { ErrorHandler } from '@angular/core';

// export class MyErrorHandler implements ErrorHandler {
//   handleError(err: any): void {
//     IonicPro.monitoring.handleNewError(err);
//   }
// }

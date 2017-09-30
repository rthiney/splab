 
import { AnswerBox } from '../models/AnswerBox';
import { Surgery } from '../models/Surgery';
import { SurgeryGroupItem } from '../models/metrics/metrics';
import { AuthHttp } from 'angular2-jwt';
import { Injectable } from '@angular/core';
import {   CONFIGURATION, LoggerService } from "./index";
import "rxjs/add/operator/map";
import "rxjs/add/observable/of";
import 'rxjs/add/operator/toPromise';
@Injectable()
export class SurgeryService {
    //   private headers = new Headers({ "Content-Type": "application/json" });
    client: any;
    tableReply: any;
    tableBilling: any;
    constructor(private authHttp: AuthHttp,  private log: LoggerService  ) {
    }

    updateCodes(sgi: SurgeryGroupItem): Promise<AnswerBox> {
        console.group('Surgery Service');

        this.log.console("Action:updateCodes");
        let url = `${CONFIGURATION.baseUrls.apiPhp + "answers_box"}/${sgi.surgery.answers_box_id}`;
        var newData = {
            cpt: sgi.cptArray.join(','),
            diagnosisCode: sgi.dxArray.join(',')
        };
        console.log('Update with', newData);
        return this.authHttp
            .put(url, JSON.stringify(newData))
            .toPromise()  
            .then(() => console.groupEnd())
            .catch(this.handleError);
    }
 
    /**
     * Marks surgery cancelled
     * 
     * @param {number} surgeryId 
     * @returns {Promise<Surgery>} 
     * 
     * @memberOf SurgeryService
     */
    markCancelled(surgeryId: number): Promise<Surgery> {
        console.group('Surgery Service');
        this.log.console("Action:markCancelled:");
        const url = `${CONFIGURATION.baseUrls.apiPhp + "surgery"}/${surgeryId}`;
        var newData = {
            cancelled: 1
        };
        console.log('Update with', newData);
        return this.authHttp
            .put(url, JSON.stringify(newData))
            .toPromise() 
            .then(() => console.groupEnd())
            .catch(this.handleError);
    }
    
    /**
     * Marks surgery complete
     * 
     * @param {number} surgeryId 
     * @returns {Promise<Surgery>} 
     * 
     * @memberOf SurgeryService
     */
    markComplete(surgeryId: number): Promise<Surgery> {
        console.group('Surgery Service');
        this.log.console("Action:markComplete:");
        const url = `${CONFIGURATION.baseUrls.apiPhp + "surgery"}/${surgeryId}`;
        var newData = {
            completed: 1
        };
        console.log('Update with', newData);
        return this.authHttp
            .put(url, JSON.stringify(newData))
            .toPromise() 
            .then(() => console.groupEnd())
            .catch(this.handleError);
    }

    private handleError(error: any) {
        // In a real world app, we might use a remote logging infrastructure
        // We'd also dig deeper into the error to get a better message
        let errMsg = error.message
            ? error.message
            : error.status ? `${error.status} - ${error.statusText}` : "Server error";
        console.error("handleError in Message Servicess", errMsg); // log to console instead
        console.groupEnd();
        return errMsg;
    }

}
//   getAll(): Promise<GownSizes[]> {
//     return this.http.get(this.url)
//       .toPromise()
//       .then(response => response.json().data as PulseItem[])
//       .catch(this.handleError);

//   }
//   get(id: number): Promise<GownSize> {
//     const url = `${this.url}/${id}`;
//     return this.http.get(url)
//       .toPromise()
//       .then(response => response.json().data as GownSize)
//       .catch(this.handleError);
//   }
//   delete(id: number): Promise<void> {
//     console.log('delete' + id);
//     const url = `${this.url}/${id}`;
//   //  return this.http.delete(url, { headers: this.headers })
//     return this.http.delete(url)
//       .toPromise()
//       .then(() => null)
//       .catch(this.handleError);
//   }
//   create(name: string): Promise<GownSize> {
//     console.log('create' + name);
//     return this.http
//     //  .post(this.url, JSON.stringify({ name: name }), { headers: this.headers })
//      .post(this.url, JSON.stringify({ name: name }))
//       .toPromise()
//       .then(res => res.json().data)
//       .catch(this.handleError);
//   }
//   update(hero: GownSize): Promise<GownSize> {
//     console.log('heroserv', hero);
//     const url = `${this.url}/${hero.id}`;
//     console.log('url', url);
//     return this.http
//       // .put(url, JSON.stringify(hero), { headers: this.headers })
//       .put(url, JSON.stringify(hero))
//       .toPromise()
//       .then(() => hero)
//       .catch(this.handleError);
//   } 

import { SurgeryData } from '../../providers/surgery-data';
import { Component } from '@angular/core';
import { ViewController, ModalController } from 'ionic-angular';

import "rxjs/add/operator/map";
import "rxjs/add/observable/of";
import { IMetric } from '../../models/metrics/metrics';

@Component({
    selector: 'page-code-search',
    template: `<ion-list>
        <ion-item *ngFor="let item of autocompleteItems" tappable (click)="chooseItem(item)">
            {{ item.name }}
        </ion-item>
    </ion-list>`
})
export class CodeSearch {
    autocompleteItems: IMetric[] = [];
    autocomplete;

    constructor(public viewCtrl: ViewController, public modalCtrl: ModalController,
        private surgerySvc: SurgeryData) {
        this.autocompleteItems = [];
        this.autocomplete = {
            query: ''
        };

    }
    ionViewDidLoad() {
        try {

            this.surgerySvc.loadData();

        } catch (error) {

        }
    }
    dismiss() {
        this.viewCtrl.dismiss();
    }

    chooseItem(item: IMetric) {

        this.viewCtrl.dismiss(item);
    }

    updateSearch() {
        this.autocompleteItems = [];
        if (this.autocomplete.query === '') return; 
        return this.surgerySvc.model.metrics.uniqueCpt.filter((item) => {
            if (item.name.toLowerCase().indexOf(this.autocomplete.query.toLowerCase()) >= 0) { this.autocompleteItems.push(item); }
        });

    }

}
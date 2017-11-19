import { NotifyService } from './../../shared/notify.service';
import { IMetric } from '../../models/metrics/metrics';

import { Component } from "@angular/core";
import { NavParams, ViewController, ModalController, AlertController } from "ionic-angular";
// import { AutoCompleteComponent } from "ionic2-auto-complete";
import { SurgeryData } from "./index";
@Component({
  templateUrl: "code-details.html"
})

export class CodeDetails {
  //  @ViewChild('dxSearchbar')
  // dxSearchbar: AutoCompleteComponent;
  autocompleteItems;
  autocomplete;
  pulse: any;
  codeType: string;
  codes: Array<string> = [];
  clean: Array<string> = [];
  origCodes: Array<string> = [];
  constructor(params: NavParams, public viewCtrl: ViewController, public modalCtrl: ModalController, private notify: NotifyService, private surgerySvc: SurgeryData,
    public alertCtrl: AlertController) {
    this.autocompleteItems = [];
    this.autocomplete = {
      query: ''
    }; //, public codeService:CodeService
    this.pulse = params.get("pulse");
    this.codeType = params.get("type");
    this.codes = params.get("codes");
    this.codes.sort();
    this.codes.forEach(item =>this.origCodes.push(item) );
  // this.origCodes = JSON.parse(JSON.stringify(this.codes));
  }
  onCancel()
  {
    this.add({ name: this.autocomplete.query, count:0});
    console.dir(this.autocomplete.query);
  }
  dismiss(_data?: any) {
    // using the injected ViewController this page
    // can "dismiss" itself and pass back data
    this.viewCtrl.dismiss(this.codes);
  }
  revert() {
    this.codes = JSON.parse(JSON.stringify(this.origCodes));
    this.dismiss();
  }
  save() {
    this.dismiss(this.codes);
  }
  delete(chip: Element, c: string) {
    let i = this.codes.indexOf(c);
    this.codes.splice(i, 1);
    chip.remove();
  }
  add(c: IMetric) {
    if (c.name.length===0){
           this.notify.presentToast('Empty', 'Nothing to add!'); return;}

    let found = this.codes.find(i => i === c.name.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "").trim());
    if (found) {
      this.notify.presentToast('Exists already', 'Sorry, the code is already in this list.');
    } else {
      this.codes.push(c.name);
      this.notify.presentToast('Added', 'Added the code ' + c.name + ' to the list');
      this.autocompleteItems = [];
    }
  }

  ionViewDidLoad() {
    try {
      this.surgerySvc.loadData();

    } catch (error) {
    }
  }

  updateSearch() {
    if (this.autocomplete.query === '') {
      this.autocompleteItems = [];
      return;
    }
    this.autocompleteItems = [];
    if (this.codeType === 'CPT')

     this.surgerySvc.model.metrics.uniqueCpt.filter((item) => {

        if ((item.name.toLowerCase().indexOf(this.autocomplete.query.toLowerCase()) > -1) && (this.codes.indexOf(item.name)===-1))
        {
           this.autocompleteItems.push(item);
           }
      });
    else
   this.surgerySvc.model.metrics.uniqueDiag.filter((item) => {
        if ((item.name.toLowerCase().indexOf(this.autocomplete.query.toLowerCase()) > -1) && (this.codes.indexOf(item.name) === -1))
        { this.autocompleteItems.push(item); }
      });

      if (this.autocompleteItems.length===0)
      {
        this.checkBeforeAdd().then(r => {
          if (r) {
            this.add({ name: this.autocomplete.query, count: 0 });
            this.autocomplete.query=null;
            this.autocompleteItems=[];
          }
        });

      } else {
        return this.autocompleteItems;
      }
  }

  checkBeforeAdd(): Promise<boolean> {
    return new Promise((resolve: any, reject: any) => {
      let alert = this.alertCtrl.create({
        title: "Add Code?",
        message: "Want to add code?"
      });
      alert.addButton({ text: "No", handler: reject });
      alert.addButton({ text: "Yes", role: "cancel", handler: resolve });
      alert.present();
    });
  }
}

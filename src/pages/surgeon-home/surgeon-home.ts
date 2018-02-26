import { Component } from "@angular/core";
import {
    IonicPage,
    NavController,
    NavParams,
    Events,
    ModalController,
    App
} from "ionic-angular";
import { AuthService, LoggerService } from "../../shared";
import { AppInsightsService } from "ng2-appinsights";
import { SurgeryData } from "../pulse";

@Component({
    selector: "page-surgeon-home",
    templateUrl: "surgeon-home.html"
})
export class SurgeonHomePage {
    constructor(
        public app: App,
        public modalCtrl: ModalController,
        public navCtrl: NavController,
        public auth: AuthService,
        public events: Events,
        public appinsightsService: AppInsightsService,
        private surgeryData: SurgeryData,
        private log: LoggerService
    ) {}

    ionViewDidLoad() {
        console.log("ionViewDidLoad SurgeonHomePage");
    }
}

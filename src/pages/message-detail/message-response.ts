 
import { Component, OnInit } from '@angular/core';
import { AzureMessageSendData } from "../../models/azure/index";

@Component({
    selector: 'message-response',
    templateUrl: 'message-response.html'
})

export class MessageReponseComponent implements OnInit {

    azureMessage:AzureMessageSendData;
    constructor( ) { }

    ngOnInit() { }
}
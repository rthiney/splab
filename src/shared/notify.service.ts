import { ToastController, LoadingController, AlertController, Loading, Toast } from 'ionic-angular';
import { Injectable } from '@angular/core';
@Injectable()
export class NotifyService
{

  constructor(public toastCtrl: ToastController,
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController)
  {
  }

  presentLoading(m:string='Please wait',_d:number=3000): Loading
  {
    var loader = this.loadingCtrl.create({
      content: m
     // duration: d,
     //dismissOnPageChange: true
    });
    loader.present();
    return loader;
  }

  presentToast(_title: string, message: string,  d:number=3000,p:string= 'bottom'):Toast
  {
    var toast = this.toastCtrl.create({  
      message: message,
      duration: d,
      position: p,
      showCloseButton: true
    });

    toast.onDidDismiss(() =>
    {
      console.log('Dismissed toast');
    });

    toast.present();
    return toast;
  }
  
  presentAlert(title: string, message: string)
  {
    let alert = this.alertCtrl.create({
      title: title || 'Alert',
      subTitle:message,
      buttons: [{
        text: 'OK',
        handler: () =>
        {
          // close the sliding item
          // slidingItem.close();
        }
      }]
    });
    // now present the alert on top of all other content
    alert.present();
  }
  presentError(  message: string)
  {
    let alert = this.alertCtrl.create({
      title: 'Error',
          subTitle:message,
      buttons: [{
        text: 'OK',
        handler: () =>
        {
          // close the sliding item
          // slidingItem.close();
        }
      }]
    });
    // now present the alert on top of all other content
    alert.present();
  } 
}

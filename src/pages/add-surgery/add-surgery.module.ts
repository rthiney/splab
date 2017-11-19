import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AddSurgeryPage } from './add-surgery';
import { MultiPickerModule } from 'ion2-datetime-picker';
@NgModule({
  declarations: [
    AddSurgeryPage,
  ],
  imports: [
      MultiPickerModule,
    IonicPageModule.forChild(AddSurgeryPage),
  ],
})
export class AddSurgeryPageModule {}

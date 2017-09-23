import { PulseViewModel } from "../viewmodels/pulse_model";

export type SurgeyStatus ="future"|"today"|"past";
// function strEnum<T extends string>(o: Array<T>): {[K in T]: K} {
//     return o.reduce((res, key) => {
//         res[key] = key;
//         return res;
//     }, Object.create(null));
// }
// const SurgeyStatus = strEnum([    "future" , "today" , "past" ]);
// type SurgeyStatus = keyof typeof SurgeyStatus;

export interface ICalendarEvent {
    title: string;
    startTime: Date;
    endTime: Date;
    surgery: PulseViewModel;
    allDay: boolean;
    occurs: SurgeyStatus;
    minutes:number;
}
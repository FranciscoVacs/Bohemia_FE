import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DateService {

  constructor() { }


  formatDateTime(date: Date, selectedHour: string, selectedMinute: string){
   let month: string = (date.getMonth()+1) < 10 ? '0' + (date.getMonth()+1).toString() : (date.getMonth()+1).toString()
   let day: string = date.getDate() < 10 ? '0' + date.getDate().toString() : date.getDate().toString()
   let dateString: string = `${date.getFullYear().toString()}-${month}-${day} ${selectedHour}:${selectedMinute}:00`
   return dateString
  }
}

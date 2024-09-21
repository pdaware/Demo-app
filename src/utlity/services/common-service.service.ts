import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CommonServiceService {

  userName: string = 'ParkExcel';
  password: string = 'Excel@123';

  isUserLogIn: boolean = false;

  constructor() { }
}

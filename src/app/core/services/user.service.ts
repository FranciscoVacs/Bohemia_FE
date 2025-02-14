import { Injectable } from '@angular/core';
import { ApiService } from './api.service.js';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private apiService: ApiService) { }

  getUserById(id: number){
    return this.apiService.get(`/user` + `/${id}`).pipe(
      map((response: any) => response.data))
  }

  getUserPurchases(id: number){
    return this.apiService.get('/user/tickets' + `/${id}`).pipe(
      map((response: any) => response.data ))
  }

  registerUser(user: any){
    return this.apiService.postWithHeaders('/user/register', user)
  }

  logUser(logdata: any){
    return this.apiService.postWithHeaders('/user/login', logdata)
  }
}

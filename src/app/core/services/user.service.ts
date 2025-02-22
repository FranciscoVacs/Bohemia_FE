import { Injectable } from '@angular/core';
import { ApiService } from './api.service.js';
import { Observable } from 'rxjs';
import { User } from '../entities';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private apiService: ApiService) { }

  getUserById(id: number): Observable<User>{
    return this.apiService.get<User>(`/user` + `/${id}`)
  }

  getUserPurchases(id: number): Observable<User>{
    return this.apiService.get('/user/tickets' + `/${id}`)
  }

  registerUser(user: User){
    return this.apiService.postWithHeaders('/user/register', user)
  }

  logUser(logdata: any){
    return this.apiService.postWithHeaders('/user/login', logdata)
  }
}

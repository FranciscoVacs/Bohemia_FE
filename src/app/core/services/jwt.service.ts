import { Injectable, signal, WritableSignal } from '@angular/core';
import { UserService } from './user.service.js';

@Injectable({
  providedIn: 'root'
})
export class JWTService {

  constructor(private userService: UserService) { }

  currentUserSig: WritableSignal<any | null> = signal(null);

  getToken(){
    return typeof window !== 'undefined' ? localStorage.getItem('token') : null
  }

  setToken(token: string){
    return typeof window !== 'undefined' ? localStorage.setItem('token', token) : null
  }

  destroyToken(){
    return typeof window !== 'undefined' ? localStorage.removeItem('token') : null
  }
  
  setCurrentUser(token: any){
    this.userService.getUserById(token.id).subscribe(
    user => {this.currentUserSig.set(user)})
  }

  unloadUser(){
    this.destroyToken()
    this.currentUserSig.set(null)
  }

}

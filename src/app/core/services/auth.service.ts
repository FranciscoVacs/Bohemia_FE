import { Injectable, signal, WritableSignal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor() { }
  /*
  currentUserSig: any = signal;
  */
  currentUserSig: WritableSignal<any | null> = signal(null);
}

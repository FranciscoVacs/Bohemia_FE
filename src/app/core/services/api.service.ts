import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private httpClient: HttpClient) { }
  baseRoute = 'http://localhost:3000/api';
  
  get<T>(path: string): Observable<T>{
    return this.httpClient.get<{data: T}>(this.baseRoute + path).pipe(map(response => response.data))
  }

  post<T>(path: string, body: T): Observable<T>{
    return this.httpClient.post<{data: T}>(this.baseRoute + path, body).pipe(map(response => response.data))
  }

  postWithHeaders(path: string, body: {email: string, password: string}){
    return this.httpClient.post(this.baseRoute + path, body, {observe: 'response'})
  }

  patch(path: string, body: any){
    return this.httpClient.patch(this.baseRoute + path, body)
  }

  delete(path: string){
    return this.httpClient.delete(this.baseRoute + path)
  }

}

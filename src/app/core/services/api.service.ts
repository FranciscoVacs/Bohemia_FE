import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private httpClient: HttpClient) { }
  baseRoute = 'http://localhost:3000/api';
  
  get(path: string): Observable<any>{
    return this.httpClient.get(this.baseRoute + path)
  }

  post(path: string, body: any){
    return this.httpClient.post(this.baseRoute + path, body)
  }

  postWithHeaders(path: string, body: any){
    return this.httpClient.post(this.baseRoute + path, body, {observe: 'response'})
  }

  patch(path: string, body: any){
    return this.httpClient.patch(this.baseRoute + path, body)
  }

  delete(path: string){
    return this.httpClient.delete(this.baseRoute + path)
  }

}

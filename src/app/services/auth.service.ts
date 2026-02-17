import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap, catchError, throwError, map } from 'rxjs';
import { User } from '../models/user';
import { ApiResponse } from '../models/api-response';
import { LoginData, RegisterData } from '../models/auth';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly API_URL = environment.apiUrl;
  private readonly TOKEN_KEY = 'auth_token';

  //estado interno
  private _currentUser = signal<User | null>(null);
  private _token = signal<string | null>(null);

  //estado externo
  public readonly currentUser = this._currentUser.asReadonly();
  public readonly token = this._token.asReadonly();

  public readonly isAuthenticated = computed(() => this._currentUser() !== null);
  public readonly isAdmin = computed(() => this._currentUser()?.isAdmin ?? false);

  constructor(private http: HttpClient) {
    this.loadTokenFromStorage();
  }

  //metodos privados
  private loadTokenFromStorage(): void {
    const storedToken = localStorage.getItem(this.TOKEN_KEY);
    if (storedToken) {
      this._token.set(storedToken);
      this.loadCurrentUser().subscribe();
    }
  }

  private saveTokenToStorage(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    this._token.set(token);
  }

  private clearTokenFromStorage(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this._token.set(null);
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this._token();
    return new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  //metodos publicos
  login(credentials: LoginData): Observable<ApiResponse<User>> {
    return this.http.post<ApiResponse<User>>(
      `${this.API_URL}/user/login`,
      credentials,
      { observe: 'response' }
    ).pipe(
      tap(response => {
        const token = response.headers.get('token');
        if (token && response.body?.data) {
          this.saveTokenToStorage(token);
          this._currentUser.set(response.body.data);
        }
      }),
      map(response => response.body as ApiResponse<User>),
      catchError(error => {
        console.error('Login error:', error);
        return throwError(() => error);
      })
    );
  }

  register(data: RegisterData): Observable<ApiResponse<User>> {
    return this.http.post<ApiResponse<User>>(
      `${this.API_URL}/user/register`,
      data,
      { observe: 'response' }
    ).pipe(
      tap(response => {
        const token = response.headers.get('token');
        if (token && response.body?.data) {
          this.saveTokenToStorage(token);
          this._currentUser.set(response.body.data);
        }
      }),
      map(response => response.body as ApiResponse<User>),
      catchError(error => {
        console.error('Register error:', error);
        return throwError(() => error);
      })
    );
  }

  loadCurrentUser(): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(
      `${this.API_URL}/user/me`
    ).pipe(
      tap(response => {
        if (response.data) {
          this._currentUser.set(response.data);
        }
      }),
      catchError(error => {
        console.error('Load user error:', error);
        this.logout();
        return throwError(() => error);
      })
    );
  }

  updateProfile(data: Partial<User & { password?: string }>): Observable<ApiResponse<User>> {
    return this.http.patch<ApiResponse<User>>(
      `${this.API_URL}/user/me`,
      data
    ).pipe(
      tap(response => {
        if (response.data) {
          this._currentUser.set(response.data);
        }
      }),
      catchError(error => {
        console.error('Update profile error:', error);
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    this._currentUser.set(null);
    this.clearTokenFromStorage();
  }
}


import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Login } from '../interfaces/login';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.urlBackEnd}/v1/api/user`;

  // Usuario autenticado actualmente
  private loggedUserSubject = new BehaviorSubject<Login | null>(null);
  loggedUser$ = this.loggedUserSubject.asObservable();

  // Iniciar sesión
  login(credentials: { email: string; passwordUser: string }): Observable<Login> {
    return this.http.post<Login>(`${this.apiUrl}/login`, credentials).pipe(
      tap(user => {
        this.setLoggedUser(user);
        this.logSuccess('Inicio de sesión exitoso');
      }),
      catchError(this.handleError<Login>('login'))
    );
  }

  // Cerrar sesión
  logout(): void {
    this.loggedUserSubject.next(null);
    localStorage.removeItem('user');
    this.logSuccess('Sesión cerrada');
  }

  // Establecer usuario logueado (útil para guards/navbar)
  setLoggedUser(user: Login | null): void {
    this.loggedUserSubject.next(user);
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }

  // Cargar usuario desde localStorage al iniciar la app
  loadUserFromStorage(): void {
    const userData = localStorage.getItem('user');
    if (userData) {
      this.loggedUserSubject.next(JSON.parse(userData));
    }
  }

  // ❌ Manejo centralizado de errores
  private handleError<T>(operation = 'operación', result?: T) {
    return (error: HttpErrorResponse): Observable<T> => {
      console.error(`${operation} falló: ${error.message}`);
      let errorMessage = `Error en ${operation}`;
      if (error.error instanceof ErrorEvent) {
        errorMessage += `: ${error.error.message}`;
      } else {
        errorMessage += `: Código ${error.status} - ${error.error?.message || error.message}`;
      }
      this.logError(errorMessage);
      return throwError(() => errorMessage);
    };
  }

  // Logs
  private logSuccess(message: string): void {
    console.log('✅ LOGIN SUCCESS:', message);
  }

  private logError(message: string): void {
    console.error('⛔ LOGIN ERROR:', message);
  }
}

import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { UserRegisterModel } from '../models/user-register.model';
import { UserLoginModel } from '../models/user-login.model';
import { UserModel } from '../models/user.model';
import { AuthUserModel } from '../models/auth-user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  [x: string]: any;
  private http = inject(HttpClient);
  private apiUrl = 'https://localhost:44362/api/users';

  currentUser = signal<UserModel | null>(this.getUserFromStorage());
  isLoggedIn = signal<boolean>(!!this.getUserFromStorage());
 
  isAdmin(): boolean {
    const user = this.currentUser();
    return user?.role === 'Admin'; 
  }

register(user: UserRegisterModel): Observable<AuthUserModel> {
  // לדוגמה, אם צריך לייצר Token אקראי
  user.token = this.generateToken(); // או כל ערך שה־API מצפה לו

  return this.http.post<AuthUserModel>(this.apiUrl, user).pipe(
    tap((response: AuthUserModel) => {
      this.setSession(response);
    })
  );
}

registerByAdmin(user: UserRegisterModel): Observable<UserModel> {
  user.token = this.generateToken();
  return this.http.post<UserModel>(this.apiUrl, user);
}

private generateToken(): string {
  return Math.random().toString(36).substring(2); 
}

  login(user: UserLoginModel): Observable<AuthUserModel> {
    return this.http.post<AuthUserModel>(`${this.apiUrl}/login`, user).pipe(
      tap(response => {
        this.setSession(response);
      })
    );
  }

  updateUser(id: number, user: UserModel): Observable<void> {
    const token = user.token || localStorage.getItem('token') || this.generateToken();
    const payload = { ...user, token };
    return this.http.put<void>(`${this.apiUrl}/${id}`, payload).pipe(
      tap(() => {
        // Only update session if editing the currently logged-in user
        const currentUser = this.currentUser();
        if (currentUser && currentUser.id === id) {
          const updatedUser = { ...currentUser, ...user };
          this.setSession({ token: localStorage.getItem('token')!, user: updatedUser });
        }
      })
    );
  }

  updateUserRole(id: number, role: string): Observable<void> {
    return new Observable(observer => {
      this.getUserById(id).subscribe({
        next: (user) => {
          user.role = role;
          user.token = user.token || localStorage.getItem('token') || this.generateToken();
          this.http.put<void>(`${this.apiUrl}/${id}`, user).subscribe({
            next: () => {
              observer.next();
              observer.complete();
            },
            error: (err) => observer.error(err)
          });
        },
        error: (err) => observer.error(err)
      });
    });
  }

  logout(): void {
    localStorage.removeItem('user_data');
    this.currentUser.set(null);
    this.isLoggedIn.set(false);
  }

  private setSession(authData: AuthUserModel): void {
    localStorage.setItem('token', authData.token);
    localStorage.setItem('user_data', JSON.stringify(authData.user));
    this.currentUser.set(authData.user);
    this.isLoggedIn.set(true);
  }

  private getUserFromStorage(): UserModel | null {
    const savedUser = localStorage.getItem('user_data');
    if (!savedUser) return null;
    try {
      return JSON.parse(savedUser) as UserModel;
    } catch {
      return null;
    }
  }

  getAllUsers(): Observable<UserModel[]> {
    return this.http.get<UserModel[]>(this.apiUrl);
  }

  getUserById(id: number): Observable<UserModel> {
    return this.http.get<UserModel>(`${this.apiUrl}/${id}`);
  }
}
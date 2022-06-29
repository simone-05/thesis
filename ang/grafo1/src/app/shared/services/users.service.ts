import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  Users: user[] = [
    {username: "simone", password: "simone"},
    {username: "andrea", password: "andrea"}
  ];

  user$: BehaviorSubject<user|any> = new BehaviorSubject<user|any>(null);

  constructor() { }

  getUsers() {
    return of (this.Users);
  }

  modifyPassword(username: string, password: string) {
    let name = this.Users.find((user) => {user.username = username});
    if (name) {
      name.password = password;
      this.user$.next(name);
    }
  }

  findUser(username?: string | null) : boolean {
    if (!username && sessionStorage.getItem("username")) {
      username = sessionStorage.getItem("username");
    }
    let user = this.Users.find((user) => username == user.username);
    if (user) {
      return true;
    } else {
      return false;
    }
  }

  matchPassword(username?: string | null, password?: string | null) : boolean {
    if (!username && sessionStorage.getItem("username")) {
      username = sessionStorage.getItem("username");
    }
    if (!password && sessionStorage.getItem("password")) {
      password = sessionStorage.getItem("password");
    }
    let user = this.Users.find((user) => username == user.username);
    if (user && user.password == password){
      return true;
    } else return false;
  }

}

export interface user {username: string, password: string};

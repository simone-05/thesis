import { Subscription } from 'rxjs';
import { UsersService } from './../shared/services/users.service';
import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild, OnDestroy } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Route, Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  form: FormGroup;
  users_subscription: Subscription;

  constructor(private Users: UsersService, private formbuilder: FormBuilder, private router: Router) {
    this.users_subscription = this.Users.user$.subscribe((user) => {

    });

    this.form = this.formbuilder.group({
      username: ["", Validators.required],
      password: new FormControl("", Validators.required)
    })

    sessionStorage.removeItem("username");
    sessionStorage.removeItem("password");
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.users_subscription.unsubscribe();
  }

  tryLogin() {
    // console.log("form: "+this.form);
    if (this.form.valid) {
      // this.Users.getUsers().subscribe((users) => {
      //   let utente = users.find((user) => user.username == this.form.controls["username"].value);
      //   if (utente) {
      //     sessionStorage.setItem("username", utente.username);
      //     sessionStorage.setItem("password", utente.password);
      //     this.router.navigate(["app"]);
      //   }
      // });
      sessionStorage.setItem("username", this.form.controls["username"].value);
      sessionStorage.setItem("password", this.form.controls["password"].value);
      this.router.navigate(["app"]);
    }
  }

}

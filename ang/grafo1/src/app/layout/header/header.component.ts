import { UsersService } from './../../shared/services/users.service';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  username: string;

  constructor(private users: UsersService) {
    this.username = sessionStorage.getItem("username") || "";
   }

  ngOnInit(): void {
  }

}

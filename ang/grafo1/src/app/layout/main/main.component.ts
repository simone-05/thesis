import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {

  constructor(public router: Router) { }

  ngOnInit(): void {
  }

  getContentHeight(): string {
    const header_height: number | undefined = document.getElementsByTagName("app-header")[0].firstElementChild?.clientHeight || 67;
    const viewport_height: number | undefined = window.innerHeight || 290;
    return (viewport_height - header_height).toString() + "px";
  }

  getContentBottomPadding(): string {
    if (this.router.url == "/app/graph/list") {
      const footer_height: number | undefined = document.getElementsByTagName("app-footer")[0].firstElementChild?.clientHeight || 29;
      return footer_height.toString() + "px";
    } else return "0px";
  }

}

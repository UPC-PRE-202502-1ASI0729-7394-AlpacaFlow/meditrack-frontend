import { Component } from '@angular/core';
import {RouterOutlet} from "@angular/router";

@Component({
  selector: 'app-layout',
  imports: [
    RouterOutlet

  ],
  templateUrl: './layout.html',
  standalone: true,
  styleUrls: ['./layout.css']
})
export class Layout   {

}
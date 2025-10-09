import { Component } from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-about',
  imports: [
    TranslatePipe
  ],
  templateUrl: './about.html',
  standalone: true,
  styleUrl: './about.css'
})
export class About {

}

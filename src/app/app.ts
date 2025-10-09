import { Component, signal } from '@angular/core';
import {Layout} from "./shared/presentation/components/layout/layout";

@Component({
  selector: 'app-root',
  imports: [Layout],
  templateUrl: './app.html',
  standalone: true,
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('meditrack');
}

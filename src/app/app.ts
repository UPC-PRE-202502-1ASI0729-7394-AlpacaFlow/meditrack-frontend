import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {Layout} from "./shared/presentation/components/layout/layout";
import {TemperatureRate} from "./relatives/presentation/components/temperature-rate/temperature-rate";
import {Profile} from "./relatives/presentation/views/profile/profile";
import {AlertList} from "./relatives/presentation/views/alert-list/alert-list";
import {Statistic} from "./relatives/presentation/views/statistic/statistic";
import {RelativeLayoutComponent} from "./relatives/presentation/views/relative-layout/relative-layout";

@Component({
  selector: 'app-root',
    imports: [RouterOutlet, Layout, TemperatureRate, Profile, AlertList, Statistic, RelativeLayoutComponent],
  templateUrl: './app.html',
  standalone: true,
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('meditrack');
}

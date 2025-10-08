import { Component } from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {MatButtonToggle, MatButtonToggleGroup} from '@angular/material/button-toggle';

@Component({
  selector: 'app-language-switcher',
  imports: [
    MatButtonToggleGroup,
    MatButtonToggle
  ],
  templateUrl: './language-switcher.html',
  standalone: true,
  styleUrl: './language-switcher.css'
})
export class LanguageSwitcher {
  currentLanguage = 'en';
  languages= ['en', 'es'];


  constructor(private translate : TranslateService) {
    this.currentLanguage = translate.getCurrentLang();
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }
}

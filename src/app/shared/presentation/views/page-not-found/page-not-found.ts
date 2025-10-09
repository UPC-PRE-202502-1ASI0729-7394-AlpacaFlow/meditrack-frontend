import {Component, inject, OnInit} from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';
import {MatButton} from '@angular/material/button';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-page-not-found',
  imports: [
    TranslatePipe,
    MatButton
  ],
  templateUrl: './page-not-found.html',
  standalone: true,
  styleUrl: './page-not-found.css'
})
export class PageNotFound implements OnInit {
  protected invalidPath: string = '';
  private route: ActivatedRoute = inject(ActivatedRoute);
  private router: Router = inject(Router);

  ngOnInit(): void {
    this.invalidPath = this.route.snapshot.url.map(url => url.path).join('/');
  };

  protected navigateToHome() {
    this.router.navigate(['home']).then();
  }
}

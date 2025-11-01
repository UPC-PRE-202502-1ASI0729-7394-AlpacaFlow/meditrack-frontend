import { Component,Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { Keeper } from '../../../domain/model/keeper.entity';
import {MatIconModule} from "@angular/material/icon";
import {ReactiveFormsModule} from "@angular/forms";
import { Router, ActivatedRoute } from '@angular/router';
import {TranslatePipe} from "@ngx-translate/core";


@Component({
  selector: 'app-keeper-item',
  standalone: true,
    imports: [CommonModule, MatButtonModule, MatIconModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './keeper-item.html',
  styleUrls: ['./keeper-item.css']
})
export class KeeperItem {
  @Input() keeper!: Keeper;
  @Output() edit = new EventEmitter<Keeper>();
  @Output() remove = new EventEmitter<Keeper>();

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  /**
   * Obtiene el userId de la ruta padre (organization/:id)
   */
  private getUserIdFromRoute(): number | null {
    // Intentar obtener el userId de la ruta padre
    let currentRoute: ActivatedRoute | null = this.route;
    while (currentRoute) {
      const params = currentRoute.snapshot.paramMap;
      const userId = params.get('id');
      if (userId) {
        return parseInt(userId, 10);
      }
      currentRoute = currentRoute.parent;
    }
    return null;
  }

  onEdit(event: Event) {
    event.stopPropagation();
    this.edit.emit(this.keeper);
  }

  onRemove(event: Event) {
    event.stopPropagation();
    this.remove.emit(this.keeper);
  }

  onCardClick() {
    const userId = this.getUserIdFromRoute();
    if (userId) {
      this.router.navigate(['/organization', userId, 'keepers', this.keeper.id]);
    } else {
      console.error('❌ KeeperItem: Could not find userId in route');
    }
  }

  onCardDoubleClick() {
    const userId = this.getUserIdFromRoute();
    if (userId) {
      this.router.navigate(['/organization', userId, 'keepers', this.keeper.id]);
    } else {
      console.error('❌ KeeperItem: Could not find userId in route');
    }
  }
}

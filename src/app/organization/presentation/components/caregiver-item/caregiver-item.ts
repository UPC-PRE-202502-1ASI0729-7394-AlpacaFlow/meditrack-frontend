import { Component,Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { Caregiver } from '../../../domain/model/caregiver.entity';
import {MatIconModule} from "@angular/material/icon";
import {ReactiveFormsModule} from "@angular/forms";
import { Router, ActivatedRoute } from '@angular/router';
import {TranslatePipe} from "@ngx-translate/core";


@Component({
  selector: 'app-caregiver-item',
  standalone: true,
    imports: [CommonModule, MatButtonModule, MatIconModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './caregiver-item.html',
  styleUrls: ['./caregiver-item.css']
})
export class CaregiverItem {
  @Input() caregiver!: Caregiver;
  @Output() edit = new EventEmitter<Caregiver>();
  @Output() remove = new EventEmitter<Caregiver>();

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
    this.edit.emit(this.caregiver);
  }

  onRemove(event: Event) {
    event.stopPropagation();
    this.remove.emit(this.caregiver);
  }

  onCardClick() {
    const userId = this.getUserIdFromRoute();
    if (userId) {
      this.router.navigate(['/organization', userId, 'caregivers', this.caregiver.id]);
    } else {
      console.error('❌ CaregiverItem: Could not find userId in route');
    }
  }

  onCardDoubleClick() {
    const userId = this.getUserIdFromRoute();
    if (userId) {
      this.router.navigate(['/organization', userId, 'caregivers', this.caregiver.id]);
    } else {
      console.error('❌ CaregiverItem: Could not find userId in route');
    }
  }
}


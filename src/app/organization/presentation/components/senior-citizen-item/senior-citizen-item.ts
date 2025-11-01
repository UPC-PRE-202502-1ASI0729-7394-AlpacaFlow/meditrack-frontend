import { Component,Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { SeniorCitizen } from '../../../domain/model/senior-citizen.entity';
import {MatIconModule} from "@angular/material/icon";
import {ReactiveFormsModule} from "@angular/forms";
import { Router, ActivatedRoute } from '@angular/router';
import {TranslatePipe} from "@ngx-translate/core";
import { OrganizationStore } from '../../../application/organization.store';


@Component({
  selector: 'app-senior-citizen-item',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './senior-citizen-item.html',
  styleUrls: ['./senior-citizen-item.css']
})
export class SeniorCitizenItem {
  @Input() seniorCitizen!: SeniorCitizen;
  @Output() edit = new EventEmitter<SeniorCitizen>();
  @Output() remove = new EventEmitter<SeniorCitizen>();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public organizationStore: OrganizationStore
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
    this.edit.emit(this.seniorCitizen);
  }

  onRemove(event: Event) {
    event.stopPropagation();
    this.remove.emit(this.seniorCitizen);
  }

  onCardClick() {
    const userId = this.getUserIdFromRoute();
    if (userId) {
      // Navigate to senior citizen profile
      this.router.navigate(['/organization', userId, 'senior-citizens', this.seniorCitizen.id, 'profile']);
    } else {
      console.error('❌ SeniorCitizenItem: Could not find userId in route');
    }
  }

  onCardDoubleClick() {
    const userId = this.getUserIdFromRoute();
    if (userId) {
      // Navigate to senior citizen profile
      this.router.navigate(['/organization', userId, 'senior-citizens', this.seniorCitizen.id, 'profile']);
    } else {
      console.error('❌ SeniorCitizenItem: Could not find userId in route');
    }
  }
}

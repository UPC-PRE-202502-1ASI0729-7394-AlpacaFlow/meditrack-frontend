import { Component,Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { Patient } from '../../../domain/model/patient.entity';
import {MatIconModule} from "@angular/material/icon";
import {ReactiveFormsModule} from "@angular/forms";
import { Router, ActivatedRoute } from '@angular/router';
import { OrganizationStore } from '../../../application/organization.store';


@Component({
  selector: 'app-patient-item',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, ReactiveFormsModule],
  templateUrl: './patient-item.html',
  styleUrls: ['./patient-item.css']
})
export class PatientItem {
  @Input() patient!: Patient;
  @Output() edit = new EventEmitter<Patient>();
  @Output() remove = new EventEmitter<Patient>();

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
    this.edit.emit(this.patient);
  }

  onRemove(event: Event) {
    event.stopPropagation();
    this.remove.emit(this.patient);
  }

  onCardClick() {
    const userId = this.getUserIdFromRoute();
    if (userId) {
      // Navigate to patient profile
      this.router.navigate(['/organization', userId, 'patients', this.patient.id, 'profile']);
    } else {
      console.error('❌ PatientItem: Could not find userId in route');
    }
  }

  onCardDoubleClick() {
    const userId = this.getUserIdFromRoute();
    if (userId) {
      // Navigate to patient profile
      this.router.navigate(['/organization', userId, 'patients', this.patient.id, 'profile']);
    } else {
      console.error('❌ PatientItem: Could not find userId in route');
    }
  }
}

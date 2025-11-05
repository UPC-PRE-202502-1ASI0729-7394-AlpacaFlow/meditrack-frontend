import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Doctor } from "../../../domain/model/doctor.entity";
import {MatIconModule} from "@angular/material/icon";
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-doctor-item',
  standalone: true,
  imports: [CommonModule, MatIconModule, TranslatePipe],
  templateUrl: './doctor-item.html',
  styleUrls: ['./doctor-item.css']
})
export class DoctorItem {
  @Input() doctor!: Doctor;
  @Output() edit = new EventEmitter<Doctor>();
  @Output() remove = new EventEmitter<Doctor>();

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  onEdit(event: Event) {
    event.stopPropagation();
    this.edit.emit(this.doctor);
  }

  onRemove(event: Event) {
    event.stopPropagation();
    this.remove.emit(this.doctor);
  }

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

  onCardClick() {
    const userId = this.getUserIdFromRoute();
    if (userId) {
      this.router.navigate(['/organization', userId, 'doctors', this.doctor.id]);
    } else {
      console.error('❌ DoctorItem: Could not find userId in route');
    }
  }

  onCardDoubleClick() {
    const userId = this.getUserIdFromRoute();
    if (userId) {
      this.router.navigate(['/organization', userId, 'doctors', this.doctor.id]);
    } else {
      console.error('❌ DoctorItem: Could not find userId in route');
    }
  }
}

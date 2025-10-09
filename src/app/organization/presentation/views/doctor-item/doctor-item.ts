import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Doctor } from "../../../domain/model/doctor.entity";
import {MatIconModule} from "@angular/material/icon";

@Component({
  selector: 'app-doctor-item',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './doctor-item.html',
  styleUrls: ['./doctor-item.css']
})
export class DoctorItem {
  @Input() doctor!: Doctor;
  @Output() edit = new EventEmitter<Doctor>();
  @Output() remove = new EventEmitter<Doctor>();

  constructor(private router: Router) {}

  onEdit(event: Event) {
    event.stopPropagation();
    this.edit.emit(this.doctor);
  }

  onRemove(event: Event) {
    event.stopPropagation();
    this.remove.emit(this.doctor);
  }

  onCardClick() {
    this.router.navigate(['/doctor-detail', this.doctor.id]);
  }

  onCardDoubleClick() {
    this.router.navigate(['/doctor-detail', this.doctor.id]);
  }
}

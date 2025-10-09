import { Component,Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { Patient } from '../../../domain/model/patient.entity';
import {MatIconModule} from "@angular/material/icon";
import {ReactiveFormsModule} from "@angular/forms";
import {TranslatePipe} from "@ngx-translate/core";
import { Router } from '@angular/router';


@Component({
  selector: 'app-patient-item',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './patient-item.component.html',
  styleUrls: ['./patient-item.component.css']
})
export class PatientItemComponent {
  @Input() patient!: Patient;
  @Output() edit = new EventEmitter<Patient>();
  @Output() remove = new EventEmitter<Patient>();

  constructor(private router: Router) {}


  onEdit(event: Event) {
    event.stopPropagation();
    this.edit.emit(this.patient);
  }

  onRemove(event: Event) {
    event.stopPropagation();
    this.remove.emit(this.patient);
  }

  onCardClick() {
    this.router.navigate(['/patient-detail', this.patient.id]);
  }

  onCardDoubleClick() {
    this.router.navigate(['/patient-detail', this.patient.id]);
  }
}

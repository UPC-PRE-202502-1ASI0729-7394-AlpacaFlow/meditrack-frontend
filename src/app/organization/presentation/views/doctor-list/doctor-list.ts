import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';
import { DoctorFormComponent } from '../doctor-form/doctor-form';
import { DoctorItem } from '../../components/doctor-item/doctor-item';
import { OrganizationStore } from '../../../application/organization.store';
import { Doctor } from '../../../domain/model/doctor.entity';
import {DeleteDoctorDialog} from "../../components/delete-doctor-dialog/delete-doctor-dialog";
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-doctor-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogModule,
    TranslatePipe,
    DoctorFormComponent,
    DoctorItem
  ],
  templateUrl: './doctor-list.html',
  styleUrls: ['./doctor-list.css']
})
export class DoctorList implements OnInit, OnDestroy {
  showForm = false;
  editingDoctor: Doctor | null = null;
  private routeSubscription?: Subscription;
  private parentRouteSubscription?: Subscription;

  constructor(
      public organizationStore: OrganizationStore,
      private dialog: MatDialog,
      private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Suscribirse a cambios en el parámetro de la ruta padre (:id en /organization/:id)
    // Esto asegura que cuando cambie la organización, los datos se recarguen
    this.parentRouteSubscription = this.route.parent?.paramMap.subscribe(params => {
      const userIdStr = params.get('id');
      if (userIdStr) {
        const userId = parseInt(userIdStr, 10);
        const organizationId = this.organizationStore.getOrganizationIdByUserId(userId);
        console.log(`🔄 DoctorList: Detected organization change, reloading doctors for userId: ${userId}, organizationId: ${organizationId}`);
        this.organizationStore.loadDoctorsByOrganization(organizationId);
        
        // Log del estado actual del signal después de un pequeño delay
        setTimeout(() => {
          console.log(`👁️ DoctorList: Current doctorsSignal value:`, this.organizationStore.doctors());
          console.log(`👁️ DoctorList: Doctors count in signal:`, this.organizationStore.doctors().length);
        }, 1000);
      }
    });

    // También verificar la ruta actual al inicializar
    const parentParams = this.route.parent?.snapshot.paramMap;
    if (parentParams) {
      const userIdStr = parentParams.get('id');
      if (userIdStr) {
        const userId = parseInt(userIdStr, 10);
        const organizationId = this.organizationStore.getOrganizationIdByUserId(userId);
        console.log(`🔄 DoctorList: Initial load for userId: ${userId}, organizationId: ${organizationId}`);
        this.organizationStore.loadDoctorsByOrganization(organizationId);
        
        // Log del estado actual del signal después de un pequeño delay
        setTimeout(() => {
          console.log(`👁️ DoctorList: Current doctorsSignal value (initial):`, this.organizationStore.doctors());
          console.log(`👁️ DoctorList: Doctors count in signal (initial):`, this.organizationStore.doctors().length);
        }, 1000);
      }
    }
  }

  ngOnDestroy(): void {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
    if (this.parentRouteSubscription) {
      this.parentRouteSubscription.unsubscribe();
    }
  }

  openAddDoctorForm(): void {
    this.editingDoctor = null;
    this.showForm = true;
  }

  openEditDoctorForm(doctor: Doctor): void {
    this.editingDoctor = doctor;
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
  }

  onDoctorSaved(doctor: Doctor): void {

    this.showForm = false;
  }

  onDoctorRemoved(doctor: Doctor): void {
    const dialogRef = this.dialog.open(DeleteDoctorDialog, {
      width: '400px',
      data: {
        doctor: doctor
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.organizationStore.deleteDoctor(doctor.id);
      }
    });
  }

  trackById(index: number, doctor: Doctor): number {
    return doctor.id;
  }
}

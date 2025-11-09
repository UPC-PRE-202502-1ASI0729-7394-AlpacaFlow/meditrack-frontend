import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { OrganizationStore } from '../../../application/organization.store';
import { SeniorCitizen } from '../../../domain/model/senior-citizen.entity';
import { DeleteSeniorCitizenDialog } from '../../components/delete-senior-citizen-dialog/delete-senior-citizen-dialog';
import { SeniorCitizenItem } from '../../components/senior-citizen-item/senior-citizen-item';
import { SeniorCitizenForm } from '../senior-citizen-form/senior-citizen-form';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { distinctUntilChanged, map, debounceTime, filter } from 'rxjs/operators';

@Component({
  selector: 'app-senior-citizen-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    TranslatePipe,
    SeniorCitizenForm,
    SeniorCitizenItem
  ],
  templateUrl: './senior-citizen-list.html',
  styleUrls: ['./senior-citizen-list.css']
})
export class SeniorCitizenListComponent implements OnInit, OnDestroy {
  showForm = false;
  editingSeniorCitizen: SeniorCitizen | null = null;
  private routeSubscription?: Subscription;
  private parentRouteSubscription?: Subscription;
  private lastLoadedOrganizationId: number | null = null; // Guardar el último organizationId cargado
  private isLoading = false; // Flag local para evitar recargas simultáneas
  private hasInitialized = false; // Flag para evitar múltiples inicializaciones

  constructor(
      public organizationStore: OrganizationStore,
      private dialog: MatDialog,
      private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Evitar múltiples inicializaciones
    if (this.hasInitialized) {
      return;
    }
    this.hasInitialized = true;

    // Primero, verificar la ruta actual al inicializar (solo una vez)
    const parentParams = this.route.parent?.snapshot.paramMap;
    if (parentParams) {
      const organizationIdStr = parentParams.get('organizationId');
      if (organizationIdStr) {
        const organizationId = parseInt(organizationIdStr, 10);
        if (organizationId && !this.isLoading) {
          // Verificar si los datos ya están cargados para este organizationId
          // Usar el método del store para verificar si ya se cargaron los datos
          const alreadyLoaded = this.organizationStore.isSeniorCitizensLoadedForOrganization(organizationId);
          
          // Solo cargar si no hay datos cargados o si el organizationId cambió
          if (!alreadyLoaded && this.lastLoadedOrganizationId !== organizationId) {
            console.log(`SeniorCitizenList: Initial load for organizationId: ${organizationId}`);
            this.lastLoadedOrganizationId = organizationId;
            this.isLoading = true;
            this.organizationStore.loadSeniorCitizensByOrganization(organizationId);
            
            // Resetear el flag cuando el loading termine
            const checkLoading = setInterval(() => {
              if (!this.organizationStore.loading() && this.isLoading) {
                clearInterval(checkLoading);
                setTimeout(() => {
                  this.isLoading = false;
                }, 100);
              }
            }, 100);
            
            // Limpiar el intervalo después de 5 segundos como fallback
            setTimeout(() => {
              clearInterval(checkLoading);
              this.isLoading = false;
            }, 5000);
          } else {
            console.log(`SeniorCitizenList: Data already loaded for organizationId: ${organizationId}, skipping load`);
            this.lastLoadedOrganizationId = organizationId;
          }
        }
      }
    }

    // Suscribirse a cambios en el parámetro de la ruta padre (:organizationId en /organization/:organizationId)
    // Usar distinctUntilChanged y debounceTime para evitar recargas innecesarias
    this.parentRouteSubscription = this.route.parent?.paramMap.pipe(
      map(params => {
        const organizationIdStr = params.get('organizationId');
        return organizationIdStr ? parseInt(organizationIdStr, 10) : null;
      }),
      filter(organizationId => organizationId !== null), // Filtrar valores null
      distinctUntilChanged(), // Solo emitir si el organizationId cambió
      debounceTime(500) // Esperar 500ms antes de procesar para evitar múltiples emisiones rápidas
    ).subscribe(organizationId => {
      if (organizationId && organizationId !== this.lastLoadedOrganizationId && !this.isLoading) {
        console.log(`SeniorCitizenList: Detected organization change, reloading senior citizens for organizationId: ${organizationId}`);
        this.lastLoadedOrganizationId = organizationId;
        this.isLoading = true;
        this.organizationStore.loadSeniorCitizensByOrganization(organizationId);
        
        // Resetear el flag cuando el loading termine
        const checkLoading = setInterval(() => {
          if (!this.organizationStore.loading() && this.isLoading) {
            clearInterval(checkLoading);
            setTimeout(() => {
              this.isLoading = false;
            }, 100);
          }
        }, 100);
        
        // Limpiar el intervalo después de 5 segundos como fallback
        setTimeout(() => {
          clearInterval(checkLoading);
          this.isLoading = false;
        }, 5000);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
    if (this.parentRouteSubscription) {
      this.parentRouteSubscription.unsubscribe();
    }
    // Resetear flags al destruir el componente
    this.hasInitialized = false;
    this.isLoading = false;
    this.lastLoadedOrganizationId = null;
  }

  openAddSeniorCitizenForm(): void {
    this.editingSeniorCitizen = null;
    this.showForm = true;
  }

  openEditSeniorCitizenForm(seniorCitizen: SeniorCitizen): void {
    this.editingSeniorCitizen = seniorCitizen;
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
  }

  onSeniorCitizenSaved(seniorCitizen: SeniorCitizen): void {
    // El store ya fue actualizado en el formulario
    // Recargar la lista de senior citizens para asegurar que solo se muestren los de la organización actual
    const organizationId = this.organizationStore.getCurrentOrganizationId();
    if (organizationId > 0) {
      this.organizationStore.loadSeniorCitizensByOrganization(organizationId);
    }
    // Cerrar el formulario
    this.showForm = false;
  }

  onSeniorCitizenRemoved(seniorCitizen: SeniorCitizen): void {
    const dialogRef = this.dialog.open(DeleteSeniorCitizenDialog, {
      width: '400px',
      data: {
        seniorCitizen: seniorCitizen
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.organizationStore.deleteSeniorCitizen(seniorCitizen.id);
      }
    });
  }

  trackById(index: number, seniorCitizen: SeniorCitizen): number {
    return seniorCitizen.id;
  }
}

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';
import { OrganizationStore } from '../../../application/organization.store';
import { Keeper } from '../../../domain/model/keeper.entity';
import { DeleteKeeperDialog } from '../../components/delete-keeper-dialog/delete-keeper-dialog';
import { KeeperItem } from '../../components/keeper-item/keeper-item';
import { KeeperForm } from '../keeper-form/keeper-form';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-keeper-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogModule,
    TranslatePipe,
    KeeperForm,
    KeeperItem
  ],
  templateUrl: './keeper-list.html',
  styleUrls: ['./keeper-list.css']
})
export class KeeperListComponent implements OnInit, OnDestroy {
  showForm = false;
  editingKeeper: Keeper | null = null;
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
        console.log(`🔄 KeeperList: Detected organization change, reloading keepers for userId: ${userId}, organizationId: ${organizationId}`);
        this.organizationStore.loadKeepersByOrganization(organizationId);
      }
    });

    // También verificar la ruta actual al inicializar
    const parentParams = this.route.parent?.snapshot.paramMap;
    if (parentParams) {
      const userIdStr = parentParams.get('id');
      if (userIdStr) {
        const userId = parseInt(userIdStr, 10);
        const organizationId = this.organizationStore.getOrganizationIdByUserId(userId);
        console.log(`🔄 KeeperList: Initial load for userId: ${userId}, organizationId: ${organizationId}`);
        this.organizationStore.loadKeepersByOrganization(organizationId);
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

  openAddKeeperForm(): void {
    this.editingKeeper = null;
    this.showForm = true;
  }

  openEditKeeperForm(keeper: Keeper): void {
    this.editingKeeper = keeper;
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
  }

  onKeeperSaved(keeper: Keeper): void {

    this.showForm = false;
  }

  onKeeperRemoved(keeper: Keeper): void {
    const dialogRef = this.dialog.open(DeleteKeeperDialog, {
      width: '400px',
      data: {
        keeper: keeper
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.organizationStore.deleteKeeper(keeper.id);
      }
    });
  }

  trackById(index: number, keeper: Keeper): number {
    return keeper.id;
  }
}

import { computed, Injectable, Signal, signal } from '@angular/core';
import { retry, filter, take } from 'rxjs';

import { Doctor } from '../domain/model/doctor.entity';
import { Caregiver } from '../domain/model/caregiver.entity';
import { SeniorCitizen } from '../domain/model/senior-citizen.entity';
import { Organization } from '../domain/model/organization.entity';
import { OrganizationApi } from '../infrastructure/organization-api';

/**
 * State management store for doctors, caregivers, and senior citizens using Angular signals.
 */
@Injectable({
  providedIn: 'root'
})
export class OrganizationStore {

  // Tabla Users: id, email, role
  private readonly USERS = [
    { id: 1, email: "admin1@example.com", role: "admin" },
    { id: 2, email: "admin2@example.com", role: "admin" },
    { id: 3, email: "doctor1@example.com", role: "doctor" },
    { id: 4, email: "caregiver1@example.com", role: "caregiver" }
  ];

  // Tabla Organizations: id, name, type
  private readonly ORGANIZATIONS = [
    { id: 1, name: "Clínica Ortega", type: "clinica" as const },
    { id: 2, name: "Casa de Reposo San Juan", type: "resident" as const }
  ];

  // Tabla Admins: id, organizationId, userId, firstName, lastName
  private readonly ADMINS = [
    { id: 1, organizationId: 1, userId: "1", firstName: "María", lastName: "González" },
    { id: 2, organizationId: 2, userId: "2", firstName: "Juan", lastName: "Pérez" }
  ];

  // Tabla Doctors: id, organizationId, userId, firstName, lastName, ...
  // Se carga desde la API, pero para simulación de entityId:
  // userId: 3 -> doctorId: 1 (se obtendrá de la API)
  
  // Tabla Caregivers: id, organizationId, userId, firstName, lastName, ...
  // Se carga desde la API, pero para simulación de entityId:
  // userId: 4 -> caregiverId: 1 (se obtendrá de la API)

  


  // Doctor signals
  readonly doctorCount = computed(() => this.doctors().length);
  private readonly doctorsSignal = signal<Doctor[]>([]);
  readonly doctors = this.doctorsSignal.asReadonly();

  // Selected senior citizen signal (for doctors and caregivers viewing senior citizen details)
  private readonly selectedSeniorCitizenSignal = signal<SeniorCitizen | null>(null);
  readonly selectedSeniorCitizen = this.selectedSeniorCitizenSignal.asReadonly();

  // Caregiver signals
  readonly caregiverCount = computed(() => this.caregivers().length);
  private readonly caregiversSignal = signal<Caregiver[]>([]);
  readonly caregivers = this.caregiversSignal.asReadonly();

  // Senior Citizen signals
  readonly seniorCitizenCount = computed(() => this.seniorCitizens().length);
  private readonly seniorCitizensSignal = signal<SeniorCitizen[]>([]);
  readonly seniorCitizens = this.seniorCitizensSignal.asReadonly();

  // Filtered senior citizens based on user role (for doctors and caregivers, only show assigned senior citizens)
  readonly filteredSeniorCitizens = computed(() => {
    const role = this.getCurrentUserRole();
    const organizationId = this.getCurrentOrganizationId();
    const allSeniorCitizens = this.seniorCitizens();
    
    // Always filter by organizationId to ensure multi-tenant isolation
    const seniorCitizensInOrganization = organizationId > 0
      ? allSeniorCitizens.filter(sc => sc.organizationId === organizationId)
      : [];
    
    // If user is a doctor, filter by assigned senior citizens using doctor's assignedSeniorIds
    if (role === 'doctor') {
      const doctorId = this.getCurrentUserEntityId();
      if (doctorId) {
        // Filter by assignment AND organization (check if senior citizen is assigned to this doctor)
        return seniorCitizensInOrganization.filter(sc => 
          sc.assignedDoctorId === doctorId && 
          sc.organizationId === organizationId
        );
      }
      return []; // No doctorId found, return empty array
    }
    
    // If user is a caregiver, filter by assigned senior citizens using caregiver's assignedSeniorIds
    if (role === 'caregiver') {
      const caregiverId = this.getCurrentUserEntityId();
      if (caregiverId) {
        // Filter by assignment AND organization (check if senior citizen is assigned to this caregiver)
        return seniorCitizensInOrganization.filter(sc => 
          sc.assignedCaregiverId === caregiverId && 
          sc.organizationId === organizationId
        );
      }
      return []; // No caregiverId found, return empty array
    }
    
    // For admin or other roles, show all senior citizens in the organization
    return seniorCitizensInOrganization;
  });

  // Current user ID signal (userId del usuario actual)
  // Se establece cuando se llama a loadOrganizationData(userId)
  private readonly currentUserIdSignal = signal<number | null>(null);
  readonly currentUserId = this.currentUserIdSignal.asReadonly();
  
  // Current organization ID signal (organizationId del usuario actual)
  // Se establece cuando se llama a loadOrganizationData(userId)
  private readonly currentOrganizationIdSignal = signal<number | null>(null);
  readonly currentOrganizationId = this.currentOrganizationIdSignal.asReadonly();

  // Current organization entity signal
  private readonly currentOrganizationSignal = signal<Organization | null>(null);
  readonly currentOrganization = this.currentOrganizationSignal.asReadonly();

  // Loading and error states
  private readonly loadingSignal = signal<boolean>(false);
  readonly loading = this.loadingSignal.asReadonly();
  private readonly errorSignal = signal<string | null>(null);
  readonly error = this.errorSignal.asReadonly();

  constructor(
    private organizationApi: OrganizationApi
  ) {
  }

  /**
   * Loads all data for an organization by userId.
   * Busca el usuario por su ID y obtiene su organizationId para cargar los datos.
   * @param userId - The user ID. Uses default if not provided.
   */
  loadOrganizationData(userId?: number): void {
    if (!userId) {
      userId = 1; // Default
    }

    // 1. BUSCAR USUARIO POR SU ID
    const user = this.USERS.find(u => u.id === userId);
    if (!user) {
      console.error(`❌ User with id ${userId} not found`);
      return;
    }

    // 2. OBTENER organizationId SEGÚN EL ROL DEL USUARIO
    let organizationId: number = 0;

    if (user.role === 'admin') {
      // Para admin: buscar en Admins por userId
      const admin = this.ADMINS.find(a => a.userId === userId.toString());
      if (admin) {
        organizationId = admin.organizationId;
      } else {
        console.error(`❌ Admin with userId ${userId} not found`);
        return;
      }
    } else if (user.role === 'doctor') {
      // Para doctor: buscar en Doctors (se carga desde API)
      // Por ahora usamos un mapeo temporal, pero en producción se obtendría de la API
      // En producción: buscar doctor por userId en la API -> obtener organizationId
      // Por ahora asumimos que doctor con userId 3 pertenece a organizationId 1
      organizationId = 1; // Clínica Ortega
    } else if (user.role === 'caregiver') {
      // Para caregiver: buscar en Caregivers (se carga desde API)
      // Por ahora usamos un mapeo temporal
      // En producción: buscar caregiver por userId en la API -> obtener organizationId
      // Por ahora asumimos que caregiver con userId 4 pertenece a organizationId 2
      organizationId = 2; // Casa de Reposo San Juan
    }

    if (organizationId === 0) {
      console.error(`❌ Could not determine organizationId for user ${userId} with role ${user.role}`);
      return;
    }

    // 3. ESTABLECER EL userId Y organizationId ACTUAL EN EL STORE
    this.currentUserIdSignal.set(user.id);
    this.currentOrganizationIdSignal.set(organizationId);

    console.log(`✅ Loading organization data for ${user.email} (userId: ${user.id}, organizationId: ${organizationId}, role: ${user.role})`);

    // 4. CARGAR TODOS LOS DATOS DE LA ORGANIZACIÓN usando organizationId
    // Note: Assignments are included in the entities (assignedSeniorIds for doctors/caregivers, assignedDoctorId/assignedCaregiverId for senior citizens - single assignment only)
    this.loadOrganizationById(organizationId);
    this.loadDoctorsByOrganization(organizationId);
    this.loadCaregiversByOrganization(organizationId);
    this.loadSeniorCitizensByOrganization(organizationId);
  }

  /**
   * Gets the organization ID for a given user ID.
   * Busca el organizationId según el rol del usuario:
   * - admin: busca en Admins por userId
   * - doctor: busca en Doctors por userId (desde API)
   * - caregiver: busca en Caregivers por userId (desde API)
   * @param userId - The user ID
   * @returns The organization ID of that user. Returns 0 if user not found.
   */
  getOrganizationIdByUserId(userId: number): number {
    const user = this.USERS.find(u => u.id === userId);
    if (!user) {
      return 0;
    }

    if (user.role === 'admin') {
      const admin = this.ADMINS.find(a => a.userId === userId.toString());
      return admin ? admin.organizationId : 0;
    } else if (user.role === 'doctor') {
      // En producción: buscar doctor por userId en la API
      // Por ahora retornamos 1 (Clínica Ortega)
      return 1;
    } else if (user.role === 'caregiver') {
      // En producción: buscar caregiver por userId en la API
      // Por ahora retornamos 2 (Casa de Reposo San Juan)
      return 2;
    }

    return 0;
  }

  /**
   * Gets the current user's organization ID.
   * Usa el organizationId establecido cuando se llamó a loadOrganizationData(userId).
   * @returns The organization ID. Returns 0 if no organizationId is set.
   */
  getCurrentOrganizationId(): number {
    const currentOrganizationId = this.currentOrganizationIdSignal();
    if (currentOrganizationId === null) {
      // Si no hay organizationId establecido, retornar 0 (indica que no se ha cargado ningún usuario)
      return 0;
    }
    return currentOrganizationId;
  }

  /**
   * Gets the current user's institution email domain.
   * Obtiene el dominio de la organización basándose en el organizationId.
   * @returns The institution email domain. Returns empty string if no userId is set or no domain found.
   */
  getInstitutionEmailDomain(): string {
    const organizationId = this.getCurrentOrganizationId();
    if (organizationId === 0) {
      return '';
    }
    
    const organization = this.ORGANIZATIONS.find(o => o.id === organizationId);
    if (!organization) {
      return '';
    }
    
    // Generar dominio basado en el nombre de la organización
    // Ej: "Clínica Ortega" -> "@clinicaortega.com"
    const domain = organization.name
      .toLowerCase()
      .replace(/\s+/g, '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, ''); // Remover acentos
    
    return `@${domain}.com`;
  }

  /**
   * Gets the current user's institution name.
   * @returns The institution name. Returns empty string if no userId is set.
   */
  getInstitutionName(): string {
    const organizationId = this.getCurrentOrganizationId();
    if (organizationId === 0) {
      return '';
    }
    
    const organization = this.ORGANIZATIONS.find(o => o.id === organizationId);
    return organization ? organization.name : '';
  }

  /**
   * Gets the current user's role.
   * Usa el userId establecido cuando se llamó a loadOrganizationData(userId).
   * @returns The role of the current user. Returns empty string if no userId is set.
   */
  getCurrentUserRole(): string {
    const currentUserId = this.currentUserIdSignal();
    if (currentUserId === null) {
      return '';
    }
    
    const user = this.USERS.find(u => u.id === currentUserId);
    return user ? user.role : '';
  }

  /**
   * Gets the current user's role for a specific userId (helper method para el layout).
   * @param userId - The user ID
   * @returns The role of the user
   */
  getUserRoleByUserId(userId: number): string {
    const user = this.USERS.find(u => u.id === userId);
    return user ? user.role : '';
  }

  /**
   * Gets the entity ID of the current user (e.g., doctorId when role is 'doctor').
   * Para doctor: busca en Doctors por userId -> doctorId
   * Para caregiver: busca en Caregivers por userId -> caregiverId
   * Para admin: retorna null (no tiene entityId)
   * @returns The entity ID (doctorId, caregiverId, etc.) or null if not applicable.
   */
  getCurrentUserEntityId(): number | null {
    const currentUserId = this.currentUserIdSignal();
    if (currentUserId === null) {
      return null;
    }
    
    const user = this.USERS.find(u => u.id === currentUserId);
    if (!user) {
      return null;
    }

    if (user.role === 'doctor') {
      // Buscar doctor por userId en los doctores cargados
      const doctor = this.doctors().find(d => d.userId === currentUserId.toString());
      return doctor ? doctor.id : null;
    } else if (user.role === 'caregiver') {
      // Buscar caregiver por userId en los caregivers cargados
      const caregiver = this.caregivers().find(c => c.userId === currentUserId.toString());
      return caregiver ? caregiver.id : null;
    }

    // Admin no tiene entityId
    return null;
  }

  /**
   * Gets the current organization type.
   * @returns The organization type ('clinica' | 'resident') or null if not loaded.
   */
  getCurrentOrganizationType(): 'clinica' | 'resident' | null {
    const organization = this.currentOrganizationSignal();
    return organization ? organization.type : null;
  }

  /**
   * Loads an organization by its ID.
   * @param organizationId - The organization ID to load.
   */
  loadOrganizationById(organizationId: number): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    console.log('[OrganizationStore] Loading organization for organizationId:', organizationId);
    this.organizationApi.getOrganizationById(organizationId).pipe(take(1)).subscribe({
      next: organization => {
        console.log('[OrganizationStore] Loaded organization:', organization);
        this.currentOrganizationSignal.set(organization);
        this.loadingSignal.set(false);
      },
      error: err => {
        console.error(`[Store] Error loading organization for organizationId ${organizationId}:`, err);
        this.errorSignal.set(this.formatError(err, 'Failed to load organization'));
        this.loadingSignal.set(false);
        // Set a default organization based on organizationId if API fails
        // This is a fallback for development/testing
        const defaultOrg = organizationId === 1 
          ? new Organization({ id: 1, name: 'Clínica Ortega', type: 'clinica' })
          : new Organization({ id: 2, name: 'Casa de Reposo San Juan', type: 'resident' });
        this.currentOrganizationSignal.set(defaultOrg);
      }
    });
  }

  /**
   * Retrieves a doctor by its ID as a signal.
   * Optionally validates that the doctor belongs to the specified organization.
   * @param id - The ID of the doctor.
   * @param organizationId - Optional organization ID for validation.
   * @returns A Signal containing the Doctor object or undefined if not found or doesn't match organization.
   */
  getDoctorById(id: number | null | undefined, organizationId?: number): Signal<Doctor | undefined> {
    return computed(() => {
      if (!id) return undefined;
      const doctor = this.doctors().find(d => d.id === id);
      if (!doctor) return undefined;
      
      // Validate organizationId if provided
      if (organizationId !== undefined && doctor.organizationId !== organizationId) {
        return undefined;
      }
      
      return doctor;
    });
  }


  /**
   * Retrieves a caregiver by its ID as a signal.
   * Optionally validates that the caregiver belongs to the specified organization.
   * @param id - The ID of the caregiver.
   * @param organizationId - Optional organization ID for validation.
   * @returns A Signal containing the Caregiver object or undefined if not found or doesn't match organization.
   */
  getCaregiverById(id: number | null | undefined, organizationId?: number): Signal<Caregiver | undefined> {
    return computed(() => {
      if (!id) return undefined;
      const caregiver = this.caregivers().find(k => k.id === id);
      if (!caregiver) return undefined;
      
      // Validate organizationId if provided
      if (organizationId !== undefined && caregiver.organizationId !== organizationId) {
        return undefined;
      }
      
      return caregiver;
    });
  }

  /**
   * Retrieves a senior citizen by its ID as a signal.
   * Optionally validates that the senior citizen belongs to the specified organization.
   * @param id - The ID of the senior citizen.
   * @param organizationId - Optional organization ID for validation.
   * @returns A Signal containing the SeniorCitizen object or undefined if not found or doesn't match organization.
   */
  getSeniorCitizenById(id: number | null | undefined, organizationId?: number): Signal<SeniorCitizen | undefined> {
    return computed(() => {
      if (!id) return undefined;
      const seniorCitizen = this.seniorCitizens().find(sc => sc.id === id);
      if (!seniorCitizen) return undefined;
      
      // Validate organizationId if provided
      if (organizationId !== undefined && seniorCitizen.organizationId !== organizationId) {
        return undefined;
      }
      
      return seniorCitizen;
    });
  }

  /**
   * Gets senior citizens assigned to a specific doctor using doctor's assignedSeniorIds.
   * Only returns senior citizens from the same organization as the doctor.
   * @param doctorId - The ID of the doctor.
   * @param organizationId - Optional organization ID for validation.
   * @returns A Signal containing an array of senior citizens assigned to the doctor.
   */
  getSeniorCitizensByDoctorId(doctorId: number | null | undefined, organizationId?: number): Signal<SeniorCitizen[]> {
    return computed(() => {
      if (!doctorId) return [];
      const doctor = this.doctors().find(d => d.id === doctorId);
      if (!doctor) return [];
      
      // Validate doctor belongs to organization if provided
      if (organizationId && doctor.organizationId !== organizationId) {
        return [];
      }
      
      // Filter senior citizens by doctor's assignedSeniorIds and same organizationId
      return this.seniorCitizens().filter(seniorCitizen => 
        doctor.assignedSeniorIds.includes(seniorCitizen.id) && 
        seniorCitizen.organizationId === doctor.organizationId
      );
    });
  }


  /**
   * Loads and selects a senior citizen by ID.
   * @param seniorCitizenId - The senior citizen ID to load
   */
  loadSeniorCitizenById(seniorCitizenId: number): void {
    const seniorCitizen = this.seniorCitizens().find(sc => sc.id === seniorCitizenId);
    if (seniorCitizen) {
      console.log(`✅ Senior Citizen loaded: ${seniorCitizen.fullName} (id: ${seniorCitizen.id})`);
      this.selectedSeniorCitizenSignal.set(seniorCitizen);
    } else {
      console.error(`❌ Senior Citizen with id ${seniorCitizenId} not found`);
      this.selectedSeniorCitizenSignal.set(null);
    }
  }

  /**
   * Gets senior citizens assigned to a specific caregiver using caregiver's assignedSeniorIds.
   * Only returns senior citizens from the same organization as the caregiver.
   * @param caregiverId - The ID of the caregiver.
   * @param organizationId - Optional organization ID for validation.
   * @returns A Signal containing an array of senior citizens assigned to the caregiver.
   */
  getSeniorCitizensByCaregiverId(caregiverId: number | null | undefined, organizationId?: number): Signal<SeniorCitizen[]> {
    return computed(() => {
      if (!caregiverId) return [];
      const caregiver = this.caregivers().find(k => k.id === caregiverId);
      if (!caregiver) return [];
      
      // Validate caregiver belongs to organization if provided
      if (organizationId && caregiver.organizationId !== organizationId) {
        return [];
      }
      
      // Filter senior citizens by caregiver's assignedSeniorIds and same organizationId
      return this.seniorCitizens().filter(sc => 
        caregiver.assignedSeniorIds.includes(sc.id) && 
        sc.organizationId === caregiver.organizationId
      );
    });
  }

  /**
   * Adds a new doctor.
   * @param doctor - The doctor to add.
   */
  addDoctor(doctor: Doctor): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.organizationApi.createDoctor(doctor).pipe(retry(2)).subscribe({
      next: createdDoctor => {
        this.doctorsSignal.update(doctors => [...doctors, createdDoctor]);
        this.loadingSignal.set(false);
      },
      error: err => {
        this.errorSignal.set(this.formatError(err, 'Failed to create doctor'));
        this.loadingSignal.set(false);
      }
    });
  }

  /**
   * Updates an existing doctor.
   * @param updatedDoctor - The doctor to update.
   */
  updateDoctor(updatedDoctor: Doctor): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.organizationApi.updateDoctor(updatedDoctor).pipe(retry(2)).subscribe({
      next: doctor => {
        this.doctorsSignal.update(doctors =>
          doctors.map(d => d.id === doctor.id ? doctor : d)
        );
        this.loadingSignal.set(false);
      },
      error: err => {
        this.errorSignal.set(this.formatError(err, 'Failed to update doctor'));
        this.loadingSignal.set(false);
      }
    });
  }

  /**
   * Deletes a doctor by ID.
   * @param id - The ID of the doctor to delete.
   */
  deleteDoctor(id: number): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.organizationApi.deleteDoctor(id).pipe(retry(2)).subscribe({
      next: () => {
        this.doctorsSignal.update(doctors => doctors.filter(d => d.id !== id));
        // Remove this doctor's ID from all senior citizens' assignedDoctorId
        this.seniorCitizensSignal.update(seniorCitizens =>
          seniorCitizens.map(sc => {
            if (sc.assignedDoctorId === id) {
              sc.assignedDoctorId = null;
            }
            return sc;
          })
        );
        this.loadingSignal.set(false);
      },
      error: err => {
        this.errorSignal.set(this.formatError(err, 'Failed to delete doctor'));
        this.loadingSignal.set(false);
      }
    });
  }


  /**
   * Assigns a senior citizen to a doctor using domain logic.
   * Validates that both belong to the same organization.
   * Validates that the senior citizen is not already assigned to any caregiver (exclusión mutua).
   * If the senior citizen is already assigned to another doctor, it will be reassigned to the new doctor.
   * @param doctorId - The ID of the doctor.
   * @param seniorCitizenId - The ID of the senior citizen.
   * @throws Error if doctor or senior citizen don't belong to the same organization.
   * @throws Error if senior citizen is already assigned to a caregiver.
   */
  assignSeniorCitizenToDoctor(doctorId: number, seniorCitizenId: number): void {
    const doctor = this.doctors().find(d => d.id === doctorId);
    const seniorCitizen = this.seniorCitizens().find(sc => sc.id === seniorCitizenId);
    
    if (!doctor) {
      throw new Error(`Doctor with ID ${doctorId} not found`);
    }
    
    if (!seniorCitizen) {
      throw new Error(`Senior citizen with ID ${seniorCitizenId} not found`);
    }
    
    // Validate same organization
    if (doctor.organizationId !== seniorCitizen.organizationId) {
      throw new Error(
        `Cannot assign senior citizen to doctor: They belong to different organizations ` +
        `(Doctor: org ${doctor.organizationId}, Senior Citizen: org ${seniorCitizen.organizationId})`
      );
    }

    // Validate exclusión mutua: cannot be assigned to doctor if already assigned to caregiver
    if (!seniorCitizen.canBeAssignedToDoctor()) {
      throw new Error(
        `Cannot assign senior citizen to doctor: Senior citizen is already assigned to a caregiver. ` +
        `A senior citizen can only be assigned to doctors OR caregivers, not both.`
      );
    }

    // If senior citizen is already assigned to another doctor, unassign from the previous doctor
    const previousDoctorId = seniorCitizen.assignedDoctorId;
    if (previousDoctorId && previousDoctorId !== doctorId) {
      const previousDoctor = this.doctors().find(d => d.id === previousDoctorId);
      if (previousDoctor) {
        previousDoctor.unassignFromSenior(seniorCitizenId);
        this.doctorsSignal.update(doctors =>
          doctors.map(d => d.id === previousDoctorId ? previousDoctor : d)
        );
        // Persist unassignment of previous doctor
        this.organizationApi.updateDoctor(previousDoctor).pipe(retry(2)).subscribe({
          next: (updatedPreviousDoctor) => {
            this.doctorsSignal.update(doctors =>
              doctors.map(d => d.id === previousDoctorId ? updatedPreviousDoctor : d)
            );
          },
          error: err => console.error('Failed to persist previous doctor unassignment:', err)
        });
      }
    }

    // Use domain logic to assign
    doctor.assignToSenior(seniorCitizenId);
    seniorCitizen.assignedDoctorId = doctorId;

    // Update local state optimistically
    this.doctorsSignal.update(doctors =>
      doctors.map(d => d.id === doctorId ? doctor : d)
    );
    this.seniorCitizensSignal.update(seniorCitizens =>
      seniorCitizens.map(sc => sc.id === seniorCitizenId ? seniorCitizen : sc)
    );

    // Persist to API (backend will handle the junction table)
    this.organizationApi.updateDoctor(doctor).pipe(retry(2)).subscribe({
      next: (updatedDoctor) => {
        // Update with server response
        this.doctorsSignal.update(doctors =>
          doctors.map(d => d.id === doctorId ? updatedDoctor : d)
        );
      },
      error: err => {
        console.error('Failed to persist doctor assignment:', err);
        // Revert optimistic update
        doctor.unassignFromSenior(seniorCitizenId);
        seniorCitizen.assignedDoctorId = previousDoctorId;
        this.doctorsSignal.update(doctors =>
          doctors.map(d => d.id === doctorId ? doctor : d)
        );
        this.seniorCitizensSignal.update(seniorCitizens =>
          seniorCitizens.map(sc => sc.id === seniorCitizenId ? seniorCitizen : sc)
        );
      }
    });
  }

  /**
   * Unassigns a senior citizen from a doctor using domain logic.
   * Validates that both belong to the same organization.
   * @param doctorId - The ID of the doctor.
   * @param seniorCitizenId - The ID of the senior citizen.
   * @throws Error if doctor or senior citizen don't belong to the same organization.
   */
  unassignSeniorCitizenFromDoctor(doctorId: number, seniorCitizenId: number): void {
    const doctor = this.doctors().find(d => d.id === doctorId);
    const seniorCitizen = this.seniorCitizens().find(sc => sc.id === seniorCitizenId);
    
    if (!doctor) {
      throw new Error(`Doctor with ID ${doctorId} not found`);
    }
    
    if (!seniorCitizen) {
      throw new Error(`Senior citizen with ID ${seniorCitizenId} not found`);
    }
    
    if (doctor.organizationId !== seniorCitizen.organizationId) {
      throw new Error(
        `Cannot unassign senior citizen from doctor: They belong to different organizations ` +
        `(Doctor: org ${doctor.organizationId}, Senior Citizen: org ${seniorCitizen.organizationId})`
      );
    }

    // Use domain logic to unassign
    doctor.unassignFromSenior(seniorCitizenId);
    seniorCitizen.assignedDoctorId = null;

    // Update local state optimistically
    this.doctorsSignal.update(doctors =>
      doctors.map(d => d.id === doctorId ? doctor : d)
    );
    this.seniorCitizensSignal.update(seniorCitizens =>
      seniorCitizens.map(sc => sc.id === seniorCitizenId ? seniorCitizen : sc)
    );

    // Persist to API (backend will handle the junction table)
    this.organizationApi.updateDoctor(doctor).pipe(retry(2)).subscribe({
      next: (updatedDoctor) => {
        // Update with server response
        this.doctorsSignal.update(doctors =>
          doctors.map(d => d.id === doctorId ? updatedDoctor : d)
        );
      },
      error: err => {
        console.error('Failed to persist doctor unassignment:', err);
        // Revert optimistic update
        doctor.assignToSenior(seniorCitizenId);
        seniorCitizen.assignedDoctorId = doctorId;
        this.doctorsSignal.update(doctors =>
          doctors.map(d => d.id === doctorId ? doctor : d)
        );
        this.seniorCitizensSignal.update(seniorCitizens =>
          seniorCitizens.map(sc => sc.id === seniorCitizenId ? seniorCitizen : sc)
        );
      }
    });
  }

  /**
   * Assigns a senior citizen to a caregiver using domain logic.
   * Validates that both belong to the same organization.
   * Validates that the senior citizen is not already assigned to any doctor (exclusión mutua).
   * If the senior citizen is already assigned to another caregiver, it will be reassigned to the new caregiver.
   * @param caregiverId - The ID of the caregiver.
   * @param seniorCitizenId - The ID of the senior citizen.
   * @throws Error if caregiver or senior citizen don't belong to the same organization.
   * @throws Error if senior citizen is already assigned to a doctor.
   */
  assignSeniorCitizenToCaregiver(caregiverId: number, seniorCitizenId: number): void {
    const caregiver = this.caregivers().find(k => k.id === caregiverId);
    const seniorCitizen = this.seniorCitizens().find(sc => sc.id === seniorCitizenId);
    
    if (!caregiver) {
      throw new Error(`Caregiver with ID ${caregiverId} not found`);
    }
    
    if (!seniorCitizen) {
      throw new Error(`Senior citizen with ID ${seniorCitizenId} not found`);
    }
    
    // Validate same organization
    if (caregiver.organizationId !== seniorCitizen.organizationId) {
      throw new Error(
        `Cannot assign senior citizen to caregiver: They belong to different organizations ` +
        `(Caregiver: org ${caregiver.organizationId}, Senior Citizen: org ${seniorCitizen.organizationId})`
      );
    }

    // Validate exclusión mutua: cannot be assigned to caregiver if already assigned to doctor
    if (!seniorCitizen.canBeAssignedToCaregiver()) {
      throw new Error(
        `Cannot assign senior citizen to caregiver: Senior citizen is already assigned to a doctor. ` +
        `A senior citizen can only be assigned to doctors OR caregivers, not both.`
      );
    }

    // If senior citizen is already assigned to another caregiver, unassign from the previous caregiver
    const previousCaregiverId = seniorCitizen.assignedCaregiverId;
    if (previousCaregiverId && previousCaregiverId !== caregiverId) {
      const previousCaregiver = this.caregivers().find(c => c.id === previousCaregiverId);
      if (previousCaregiver) {
        previousCaregiver.unassignFromSenior(seniorCitizenId);
        this.caregiversSignal.update(caregivers =>
          caregivers.map(c => c.id === previousCaregiverId ? previousCaregiver : c)
        );
        // Persist unassignment of previous caregiver
        this.organizationApi.updateCaregiver(previousCaregiver).pipe(retry(2)).subscribe({
          next: (updatedPreviousCaregiver) => {
            this.caregiversSignal.update(caregivers =>
              caregivers.map(c => c.id === previousCaregiverId ? updatedPreviousCaregiver : c)
            );
          },
          error: err => console.error('Failed to persist previous caregiver unassignment:', err)
        });
      }
    }

    // Use domain logic to assign
    caregiver.assignToSenior(seniorCitizenId);
    seniorCitizen.assignedCaregiverId = caregiverId;

    // Update local state optimistically
    this.caregiversSignal.update(caregivers =>
      caregivers.map(c => c.id === caregiverId ? caregiver : c)
    );
    this.seniorCitizensSignal.update(seniorCitizens =>
      seniorCitizens.map(sc => sc.id === seniorCitizenId ? seniorCitizen : sc)
    );

    // Persist to API (backend will handle the junction table)
    this.organizationApi.updateCaregiver(caregiver).pipe(retry(2)).subscribe({
      next: (updatedCaregiver) => {
        // Update with server response
        this.caregiversSignal.update(caregivers =>
          caregivers.map(c => c.id === caregiverId ? updatedCaregiver : c)
        );
      },
      error: err => {
        console.error('Failed to persist caregiver assignment:', err);
        // Revert optimistic update
        caregiver.unassignFromSenior(seniorCitizenId);
        seniorCitizen.assignedCaregiverId = previousCaregiverId;
        this.caregiversSignal.update(caregivers =>
          caregivers.map(c => c.id === caregiverId ? caregiver : c)
        );
        this.seniorCitizensSignal.update(seniorCitizens =>
          seniorCitizens.map(sc => sc.id === seniorCitizenId ? seniorCitizen : sc)
        );
      }
    });
  }

  /**
   * Unassigns a senior citizen from a caregiver using domain logic.
   * Validates that both belong to the same organization.
   * Similar implementation to unassignSeniorCitizenFromDoctor for consistency.
   * @param caregiverId - The ID of the caregiver.
   * @param seniorCitizenId - The ID of the senior citizen.
   * @throws Error if caregiver or senior citizen don't belong to the same organization.
   */
  unassignSeniorCitizenFromCaregiver(caregiverId: number, seniorCitizenId: number): void {
    const caregiver = this.caregivers().find(k => k.id === caregiverId);
    const seniorCitizen = this.seniorCitizens().find(sc => sc.id === seniorCitizenId);
    
    if (!caregiver) {
      throw new Error(`Caregiver with ID ${caregiverId} not found`);
    }
    
    if (!seniorCitizen) {
      throw new Error(`Senior citizen with ID ${seniorCitizenId} not found`);
    }
    
    if (caregiver.organizationId !== seniorCitizen.organizationId) {
      throw new Error(
        `Cannot unassign senior citizen from caregiver: They belong to different organizations ` +
        `(Caregiver: org ${caregiver.organizationId}, Senior Citizen: org ${seniorCitizen.organizationId})`
      );
    }

    // Use domain logic to unassign
    caregiver.unassignFromSenior(seniorCitizenId);
    seniorCitizen.assignedCaregiverId = null;

    // Update local state optimistically
    this.caregiversSignal.update(caregivers =>
      caregivers.map(c => c.id === caregiverId ? caregiver : c)
    );
    this.seniorCitizensSignal.update(seniorCitizens =>
      seniorCitizens.map(sc => sc.id === seniorCitizenId ? seniorCitizen : sc)
    );

    // Persist to API (backend will handle the junction table)
    this.organizationApi.updateCaregiver(caregiver).pipe(retry(2)).subscribe({
      next: (updatedCaregiver) => {
        // Update with server response
        this.caregiversSignal.update(caregivers =>
          caregivers.map(c => c.id === caregiverId ? updatedCaregiver : c)
        );
      },
      error: err => {
        console.error('Failed to persist caregiver unassignment:', err);
        // Revert optimistic update
        caregiver.assignToSenior(seniorCitizenId);
        seniorCitizen.assignedCaregiverId = caregiverId;
        this.caregiversSignal.update(caregivers =>
          caregivers.map(c => c.id === caregiverId ? caregiver : c)
        );
        this.seniorCitizensSignal.update(seniorCitizens =>
          seniorCitizens.map(sc => sc.id === seniorCitizenId ? seniorCitizen : sc)
        );
      }
    });
  }


  /**
   * Adds a new caregiver.
   * @param caregiver - The caregiver to add.
   */
  addCaregiver(caregiver: Caregiver): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.organizationApi.createCaregiver(caregiver).pipe(retry(2)).subscribe({
      next: createdCaregiver => {
        this.caregiversSignal.update(caregivers => [...caregivers, createdCaregiver]);
        this.loadingSignal.set(false);
      },
      error: err => {
        this.errorSignal.set(this.formatError(err, 'Failed to create caregiver'));
        this.loadingSignal.set(false);
      }
    });
  }

  /**
   * Updates an existing caregiver.
   * @param updatedCaregiver - The caregiver to update.
   */
  updateCaregiver(updatedCaregiver: Caregiver): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.organizationApi.updateCaregiver(updatedCaregiver).pipe(retry(2)).subscribe({
      next: caregiver => {
        this.caregiversSignal.update(caregivers =>
          caregivers.map(k => k.id === caregiver.id ? caregiver : k)
        );
        this.loadingSignal.set(false);
      },
      error: err => {
        this.errorSignal.set(this.formatError(err, 'Failed to update caregiver'));
        this.loadingSignal.set(false);
      }
    });
  }

  /**
   * Deletes a caregiver by ID.
   * @param id - The ID of the caregiver to delete.
   */
  deleteCaregiver(id: number): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.organizationApi.deleteCaregiver(id).pipe(retry(2)).subscribe({
      next: () => {
        this.caregiversSignal.update(caregivers => caregivers.filter(k => k.id !== id));
        // Remove this caregiver's ID from all senior citizens' assignedCaregiverId
        this.seniorCitizensSignal.update(seniorCitizens =>
          seniorCitizens.map(sc => {
            if (sc.assignedCaregiverId === id) {
              sc.assignedCaregiverId = null;
            }
            return sc;
          })
        );
        this.loadingSignal.set(false);
      },
      error: err => {
        this.errorSignal.set(this.formatError(err, 'Failed to delete caregiver'));
        this.loadingSignal.set(false);
      }
    });
  }


  /**
   * Adds a new senior citizen.
   * Validates that the senior citizen belongs to the current organization.
   * @param seniorCitizen - The senior citizen to add.
   * @throws Error if senior citizen doesn't belong to the current organization.
   */
  addSeniorCitizen(seniorCitizen: SeniorCitizen): void {
    const currentOrganizationId = this.getCurrentOrganizationId();
    
    // Validate organizationId matches current organization
    if (currentOrganizationId === 0) {
      throw new Error('Cannot create senior citizen: No organization context available');
    }
    
    if (seniorCitizen.organizationId !== currentOrganizationId) {
      throw new Error(
        `Cannot create senior citizen: organizationId mismatch. ` +
        `Expected ${currentOrganizationId}, got ${seniorCitizen.organizationId}. ` +
        `A senior citizen can only be created for the current organization.`
      );
    }
    
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.organizationApi.createSeniorCitizen(seniorCitizen).pipe(retry(2)).subscribe({
      next: createdSeniorCitizen => {
        // Validate that the created senior citizen belongs to the current organization
        if (createdSeniorCitizen.organizationId === currentOrganizationId) {
          this.seniorCitizensSignal.update(seniorCitizens => [...seniorCitizens, createdSeniorCitizen]);
        } else {
          console.warn(
            `⚠️ Created senior citizen has different organizationId (${createdSeniorCitizen.organizationId}) ` +
            `than current (${currentOrganizationId}). Not adding to list.`
          );
        }
        this.loadingSignal.set(false);
      },
      error: err => {
        this.errorSignal.set(this.formatError(err, 'Failed to create senior citizen'));
        this.loadingSignal.set(false);
      }
    });
  }

  /**
   * Updates an existing senior citizen.
   * Validates that the senior citizen belongs to the current organization and prevents organizationId changes.
   * @param updatedSeniorCitizen - The senior citizen to update.
   * @throws Error if senior citizen doesn't belong to the current organization or organizationId is changed.
   */
  updateSeniorCitizen(updatedSeniorCitizen: SeniorCitizen): void {
    const currentOrganizationId = this.getCurrentOrganizationId();
    
    // Validate organizationId matches current organization
    if (currentOrganizationId === 0) {
      throw new Error('Cannot update senior citizen: No organization context available');
    }
    
    if (updatedSeniorCitizen.organizationId !== currentOrganizationId) {
      throw new Error(
        `Cannot update senior citizen: organizationId mismatch. ` +
        `Expected ${currentOrganizationId}, got ${updatedSeniorCitizen.organizationId}. ` +
        `A senior citizen can only be updated within its organization.`
      );
    }
    
    // Find existing senior citizen to ensure organizationId doesn't change
    const existingSeniorCitizen = this.seniorCitizens().find(sc => sc.id === updatedSeniorCitizen.id);
    if (existingSeniorCitizen && existingSeniorCitizen.organizationId !== updatedSeniorCitizen.organizationId) {
      throw new Error(
        `Cannot update senior citizen: Cannot change organizationId. ` +
        `Original: ${existingSeniorCitizen.organizationId}, Attempted: ${updatedSeniorCitizen.organizationId}. ` +
        `A senior citizen cannot be moved to a different organization.`
      );
    }
    
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.organizationApi.updateSeniorCitizen(updatedSeniorCitizen).pipe(retry(2)).subscribe({
      next: seniorCitizen => {
        // Validate that the updated senior citizen still belongs to the current organization
        if (seniorCitizen.organizationId === currentOrganizationId) {
          this.seniorCitizensSignal.update(seniorCitizens =>
            seniorCitizens.map(sc => sc.id === seniorCitizen.id ? seniorCitizen : sc)
          );
        } else {
          // If organizationId changed (shouldn't happen), remove from list
          console.warn(
            `⚠️ Updated senior citizen has different organizationId (${seniorCitizen.organizationId}) ` +
            `than current (${currentOrganizationId}). Removing from list.`
          );
          this.seniorCitizensSignal.update(seniorCitizens =>
            seniorCitizens.filter(sc => sc.id !== seniorCitizen.id)
          );
        }
        this.loadingSignal.set(false);
      },
      error: err => {
        this.errorSignal.set(this.formatError(err, 'Failed to update senior citizen'));
        this.loadingSignal.set(false);
      }
    });
  }

  /**
   * Deletes a senior citizen by ID.
   * @param id - The ID of the senior citizen to delete.
   */
  deleteSeniorCitizen(id: number): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.organizationApi.deleteSeniorCitizen(id).pipe(retry(2)).subscribe({
      next: () => {
        this.seniorCitizensSignal.update(seniorCitizens => seniorCitizens.filter(sc => sc.id !== id));
        this.loadingSignal.set(false);
      },
      error: err => {
        this.errorSignal.set(this.formatError(err, 'Failed to delete senior citizen'));
        this.loadingSignal.set(false);
      }
    });
  }

  /**
   * Loads doctors by organization ID.
   * @param organizationId - The organization ID to filter doctors.
   */
  loadDoctorsByOrganization(organizationId: number): void {
    console.log(`📋 [Store] Loading doctors for organizationId: ${organizationId}`);
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.organizationApi.getDoctorsByOrganization(organizationId).pipe(take(1)).subscribe({
      next: doctors => {
        // Validate that all loaded doctors belong to the requested organization
        const invalidDoctors = doctors.filter(d => d.organizationId !== organizationId);
        if (invalidDoctors.length > 0) {
          console.warn(
            `⚠️ [Store] Found ${invalidDoctors.length} doctor(s) with different organizationId. ` +
            `Expected: ${organizationId}, Filtering them out.`
          );
        }
        
        // Filter to ensure only doctors from the requested organization are stored
        const validDoctors = doctors.filter(d => d.organizationId === organizationId);
        console.log(`✅ [Store] Loaded ${validDoctors.length} doctor(s) for organizationId: ${organizationId}`);
        
        this.doctorsSignal.set(validDoctors);
        
        // Recalculate assignments for senior citizens after loading doctors
        this.recalculateSeniorCitizenAssignments();
        
        this.loadingSignal.set(false);
      },
      error: err => {
        console.error(`❌ [Store] Error loading doctors for organizationId ${organizationId}:`, err);
        this.errorSignal.set(this.formatError(err, 'Failed to load doctors'));
        this.loadingSignal.set(false);
      }
    });
  }

  /**
   * Loads senior citizens by organization ID.
   * After loading, calculates assignedDoctorId and assignedCaregiverId from doctors and caregivers.
   * @param organizationId - The organization ID to filter senior citizens.
   */
  loadSeniorCitizensByOrganization(organizationId: number): void {
    console.log(`📋 [Store] Loading senior citizens for organizationId: ${organizationId}`);
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.organizationApi.getSeniorCitizensByOrganization(organizationId).pipe(take(1)).subscribe({
      next: seniorCitizens => {
        // Validate that all loaded senior citizens belong to the requested organization
        const invalidSeniorCitizens = seniorCitizens.filter(sc => sc.organizationId !== organizationId);
        if (invalidSeniorCitizens.length > 0) {
          console.warn(
            `⚠️ [Store] Found ${invalidSeniorCitizens.length} senior citizen(s) with different organizationId. ` +
            `Expected: ${organizationId}, Filtering them out.`
          );
        }
        
        // Filter to ensure only senior citizens from the requested organization are stored
        let validSeniorCitizens = seniorCitizens.filter(sc => sc.organizationId === organizationId);
        
        // Calculate assignedDoctorId and assignedCaregiverId from doctors and caregivers
        validSeniorCitizens = this.calculateAssignments(validSeniorCitizens);
        
        console.log(`✅ [Store] Loaded ${validSeniorCitizens.length} senior citizen(s) for organizationId: ${organizationId}`);
        
        this.seniorCitizensSignal.set(validSeniorCitizens);
        this.loadingSignal.set(false);
      },
      error: err => {
        console.error(`❌ [Store] Error loading senior citizens for organizationId ${organizationId}:`, err);
        this.errorSignal.set(this.formatError(err, 'Failed to load senior citizens'));
        this.loadingSignal.set(false);
      }
    });
  }

  /**
   * Calculates assignedDoctorId and assignedCaregiverId for senior citizens based on doctors and caregivers.
   * Since assignments are stored in doctors' and caregivers' assignedSeniorIds arrays,
   * we need to reverse-lookup to populate the senior citizens' assignedDoctorId and assignedCaregiverId.
   * @param seniorCitizens - Array of senior citizens to update
   * @returns Array of senior citizens with calculated assignments
   */
  private calculateAssignments(seniorCitizens: SeniorCitizen[]): SeniorCitizen[] {
    const doctors = this.doctors();
    const caregivers = this.caregivers();
    
    return seniorCitizens.map(sc => {
      // Find which doctor has this senior citizen in their assignedSeniorIds
      const assignedDoctor = doctors.find(d => d.assignedSeniorIds.includes(sc.id));
      const assignedDoctorId = assignedDoctor ? assignedDoctor.id : null;
      
      // Find which caregiver has this senior citizen in their assignedSeniorIds
      const assignedCaregiver = caregivers.find(c => c.assignedSeniorIds.includes(sc.id));
      const assignedCaregiverId = assignedCaregiver ? assignedCaregiver.id : null;
      
      // Update the senior citizen if assignments have changed
      if (sc.assignedDoctorId !== assignedDoctorId || sc.assignedCaregiverId !== assignedCaregiverId) {
        sc.assignedDoctorId = assignedDoctorId;
        sc.assignedCaregiverId = assignedCaregiverId;
      }
      
      return sc;
    });
  }

  /**
   * Recalculates assignments for all currently loaded senior citizens.
   * This should be called after loading doctors or caregivers to update senior citizen assignments.
   */
  private recalculateSeniorCitizenAssignments(): void {
    const currentSeniorCitizens = this.seniorCitizens();
    if (currentSeniorCitizens.length === 0) {
      return; // No senior citizens loaded yet
    }
    
    const updatedSeniorCitizens = this.calculateAssignments(currentSeniorCitizens);
    this.seniorCitizensSignal.set(updatedSeniorCitizens);
  }

  /**
   * Loads caregivers by organization ID.
   * This ensures multi-tenant isolation - only caregivers from the specified organization are loaded.
   * @param organizationId - The organization ID to filter caregivers.
   */
  loadCaregiversByOrganization(organizationId: number): void {
    console.log(`📋 [Store] Loading caregivers for organizationId: ${organizationId}`);
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.organizationApi.getCaregiversByOrganization(organizationId).pipe(take(1)).subscribe({
      next: caregivers => {
        // Validate that all loaded caregivers belong to the requested organization
        const invalidCaregivers = caregivers.filter(c => c.organizationId !== organizationId);
        if (invalidCaregivers.length > 0) {
          console.warn(
            `⚠️ [Store] Found ${invalidCaregivers.length} caregiver(s) with different organizationId. ` +
            `Expected: ${organizationId}, Filtering them out.`
          );
        }
        
        // Filter to ensure only caregivers from the requested organization are stored
        const validCaregivers = caregivers.filter(c => c.organizationId === organizationId);
        console.log(`✅ [Store] Loaded ${validCaregivers.length} caregiver(s) for organizationId: ${organizationId}`);
        
        this.caregiversSignal.set(validCaregivers);
        
        // Recalculate assignments for senior citizens after loading caregivers
        this.recalculateSeniorCitizenAssignments();
        
        this.loadingSignal.set(false);
      },
      error: err => {
        console.error(`❌ [Store] Error loading caregivers for organizationId ${organizationId}:`, err);
        this.errorSignal.set(this.formatError(err, 'Failed to load caregivers'));
        this.loadingSignal.set(false);
      }
    });
  }


  /**
   * Loads senior citizens by caregiver ID.
   * @param caregiverId - The caregiver ID to filter senior citizens.
   */
  loadSeniorCitizensByCaregiver(caregiverId: number): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.organizationApi.getSeniorCitizensByCaregiver(caregiverId).pipe(take(1)).subscribe({
      next: seniorCitizens => {
        this.seniorCitizensSignal.set(seniorCitizens);
        this.loadingSignal.set(false);
      },
      error: err => {
        this.errorSignal.set(this.formatError(err, 'Failed to load senior citizens by caregiver'));
        this.loadingSignal.set(false);
      }
    });
  }

  /**
   * Loads all doctors from the API.
   */
  loadDoctors(): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.organizationApi.getDoctors().pipe(take(1)).subscribe({
      next: doctors => {
        this.doctorsSignal.set(doctors);
        this.loadingSignal.set(false);
      },
      error: err => {
        this.errorSignal.set(this.formatError(err, 'Failed to load doctors'));
        this.loadingSignal.set(false);
      }
    });
  }


  /**
   * Loads all caregivers from the API.
   */
  loadCaregivers(): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.organizationApi.getCaregivers().pipe(take(1)).subscribe({
      next: caregivers => {
        this.caregiversSignal.set(caregivers);
        this.loadingSignal.set(false);
      },
      error: err => {
        this.errorSignal.set(this.formatError(err, 'Failed to load caregivers'));
        this.loadingSignal.set(false);
      }
    });
  }

  /**
   * Loads all senior citizens from the API.
   */
  loadSeniorCitizens(): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.organizationApi.getSeniorCitizens().pipe(take(1)).subscribe({
      next: seniorCitizens => {
        this.seniorCitizensSignal.set(seniorCitizens);
        this.loadingSignal.set(false);
      },
      error: err => {
        this.errorSignal.set(this.formatError(err, 'Failed to load senior citizens'));
        this.loadingSignal.set(false);
      }
    });
  }

  /**
   * Formats error messages for user-friendly display.
   * @param error - The error object.
   * @param fallback - The fallback error message.
   * @returns A formatted error message.
   */
  private formatError(error: any, fallback: string): string {
    if (error instanceof Error) {
      return error.message.includes('Resource not found') ? `${fallback}: Not found` : error.message;
    }
    return fallback;
  }
}

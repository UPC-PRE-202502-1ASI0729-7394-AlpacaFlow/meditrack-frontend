import { computed, Injectable, Signal, signal } from '@angular/core';
import { retry, filter, take } from 'rxjs';

import { Doctor } from '../domain/model/doctor.entity';
import { Patient } from '../domain/model/patient.entity';
import { Keeper } from '../domain/model/keeper.entity';
import { SeniorCitizen } from '../domain/model/senior-citizen.entity';
import { OrganizationApi } from '../infrastructure/organization-api';

/**
 * State management store for doctors and patients using Angular signals.
 */
@Injectable({
  providedIn: 'root'
})
export class OrganizationStore {
  // SIMULACIÓN: En la realidad hay UN SOLO usuario, pero por ahora simulamos dos escenarios
  // El userId y organizationId son campos distintos
  // El bounded context organization trabaja con el organizationId del usuario
  private USER_EXAMPLE_DATA_1 = {
    "id": 1,                    // userId (ID del usuario)
    "organizationId": 1,        // organizationId (ID de la organización a la que pertenece)
    "email": "organizacion1@gmail.com",
    "password": "org1123",
    "role": "admin-clinica",    // organizationId 1 = admin-clinica
    "institutionEmail": "admin@clinOrtega.com",
    "institutionName": "Clínica Ortega",
    "tin": "12345678901"
  };

  private USER_EXAMPLE_DATA_2 = {
    "id": 2,                    // userId (ID del usuario)
    "organizationId": 2,        // organizationId (ID de la organización a la que pertenece)
    "email": "organizacion2@gmail.com",
    "password": "org2123",
    "role": "admin-casa-reposo", // organizationId 2 = admin-casa-reposo
    "institutionEmail": "admin@casareposoSanJuan.com",
    "institutionName": "Casa de Reposo San Juan",
    "tin": "98765432109"
  };

  private USER_EXAMPLE_DATA_3 = {
    "id": 3,                    // userId (ID del usuario doctor)
    "organizationId": 1,        // organizationId (ID de la organización a la que pertenece)
    "email": "miguel.asda@clinOrtega.com",
    "password": "doctor123",    // Contraseña temporal establecida por el admin-clinica
    "role": "doctor",           // Rol de doctor
    "institutionEmail": "admin@clinOrtega.com",
    "institutionName": "Clínica Ortega",
    "tin": "12345678901",
    "entityId": 4,              // Referencia al doctor.id (opcional)
    "entityType": "doctor"      // Tipo de entidad asociada
  };

  private USER_EXAMPLE_DATA_4 = {
    "id": 4,                    // userId (ID del usuario keeper)
    "organizationId": 2,        // organizationId (ID de la organización a la que pertenece)
    "email": "adasd.ddd@casareposoSanJuan.com",
    "password": "keeper123",    // Contraseña temporal establecida por el admin-casa-reposo
    "role": "keeper",           // Rol de keeper
    "institutionEmail": "admin@casareposoSanJuan.com",
    "institutionName": "Casa de Reposo San Juan",
    "tin": "98765432109",
    "entityId": 2,              // Referencia al keeper.id (keeper con id 2 en db.json)
    "entityType": "keeper"      // Tipo de entidad asociada
  };

  


  // Doctor signals
  readonly doctorCount = computed(() => this.doctors().length);
  private readonly doctorsSignal = signal<Doctor[]>([]);
  readonly doctors = this.doctorsSignal.asReadonly();

  // Patient signals
  readonly patientCount = computed(() => this.patients().length);
  private readonly patientsSignal = signal<Patient[]>([]);
  readonly patients = this.patientsSignal.asReadonly();

  // Selected patient signal (for doctor viewing patient details)
  private readonly selectedPatientSignal = signal<Patient | null>(null);
  readonly selectedPatient = this.selectedPatientSignal.asReadonly();

  // Selected senior citizen signal (for keeper viewing senior citizen details)
  private readonly selectedSeniorCitizenSignal = signal<SeniorCitizen | null>(null);
  readonly selectedSeniorCitizen = this.selectedSeniorCitizenSignal.asReadonly();

  // Filtered patients based on user role (for doctors, only show assigned patients)
  readonly filteredPatients = computed(() => {
    const role = this.getCurrentUserRole();
    const allPatients = this.patients();
    
    // If user is a doctor, filter by assigned patients
    if (role === 'doctor') {
      const doctorId = this.getCurrentUserEntityId();
      if (doctorId) {
        return allPatients.filter(patient => patient.doctorId === doctorId);
      }
      return []; // No doctorId found, return empty array
    }
    
    // For admin-clinica or other roles, show all patients in the organization
    return allPatients;
  });

  // Keeper signals
  readonly keeperCount = computed(() => this.keepers().length);
  private readonly keepersSignal = signal<Keeper[]>([]);
  readonly keepers = this.keepersSignal.asReadonly();

  // Senior Citizen signals
  readonly seniorCitizenCount = computed(() => this.seniorCitizens().length);
  private readonly seniorCitizensSignal = signal<SeniorCitizen[]>([]);
  readonly seniorCitizens = this.seniorCitizensSignal.asReadonly();

  // Filtered senior citizens based on user role (for keepers, only show assigned senior citizens)
  readonly filteredSeniorCitizens = computed(() => {
    const role = this.getCurrentUserRole();
    const allSeniorCitizens = this.seniorCitizens();
    
    // If user is a keeper, filter by assigned senior citizens
    if (role === 'keeper') {
      const keeperId = this.getCurrentUserEntityId();
      if (keeperId) {
        return allSeniorCitizens.filter(seniorCitizen => seniorCitizen.keeperId === keeperId);
      }
      return []; // No keeperId found, return empty array
    }
    
    // For admin-casa-reposo or other roles, show all senior citizens in the organization
    return allSeniorCitizens;
  });

  // Assignment management
  private readonly assignmentsSignal = signal<Record<string, string[]>>({});
  readonly assignments = this.assignmentsSignal.asReadonly();

  // Current user ID signal (userId del usuario actual)
  // Se establece cuando se llama a loadOrganizationData(userId)
  private readonly currentUserIdSignal = signal<number | null>(null);
  readonly currentUserId = this.currentUserIdSignal.asReadonly();
  
  // Current organization ID signal (organizationId del usuario actual)
  // Se establece cuando se llama a loadOrganizationData(userId)
  private readonly currentOrganizationIdSignal = signal<number | null>(null);
  readonly currentOrganizationId = this.currentOrganizationIdSignal.asReadonly();

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
    // 1. BUSCAR USUARIO POR SU ID
    const user = userId === this.USER_EXAMPLE_DATA_1.id
      ? this.USER_EXAMPLE_DATA_1
      : userId === this.USER_EXAMPLE_DATA_2.id
        ? this.USER_EXAMPLE_DATA_2
        : userId === this.USER_EXAMPLE_DATA_3.id
          ? this.USER_EXAMPLE_DATA_3
          : userId === this.USER_EXAMPLE_DATA_4.id
            ? this.USER_EXAMPLE_DATA_4
            : this.USER_EXAMPLE_DATA_1; // por defecto

    // 2. ESTABLECER EL userId Y organizationId ACTUAL EN EL STORE
    this.currentUserIdSignal.set(user.id);
    this.currentOrganizationIdSignal.set(user.organizationId);

    // 3. USAR EL organizationId DEL USUARIO para cargar los datos
    const organizationId = user.organizationId;

    console.log(`✅ Loading organization data for ${user.email} (userId: ${user.id}, organizationId: ${organizationId}, role: ${user.role})`);

    // 4. CARGAR TODOS LOS DATOS DE LA ORGANIZACIÓN usando organizationId
    this.loadDoctorsByOrganization(organizationId);
    this.loadPatientsByOrganization(organizationId);
    this.loadKeepersByOrganization(organizationId);
    this.loadSeniorCitizensByOrganization(organizationId);
  }

  /**
   * Gets the organization ID for a given user ID.
   * @param userId - The user ID
   * @returns The organization ID of that user. Returns 0 if user not found.
   */
  getOrganizationIdByUserId(userId: number): number {
    // Buscar el usuario por su ID
    const user = userId === this.USER_EXAMPLE_DATA_1.id
      ? this.USER_EXAMPLE_DATA_1
      : userId === this.USER_EXAMPLE_DATA_2.id
        ? this.USER_EXAMPLE_DATA_2
        : userId === this.USER_EXAMPLE_DATA_3.id
          ? this.USER_EXAMPLE_DATA_3
          : userId === this.USER_EXAMPLE_DATA_4.id
            ? this.USER_EXAMPLE_DATA_4
            : null;
    
    if (!user) {
      return 0;
    }
    
    // Retornar el organizationId del usuario
    return user.organizationId;
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
   * Extrae el dominio del correo institucional (ej: '@clinOrtega.com').
   * @returns The institution email domain. Returns empty string if no userId is set or no domain found.
   */
  getInstitutionEmailDomain(): string {
    const currentUserId = this.currentUserIdSignal();
    if (currentUserId === null) {
      return '';
    }
    
    const user = currentUserId === this.USER_EXAMPLE_DATA_1.id ? this.USER_EXAMPLE_DATA_1 :
                 currentUserId === this.USER_EXAMPLE_DATA_2.id ? this.USER_EXAMPLE_DATA_2 :
                 currentUserId === this.USER_EXAMPLE_DATA_3.id ? this.USER_EXAMPLE_DATA_3 :
                 currentUserId === this.USER_EXAMPLE_DATA_4.id ? this.USER_EXAMPLE_DATA_4 :
                 null;
    
    if (!user || !user.institutionEmail) {
      return '';
    }
    
    // Extraer el dominio del correo (ej: 'admin@clinOrtega.com' -> '@clinOrtega.com')
    const emailParts = user.institutionEmail.split('@');
    if (emailParts.length === 2) {
      return `@${emailParts[1]}`;
    }
    
    return '';
  }

  /**
   * Gets the current user's institution name.
   * @returns The institution name. Returns empty string if no userId is set.
   */
  getInstitutionName(): string {
    const currentUserId = this.currentUserIdSignal();
    if (currentUserId === null) {
      return '';
    }
    
    const user = currentUserId === this.USER_EXAMPLE_DATA_1.id ? this.USER_EXAMPLE_DATA_1 :
                 currentUserId === this.USER_EXAMPLE_DATA_2.id ? this.USER_EXAMPLE_DATA_2 :
                 currentUserId === this.USER_EXAMPLE_DATA_3.id ? this.USER_EXAMPLE_DATA_3 :
                 currentUserId === this.USER_EXAMPLE_DATA_4.id ? this.USER_EXAMPLE_DATA_4 :
                 null;
    
    return user?.institutionName || '';
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
    
    const user = currentUserId === this.USER_EXAMPLE_DATA_1.id
      ? this.USER_EXAMPLE_DATA_1
      : currentUserId === this.USER_EXAMPLE_DATA_2.id
        ? this.USER_EXAMPLE_DATA_2
        : currentUserId === this.USER_EXAMPLE_DATA_3.id
          ? this.USER_EXAMPLE_DATA_3
          : currentUserId === this.USER_EXAMPLE_DATA_4.id
            ? this.USER_EXAMPLE_DATA_4
            : this.USER_EXAMPLE_DATA_1;
    
    return user.role;
  }

  /**
   * Gets the current user's role for a specific userId (helper method para el layout).
   * @param userId - The user ID
   * @returns The role of the user
   */
  getUserRoleByUserId(userId: number): string {
    const user = userId === this.USER_EXAMPLE_DATA_1.id
      ? this.USER_EXAMPLE_DATA_1
      : userId === this.USER_EXAMPLE_DATA_2.id
        ? this.USER_EXAMPLE_DATA_2
        : userId === this.USER_EXAMPLE_DATA_3.id
          ? this.USER_EXAMPLE_DATA_3
          : userId === this.USER_EXAMPLE_DATA_4.id
            ? this.USER_EXAMPLE_DATA_4
            : this.USER_EXAMPLE_DATA_1;
    
    return user.role;
  }

  /**
   * Gets the entity ID of the current user (e.g., doctorId when role is 'doctor').
   * @returns The entity ID (doctorId, keeperId, etc.) or null if not applicable.
   */
  getCurrentUserEntityId(): number | null {
    const currentUserId = this.currentUserIdSignal();
    if (currentUserId === null) {
      return null;
    }
    
    const user = currentUserId === this.USER_EXAMPLE_DATA_1.id ? this.USER_EXAMPLE_DATA_1 :
                 currentUserId === this.USER_EXAMPLE_DATA_2.id ? this.USER_EXAMPLE_DATA_2 :
                 currentUserId === this.USER_EXAMPLE_DATA_3.id ? this.USER_EXAMPLE_DATA_3 :
                 currentUserId === this.USER_EXAMPLE_DATA_4.id ? this.USER_EXAMPLE_DATA_4 :
                 null;
    
    // @ts-ignore - entityId puede existir en algunos usuarios
    return user?.entityId || null;
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
   * Retrieves a patient by its ID as a signal.
   * Optionally validates that the patient belongs to the specified organization.
   * @param id - The ID of the patient.
   * @param organizationId - Optional organization ID for validation.
   * @returns A Signal containing the Patient object or undefined if not found or doesn't match organization.
   */
  getPatientById(id: number | null | undefined, organizationId?: number): Signal<Patient | undefined> {
    return computed(() => {
      if (!id) return undefined;
      const patient = this.patients().find(p => p.id === id);
      if (!patient) return undefined;
      
      // Validate organizationId if provided
      if (organizationId !== undefined && patient.organizationId !== organizationId) {
        return undefined;
      }
      
      return patient;
    });
  }

  /**
   * Retrieves a keeper by its ID as a signal.
   * Optionally validates that the keeper belongs to the specified organization.
   * @param id - The ID of the keeper.
   * @param organizationId - Optional organization ID for validation.
   * @returns A Signal containing the Keeper object or undefined if not found or doesn't match organization.
   */
  getKeeperById(id: number | null | undefined, organizationId?: number): Signal<Keeper | undefined> {
    return computed(() => {
      if (!id) return undefined;
      const keeper = this.keepers().find(k => k.id === id);
      if (!keeper) return undefined;
      
      // Validate organizationId if provided
      if (organizationId !== undefined && keeper.organizationId !== organizationId) {
        return undefined;
      }
      
      return keeper;
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
   * Gets patients assigned to a specific doctor.
   * Only returns patients from the same organization as the doctor.
   * @param doctorId - The ID of the doctor.
   * @param organizationId - Optional organization ID for validation.
   * @returns A Signal containing an array of patients assigned to the doctor.
   */
  getPatientsByDoctorId(doctorId: number | null | undefined, organizationId?: number): Signal<Patient[]> {
    return computed(() => {
      if (!doctorId) return [];
      const doctor = this.doctors().find(d => d.id === doctorId);
      if (!doctor) return [];
      
      // Validate doctor belongs to organization if provided
      if (organizationId && doctor.organizationId !== organizationId) {
        return [];
      }
      
      // Filter patients by doctorId and same organizationId
      return this.patients().filter(patient => 
        patient.doctorId === doctorId && patient.organizationId === doctor.organizationId
      );
    });
  }

  /**
   * Loads and selects a patient by ID.
   * Similar to loadRelativeById in RelativesStore.
   * @param patientId - The patient ID to load
   */
  loadPatientById(patientId: number): void {
    const patient = this.patients().find(p => p.id === patientId);
    if (patient) {
      console.log(`✅ Patient loaded: ${patient.fullName} (id: ${patient.id})`);
      this.selectedPatientSignal.set(patient);
    } else {
      console.error(`❌ Patient with id ${patientId} not found`);
      this.selectedPatientSignal.set(null);
    }
  }

  /**
   * Loads and selects a senior citizen by ID.
   * Similar to loadPatientById.
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
   * Gets senior citizens assigned to a specific keeper.
   * Only returns senior citizens from the same organization as the keeper.
   * @param keeperId - The ID of the keeper.
   * @param organizationId - Optional organization ID for validation.
   * @returns A Signal containing an array of senior citizens assigned to the keeper.
   */
  getSeniorCitizensByKeeperId(keeperId: number | null | undefined, organizationId?: number): Signal<SeniorCitizen[]> {
    return computed(() => {
      if (!keeperId) return [];
      const keeper = this.keepers().find(k => k.id === keeperId);
      if (!keeper) return [];
      
      // Validate keeper belongs to organization if provided
      if (organizationId && keeper.organizationId !== organizationId) {
        return [];
      }
      
      // Filter senior citizens by keeperId and same organizationId
      return this.seniorCitizens().filter(sc => 
        sc.keeperId === keeperId && sc.organizationId === keeper.organizationId
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
        // Remove assignments for this doctor
        this.assignmentsSignal.update(assignments => {
          const newAssignments = { ...assignments };
          delete newAssignments[id.toString()];
          return newAssignments;
        });
        this.loadingSignal.set(false);
      },
      error: err => {
        this.errorSignal.set(this.formatError(err, 'Failed to delete doctor'));
        this.loadingSignal.set(false);
      }
    });
  }

  /**
   * Adds a new patient.
   * @param patient - The patient to add.
   */
  addPatient(patient: Patient): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.organizationApi.createPatient(patient).pipe(retry(2)).subscribe({
      next: createdPatient => {
        this.patientsSignal.update(patients => [...patients, createdPatient]);
        this.loadingSignal.set(false);
      },
      error: err => {
        this.errorSignal.set(this.formatError(err, 'Failed to create patient'));
        this.loadingSignal.set(false);
      }
    });
  }

  /**
   * Updates an existing patient.
   * @param updatedPatient - The patient to update.
   */
  updatePatient(updatedPatient: Patient): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.organizationApi.updatePatient(updatedPatient).pipe(retry(2)).subscribe({
      next: patient => {
        this.patientsSignal.update(patients =>
          patients.map(p => p.id === patient.id ? patient : p)
        );
        this.loadingSignal.set(false);
      },
      error: err => {
        this.errorSignal.set(this.formatError(err, 'Failed to update patient'));
        this.loadingSignal.set(false);
      }
    });
  }

  /**
   * Deletes a patient by ID.
   * @param id - The ID of the patient to delete.
   */
  deletePatient(id: number): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.organizationApi.deletePatient(id).pipe(retry(2)).subscribe({
      next: () => {
        this.patientsSignal.update(patients => patients.filter(p => p.id !== id));
        // Remove patient from all doctor assignments
        this.assignmentsSignal.update(assignments => {
          const newAssignments = { ...assignments };
          Object.keys(newAssignments).forEach(doctorId => {
            newAssignments[doctorId] = newAssignments[doctorId].filter(patientId => 
              patientId !== id.toString()
            );
          });
          return newAssignments;
        });
        this.loadingSignal.set(false);
      },
      error: err => {
        this.errorSignal.set(this.formatError(err, 'Failed to delete patient'));
        this.loadingSignal.set(false);
      }
    });
  }

  /**
   * Assigns a patient to a doctor.
   * Validates that both belong to the same organization.
   * @param doctorId - The ID of the doctor.
   * @param patientId - The ID of the patient.
   * @throws Error if doctor or patient don't belong to the same organization.
   */
  assignPatientToDoctor(doctorId: number, patientId: number): void {
    // 1. VALIDAR QUE AMBAS ENTIDADES EXISTAN Y PERTENEZCAN A LA MISMA ORGANIZACIÓN
    const doctor = this.doctors().find(d => d.id === doctorId);
    const patient = this.patients().find(p => p.id === patientId);
    
    if (!doctor) {
      throw new Error(`Doctor with ID ${doctorId} not found`);
    }
    
    if (!patient) {
      throw new Error(`Patient with ID ${patientId} not found`);
    }
    
    // Validar que pertenezcan a la misma organización
    if (doctor.organizationId !== patient.organizationId) {
      throw new Error(
        `Cannot assign patient to doctor: They belong to different organizations ` +
        `(Doctor: org ${doctor.organizationId}, Patient: org ${patient.organizationId})`
      );
    }

    // 2. ACTUALIZAR EL SIGNAL DE ASIGNACIONES (para compatibilidad con código existente)
    this.assignmentsSignal.update(assignments => {
      const newAssignments = { ...assignments };
      if (!newAssignments[doctorId.toString()]) {
        newAssignments[doctorId.toString()] = [];
      }
      if (!newAssignments[doctorId.toString()].includes(patientId.toString())) {
        newAssignments[doctorId.toString()].push(patientId.toString());
      }
      return newAssignments;
    });

    // 3. ACTUALIZAR EL PATIENT EN EL STORE Y PERSISTIR EN LA API
    const updatedPatient = new Patient({
      id: patient.id,
      firstName: patient.firstName,
      lastName: patient.lastName,
      age: patient.age,
      gender: patient.gender,
      weight: patient.weight,
      dni: patient.dni,
      height: patient.height,
      imageUrl: patient.imageUrl,
      doctorId: doctorId,
      organizationId: patient.organizationId  // Mantener organizationId
    });

    // Actualizar en el store
    this.patientsSignal.update(patients =>
      patients.map(p => p.id === patientId ? updatedPatient : p)
    );

    // Persistir en la API
    this.organizationApi.updatePatient(updatedPatient).pipe(retry(2)).subscribe({
      error: err => {
        console.error('Failed to persist patient assignment:', err);
        // Revertir cambio local si falla la API
        this.patientsSignal.update(patients =>
          patients.map(p => p.id === patientId ? patient : p)
        );
      }
    });
  }

  /**
   * Unassigns a patient from a doctor.
   * Validates that both belong to the same organization.
   * @param doctorId - The ID of the doctor.
   * @param patientId - The ID of the patient.
   * @throws Error if doctor or patient don't belong to the same organization.
   */
  unassignPatientFromDoctor(doctorId: number, patientId: number): void {
    const doctor = this.doctors().find(d => d.id === doctorId);
    const patient = this.patients().find(p => p.id === patientId);
    
    if (!doctor) {
      throw new Error(`Doctor with ID ${doctorId} not found`);
    }
    
    if (!patient) {
      throw new Error(`Patient with ID ${patientId} not found`);
    }
    
    if (doctor.organizationId !== patient.organizationId) {
      throw new Error(
        `Cannot unassign patient from doctor: They belong to different organizations ` +
        `(Doctor: org ${doctor.organizationId}, Patient: org ${patient.organizationId})`
      );
    }

    this.assignmentsSignal.update(assignments => {
      const newAssignments = { ...assignments };
      if (newAssignments[doctorId.toString()]) {
        newAssignments[doctorId.toString()] = newAssignments[doctorId.toString()].filter(
          id => id !== patientId.toString()
        );
      }
      return newAssignments;
    });

    const updatedPatient = new Patient({
      id: patient.id,
      firstName: patient.firstName,
      lastName: patient.lastName,
      age: patient.age,
      gender: patient.gender,
      weight: patient.weight,
      dni: patient.dni,
      height: patient.height,
      imageUrl: patient.imageUrl,
      doctorId: undefined,
      organizationId: patient.organizationId
    });

    this.patientsSignal.update(patients =>
      patients.map(p => p.id === patientId ? updatedPatient : p)
    );

    this.organizationApi.updatePatient(updatedPatient).pipe(retry(2)).subscribe({
      error: err => {
        console.error('Failed to persist patient unassignment:', err);
        this.patientsSignal.update(patients =>
          patients.map(p => p.id === patientId ? patient : p)
        );
      }
    });
  }

  /**
   * Assigns a senior citizen to a keeper.
   * Validates that both belong to the same organization.
   * Similar implementation to assignPatientToDoctor for consistency.
   * @param keeperId - The ID of the keeper.
   * @param seniorCitizenId - The ID of the senior citizen.
   * @throws Error if keeper or senior citizen don't belong to the same organization.
   */
  assignSeniorCitizenToKeeper(keeperId: number, seniorCitizenId: number): void {
    const keeper = this.keepers().find(k => k.id === keeperId);
    const seniorCitizen = this.seniorCitizens().find(sc => sc.id === seniorCitizenId);
    
    if (!keeper) {
      throw new Error(`Keeper with ID ${keeperId} not found`);
    }
    
    if (!seniorCitizen) {
      throw new Error(`Senior citizen with ID ${seniorCitizenId} not found`);
    }
    
    if (keeper.organizationId !== seniorCitizen.organizationId) {
      throw new Error(
        `Cannot assign senior citizen to keeper: They belong to different organizations ` +
        `(Keeper: org ${keeper.organizationId}, Senior Citizen: org ${seniorCitizen.organizationId})`
      );
    }

    const updatedSeniorCitizen = new SeniorCitizen({
      id: seniorCitizen.id,
      fullName: seniorCitizen.fullName,
      age: seniorCitizen.age,
      gender: seniorCitizen.gender,
      weight: seniorCitizen.weight,
      height: seniorCitizen.height,
      dni: seniorCitizen.dni,
      imageUrl: seniorCitizen.imageUrl,
      deviceIot: seniorCitizen.deviceIot,
      keeperId: keeperId,
      organizationId: seniorCitizen.organizationId
    });

    this.seniorCitizensSignal.update(seniorCitizens =>
      seniorCitizens.map(sc => sc.id === seniorCitizenId ? updatedSeniorCitizen : sc)
    );

    this.organizationApi.updateSeniorCitizen(updatedSeniorCitizen).pipe(retry(2)).subscribe({
      error: err => {
        console.error('Failed to persist senior citizen assignment:', err);
        this.seniorCitizensSignal.update(seniorCitizens =>
          seniorCitizens.map(sc => sc.id === seniorCitizenId ? seniorCitizen : sc)
        );
      }
    });
  }

  /**
   * Unassigns a senior citizen from a keeper.
   * Validates that both belong to the same organization.
   * Similar implementation to unassignPatientFromDoctor for consistency.
   * @param keeperId - The ID of the keeper.
   * @param seniorCitizenId - The ID of the senior citizen.
   * @throws Error if keeper or senior citizen don't belong to the same organization.
   */
  unassignSeniorCitizenFromKeeper(keeperId: number, seniorCitizenId: number): void {
    const keeper = this.keepers().find(k => k.id === keeperId);
    const seniorCitizen = this.seniorCitizens().find(sc => sc.id === seniorCitizenId);
    
    if (!keeper) {
      throw new Error(`Keeper with ID ${keeperId} not found`);
    }
    
    if (!seniorCitizen) {
      throw new Error(`Senior citizen with ID ${seniorCitizenId} not found`);
    }
    
    if (keeper.organizationId !== seniorCitizen.organizationId) {
      throw new Error(
        `Cannot unassign senior citizen from keeper: They belong to different organizations ` +
        `(Keeper: org ${keeper.organizationId}, Senior Citizen: org ${seniorCitizen.organizationId})`
      );
    }

    const updatedSeniorCitizen = new SeniorCitizen({
      id: seniorCitizen.id,
      fullName: seniorCitizen.fullName,
      age: seniorCitizen.age,
      gender: seniorCitizen.gender,
      weight: seniorCitizen.weight,
      height: seniorCitizen.height,
      dni: seniorCitizen.dni,
      imageUrl: seniorCitizen.imageUrl,
      deviceIot: seniorCitizen.deviceIot,
      keeperId: undefined,
      organizationId: seniorCitizen.organizationId
    });

    this.seniorCitizensSignal.update(seniorCitizens =>
      seniorCitizens.map(sc => sc.id === seniorCitizenId ? updatedSeniorCitizen : sc)
    );

    this.organizationApi.updateSeniorCitizen(updatedSeniorCitizen).pipe(retry(2)).subscribe({
      error: err => {
        console.error('Failed to persist senior citizen unassignment:', err);
        this.seniorCitizensSignal.update(seniorCitizens =>
          seniorCitizens.map(sc => sc.id === seniorCitizenId ? seniorCitizen : sc)
        );
      }
    });
  }


  /**
   * Adds a new keeper.
   * @param keeper - The keeper to add.
   */
  addKeeper(keeper: Keeper): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.organizationApi.createKeeper(keeper).pipe(retry(2)).subscribe({
      next: createdKeeper => {
        this.keepersSignal.update(keepers => [...keepers, createdKeeper]);
        this.loadingSignal.set(false);
      },
      error: err => {
        this.errorSignal.set(this.formatError(err, 'Failed to create keeper'));
        this.loadingSignal.set(false);
      }
    });
  }

  /**
   * Updates an existing keeper.
   * @param updatedKeeper - The keeper to update.
   */
  updateKeeper(updatedKeeper: Keeper): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.organizationApi.updateKeeper(updatedKeeper).pipe(retry(2)).subscribe({
      next: keeper => {
        this.keepersSignal.update(keepers =>
          keepers.map(k => k.id === keeper.id ? keeper : k)
        );
        this.loadingSignal.set(false);
      },
      error: err => {
        this.errorSignal.set(this.formatError(err, 'Failed to update keeper'));
        this.loadingSignal.set(false);
      }
    });
  }

  /**
   * Deletes a keeper by ID.
   * @param id - The ID of the keeper to delete.
   */
  deleteKeeper(id: number): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.organizationApi.deleteKeeper(id).pipe(retry(2)).subscribe({
      next: () => {
        this.keepersSignal.update(keepers => keepers.filter(k => k.id !== id));
        this.loadingSignal.set(false);
      },
      error: err => {
        this.errorSignal.set(this.formatError(err, 'Failed to delete keeper'));
        this.loadingSignal.set(false);
      }
    });
  }


  /**
   * Adds a new senior citizen.
   * @param seniorCitizen - The senior citizen to add.
   */
  addSeniorCitizen(seniorCitizen: SeniorCitizen): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.organizationApi.createSeniorCitizen(seniorCitizen).pipe(retry(2)).subscribe({
      next: createdSeniorCitizen => {
        this.seniorCitizensSignal.update(seniorCitizens => [...seniorCitizens, createdSeniorCitizen]);
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
   * @param updatedSeniorCitizen - The senior citizen to update.
   */
  updateSeniorCitizen(updatedSeniorCitizen: SeniorCitizen): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.organizationApi.updateSeniorCitizen(updatedSeniorCitizen).pipe(retry(2)).subscribe({
      next: seniorCitizen => {
        this.seniorCitizensSignal.update(seniorCitizens =>
          seniorCitizens.map(sc => sc.id === seniorCitizen.id ? seniorCitizen : sc)
        );
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
    console.log(` [Store] loadDoctorsByOrganization called for organizationId: ${organizationId}`);
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.organizationApi.getDoctorsByOrganization(organizationId).pipe(take(1)).subscribe({
      next: doctors => {
        console.log(` [Store] Doctors loaded successfully for organizationId ${organizationId}:`, doctors);
        console.log(` [Store] Doctors count: ${doctors.length}`);
        this.doctorsSignal.set(doctors);
        console.log(` [Store] doctorsSignal updated. Current value:`, this.doctorsSignal());
        this.loadingSignal.set(false);
      },
      error: err => {
        console.error(` [Store] Error loading doctors for organizationId ${organizationId}:`, err);
        this.errorSignal.set(this.formatError(err, 'Failed to load doctors'));
        this.loadingSignal.set(false);
      }
    });
  }

  /**
   * Loads patients by organization ID.
   * @param organizationId - The organization ID to filter patients.
   */
  loadPatientsByOrganization(organizationId: number): void {
    console.log(`📥 [Store] loadPatientsByOrganization called for organizationId: ${organizationId}`);
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.organizationApi.getPatientsByOrganization(organizationId).pipe(take(1)).subscribe({
      next: patients => {
        console.log(` [Store] Patients loaded successfully for organizationId ${organizationId}:`, patients);
        console.log(` [Store] Patients count: ${patients.length}`);
        this.patientsSignal.set(patients);
        console.log(` [Store] patientsSignal updated. Current value:`, this.patientsSignal());
        this.loadingSignal.set(false);
      },
      error: err => {
        console.error(` [Store] Error loading patients for organizationId ${organizationId}:`, err);
        this.errorSignal.set(this.formatError(err, 'Failed to load patients'));
        this.loadingSignal.set(false);
      }
    });
  }

  /**
   * Loads patients by doctor ID.
   * @param doctorId - The doctor ID to filter patients.
   */
  loadPatientsByDoctor(doctorId: number): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.organizationApi.getPatientsByDoctor(doctorId).pipe(take(1)).subscribe({
      next: patients => {
        this.patientsSignal.set(patients);
        this.loadingSignal.set(false);
      },
      error: err => {
        this.errorSignal.set(this.formatError(err, 'Failed to load patients by doctor'));
        this.loadingSignal.set(false);
      }
    });
  }

  /**
   * Loads keepers by organization ID.
   * @param organizationId - The organization ID to filter keepers.
   */
  loadKeepersByOrganization(organizationId: number): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    console.log('[OrganizationStore] Loading keepers for organizationId:', organizationId);
    this.organizationApi.getKeepersByOrganization(organizationId).pipe(take(1)).subscribe({
      next: keepers => {
        console.log('[OrganizationStore] Loaded keepers:', keepers);
        this.keepersSignal.set(keepers);
        this.loadingSignal.set(false);
      },
      error: err => {
        this.errorSignal.set(this.formatError(err, 'Failed to load keepers'));
        this.loadingSignal.set(false);
      }
    });
  }

  /**
   * Loads senior citizens by organization ID.
   * @param organizationId - The organization ID to filter senior citizens.
   */
  loadSeniorCitizensByOrganization(organizationId: number): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.organizationApi.getSeniorCitizensByOrganization(organizationId).pipe(take(1)).subscribe({
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
   * Loads senior citizens by keeper ID.
   * @param keeperId - The keeper ID to filter senior citizens.
   */
  loadSeniorCitizensByKeeper(keeperId: number): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.organizationApi.getSeniorCitizensByKeeper(keeperId).pipe(take(1)).subscribe({
      next: seniorCitizens => {
        this.seniorCitizensSignal.set(seniorCitizens);
        this.loadingSignal.set(false);
      },
      error: err => {
        this.errorSignal.set(this.formatError(err, 'Failed to load senior citizens by keeper'));
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
   * Loads all patients from the API.
   */
  loadPatients(): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.organizationApi.getPatients().pipe(take(1)).subscribe({
      next: patients => {
        this.patientsSignal.set(patients);
        this.loadingSignal.set(false);
      },
      error: err => {
        this.errorSignal.set(this.formatError(err, 'Failed to load patients'));
        this.loadingSignal.set(false);
      }
    });
  }

  /**
   * Loads all keepers from the API.
   */
  loadKeepers(): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.organizationApi.getKeepers().pipe(take(1)).subscribe({
      next: keepers => {
        this.keepersSignal.set(keepers);
        this.loadingSignal.set(false);
      },
      error: err => {
        this.errorSignal.set(this.formatError(err, 'Failed to load keepers'));
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

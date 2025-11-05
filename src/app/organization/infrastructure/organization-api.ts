import { Injectable } from '@angular/core';
import { BaseApi } from '../../shared/infrastructure/base-api';
import { DoctorsApiEndpoint } from './doctor-api-endpoint';
import { CaregiversApiEndpoint } from './caregiver-api-endpoint';
import { SeniorCitizensApiEndpoint } from './senior-citizen-api-endpoint';
import { OrganizationsApiEndpoint } from './organization-api-endpoint';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Doctor } from '../domain/model/doctor.entity';
import { Caregiver } from '../domain/model/caregiver.entity';
import { SeniorCitizen } from '../domain/model/senior-citizen.entity';
import { Organization } from '../domain/model/organization.entity';

/**
 * API service for managing organization-related operations (for doctors, caregivers, senior citizens, etc.)
 */
@Injectable({
  providedIn: 'root'
})
export class OrganizationApi extends BaseApi {

  private readonly doctorsEndpoint: DoctorsApiEndpoint;
  private readonly caregiversEndpoint: CaregiversApiEndpoint;
  private readonly seniorCitizensEndpoint: SeniorCitizensApiEndpoint;
  private readonly organizationsEndpoint: OrganizationsApiEndpoint;

  constructor(
    http: HttpClient) {
    super();
    this.doctorsEndpoint = new DoctorsApiEndpoint(http);
    this.caregiversEndpoint = new CaregiversApiEndpoint(http);
    this.seniorCitizensEndpoint = new SeniorCitizensApiEndpoint(http);
    this.organizationsEndpoint = new OrganizationsApiEndpoint(http);
  }

  /**
   * Fetches all doctors from the API.
   * @returns An Observable emitting an array of Doctor entities.
   */
  getDoctors(): Observable<Doctor[]> {
    return this.doctorsEndpoint.getAll();
  }

  /**
   * Fetches a doctor by its ID from the API.
   * @param id - The ID of the doctor to fetch.
   * @returns An Observable emitting the Doctor entity or null if not found.
   */
  getDoctorById(id: number): Observable<Doctor | null> {
    return this.doctorsEndpoint.getById(id);
  }

  /**
   * Creates a new doctor via the API.
   * @param doctor - The Doctor entity to create.
   * @returns An Observable emitting the created Doctor entity.
   */
  createDoctor(doctor: Doctor): Observable<Doctor> {
    return this.doctorsEndpoint.create(doctor);
  }

  /**
   * Updates an existing doctor via the API.
   * @param doctor - The Doctor entity to update.
   * @returns An Observable emitting the updated Doctor entity.
   */
  updateDoctor(doctor: Doctor): Observable<Doctor> {
    return this.doctorsEndpoint.update(doctor, doctor.id);
  }

  /**
   * Deletes a doctor by its ID via the API.
   * @param id - The ID of the doctor to delete.
   * @returns An Observable emitting void upon successful deletion.
   */
  deleteDoctor(id: number): Observable<void> {
    return this.doctorsEndpoint.delete(id);
  }

  /**
   * Fetches doctors by organization ID from the API.
   * @param organizationId - The organization ID to filter doctors.
   * @returns An Observable emitting an array of Doctor entities.
   */
  getDoctorsByOrganization(organizationId: number): Observable<Doctor[]> {
    return this.doctorsEndpoint.getByOrganizationId(organizationId);
  }

  /**
   * Fetches senior citizens by doctor ID from the API.
   * @param doctorId - The doctor ID to filter senior citizens.
   * @returns An Observable emitting an array of SeniorCitizen entities.
   */
  getSeniorCitizensByDoctor(doctorId: number): Observable<SeniorCitizen[]> {
    return this.seniorCitizensEndpoint.getByDoctorId(doctorId);
  }
  

  /**
   * Fetches all caregivers from the API.
   * @returns An Observable emitting an array of Caregiver entities.
   */
  getCaregivers(): Observable<Caregiver[]> {
    return this.caregiversEndpoint.getAll();
  }

  /**
   * Fetches a caregiver by its ID from the API.
   * @param id - The ID of the caregiver to fetch.
   * @returns An Observable emitting the Caregiver entity or null if not found.
   */
  getCaregiverById(id: number): Observable<Caregiver | null> {
    return this.caregiversEndpoint.getById(id);
  }

  /**
   * Creates a new caregiver via the API.
   * @param caregiver - The Caregiver entity to create.
   * @returns An Observable emitting the created Caregiver entity.
   */
  createCaregiver(caregiver: Caregiver): Observable<Caregiver> {
    return this.caregiversEndpoint.create(caregiver);
  }

  /**
   * Updates an existing caregiver via the API.
   * @param caregiver - The Caregiver entity to update.
   * @returns An Observable emitting the updated Caregiver entity.
   */
  updateCaregiver(caregiver: Caregiver): Observable<Caregiver> {
    return this.caregiversEndpoint.update(caregiver, caregiver.id);
  }

  /**
   * Deletes a caregiver by its ID via the API.
   * @param id - The ID of the caregiver to delete.
   * @returns An Observable emitting void upon successful deletion.
   */
  deleteCaregiver(id: number): Observable<void> {
    return this.caregiversEndpoint.delete(id);
  }

  /**
   * Fetches caregivers by organization ID from the API.
   * @param organizationId - The organization ID to filter caregivers.
   * @returns An Observable emitting an array of Caregiver entities.
   */
  getCaregiversByOrganization(organizationId: number): Observable<Caregiver[]> {
    return this.caregiversEndpoint.getByOrganizationId(organizationId);
  }

  /**
   * Fetches all senior citizens from the API.
   * @returns An Observable emitting an array of SeniorCitizen entities.
   */
  getSeniorCitizens(): Observable<SeniorCitizen[]> {
    return this.seniorCitizensEndpoint.getAll();
  }

  /**
   * Fetches a senior citizen by its ID from the API.
   * @param id - The ID of the senior citizen to fetch.
   * @returns An Observable emitting the SeniorCitizen entity or null if not found.
   */
  getSeniorCitizenById(id: number): Observable<SeniorCitizen | null> {
    return this.seniorCitizensEndpoint.getById(id);
  }

  /**
   * Creates a new senior citizen via the API.
   * @param seniorCitizen - The SeniorCitizen entity to create.
   * @returns An Observable emitting the created SeniorCitizen entity.
   */
  createSeniorCitizen(seniorCitizen: SeniorCitizen): Observable<SeniorCitizen> {
    return this.seniorCitizensEndpoint.create(seniorCitizen);
  }

  /**
   * Updates an existing senior citizen via the API.
   * @param seniorCitizen - The SeniorCitizen entity to update.
   * @returns An Observable emitting the updated SeniorCitizen entity.
   */
  updateSeniorCitizen(seniorCitizen: SeniorCitizen): Observable<SeniorCitizen> {
    return this.seniorCitizensEndpoint.update(seniorCitizen, seniorCitizen.id);
  }

  /**
   * Deletes a senior citizen by its ID via the API.
   * @param id - The ID of the senior citizen to delete.
   * @returns An Observable emitting void upon successful deletion.
   */
  deleteSeniorCitizen(id: number): Observable<void> {
    return this.seniorCitizensEndpoint.delete(id);
  }

  /**
   * Fetches senior citizens by organization ID from the API.
   * @param organizationId - The organization ID to filter senior citizens.
   * @returns An Observable emitting an array of SeniorCitizen entities.
   */
  getSeniorCitizensByOrganization(organizationId: number): Observable<SeniorCitizen[]> {
    return this.seniorCitizensEndpoint.getByOrganizationId(organizationId);
  }

  /**
   * Fetches senior citizens by caregiver ID from the API.
   * @param caregiverId - The caregiver ID to filter senior citizens.
   * @returns An Observable emitting an array of SeniorCitizen entities.
   */
  getSeniorCitizensByCaregiver(caregiverId: number): Observable<SeniorCitizen[]> {
    return this.seniorCitizensEndpoint.getByCaregiverId(caregiverId);
  }

  /**
   * Fetches an organization by its ID from the API.
   * @param id - The ID of the organization to fetch.
   * @returns An Observable emitting the Organization entity or null if not found.
   */
  getOrganizationById(id: number): Observable<Organization> {
    return this.organizationsEndpoint.getById(id);
  }

  // Note: Assignment methods removed - assignments are now part of the entities themselves (assignedSeniorIds for doctors/caregivers, assignedDoctorId/assignedCaregiverId for senior citizens - single assignment only)
  // The backend will handle junction tables when updating Doctor/Caregiver/SeniorCitizen entities
}

import { Injectable } from '@angular/core';
import { BaseApi } from '../../shared/infrastructure/base-api';
import { DoctorsApiEndpoint } from './doctor-api-endpoint';
import { PatientsApiEndpoint } from './patient-api-endpoint';
import { KeepersApiEndpoint } from './keeper-api-endpoint';
import { SeniorCitizensApiEndpoint } from './senior-citizen-api-endpoint';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Doctor } from '../domain/model/doctor.entity';
import { Patient } from '../domain/model/patient.entity';
import { Keeper } from '../domain/model/keeper.entity';
import { SeniorCitizen } from '../domain/model/senior-citizen.entity';

/**
 * API service for managing organization-related operations (for doctors, patients, etc.)
 */
@Injectable({
  providedIn: 'root'
})
export class OrganizationApi extends BaseApi {

  private readonly doctorsEndpoint: DoctorsApiEndpoint;
  private readonly patientsEndpoint: PatientsApiEndpoint;
  private readonly keepersEndpoint: KeepersApiEndpoint;
  private readonly seniorCitizensEndpoint: SeniorCitizensApiEndpoint;

  constructor(
    http: HttpClient) {
    super();
    this.doctorsEndpoint = new DoctorsApiEndpoint(http);
    this.patientsEndpoint = new PatientsApiEndpoint(http);
    this.keepersEndpoint = new KeepersApiEndpoint(http);
    this.seniorCitizensEndpoint = new SeniorCitizensApiEndpoint(http);
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
   * Fetches all patients from the API.
   * @returns An Observable emitting an array of Patient entities.
   */
  getPatients(): Observable<Patient[]> {
    return this.patientsEndpoint.getAll();
  }

  /**
   * Fetches a patient by its ID from the API.
   * @param id - The ID of the patient to fetch.
   * @returns An Observable emitting the Patient entity or null if not found.
   */
  getPatientById(id: number): Observable<Patient | null> {
    return this.patientsEndpoint.getById(id);
  }

  /**
   * Creates a new patient via the API.
   * @param patient - The Patient entity to create.
   * @returns An Observable emitting the created Patient entity.
   */
  createPatient(patient: Patient): Observable<Patient> {
    return this.patientsEndpoint.create(patient);
  }

  /**
   * Updates an existing patient via the API.
   * @param patient - The Patient entity to update.
   * @returns An Observable emitting the updated Patient entity.
   */
  updatePatient(patient: Patient): Observable<Patient> {
    return this.patientsEndpoint.update(patient, patient.id);
  }

  /**
   * Deletes a patient by its ID via the API.
   * @param id - The ID of the patient to delete.
   * @returns An Observable emitting void upon successful deletion.
   */
  deletePatient(id: number): Observable<void> {
    return this.patientsEndpoint.delete(id);
  }

  /**
   * Fetches patients by organization ID from the API.
   * @param organizationId - The organization ID to filter patients.
   * @returns An Observable emitting an array of Patient entities.
   */
  getPatientsByOrganization(organizationId: number): Observable<Patient[]> {
    return this.patientsEndpoint.getByOrganizationId(organizationId);
  }

  /**
   * Fetches patients by doctor ID from the API.
   * @param doctorId - The doctor ID to filter patients.
   * @returns An Observable emitting an array of Patient entities.
   */
  getPatientsByDoctor(doctorId: number): Observable<Patient[]> {
    return this.patientsEndpoint.getByDoctorId(doctorId);
  }
  

  /**
   * Fetches all keepers from the API.
   * @returns An Observable emitting an array of Keeper entities.
   */
  getKeepers(): Observable<Keeper[]> {
    return this.keepersEndpoint.getAll();
  }

  /**
   * Fetches a keeper by its ID from the API.
   * @param id - The ID of the keeper to fetch.
   * @returns An Observable emitting the Keeper entity or null if not found.
   */
  getKeeperById(id: number): Observable<Keeper | null> {
    return this.keepersEndpoint.getById(id);
  }

  /**
   * Creates a new keeper via the API.
   * @param keeper - The Keeper entity to create.
   * @returns An Observable emitting the created Keeper entity.
   */
  createKeeper(keeper: Keeper): Observable<Keeper> {
    return this.keepersEndpoint.create(keeper);
  }

  /**
   * Updates an existing keeper via the API.
   * @param keeper - The Keeper entity to update.
   * @returns An Observable emitting the updated Keeper entity.
   */
  updateKeeper(keeper: Keeper): Observable<Keeper> {
    return this.keepersEndpoint.update(keeper, keeper.id);
  }

  /**
   * Deletes a keeper by its ID via the API.
   * @param id - The ID of the keeper to delete.
   * @returns An Observable emitting void upon successful deletion.
   */
  deleteKeeper(id: number): Observable<void> {
    return this.keepersEndpoint.delete(id);
  }

  /**
   * Fetches keepers by organization ID from the API.
   * @param organizationId - The organization ID to filter keepers.
   * @returns An Observable emitting an array of Keeper entities.
   */
  getKeepersByOrganization(organizationId: number): Observable<Keeper[]> {
    return this.keepersEndpoint.getByOrganizationId(organizationId);
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
   * Fetches senior citizens by keeper ID from the API.
   * @param keeperId - The keeper ID to filter senior citizens.
   * @returns An Observable emitting an array of SeniorCitizen entities.
   */
  getSeniorCitizensByKeeper(keeperId: number): Observable<SeniorCitizen[]> {
    return this.seniorCitizensEndpoint.getByKeeperId(keeperId);
  }
}

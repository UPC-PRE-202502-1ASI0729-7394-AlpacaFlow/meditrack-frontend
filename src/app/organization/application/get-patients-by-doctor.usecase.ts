import {Patient} from "../domain/model/patient.entity";
import {Doctor} from "../domain/model/doctor.entity";

export class GetPatientsByDoctorUseCase {
    constructor(
        private readonly assignments: Record<string, string[]>, // doctorId -> patientIds
        private readonly patients: Patient[] // Lista global de pacientes
    ) {}

    /**
     * Obtiene los pacientes asignados a un doctor.
     * @param doctorId ID del doctor para buscar sus pacientes.
     */
    execute(doctorId: string): Patient[] {
        if (!doctorId) {
            throw new Error('El doctorId es requerido para ejecutar este caso de uso.');
        }

        const assignedPatientIds = this.assignments[doctorId] || []; // Pacientes asignados al doctor
        if (!Array.isArray(assignedPatientIds)) {
            return [];
        }

        // Filtra la lista global de pacientes
        return this.patients.filter((patient) =>
            assignedPatientIds.includes(patient.id.toString())
        );
    }
}
import {Doctor} from "../domain/model/doctor.entity";
import {DoctorsApiEndpoint} from "../infrastructure/doctor-api-endpoint";

export class RegisterDoctorUseCase {
    constructor(private readonly doctorsApi: DoctorsApiEndpoint) {}

    async execute(doctor: Doctor): Promise<Doctor> {
        const result = await this.doctorsApi.create(doctor).toPromise();
        if (!result) throw new Error("Doctor creation failed");
        return result;
    }

}
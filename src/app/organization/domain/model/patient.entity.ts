import {BaseEntity} from "../../../shared/infrastructure/base-entity";
import {SignalVitals} from "./signal-vitals.entity";
import {Alert} from "./alert.entity";

export class Patient implements BaseEntity {
    private _id: number;
    private _firstName: string;
    private _lastName: string;
    private _age: number;
    private _gender: string;
    private _weight: number;
    private _dni: string;
    private _height: number;
    private _imageUrl: string;
    private _doctorId?: number;
    private _organizationId: number;
    private _signalVitals?: SignalVitals;
    private _alerts?: Alert[];


    constructor(patient: {
        id?: number;
        firstName?: string;
        lastName?: string;
        age?: number;
        gender?: string;
        weight?: number;
        dni?: string;
        height?: number;
        imageUrl?: string;
        doctorId?: number;
        organizationId: number;
        signalVitals?: any;
        alerts?: any[];
    }) {
        this._id = patient.id ?? 0;
        this._firstName = patient.firstName ?? '';
        this._lastName = patient.lastName ?? '';
        this._age = patient.age ?? 0;
        this._gender = patient.gender ?? '';
        this._weight = patient.weight ?? 0;
        this._dni = patient.dni ?? '';
        this._height = patient.height ?? 0;
        this._imageUrl = patient.imageUrl ?? '';
        this._doctorId = patient.doctorId;
        this._organizationId = patient.organizationId;
        this._signalVitals = patient.signalVitals ? new SignalVitals(patient.signalVitals) : undefined;
        this._alerts = patient.alerts ? patient.alerts.map(a => new Alert(a)) : [];
    }

    get organizationId(): number {
        return this._organizationId;
    }
    set organizationId(value: number) {
        this._organizationId = value;
    }

    get doctorId(): number | undefined {
        return this._doctorId;
    }
    set doctorId(value: number | undefined) {
        this._doctorId = value;
    }

    get id(): number {
        return this._id;
    }
    set id(value: number) {
        this._id = value;
    }

    get firstName(): string {
        return this._firstName;
    }
    set firstName(value: string) {
        this._firstName = value;
    }

    get lastName(): string {
        return this._lastName;
    }
    set lastName(value: string) {
        this._lastName = value;
    }

    get age(): number {
        return this._age;
    }
    set age(value: number) {
        this._age = value;
    }

    get gender(): string {
        return this._gender;
    }
    set gender(value: string) {
        this._gender = value;
    }

    get weight(): number {
        return this._weight;
    }
    set weight(value: number) {
        this._weight = value;
    }

    get dni(): string {
        return this._dni;
    }
    set dni(value: string) {
        this._dni = value;
    }

    get height(): number {
        return this._height;
    }
    set height(value: number) {
        this._height = value;
    }

    get imageUrl(): string {
        return this._imageUrl;
    }
    set imageUrl(value: string) {
        this._imageUrl = value;
    }

    get fullName(): string {
        return `${this._firstName} ${this._lastName}`;
    }

    get signalVitals(): SignalVitals | undefined {
        return this._signalVitals;
    }

    get alerts(): Alert[] {
        return this._alerts || [];
    }
}
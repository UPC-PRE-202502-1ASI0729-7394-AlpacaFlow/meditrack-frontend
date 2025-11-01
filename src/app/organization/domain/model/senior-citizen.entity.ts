import {BaseEntity} from "../../../shared/infrastructure/base-entity";
import {SignalVitals} from "./signal-vitals.entity";
import {Alert} from "./alert.entity";

export class SeniorCitizen implements BaseEntity {
    private _id: number;
    private _fullName: string;
    private _age: number;
    private _gender: string;
    private _weight: number;
    private _dni: string;
    private _height: number;
    private _imageUrl: string;
    private _keeperId?: number;
    private _deviceIot: string;
    private _organizationId: number;
    private _signalVitals?: SignalVitals;
    private _alerts?: Alert[];


    constructor(seniorCitizen: {
        id?: number,
        fullName?: string,
        age?: number,
        gender?: string,
        weight?: number,
        dni?: string,
        height?: number,
        imageUrl?: string,
        keeperId?: number,
        deviceIot?: string,
        organizationId: number,
        signalVitals?: any,
        alerts?: any[],
    }) {
        this._id = seniorCitizen.id ?? 0;
        this._fullName = seniorCitizen.fullName ?? '';
        this._age = seniorCitizen.age ?? 0;
        this._gender = seniorCitizen.gender ?? '';
        this._weight = seniorCitizen.weight ?? 0;
        this._dni = seniorCitizen.dni ?? '';
        this._height = seniorCitizen.height ?? 0;
        this._imageUrl = seniorCitizen.imageUrl ?? '';
        this._keeperId = seniorCitizen.keeperId;
        this._deviceIot = seniorCitizen.deviceIot ?? '';
        this._organizationId = seniorCitizen.organizationId;
        this._signalVitals = seniorCitizen.signalVitals ? new SignalVitals(seniorCitizen.signalVitals) : undefined;
        this._alerts = seniorCitizen.alerts ? seniorCitizen.alerts.map(a => new Alert(a)) : [];
    }

    get organizationId(): number {
        return this._organizationId;
    }
    set organizationId(value: number) {
        this._organizationId = value;
    }

    get keeperId(): number | undefined {
        return this._keeperId;
    }
    set keeperId(value: number | undefined) {
        this._keeperId = value;
    }

    get deviceIot(): string {
        return this._deviceIot;
    }
    set deviceIot(value: string) {
        this._deviceIot = value;
    }

    get id(): number {
        return this._id;
    }
    set id(value: number) {
        this._id = value;
    }

    get fullName(): string {
        return this._fullName;
    }
    set fullName(value: string) {
        this._fullName = value;
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

    get signalVitals(): SignalVitals | undefined {
        return this._signalVitals;
    }

    get alerts(): Alert[] {
        return this._alerts || [];
    }

}
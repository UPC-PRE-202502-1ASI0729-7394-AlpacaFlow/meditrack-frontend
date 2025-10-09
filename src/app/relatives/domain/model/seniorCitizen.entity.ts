import {SignalVitals} from "./signalVitals.entity";
import {Alert} from "./alert.entity";

export class SeniorCitizen {
    private _firstName: string;
    private _lastName: string;
    private _age: number;
    private _dni: string;
    private _gender: string;
    private _height: number;
    private _weight: number;
    private _image: string;
    private _signalVitals: SignalVitals;
    private _alerts: Alert[];

    constructor({
                    firstName = "",
                    lastName = "",
                    age = 0,
                    dni = "",
                    gender = "",
                    height = 0,
                    weight = 0,
                    image = "",
                    signalVitals = {},
                    alerts = [],
                }: any) {
        this._firstName = firstName;
        this._lastName = lastName;
        this._age = age;
        this._dni = dni;
        this._gender = gender;
        this._height = height;
        this._weight = weight;
        this._image = image;
        this._signalVitals = new SignalVitals(signalVitals);
        this._alerts = Array.isArray(alerts)
            ? alerts.map((a) => new Alert(a))
            : [];
    }

    get firstName() { return this._firstName; }
    get lastName() { return this._lastName; }
    get age() { return this._age; }
    get weight() { return this._weight; }
    get height() { return this._height; }
    get gender() { return this._gender; }
    get dni() { return this._dni; }
    get image() { return this._image; }
    get signalVitals() { return this._signalVitals; }
    get alerts() { return this._alerts}
}

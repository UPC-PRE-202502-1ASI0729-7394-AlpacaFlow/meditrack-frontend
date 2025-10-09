import {BaseResource} from "../../shared/infrastructure/base-response";
import {SeniorCitizen} from "../domain/model/seniorCitizen.entity";

export interface RelativeResource extends BaseResource {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: string;
    planType: string;
    creditCard?: string | null;
    expirationDate?: string | null;
    securityCode?: string | null;
    seniorCitizen?: SeniorCitizen | null;
}

export interface RelativeResponse extends Array<RelativeResource> {}
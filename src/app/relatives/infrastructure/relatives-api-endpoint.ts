import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { BaseApiEndpoint } from "../../shared/infrastructure/base-api-enpoint";
import { Relative } from "../domain/model/relative.entity";
import { RelativeResource, RelativeResponse } from "./relatives-response";
import { RelativesAssembler } from "./relatives-assembler";
import { environments } from "../../../environments/environments.development";

@Injectable({
    providedIn: 'root'
})
export class RelativesApiEndpoint extends BaseApiEndpoint<
    Relative,
    RelativeResource,
    RelativeResponse,
    RelativesAssembler
> {
    constructor(http: HttpClient) {
        super(
            http,
            `${environments.platformProviderApiBaseUrl}/relatives`,
            new RelativesAssembler()
        );
    }
}

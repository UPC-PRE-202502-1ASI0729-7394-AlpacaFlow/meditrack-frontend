import { BaseAssembler } from "../../shared/infrastructure/base-assembler";
import { Relative } from "../domain/model/relative.entity";
import { RelativeResource, RelativeResponse } from "./relatives-response";
import { RelativeFreemium } from "../domain/model/relativeFreemium.entity";
import { RelativePremium } from "../domain/model/relativePremium.entity";

export class RelativesAssembler
    implements BaseAssembler<Relative, RelativeResource, RelativeResponse>
{
    toEntityFromResource(resource: RelativeResource): Relative {
        if (!resource) return null as any;
        return resource.planType === "premium"
            ? new RelativePremium(resource)
            : new RelativeFreemium(resource);
    }

    toResourceFromEntity(entity: Relative): RelativeResource {
        return {
            id: entity.id,
            firstName: entity.firstName,
            lastName: entity.lastName,
            email: entity.email,
            password: entity.password,
            role: entity.role,
            planType: entity.planType,
            creditCard: entity.creditCard,
            expirationDate: entity.expirationDate,
            securityCode: entity.securityCode,
            seniorCitizen: entity.seniorCitizen,
        };
    }

    toEntitiesFromResponse(response: RelativeResponse): Relative[] {
        return response.map((r) => this.toEntityFromResource(r));
    }
}

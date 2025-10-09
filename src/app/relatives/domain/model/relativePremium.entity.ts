import {Relative} from "./relative.entity";

export class RelativePremium extends Relative {
    constructor(resource: any = {}) {
        super(resource);
    }

    downloadData(): void {
        console.log(`Downloading data for premium relative: ${this.firstName}`);
    }
}

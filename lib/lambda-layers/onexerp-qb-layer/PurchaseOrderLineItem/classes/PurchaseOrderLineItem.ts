import { IOneXerpObject } from "../../IOneXerpObject/interfaces/IOneXerpObject";
import { ItemType } from "../../constants";

export class PurchaseOrderLineItem implements IOneXerpObject {
    constructor(
        public ItemName: string,
        public Quantity: number,
        public Rate: number,
        public ItemType: ItemType,
        public UnitOfMeasure: string,
        public JobNumber: string,
        public oneXerpId: string // Implementing the OneXerpObject interface
    ) {}

    static fromJson(data: any): PurchaseOrderLineItem {
        return new PurchaseOrderLineItem(
            data.ItemName,
            data.Quantity,
            data.Rate,
            data.ItemType,
            data.UnitOfMeasure,
            data.JobNumber,
            data.oneXerpId
        );
    }
}

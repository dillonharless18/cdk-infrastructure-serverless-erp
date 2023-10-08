import { PurchaseOrderLineItem } from "../../PurchaseOrderLineItem/classes/PurchaseOrderLineItem";
import { IPurchaseOrder } from "../interfaces/IPurchaseOrder";

export class PurchaseOrder implements IPurchaseOrder {
    constructor(
        public VendorName: string,
        public OrderDate: Date,
        public Items: PurchaseOrderLineItem[],
        public PurchaseOrderNumber: string,
        public Shipping: number,
        public Tax: number,
        public oneXerpId: string // Implementing the IOneXerpObject interface
    ) {}

    static fromCreateJson(data: IPurchaseOrder): PurchaseOrder {
        const items = data.Items.map((itemData) =>
            PurchaseOrderLineItem.fromJson(itemData)
        );

        return new PurchaseOrder(
            data.VendorName,
            data.OrderDate,
            data.Items,
            data.PurchaseOrderNumber,
            data.Shipping,
            data.Tax,
            data.oneXerpId
        );
    }
}

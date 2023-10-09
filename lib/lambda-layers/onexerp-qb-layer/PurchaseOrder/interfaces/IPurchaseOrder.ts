import { IOneXerpObject } from "../../IOneXerpObject/interfaces/IOneXerpObject";
import { IPurchaseOrderLineItem } from "../../PurchaseOrderLineItem/interfaces/IPurchaseOrderLineItem";

export interface IPurchaseOrder extends IOneXerpObject {
    VendorName: string;
    OrderDate: Date;
    Items: IPurchaseOrderLineItem[];
    PurchaseOrderNumber: string;
    Shipping: number;
    Tax: number;
    // ShipTo: Address - For now, there is defaulting to Bridgewater's warehouse in the QBD application. However, once it's broken out in the database, the oneXerpQB will automatically accept it
    // VendorAddress: Address - For now, not populating this in QBD. We can either get it from the Vendor inside QBD when we ensure it exists or send it in the message after we break the address out in oneXerp database.
}

import { IOneXerpObject } from "../../IOneXerpObject/interfaces/IOneXerpObject";
import { ItemType } from "../../constants";

export interface IPurchaseOrderLineItem extends IOneXerpObject {
    ItemName: string; // This is the name of the item (like screws), but populates Description in QBD
    Quantity: number; // IMPORTANT: this is a double in C#. Don't send an int.
    Rate: number; // IMPORTANT: this is a double in C#. Don't send an int.
    ItemType: ItemType; // This populates the ItemName field in QBD
    UnitOfMeasure: string; // This populates Other1 (masked as UNIT) in QBD
    JobNumber: string; // Always of the form "Customer:projectNumber", where projectNumber is a 4-digit number. Example --> JobNumber: "Nike:1234"
}

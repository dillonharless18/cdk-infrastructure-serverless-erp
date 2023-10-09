import { Address } from "../../Address/interfaces/IAddress";
import { IOneXerpObject } from "../../IOneXerpObject/interfaces/IOneXerpObject";

export interface IVendor extends IOneXerpObject {
    oneXerpId: string;
    Name: string;
    CompanyName?: string;
    VendorAddress?: Address;
    Phone?: string;
    NewName?: string;
    FirstName?: string;
    LastName?: string;
    Email?: string;
    // _quickbooksId?: string
}

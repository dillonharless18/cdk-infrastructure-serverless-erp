import { Address } from "../../Address/interfaces/IAddress";
import { IOneXerpObject } from "../../IOneXerpObject/interfaces/IOneXerpObject";

export interface ICustomer extends IOneXerpObject {
    oneXerpId: string;
    CompanyName: string;
    Name: string;
    BillAddress?: Address;
    Email?: string;
    FirstName?: string;
    LastName?: string;
    NewName?: string;
    Phone?: string;
    // _quickbooksId?: string // TODO - ListId lookups on update not implemented yet
}


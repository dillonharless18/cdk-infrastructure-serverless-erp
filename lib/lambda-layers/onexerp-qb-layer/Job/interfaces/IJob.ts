import { Address } from "../../Address/interfaces/IAddress";
import { IOneXerpObject } from "../../IOneXerpObject/interfaces/IOneXerpObject";

export interface IJob extends IOneXerpObject {
    oneXerpId: string;
    JobCode: string;
    ParentCustomerName: string;
    NewJobCode?: string;  // Only used in update
    NewParentCustomerName?: string; // Only used in update
    BillAddress?: Address;
    Description?: string;
    Phone?: string;
    Email?: string;
    FirstName?: string;
    LastName?: string;
}

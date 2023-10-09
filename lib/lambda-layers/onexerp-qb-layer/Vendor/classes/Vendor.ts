import { Address } from "../../Address/interfaces/IAddress";
import { IVendor } from "../interfaces/IVendor";

export class Vendor implements IVendor {
    public constructor(
        public oneXerpId: string,
        public Name: string, // Required for both create and update
        public CompanyName?: string, // Can be used for create or update
        public VendorAddress?: Address, // Can be used for create or update
        public Phone?: string, // Can be used for create or update
        public NewName?: string, // Used only when updating a vendor
        public FirstName?: string, // This is a person contact. Can be used for create or update
        public LastName?: string, // This is a person contact. Can be used for create or update
        public Email?: string // Can be used for create or update // _quickbooksId?: string           // Used only when updating a vendor
    ) {}

    static fromCreateJson(data: any): Vendor {
        return new VendorBuilder(data.oneXerpId, data.Name)
            .withCompanyName(data.CompanyName)
            .withVendorAddress(data.VendorAddress)
            .withPhone(data.Phone)
            .withFirstName(data.FirstName)
            .withLastName(data.LastName)
            .withEmail(data.Email)
            .build();
    }

    static fromUpdateJson(data: any): Vendor {
        return new VendorBuilder(data.oneXerpId, data.Name)
            .withCompanyName(data.CompanyName)
            .withVendorAddress(data.VendorAddress)
            .withPhone(data.Phone)
            .withNewName(data.NewName)
            .withFirstName(data.FirstName)
            .withLastName(data.LastName)
            .withEmail(data.Email)
            .build();
    }
}

class VendorBuilder {
    private oneXerpId: string;
    private Name: string; // Required for both create and update
    private CompanyName?: string; // Can be used for create or update
    private VendorAddress?: Address; // Can be used for create or update
    private Phone?: string; // Can be used for create or update
    private NewName?: string; // Used only when updating a vendor
    private FirstName?: string; // This is a person contact. Can be used for create or update
    private LastName?: string; // This is a person contact. Can be used for create or update
    private Email?: string; // Can be used for create or update
    // _quickbooksId?: string           // Used only when updating a vendor

    constructor(oneXerpId: string, Name: string) {
        this.oneXerpId = oneXerpId;
        this.Name = Name;
    }

    withCompanyName(CompanyName: string): VendorBuilder {
        this.CompanyName = CompanyName;
        return this;
    }

    withVendorAddress(VendorAddress: Address): VendorBuilder {
        this.VendorAddress = VendorAddress;
        return this;
    }

    withPhone(Phone: string): VendorBuilder {
        this.Phone = Phone;
        return this;
    }

    withNewName(NewName: string): VendorBuilder {
        this.NewName = NewName;
        return this;
    }

    withFirstName(FirstName: string): VendorBuilder {
        this.FirstName = FirstName;
        return this;
    }

    withLastName(LastName: string): VendorBuilder {
        this.LastName = LastName;
        return this;
    }

    withEmail(Email: string): VendorBuilder {
        this.Email = Email;
        return this;
    }

    build(): IVendor {
        return new Vendor(
            this.oneXerpId,
            this.Name,
            this.CompanyName,
            this.VendorAddress,
            this.Phone,
            this.NewName,
            this.FirstName,
            this.LastName,
            this.Email
        );
    }
}

import { Address } from "../../Address/interfaces/IAddress";
import { IOneXerpObject } from "../../IOneXerpObject/interfaces/IOneXerpObject";
import { ICustomer } from "../interfaces/ICustomer";

export class Customer implements IOneXerpObject {
    public constructor(
        public oneXerpId: string,
        public CompanyName: string,
        public Name: string,
        public BillAddress?: Address,
        public Email?: string,
        public FirstName?: string,
        public LastName?: string,
        public NewName?: string,
        public Phone?: string
    ) // _quickbooksId?: string // TODO - ListId lookups on update not implemented yet
    {}

    static fromCreateJson(data: any): Customer {
        return new CustomerBuilder(data.oneXerpId, data.CompanyName, data.Name)
            .withBillAddress(data.BillAddress)
            .withEmail(data.Email)
            .withFirstName(data.FirstName)
            .withLastName(data.LastName)
            .withPhone(data.Phone)
            .build();
    }

    static fromUpdateJson(data: any): Customer {
        return new CustomerBuilder(data.oneXerpId, data.CompanyName, data.Name)
            .withBillAddress(data.BillAddress)
            .withEmail(data.Email)
            .withFirstName(data.FirstName)
            .withLastName(data.LastName)
            .withNewName(data.NewName)
            .withPhone(data.Phone)
            .build();
    }
}

class CustomerBuilder {
    private oneXerpId: string;
    private CompanyName: string;
    private Name: string;
    private Email?: string;
    private FirstName?: string;
    private LastName?: string;
    private NewName?: string;
    private Phone?: string;
    private BillAddress?: Address;

    constructor(oneXerpId: string, CompanyName: string, Name: string) {
        this.oneXerpId = oneXerpId;
        this.CompanyName = CompanyName;
        this.Name = Name;
    }

    withEmail(Email: string): CustomerBuilder {
        this.Email = Email;
        return this;
    }

    withFirstName(FirstName: string): CustomerBuilder {
        this.FirstName = FirstName;
        return this;
    }

    withLastName(LastName: string): CustomerBuilder {
        this.LastName = LastName;
        return this;
    }

    withNewName(NewName: string): CustomerBuilder {
        this.NewName = NewName;
        return this;
    }

    withPhone(Phone: string): CustomerBuilder {
        this.Phone = Phone;
        return this;
    }

    withBillAddress(BillAddress: Address): CustomerBuilder {
        this.BillAddress = BillAddress;
        return this;
    }

    build(): ICustomer {
        return new Customer(
            this.oneXerpId,
            this.CompanyName,
            this.Name,
            this.BillAddress,
            this.Email,
            this.FirstName,
            this.LastName,
            this.NewName,
            this.Phone
        );
    }
}

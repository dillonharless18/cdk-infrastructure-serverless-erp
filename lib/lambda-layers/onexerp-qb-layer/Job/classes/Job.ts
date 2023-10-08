import { Address } from "../../Address/interfaces/IAddress";
import { IJob } from "../interfaces/IJob";

export class Job implements IJob {
    public constructor(
        public oneXerpId: string,
        public JobCode: string,
        public ParentCustomerName: string,
        public NewJobCode?: string, // Only used in update
        public NewParentCustomerName?: string, // Only used in update
        public BillAddress?: Address,
        public Description?: string,
        public Phone?: string,
        public Email?: string,
        public FirstName?: string,
        public LastName?: string
    ) {}

    static fromCreateJson(data: any): Job {
        return new JobBuilder(
            data.oneXerpId,
            data.JobCode,
            data.ParentCustomerName
        )
            .withBillAddress(data.BillAddress)
            .withDescription(data.Description)
            .withPhone(data.Phone)
            .withEmail(data.Email)
            .withFirstName(data.FirstName)
            .withLastName(data.LastName)
            .build();
    }

    static fromUpdateJson(data: any): Job {
        return new JobBuilder(
            data.oneXerpId,
            data.JobCode,
            data.ParentCustomerName
        )
            .withNewJobCode(data.NewJobCode)
            .withNewParentCustomerName(data.NewParentCustomerName)
            .withBillAddress(data.BillAddress)
            .withDescription(data.Description)
            .withPhone(data.Phone)
            .withEmail(data.Email)
            .withFirstName(data.FirstName)
            .withLastName(data.LastName)
            .build();
    }
}

export class JobBuilder {
    private oneXerpId: string;
    private JobCode: string;
    private ParentCustomerName: string;
    private NewJobCode?: string;
    private NewParentCustomerName?: string;
    private BillAddress?: Address;
    private Description?: string;
    private Phone?: string;
    private Email?: string;
    private FirstName?: string;
    private LastName?: string;

    constructor(
        oneXerpId: string,
        JobCode: string,
        ParentCustomerName: string
    ) {
        this.oneXerpId = oneXerpId;
        this.JobCode = JobCode;
        this.ParentCustomerName = ParentCustomerName;
    }

    withNewJobCode(NewJobCode: string): JobBuilder {
        this.NewJobCode = NewJobCode;
        return this;
    }

    withNewParentCustomerName(NewParentCustomerName: string): JobBuilder {
        this.NewParentCustomerName = NewParentCustomerName;
        return this;
    }

    withBillAddress(BillAddress: Address): JobBuilder {
        this.BillAddress = BillAddress;
        return this;
    }

    withDescription(Description: string): JobBuilder {
        this.Description = Description;
        return this;
    }

    withPhone(Phone: string): JobBuilder {
        this.Phone = Phone;
        return this;
    }

    withEmail(Email: string): JobBuilder {
        this.Email = Email;
        return this;
    }

    withFirstName(FirstName: string): JobBuilder {
        this.FirstName = FirstName;
        return this;
    }

    withLastName(LastName: string): JobBuilder {
        this.LastName = LastName;
        return this;
    }

    build(): IJob {
        return new Job(
            this.oneXerpId,
            this.JobCode,
            this.ParentCustomerName,
            this.NewJobCode,
            this.NewParentCustomerName,
            this.BillAddress,
            this.Description,
            this.Phone,
            this.Email,
            this.FirstName,
            this.LastName
        );
    }
}

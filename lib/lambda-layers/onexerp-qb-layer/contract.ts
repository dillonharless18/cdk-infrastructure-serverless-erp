import { ActionType } from "./constants"
import { ItemType } from "./constants";

type Address = {
    Addr1: string
    Addr2: string
    Addr3: string
    Addr4: string
    Addr5: string
    City: string
    State: string
    PostalCode: string
    Country: string
    Note: string
}

interface OneXerpObject {
    oneXerpId: string; // UUID of the entity in oneXerp
    
}

///////////////////////////
// START Vendor Examples //
///////////////////////////

interface Vendor extends OneXerpObject {
    Name: string            // Required for both create and update
    CompanyName?: string    // Can be used for create or update
    VendorAddress?: Address // Can be used for create or update
    Phone?: string,         // Can be used for create or update
    NewName?: string,       // Used only when updating a vendor
    FirstName?: string,     // This is a person contact. Can be used for create or update
    LastName?: string,      // This is a person contact. Can be used for create or update
    Email?: string          // Can be used for create or update
    // _quickbooksId?: string  // Used only when updating a vendor 
}

interface CreateVendorMessage {
    actionType: ActionType;
    body: Vendor
}


const createVendorMessage: CreateVendorMessage = {
    actionType: ActionType.CREATE_VENDOR,
    body: {
        oneXerpId: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        Name: "Test Vendor Name",
        CompanyName: "Test Vendor Name",
        Phone: "910-123-4567",
        FirstName: "First",
        LastName: "Last",
        Email: "test@vendor.com"
        // VendorAddress: { NOTE - only send this after we break out the address from just a string. I tried putting it all in the _addr1 field, but got an error saying it was too long.
        //     Addr1: "",
        //     Addr2: "",
        //     Addr3: "",
        //     Addr4: "",
        //     Addr5: "",
        //     City: "",
        //     State: "",
        //     PostalCode: "",
        //     Country: "",
        //     Note: "",
        // },
    }
};


interface UpdateVendorMessage {
    actionType: ActionType;
    body: Vendor
}

const updateVendorMessage: UpdateVendorMessage = {
    actionType: ActionType.UPDATE_VENDOR,
    body: {
        oneXerpId: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        Name: "Test Vendor Name",
        CompanyName: "Test Vendor Name",
        NewName: "New Test Vendor Name",
        Phone: "910-123-4567",
        FirstName: "UpdatedFirst",
        LastName: "UpdatedLast",
        Email: "updated@vendor.com"
        // VendorAddress: { NOTE - only send this after we break out the address from just a string. I tried putting it all in the _addr1 field, but got an error saying it was too long.
        //     Addr1: "",
        //     Addr2: "",
        //     Addr3: "",
        //     Addr4: "",
        //     Addr5: "",
        //     City: "",
        //     State: "",
        //     PostalCode: "",
        //     Country: "",
        //     Note: "",
        // },
        // _quickbooksId: "80000DC0-1695232941" // TODO We should be tying the vendor ids together by giving the ListId back to oneXerp and storing it in the database. So if we have it, can send it here to be extra sure it's the proper vendor, but unnecessary for now.
    }
};


////////////////////
// START Customer //
////////////////////

interface Customer extends OneXerpObject {
    BillAddress?: Address
    CompanyName: string
    Email?: string
    FirstName?: string
    LastName?: string
    Name: string
    NewName?: string
    Phone?: string
    // _quickbooksId?: string // TODO - ListId lookups on update not implemented yet
}

interface CreateCustomerMessage {
    actionType: ActionType;
    body: Customer
}

const createCustomerMessage: CreateCustomerMessage = {
    actionType: ActionType.CREATE_CUSTOMER,
    body: {
        oneXerpId: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        Name: "Test Customer Name",
        CompanyName: "Test Customer Name",
        Phone: "910-123-4567",
        Email: "test@customer.com",
        FirstName: "FirstName",
        LastName: "LastName"
        // BillAddress: { NOTE - only send this after we break out the address from just a string. I tried putting it all in the _addr1 field, but got an error saying it was too long.
        //     Addr1: "",
        //     Addr2: "",
        //     Addr3: "",
        //     Addr4: "",
        //     Addr5: "",
        //     City: "",
        //     State: "",
        //     PostalCode: "",
        //     Country: "",
        //     Note: "",
        // },
        // _quickbooksId: "80000DC0-1695232941" // TODO We should be tying the vendor ids together by giving the ListId back to oneXerp and storing it in the database. So if we have it, can send it here to be extra sure it's the proper vendor, but unnecessary for now.
    }
};

interface UpdateCustomerMessage {
    actionType: ActionType;
    body: Customer
}

const updateCustomerMessage: UpdateCustomerMessage = {
    actionType: ActionType.UPDATE_CUSTOMER,
    body: {
        oneXerpId: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        Name: "Test Customer Name",
        CompanyName: "Test Customer Name",
        NewName: "New Test Customer Name",
        Phone: "777-777-7777",
        Email: "newtest@customer.com",
        FirstName: "NewFirstName",
        LastName: "NewLastName"
        // BillAddress: { NOTE - only send this after we break out the address from just a string. I tried putting it all in the _addr1 field, but got an error saying it was too long.
        //     Addr1: "",
        //     Addr2: "",
        //     Addr3: "",
        //     Addr4: "",
        //     Addr5: "",
        //     City: "",
        //     State: "",
        //     PostalCode: "",
        //     Country: "",
        //     Note: "",
        // },
        // _quickbooksId: "80000DC0-1695232941" // TODO We should be tying the vendor ids together by giving the ListId back to oneXerp and storing it in the database. So if we have it, can send it here to be extra sure it's the proper vendor, but unnecessary for now.
    }
};


///////////////
// START Job //
///////////////

interface Job extends OneXerpObject {
    JobCode: string
    NewJobCode?: string  // Only used in update
    ParentCustomerName: string
    NewParentCustomerName?: string // Only used in update
    BillAddress?: Address
    Description?: string
    Phone?: string
    Email?: string
    FirstName?: string
    LastName?: string
}

interface CreateJobMessage {
    actionType: ActionType;
    body: Job
}

const createJobMessage: CreateJobMessage = {
    actionType: ActionType.CREATE_JOB,
    body: {
        oneXerpId: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        JobCode: "1234",
        ParentCustomerName: "Test Parent Customer",
        Phone: "910-123-4567",
        Email: "test@job.com",
        FirstName: "John",
        LastName: "Doe",
        Description: "This is a test job."
        // BillAddress, NewName, _quickbooksId, etc. can also go here
    }
};

interface UpdateJobMessage {
    actionType: ActionType;
    body: Job
}

const updateJobMessage: UpdateJobMessage = {
    actionType: ActionType.UPDATE_JOB,
    body: {
        oneXerpId: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        JobCode: "1234",
        NewJobCode: "7777",
        ParentCustomerName: "Nike",
        Phone: "910-987-6543",
        Email: "newtest@job.com",
        // BillAddress, Description, FirstName, LastName, _quickbooksId, etc. can also go here
    }
};

// Example of reassociating the job with a different customer
const updateJobMessageReassociateCustomer: UpdateJobMessage = {
    actionType: ActionType.UPDATE_JOB,
    body: {
        oneXerpId: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        JobCode: "1234",            // Note that we need this in order to look up the job in QB
        ParentCustomerName: "Nike", // Note that we need this in order to look up the job in QB also
        NewParentCustomerName: "Turf Design",
        // BillAddress, Description, FirstName, LastName, _quickbooksId, etc. can also go here
    }
};

///////////////////////////////////
// START Purchase Order Examples //
///////////////////////////////////

interface PurchaseOrderLineItem extends OneXerpObject {
    ItemName: string,      // This is the name of the item (like screws), but populates Description in QBD
    Quantity: number,      // IMPORTANT: this is a double in C#. Don't send an int.
    Rate: number,          // IMPORTANT: this is a double in C#. Don't send an int.
    ItemType: ItemType,    // This populates the ItemName field in QBD
    UnitOfMeasure: string, // This populates Other1 (masked as UNIT) in QBD
    JobNumber: string      // Always of the form "Customer:projectNumber", where projectNumber is a 4-digit number. Example --> JobNumber: "Nike:1234"
}

interface PurchaseOrder extends OneXerpObject {
    VendorName: string,
    OrderDate: Date,
    Items: PurchaseOrderLineItem[]
    PurchaseOrderNumber: string,
    Shipping: number,
    Tax: number
    // ShipTo: Address - For now, there is defaulting to Bridgewater's warehouse in the QBD application. However, once it's broken out in the database, the oneXerpQB will automatically accept it
    // VendorAddress: Address - For now, not populating this in QBD. We can either get it from the Vendor inside QBD when we ensure it exists or send it in the message after we break the address out in oneXerp database.
}

interface CreatePOMessage {
    actionType: ActionType;
    body: PurchaseOrder
}

const createPurchaseOrderMessage: CreatePOMessage = {
    actionType: ActionType.CREATE_PO,
    body: {
        oneXerpId: "12345678-abcd-1234-abcd-1234567890ab", 
        VendorName: "3form",
        OrderDate: new Date(),
        PurchaseOrderNumber: "123456789",
        Shipping: 39.99,
        Tax: 287.63,
        // ShipTo: `Bridgewater Studio Inc. \n4834 S Oakley Ave \nChicago, IL 60609`, // This is hardcoded in the QB application for now. We can accept a dynamic one once we break out the address from a string into an actual address in our database.
        Items: [
            {
                oneXerpId: "45678123-abcd-1234-abcd-1234567890ab",
                ItemType: "Materials",     
                ItemName: "Test Item One", 
                Quantity: 4.0,
                Rate: 70,
                UnitOfMeasure: "ea",
                JobNumber: "Nike:1849"
            },
            {
                oneXerpId: "87654321-abcd-1234-abcd-1234567890ab",
                ItemType: "Materials",
                ItemName: "Test Item Numba 2",
                Quantity: 1.0,
                Rate: 40,
                UnitOfMeasure: "ea",
                JobNumber: "Nike:1850"
            }
        ]
    }
};


/////////////////////////////////////////
// Message Format for Ingress Messages //
/////////////////////////////////////////

interface IngressMessage {
    ErrorMessage?: string; 
    OneXerpId:     string;
    QuickbooksId:  string;
    Type:    ActionType;
}

const createPOIngressMessage: IngressMessage = {
    QuickbooksId: "CREATE_PO",
    OneXerpId:    "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    Type:         ActionType.CREATE_PO
}
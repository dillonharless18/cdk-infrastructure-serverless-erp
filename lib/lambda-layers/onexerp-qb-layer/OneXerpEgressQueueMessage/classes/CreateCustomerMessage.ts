import { Customer } from "../../Customer/classes/Customer";
import { ICustomer } from "../../Customer/interfaces/ICustomer";
import { IOneXerpObject } from "../../IOneXerpObject/interfaces/IOneXerpObject";
import { ActionType } from "../../constants";
import { IOneXerpEgressQueueMessage } from "../interfaces/IOneXerpEgressQueueMessage";

export class CreateCustomerMessage implements IOneXerpEgressQueueMessage {
    public readonly actionType: ActionType = ActionType.CREATE_CUSTOMER;
    public readonly body: ICustomer;

    public constructor(body: IOneXerpObject) {
        this.body = Customer.fromCreateJson(body as ICustomer);
    }
}

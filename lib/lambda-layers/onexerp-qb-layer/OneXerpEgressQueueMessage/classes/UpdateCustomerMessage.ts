import { Customer } from "../../Customer/classes/Customer";
import { ICustomer } from "../../Customer/interfaces/ICustomer";
import { IOneXerpObject } from "../../IOneXerpObject/interfaces/IOneXerpObject";
import { ActionType } from "../../constants";
import { IOneXerpEgressQueueMessage } from "../interfaces/IOneXerpEgressQueueMessage";

export class UpdateCustomerMessage implements IOneXerpEgressQueueMessage {
    public readonly actionType: ActionType = ActionType.UPDATE_CUSTOMER;
    public readonly body: IOneXerpObject;

    public constructor(body: IOneXerpObject) {
        this.body = Customer.fromUpdateJson(body as ICustomer);
    }
}

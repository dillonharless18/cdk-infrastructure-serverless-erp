import { IOneXerpObject } from "../../IOneXerpObject/interfaces/IOneXerpObject";
import { Vendor } from "../../Vendor/classes/Vendor";
import { IVendor } from "../../Vendor/interfaces/IVendor";
import { ActionType } from "../../constants";
import { IOneXerpEgressQueueMessage } from "../interfaces/IOneXerpEgressQueueMessage";

export class CreateVendorMessage implements IOneXerpEgressQueueMessage {
    public readonly actionType: ActionType = ActionType.CREATE_VENDOR;
    public readonly body: IVendor;

    public constructor(body: IOneXerpObject) {
        this.body = Vendor.fromCreateJson(body as IVendor);
    }
}

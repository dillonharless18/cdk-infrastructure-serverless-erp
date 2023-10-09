import { IOneXerpObject } from "../../IOneXerpObject/interfaces/IOneXerpObject";
import { Vendor } from "../../Vendor/classes/Vendor";
import { IVendor } from "../../Vendor/interfaces/IVendor";
import { ActionType } from "../../constants";
import { IOneXerpEgressQueueMessage } from "../interfaces/IOneXerpEgressQueueMessage";

export class UpdateVendorMessage implements IOneXerpEgressQueueMessage {
    public readonly actionType: ActionType = ActionType.UPDATE_VENDOR;
    public readonly body: Vendor;

    public constructor(body: IOneXerpObject) {
        this.body = Vendor.fromUpdateJson(body as IVendor);
    }
}

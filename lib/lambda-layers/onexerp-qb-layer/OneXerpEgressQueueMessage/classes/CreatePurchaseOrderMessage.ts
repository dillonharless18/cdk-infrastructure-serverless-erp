import { IOneXerpObject } from "../../IOneXerpObject/interfaces/IOneXerpObject";
import { PurchaseOrder } from "../../PurchaseOrder/classes/PurchaseOrder";
import { IPurchaseOrder } from "../../PurchaseOrder/interfaces/IPurchaseOrder";
import { ActionType } from "../../constants";
import { IOneXerpEgressQueueMessage } from "../interfaces/IOneXerpEgressQueueMessage";

export class CreatePurchaseOrderMessage implements IOneXerpEgressQueueMessage {
    public readonly actionType: ActionType = ActionType.CREATE_PO;
    public readonly body: IPurchaseOrder;

    public constructor(body: IOneXerpObject) {
        this.body = PurchaseOrder.fromCreateJson(body as IPurchaseOrder);
    }
}

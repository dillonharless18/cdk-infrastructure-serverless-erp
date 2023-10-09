import { IOneXerpObject } from "../../IOneXerpObject/interfaces/IOneXerpObject";
import { ActionType } from "../../constants";

export interface IOneXerpEgressQueueMessage {
    actionType: ActionType;
    body: IOneXerpObject;
}

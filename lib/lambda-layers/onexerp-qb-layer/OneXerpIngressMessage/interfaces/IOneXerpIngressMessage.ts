import { ActionType } from "../../constants";

export interface IOneXerpIngressMessage {
    ErrorMessage?: string;
    OneXerpId: string;
    QuickbooksId: string;
    Type: ActionType;
}

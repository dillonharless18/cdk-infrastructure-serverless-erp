import { ActionType } from "../../constants";
import { IOneXerpIngressMessage } from "../interfaces/IOneXerpIngressMessage";

export class OneXerpIngressMessage implements IOneXerpIngressMessage {
    public constructor(
        public OneXerpId: string,
        public QuickbooksId: string,
        public Type: ActionType,
        public ErrorMessage?: string
    ) {}
}

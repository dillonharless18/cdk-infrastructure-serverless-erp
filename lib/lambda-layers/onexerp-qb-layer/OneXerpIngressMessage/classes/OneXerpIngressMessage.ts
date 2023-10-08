import { ActionType } from "../../constants";

export class OneXerpIngressMessage {
    public constructor(
        public OneXerpId: string,
        public QuickbooksId: string,
        public Type: ActionType,
        public ErrorMessage?: string
    ) {}
}

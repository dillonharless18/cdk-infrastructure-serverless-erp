import { IOneXerpObject } from "../../IOneXerpObject/interfaces/IOneXerpObject";
import { Job } from "../../Job/classes/Job";
import { IJob } from "../../Job/interfaces/IJob";
import { ActionType } from "../../constants";
import { IOneXerpEgressQueueMessage } from "../interfaces/IOneXerpEgressQueueMessage";

export class CreateJobMessage implements IOneXerpEgressQueueMessage {
    public readonly actionType: ActionType = ActionType.CREATE_JOB;
    public readonly body: IJob;

    public constructor(body: IOneXerpObject) {
        this.body = Job.fromCreateJson(body as IJob);
    }
}

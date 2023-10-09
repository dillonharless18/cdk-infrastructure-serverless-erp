import {
    SendMessageCommand,
    SendMessageCommandOutput,
    SQSClient,
} from "@aws-sdk/client-sqs";
import { ActionType } from "../constants";
import { IOneXerpObject } from "../IOneXerpObject/interfaces/IOneXerpObject";
import { CreatePurchaseOrderMessage } from "../OneXerpEgressQueueMessage/classes/CreatePurchaseOrderMessage";
import { CreateVendorMessage } from "../OneXerpEgressQueueMessage/classes/CreateVendorMessage";
import { UpdateVendorMessage } from "../OneXerpEgressQueueMessage/classes/UpdateVendorMessage";
import { CreateCustomerMessage } from "../OneXerpEgressQueueMessage/classes/CreateCustomerMessage";
import { UpdateCustomerMessage } from "../OneXerpEgressQueueMessage/classes/UpdateCustomerMessage";
import { CreateJobMessage } from "../OneXerpEgressQueueMessage/classes/CreateJobMessage";
import { UpdateJobMessage } from "../OneXerpEgressQueueMessage/classes/UpdateJobMessage";

export class OneXerpQBUtil {
    private readonly oneXerpEgressQueueClient: SQSClient;
    private readonly awsRegion: string = process!.env!["AWS_REGION"]!;
    private readonly oneXerpEgressQueueUrl: string =
        process.env["EGRESS_QUEUE_URL"]!;

    public constructor() {
        this.oneXerpEgressQueueClient = new SQSClient({
            region: this.awsRegion,
        });
    }
    /**
     * Sends a message to the oneXerp QB Egress Queue given a url and message body.
     * This method will catch and throw errors, so the caller must be ready to handle
     * the thrown errors.
     *
     * This method expects the caller to handle thrown exceptions.
     */
    public async sendMessageToOneXerpQBEgressQueue(
        actionType: ActionType,
        data: IOneXerpObject
    ): Promise<void> {
        try {
            const messageJson: string =
                this.constructOneXerpQBEgressQueueMessage(actionType, data);

            await this.sendMessageToSQSCient(
                messageJson,
                this.oneXerpEgressQueueClient,
                this.oneXerpEgressQueueUrl
            );
        } catch (error) {
            console.log(
                "Error when constructing a message and sending it to the OneXerpQBEgressQueue:",
                error
            );
            throw error;
        }
    }

    /**
     *  Creates a specific OneXerpQBEgressQueueMessage for a given ActionType
     *  and returns it as a JSON serialized string
     */
    private constructOneXerpQBEgressQueueMessage(
        actionType: ActionType,
        data: IOneXerpObject
    ): string {
        let oneXerpEgressQueueMessage: any;

        switch (actionType) {
            case ActionType.CREATE_VENDOR:
                oneXerpEgressQueueMessage = new CreateVendorMessage(data);
                break;
            case ActionType.UPDATE_VENDOR:
                oneXerpEgressQueueMessage = new UpdateVendorMessage(data);
                break;
            case ActionType.CREATE_CUSTOMER:
                oneXerpEgressQueueMessage = new CreateCustomerMessage(data);
                break;
            case ActionType.UPDATE_CUSTOMER:
                oneXerpEgressQueueMessage = new UpdateCustomerMessage(data);
                break;
            case ActionType.CREATE_JOB:
                oneXerpEgressQueueMessage = new CreateJobMessage(data);
                break;
            case ActionType.UPDATE_JOB:
                oneXerpEgressQueueMessage = new UpdateJobMessage(data);
                break;
            case ActionType.CREATE_PO:
                oneXerpEgressQueueMessage = new CreatePurchaseOrderMessage(
                    data
                );
                break;
            default:
            // do nothing
        }

        return JSON.stringify(oneXerpEgressQueueMessage);
    }

    private async sendMessageToSQSCient(
        messageJson: string,
        sqsClient: SQSClient,
        queueUrl: string
    ): Promise<SendMessageCommandOutput> {
        const sendCommand: SendMessageCommand = new SendMessageCommand({
            QueueUrl: queueUrl,
            MessageAttributes: {
                EventSource: {
                    DataType: "String",
                    StringValue: "oneXerp",
                },
            },
            MessageBody: messageJson,
        });
        const sqsResponse = await sqsClient.send(sendCommand);

        console.log("SQS response:", sqsResponse);
        return sqsResponse;
    }
}

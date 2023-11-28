import * as lambda from "aws-cdk-lib/aws-lambda";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import {
    aws_events,
    aws_events_targets,
    CfnOutput,
    Duration,
    Fn,
    RemovalPolicy,
} from "aws-cdk-lib";
import { Queue } from "aws-cdk-lib/aws-sqs";
import { Construct } from "constructs";
import { createResourceWithHyphenatedName } from "../util/helper";
import { ISecurityGroup, IVpc, Port, SecurityGroup } from "aws-cdk-lib/aws-ec2";
import { Effect, Policy, PolicyStatement } from "aws-cdk-lib/aws-iam";

export interface VeryfiIntegrationConstructProps {
    env: {
        region: string;
    };
    databaseSecurityGroup: ISecurityGroup;
    databaseCredentialsSecretArn: CfnOutput;
    dbCredentialsSecretName: CfnOutput;
    defaultDBName: string;
    stageName: string;
    vpc: IVpc;
    databaseLambdaLayer: lambda.LayerVersion[];
}

export class VeryfiIntegrationConstruct extends Construct {
    constructor(
        scope: Construct,
        id: string,
        props: VeryfiIntegrationConstructProps
    ) {
        super(scope, id);

        const veryfiPurchaseOrderImageBucketName =
            createResourceWithHyphenatedName(
                props.env.region,
                props.stageName,
                "VeryfiPurchaseOrderImageBucket"
            );
        const dlqName = createResourceWithHyphenatedName(
            props.env.region,
            props.stageName,
            "VeryfiDocumentEventDLQ"
        );
        const queueName = createResourceWithHyphenatedName(
            props.env.region,
            props.stageName,
            "VeryfiDocumentEventBrokerQueue"
        );
        const lambdaProducer = createResourceWithHyphenatedName(
            props.env.region,
            props.stageName,
            "VeryfiDocumentEventProducerLambda"
        );
        const lambdaConsumer = createResourceWithHyphenatedName(
            props.env.region,
            props.stageName,
            "VeryfiDocumentEventConsumerLambda"
        );
        const lambdaSecurityGroupName = createResourceWithHyphenatedName(
            props.env.region,
            props.stageName,
            "VeryfiLambdaSecurityGroup"
        );
        const assetBucketArn = Fn.importValue("AssetBucketArnExport");
        const assetBucket = Bucket.fromBucketArn(
            this,
            "ImportedAssetBucket",
            assetBucketArn
        );

        // Create the Veryfi-document-event-broker SQS queue and DLQ
        const veryfiDocumentEventDLQ: Queue = new Queue(this, dlqName, {
            queueName: dlqName,
        });
        const veryfiDocumentEventBrokerQueue: Queue = new Queue(
            this,
            queueName,
            {
                visibilityTimeout: Duration.minutes(5),
                deadLetterQueue: {
                    queue: veryfiDocumentEventDLQ,
                    maxReceiveCount: 5,
                },
                queueName: queueName,
            }
        );

        // Create the Veryfi-document-event-producer Lambda function
        const veryfiDocumentEventProducer = new lambda.Function(
            this,
            "VeryfiDocumentEventProducer",
            {
                runtime: lambda.Runtime.NODEJS_18_X,
                handler: "index.handler",
                timeout: Duration.seconds(30),
                functionName: lambdaProducer,
                code: lambda.Code.fromAsset(
                    `${process.env.CODEBUILD_SRC_DIR}/lib/veryfi-integration/lambda/event-producer`
                ),
                environment: {
                    CLIENT_ID: "vrfum8CF1oC7ka104tjEBKfmf4NYiE3gzLo8igS",
                    CLIENT_SECRET:
                        "FwxDFcfuZw7PTt0iARJxtp3w3JoET7vRePhIU1FbR2ytU7VLzUkeKYsVBXd8CSM8Xgl8SrE5Do0brNu0kuczzGTiWmTKzTVFJFFBueH66vXU34r2RYZV2eguwkV0tjoc",
                    USERNAME: "chaamail",
                    API_KEY: "1f1e83e8e9d688f57d0321728d384ba8",
                    SQS_QUEUE_URL: veryfiDocumentEventBrokerQueue.queueUrl,
                    TIME_INTERVAL_IN_MINUTES:
                        props.stageName === "development" ? "60" : "15",
                },
            }
        );

        // Create the Veryfi-document-event-consumer Lambda function
        const veryfiDocumentEventConsumer = new lambda.Function(
            this,
            "VeryfiDocumentEventConsumer",
            {
                runtime: lambda.Runtime.NODEJS_18_X,
                handler: "index.handler",
                timeout: Duration.seconds(30),
                memorySize: 256,
                functionName: lambdaConsumer,
                vpc: props.vpc,
                code: lambda.Code.fromAsset(
                    `${process.env.CODEBUILD_SRC_DIR}/lib/veryfi-integration/lambda/event-consumer`
                ),
                environment: {
                    BUCKET_NAME: assetBucket.bucketName,
                    RDS_DB_PASS_SECRET_ID: props.dbCredentialsSecretName.value,
                    RDS_DB_NAME: props.defaultDBName,
                },
                layers: [...props.databaseLambdaLayer],
            }
        );

        // Lambda security group
        const veryfiIntegrationLambdaSecurityGroup = new SecurityGroup(
            this,
            lambdaSecurityGroupName,
            {
                vpc: props.vpc,
                description:
                    "Security group for the lambda functions that use Veryfi as an Ingress and oneXerp database as an Egress",
                allowAllOutbound: true,
            }
        );

        // Get the security group from ID
        const databaseSecurityGroup = SecurityGroup.fromSecurityGroupId(
            this,
            "ImportedOneXerpDatabaseSecurityGroup",
            props.databaseSecurityGroup.securityGroupId
        );

        // Adds ingress and egress in the database security group from the veryfiIntegrationLambdaSecurityGroup
        veryfiIntegrationLambdaSecurityGroup.connections.allowTo(
            databaseSecurityGroup,
            Port.tcp(443),
            "Allow Lambda endpoints to access the oneXerp database"
        );

        // Make VeryfiDocumentEvent Producer a CRON JOB running on an an hourly basis in dev and every 15 minutes in prod
        const cronJobEvenRule = new aws_events.Rule(this, "VeryfiCronJobRule", {
            schedule: aws_events.Schedule.cron({
                minute:
                    props.stageName.toLowerCase() === "development"
                        ? "0"
                        : "0/15",
            }),
        });
        cronJobEvenRule.addTarget(
            new aws_events_targets.LambdaFunction(veryfiDocumentEventProducer)
        );

        // Create the event source mapping between the veryfiDocumentEventConsumer and the VeryfiDocumentEventBrokerQueue
        veryfiDocumentEventConsumer.addEventSource(
            new SqsEventSource(veryfiDocumentEventBrokerQueue)
        );

        // Grant Producer and consumer permissions to Broker
        veryfiDocumentEventBrokerQueue.grantSendMessages(
            veryfiDocumentEventProducer
        );
        veryfiDocumentEventBrokerQueue.grantConsumeMessages(
            veryfiDocumentEventConsumer
        );

        // Grant Consumer write access to the veryfi image bucket
        assetBucket.grantWrite(veryfiDocumentEventConsumer);

        // Grant Event Consumer access to the secrets manager for DB credentials
        // Create a Secrets Manager access policy
        const secretsManagerAccessPolicy = new Policy(
            this,
            "SecretsManagerAccessPolicy",
            {
                statements: [
                    new PolicyStatement({
                        effect: Effect.ALLOW,
                        actions: [
                            "secretsmanager:GetSecretValue",
                            "kms:Decrypt",
                        ],
                        resources: [props.databaseCredentialsSecretArn.value],
                    }),
                ],
            }
        );

        // Attach the Secrets Manager access policy to the role
        veryfiDocumentEventConsumer.role?.attachInlinePolicy(
            secretsManagerAccessPolicy
        );
    }
}

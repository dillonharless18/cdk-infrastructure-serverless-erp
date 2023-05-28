import * as lambda from "aws-cdk-lib/aws-lambda";
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { Duration } from 'aws-cdk-lib';
import { Queue } from 'aws-cdk-lib/aws-sqs';
import { Construct }   from 'constructs';
import { createResourceWithHyphenatedName } from "../util/helper";
import { 
    ISecurityGroup, 
    IVpc,
    Port,
    SecurityGroup, 
  } from 'aws-cdk-lib/aws-ec2';
import { PolicyStatement } from "aws-cdk-lib/aws-iam/lib/policy-statement";

export interface VeryfiIntegrationConstructProps {
    env: {
      region:  string
    }
    databaseSecurityGroup: ISecurityGroup;
    stageName: string;
    vpc: IVpc;
    databaseLambdaLayer: lambda.LayerVersion[];
}

export class VeryfiIntegrationConstruct extends Construct {
  constructor(scope: Construct, id: string, props: VeryfiIntegrationConstructProps) {
    super(scope, id);

    const dlqName = createResourceWithHyphenatedName(props.env.region, props.stageName, 'VeryfiDocumentEventDLQ')
    const queueName = createResourceWithHyphenatedName(props.env.region, props.stageName, 'VeryfiDocumentEventBrokerQueue')
    const lambdaProducer = createResourceWithHyphenatedName(props.env.region, props.stageName, 'VeryfiDocumentEventProducerLambda')
    const lambdaConsumer = createResourceWithHyphenatedName(props.env.region, props.stageName, 'VeryfiDocumentEventConsumerLambda')
    const lambdaSecurityGroupName = createResourceWithHyphenatedName(props.env.region, props.stageName, 'VeryfiLambdaSecurityGroup')

    // Create the Veryfi-document-event-producer Lambda function
    const veryfiDocumentEventProducer = new lambda.Function(this, 'VeryfiDocumentEventProducer', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      timeout: Duration.seconds(30),
      functionName: lambdaProducer,
      vpc: props.vpc,
      code: lambda.Code.fromAsset(`${process.env.CODEBUILD_SRC_DIR}/lib/veryfi-integration/lambda/event-producer`),
      environment: {
        CLIENT_ID: 'vrfum8CF1oC7ka104tjEBKfmf4NYiE3gzLo8igS',
        CLIENT_SECRET: 'FwxDFcfuZw7PTt0iARJxtp3w3JoET7vRePhIU1FbR2ytU7VLzUkeKYsVBXd8CSM8Xgl8SrE5Do0brNu0kuczzGTiWmTKzTVFJFFBueH66vXU34r2RYZV2eguwkV0tjoc',
        USERNAME: 'chaamail',
        API_KEY: '1f1e83e8e9d688f57d0321728d384ba8',
      }
    });

    // Create the Veryfi-document-event-consumer Lambda function
    const veryfiDocumentEventConsumer = new lambda.Function(this, 'VeryfiDocumentEventConsumer', {
        runtime: lambda.Runtime.NODEJS_18_X,
        handler: 'index.handler',
        timeout: Duration.seconds(60),
        functionName: lambdaConsumer,
        vpc: props.vpc,
        code: lambda.Code.fromAsset(`${process.env.CODEBUILD_SRC_DIR}/lib/veryfi-integration/lambda/event-consumer`),
        layers: [...props.databaseLambdaLayer],
      });
    
    // Create the Veryfi-document-event-broker SQS queue and DLQ
    const veryfiDocumentEventDLQ : Queue = new Queue(this, dlqName);
    const veryfiDocumentEventBrokerQueue : Queue = new Queue(this, queueName, {
      visibilityTimeout: Duration.minutes(5),
      deadLetterQueue: {
        queue: veryfiDocumentEventDLQ,
        maxReceiveCount: 5
      }
    })

    // Lambda security group
    const veryfiIntegrationLambdaSecurityGroup = new SecurityGroup(this, lambdaSecurityGroupName, {
        vpc: props.vpc,
        description: 'Security group for the lambda functions that use Veryfi as an Ingress and oneXerp database as an Egress',
        allowAllOutbound: true,
      });
  
    // Get the security group from ID
    const databaseSecurityGroup = SecurityGroup.fromSecurityGroupId(this, 'ImportedOneXerpDatabaseSecurityGroup', props.databaseSecurityGroup.securityGroupId);
  
    // Adds egress to the database security group, and ingress in the database security group from the veryfiIntegrationLambdaSecurityGroup    
    veryfiIntegrationLambdaSecurityGroup.connections.allowTo(databaseSecurityGroup, Port.tcp(443), 'Allow Lambda endpoints to access the oneXerp database');

    // Create the event source mapping between the veryfiDocumentEventConsumer and the VeryfiDocumentEventBrokerQueue
     veryfiDocumentEventConsumer.addEventSource(new SqsEventSource(veryfiDocumentEventBrokerQueue));

    // Grant Producer and consumer permissions to Broker
    veryfiDocumentEventBrokerQueue.grantSendMessages(veryfiDocumentEventProducer);
    veryfiDocumentEventBrokerQueue.grantConsumeMessages(veryfiDocumentEventConsumer);

    // Grant Event Consumer access to the secrets manager for DB credentials
    const secretsManagerAccessPolicy = new PolicyStatement({
        actions: ['secretsmanager:GetSecretValue'],
        resources: [`*`],
      });
    veryfiDocumentEventConsumer.addToRolePolicy(secretsManagerAccessPolicy);
  }
}


// Import required libraries and classes
import * as path from 'path';
import { Construct } from 'constructs';
import { CfnOutput, Duration } from 'aws-cdk-lib';
import { SecurityGroup, Vpc } from 'aws-cdk-lib/aws-ec2';
import { Effect, ManagedPolicy, PolicyDocument, PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import * as lambda from "aws-cdk-lib/aws-lambda";

export class SeedLambdaConstruct extends Construct {
  public readonly lambdaFunctionName: string;
  public readonly crossAccountLambdaInvokeRoleName: string = 'CrossAccountLambdaInvokeRole';

  constructor(
    scope: Construct, 
    id: string, 
    dbCredentialsSecretName: CfnOutput, 
    dbCredentialsSecretArn: CfnOutput, 
    vpc: Vpc, 
    securityGroup: SecurityGroup, 
    defaultDBName: string, 
    lambdaLayers: lambda.LayerVersion[],
    stageName: string,
  ) {
    super(scope, id);

    // Define the Lambda function name
    this.lambdaFunctionName = `database-seed-lambda-function-${stageName}`;

    // Define the Lambda execution role with necessary permissions
    const lambdaRole = new Role(this, 'SeedLambdaExecutionRole', {
      assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        // Add the AWS Lambda basic execution and VPC access execution roles
        ManagedPolicy.fromManagedPolicyArn(this, 'LambdaBasicExecution', 'arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole'),
        ManagedPolicy.fromManagedPolicyArn(this, 'LambdaVPCExecution', 'arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole'),
      ],
      // Add inline policy for Secrets Manager access
      inlinePolicies: {
        secretsManagerPermissions: new PolicyDocument({
          statements: [
            new PolicyStatement({
              effect: Effect.ALLOW,
              actions: [
                'secretsmanager:GetSecretValue',
                'kms:Decrypt',
              ],
              resources: [
                dbCredentialsSecretArn.value
              ]
            }),
          ]
        })
      }
    })

    const lambdaFunction = new lambda.Function(this, 'SeedLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      functionName: this.lambdaFunctionName,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, 'seed')),
      timeout: Duration.minutes(10),
      vpc: vpc,
      securityGroups: [securityGroup],
      role: lambdaRole,
      environment: {
        RDS_DB_PASS_SECRET_ID: dbCredentialsSecretName.value,
        RDS_DB_NAME: defaultDBName,
      },
      layers: [...lambdaLayers]
    });
  }
}

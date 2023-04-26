// Import required libraries and classes
import * as path from 'path';
import { Construct } from 'constructs';
import { CfnOutput, Duration } from 'aws-cdk-lib';
import { SecurityGroup, Vpc } from 'aws-cdk-lib/aws-ec2';
import { LogLevel, NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { AccountPrincipal, Effect, ManagedPolicy, PolicyDocument, PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { existsSync } from 'fs';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import * as lambda from "aws-cdk-lib/aws-lambda";

/**
 * A stack for our simple Lambda-powered web service
 */
export class MigrationsLambdaConstruct extends Construct {
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
    crossAccount: boolean, 
    stageName: string, 
    devAccountId?: string
  ) {
    super(scope, id);

    // Define the Lambda function name
    this.lambdaFunctionName = `MigrationsFunction-${stageName}`;

    // Define the Lambda execution role with necessary permissions
    const lambdaRole = new Role(this, 'LambdaExecutionRole', {
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

    // TODO TS bundling wasn't working, so I converted to a normal Function (no bundling here)
    
    // Create the Lambda function with necessary configuration
    // const lambdaFunction = new NodejsFunction(this, 'Lambda', {
    //   functionName: this.lambdaFunctionName,
    //   handler: 'handler',
    //   entry: path.resolve(__dirname, 'lambda/handler.ts'),
    //   timeout: Duration.minutes(10),
    //   bundling: {
    //     minify: false,
    //     environment: {
    //       NODE_ENV: "production"
    //     },
    //     logLevel: LogLevel.INFO,
    //     forceDockerBundling: true,
    //     externalModules: [
    //       'aws-sdk'
    //     ],
    //     nodeModules: [
    //       'knex',
    //       'pg'
    //     ],
    //     commandHooks: {
    //       afterBundling(inputDir: string, outputDir: string): string[] {
    //         console.log('Input directory:', inputDir);
    //         console.log('Output directory:', outputDir);
    //         // return [`cp -r ${inputDir}/migrations ${outputDir}`, `find ${outputDir}/migrations -type f ! -name '*.js' -delete`];
    //         return [`cp -r ${inputDir}/migrations ${outputDir}`];
    //       },
    //       beforeBundling(inputDir: string, outputDir: string) {
    //         console.log('Input directory:', inputDir);
    //         console.log('Output directory:', outputDir);
    //         return [];
    //       },
    //       beforeInstall(inputDir: string, outputDir: string) {
    //         console.log('Input directory:', inputDir);
    //         console.log('Output directory:', outputDir);
    //         return [];
    //       }
    //     },
    //     target: 'es2020'
    //   },
    //   // runtime: Runtime.NODEJS_16_X,
    //   depsLockFilePath: path.resolve(__dirname, 'lambda', 'package-lock.json'),
    //   // depsLockFilePath: path.join(__dirname, "lambda/package-lock.json"),
    //   projectRoot: path.resolve(__dirname, 'lambda'),
    //   environment: {
    //     RDS_DB_PASS_SECRET_ID: dbCredentialsSecretName.value,
    //     RDS_DB_NAME: defaultDBName
    //   },
    //   vpc: vpc,
    //   role: lambdaRole,
    //   securityGroups: [
    //     securityGroup
    //   ]
    // })

    const lambdaFunction = new lambda.Function(this, 'MigrationLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      functionName: this.lambdaFunctionName,
      handler: 'handler.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, 'lambda')),
      timeout: Duration.minutes(10),
      vpc: vpc,
      securityGroups: [securityGroup],
      role: lambdaRole,
      environment: {
        RDS_DB_PASS_SECRET_ID: dbCredentialsSecretName.value,
        RDS_DB_NAME: defaultDBName
      },
    });



    // If crossAccount is set to true, create a role for invoking the Lambda function from another account
    if (crossAccount) {
      new Role(this, 'CrossAccountLambdaInvokeRole', {
        roleName: this.crossAccountLambdaInvokeRoleName,
        assumedBy: new AccountPrincipal(devAccountId),
        inlinePolicies: {
          invokeLambdaPermissions: new PolicyDocument({
            statements: [
              // Allow passing roles across accounts
              new PolicyStatement({
                effect: Effect.ALLOW,
                actions: ['iam:PassRole'],
                resources: ['*']
              }),
              // Allow invoking the Lambda function
              new PolicyStatement({
                effect: Effect.ALLOW,
                actions: ['lambda:InvokeFunction'],
                // resources: [func.functionArn],
                resources: [lambdaFunction.functionArn],
              }),
            ]
          })
        }
      })
    }
  }
}

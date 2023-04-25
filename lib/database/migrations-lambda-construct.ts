// Import required libraries and classes
import * as path from 'path';
import { Construct } from 'constructs';
import { CfnOutput, Duration } from 'aws-cdk-lib';
import { SecurityGroup, Vpc } from 'aws-cdk-lib/aws-ec2';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { AccountPrincipal, Effect, ManagedPolicy, PolicyDocument, PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { existsSync } from 'fs';

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
    
    // Set the path to the migrations lambda directory
    const migrationsLambdaFolder = path.resolve(__dirname, '../../lambdas/migrationsLambda');
    const testMigrationsLambdaFolder = path.resolve(__dirname, '../../test_lambdas/migrationsLambda/');
    const migrationsFunctionFolder = existsSync(migrationsLambdaFolder) ? migrationsLambdaFolder : testMigrationsLambdaFolder;
    console.log(`functionsPath: ${migrationsFunctionFolder}`)

    // Set the path to the migrations lambda handler
    const migrationsLambdaPath = path.resolve(__dirname, '../../lambdas/migrationsLambda/handler.js');
    const testMigrationsLambdaPath = path.resolve(__dirname, '../../test_lambdas/migrationsLambda/handler.js');
    const migrationsFunctionPath = existsSync(migrationsLambdaPath) ? migrationsLambdaPath : testMigrationsLambdaPath;
    console.log(`migrationsFunctionPath: ${migrationsFunctionPath}`)


    // Create the Lambda function with necessary configuration
    const func = new NodejsFunction(this, 'Lambda', {
      functionName: this.lambdaFunctionName,
      handler: 'handler',
      entry: path.resolve(__dirname, migrationsFunctionPath),
      timeout: Duration.minutes(10),
      bundling: {
        externalModules: [
          'aws-sdk'
        ],
        nodeModules: [
          'knex',
          'pg'
        ],
        commandHooks: {
          afterBundling(inputDir: string, outputDir: string): string[] {
            return [`cp -r ${inputDir}/migrations ${outputDir}`, `find ${outputDir}/migrations -type f ! -name '*.js' -delete`];
          },
          beforeBundling() {
            return [];
          },
          beforeInstall() {
            return [];
          }
        }
      },
      depsLockFilePath: path.resolve(__dirname, migrationsFunctionFolder, 'package-lock.json'),
      projectRoot: path.resolve(__dirname, migrationsFunctionFolder),
      environment: {
        RDS_DB_PASS_SECRET_ID: dbCredentialsSecretName.value,
        RDS_DB_NAME: defaultDBName
      },
      vpc: vpc,
      role: lambdaRole,
      securityGroups: [
        securityGroup
      ]
    })

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
                resources: [func.functionArn],
              }),
            ]
          })
        }
      })
    }
  }
}

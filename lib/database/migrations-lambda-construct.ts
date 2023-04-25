// Import required libraries and classes
import * as path from 'path';
import { Construct } from 'constructs';
import { CfnOutput, Duration } from 'aws-cdk-lib';
import { SecurityGroup, Vpc } from 'aws-cdk-lib/aws-ec2';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
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
    
    // Set the path to the migrations lambda directory
    const realMigrationsLambdaFolderPath = path.resolve(__dirname, '../../lambdas/migrationsLambda');
    const testMigrationsLambdaFolderPath = path.resolve(__dirname, '../../test_lambdas/migrationsLambda');
    const migrationsLambdaFolderPath = existsSync(realMigrationsLambdaFolderPath) ? realMigrationsLambdaFolderPath : testMigrationsLambdaFolderPath;
    console.log(`functionsPath: ${migrationsLambdaFolderPath}`)


    // Create the Lambda function with necessary configuration
    // const func = new NodejsFunction(this, 'Lambda', {
    //   functionName: this.lambdaFunctionName,
    //   handler: 'handler',
    //   // entry: path.resolve(__dirname, `${migrationsLambdaFolderPath}/handler.ts`),
    //   entry: path.resolve(`${migrationsLambdaFolderPath}/handler.ts`),
    //   timeout: Duration.minutes(10),
    //   bundling: {
    //     externalModules: [
    //       'aws-sdk'
    //     ],
    //     nodeModules: [
    //       'knex',
    //       'pg'
    //     ],
    //     commandHooks: {
    //       afterBundling(inputDir: string, outputDir: string): string[] {
    //         return [
    //           `cp -r ${inputDir}/migrations ${outputDir}`,
    //           `find ${outputDir}/migrations -type f ! -name '*.js' -delete`,
    //           // `ls -la ${outputDir} > ${outputDir}/output.log`, // Keep this line
    //           // `cp ${outputDir}/output.log ${testMigrationsLambdaFolderPath}/output.log`, // Add this line
    //         ];
    //       },
          
    //       beforeBundling() {
    //         return [];
    //       },
    //       beforeInstall() {
    //         return [];
    //       }
    //     }
    //   },
    //   // runtime: Runtime.NODEJS_18_X,
    //   // depsLockFilePath: path.resolve(__dirname, migrationsLambdaFolderPath, 'package-lock.json'),
    //   // projectRoot: path.resolve(__dirname, migrationsLambdaFolderPath),
    //   depsLockFilePath: path.resolve(migrationsLambdaFolderPath, 'package-lock.json'),
    //   projectRoot: path.resolve(migrationsLambdaFolderPath),
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
    
    const lambdaFunction = new lambda.Function(this, `MigrationsLambda`, {
      code: lambda.Code.fromAsset(path.join(migrationsLambdaFolderPath)),
      handler: 'index.handler',
      runtime: lambda.Runtime.NODEJS_18_X,
      functionName: `MigrationsLambda`, // TODO see if this will be problematic at all 
      // vpc: databaseVpc,
      vpc: vpc,
      // vpcSubnets: { subnetType: SubnetType.PRIVATE_WITH_EGRESS },
      securityGroups: [securityGroup],
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

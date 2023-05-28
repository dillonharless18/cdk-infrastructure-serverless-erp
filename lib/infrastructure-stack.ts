import { AuroraServerlessV2Construct } from './database/aurora-serverless-v2-construct';
import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { MigrationsLambdaConstruct } from './database/migrations-lambda-construct';
import { CognitoConstruct } from './cognito/cognito-construct';
import { ApiConstruct } from './api/api-construct';
import { SeedLambdaConstruct } from './database/seed-database-lambda-construct';
import { VeryfiIntegrationConstruct } from './veryfi-integration/veryfi-integration-construct';
import { env } from 'process';

interface InfrastructureStackProps extends StackProps {
    applicationName: string;
    domainName: string;
    env: {
        account: string;
        region:  string;
    }
    apiName: string;
    certificateArn: string;
    crossAccount: boolean;
    stageName: string;
    devAccountId: string;
    customOauthCallbackURLsList: string[];
    customOauthLogoutURLsList: string[];
}

/**
 * Main stack to combine other nested stacks (CDK Constructs)
 */
export class InfrastructureStack extends Stack {
  public readonly lambdaFunctionName: string;
  public readonly crossAccountLambdaInvokeRoleName: string;

  constructor(scope: Construct, id: string, props?: InfrastructureStackProps) {
    super(scope, id, props);

    if ( !props ) throw Error ("props is not defined")

    const database = new AuroraServerlessV2Construct(this, 'DatabaseConstruct', { 
      stageName: props.stageName 
    })
    
    const cognito = new CognitoConstruct(this, 'CognitoConstruct', {
        applicationName: props.applicationName,
        domainName: props.domainName,
        env: props.env,
        stageName: props.stageName,
        customOauthCallbackURLsList: [...props.customOauthCallbackURLsList],
        customOauthLogoutURLsList: [...props.customOauthLogoutURLsList],
    })

    const api = new ApiConstruct(this, 'ApiStack', {
        apiName: props.apiName,
        certficateArn: props.certificateArn,
        domainName: props.domainName,
        env: props.env,
        stageName: props.stageName,
        userPool: cognito.userPool,
        appClient: cognito.appClient,
        databaseSecurityGroup: database.securityGroup,
        vpc: database.vpc,
        dbCredentialsSecretName: database.secretName, 
        dbCredentialsSecretArn: database.secretArn, 
        defaultDBName: database.defaultDatabaseName,
        APIRoles: {
          admin: cognito.adminRole,
          driver: cognito.driverRole,
          basicuser: cognito.basicUserRole,
          logistics: cognito.logisticsRole,
          projectmanager: cognito.projectManagerRole
        },        
    });

    const migrationsLambda = new MigrationsLambdaConstruct(
      this, 
      'MigrationsLambda', 
      database.secretName, 
      database.secretArn, 
      database.vpc, 
      database.securityGroup,
      database.defaultDatabaseName,
      [api.databaseLambdaLayer],
      props.crossAccount,
      props.stageName,
      props.devAccountId,
    );
    this.lambdaFunctionName = migrationsLambda.lambdaFunctionName;
    this.crossAccountLambdaInvokeRoleName = migrationsLambda.crossAccountLambdaInvokeRoleName;

    const seedLambda = new SeedLambdaConstruct(
      this, 
      'SeedLambda', 
      database.secretName, 
      database.secretArn, 
      database.vpc, 
      database.securityGroup,
      database.defaultDatabaseName,
      [api.databaseLambdaLayer],
      props.stageName,
    );

    const verifyIntegrationStack = new VeryfiIntegrationConstruct(this, 'VerifyIntegration', {
      env: props.env,
      databaseSecurityGroup: database.securityGroup,
      stageName: props.stageName,
      vpc: database.vpc,
      databaseLambdaLayer: [api.databaseLambdaLayer]
    });
    
  }
}

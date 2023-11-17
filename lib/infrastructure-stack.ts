import { AuroraServerlessV2Construct } from './database/aurora-serverless-v2-construct';
import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { MigrationsLambdaConstruct } from './database/migrations-lambda-construct';
import { CognitoConstruct } from './cognito/cognito-construct';
import { ApiConstruct } from './api/api-construct';
import { SeedLambdaConstruct } from './database/seed-database-lambda-construct';
import { VeryfiIntegrationConstruct } from './veryfi-integration/veryfi-integration-construct';
import { ExtensibleFinanceConstruct } from './extensible-finance-module/extensible-finance-module';

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
    corsS3AssetsAllowedOrigins: string[];
    customOauthCallbackURLsList: string[];
    customOauthLogoutURLsList: string[];
    enableQBDIntegration: boolean;
    amiNameQBD?: string;
    amiOwnersQBD?: string[];
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

    const extensibleFinanceModule = new ExtensibleFinanceConstruct(this, 'ExtensibleFinanceModule', {
      applicationName: props.applicationName,
      enableQBDIntegration: props.enableQBDIntegration,
      amiNameQBD: props.amiNameQBD,
      amiOwnersQBD: props.amiOwnersQBD,
      vpc: database.vpc, 
    })
    
    const cognito = new CognitoConstruct(this, 'CognitoConstruct', {
        applicationName: props.applicationName,
        domainName: props.domainName,
        env: props.env,
        stageName: props.stageName,
        corsS3AssetsAllowedOrigins: props.corsS3AssetsAllowedOrigins,
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
        ingressQueue: extensibleFinanceModule.ingressQueue ? extensibleFinanceModule.ingressQueue : null,
        egressQueue:  extensibleFinanceModule.egressQueue  ? extensibleFinanceModule.egressQueue  : null,
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
      databaseCredentialsSecretArn: database.secretArn, 
      dbCredentialsSecretName: database.secretName,
      defaultDBName: database.defaultDatabaseName,
      stageName: props.stageName,
      vpc: database.vpc,
      databaseLambdaLayer: [api.databaseLambdaLayer]
    });    
  }
}

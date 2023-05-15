import { AuroraServerlessV2Construct } from './database/aurora-serverless-v2-construct';
import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { MigrationsLambdaConstruct } from './database/migrations-lambda-construct';
import { CognitoConstruct } from './cognito/cognito-construct';
import { ApiConstruct } from './api/api-construct';
import { SeedLambdaConstruct } from './database/seed-database-lambda-construct';

interface InfrastructureStackProps extends StackProps {
    applicationName: string;
    stage: string;
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

    const database = new AuroraServerlessV2Construct(this, 'DatabaseConstruct', { stageName: props.stageName })
    
    const cognito = new CognitoConstruct(this, 'CognitoConstruct', {
        applicationName: props.applicationName,
        domainName: props.domainName,
        env: props.env,
        stage: props.stage,
    })

    const api = new ApiConstruct(this, 'ApiStack', {
        apiName: props.apiName,
        certficateArn: props.certificateArn,
        domainName: props.domainName,
        env: props.env,
        stage: props.stage,
        userPool: cognito.userPool,
        databaseSecurityGroup: database.securityGroup,
        vpc: database.vpc,
        dbCredentialsSecretName: database.secretName, 
        dbCredentialsSecretArn: database.secretArn, 
        defaultDBName: database.defaultDatabaseName
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
    
  }
}

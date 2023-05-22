import { CfnOutput, RemovalPolicy } from 'aws-cdk-lib';
/* eslint-disable no-new */
/* eslint-disable import/prefer-default-export */

import { Duration }    from 'aws-cdk-lib';
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as lambda     from "aws-cdk-lib/aws-lambda";
import { Construct }   from 'constructs';
import { 
  ARecord, 
  HostedZone, 
  RecordTarget 
} from 'aws-cdk-lib/aws-route53';
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager';
import { ApiGatewayDomain } from 'aws-cdk-lib/aws-route53-targets';
import { 
  ISecurityGroup, 
  IVpc, 
  Port, 
  SecurityGroup, 
  SubnetType 
} from 'aws-cdk-lib/aws-ec2';
import { IUserPool, IUserPoolClient } from 'aws-cdk-lib/aws-cognito';
import { PolicyStatement, Role } from 'aws-cdk-lib/aws-iam';
import * as fs from "fs";
import path = require('path');
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';

// NOTE These are intentionally lower-case in order to strip and lower case all the roles sent in the metadata to look for the match here
type APIRoleOptions = 'admin' | 'basicuser' | 'driver' | 'logistics' | 'projectmanager'

interface ApiConstructProps {
    apiName: string,
    certficateArn: string; // Use for custom domain for API Gateway
    env: {
      account: string
      region:  string
    }
    domainName: string;
    databaseSecurityGroup: ISecurityGroup;
    stageName: string;
    userPool: IUserPool;
    appClient: IUserPoolClient;
    vpc: IVpc,
    dbCredentialsSecretName: CfnOutput, 
    dbCredentialsSecretArn: CfnOutput, 
    defaultDBName: string,
    APIRoles: Record<APIRoleOptions, Role>
}


export class ApiConstruct extends Construct {
  public readonly databaseLambdaLayer:   lambda.LayerVersion
  public readonly authorizerLambdaLayer: lambda.LayerVersion

  constructor(scope: Construct, id: string, props: ApiConstructProps) {
    super(scope, id);
    
    type stageToSubdomainTypes = {
        [key: string]: string
    }

    // Use to create api names
    const STAGE_NAME_WITH_HYPHEN_MAP: stageToSubdomainTypes = {
        development: 'development-',
        test:        'test-',
        prod:        ''
    }

    // Use to create subdomains programmatically like dev.example.com, test.example.com, example.com
    const STAGE_NAME_TO_SUBDOMAIN_MAP: stageToSubdomainTypes = {
        development: 'dev.',
        test:        'test.',
        prod:        ''
    }

    // Use to create subdomains programmatically like dev.example.com, test.example.com, example.com
    const STAGE_NAME_TO_API_STAGE_MAP: stageToSubdomainTypes = {
        development: 'dev',
        test:        'test',
        prod:        'prod'
    }

    const { apiName, stageName, certficateArn, domainName } = props

    if ( !domainName ) throw new Error(`Error in API stack. domainName does not exist on \n Props: ${JSON.stringify(props, null , 2)}`);
    
    if ( !stageName ) throw new Error(`Error in API stack. stageName does not exist on \n Props: ${JSON.stringify(props, null , 2)}`);
    
    if ( !certficateArn ) throw new Error(`Error in API stack. certificateArn does not exist on \n Props: ${JSON.stringify(props, null , 2)}`);
    

    // Pull in CW exports
    // const databaseSecurityGroupId = Fn.importValue(`DatabaseSecurityGroupId`);
    // const databaseVPCId = Fn.importValue(`DatabaseVPCArn`);

    //////////////////////////
    //    Lambda Layers     //
    //////////////////////////
    const databaseLayer = new lambda.LayerVersion(this, 'DatabaseLayer', {
      code: lambda.Code.fromAsset(`${process.env.CODEBUILD_SRC_DIR}/lib/lambda-layers/database-layer`),
      compatibleRuntimes: [lambda.Runtime.NODEJS_18_X],
      description: 'Exposes packages for db operations: knex, pg, and uuid.',
    });

    this.databaseLambdaLayer = databaseLayer

    const authorizerLayer = new lambda.LayerVersion(this, 'AuthorizerLayer', {
      code: lambda.Code.fromAsset(`${process.env.CODEBUILD_SRC_DIR}/lib/lambda-layers/authorizer-layer`),
      compatibleRuntimes: [lambda.Runtime.NODEJS_18_X],
      description: 'Exposes packages for authorization operations: aws-jwt-verify.',
    });

    this.authorizerLambdaLayer = authorizerLayer


    //////////////////////////
    //    End Lambda Layers //
    //////////////////////////

    //////////////////////////
    /////      API       /////
    //////////////////////////

    const subdomain = `${STAGE_NAME_TO_SUBDOMAIN_MAP[stageName]}${domainName}`

    // API Subdomain
    const apiSubdomain = `api.${subdomain}`

    // Create the API Gateway REST API
    let restApiName = `${STAGE_NAME_WITH_HYPHEN_MAP[stageName]}${apiName}`
    const api = new apigateway.RestApi(this, restApiName, {
      restApiName: restApiName,
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key', 'X-Amz-Security-Token', 'X-Amz-User-Agent'],
      },
      deployOptions: {
        stageName: STAGE_NAME_TO_API_STAGE_MAP[stageName]
      }
    });

    // Pull in the hosted zone
    const hostedZone = HostedZone.fromLookup(this, 'HostedZone', {
        domainName: `${STAGE_NAME_TO_SUBDOMAIN_MAP[stageName]}${domainName}`,
    });
  
    // Look up the certficate
    const certificate = Certificate.fromCertificateArn(this, `CertificateArn-${apiSubdomain}`, certficateArn);
  
    // Associate a custom domain with the API
    const customDomainName = api.addDomainName('CustomDomainName', {
      domainName: apiSubdomain, // Use the subdomain under the delegated domain
      certificate: certificate,
      endpointType: apigateway.EndpointType.REGIONAL,
      securityPolicy: apigateway.SecurityPolicy.TLS_1_2,
    });

    // Create a Route 53 alias record for the custom domain
    new ARecord(this, 'AliasRecord', {
        zone: hostedZone,
        recordName: apiSubdomain,
        target: RecordTarget.fromAlias(new ApiGatewayDomain(customDomainName)),
    });

    // TODO Look into API versioning and see if this should be handled more programmatically
    // Add the '/api/v1' base path for the API
    const apiV1 = api.root.addResource('api').addResource('v1');

    //////////////////////////
    /////    End API     /////
    //////////////////////////

    //////////////////////////
    ///      Lambdas       ///
    //////////////////////////

    // Create an S3 bucket to store the authorization config - happens after we aggregate lambda endpoint metadata
    // TODO Revisit this idea. If the total size of the authorizationConfig object won't pass 4K then we could just store it in the environment variables
    const configBucket = new Bucket(this, 'ConfigBucket', {
      removalPolicy: RemovalPolicy.DESTROY,
    });    

    // Custom Authorizer Lambda Function
    const customAuthorizerLambda = new lambda.Function(this, 'MigrationLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      functionName: 'lambdaAuthorizer',
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, 'lambda')),
      timeout: Duration.seconds(30),
      // securityGroups: [securityGroup],
      // role: lambdaRole,
      environment: {
        USER_POOL_ID: props.userPool.userPoolId,
        APP_CLIENT_ID: props.appClient.userPoolClientId,
        CONFIG_BUCKET_NAME: configBucket.bucketName,
      },
      layers: [authorizerLayer]
    });

    // Add a policy to the authorizer function's execution role to allow it to access the S3 bucket
    const bucketReadPolicy = new PolicyStatement({
      actions: ['s3:GetObject'],
      resources: [configBucket.bucketArn + '/*'],
    });
    customAuthorizerLambda.addToRolePolicy(bucketReadPolicy);


    // This environment variable is set by the codebuild project when it pulls in the lambdas repository
    // The symlink ('../lambdas') wasn't working properly for some reason, so just using the env variable
    const lambdasPathFromEnv = process.env.CODEBUILD_SRC_DIR_dillonCF_oneXerp_Lambdas_Source;
    if (!lambdasPathFromEnv) {
      console.log('Error: CODEBUILD_SRC_DIR_dillonCF_oneXerp_Lambdas_Source environment variable is not set.');
      process.exit(1);
    }
    // List the contents of the lambdas folder
    const contents = fs.readdirSync(lambdasPathFromEnv);
    console.log('Contents of lambdas folder:');
    console.log(contents);

    // Set the path to the Lambda functions directory
    const lambdasPath = path.join(lambdasPathFromEnv, '/endpoints')
    const testLambdasPath = path.resolve(__dirname, '../../test_lambdas/endpoints');
    const functionsPath = fs.existsSync(lambdasPath) ? lambdasPath : testLambdasPath;

    console.log(`functionsPath: ${functionsPath}`)

    // Lambda security group
    const lambdaEndpointsSecurityGroup = new SecurityGroup(this, 'LambdaEndpointsSecurityGroup', {
      // vpc: databaseVpc,
      vpc: props.vpc,
      description: 'Security group for Lambda API Endpoints',
      allowAllOutbound: true,
    });

    // Get the security group from ID
    const databaseSecurityGroup = SecurityGroup.fromSecurityGroupId(this, 'ImportedDatabaseSecurityGroup', props.databaseSecurityGroup.securityGroupId);

    // Adds egress to the database security group, and ingress in the database security group from the lambdaEndpointSecurityGroup    
    lambdaEndpointsSecurityGroup.connections.allowTo(databaseSecurityGroup, Port.tcp(443), 'Allow Lambda endpoints to access the database');


    
    // Create the custom authorizer on the API GW and link it to the Lambda
    const customAuthorizer = new apigateway.RequestAuthorizer(this, 'CustomAuthorizer', {
      handler: customAuthorizerLambda,
      identitySources: [apigateway.IdentitySource.header('Authorization')],
      resultsCacheTtl: Duration.minutes(3),
    });


    // Get the metadata for each Lambda function
    const functionMetadata = getFunctionMetadata(functionsPath);

    // Save the authorization config as determined by the functions' metadata files.
    const authorizationConfigFilePath = './authorizationConfig.json';
    fs.writeFileSync(authorizationConfigFilePath, JSON.stringify(functionMetadata));


    // Upload the config file to the S3 bucket
    new BucketDeployment(this, 'DeployConfig', {
      sources: [ Source.asset( path.dirname(authorizationConfigFilePath) ) ],
      destinationBucket: configBucket,
      destinationKeyPrefix: 'authorizationConfig', // Optional prefix in destination bucket
    });


    
    // Iterate through the metadata and create Lambda functions, integrations, and API Gateway resources
    functionMetadata.forEach((metadata) => {
      // Create the Lambda function
      const lambdaFunction = new lambda.Function(this, `Lambda-${metadata.name}`, {
        code: lambda.Code.fromAsset(path.join(functionsPath, metadata.name)),
        handler: 'index.handler',
        runtime: lambda.Runtime.NODEJS_18_X,
        functionName: `${metadata.name}`,
        // vpc: databaseVpc,
        vpc: props.vpc,
        vpcSubnets: { 
          subnetType: SubnetType.PRIVATE_WITH_EGRESS  
        },
        securityGroups: [lambdaEndpointsSecurityGroup],
        environment: metadata.environment ? { 
          ...metadata.environment,
          RDS_DB_PASS_SECRET_ID: props.dbCredentialsSecretName.value,
          RDS_DB_NAME: props.defaultDBName,
        } : {
          RDS_DB_PASS_SECRET_ID: props.dbCredentialsSecretName.value,
          RDS_DB_NAME: props.defaultDBName,
        },
        timeout: Duration.seconds(15),
        layers: [databaseLayer]
      });

      

      // Give the lambdas access to secrets
      const secretsManagerAccessPolicy = new PolicyStatement({
        actions: ['secretsmanager:GetSecretValue'],
        resources: [`*`],
      });
      lambdaFunction.addToRolePolicy(secretsManagerAccessPolicy);

      // Create the API Gateway integration for the Lambda function - works even for Lambdas in a VPC
      const lambdaIntegration = new apigateway.LambdaIntegration(lambdaFunction, {});

      // Add the resource and method to the API Gateway, using the metadata for the path and HTTP method
      const nestedResource = createNestedResource(apiV1, metadata.apiPath);

      // TODO - Change this to authorize all endpoints, just added for testing for now.
      if ( metadata.apiPath === 'test-auth' ) {
        nestedResource.addMethod(metadata.httpMethod, lambdaIntegration, {
          authorizationType: apigateway.AuthorizationType.CUSTOM,
          authorizer: customAuthorizer
        });  
      } else {
        nestedResource.addMethod(metadata.httpMethod, lambdaIntegration, {
          authorizationType: apigateway.AuthorizationType.NONE,
        });
      }
    });


    ///////////////////////////
    ///     End Lambdas     ///
    ///////////////////////////

  }
}


//////////////////////////
///      Helpers       ///
//////////////////////////

// Function to get metadata for Lambda functions
const getFunctionMetadata = (functionsPath: string) => {
  const functionDirectories = fs.readdirSync(functionsPath).filter((dir) => {
    return fs.lstatSync(path.join(functionsPath, dir)).isDirectory();
  });

  console.log('Function directories:', functionDirectories);

  const functionMetadata = functionDirectories.map((dir) => {
    const metadataPath = path.join(functionsPath, dir, 'metadata.json');
    if (fs.existsSync(metadataPath)) {
      const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
      console.log('Parsed metadata:', metadata);
      metadata.allowedGroups = metadata.allowedGroups || []; // Ensures we always have an array
      return metadata;
    } else {
      throw new Error(`metadata.json file is missing in the '${dir}' Lambda function directory.`);
    }
  });

  return functionMetadata;
}

// Function to create a nested resource for a given path
const createNestedResource = (parentResource: apigateway.Resource, path: string): apigateway.Resource => {
  const pathParts = path.split('/').filter((part) => part !== '');
  let currentResource = parentResource;

  for (const part of pathParts) {
    // Avoid synthing a duplicate API gateway resource to avoid error 
    let existingResource = currentResource.getResource(part);
    if (existingResource) {
      currentResource = existingResource as apigateway.Resource;
    } else {
      currentResource = currentResource.addResource(part);
    }
  }

  return currentResource;
}
import { CfnOutput } from 'aws-cdk-lib';
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
import { IUserPool } from 'aws-cdk-lib/aws-cognito';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import * as fs from "fs";
import path = require('path');

interface ApiConstructProps {
    apiName: string,
    certficateArn: string; // Use for custom domain for API Gateway
    env: {
      account: string
      region:  string
    }
    domainName: string;
    databaseSecurityGroup: ISecurityGroup;
    stage: string;
    userPool: IUserPool;
    vpc: IVpc,
    dbCredentialsSecretName: CfnOutput, 
    dbCredentialsSecretArn: CfnOutput, 
    defaultDBName: string, 
}

export class ApiConstruct extends Construct {
  public readonly databaseLambdaLayer: lambda.LayerVersion

  constructor(scope: Construct, id: string, props: ApiConstructProps) {
    super(scope, id);
    
    type stageToSubdomainTypes = {
        [key: string]: string
    }

    // Use to create api names
    const STAGE_WITH_HYPHEN_MAP: stageToSubdomainTypes = {
        development: 'development-',
        test:        'test-',
        prod:        ''
    }

    // Use to create subdomains programmatically like dev.example.com, test.example.com, example.com
    const STAGE_TO_SUBDOMAIN_MAP: stageToSubdomainTypes = {
        development: 'dev.',
        test:        'test.',
        prod:        ''
    }

    // Use to create subdomains programmatically like dev.example.com, test.example.com, example.com
    const STAGE_TO_API_STAGE_MAP: stageToSubdomainTypes = {
        development: 'dev',
        test:        'test',
        prod:        'prod'
    }

    const { apiName, stage, certficateArn, domainName } = props

    if ( !domainName ) throw new Error(`Error in API stack. domainName does not exist on \n Props: ${JSON.stringify(props, null , 2)}`);
    const DOMAIN_NAME = domainName;
    
    if ( !stage ) throw new Error(`Error in API stack. stage does not exist on \n Props: ${JSON.stringify(props, null , 2)}`);
    
    if ( !certficateArn ) throw new Error(`Error in API stack. certificateArn does not exist on \n Props: ${JSON.stringify(props, null , 2)}`);
    

    // Pull in CW exports
    // const databaseSecurityGroupId = Fn.importValue(`DatabaseSecurityGroupId`);
    // const databaseVPCId = Fn.importValue(`DatabaseVPCArn`);

    //////////////////////////
    /////      API       /////
    //////////////////////////

    const subdomain = `${STAGE_TO_SUBDOMAIN_MAP[stage]}${domainName}`

    // API Subdomain
    const apiSubdomain = `api.${subdomain}`

    // Create the API Gateway REST API
    let restApiName = `${STAGE_WITH_HYPHEN_MAP[stage]}${apiName}`
    const api = new apigateway.RestApi(this, restApiName, {
      restApiName: restApiName,
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key', 'X-Amz-Security-Token', 'X-Amz-User-Agent'],
      },
      deployOptions: {
        stageName: STAGE_TO_API_STAGE_MAP[stage]
      }
    });
    

    // Add Cognito Authorizer to the API Gateway
    // const userPoolArn = Fn.importValue('UserPoolArn');
    const authorizer = new apigateway.CfnAuthorizer(this, 'CognitoAuthorizer', {
      name: 'CognitoAuthorizer',
      type: 'COGNITO_USER_POOLS',
      identitySource: 'method.request.header.Authorization',
      // providerArns: [userPoolArn],
      providerArns: [props.userPool.userPoolArn],
      restApiId: api.restApiId,
    });

    // Pull in the hosted zone
    const hostedZone = HostedZone.fromLookup(this, 'HostedZone', {
        domainName: `${STAGE_TO_SUBDOMAIN_MAP[stage]}${domainName}`,
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
    //    Lambda Layers     //
    //////////////////////////
    const databaseLayer = new lambda.LayerVersion(this, 'DatabaseLayer', {
      code: lambda.Code.fromAsset(`${process.env.CODEBUILD_SRC_DIR}/lib/lambda-layers/database-layer`),
      compatibleRuntimes: [lambda.Runtime.NODEJS_18_X],
      description: 'Exposes packages for db operations: knex, pg, and uuid. TODO is to expose the reusable connection function itself.',
    });

    this.databaseLambdaLayer = databaseLayer
    //////////////////////////
    //    End Lambda Layers //
    //////////////////////////


    //////////////////////////
    ///      Lambdas       ///
    //////////////////////////

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
    // const lambdasPath = path.resolve(__dirname, '../lambdas/endpoints');
    const lambdasPath = path.join(lambdasPathFromEnv, '/endpoints')
    const testLambdasPath = path.resolve(__dirname, '../../test_lambdas/endpoints');
    const functionsPath = fs.existsSync(lambdasPath) ? lambdasPath : testLambdasPath;

    // If there are no lambda functions present in the endpoints folder of the Lambdas repository, we'll get this error: The REST API doesn't contain any methods
    // So we'll check if it's empty and if so, revert back to the testLambdasPath. We also revert if the lambdasPath was undefined
    // const functionsPath = ( fs.existsSync(lambdasPath) && fs.readdirSync(lambdasPath).length < 1 )
    //                       ? lambdasPath 
    //                       : testLambdasPath;

  

    console.log(`functionsPath: ${functionsPath}`)

    

    


    // Getting the vpcId that was stored in SSM during databaseStack synth - fromLookup doesn't work with a CfnOutput
    // const vpcId = StringParameter.valueFromLookup(this, 'DatabaseVPCId');
    
    // Pull in the databaseVPC
    // const databaseVpc = Vpc.fromLookup(this, 'ImportedDatabaseVPC', {
    //   vpcId: vpcId,
    // });

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




    // Get the metadata for each Lambda function
    const functionMetadata = getFunctionMetadata(functionsPath);
    
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
      nestedResource.addMethod(metadata.httpMethod, lambdaIntegration, {
        // TODO remove this or add it back based on how we authenticate
        // authorizationType: apigateway.AuthorizationType.COGNITO,
        // authorizer: {
        //   authorizerId: authorizer.ref,
        // },
        // authorizationScopes: metadata.allowedGroups.map((group: string) => `cognito-idp:${group}`),
        authorizationType: apigateway.AuthorizationType.NONE
      });
    });




    // TODO - Custom Authorizer

    // Create the custom authorizer Lambda function
    // const customAuthorizerFunction = new lambda.Function(this, 'CustomAuthorizerFunction', {
    //   runtime: lambda.Runtime.NODEJS_14_X,
    //   code: lambda.Code.fromAsset('path/to/custom-authorizer/folder'),
    //   handler: 'custom-authorizer.handler',
    // });

    // // Add the custom authorizer to your API Gateway
    // const customAuthorizerFunction = new lambda.Function(this, 'CustomAuthorizerFunction', {
    //   runtime: lambda.Runtime.NODEJS_14_X,
    //   handler: 'index.handler',
    //   code: lambda.Code.fromAsset('path/to/custom-authorizer'),
    //   environment: {
    //     METADATA_BUCKET_NAME: metadataBucket.bucketName,
    //   },
    // });

    // This code should be added to the resource to make them use the custom authorizer
    // const apiResource = api.root.addResource('endpoint-1');
    // const protectedRoute = apiResource.addMethod('GET', yourLambdaIntegration, {
    //   authorizationType: apigw.AuthorizationType.CUSTOM,
    //   authorizer: customAuthorizer,
    // });

    // Grant the custom authorizer Lambda function permission to read objects from the S3 bucket
    // const metadataBucket = s3.Bucket.fromBucketName(this, 'MetadataBucket', 'your-metadata-bucket-name');
    // metadataBucket.grantRead(customAuthorizerFunction);


    // S3 metadata bucket
    // const metadataBucket = new s3.Bucket(this, 'MetadataBucket', {
    //   removalPolicy: cdk.RemovalPolicy.DESTROY,
    //   autoDeleteObjects: true,
    //   versioned: false,
    //   blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    // });

    // TODO - update this to upload the metadata to the appropriate key (probably as the api path)
    // new s3deploy.BucketDeployment(this, 'DeployMetadata', {
    //   sources: [s3deploy.Source.asset('./metadata')],
    //   destinationBucket: metadataBucket,
    // });
    // metadataBucket.grantRead(customAuthorizerFunction);

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
/* eslint-disable no-new */
/* eslint-disable import/prefer-default-export */

import { CfnOutput, Fn, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as fs from "fs";
import path = require('path');
import { ARecord, HostedZone, RecordTarget } from 'aws-cdk-lib/aws-route53';
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager';
import { ApiGatewayDomain } from 'aws-cdk-lib/aws-route53-targets';
import { ISecurityGroup, IVpc, Port, SecurityGroup, SubnetType, Vpc } from 'aws-cdk-lib/aws-ec2';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { IUserPool } from 'aws-cdk-lib/aws-cognito';

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
    vpc: IVpc
}

export class ApiConstruct extends Construct {
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
    ///      Lambdas       ///
    //////////////////////////

    // Set the path to the Lambda functions directory
    const lambdasPath = path.resolve(__dirname, '../../lambdas/endpoints');
    const testLambdasPath = path.resolve(__dirname, '../../test_lambdas/endpoints');
    const functionsPath = fs.existsSync(lambdasPath) ? lambdasPath : testLambdasPath;
    console.log(`functionsPath: ${functionsPath}`)

    // Get the metadata for each Lambda function
    const functionMetadata = getFunctionMetadata(functionsPath);


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
    
    // Iterate through the metadata and create Lambda functions, integrations, and API Gateway resources
    functionMetadata.forEach((metadata) => {
      // Create the Lambda function
      const lambdaFunction = new lambda.Function(this, `Lambda-${metadata.name}`, {
        code: lambda.Code.fromAsset(path.join(functionsPath, metadata.name)),
        handler: 'index.handler',
        runtime: lambda.Runtime.NODEJS_18_X,
        functionName: `${metadata.name}`, // TODO see if this will be problematic at all 
        // vpc: databaseVpc,
        vpc: props.vpc,
        vpcSubnets: { subnetType: SubnetType.PRIVATE_WITH_EGRESS },
        securityGroups: [lambdaEndpointsSecurityGroup],
      });

      // Create the API Gateway integration for the Lambda function - works even for Lambdas in a VPC
      const lambdaIntegration = new apigateway.LambdaIntegration(lambdaFunction);

      // Add the resource and method to the API Gateway, using the metadata for the path and HTTP method
      const nestedResource = createNestedResource(apiV1, metadata.apiPath);
      nestedResource.addMethod(metadata.httpMethod, lambdaIntegration, {
        authorizationType: apigateway.AuthorizationType.COGNITO,
        authorizer: {
          authorizerId: authorizer.ref
        },
        authorizationScopes: metadata.allowedGroups.map((group: string) => `cognito-idp:${group}`),
      });
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
    currentResource = currentResource.addResource(part); // TODO decide whether the long resource names this is making is okay
  }

  return currentResource;
}
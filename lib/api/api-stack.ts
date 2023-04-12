// Contains the API Gateway, authorizers, Cognito, and IAM (not too sure about the last two)

// This file contains logic to act as an API builder:
// The general idea is that the developer of the lambdas will simply create a package of lambdas
// in which each lambda has its own folder. Inside that folder will exist a metadata.json file 
// which will includ the name of the function, the route for the api endpoint associated with it,
// a list of roles allowed to access that API, and other various config.

// Example:

//  Folder Structure
//  endpoints/
//      getAllUsers/
//          metadata.json
//          index.js
//              

// metadata.json
// {
//     "apiPath"    :  "posts",
//     "httpMethod" :  "GET",
//     "roles?"     :  ["basic-user", "logistics"],
//     "runtime?"   :  "NODE_JS_14_X"
// }
  

// TODO add some logic to the metadata.json file of the Lambda functions to allow the developer to pass the role that the function should be allowed to use


/* eslint-disable no-new */
/* eslint-disable import/prefer-default-export */

/* This page is inspired by this blog - https://awstip.com/aws-cdk-template-for-hosting-a-static-website-in-s3-served-via-cloudfront-e810ffcaff0c */

import { CfnOutput, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as fs from "fs";
import path = require('path');
import { ARecord, HostedZone, RecordTarget } from 'aws-cdk-lib/aws-route53';
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager';
import { ApiGatewayDomain } from 'aws-cdk-lib/aws-route53-targets';

interface ApiStackProps extends StackProps {
    apiName: string,
    certficateArn: string, // Use for custom domain for API Gateway
    branch: string;
    domainName: string;
}

export class ApiStack extends Stack {
  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);
    
    type branchToSubdomainTypes = {
        [key: string]: string
    }

    // Use to create api names
    const BRANCH_TO_STAGE_MAP: branchToSubdomainTypes = {
        development: 'development-',
        test:        'test-',
        main:        ''
    }

    // Use to create subdomains programmatically like dev.example.com, test.example.com, example.com
    const BRANCH_TO_SUBDOMAIN_MAP: branchToSubdomainTypes = {
        development: 'dev.',
        test:        'test.',
        main:        ''
    }

    const { apiName, branch, certficateArn, domainName } = props

    if ( !domainName ) throw new Error(`Error in API stack. domainName does not exist on \n Props: ${JSON.stringify(props, null , 2)}`);
    const DOMAIN_NAME = domainName;
    
    if ( !branch ) throw new Error(`Error in API stack. branch does not exist on \n Props: ${JSON.stringify(props, null , 2)}`);
    
    if ( !certficateArn ) throw new Error(`Error in API stack. certificateArn does not exist on \n Props: ${JSON.stringify(props, null , 2)}`);
    
    // Set the path to the Lambda functions directory
    const lambdasPath = path.resolve(__dirname, '../../lambdas');
    const testLambdasPath = path.resolve(__dirname, '../../test_lambdas');
    const functionsPath = fs.existsSync(lambdasPath) ? lambdasPath : testLambdasPath;
    console.log(`functionsPath: ${functionsPath}`)


    // Get the metadata for each Lambda function
    const functionMetadata = getFunctionMetadata(functionsPath);




    //////////////////////////
    /////      API       /////
    //////////////////////////

    const subdomain = `${BRANCH_TO_SUBDOMAIN_MAP[branch]}${domainName}`

    // API Subdomain
    const apiSubdomain = `api.${subdomain}`

    // Create the API Gateway REST API
    let restApiName = `${BRANCH_TO_STAGE_MAP[branch]}${apiName}`
    const api = new apigateway.RestApi(this, restApiName, {
      restApiName: restApiName,
    });

    // Pull in the hosted zone
    const hostedZone = HostedZone.fromLookup(this, 'HostedZone', {
        domainName: `${BRANCH_TO_SUBDOMAIN_MAP[branch]}${domainName}`,
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
    ///      Lambdas       ///
    //////////////////////////

    // TODO - Create the Lambda Authorizer(s)

    // Crate the Lambda endpoints

    // Iterate through the metadata and create Lambda functions, integrations, and API Gateway resources
    functionMetadata.forEach((metadata) => {
      // Create the Lambda function
      const lambdaFunction = new lambda.Function(this, `Lambda-${metadata.name}`, {
        code: lambda.Code.fromAsset(path.join(functionsPath, metadata.name)),
        handler: 'index.handler',
        runtime: lambda.Runtime.NODEJS_18_X,
      });

      // Create the API Gateway integration for the Lambda function
      const lambdaIntegration = new apigateway.LambdaIntegration(lambdaFunction);

      // Add the resource and method to the API Gateway, using the metadata for the path and HTTP method
      apiV1.addResource(metadata.apiPath).addMethod(metadata.httpMethod, lambdaIntegration);
    });
  }
}

// Function to get metadata for Lambda functions
function getFunctionMetadata(functionsPath: string) {
  const functionDirectories = fs.readdirSync(functionsPath).filter((dir) => {
    return fs.lstatSync(path.join(functionsPath, dir)).isDirectory();
  });

  console.log('Function directories:', functionDirectories);

  const functionMetadata = functionDirectories.map((dir) => {
    const metadataPath = path.join(functionsPath, dir, 'metadata.json');
    if (fs.existsSync(metadataPath)) {
      const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
      console.log('Parsed metadata:', metadata);
      return metadata;
    } else {
      throw new Error(`metadata.json file is missing in the '${dir}' Lambda function directory.`);
    }
  });

  return functionMetadata;
}
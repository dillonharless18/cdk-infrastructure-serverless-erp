#!/usr/bin/env node
/** This article discussess cross-account deployments: https://garbe.io/blog/2022/08/01/hey-cdk-how-to-cross-account-deployments/ */
/** This one too: https://taimos.de/blog/create-a-cicd-pipeline-for-your-cdk-app */

import * as cdk from 'aws-cdk-lib';
import { CodePipelineSource } from 'aws-cdk-lib/pipelines';
import { InfrastructurePipelineStack } from '../lib/pipeline/pipeline-stack';

require('dotenv').config({path:__dirname+'/./../../.env'})

// TODO We have a somewhat inconsistent use of 'prod' and 'production'

const app = new cdk.App();


const APPLICATION_NAME            = "oneXerp"
const AMI_NAME_QB_DEVELOPMENT     = "oneXerp"
const AMI_OWNERS_QB_DEVELOPMENT   = ["136559125535"]
const AMI_NAME_QB_PRODUCTION      = "oneXerp" // TODO see if this needs to change for production
const AMI_OWNERS_QB_PRODUCTION    = ["136559125535"] // TODO see if this needs to change for production
const API_NAME                    = "oneXerpAPI"
const CODESTAR_ARN                = "arn:aws:codestar-connections:us-east-1:136559125535:connection/c59440ca-db21-4051-b54a-810bbc89464f" // TODO see how programmatic we can make this
const DOMAIN_NAME                 = "onexerp.com"
const ENABLE_QBD_DEVELOPMENT      = true
const ENABLE_QBD_PRODUCTION       = true
const PIPELINE_NAME               = "InfrastructurePipeline"
const PIPELINE_STACK_NAME         = "InfrastructurePipelineStack"
const INFRA_REPO                  = "dillonCF/oneXerp-Infrastructure"
const LAMBDA_REPO                 = "dillonCF/oneXerp-Lambdas"
const CUSTOM_OAUTH_CALLBACK_URLS  = {
    development: ['https://dev.onexerp.com', 'http://localhost:3001','http://localhost:3000','http://localhost','https://localhost:3001'],
    prod: ['https://onexerp.com']
}
const CUSTOM_OAUTH_LOGOUT_URLS  = {
    development: ['https://dev.onexerp.com/logout','http://localhost:3001/logout','http://localhost:3000/logout','http://localhost/logout','https://localhost:3001/logout'],
    prod: ['https://onexerp.com/logout']
}



// environment variables set in the cdk-deploy-to script
const envVariables = {
    developmentAccount: '136559125535',
    productionAccount: '743614460397',
    region: 'us-east-1',
}

new InfrastructurePipelineStack(app, `${PIPELINE_STACK_NAME}`, envVariables, {
    amiNameQBDDevelopment:AMI_NAME_QB_DEVELOPMENT,
    amiOwnersQBDDevelopment:AMI_OWNERS_QB_DEVELOPMENT,
    amiNameQBDProduction:AMI_NAME_QB_PRODUCTION,
    amiOwnersQBDProduction:AMI_OWNERS_QB_PRODUCTION,
    apiName: API_NAME,
    applicationName: APPLICATION_NAME,
    domainName: DOMAIN_NAME,
    enableQBDIntegrationDevelopment: ENABLE_QBD_DEVELOPMENT,
    enableQBDIntegrationProduction: ENABLE_QBD_PRODUCTION,
    pipelineName: PIPELINE_NAME,
    env: {
        account: "136559125535",
        region: "us-east-1"
    },
    customOauthCallbackURLsMap: CUSTOM_OAUTH_CALLBACK_URLS,
    customOauthLogoutURLsMap: CUSTOM_OAUTH_LOGOUT_URLS,
    pipelineSource: CodePipelineSource.connection(INFRA_REPO, 'main', {
        connectionArn: CODESTAR_ARN
    }),
    source: CodePipelineSource.connection(LAMBDA_REPO, 'main', {
        connectionArn: CODESTAR_ARN
    })
});

function safelyRetrieveEnvVariable(envName: string): string {
    const variable = process.env[envName];
    if (!variable) {
      throw new Error(`The variable ${envName} is required as environment variable. 
      Either provide the variables, or run the cdk-* scripts provided by this module`);
    }
    return variable;
  }
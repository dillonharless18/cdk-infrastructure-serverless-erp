#!/usr/bin/env node
/** This article discussess cross-account deployments: https://garbe.io/blog/2022/08/01/hey-cdk-how-to-cross-account-deployments/ */
/** This one too: https://taimos.de/blog/create-a-cicd-pipeline-for-your-cdk-app */

import * as cdk from 'aws-cdk-lib';
import { CodePipelineSource } from 'aws-cdk-lib/pipelines';
import { InfrastructurePipelineStack } from '../lib/pipeline/pipeline-stack';

require('dotenv').config({path:__dirname+'/./../../.env'})

const app = new cdk.App();

const APPLICATION_NAME    = "oneXerp"
const API_NAME            = "oneXerpAPI"
const CODESTAR_ARN    = "arn:aws:codestar-connections:us-east-1:136559125535:connection/c59440ca-db21-4051-b54a-810bbc89464f"
const DOMAIN_NAME         = "onexerp.com"
const PIPELINE_NAME       = "InfrastructurePipeline"
const PIPELINE_STACK_NAME = "InfrastructurePipelineStack"
const INFRA_REPO          = "dillonCF/oneXerp-Infrastructure"
const LAMBDA_REPO         = "dillonCF/oneXerp-Lambdas"



// environment variables set in the cdk-deploy-to script
const envVariables = {
    developmentAccount: 136559125535,
    productionAccount: 743614460397,
    region: 'us-east-1',
}

new InfrastructurePipelineStack(app, `${PIPELINE_STACK_NAME}`, envVariables, {
    apiName: API_NAME,
    applicationName: APPLICATION_NAME,
    domainName: DOMAIN_NAME,
    pipelineName: PIPELINE_NAME,
    env: {
        account: process.env.CDK_DEVELOPMENT_ACCOUNT || process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.REGION || process.env.CDK_DEFAULT_REGION
    },
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
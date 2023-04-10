#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { CodePipelineSource } from 'aws-cdk-lib/pipelines';
import { InfrastructurePipelineStack } from '../lib/pipeline/pipeline-stack';

const app = new cdk.App();

const API_NAME            = "oneXerpAPI"
const DEV_BRANCH          = "development"
const DEV_CODESTAR_ARN    = "arn:aws:codestar-connections:us-east-1:136559125535:connection/c59440ca-db21-4051-b54a-810bbc89464f"
const DOMAIN_NAME         = "onexerp.com"
const PIPELINE_NAME       = "InfrastructurePipeline"
const PIPELINE_STACK_NAME = "InfrastructurePipelineStack"
const PROD_BRANCH         = "main"
const PROD_CODESTAR_ARN   = "INSERT PROD CONNECT HERE" // TODO
const INFRA_REPO          = "dillonCF/oneXerp-Infrastructure"
const LAMBDA_REPO         = "dillonCF/oneXerp-Lambdas"


// To deploy just one stack, run `cdk deploy {stack-name}`.
// NOTE: Ensure you have the lambdas folder pulled down when you deploy the first time to avoid errors.

new InfrastructurePipelineStack(app, `${PIPELINE_STACK_NAME}-${DEV_BRANCH}`, {
    apiName: API_NAME,
    branch: DEV_BRANCH,
    domainName: DOMAIN_NAME,
    pipelineName: PIPELINE_NAME,
    env: {
        account: process.env.CDK_DEPLOY_ACCOUNT || process.env.CDK_DEFAULT_ACCOUNT, 
        region: process.env.CDK_DEPLOY_REGION || process.env.CDK_DEFAULT_REGION 
    },
    pipelineSource: CodePipelineSource.connection(INFRA_REPO, DEV_BRANCH, {
        connectionArn: DEV_CODESTAR_ARN
    }),
    source: CodePipelineSource.connection(LAMBDA_REPO, DEV_BRANCH, {
        connectionArn: DEV_CODESTAR_ARN
    })
});

new InfrastructurePipelineStack(app, `${PIPELINE_STACK_NAME}-${PROD_BRANCH}`, {
    apiName: API_NAME,
    branch: PROD_BRANCH,
    domainName: DOMAIN_NAME,
    pipelineName: PIPELINE_NAME,
    env: {
        account: process.env.CDK_DEPLOY_ACCOUNT || process.env.CDK_DEFAULT_ACCOUNT, 
        region: process.env.CDK_DEPLOY_REGION || process.env.CDK_DEFAULT_REGION 
    },
    pipelineSource: CodePipelineSource.connection(INFRA_REPO, PROD_BRANCH, {
        connectionArn: PROD_CODESTAR_ARN
    }),
    source: CodePipelineSource.connection(LAMBDA_REPO, PROD_BRANCH, {
        connectionArn: PROD_CODESTAR_ARN
    }),
});
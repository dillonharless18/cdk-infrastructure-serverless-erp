import * as cdk from 'aws-cdk-lib';
import { BuildSpec, LinuxBuildImage, PipelineProject } from 'aws-cdk-lib/aws-codebuild';
import { CodeBuildStep, CodePipeline, CodePipelineSource } from 'aws-cdk-lib/pipelines';
import { Construct, Node } from 'constructs';
import { ApiDeploymentStage } from './stages/deploy-api';
import { IamDeploymentStage } from './stages/deploy-iam';
import { CognitoDeploymentStage } from './stages/deploy-cognito';
import { DatabaseDeploymentStage } from './stages/deploy-database';

export function createResourceName(branch: string, resourceName: string) {
    return `${resourceName}-${branch}`;
}

interface PipelineStackProps extends cdk.StackProps {
    apiName: string;
    applicationName: string;
    certificateArn: string;
    domainName: string;
    source: CodePipelineSource;
    pipelineSource: CodePipelineSource;
    branch: string;
    pipelineName: string;
}

export class InfrastructurePipelineStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: PipelineStackProps) {
        super(scope, id, props);

        if ( !props ) throw Error ("props is not defined")
        if ( !props.apiName ) throw Error ("apiName is not defined")
        if ( !props.branch ) throw Error("branch is not defined.")
        if ( !props.source ) throw Error("source is not defined.")
        if ( !props.pipelineName ) throw Error("pipelineName is not defined.")
        if ( !props.pipelineSource ) throw Error("pipelineSource is not defined.")
        
        const pipeline = new CodePipeline(this, createResourceName(props?.branch, "Pipeline"), {
            pipelineName: createResourceName(props?.branch, props.pipelineName),
            synth: new CodeBuildStep("Synth", {
                input: props?.pipelineSource,
                additionalInputs: {
                    // '../website-code': props?.source
                    '../../lambdas': props?.source
                },
                commands: [
                    // "cd ../website-code", // step out and into the website code and build it
                    // "npm ci",
                    // "npm run build",
                    // "cd -",
                    "npm ci",
                    "npm run build",
                    "npx cdk synth"
                ]
            })      
        });

        const databaseDeploymentStage = new DatabaseDeploymentStage(this, 'Deploy', {
            branch: props.branch,
            domainName: props.domainName
        });
        const deployDatabaseDeploymentStage = pipeline.addStage(databaseDeploymentStage);

        // Get the database user and password
        const databaseUser = cdk.SecretValue.secretsManager(databaseDeploymentStage.secret.secretArn, {
            jsonField: 'user',
        });
        const databasePassword = cdk.SecretValue.secretsManager(databaseDeploymentStage.secret.secretArn, {
            jsonField: 'password',
        });
        
        // Codebuild project to run the database migrations
        const runMigrationsProject = new PipelineProject(this, 'RunMigrationsProject', {
            buildSpec: BuildSpec.fromObject({
              version: '0.2',
              phases: {
                install: {
                  commands: [
                    'cd ../../lambdas',
                    'npm ci'
                  ]
                },
                build: {
                  commands: [
                    'node run_migrations.js'
                  ]
                }
              },
              environmentVariables: {
                // Pass the necessary environment variables for the database connection
                'DB_HOST': databaseDeploymentStage.clusterEndpointHostname,
                'DB_USER': databaseUser,
                'DB_PASSWORD': databasePassword,
                'DB_DATABASE': 'database',
                'NODE_ENV': props.branch ? props.branch : "development"
              }
            }),
            environment: {
              buildImage: LinuxBuildImage.STANDARD_5_0,
              privileged: true
            }
          });

        // TODO - Determine if we even need an IAM stack for anything

        // const iamDeploymentStage = new IamDeploymentStage(this, 'Deploy', {
        //     branch: props.branch,
        //     domainName: props.domainName
        // });
        // const deployIamDeploymentStage = pipeline.addStage(iamDeploymentStage);

        const cognitoDeploymentStage = new CognitoDeploymentStage(this, 'Deploy', {
            branch: props.branch,
            applicationName: props.applicationName,
            domainName: props.domainName
        });
        const deployCognitoDeploymentStage = pipeline.addStage(cognitoDeploymentStage);

        const apiDeploymentStage = new ApiDeploymentStage(this, 'Deploy', {
            apiName: props.apiName,
            branch: props.branch,
            certificateArn: props.certificateArn,
            domainName: props.domainName,
            vpc: databaseDeploymentStage.vpc,
            securityGroup: databaseDeploymentStage.securityGroup
        });
        const deployApiDeploymentStage = pipeline.addStage(apiDeploymentStage);
    }
}
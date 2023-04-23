import * as cdk from 'aws-cdk-lib';
import { BuildSpec, LinuxBuildImage, PipelineProject } from 'aws-cdk-lib/aws-codebuild';
import { CodeBuildStep, CodePipeline, CodePipelineSource, Step } from 'aws-cdk-lib/pipelines';
import { Construct, Node } from 'constructs';
import { ApiDeploymentStage } from './stages/deploy-api';
import { IamDeploymentStage } from './stages/deploy-iam';
import { CognitoDeploymentStage } from './stages/deploy-cognito';
import { DatabaseDeploymentStage } from './stages/deploy-database';
import { CodeBuildAction } from 'aws-cdk-lib/aws-codepipeline-actions';

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
                ],
                primaryOutputDirectory: 'cdk.out'
            })
        });

        
        ////////////////////
        // Start Database //
        ////////////////////

        const databaseDeploymentStage = new DatabaseDeploymentStage(this, 'Deploy', {
            branch: props.branch,
            domainName: props.domainName
        });
        const deployDatabaseDeploymentStage = pipeline.addStage(databaseDeploymentStage);

        
       /** Migrations */

        // Get the database user and password
        const databaseUser = cdk.SecretValue.secretsManager(databaseDeploymentStage.secret.secretArn, {
            jsonField: 'user',
        });
        const databasePassword = cdk.SecretValue.secretsManager(databaseDeploymentStage.secret.secretArn, {
            jsonField: 'password',
        });
        
        
        // Does not deploy stacks but only runs some post-production actions (CodeBuild/Lambdas)
        const postDBCreationWave = pipeline.addWave('PostDBCreation');

        // Run migrations
        postDBCreationWave.addPost(
            new CodeBuildStep('RunMigrations', {
                securityGroups: [databaseDeploymentStage.securityGroup], // TODO potentially create a distinct security group here
                input: props?.source,
                vpc: databaseDeploymentStage.vpc,
                installCommands: [
                    'npm install'
                ],
                commands: [
                    'node run_migrations.js'
                ],
                buildEnvironment: {
                    privileged: true,
                    buildImage: LinuxBuildImage.STANDARD_5_0,
                },
                env: {
                    'DB_HOST': databaseDeploymentStage.clusterEndpointHostname,
                    'DB_USER': databaseUser.toString(),
                    'DB_PASSWORD': databasePassword.toString(), // TODO See if this will work properly
                    'DB_DATABASE': 'database',
                    'NODE_ENV': props.branch ? props.branch : "development"
                }
            })
        );


        ////////////////////
        // Start Cognito  //
        ////////////////////

        const cognitoDeploymentStage = new CognitoDeploymentStage(this, 'Deploy', {
            branch: props.branch,
            applicationName: props.applicationName,
            domainName: props.domainName
        });
        const deployCognitoDeploymentStage = pipeline.addStage(cognitoDeploymentStage);


        
        ///////////////////
        //   Start API   //
        ///////////////////
        
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
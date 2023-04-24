import * as cdk from 'aws-cdk-lib';
import { BuildEnvironmentVariableType, BuildSpec, LinuxBuildImage, PipelineProject } from 'aws-cdk-lib/aws-codebuild';
import { CodeBuildStep, CodePipeline, CodePipelineSource, Step } from 'aws-cdk-lib/pipelines';
import { Construct, Node } from 'constructs';
import { ApiDeploymentStage } from './stages/deploy-api';
import { IamDeploymentStage } from './stages/deploy-iam';
import { CognitoDeploymentStage } from './stages/deploy-cognito';
import { DatabaseDeploymentStage } from './stages/deploy-database';
import { CodeBuildAction } from 'aws-cdk-lib/aws-codepipeline-actions';
import { Effect, PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { SecurityGroup, Vpc } from 'aws-cdk-lib/aws-ec2';

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
    env: {
        account: string,
        region:  string
    }
}

export class InfrastructurePipelineStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: PipelineStackProps) {
        super(scope, id, props);

        if ( !props ) throw Error ("props is not defined")
        if ( !props.apiName ) throw Error ("apiName is not defined")
        if ( !props.branch ) throw Error("branch is not defined.")
        if ( !props.env.account ) throw Error("account is not defined.")
        if ( !props.env.region ) throw Error("region is not defined.")
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

        const databaseDeploymentStage = new DatabaseDeploymentStage(this, 'DatabaseDeploymentStage', {
            branch: props.branch,
            domainName: props.domainName,
            env: props.env
        });
        const deployDatabaseDeploymentStage = pipeline.addStage(databaseDeploymentStage);

        
       /** Migrations */

        // Get the database secret arn and cluster endpoint hostname, security group of db
        const databaseSecretArn = cdk.Fn.importValue(`DatabaseSecretArn`);
        const clusterEndpointHostname = cdk.Fn.importValue(`ClusterEndpointHostname`);
        const databaseSecurityGroupId = cdk.Fn.importValue(`DatabaseSecurityGroupId`);

        const databaseSecurityGroup = SecurityGroup.fromSecurityGroupId(this, 'ImportedSecurityGroup', databaseSecurityGroupId);

        
        // Does not deploy stacks but only runs some post-production actions (CodeBuild/Lambdas)
        const postDBCreationWave = pipeline.addWave('PostDBCreation');

        // Grant CodeBuild permission to access the database secret
        const codeBuildRole = new Role(this, 'CodeBuildRole', {
            assumedBy: new ServicePrincipal('codebuild.amazonaws.com'),
        });
        
        // TODO move this to IAM folder
        codeBuildRole.addToPolicy(
            new PolicyStatement({
              effect: Effect.ALLOW,
              actions: [
                'secretsmanager:GetRandomPassword',
                'secretsmanager:GetResourcePolicy',
                'secretsmanager:GetSecretValue',
                'secretsmanager:DescribeSecret',
                'secretsmanager:ListSecretVersionIds',
              ],
              resources: [databaseSecretArn],
            })
          );

        // TODO this is duplicated inside the api-stack
        // Getting the vpcId that was stored in SSM during databaseStack synth - fromLookup doesn't work with a CfnOutput
        const vpcId = StringParameter.valueFromLookup(this, '/VpcProvider/VPCID');
        
        // Pull in the databaseVPC
        const databaseVpc = Vpc.fromLookup(this, 'ImportedDatabaseVPC', {
            vpcId: vpcId,
        });

        // Run migrations
        postDBCreationWave.addPost(
            new CodeBuildStep('RunMigrations', {
                securityGroups: [databaseSecurityGroup], // TODO potentially create a distinct security group here
                input: props?.source,
                vpc: databaseVpc,
                installCommands: [
                    'npm install'
                ],
                commands: [
                    'node run_migrations.js'
                ],
                buildEnvironment: {
                    privileged: true,
                    buildImage: LinuxBuildImage.STANDARD_5_0,
                    environmentVariables: {
                        DB_HOST:     { value: clusterEndpointHostname },
                        DB_CREDENTIALS: { value: 'database-credentials', type: BuildEnvironmentVariableType.SECRETS_MANAGER },
                        DB_DATABASE: { value: 'database' },
                        NODE_ENV:    { value: props.branch ? props.branch : "development" }
                      },
                },
            })
        );


        ////////////////////
        // Start Cognito  //
        ////////////////////

        const cognitoDeploymentStage = new CognitoDeploymentStage(this, 'CognitoDeploymentStage', {
            applicationName: props.applicationName,
            branch: props.branch,
            domainName: props.domainName,
            env: props.env
        });
        const deployCognitoDeploymentStage = pipeline.addStage(cognitoDeploymentStage);



        ///////////////////
        //   Start API   //
        ///////////////////
        
        const apiDeploymentStage = new ApiDeploymentStage(this, 'ApiDeploymentStage', {
            apiName: props.apiName,
            branch: props.branch,
            certificateArn: props.certificateArn,
            domainName: props.domainName,
            env: props.env,
            vpc: databaseDeploymentStage.vpc,
            securityGroup: databaseDeploymentStage.securityGroup
        });
        const deployApiDeploymentStage = pipeline.addStage(apiDeploymentStage);

    }
}
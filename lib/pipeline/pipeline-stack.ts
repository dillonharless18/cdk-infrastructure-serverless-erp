import * as cdk from 'aws-cdk-lib';
import { BuildEnvironmentVariableType, LinuxBuildImage } from 'aws-cdk-lib/aws-codebuild';
import { CodeBuildStep, CodePipeline, CodePipelineSource, ManualApprovalStep } from 'aws-cdk-lib/pipelines';
import { Construct } from 'constructs';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { DeployInfrastructureStage } from './stages/deploy-infrastructure-stage';

type StageNameOption = 'development' | 'test' | 'prod'

interface PipelineStackProps extends cdk.StackProps {
    apiName: string;
    applicationName: string;
    corsS3AssetsAllowedOrigins: Record<StageNameOption, string[]>
    customOauthCallbackURLsMap?: Record<StageNameOption, string[]>
    customOauthLogoutURLsMap?: Record<StageNameOption, string[]>
    domainName: string;
    source: CodePipelineSource;
    pipelineSource: CodePipelineSource;
    pipelineName: string;
    enableQBDIntegrationDevelopment: boolean;
    enableQBDIntegrationTest: boolean,
    enableQBDIntegrationProduction: boolean;
    amiNameQBDDevelopment?: string;
    amiOwnersQBDDevelopment?: string[];
    amiNameQBDProduction?: string;
    amiOwnersQBDProduction?: string[];
}

interface Environment {
    developmentAccount: string,
    testAccount: string,
    productionAccount: string,
    region: string,
}

export class InfrastructurePipelineStack extends cdk.Stack {
    private readonly devStageName: StageNameOption  = 'development';
    private readonly testStageName: StageNameOption = 'test';
    private readonly prodStageName: StageNameOption = 'prod';

    constructor(scope: Construct, id: string, envVariables: Environment, props: PipelineStackProps) {
        super(scope, id, props);

        if ( !props ) throw Error ("props is not defined")
        if ( !props.apiName ) throw Error ("apiName is not defined")
        if ( !props.customOauthCallbackURLsMap ) throw Error ("customOauthCallbackURLsMap is not defined")
        if ( !props.customOauthCallbackURLsMap.development ) throw Error ("customOauthCallbackURLsMap.development is not defined")
        if ( !props.customOauthCallbackURLsMap.prod ) throw Error ("customOauthCallbackURLsMap.prod is not defined")
        if ( !props.customOauthLogoutURLsMap ) throw Error ("customOauthLogoutURLsMap is not defined")
        if ( !props.customOauthLogoutURLsMap.development ) throw Error ("customOauthLogoutURLsMap.development is not defined")
        if ( !props.customOauthLogoutURLsMap.prod ) throw Error ("customOauthLogoutURLsMap.prod is not defined")
        if ( !props.corsS3AssetsAllowedOrigins ) throw Error ("corsS3AssetsAllowedOrigins is not defined")
        if ( !props.corsS3AssetsAllowedOrigins.development ) throw Error ("corsS3AssetsAllowedOrigins.development is not defined")
        if ( !props.corsS3AssetsAllowedOrigins.prod ) throw Error ("corsS3AssetsAllowedOrigins.prod is not defined")
        if ( !props.env) throw Error("props.env is not defined")
        if ( !props.env.account ) throw Error("account is not defined.")
        if ( !props.env.region ) throw Error("region is not defined.")
        if ( !props.source ) throw Error("source is not defined.")
        if ( !props.pipelineName ) throw Error("pipelineName is not defined.")
        if ( !props.pipelineSource ) throw Error("pipelineSource is not defined.")
        
        const pipeline = new CodePipeline(this, "CICDPipeline", {
            pipelineName: "CICDPipeline",
            crossAccountKeys: true,
            synth: new CodeBuildStep("Synth", {
                input: props?.pipelineSource,
                additionalInputs: {
                    '../lambdas': props?.source
                },
                commands: [
                    "npm ci",
                    "npm run build",
                    "cd lib/database/migrations-lambda",
                    "npm ci --production",
                    "cd -",
                    "cd $CODEBUILD_SRC_DIR_dillonCF_oneXerp_Lambdas_Source",
                    "find . -type f -name 'package.json' -execdir npm ci --production \\;",
                    "cd -",
                    "cd $CODEBUILD_SRC_DIR/lib/lambda-layers/database-layer/nodejs",
                    "npm ci --production",
                    "cd -",
                    "cd $CODEBUILD_SRC_DIR/lib/lambda-layers/authorizer-layer/nodejs",
                    "npm ci --production",
                    "cd -",
                    "cd $CODEBUILD_SRC_DIR/lib/lambda-layers/errors-layer/nodejs",
                    "npm ci --production",
                    "cd -",
                    "cd $CODEBUILD_SRC_DIR/lib/lambda-layers/response-layer/nodejs",
                    "npm ci --production",
                    "cd -",
                    "cd $CODEBUILD_SRC_DIR/lib/veryfi-integration/lambda/event-producer",
                    "npm ci --production",
                    "cd -",
                    "cd $CODEBUILD_SRC_DIR/lib/veryfi-integration/lambda/event-consumer",
                    "npm ci --production",
                    "cd -",
                    "npx cdk synth"
                ],
                env: {
                    // TODO Determine what I need in here
                },
                primaryOutputDirectory: 'cdk.out',
                buildEnvironment: {
                    buildImage: LinuxBuildImage.AMAZON_LINUX_2_4,
                    privileged: true,
                    environmentVariables: {
                        'NODE_VERSION': {
                          value: '18.x',
                          type: BuildEnvironmentVariableType.PLAINTEXT
                        },
                      },
                },
            })
        });


        // Introducing a workaround for the size of the synth output as described here: https://github.com/aws/aws-cdk/issues/9917
        let strip = new CodeBuildStep("StripAssetsFromAssembly", {
            input: pipeline.cloudAssemblyFileSet,
            commands: [
              'S3_PATH=${CODEBUILD_SOURCE_VERSION#"arn:aws:s3:::"}',
              "ZIP_ARCHIVE=$(basename $S3_PATH)",
              "echo $S3_PATH",
              "echo $ZIP_ARCHIVE",
              "ls",
              "rm -rfv asset.*",
              "zip -r -q -A $ZIP_ARCHIVE *",
              "ls",
              "aws s3 cp $ZIP_ARCHIVE s3://$S3_PATH",
            ],
            rolePolicyStatements:[ new PolicyStatement({
              effect: Effect.ALLOW,
              resources: ["*"],
              actions: ["s3:*"],
            }),
            new PolicyStatement({
              effect: Effect.ALLOW,
              resources: ["*"],
              actions: ["kms:GenerateDataKey"],
            })]
         
          });

          pipeline.addWave("BeforeStageDeploy", {
            pre: [strip],
          });

        


        /////////////////////
        //    Dev Stage    //
        /////////////////////
        const devStage = new DeployInfrastructureStage(this, `DeployStage-${this.devStageName}`, {
            env: { 
                account: envVariables.developmentAccount,
                region: this.region
            },
            applicationName: props.applicationName,
            domainName: props.domainName,
            apiName: props.apiName,
            certificateArn: "arn:aws:acm:us-east-1:136559125535:certificate/dfd3aaa6-d14e-4ac9-b33a-fcbe51f54989",
            corsS3AssetsAllowedOrigins: props.corsS3AssetsAllowedOrigins[this.devStageName],
            crossAccount: false, // TODO look into this
            stageName: this.devStageName,
            devAccountId: envVariables.developmentAccount,
            customOauthCallbackURLsList: props.customOauthCallbackURLsMap[this.devStageName],
            customOauthLogoutURLsList: props.customOauthLogoutURLsMap[this.devStageName],
            enableQBDIntegration: props.enableQBDIntegrationDevelopment,
            amiNameQBD: props.amiNameQBDDevelopment,
            amiOwnersQBD: props.amiOwnersQBDDevelopment
        });
        
        pipeline.addStage(devStage, {
            post: [this.generateDatabaseSchemaMigration(devStage, this.region, this.account)]
        });

        //////////////////////
        //    Test Stage    //
        //////////////////////
        const testStage = new DeployInfrastructureStage(this, `DeployStage-${this.testStageName}`, {
            env: { 
                account: envVariables.testAccount,
                region: this.region
            },
            applicationName: props.applicationName,
            domainName: props.domainName,
            apiName: props.apiName,
            certificateArn: "arn:aws:acm:us-east-1:965371537242:certificate/63fe3769-b735-4660-8bb9-710d7619e67c",
            corsS3AssetsAllowedOrigins: props.corsS3AssetsAllowedOrigins[this.testStageName],
            crossAccount: true,
            stageName: this.testStageName,
            devAccountId: envVariables.developmentAccount,
            customOauthCallbackURLsList: props.customOauthCallbackURLsMap[this.testStageName],
            customOauthLogoutURLsList: props.customOauthLogoutURLsMap[this.testStageName],
            enableQBDIntegration: props.enableQBDIntegrationTest,
            amiNameQBD: props.amiNameQBDDevelopment, // TODO update this
            amiOwnersQBD: props.amiOwnersQBDDevelopment
        });
        
        pipeline.addStage(testStage, {
            pre: [
                new ManualApprovalStep('ApproveForTest', {
                    comment: "Approve deployment to test environment"
                })
                ],
            post: [this.generateDatabaseSchemaMigration(testStage, this.region, envVariables.testAccount)]
        });


        ////////////////////////////
        //    Production Stage    //
        ////////////////////////////
        const prodStage = new DeployInfrastructureStage(this, `DeployStage-${this.prodStageName}`, {
            env: { 
                account: envVariables.productionAccount,
                region: this.region
            },
            applicationName: props.applicationName,
            domainName: props.domainName,
            apiName: props.apiName,
            certificateArn: "arn:aws:acm:us-east-1:743614460397:certificate/57206c73-27f6-4fee-bf04-3297fa3a0703",
            corsS3AssetsAllowedOrigins: props.corsS3AssetsAllowedOrigins[this.prodStageName],
            crossAccount: true, // TODO look into this
            stageName: this.prodStageName,
            devAccountId: envVariables.developmentAccount,
            customOauthCallbackURLsList: props.customOauthCallbackURLsMap[this.prodStageName],
            customOauthLogoutURLsList: props.customOauthLogoutURLsMap[this.prodStageName],
            enableQBDIntegration: props.enableQBDIntegrationProduction,
            amiNameQBD: props.amiNameQBDProduction,
            amiOwnersQBD: props.amiOwnersQBDProduction
        });
        pipeline.addStage(prodStage, {
            pre: [
            new ManualApprovalStep('ApproveForProd', {
                comment: "Approve deployment to production environment"
            })
            ],
            post: [this.generateDatabaseSchemaMigration(prodStage, this.region, envVariables.productionAccount)]
        });
    }
    
    
    /////////////////////////////
    // Migrations Helper Logic //
    /////////////////////////////
    private generateDatabaseSchemaMigration(stage: DeployInfrastructureStage, region: string, account: string) {
        const buildCommands: string[] = [];
    
        const rolePolicyStatements = [
            new PolicyStatement({
                effect: Effect.ALLOW,
                actions: ['lambda:InvokeFunction'],
                resources: [`arn:aws:lambda:${region}:${account}:function:${stage.lambdaFunctionName}`],
            })
        ]
    
        if ( stage.stageName === this.testStageName || stage.stageName === this.prodStageName ) {
            // Assume cross account role if production environment
            buildCommands.push(
                `aws sts assume-role --role-arn arn:aws:iam::${account}:role/${stage.crossAccountLambdaInvokeRoleName} --role-session-name "CrossAccountSession" > credentials.json`,
                'export AWS_ACCESS_KEY_ID=$(cat credentials.json | jq -r ".Credentials.AccessKeyId")',
                'export AWS_SECRET_ACCESS_KEY=$(cat credentials.json | jq -r ".Credentials.SecretAccessKey")',
                'export AWS_SESSION_TOKEN=$(cat credentials.json | jq -r ".Credentials.SessionToken")'
            )
    
            // Allow to assume role if production environment
            rolePolicyStatements.push(new PolicyStatement({
                effect: Effect.ALLOW,
                actions: ['sts:AssumeRole'],
                resources: [`arn:aws:iam::${account}:role/${stage.crossAccountLambdaInvokeRoleName}`]
            }))
        }
    
        // Invoke lambda in all environments
        buildCommands.push(
            "npm install aws-sdk",
            'aws lambda invoke --function-name $DB_MIGRATE_FUNCTION_NAME out.json --log-type Tail --query LogResult --output text |  base64 -d',
            'lambdaStatus=$(cat out.json | jq ".StatusCode")',
            'if [ $lambdaStatus = 500 ]; then exit 1; else exit 0; fi'
        )
    
        return new CodeBuildStep(`RDSSchemaUpdate-${stage.stageName}`, {
            env: {
                DB_MIGRATE_FUNCTION_NAME: stage.lambdaFunctionName,
            },
            buildEnvironment: {
                privileged: true,
            },
            commands: buildCommands,
            rolePolicyStatements: rolePolicyStatements
        })
    }
}
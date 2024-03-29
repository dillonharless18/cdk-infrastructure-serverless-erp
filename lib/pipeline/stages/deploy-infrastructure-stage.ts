import { Construct } from 'constructs';
import { Stage, StageProps } from 'aws-cdk-lib';
import { ISecurityGroup, IVpc } from 'aws-cdk-lib/aws-ec2';
import { ISecret } from 'aws-cdk-lib/aws-secretsmanager';
import { IUserPool } from 'aws-cdk-lib/aws-cognito';
import { InfrastructureStack } from '../../infrastructure-stack';
import { DatabaseStack } from '../stacks/database-stack';

interface CustomStageProps extends StageProps {
    applicationName: string;
    domainName: string;
    env: {
        account: string;
        region:  string;
    },
    apiName: string;
    certificateArn: string;
    crossAccount: boolean;
    stageName: string;
    devAccountId: string;
    corsS3AssetsAllowedOrigins: string[];
    customOauthCallbackURLsList: string[];
    customOauthLogoutURLsList: string[];
    enableQBDIntegration: boolean;
    amiNameQBD?: string;
    amiOwnersQBD?: string[];
}

export class DeployInfrastructureStage extends Stage {
    public readonly lambdaFunctionName: string;
    public readonly crossAccountLambdaInvokeRoleName: string;

    constructor(scope: Construct, id: string, props: CustomStageProps) {
        super(scope, id, props);

        // Began separating out stacks starting with the database
        const databaseStack = new DatabaseStack(this, 'DatabaseStack', props);
        const infraStack = new InfrastructureStack(this, 'InfrastructureStack', {database: databaseStack, ...props})

        this.lambdaFunctionName = infraStack.lambdaFunctionName;
        this.crossAccountLambdaInvokeRoleName = infraStack.crossAccountLambdaInvokeRoleName;
    }
}


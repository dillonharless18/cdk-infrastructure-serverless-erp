import { Construct } from 'constructs';
import { Stage, StageProps } from 'aws-cdk-lib';
import { CognitoStack } from '../../cognito/cognito-stack';





interface CustomStageProps extends StageProps {
    applicationName: string;
    branch: string;
    domainName: string;
    env: {
        account: string,
        region:  string
    }
}

export class CognitoDeploymentStage extends Stage {
    constructor(scope: Construct, id: string, props: CustomStageProps) {
        super(scope, id, props);
        new CognitoStack(this, 'Infrastructure', {
            applicationName: props.applicationName,
            branch: props.branch,
            domainName: props.domainName,
            env: props.env
        });
    }
}


import { Construct } from 'constructs';
import { Stage, StageProps } from 'aws-cdk-lib';
import { CognitoStack } from '../../cognito/cognito-stack';





interface CustomStageProps extends StageProps {
    branch: string;
    domainName: string;
}

export class CognitoDeploymentStage extends Stage {
    constructor(scope: Construct, id: string, props: CustomStageProps) {
        super(scope, id, props);
        new CognitoStack(this, 'Infrastructure', {
            branch: props.branch,
            domainName: props.domainName
        });
    }
}


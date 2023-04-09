import { Construct } from 'constructs';
import { Stage, StageProps } from 'aws-cdk-lib';
import { IamStack } from '../../iam/iam-stack';


interface CustomStageProps extends StageProps {
    branch: string;
    domainName: string;
}

export class IamDeploymentStage extends Stage {
    constructor(scope: Construct, id: string, props: CustomStageProps) {
        super(scope, id, props);
        new IamStack(this, 'Infrastructure', {
            branch: props.branch,
            domainName: props.domainName
        });
    }
}


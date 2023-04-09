import { Construct } from 'constructs';
import { Stage, StageProps } from 'aws-cdk-lib';
import { ApiStack } from '../../api/api-stack';


interface CustomStageProps extends StageProps {
    branch: string;
    domainName: string;
}

export class ApiDeploymentStage extends Stage {
    constructor(scope: Construct, id: string, props: CustomStageProps) {
        super(scope, id, props);
        new ApiStack(this, 'Infrastructure', {
            branch: props.branch,
            domainName: props.domainName
        });
    }
}


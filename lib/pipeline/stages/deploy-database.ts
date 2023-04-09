import { Construct } from 'constructs';
import { Stage, StageProps } from 'aws-cdk-lib';
import { DatabaseStack } from '../../database/database-stack';


interface CustomStageProps extends StageProps {
    branch: string;
    domainName: string;
}

export class DatabaseDeploymentStage extends Stage {
    constructor(scope: Construct, id: string, props: CustomStageProps) {
        super(scope, id, props);
        new DatabaseStack(this, 'Infrastructure', {
            branch: props.branch,
            domainName: props.domainName
        });
    }
}


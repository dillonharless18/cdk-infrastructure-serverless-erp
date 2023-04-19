import { Construct } from 'constructs';
import { Stage, StageProps } from 'aws-cdk-lib';
import { DatabaseStack } from '../../database/database-stack';
import { ISecurityGroup, IVpc } from 'aws-cdk-lib/aws-ec2';


interface CustomStageProps extends StageProps {
    branch: string;
    domainName: string;
}

export class DatabaseDeploymentStage extends Stage {
    // These be passed to relevant stacks for Lambdas, etc.
    public readonly vpc: IVpc
    public readonly securityGroup: ISecurityGroup
    
    constructor(scope: Construct, id: string, props: CustomStageProps) {
        super(scope, id, props);
        const databaseStack = new DatabaseStack(this, 'DatabaseStack', {
            branch: props.branch,
            domainName: props.domainName
        });
        this.vpc = databaseStack.vpc;
        this.securityGroup = databaseStack.securityGroup;
    }
}


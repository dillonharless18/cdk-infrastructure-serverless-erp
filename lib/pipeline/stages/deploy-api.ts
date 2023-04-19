import { ISecurityGroup, IVpc } from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import { Stage, StageProps } from 'aws-cdk-lib';
import { ApiStack } from '../../api/api-stack';


interface CustomStageProps extends StageProps {
    apiName: string;
    branch: string;
    certificateArn: string;
    domainName: string;
    securityGroup: ISecurityGroup
    vpc: IVpc
}

export class ApiDeploymentStage extends Stage {
    constructor(scope: Construct, id: string, props: CustomStageProps) {
        super(scope, id, props);
        new ApiStack(this, 'Infrastructure', {
            apiName: props.apiName,
            branch: props.branch,
            certficateArn: props.certificateArn,
            domainName: props.domainName,
            securityGroup: props.securityGroup,
            vpc: props.vpc
        });
    }
}


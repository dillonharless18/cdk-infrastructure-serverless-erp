import { CfnOutput } from 'aws-cdk-lib';
import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { AuroraServerlessV2Construct } from "../../database/aurora-serverless-v2-construct";
import * as ec2 from 'aws-cdk-lib/aws-ec2';

interface DatabaseStackProps extends StackProps {
    stageName: string;
}


export class DatabaseStack extends Stack {
    public readonly vpc: ec2.Vpc;
    public readonly securityGroup: ec2.SecurityGroup;
    public readonly secretName: CfnOutput;
    public readonly secretArn: CfnOutput;
    public readonly defaultDatabaseName: string;

    constructor(
        scope: Construct,
        id: string,
        props?: DatabaseStackProps
    ) {
        super(scope, id, props);
        
        if (!props) throw Error("props is not defined");

        // Initialize Aurora Serverless V2 Construct
        const database = new AuroraServerlessV2Construct(this, "DatabaseConstruct", {
            stageName: props.stageName,
        });

        // Expose necessary properties
        this.vpc = database.vpc;
        this.securityGroup = database.securityGroup;
        this.secretName = database.secretName;
        this.secretArn = database.secretArn;
        this.defaultDatabaseName = database.defaultDatabaseName;
    }
}


/* eslint-disable no-new */
/* eslint-disable import/prefer-default-export */

// Using a workaround for Aurora Serverless V2:
// https://github.com/aws/aws-cdk/issues/20197
// https://github.com/Compulsed/serverless-aurora-lambda/blob/main/lib/serverless-aurora-lambda.ts

import { CfnOutput, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';

interface AuroraServerlessV2ConstructProps {
    stageName: string;
}

export class AuroraServerlessV2Construct extends Construct {
  
  // Expose the VPC and security group as public properties
  public readonly clusterEndpointSocketAddress: string;
  public readonly clusterEndpointHostname: string;
  public readonly secretArn: CfnOutput;
  public readonly secretName: CfnOutput;
  public readonly securityGroup: ec2.SecurityGroup;
  public readonly vpc: ec2.Vpc;
  public readonly defaultDatabaseName: string = "applicationDatabase";
  

  constructor(scope: Construct, id: string, props: AuroraServerlessV2ConstructProps) {
    super(scope, id);
    
    // Create a VPC for the database
    const databaseVpc = new ec2.Vpc(this, 'DatabaseVPC');
    cdk.Aspects.of(databaseVpc).add(new cdk.Tag('rds-lambda-vpc', 'true'))

    // Create a security group to control access to the database
    const databaseSecurityGroup = new ec2.SecurityGroup(this, 'DatabaseSecurityGroup', {
        vpc: databaseVpc,
    });

    // Storing VPC ID in SSM because using a CFN export inside vpc.fromLookUp in other stacks doesn't work due to tokenization of the CFN output.
    new StringParameter(this, 'VPCID', {
      parameterName: `DatabaseVPCId`,
      stringValue: databaseVpc.vpcId
    })
    
    // Create a secret to store the database credentials
    const secret = new secretsmanager.Secret(this, 'DatabaseSecret', {
        secretName: 'database-credentials',
        generateSecretString: {
          secretStringTemplate: JSON.stringify({
              username: 'admin',
          }),
          excludePunctuation: true,
          includeSpace: false,
          generateStringKey: 'password',
        },
    });

    // Full spec https://github.com/aws/aws-cdk/issues/20197#issuecomment-1117555047
    const cluster = new rds.DatabaseCluster(this, 'DbCluster', {
        engine: rds.DatabaseClusterEngine.auroraPostgres({
          version: rds.AuroraPostgresEngineVersion.VER_13_6,
        }),
        defaultDatabaseName: this.defaultDatabaseName,
        instances: 1,
        instanceProps: {
          vpc: databaseVpc,
          instanceType: new ec2.InstanceType('serverless'),
          autoMinorVersionUpgrade: true,
          publiclyAccessible: true,
          securityGroups: [databaseSecurityGroup],
          // TODO Determine if I need to specify the private subnets here
        //   vpcSubnets: vpc.selectSubnets({
        //     subnetType: SubnetType.PUBLIC,
        //   }),
        },
        port: 5432,
      })

      cdk.Aspects.of(cluster).add({
        visit(node) {
          if (node instanceof rds.CfnDBCluster) {
            node.serverlessV2ScalingConfiguration = {
              minCapacity: 0.5,
              maxCapacity: 1,
            }
          }
        },
      })


    // Outputs
    this.secretName = new CfnOutput(this, 'secretName', {
      value: cluster.secret?.secretName || '',
    });

    this.secretArn = new CfnOutput(this, 'secretArn', {
      value: cluster.secret?.secretArn || '',
    });
    
    this.securityGroup = databaseSecurityGroup;

    this.clusterEndpointHostname = cluster.clusterEndpoint.hostname;
    this.clusterEndpointSocketAddress = cluster.clusterEndpoint.socketAddress;
    this.vpc = databaseVpc;

  }
}
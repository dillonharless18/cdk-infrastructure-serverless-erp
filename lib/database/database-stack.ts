
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

interface DatabaseStackProps extends StackProps {
    branch: string;
    domainName: string;
}

export class DatabaseStack extends Stack {
  
  // Expose the VPC and security group as public properties
  public readonly vpc: ec2.IVpc;
  public readonly securityGroup: ec2.ISecurityGroup;
  public readonly clusterEndpointSocketAddress: string;


  constructor(scope: Construct, id: string, props: DatabaseStackProps) {
    super(scope, id, props);
    
    type branchToSubdomainTypes = {
        [key: string]: string
    }

    // Use to create subdomains programmatically like dev.example.com, test.example.com, example.com
    const BRANCH_TO_SUBDOMAIN_MAP: branchToSubdomainTypes = {
        development: 'dev.',
        test:        'test.',
        main:        ''
    }

    const { branch, domainName } = props

    if ( !domainName ) throw new Error(`Error in database stack. domainName does not exist on \n Props: ${JSON.stringify(props, null , 2)}`);
    const DOMAIN_NAME = domainName;
    
    if ( !branch ) throw new Error(`Error in database stack. branch does not exist on \n Props: ${JSON.stringify(props, null , 2)}`);
    const DOMAIN_WITH_SUBDOMAIN = `${BRANCH_TO_SUBDOMAIN_MAP[branch]}${domainName}`

    const WWW_DOMAIN_WITH_SUBDOMAIN = `www.${DOMAIN_WITH_SUBDOMAIN}`;

    // Create a VPC for the database
    const databaseVPC = new ec2.Vpc(this, 'DatabaseVPC');

    // Create a security group to control access to the database
    const databaseSecurityGroup = new ec2.SecurityGroup(this, 'DatabaseSecurityGroup', {
        vpc: databaseVPC,
    });
    
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
    
    // // Create a cluster for the Aurora Serverless V2 database
    // const cluster = new rds.ServerlessCluster(this, 'DatabaseCluster', {
    //     engine: rds.DatabaseClusterEngine.auroraMysql({
    //         version: rds.AuroraMysqlEngineVersion.VER_2_10_1,
    //     }),
    //     vpc: databaseVPC,
    //     securityGroups: [databaseSecurityGroup],
    //     defaultDatabaseName: 'database',
    //     // TODO Decide on what exactly to do here
    //     // removalPolicy: branch === 'development' ? cdk.RemovalPolicy.SNAPSHOT : cdk.RemovalPolicy.RETAIN,
    //     removalPolicy: cdk.RemovalPolicy.SNAPSHOT,
    //     scaling: {
    //     autoPause: cdk.Duration.minutes(10),
    //     minCapacity: rds.AuroraCapacityUnit.ACU_1,
    //     maxCapacity: rds.AuroraCapacityUnit.ACU_2,
    //     },
    //     credentials: rds.Credentials.fromSecret(secret),
    // });

    // Full spec https://github.com/aws/aws-cdk/issues/20197#issuecomment-1117555047
    const cluster = new rds.DatabaseCluster(this, 'DbCluster', {
        engine: rds.DatabaseClusterEngine.auroraPostgres({
          version: rds.AuroraPostgresEngineVersion.VER_13_6,
        }),
        instances: 1,
        instanceProps: {
          vpc: databaseVPC,
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

    // Assign the VPC, security group, and cluster socket endpoitns to the public properties
    this.vpc = databaseVPC;
    this.securityGroup = databaseSecurityGroup;
    this.clusterEndpointSocketAddress = cluster.clusterEndpoint.socketAddress;

  }
}
import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { DatabaseStack } from '../lib/database/database-stack';

test('RdsStack creates an RDS Aurora Serverless V2 database', () => {
  // GIVEN
  const app = new App();

  // TODO - make this work
  
  // WHEN
//   const stack = new DatabaseStack(app, 'TestRdsStack', {
//     databaseName: 'test',
//     vpcId: 'vpc-123456789',
//     vpcSubnetIds: ['subnet-123456789', 'subnet-987654321'],
//     securityGroupIds: ['sg-123456789', 'sg-987654321'],
//     scalingConfiguration: {
//       autoPause: true,
//       maxCapacity: 4,
//       minCapacity: 2,
//     },
//   });
//   const template = Template.fromStack(stack);

//   // THEN
//   // Check if the RDS cluster exists
//   template.resourceCountIs('AWS::RDS::DBCluster', 1);

//   // Check if the RDS instance exists
//   template.resourceCountIs('AWS::RDS::DBInstance', 1);

//   // Check if the RDS instance is part of the cluster
//   template.hasResourceProperties('AWS::RDS::DBInstance', {
//     DBClusterIdentifier: {
//       Ref: 'RdsClusterEBE20A55',
//     },
//   });

//   // Check if the correct VPC is being used
//   template.hasResourceProperties('AWS::RDS::DBInstance', {
//     DBSubnetGroupName: {
//       Ref: 'DbSubnetsGroupB4F4A06D',
//     },
//     VPCSecurityGroups: ['sg-123456789', 'sg-987654321'],
//     VPCSecurityGroupIds: ['sg-123456789', 'sg-987654321'],
//   });

//   // Check if the database name is correct
//   template.hasResourceProperties('AWS::RDS::DBInstance', {
//     DBName: 'test',
//   });

//   // Check if the scaling configuration is correct
//   template.hasResourceProperties('AWS::RDS::DBCluster', {
//     ScalingConfiguration: {
//       AutoPause: true,
//       MaxCapacity: 4,
//       MinCapacity: 2,
//     },
//   });
});

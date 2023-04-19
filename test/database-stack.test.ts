import { App, Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { DatabaseStack } from '../lib/database/database-stack';

test('DatabaseStack creates an Aurora Serverless V2 cluster, VPC, and security group', () => {
  // GIVEN
  const app = new App();

  // WHEN
  const stack = new DatabaseStack(app, 'TestDatabaseStack', {
    branch: 'development',
    domainName: 'test.com',
  });
  const template = Template.fromStack(stack);

  // THEN
  // Check if the VPC exists
  template.resourceCountIs('AWS::EC2::VPC', 1);

  // Check if the security group exists
  template.resourceCountIs('AWS::EC2::SecurityGroup', 1);

  // Check if the secret exists
  template.resourceCountIs('AWS::SecretsManager::Secret', 1);

  // Check if the Aurora Serverless V2 cluster exists
  template.resourceCountIs('AWS::RDS::DBCluster', 1);
});

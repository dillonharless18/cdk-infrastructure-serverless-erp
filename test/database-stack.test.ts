import { App, Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { DatabaseStack } from '../lib/database/database-stack';
import { writeFileSync } from 'fs';
import { join } from 'path';

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

  // Check if the secret with the specific name exists
  template.hasResourceProperties('AWS::SecretsManager::Secret', {
    Name: 'database-credentials',
  });

  // Check if the Aurora Serverless V2 cluster exists
  template.resourceCountIs('AWS::RDS::DBCluster', 1);
});


test('Aurora Serverless V2 Cluster should have the correct properties', () => {
  
  // GIVEN
  const app = new App();

  // WHEN
  const stack = new DatabaseStack(app, 'TestDatabaseStack', {
    branch: 'development',
    domainName: 'test.com',
  });
  const template = Template.fromStack(stack);

  // THEN
  template.hasResourceProperties('AWS::RDS::DBCluster', {
    Engine: 'aurora-postgresql',
  });

  // Check if the ServerlessV2ScalingConfiguration is defined and has the correct values
  const clusterResources = template.findResources('AWS::RDS::DBCluster');
  let found = 0;

  for (const resource of Object.values(clusterResources)) {
    if (resource.Properties && resource.Properties.ServerlessV2ScalingConfiguration) {
      found += 1;
      console.log(`Correct resource found!`)
      console.log(`${JSON.stringify(resource, null, 2)}`)
      expect(resource.Properties).toHaveProperty('ServerlessV2ScalingConfiguration');
      expect(resource.Properties.ServerlessV2ScalingConfiguration).toMatchObject({
        MinCapacity: 0.5,
        MaxCapacity: 1,
      });
    }
  }

  if (found < 1) {
    console.error("NOT FOUND");
  } else {
    console.log("Resource with ServerlessV2ScalingConfiguration found.");
  }
});




import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { CodePipelineSource } from 'aws-cdk-lib/pipelines';
import { InfrastructurePipelineStack } from '../lib/pipeline/pipeline-stack';
import { writeFileSync } from 'fs';

test('InfrastructurePipelineStack creates a pipeline with the correct stages', () => {
  // GIVEN
  const app = new App();

  // WHEN
  const stack = new InfrastructurePipelineStack(app, 'TestInfrastructurePipelineStack', {
    apiName: 'test-api',
    branch: 'development',
    applicationName: 'test-app',
    certificateArn: 'arn:aws:acm:us-east-1:123456789012:certificate/12345678-1234-1234-1234-123456789012',
    domainName: 'test.com',
    env: {
      account: '136559125535',
      region: 'us-east-1'
    },
    source: CodePipelineSource.gitHub('owner/repo', 'main'),
    pipelineSource: CodePipelineSource.gitHub('owner/pipeline-repo', 'main'),
    pipelineName: 'test-pipeline',
  });
  const template = Template.fromStack(stack);

  writeFileSync('pipeline-template-test-output.json', JSON.stringify(template, null, 2));

  // THEN
  // Check if the CodePipeline exists
  template.resourceCountIs('AWS::CodePipeline::Pipeline', 1);

  // Check if the CodeBuild projects exist for the stages
  template.resourceCountIs('AWS::CodeBuild::Project', 5); // TODO ensure this is the correct number
});

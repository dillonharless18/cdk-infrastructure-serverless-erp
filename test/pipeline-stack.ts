import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { CodePipelineSource } from 'aws-cdk-lib/pipelines';
import { InfrastructurePipelineStack } from '../lib/pipeline/pipeline-stack';

test('InfrastructurePipelineStack creates a pipeline with the correct stages', () => {
  // GIVEN
  const app = new App();

  // WHEN
  const stack = new InfrastructurePipelineStack(app, 'TestInfrastructurePipelineStack', {
    apiName: 'test-api',
    applicationName: 'test-app',
    certificateArn: 'arn:aws:acm:us-east-1:123456789012:certificate/12345678-1234-1234-1234-123456789012',
    domainName: 'test.com',
    source: CodePipelineSource.gitHub('owner/repo', 'main'),
    pipelineSource: CodePipelineSource.gitHub('owner/pipeline-repo', 'main'),
    branch: 'development',
    pipelineName: 'test-pipeline',
  });
  const template = Template.fromStack(stack);

  // THEN
  // Check if the CodePipeline exists
  template.resourceCountIs('AWS::CodePipeline::Pipeline', 1);

  // Check if the CodeBuild projects exist for the stages
  template.resourceCountIs('AWS::CodeBuild::Project', 1); // Change this number according to the number of CodeBuild projects in your pipeline
});

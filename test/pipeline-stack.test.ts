import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { CodePipelineSource } from 'aws-cdk-lib/pipelines';
import { InfrastructurePipelineStack } from '../lib/pipeline/pipeline-stack';
import { writeFileSync } from 'fs';

test('InfrastructurePipelineStack creates a pipeline with the correct stages', () => {
  // GIVEN
  const app = new App();

  // environment variables set in the cdk-deploy-to script
  const envVariables = {
    branch: 'TEST_BRANCH',
    developmentAccount: '123456789012',
    productionAccount: '234567890123',
    region: 'us-east-1',
    repositoryName: 'TEST_REPO'
  }

  // WHEN
  const stack = new InfrastructurePipelineStack(app, 'TestInfrastructurePipelineStack', envVariables, {
    apiName: "TEST_API_NAME",
    applicationName: "TEST_APPLICATION_NAME",
    branch: envVariables.branch, // TODO change to stage most likely
    domainName: "TEST_DOMAIN_NAME",
    pipelineName: "TEST_PIPELINE_NAME",
    env: {
        account: envVariables.developmentAccount, // Not how it's accessed in the actual stack
        region: envVariables.region
    },
    source: CodePipelineSource.gitHub('owner/repo', 'main'),
    pipelineSource: CodePipelineSource.gitHub('owner/pipeline-repo', 'main'),
  });
  const template = Template.fromStack(stack);

  writeFileSync('pipeline-template-test-output.json', JSON.stringify(template, null, 2));

  // THEN
  // Check if the CodePipeline exists
  template.resourceCountIs('AWS::CodePipeline::Pipeline', 1);

  // Check if the CodeBuild projects exist for the stages
  template.resourceCountIs('AWS::CodeBuild::Project', 5); // TODO ensure this is the correct number
});

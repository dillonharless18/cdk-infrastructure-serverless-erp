import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { ApiStack } from '../lib/api/api-stack';

test('ApiStack creates API Gateway with a Lambda function', () => {
  // GIVEN
  const app = new App();

  // WHEN
  const stack = new ApiStack(app, 'TestApiStack', {
    apiName: 'TestApi',
    branch: 'development',
    certficateArn: 'arn:aws:acm:us-east-1:136559125535:certificate/4fb61b1f-0934-4b3f-9070-a8f1036e7430',
    domainName: 'test.com',
    env: {
        account: '136559125535',
        region: 'us-east-1'
    }
  });
  const template = Template.fromStack(stack);

  console.log(`Logging the template in api-stack.test.ts:\n`)
  console.log(JSON.stringify(template.toJSON(), null, 2));


  // THEN
  // Check if the API Gateway exists
  template.resourceCountIs('AWS::ApiGateway::RestApi', 1);

  // Check if the Lambda function(s) exists
  template.resourceCountIs('AWS::Lambda::Function', 2);

  // Check if the API Gateway has a resource with the expected path
  template.hasResourceProperties('AWS::ApiGateway::Resource', {
    PathPart: 'api',
  });
  template.hasResourceProperties('AWS::ApiGateway::Resource', {
    PathPart: 'v1',
  });

  
  // Check if the API Gateway has a resource with the expected path for the getUsers Lambda function
  template.hasResourceProperties('AWS::ApiGateway::Resource', {
    PathPart: 'users',
  });

  // Check if the API Gateway has a GET method
  template.hasResourceProperties('AWS::ApiGateway::Method', {
    HttpMethod: 'GET',
  });


  // Check if the API Gateway has a resource with the expected path for the getPoLineItemComments Lambda function
  template.hasResourceProperties('AWS::ApiGateway::Resource', {
    PathPart: 'purchase-orders',
  });
  template.hasResourceProperties('AWS::ApiGateway::Resource', {
    PathPart: '{purchaseOrderId}',
  });
  template.hasResourceProperties('AWS::ApiGateway::Resource', {
    PathPart: 'line-items',
  });
  template.hasResourceProperties('AWS::ApiGateway::Resource', {
    PathPart: '{lineItemId}',
  });
  template.hasResourceProperties('AWS::ApiGateway::Resource', {
    PathPart: 'comments',
  });

  // Check if the custom domain and Route53 record exist
  template.resourceCountIs('AWS::ApiGateway::DomainName', 1);
  template.resourceCountIs('AWS::Route53::RecordSet', 1);
});

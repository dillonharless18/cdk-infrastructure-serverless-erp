import {App} from 'aws-cdk-lib';
import {Template} from 'aws-cdk-lib/assertions';
import {CognitoStack} from '../lib/cognito/cognito-stack';

test('Cognito stack is created correctly', () => {
    // GIVEN
    const app = new App();
    
    const applicationName = 'testApplication'
    const branch = 'development';
    const domainName = 'test.com'

    type branchToSubdomainTypes = {
        [key: string]: string
    }

    // Use to create cognito user pools domain names
    const BRANCH_TO_AUTH_PREFIX: branchToSubdomainTypes = {
        development: `dev-${applicationName.toLowerCase()}`,
        test:        `test-${applicationName.toLowerCase()}`,
        main:        `${applicationName.toLowerCase()}`
    }

    // WHEN
    const stack = new CognitoStack(app, 'TestCognitoStack', {domainName, branch, applicationName});
    const template = Template.fromStack(stack);

    console.log(`Logging the template in cognito-stack.test.ts:\n`)
    console.log(JSON.stringify(template.toJSON(), null, 2));

    // THEN Check if the UserPool is created
    template.hasResourceProperties('AWS::Cognito::UserPool', {AutoVerifiedAttributes: ['email']});

    // Check if the UserPoolClient is created
    template.hasResourceProperties('AWS::Cognito::UserPoolClient', {GenerateSecret: false});

    // Check if the UserPoolDomain is created
    template.hasResourceProperties('AWS::Cognito::UserPoolDomain', {
        Domain: BRANCH_TO_AUTH_PREFIX[branch]
    });

    // Check if the IdentityPool is created
    template.hasResourceProperties('AWS::Cognito::IdentityPool', {AllowUnauthenticatedIdentities: false});

    // Check if the IAM roles are created
    const roleNames = ['admin_role', 'basic_user_role', 'logistics_role', 'project_manager_role', 'driver_role'];

    roleNames.forEach((roleName) => {
        template.hasResourceProperties('AWS::IAM::Role', {RoleName: roleName});
    });

    // Check if the UserPoolGroups are created
    const groupNames = ['admin', 'basic_user', 'logistics', 'project_manager', 'driver'];

    groupNames.forEach((groupName) => {
        template.hasResourceProperties('AWS::Cognito::UserPoolGroup', {GroupName: groupName});
    });
});

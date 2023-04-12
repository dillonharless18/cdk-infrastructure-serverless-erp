import {App} from 'aws-cdk-lib';
import {Template} from 'aws-cdk-lib/assertions';
import {CognitoStack} from '../lib/cognito/cognito-stack';

test('Cognito stack is created correctly', () => {
    // GIVEN
    const app = new App();

    const domainName = 'example.com';
    const branch = 'main';

    // WHEN
    const stack = new CognitoStack(app, 'TestCognitoStack', {domainName, branch});
    const template = Template.fromStack(stack);

    // THEN Check if the UserPool is created
    template.hasResourceProperties('AWS::Cognito::UserPool', {AutoVerifiedAttributes: ['email']});

    // Check if the UserPoolClient is created
    template.hasResourceProperties('AWS::Cognito::UserPoolClient', {GenerateSecret: false});

    // Check if the UserPoolDomain is created
    template.hasResourceProperties('AWS::Cognito::UserPoolDomain', {
        Domain: branch === 'main'
            ? domainName
            : `${branch}.${domainName}`
    });

    // Check if the IdentityPool is created
    template.hasResourceProperties('AWS::Cognito::IdentityPool', {AllowUnauthenticatedIdentities: false});

    // Check if the IAM roles are created
    const roleNames = ['admin_role', 'basic_user_role', 'logistics_role', 'project_manager_role', 'driver_role'];

    roleNames.forEach((roleName) => {
        template.hasResourceProperties('AWS::IAM::Role', {RoleName: roleName});
    });

    // Check if the UserPoolGroups are created
    const groupNames = ['admin_group', 'basic_user_group', 'logistics_group', 'project_manager_group', 'driver_group'];

    groupNames.forEach((groupName) => {
        template.hasResourceProperties('AWS::Cognito::UserPoolGroup', {GroupName: groupName});
    });

    // Check if the IAM roles have the expected permissions
    const rolePermissions = {
        admin_role: [
            'logs:CreateLogGroup', 'logs:CreateLogStream', 'logs:PutLogEvents'
        ],
        basic_user_role: [
            'logs:CreateLogGroup', 'logs:CreateLogStream', 'logs:PutLogEvents'
        ],
        logistics_role: [
            'logs:CreateLogGroup', 'logs:CreateLogStream', 'logs:PutLogEvents'
        ],
        project_manager_role: [
            'logs:CreateLogGroup', 'logs:CreateLogStream', 'logs:PutLogEvents'
        ],
        driver_role: ['logs:CreateLogGroup', 'logs:CreateLogStream', 'logs:PutLogEvents']
    };

    for (const [roleName,
        permissions]of Object.entries(rolePermissions)) {
        template.hasResourceProperties('AWS::IAM::Role', {
            RoleName: roleName,
            AssumeRolePolicyDocument: {
                Version: '2012-10-17',
                Statement: [
                    {
                        Effect: 'Allow',
                        Principal: {
                            Federated: 'cognito-identity.amazonaws.com'
                        },
                        Action: 'sts:AssumeRoleWithWebIdentity',
                        Condition: {
                            StringEquals: {
                                'cognito-identity.amazonaws.com:aud': {
                                    Ref: 'AWS::Cognito::IdentityPool'
                                }
                            },
                            'ForAnyValue:StringLike': {
                                'cognito-identity.amazonaws.com:amr': `group/${roleName.split('_')[0]}_group`
                            }
                        }
                    }
                ]
            },
            Policies: [
                {
                    PolicyName: `${roleName}-policy`,
                    PolicyDocument: {
                        Version: '2012-10-17',
                        Statement: permissions.map((permission) => ({Effect: 'Allow', Action: permission, Resource: '*'}))
                    }
                }
            ]
        });
    }

    // Check if the Cognito User Pool Groups have the proper roles associated with
    // them
    const groupRoleMappings = {
        admin_group: 'admin_role',
        basic_user_group: 'basic_user_role',
        logistics_group: 'logistics_role',
        project_manager_group: 'project_manager_role',
        driver_group: 'driver_role'
    };

    for (const [groupName,
        roleName]of Object.entries(groupRoleMappings)) {
        template.hasResourceProperties('AWS::Cognito::UserPoolGroup', {
            GroupName: groupName,
            RoleArn: {
                'Fn::GetAtt': [roleName, 'Arn']
            }
        });
    }

});

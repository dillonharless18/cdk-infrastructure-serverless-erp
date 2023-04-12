/* eslint-disable no-new */
/* eslint-disable import/prefer-default-export */

/* This page is inspired by this blog - https://awstip.com/aws-cdk-template-for-hosting-a-static-website-in-s3-served-via-cloudfront-e810ffcaff0c */

import { CfnOutput, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as fs from "fs";
import path = require('path');

interface CognitoStackProps extends StackProps {
    branch: string;

    domainName: string;
}

export class CognitoStack extends Stack {
  constructor(scope: Construct, id: string, props: CognitoStackProps) {
    super(scope, id, props);
    

    type branchToSubdomainTypes = {
        [key: string]: string
    }

    // Use to create cognito user pools domain names
    const BRANCH_TO_STAGE_MAP: branchToSubdomainTypes = {
        development: 'development-',
        test:        'test-',
        main:        ''
    }

    // Use to create subdomains programmatically like dev.example.com, test.example.com, example.com
    const BRANCH_TO_SUBDOMAIN_MAP: branchToSubdomainTypes = {
        development: 'dev.',
        test:        'test.',
        main:        ''
    }

    const { branch, domainName } = props

    if ( !domainName ) throw new Error(`Error in cognito stack. domainName does not exist on \n Props: ${JSON.stringify(props, null , 2)}`);
    const DOMAIN_NAME = domainName;
    
    if ( !branch ) throw new Error(`Error in cognito stack. branch does not exist on \n Props: ${JSON.stringify(props, null , 2)}`);
    const DOMAIN_WITH_SUBDOMAIN = `${BRANCH_TO_SUBDOMAIN_MAP[branch]}${domainName}`

    const WWW_DOMAIN_WITH_SUBDOMAIN = `www.${DOMAIN_WITH_SUBDOMAIN}`;


    //////////////////////////
    ///      IAM Roles     ///
    //////////////////////////

    // Create IAM roles for the identity pool
    function createRole(scope: Construct, id: string, roleName: string, policyDocument: iam.PolicyDocument): iam.Role {
        const role = new iam.Role(scope, id, {
          roleName: roleName,
          assumedBy: new iam.FederatedPrincipal('cognito-identity.amazonaws.com', {}, 'sts:AssumeRoleWithWebIdentity'),
          inlinePolicies: {
            [`${roleName}Policy`]: policyDocument,
          },
        });
      
        return role;
    }
      
    
    const adminRolePolicy = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'iam', 'roles', 'admin.json'), 'utf-8'));
    const basicUserRolePolicy = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'iam', 'roles', 'basic_user.json'), 'utf-8'));
    const logisticsRolePolicy = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'iam', 'roles', 'logistics.json'), 'utf-8'));
    const projectManagerRolePolicy = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'iam', 'roles', 'project_manager.json'), 'utf-8'));
    const driverRolePolicy = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'iam', 'roles', 'driver.json'), 'utf-8'));

    // Define the policy documents for each role
    const adminPolicyDocument = iam.PolicyDocument.fromJson(adminRolePolicy);
    const basicUserPolicyDocument = iam.PolicyDocument.fromJson(basicUserRolePolicy);
    const logisticsPolicyDocument = iam.PolicyDocument.fromJson(logisticsRolePolicy);
    const projectManagerPolicyDocument = iam.PolicyDocument.fromJson(projectManagerRolePolicy);
    const driverPolicyDocument = iam.PolicyDocument.fromJson(driverRolePolicy);


    // Create the roles using the createRole function
    const adminRole = createRole(this, 'AdminRole', 'admin_role', adminPolicyDocument);
    const basicUserRole = createRole(this, 'BasicUserRole', 'basic_user_role', basicUserPolicyDocument);
    const logisticsRole = createRole(this, 'LogisticsRole', 'logistics_role', logisticsPolicyDocument);
    const projectManagerRole = createRole(this, 'ProjectManagerRole', 'project_manager_role', projectManagerPolicyDocument);
    const driverRole = createRole(this, 'DriverRole', 'driver_role', driverPolicyDocument);



    //////////////////////////
    ///      Cognito       ///
    //////////////////////////

    // Define the user pool
    const userPool = new cognito.UserPool(this, 'UserPool', {
        selfSignUpEnabled: true, // Allow users to sign up
        userVerification: {
          emailStyle: cognito.VerificationEmailStyle.CODE, // Use verification code sent via email
        },
        signInAliases: { // Allow users to sign in using their email address as well as a username
          email: true,
          username: true,
        },
        autoVerify: { // Automatically verify the email address of newly created users
          email: true,
        },
        passwordPolicy: { // Set password policy requirements
          minLength: 8,
          requireDigits: true,
          requireLowercase: true,
          requireUppercase: true,
          requireSymbols: true,
        },
    });
  
    // Define the app client for the user pool
    const userPoolClient = new cognito.UserPoolClient(this, 'UserPoolClient', {
        userPool,
        generateSecret: false, // Disable generation of client secret
        authFlows: { // Enable username/password-based authentication
          userPassword: true,
        },
    });
  
    // Define a domain for the user pool (e.g., my-domain.auth.us-west-2.amazoncognito.com)
    const userPoolDomain = new cognito.UserPoolDomain(this, 'UserPoolDomain', {
        userPool,
        cognitoDomain: {
            domainPrefix: `${BRANCH_TO_STAGE_MAP[branch]}${domainName}`,
        },
    });
  
    // Define user pool groups for different roles
    const adminGroup = new cognito.CfnUserPoolGroup(this, 'AdminGroup', {
        groupName: 'admin_group',
        userPoolId: userPool.userPoolId,
        precedence: 0
    });

    const basicUserGroup = new cognito.CfnUserPoolGroup(this, 'BasicUserGroup', {
        groupName: 'basic_user_group',
        userPoolId: userPool.userPoolId,
        precedence: 4
    });

    const logisticsGroup = new cognito.CfnUserPoolGroup(this, 'LogisticsGroup', {
        groupName: 'logistics_group',
        userPoolId: userPool.userPoolId,
        precedence: 2
    });

    const projectManagerGroup = new cognito.CfnUserPoolGroup(this, 'ProjectManagerGroup', {
        groupName: 'project_manager_group',
        userPoolId: userPool.userPoolId,
        precedence: 1
    });
  
    const driverGroup = new cognito.CfnUserPoolGroup(this, 'DriverGroup', {
        groupName: 'driver_group',
        userPoolId: userPool.userPoolId,
        precedence: 3
    });

    const identityPool = new cognito.CfnIdentityPool(this, 'IdentityPool', {
        allowUnauthenticatedIdentities: false,
        cognitoIdentityProviders: [
          {
            clientId: userPoolClient.userPoolClientId,
            providerName: userPool.userPoolProviderName,
          },
        ]
    });

    
    new cognito.CfnIdentityPoolRoleAttachment(this, 'IdentityPoolRoleAttachment', {
        identityPoolId: identityPool.ref,
        roleMappings: {
            'cognito:preferred_role': {
            type: 'Token',
            ambiguousRoleResolution: 'Deny',
            rulesConfiguration: {
                rules: [
                    {
                        claim: 'cognito:preferred_role',
                        matchType: 'Equals',
                        roleArn: adminRole.roleArn,
                        value: adminGroup.groupName ?? '',
                    },
                    {
                        claim: 'cognito:preferred_role',
                        matchType: 'Equals',
                        roleArn: basicUserRole.roleArn,
                        value: basicUserGroup.groupName ?? '',
                    },
                    {
                        claim: 'cognito:preferred_role',
                        matchType: 'Equals',
                        roleArn: logisticsRole.roleArn,
                        value: logisticsGroup.groupName ?? '',
                    },
                    {
                        claim: 'cognito:preferred_role',
                        matchType: 'Equals',
                        roleArn: projectManagerRole.roleArn,
                        value: projectManagerGroup.groupName ?? '',
                    },
                    {
                        claim: 'cognito:preferred_role',
                        matchType: 'Equals',
                        roleArn: driverRole.roleArn,
                        value: driverGroup.groupName ?? '',
                    },
                ]
            },
        }}
    })
          
    // Output the domain name for the user pool
    new cdk.CfnOutput(this, 'UserPoolDomain', {
        value: userPoolDomain.domainName,
    });

  }
}
/* eslint-disable no-new */
/* eslint-disable  /prefer-default-export */

/* This page is inspired by this blog - https://awstip.com/aws-cdk-template-for-hosting-a-static-website-in-s3-served-via-cloudfront-e810ffcaff0c */

import { CfnOutput, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as fs from "fs";
import path = require('path');

interface CognitoConstructProps {
    applicationName: string;
    env: {
        account: string,
        region:  string
    }
    domainName: string;
    stageName: string;
    customOauthCallbackURLsList: string[];
    customOauthLogoutURLsList: string[];
}

export class CognitoConstruct extends Construct {
    
  public readonly adminRole: iam.Role;
  public readonly basicUserRole: iam.Role;
  public readonly driverRole: iam.Role;
  public readonly logisticsRole: iam.Role;
  public readonly projectManagerRole: iam.Role;
  public readonly userPool: cognito.IUserPool;
  public readonly appClient: cognito.IUserPoolClient;

  constructor(scope: Construct, id: string, props: CognitoConstructProps) {
    super(scope, id);
    

    type stageNameToSubdomainTypes = {
        [key: string]: string
    }

    // Use to create cognito user pools domain names
    const STAGE_NAME_TO_AUTH_PREFIX: stageNameToSubdomainTypes = {
        development: `dev-${props.applicationName.toLowerCase()}`,
        test:        `test-${props.applicationName.toLowerCase()}`,
        prod:        `${props.applicationName.toLowerCase()}`
    }

    const { stageName, domainName } = props

    if ( !domainName ) throw new Error(`Error in cognito stack. domainName does not exist on \n Props: ${JSON.stringify(props, null , 2)}`);

    


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
      
    // TODO Maybe in the api construct actually update these roles to only be able to access the specific api endpoints as well
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


    // Create the roles using the createRole function - NOTE these are intentionally lower case
    const adminRole = createRole(this, 'admin', 'admin', adminPolicyDocument);
    const basicUserRole = createRole(this, 'basicuser', 'basicuser', basicUserPolicyDocument);
    const logisticsRole = createRole(this, 'logistics', 'logistics', logisticsPolicyDocument);
    const projectManagerRole = createRole(this, 'projectmanager', 'projectmanager', projectManagerPolicyDocument);
    const driverRole = createRole(this, 'driver', 'driver', driverPolicyDocument);

    this.adminRole = adminRole;
    this.basicUserRole = basicUserRole;
    this.logisticsRole = logisticsRole;
    this.projectManagerRole = projectManagerRole;
    this.driverRole = driverRole;


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
          userSrp: true,
        },
        oAuth: {
          flows: {
            authorizationCodeGrant: true,
            implicitCodeGrant: false,
            clientCredentials: false,
          },
          callbackUrls: [...props.customOauthCallbackURLsList],
          logoutUrls:   [...props.customOauthLogoutURLsList]
        }
    });
  
    // Define a domain for the user pool (e.g., my-domain.auth.us-west-2.amazoncognito.com)
    const userPoolDomain = new cognito.UserPoolDomain(this, 'UserPoolDomain', {
        userPool,
        cognitoDomain: {
            domainPrefix: `${STAGE_NAME_TO_AUTH_PREFIX[stageName]}`,
        },
    });
  
    // Define user pool groups for different roles
    const adminGroup = new cognito.CfnUserPoolGroup(this, 'AdminGroup', {
        groupName: 'admin',
        userPoolId: userPool.userPoolId,
        precedence: 0,
        roleArn: adminRole.roleArn,
    });

    const basicUserGroup = new cognito.CfnUserPoolGroup(this, 'BasicUserGroup', {
        groupName: 'basic_user',
        userPoolId: userPool.userPoolId,
        precedence: 4,
        roleArn: basicUserRole.roleArn
    });

    const logisticsGroup = new cognito.CfnUserPoolGroup(this, 'LogisticsGroup', {
        groupName: 'logistics',
        userPoolId: userPool.userPoolId,
        precedence: 2,
        roleArn: logisticsRole.roleArn
    });

    const projectManagerGroup = new cognito.CfnUserPoolGroup(this, 'ProjectManagerGroup', {
        groupName: 'project_manager',
        userPoolId: userPool.userPoolId,
        precedence: 1,
        roleArn: projectManagerRole.roleArn
    });
  
    const driverGroup = new cognito.CfnUserPoolGroup(this, 'DriverGroup', {
        groupName: 'driver',
        userPoolId: userPool.userPoolId,
        precedence: 3,
        roleArn: driverRole.roleArn
    });

    
    // Identity pool
    const identityPool = new cognito.CfnIdentityPool(this, 'IdentityPool', {
      allowUnauthenticatedIdentities: false, // Don't allow unauthenticated users
      cognitoIdentityProviders: [{
          clientId: userPoolClient.userPoolClientId,
          providerName: userPool.userPoolProviderName,
      }],
    });

    new cognito.CfnIdentityPoolRoleAttachment(this, 'identity-pool-role-attachment', {
      identityPoolId: identityPool.ref,
      roles: {},
      roleMappings: {
        mapping: {
          type: 'Token',
          ambiguousRoleResolution: 'Deny',
          identityProvider: `cognito-idp.${
            cdk.Stack.of(this).region
          }.amazonaws.com/${userPool.userPoolId}:${
            userPoolClient.userPoolClientId
          }`,
        },
      },
    });
    


    this.userPool  = userPool;
    this.appClient = userPoolClient;

  }
}
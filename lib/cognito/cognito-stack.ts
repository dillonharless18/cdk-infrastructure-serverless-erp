
/* eslint-disable no-new */
/* eslint-disable import/prefer-default-export */

/* This page is inspired by this blog - https://awstip.com/aws-cdk-template-for-hosting-a-static-website-in-s3-served-via-cloudfront-e810ffcaff0c */

import { CfnOutput, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as iam from 'aws-cdk-lib/aws-iam';
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

    // Define the user pool
    const userPool = new cognito.UserPool(this, 'MyUserPool', {
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
      const userPoolClient = new cognito.UserPoolClient(this, 'MyUserPoolClient', {
        userPool,
        generateSecret: false, // Disable generation of client secret
        authFlows: { // Enable username/password-based authentication
          userPassword: true,
        },
      });
  
      // Define a domain for the user pool (e.g., my-domain.auth.us-west-2.amazoncognito.com)
      const userPoolDomain = new cognito.UserPoolDomain(this, 'MyUserPoolDomain', {
        userPool,
        cognitoDomain: {
          domainPrefix: 'my-domain',
        },
      });
  
      // Define the default user pool group
      const defaultGroup = new cognito.CfnUserPoolGroup(this, 'MyUserPoolGroup', {
        groupName: 'Default',
        userPoolId: userPool.userPoolId,
      });
  
      // Grant permissions to the app client to access the user pool
      userPoolClient.node.addDependency(defaultGroup);
      userPoolClient.addToPrincipalPolicy(new iam.PolicyStatement({
        actions: ['cognito-idp:AdminGetUser'],
        resources: [userPool.userPoolArn],
      }));
  
      // Output the domain name for the user pool
      new cdk.CfnOutput(this, 'UserPoolDomain', {
        value: userPoolDomain.domainName,
      });

  }
}
import { Construct } from 'constructs';
import * as iam from 'aws-cdk-lib/aws-iam';
import path = require('path');

export function createCustomRole(scope: Construct, id: string, roleName: string, policyDocument: iam.PolicyDocument, identityPoolId: string): iam.Role {
    const role = new iam.Role(scope, id, {
      roleName: roleName,
      assumedBy: new iam.FederatedPrincipal('cognito-identity.amazonaws.com', {
        'StringEquals': {
          'cognito-identity.amazonaws.com:aud': identityPoolId
        },
        'ForAnyValue:StringLike': {
          'cognito-identity.amazonaws.com:amr': 'authenticated'
        }
      }, 'sts:AssumeRoleWithWebIdentity'),
      inlinePolicies: {
        [`${roleName}Policy`]: policyDocument,
      },
    });

    return role;
}
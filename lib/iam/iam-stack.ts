
/* eslint-disable no-new */
/* eslint-disable import/prefer-default-export */

/* This page is inspired by this blog - https://awstip.com/aws-cdk-template-for-hosting-a-static-website-in-s3-served-via-cloudfront-e810ffcaff0c */

// NOTE: Not currently in use.

import { CfnOutput, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as fs from 'fs';
import * as path from 'path';

interface IamStackProps extends StackProps {
    branch: string;
    domainName: string;
}

export class IamStack extends Stack {
  constructor(scope: Construct, id: string, props: IamStackProps) {
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

    if ( !domainName ) throw new Error(`Error in database stack. domainName does not exist on \n Props: ${JSON.stringify(props, null , 2)}`);
    const DOMAIN_NAME = domainName;
    
    if ( !branch ) throw new Error(`Error in database stack. branch does not exist on \n Props: ${JSON.stringify(props, null , 2)}`);
    const DOMAIN_WITH_SUBDOMAIN = `${BRANCH_TO_SUBDOMAIN_MAP[branch]}${domainName}`

    // const rolesDirPath = props.rolesDirPath;
    const rolesDirPath = "./roles";

    fs.readdirSync(rolesDirPath).forEach((fileName) => {
      const filePath = path.join(rolesDirPath, fileName);
      const roleName = path.basename(fileName, path.extname(fileName));

      const role = new iam.Role(this, roleName, {
        assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      });

      const policyJson = fs.readFileSync(filePath, { encoding: 'utf8' });
      const managedPolicy = iam.ManagedPolicy.fromManagedPolicyName(
        this,
        `${roleName}-ManagedPolicy`,
        policyJson
      );

      role.addManagedPolicy(managedPolicy);
    });

  }
}



// Contains the API Gateway, authorizers, Cognito, and IAM (not too sure about the last two)

// TODO add some logic to the metadata.json file of the Lambda functions to allow the developer to pass the role that the function should be allowed to use


/* eslint-disable no-new */
/* eslint-disable import/prefer-default-export */

/* This page is inspired by this blog - https://awstip.com/aws-cdk-template-for-hosting-a-static-website-in-s3-served-via-cloudfront-e810ffcaff0c */

import { CfnOutput, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import { BucketEncryption, BucketAccessControl, BlockPublicAccess } from 'aws-cdk-lib/aws-s3';
import {
  ViewerCertificate,
  ViewerProtocolPolicy,
  HttpVersion,
  PriceClass,
  OriginAccessIdentity,
} from 'aws-cdk-lib/aws-cloudfront';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { CertificateValidation } from 'aws-cdk-lib/aws-certificatemanager';
import { HostedZone, RecordSet } from 'aws-cdk-lib/aws-route53';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import path = require('path');

interface ApiStackProps extends StackProps {
    branch: string;
    domainName: string;
}

export class ApiStack extends Stack {
  constructor(scope: Construct, id: string, props: ApiStackProps) {
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

    if ( !domainName ) throw new Error(`Error in API stack. domainName does not exist on \n Props: ${JSON.stringify(props, null , 2)}`);
    const DOMAIN_NAME = domainName;
    
    if ( !branch ) throw new Error(`Error in API stack. branch does not exist on \n Props: ${JSON.stringify(props, null , 2)}`);
    const DOMAIN_WITH_SUBDOMAIN = `${BRANCH_TO_SUBDOMAIN_MAP[branch]}${domainName}`

    const WWW_DOMAIN_WITH_SUBDOMAIN = `www.${DOMAIN_WITH_SUBDOMAIN}`;

    // Hosted Zone name should match the domain
    const hostedZone = new HostedZone(this, 'HostedZone', {
      zoneName: `${BRANCH_TO_SUBDOMAIN_MAP[branch]}onexerp.com`,
    });

    // TODO Create NS records for lower envs in prod - look for a good automated solution for this
    //      The issue is referencing NS records before they exist
    // if ( branch === 'main' ) {
    //     new RecordSet(this, `RecordSet-${branch}` {
    //     })
    // }

    // How to delegate NS records to hostedZone in prod account in the most automated


    const siteBucket = new s3.Bucket(this, 'WebsiteBucket', {
        encryption: BucketEncryption.S3_MANAGED,
        removalPolicy: RemovalPolicy.DESTROY,
        autoDeleteObjects: true,
        // No website related settings
        accessControl: BucketAccessControl.PRIVATE,
        publicReadAccess: false,
        blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
    });

    const accessIdentity = new OriginAccessIdentity(this, `CloudfrontAccess-${branch}`);
    const cloudfrontUserAccessPolicy = new PolicyStatement();
    cloudfrontUserAccessPolicy.addActions('s3:GetObject');
    cloudfrontUserAccessPolicy.addPrincipals(accessIdentity.grantPrincipal);
    cloudfrontUserAccessPolicy.addResources(siteBucket.arnForObjects('*'));
    siteBucket.addToResourcePolicy(cloudfrontUserAccessPolicy);

    // This step will block deployment until you add the relevant CNAME records through your domain registrar
    // Make sure you visit https://us-east-1.console.aws.amazon.com/acm/home?region=us-east-1#/certificates
    // to check the CNAME records that need to be added
    // Idea for extension: build a Lambda custom resource that makes an API call to your domain registrar
    // to add the relevant CNAME records
    // (Obviously if you're using Route53, you can bypass this step):
    // https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_cloudfront-readme.html#domain-names-and-certificates
    const cert = new acm.Certificate(this, `WebCert-${branch}`, {
        domainName: WWW_DOMAIN_WITH_SUBDOMAIN,
        subjectAlternativeNames: [DOMAIN_WITH_SUBDOMAIN],
        validation: CertificateValidation.fromDns(),
    });

    const ROOT_INDEX_FILE = 'index.html';
    const cfDist = new cloudfront.CloudFrontWebDistribution(this, `CfDistribution-${branch}`, {
        comment: 'CDK Cloudfront Secure S3',
        viewerCertificate: ViewerCertificate.fromAcmCertificate(cert, {
            aliases: [DOMAIN_WITH_SUBDOMAIN, WWW_DOMAIN_WITH_SUBDOMAIN],
        }),
        defaultRootObject: ROOT_INDEX_FILE,
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        httpVersion: HttpVersion.HTTP2,
        priceClass: PriceClass.PRICE_CLASS_100, // the cheapest
        originConfigs: [
            {
            s3OriginSource: {
                originAccessIdentity: accessIdentity,
                s3BucketSource: siteBucket,
                // originPath: `/`, // TODO replace this...
            },
            behaviors: [
                {
                compress: true,
                isDefaultBehavior: true,
                },
            ],
            },
        ],
        // Allows React to handle all errors internally
        errorConfigurations: [
            {
            errorCachingMinTtl: 300, // in seconds
            errorCode: 403,
            responseCode: 200,
            responsePagePath: `/${ROOT_INDEX_FILE}`,
            },
            {
            errorCachingMinTtl: 300, // in seconds
            errorCode: 404,
            responseCode: 200,
            responsePagePath: `/${ROOT_INDEX_FILE}`,
            },
        ],
    });

    const deployment = new BucketDeployment(this, 'DeployWebsite', {
        sources: [Source.asset('../website-code/build')],
        destinationBucket: siteBucket,
    });

    // TODO add a CF invalidation here

    // You will need output to create a www CNAME record to
    new CfnOutput(this, 'CfDomainName', {
        value: cfDist.distributionDomainName,
        description: 'Create a CNAME record with name `www` and value of this CF distribution URL',
    });
    new CfnOutput(this, 'S3BucketName', {
        value: `s3://${siteBucket.bucketName}/`,
        description: 'Use this with `aws s3 sync` to upload your static website files',
    });
    new CfnOutput(this, 'CfDistId', {
        value: cfDist.distributionId,
        description: 'Use this ID to perform a cache invalidation to see changes to your site immediately',
    });

  }
}
# Repo Overview
Contains all IaaC - databases, APIs, IAM, etc.

Stacks:

UI Stack Cloudfront, certs, S3 hosting, etc.

Permissions Stack IAM roles, Cognito, any KMS, etc.

Data Stack DynamoDB, Streams maybe

Analytics Stack Quicksight, Athena, Glue, etc.

API Stack AppSync, VTL resolvers

One SQS Stack per logical component of application

Lambda Stack - TBD Need to determine benefits and trade-offs for separating code (putting only code into the Lambda repo) and creating them here vs Creating CDK Constructs and the code in the Lambda repo




# Welcome to your CDK TypeScript project

This is a blank project for CDK development with TypeScript.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template

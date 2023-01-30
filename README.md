# oneXerp-Infrastructure
Contains all IaaC - databases, APIs, IAM, etc.

Stacks:

  UI Stack
    Cloudfront, certs, S3 hosting, etc.
    
  Permissions Stack
    IAM roles, Cognito, any KMS, etc.
    
  Data Stack
    DynamoDB, Streams maybe
  
  Analytics Stack
    Quicksight, Athena, Glue, etc.
  
  API Stack
    AppSync, VTL resolvers
    
  One SQS Stack per logical component of application
  
  Lambda Stack - TBD
    Need to determine benefits and trade-offs for separating code (putting only code into the Lambda repo) and creating them here
      vs
    Creating CDK Constructs and the code in the Lambda repo

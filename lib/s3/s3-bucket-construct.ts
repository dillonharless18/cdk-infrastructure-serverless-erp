import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { RemovalPolicy } from 'aws-cdk-lib';

export interface CustomBucketProps extends s3.BucketProps {
    bucketName: string;
    versioned?: boolean;
    encryption?: s3.BucketEncryption;
    removalPolicy?: RemovalPolicy;
    // Include other properties as needed
}

export class CustomBucket extends Construct {
  public readonly bucket: s3.Bucket;

  constructor(scope: Construct, id: string, props: CustomBucketProps) {
    super(scope, id);

    this.bucket = new s3.Bucket(this, id, {
      bucketName: props.bucketName,
      versioned: props.versioned,
      encryption: props.encryption,
      removalPolicy: props.removalPolicy || RemovalPolicy.RETAIN, // Default to RETAIN if not provided
      // Include other properties as needed
    });
  }
}

import { 
    aws_ec2 as ec2,
    aws_sqs as sqs,
    aws_iam as iam,
    Duration
 } from "aws-cdk-lib";
import { AutoScalingGroup } from "aws-cdk-lib/aws-autoscaling";
import { InstanceType, Vpc } from "aws-cdk-lib/aws-ec2";
import { Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { Queue } from "aws-cdk-lib/aws-sqs";
import { Construct } from "constructs";
import { QuickBooksDesktopConstruct } from "./quickbooks-desktop-construct";

interface IExtensibleFinanceConstruct {
    vpc: Vpc;
    enableQBDIntegration: boolean;
    amiNameQBD?: string;
    amiOwnersQBD?: string[];
}

/**
 * This construct is meant to decouple the various integrations
 * from oneXerp's logic. We can turn various integrations on and off.
 */

export class ExtensibleFinanceConstruct extends Construct {
  constructor(scope: Construct, id: string, props: IExtensibleFinanceConstruct) {
    super(scope, id);

    /////////////////////////////
    // StartQBD Infrastructure //
    /////////////////////////////

    // TODO Instead of throwing an error here, maybe we should just default to a public ami we created with QBD
    if ( props.enableQBDIntegration && ( !props.amiNameQBD || !props.amiOwnersQBD || props.amiOwnersQBD.length === 0 ) ) {
      throw Error("Error inside extensible-finance-module.ts. enableQBDIntegration is set to true, but amiNameQBD |OR| amiOwnersQBD is null or undefined |OR| amiOwnersQBD array is empty.")
    }

    let qbdInfra
    if ( props.enableQBDIntegration && props.amiNameQBD && props.amiOwnersQBD && props.amiOwnersQBD.length > 0) {
      qbdInfra = new QuickBooksDesktopConstruct(this, 'QBDInfra', {
        amiName: props.amiNameQBD,
        amiOwners: props.amiOwnersQBD,
        vpc: props.vpc        
      })
    }

    ////////////////////////////
    // End QBD Infrastructure //
    ////////////////////////////

  }
}
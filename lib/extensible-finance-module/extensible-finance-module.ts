import { Queue } from 'aws-cdk-lib/aws-sqs';
import { Vpc } from "aws-cdk-lib/aws-ec2";
import { Construct } from "constructs";
import { QuickBooksDesktopConstruct } from "./quickbooks-desktop-construct";
import { Topic } from "aws-cdk-lib/aws-sns";

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
  public readonly egressQueue: Queue | null = null;
  public readonly ingressQueue: Queue | null = null;

  constructor(scope: Construct, id: string, props: IExtensibleFinanceConstruct) {
    super(scope, id);


    ////////////////
    // Start SNS  //
    ////////////////

    const poEventsTopic = new Topic(this, 'POEventsTopic', {
      displayName: 'Finance events topic'
    });

    /////////////
    // End SNS //
    ////////////


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

      this.egressQueue  = qbdInfra.egressQueue;
      this.ingressQueue = qbdInfra.ingressQueue; 
    }

    ////////////////////////////
    // End QBD Infrastructure //
    ////////////////////////////

  }
}
import { 
    aws_ec2 as ec2,
    aws_sqs as sqs,
    aws_iam as iam,
    Duration,
    CfnOutput
 } from "aws-cdk-lib";
import { AutoScalingGroup } from "aws-cdk-lib/aws-autoscaling";
import { InstanceType, Vpc } from "aws-cdk-lib/aws-ec2";
import { ManagedPolicy, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { Queue } from "aws-cdk-lib/aws-sqs";
import { Construct } from "constructs";

interface IQuickBooksDesktopConstructProps {
    vpc: Vpc;
    amiName: string;
    amiOwners: string[];    
}

/**
 * This construct is meant to decouple the custom QBD application from the oneXerp logic.
 * oneXerp owns the queues that the QBD application will read from. It also owns the EC2
 * on which it runs to ease security management. This construct can be conditionally
 * enabled for customers that have QBD and want to use it.
 * 
 * The custom QBD application itself is stored, managed, and deployed on this EC2
 * in a separate CDK application.
 */

export class QuickBooksDesktopConstruct extends Construct {
  public readonly egressQueue:  Queue;
  public readonly ingressQueue: Queue;

  constructor(scope: Construct, id: string, props: IQuickBooksDesktopConstructProps) {
    super(scope, id);

    this.egressQueue = new Queue(this, 'EgressQueue', {
      visibilityTimeout: Duration.seconds(60),
      fifo: true,
      contentBasedDeduplication: true
    });

    this.ingressQueue = new Queue(this, 'IngressQueue', {
      visibilityTimeout: Duration.seconds(60),
      fifo: true,
      contentBasedDeduplication: true
    });

    // Output the ARNs of the queues
    const egressQueueURLCFOutput  = new CfnOutput(this, 'egressQueue', { value: this.egressQueue.queueUrl, exportName: 'egressQueue' });
    const ingressQueueURLCFOutput = new CfnOutput(this, 'ingressQueue', { value: this.ingressQueue.queueUrl, exportName: 'ingressQueue' });

    // TODO make this conditional. Maybe we just want the queues and nothing else
    const role = new Role(this, 'QBDEC2Role', {
      assumedBy: new ServicePrincipal('ec2.amazonaws.com'),
      roleName: 'QBDServerRole'
    });

    // TODO - Pare down these permissions
    role.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName('AmazonEC2FullAccess'));
    role.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName('AmazonSQSFullAccess'));
    role.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'));
    role.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMPatchAssociation'));
    role.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName('AWSCloudFormationFullAccess'));

    this.egressQueue.grantSendMessages(role);
    this.egressQueue.grantConsumeMessages(role);
    this.ingressQueue.grantSendMessages(role);
    this.ingressQueue.grantConsumeMessages(role);

  // TODO uncomment this to enable the EC2 instance creation.
  // TODO Pending tasks before this should be done 
              /**
               * Confirm code pulls from the queues properly
               * Confirm AMI works properly - create one manually with it
               * Set up Autoscaling group health checks
               * Figure out the best way to deploy the code here
               */
  // Use an AMI that has QBD installed, and preferably a stable version of the application.
  //   const ami = ec2.MachineImage.lookup({
  //     name: props.amiName,
  //     owners: props.amiOwners
  //   });

  //   const asg = new AutoScalingGroup(this, 'QBDASG', {
  //     vpc: props.vpc,
  //     instanceType: InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.LARGE),
  //     machineImage: ami,
  //     role,
  //     minCapacity: 1,
  //     maxCapacity: 1
  //   });
  }
}
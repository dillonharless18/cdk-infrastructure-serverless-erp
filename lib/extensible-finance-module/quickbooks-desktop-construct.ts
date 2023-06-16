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
    constructor(scope: Construct, id: string, props: IQuickBooksDesktopConstructProps) {
      super(scope, id);

      const egressQueue = new Queue(this, 'EgressQueue', {
        visibilityTimeout: Duration.seconds(60),
      });
  
      const ingressQueue = new Queue(this, 'IngressQueue', {
        visibilityTimeout: Duration.seconds(60)
      });
  
      // TODO make this conditional. Maybe we just want the queues and nothing else
      const role = new Role(this, 'QBDEC2Role', {
        assumedBy: new ServicePrincipal('ec2.amazonaws.com')
      });
  
      egressQueue.grantSendMessages(role);
      egressQueue.grantConsumeMessages(role);
      ingressQueue.grantSendMessages(role);
      ingressQueue.grantConsumeMessages(role);
  
      // Use an AMI that has QBD installed, and preferably a stable version of the application.
      const ami = ec2.MachineImage.lookup({
        name: props.amiName,
        owners: props.amiOwners
      });
  
      const asg = new AutoScalingGroup(this, 'QBDASG', {
        vpc: props.vpc,
        instanceType: InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.LARGE),
        machineImage: ami,
        role,
        minCapacity: 1,
        maxCapacity: 1
      });
    }
  }
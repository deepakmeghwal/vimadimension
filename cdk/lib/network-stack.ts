import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

export class NetworkStack extends cdk.Stack {
  public readonly vpc: ec2.Vpc;
  public readonly webSg: ec2.SecurityGroup;
  public readonly dbSg: ec2.SecurityGroup;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // VPC
    this.vpc = new ec2.Vpc(this, 'VimaDimensionVpc', {  // Keep original ID to maintain cross-stack references
      maxAzs: 2,
      natGateways: 0, // Saving costs as per plan, using Public subnets for EC2
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'Public',
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: 'Isolated',
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
        }
      ]
    });

    // Security Groups
    this.webSg = new ec2.SecurityGroup(this, 'WebSG', {
      vpc: this.vpc,
      description: 'Allow HTTP/HTTPS and SSH access',
      allowAllOutbound: true
    });

    this.webSg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22), 'Allow SSH');

    this.dbSg = new ec2.SecurityGroup(this, 'DbSG', {
      vpc: this.vpc,
      description: 'Allow database access from WebSG',
      allowAllOutbound: true
    });

    this.dbSg.addIngressRule(this.webSg, ec2.Port.tcp(3306), 'Allow MySQL from WebSG');
  }
}

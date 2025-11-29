import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { Construct } from 'constructs';

interface LoadBalancerStackProps extends cdk.StackProps {
    vpc: ec2.Vpc;
}

export class LoadBalancerStack extends cdk.Stack {
    public readonly alb: elbv2.ApplicationLoadBalancer;
    public readonly albSecurityGroup: ec2.SecurityGroup;
    public readonly albDnsName: string;
    public readonly listener: elbv2.ApplicationListener;

    constructor(scope: Construct, id: string, props: LoadBalancerStackProps) {
        super(scope, id, props);

        // Security Group for ALB
        this.albSecurityGroup = new ec2.SecurityGroup(this, 'AlbSG', {
            vpc: props.vpc,
            description: 'Security Group for Application Load Balancer',
            allowAllOutbound: true,
        });

        this.albSecurityGroup.addIngressRule(
            ec2.Peer.anyIpv4(),
            ec2.Port.tcp(80),
            'Allow HTTP from anywhere'
        );

        // Application Load Balancer
        this.alb = new elbv2.ApplicationLoadBalancer(this, 'AppLoadBalancer', {
            vpc: props.vpc,
            internetFacing: true,
            securityGroup: this.albSecurityGroup,
            vpcSubnets: {
                subnetType: ec2.SubnetType.PUBLIC,
            },
        });

        // Listener
        this.listener = this.alb.addListener('HttpListener', {
            port: 80,
            open: true,
        });

        this.albDnsName = this.alb.loadBalancerDnsName;

        new cdk.CfnOutput(this, 'AlbDnsName', {
            value: this.albDnsName,
            description: 'DNS Name of the Application Load Balancer',
        });
    }
}

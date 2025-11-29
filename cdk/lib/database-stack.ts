import * as cdk from 'aws-cdk-lib';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

interface DatabaseStackProps extends cdk.StackProps {
    vpc: ec2.Vpc;
    securityGroup: ec2.SecurityGroup;
}

export class DatabaseStack extends cdk.Stack {
    public readonly database: rds.DatabaseInstance;

    constructor(scope: Construct, id: string, props: DatabaseStackProps) {
        super(scope, id, props);

        this.database = new rds.DatabaseInstance(this, 'MySQLInstance', {
            engine: rds.DatabaseInstanceEngine.mysql({ version: rds.MysqlEngineVersion.VER_8_0 }),
            vpc: props.vpc,
            vpcSubnets: {
                subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
            },
            instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO),
            securityGroups: [props.securityGroup],
            multiAz: false,
            allocatedStorage: 20,
            maxAllocatedStorage: 100,
            allowMajorVersionUpgrade: false,
            autoMinorVersionUpgrade: true,
            backupRetention: cdk.Duration.days(1),
            deleteAutomatedBackups: true,
            removalPolicy: cdk.RemovalPolicy.DESTROY, // For dev/test, use SNAPSHOT or RETAIN for prod
            databaseName: 'vimadimension',
            publiclyAccessible: false,
        });

        // Output the secret name to retrieve credentials later
        new cdk.CfnOutput(this, 'SecretName', {
            value: this.database.secret?.secretName || '',
        });

        new cdk.CfnOutput(this, 'DatabaseEndpoint', {
            value: this.database.dbInstanceEndpointAddress,
        });
    }
}

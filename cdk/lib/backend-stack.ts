import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as autoscaling from 'aws-cdk-lib/aws-autoscaling';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as ecr_assets from 'aws-cdk-lib/aws-ecr-assets';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as path from 'path';

interface BackendStackProps extends cdk.StackProps {
    vpc: ec2.Vpc;
    dbSecurityGroup: ec2.SecurityGroup;
    webSecurityGroup: ec2.SecurityGroup; // Temporary prop to keep export alive
    secret: secretsmanager.ISecret;
    albListener: elbv2.ApplicationListener;
    sesSecret: secretsmanager.ISecret;  // SES SMTP credentials
    senderEmail: string;                 // Email address to send from
}

export class BackendStack extends cdk.Stack {
    public readonly asg: autoscaling.AutoScalingGroup;
    public readonly uploadsBucket: s3.Bucket;

    constructor(scope: Construct, id: string, props: BackendStackProps) {
        super(scope, id, props);

        // Keep reference to WebSG to prevent "Export in use" error during migration
        new cdk.CfnOutput(this, 'WebSgReference', {
            value: props.webSecurityGroup.securityGroupId,
            description: 'Temporary reference to keep WebSG export alive',
        });

        // ==================== S3 BUCKET FOR FILE UPLOADS ====================
        // 
        // Scalable file storage structure:
        //   profile-images/{orgId}/user_{userId}_{uuid}.{ext}
        //   documents/{orgId}/{category}/{userId}_{uuid}.{ext}
        //   project-files/{orgId}/project_{projectId}/{userId}_{uuid}.{ext}
        //
        // Benefits:
        //   - Organized by organization for easy management
        //   - Scalable (can add new file types easily)
        //   - Files never deleted (lifecycle moves to Infrequent Access after 90 days)
        //   - Clear structure for auditing and compliance
        //
        this.uploadsBucket = new s3.Bucket(this, 'UploadsBucket', {
            bucketName: `komorebi-uploads-${this.account}-${this.region}`,
            // Block all public access - files served through backend API or CloudFront
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            // Encryption at rest
            encryption: s3.BucketEncryption.S3_MANAGED,
            // Enable versioning for data protection
            versioned: false,
            // Auto-delete objects when bucket is deleted (for dev/test - remove for production)
            removalPolicy: cdk.RemovalPolicy.RETAIN,
            // CORS configuration for direct uploads (if needed in future)
            cors: [
                {
                    allowedMethods: [
                        s3.HttpMethods.GET,
                        s3.HttpMethods.PUT,
                        s3.HttpMethods.POST,
                    ],
                    allowedOrigins: ['https://d2y5qb737p8vzn.cloudfront.net', 'http://localhost:3000'],
                    allowedHeaders: ['*'],
                    maxAge: 3000,
                },
            ],
            // Lifecycle rules for cost optimization
            lifecycleRules: [
                {
                    // Move all files to Infrequent Access storage class after 90 days
                    // This reduces storage costs by ~50% while keeping files accessible
                    // Files are NEVER deleted (as per requirements)
                    transitions: [
                        {
                            storageClass: s3.StorageClass.INFREQUENT_ACCESS,
                            transitionAfter: cdk.Duration.days(90),
                        },
                    ],
                    // Clean up incomplete multipart uploads after 7 days (saves costs)
                    abortIncompleteMultipartUploadAfter: cdk.Duration.days(7),
                },
            ],
        });

        // Output the bucket name for reference
        new cdk.CfnOutput(this, 'UploadsBucketName', {
            value: this.uploadsBucket.bucketName,
            description: 'S3 bucket for file uploads',
            exportName: 'UploadsBucketName',
        });

        // IAM Role
        const role = new iam.Role(this, 'BackendInstanceRole', {
            assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
            managedPolicies: [
                iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'),
                iam.ManagedPolicy.fromAwsManagedPolicyName('SecretsManagerReadWrite'), // To read DB credentials
                iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonEC2ContainerRegistryReadOnly'), // To pull Docker image
            ],
        });

        // Grant S3 permissions for file uploads
        this.uploadsBucket.grantReadWrite(role);

        // Also grant delete permissions for removing old profile images
        this.uploadsBucket.grantDelete(role);

        // Grant SES send permissions to the backend
        role.addToPolicy(new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: [
                'ses:SendEmail',
                'ses:SendRawEmail',
            ],
            resources: ['*'],
        }));

        // Grant access to SES credentials secret
        props.sesSecret.grantRead(role);

        // Docker Image Asset
        // This will build the Dockerfile in the root directory and push it to ECR
        // Docker Image URI
        const imageUri = `288833449200.dkr.ecr.us-east-1.amazonaws.com/cdk-hnb659fds-container-assets-288833449200-us-east-1:v20251129-task-proxy-fix`;

        // Grant read access to the instance role
        // No longer needed as imageUri is hardcoded and not pulled from a repository object

        // AMI (Amazon Linux 2023)
        const ami = new ec2.AmazonLinuxImage({
            generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2023,
            cpuType: ec2.AmazonLinuxCpuType.X86_64,
        });

        // User Data
        const userData = ec2.UserData.forLinux();
        userData.addCommands(
            'yum update -y',
            'echo "Forcing replacement: $(date)"',
            `echo "Deployment timestamp: ${new Date().toISOString()} - FORCE DEPLOY 8"`,
            'yum install -y docker jq aws-cli', // Install Docker, jq, and aws-cli
            'service docker start',
            'usermod -a -G docker ec2-user',

            // Login to ECR
            `aws ecr get-login-password --region ${this.region} | docker login --username AWS --password-stdin ${imageUri.split('/')[0]}`,

            // Fetch Database Secret
            `SECRET_JSON=$(aws secretsmanager get-secret-value --secret-id ${props.secret.secretName} --query SecretString --output text --region ${this.region})`,
            'DB_HOST=$(echo $SECRET_JSON | jq -r .host)',
            'DB_PORT=$(echo $SECRET_JSON | jq -r .port)',
            'DB_USER=$(echo $SECRET_JSON | jq -r .username)',
            'DB_PASS=$(echo $SECRET_JSON | jq -r .password)',
            'DB_NAME=$(echo $SECRET_JSON | jq -r .dbname)',

            // Fetch SES SMTP Credentials
            `SES_SECRET_JSON=$(aws secretsmanager get-secret-value --secret-id ${props.sesSecret.secretName} --query SecretString --output text --region ${this.region})`,
            'SES_ACCESS_KEY=$(echo $SES_SECRET_JSON | jq -r .accessKeyId)',
            'export SES_SECRET_KEY=$(echo $SES_SECRET_JSON | jq -r .secretAccessKey)',
            'MAIL_HOST=$(echo $SES_SECRET_JSON | jq -r .smtpHost)',
            'MAIL_PORT=$(echo $SES_SECRET_JSON | jq -r .smtpPort)',
            `MAIL_FROM="${props.senderEmail}"`,

            // Convert AWS Secret Access Key to SMTP Password
            // AWS SES SMTP password derivation algorithm (official AWS method)
            // Reference: https://docs.aws.amazon.com/ses/latest/dg/smtp-credentials.html
            `MAIL_PASSWORD=$(python3 << 'PYEOF'
import hmac
import hashlib
import base64
import os
import sys

SMTP_REGIONS = [
    'us-east-2', 'us-east-1', 'us-west-2', 'ap-south-1',
    'ap-northeast-2', 'ap-southeast-1', 'ap-southeast-2', 'ap-northeast-1',
    'ca-central-1', 'eu-central-1', 'eu-west-1', 'eu-west-2', 'eu-west-3',
    'sa-east-1', 'us-gov-west-1', 'af-south-1', 'ap-east-1', 'me-south-1'
]

DATE = "11111111"
SERVICE = "ses"
MESSAGE = "SendRawEmail"
TERMINAL = "aws4_request"
VERSION = 0x04

def sign(key, msg):
    return hmac.new(key, msg.encode('utf-8'), hashlib.sha256).digest()

def calculate_key(secret_access_key, region):
    if region not in SMTP_REGIONS:
        raise ValueError(f'Region {region} is not supported')
    
    signature = sign(('AWS4' + secret_access_key).encode('utf-8'), DATE)
    signature = sign(signature, region)
    signature = sign(signature, SERVICE)
    signature = sign(signature, TERMINAL)
    signature = sign(signature, MESSAGE)
    
    signature_and_version = bytes([VERSION]) + signature
    return base64.b64encode(signature_and_version).decode('utf-8')

# Get the secret key from environment
secret_key = os.environ.get('SES_SECRET_KEY', '')
region = '${this.region}'

try:
    if not secret_key:
        print('ERROR: SES_SECRET_KEY is empty', file=sys.stderr)
        sys.exit(1)
    if not region:
        print('ERROR: Region is empty', file=sys.stderr)
        sys.exit(1)
    smtp_password = calculate_key(secret_key, region)
    if not smtp_password:
        print('ERROR: Failed to generate SMTP password', file=sys.stderr)
        sys.exit(1)
    print(smtp_password)
except Exception as e:
    print(f'ERROR generating SMTP password: {e}', file=sys.stderr)
    sys.exit(1)
PYEOF
)`,
            'if [ -z "$MAIL_PASSWORD" ]; then',
            '  echo "ERROR: Failed to generate SMTP password. Check logs above."',
            '  exit 1',
            'fi',
            'echo "SMTP password generated successfully (length: ${#MAIL_PASSWORD})"',
            'if [ -z "$MAIL_PASSWORD" ]; then',
            '  echo "ERROR: Failed to generate SMTP password. Check logs above."',
            '  exit 1',
            'fi',
            'echo "SMTP password generated successfully"',

            // Run Container with email and S3 configuration
            `docker run -d --restart always -p 8080:8080 \\
                -m 1536m \\
                -e JAVA_OPTS="-Xmx1024m -Xms512m" \\
                -e SPRING_PROFILES_ACTIVE=prod \\
                -e SPRING_DATASOURCE_URL="jdbc:mysql://\${DB_HOST}:\${DB_PORT}/\${DB_NAME}?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC" \\
                -e SPRING_DATASOURCE_USERNAME="\${DB_USER}" \\
                -e SPRING_DATASOURCE_PASSWORD="\${DB_PASS}" \\
                -e SERVER_PORT=8080 \\
                -e SPRING_JPA_HIBERNATE_DDL_AUTO=validate \\
                -e APP_CORS_ALLOWED_ORIGINS="https://d2y5qb737p8vzn.cloudfront.net" \\
                -e MAIL_HOST="\${MAIL_HOST}" \\
                -e MAIL_PORT="\${MAIL_PORT}" \\
                -e MAIL_USERNAME="\${SES_ACCESS_KEY}" \\
                -e MAIL_PASSWORD="\${MAIL_PASSWORD}" \\
                -e MAIL_FROM="\${MAIL_FROM}" \\
                -e APP_FRONTEND_URL="https://d2y5qb737p8vzn.cloudfront.net" \\
                -e APP_NAME="Komorebi" \\
                -e AWS_S3_BUCKET="${this.uploadsBucket.bucketName}" \\
                -e AWS_REGION="${this.region}" \\
                -e APP_STORAGE_TYPE="s3" \\
                ${imageUri}`
        );

        // Create Security Group for ASG (Internal to this stack to avoid cycles)
        const asgSg = new ec2.SecurityGroup(this, 'AsgSG', {
            vpc: props.vpc,
            description: 'Security Group for Backend ASG',
            allowAllOutbound: true,
        });
        asgSg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22), 'Allow SSH');

        // Auto Scaling Group
        this.asg = new autoscaling.AutoScalingGroup(this, 'BackendASG', {
            vpc: props.vpc,
            vpcSubnets: {
                subnetType: ec2.SubnetType.PUBLIC, // Using Public subnet to save NAT Gateway costs
            },
            instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.SMALL), // Upgraded to SMALL for Docker overhead
            machineImage: ami,
            securityGroup: asgSg,
            role: role,
            userData: userData,
            minCapacity: 1,
            maxCapacity: 2,
            desiredCapacity: 1,
            updatePolicy: autoscaling.UpdatePolicy.rollingUpdate({
                minInstancesInService: 0, // Allow downtime for faster deployment in this dev/test setup
                maxBatchSize: 1,
            }),
        });

        // Attach ASG to ALB Listener
        props.albListener.addTargets('BackendTargets', {
            port: 8080,
            targets: [this.asg],
            healthCheck: {
                path: '/actuator/health',
                interval: cdk.Duration.seconds(30),
                healthyThresholdCount: 2,
                unhealthyThresholdCount: 5,
            },
        });

        // Allow ASG to access Database
        new ec2.CfnSecurityGroupIngress(this, 'AllowAsgToDb', {
            groupId: props.dbSecurityGroup.securityGroupId,
            ipProtocol: 'tcp',
            fromPort: 3306,
            toPort: 3306,
            sourceSecurityGroupId: asgSg.securityGroupId,
            description: 'Allow MySQL from ASG',
        });
    }
}

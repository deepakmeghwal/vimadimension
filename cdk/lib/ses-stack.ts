import * as cdk from 'aws-cdk-lib';
import * as ses from 'aws-cdk-lib/aws-ses';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';

interface SesStackProps extends cdk.StackProps {
    senderEmail: string;  // e.g., "komorebiessentials@gmail.com"
}

export class SesStack extends cdk.Stack {
    public readonly smtpCredentialsSecret: secretsmanager.ISecret;
    public readonly senderEmail: string;
    public readonly smtpUser: iam.User;

    constructor(scope: Construct, id: string, props: SesStackProps) {
        super(scope, id, props);

        this.senderEmail = props.senderEmail;

        // ===========================================
        // 1. Create Email Identity (Verification)
        // ===========================================
        // Note: After deployment, check your email inbox and click the verification link!
        const emailIdentity = new ses.EmailIdentity(this, 'SenderEmailIdentity', {
            identity: ses.Identity.email(props.senderEmail),
        });

        // ===========================================
        // 2. Create IAM User for SMTP
        // ===========================================
        this.smtpUser = new iam.User(this, 'SesSmtpUser', {
            userName: 'ses-smtp-user-komorebi',
        });

        // Grant SES send permissions
        this.smtpUser.addToPolicy(new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: [
                'ses:SendEmail',
                'ses:SendRawEmail',
            ],
            resources: ['*'],
        }));

        // Create access key for SMTP credentials
        const accessKey = new iam.AccessKey(this, 'SmtpAccessKey', {
            user: this.smtpUser,
        });

        // ===========================================
        // 3. Store SMTP Credentials in Secrets Manager
        // ===========================================
        // Note: AWS SES SMTP password is derived from the secret access key
        // The actual SMTP password needs to be generated using a specific algorithm
        // We'll store the access key and derive the SMTP password at runtime
        this.smtpCredentialsSecret = new secretsmanager.Secret(this, 'SmtpCredentialsSecret', {
            secretName: 'komorebi/ses-smtp-credentials',
            description: 'SES SMTP credentials for sending emails',
            secretObjectValue: {
                accessKeyId: cdk.SecretValue.unsafePlainText(accessKey.accessKeyId),
                secretAccessKey: accessKey.secretAccessKey,
                smtpHost: cdk.SecretValue.unsafePlainText(`email-smtp.${this.region}.amazonaws.com`),
                smtpPort: cdk.SecretValue.unsafePlainText('587'),
                senderEmail: cdk.SecretValue.unsafePlainText(props.senderEmail),
                region: cdk.SecretValue.unsafePlainText(this.region),
            },
        });

        // ===========================================
        // 4. Outputs
        // ===========================================
        new cdk.CfnOutput(this, 'EmailIdentityArn', {
            value: emailIdentity.emailIdentityArn,
            description: 'SES Email Identity ARN',
        });

        new cdk.CfnOutput(this, 'SmtpHost', {
            value: `email-smtp.${this.region}.amazonaws.com`,
            description: 'SES SMTP Host',
        });

        new cdk.CfnOutput(this, 'SmtpCredentialsSecretArn', {
            value: this.smtpCredentialsSecret.secretArn,
            description: 'Secret ARN containing SMTP credentials',
        });

        new cdk.CfnOutput(this, 'SenderEmail', {
            value: props.senderEmail,
            description: 'Verified sender email address',
        });

        new cdk.CfnOutput(this, 'VerificationInstructions', {
            value: `Check ${props.senderEmail} inbox and click the AWS verification link!`,
            description: 'Next steps',
        });

        // Important reminder
        new cdk.CfnOutput(this, 'SandboxModeWarning', {
            value: 'New SES accounts are in SANDBOX mode. Request production access in AWS Console: SES → Account dashboard → Request production access',
            description: 'Important: Sandbox mode limitation',
        });
    }
}


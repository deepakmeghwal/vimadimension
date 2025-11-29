#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { NetworkStack } from '../lib/network-stack';
import { DatabaseStack } from '../lib/database-stack';
import { BackendStack } from '../lib/backend-stack';
import { FrontendStack } from '../lib/frontend-stack';
import { LoadBalancerStack } from '../lib/load-balancer-stack';
import { SesStack } from '../lib/ses-stack';

const app = new cdk.App();

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION
};

// SES Stack for email sending
const sesStack = new SesStack(app, 'SesStack', {
  env,
  senderEmail: 'komorebiessentials@gmail.com',
});

const networkStack = new NetworkStack(app, 'NetworkStack', { env });

const databaseStack = new DatabaseStack(app, 'DatabaseStack', {
  env,
  vpc: networkStack.vpc,
  securityGroup: networkStack.dbSg,
});

const lbStack = new LoadBalancerStack(app, 'LoadBalancerStack', {
  env,
  vpc: networkStack.vpc,
});

const backendStack = new BackendStack(app, 'BackendStack', {
  env,
  vpc: networkStack.vpc,
  dbSecurityGroup: networkStack.dbSg,
  webSecurityGroup: networkStack.webSg, // Temporary prop
  secret: databaseStack.database.secret!,
  albListener: lbStack.listener,
  sesSecret: sesStack.smtpCredentialsSecret,
  senderEmail: sesStack.senderEmail,
});

const frontendStack = new FrontendStack(app, 'FrontendStack', {
  env,
  backendDnsName: lbStack.albDnsName,
});

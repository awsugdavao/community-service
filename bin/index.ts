#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { PipelineStack } from '../lib/pipeline';
import { environments } from '../lib/pipeline/configs';

const app = new cdk.App();

new PipelineStack(app, 'CommunityService', {
  env: {
    region: environments.develop.env.region,
    account: environments.develop.env.account,
  }
})

app.synth()
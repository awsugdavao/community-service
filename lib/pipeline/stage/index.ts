import * as cdk from 'aws-cdk-lib';

import { Construct } from 'constructs';
import { EnvironmentConfig } from '../types';
import { StatefulStack } from '../../app/stateful/stateful-stack';
import { StatelessStack } from '../../app/stateless/stateless-stack';

export class PipelineStage extends cdk.Stage {
  public readonly apiEndpointUrl: cdk.CfnOutput;
  public readonly healthCheckUrl: cdk.CfnOutput;

  constructor(scope: Construct, id: string, props: EnvironmentConfig) {
    super(scope, id, props);

    const statefulStack = new StatefulStack(this, 'StatefulStack', {
      env: {
        account: props.env.account,
        region: props.env.region,
      },
    });

    const statelessStack = new StatelessStack(this, 'StatelessStack', {
      env: {
        account: props.env.account,
        region: props.env.region,
      },
      lambdaMemorySize: props.stateless.lambdaMemorySize,
      stageName: props.stageName,
    });

    this.apiEndpointUrl = statelessStack.apiEndpointUrl;
    this.healthCheckUrl = statelessStack.healthCheckUrl;
  }
}
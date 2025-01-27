import * as cdk from 'aws-cdk-lib';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';
import { RustFunction } from 'cargo-lambda-cdk';
import path = require('path');

interface StatelessStackProps extends cdk.StackProps {
  lambdaMemorySize: number;
  stageName: string;
}

export class StatelessStack extends cdk.Stack {
  public readonly apiEndpointUrl: cdk.CfnOutput;
  public readonly healthCheckUrl: cdk.CfnOutput;  
  private readonly api: apigw.RestApi;

  constructor(scope: Construct, id: string, props: StatelessStackProps) {
    super(scope, id, props)

    this.api = this.createApi(props)
    this.createLambdas(props)
    const { apiEndpointUrl, healthCheckUrl } = this.createOutputs(props)
    this.apiEndpointUrl = apiEndpointUrl
    this.healthCheckUrl = healthCheckUrl
  }

  private createApi(props: StatelessStackProps) {
    const api = new apigw.RestApi(this, 'Api', {
      description: 'Community Service API',
      deploy: true,
      endpointTypes: [apigw.EndpointType.REGIONAL],
      cloudWatchRole: true,
      deployOptions: {
        stageName: props.stageName,
      },
    })

    return api
  }

  private createLambdas(props: StatelessStackProps) {
    const healthCheck: apigw.Resource = this.api.root.addResource('health-check')

    const healthCheckLambda = new RustFunction(this, 'HealthCheckLambda', {
      manifestPath: "src/lambdas/health-check/Cargo.toml",
      memorySize: props.lambdaMemorySize,
    })

    healthCheck.addMethod('GET', new apigw.LambdaIntegration(healthCheckLambda))
  }

  private createOutputs(props: StatelessStackProps) {
    const apiEndpointUrl = new cdk.CfnOutput(this, 'ApiEndpointUrl', {
      value: this.api.url,
      exportName: `${props.stageName}-api-endpoint-url`,
    })

    const healthCheckUrl = new cdk.CfnOutput(this, 'HealthCheckUrl', {
      value: `${this.api.url}health-check`,
      exportName: `${props.stageName}-health-check-url`,
    })

    return {
      apiEndpointUrl,
      healthCheckUrl,
    }
  }
}

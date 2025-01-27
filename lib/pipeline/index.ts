import * as cdk from 'aws-cdk-lib';
import * as pipelines from 'aws-cdk-lib/pipelines';
import { Construct } from 'constructs';
import { PipelineStage } from './stage';
import { environments } from './configs';

export class PipelineStack extends cdk.Stack {
  private pipeline: pipelines.CodePipeline
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.pipeline = this.createPipeline()
    this.createFeatureDevPipeline()
    this.createMainPipeline()
  }

  private createPipeline() {
    const pipeline = new pipelines.CodePipeline(this, 'Pipeline', {
      crossAccountKeys: true,
      selfMutation: true,
      pipelineName: 'community-service-pipeline',
      synth: new pipelines.ShellStep('Synth', {
        input: pipelines.CodePipelineSource.gitHub(
          'awsugdavao/community-service', 
          'main',
          {
            authentication: cdk.SecretValue.secretsManager('github-token')
          }
        ),
        primaryOutputDirectory: 'cdk.out',
        commands: ['npm ci', 'npx cdk synth', 'npm run test'],
      }),
    })  

    return pipeline
  }

  private createFeatureDevPipeline() {
    new PipelineStage(this, 'FeatureDevPipeline', {
      ...environments.featureDev
    })
  }

  private createMainPipeline() {
    const developStage = new PipelineStage(this, 'DevelopPipeline', {
      ...environments.develop
    })

    this.pipeline.addStage(developStage, {
      post: [
        new pipelines.ShellStep('HealthCheck', {
          envFromCfnOutputs: {
            HEALTH_CHECK_URL: developStage.healthCheckUrl
          },
          commands: ['curl -f ${HEALTH_CHECK_URL}']
        })
      ]
    })

    const stagingStage = new PipelineStage(this, 'StagingPipeline', {
      ...environments.staging
    })

    this.pipeline.addStage(stagingStage, {
      pre: [
        new pipelines.ManualApprovalStep('ManualApproval')
      ],
      post: [
        new pipelines.ShellStep('HealthCheck', {
          envFromCfnOutputs: {
            HEALTH_CHECK_URL: stagingStage.healthCheckUrl
          },
          commands: ['curl -f ${HEALTH_CHECK_URL}']
        })
      ]
    })

    const prodStage = new PipelineStage(this, 'ProdPipeline', {
      ...environments.prod
    })

    this.pipeline.addStage(prodStage, {
      pre: [
        new pipelines.ManualApprovalStep('ManualApproval')
      ],
      post: [
        new pipelines.ShellStep('HealthCheck', {
          envFromCfnOutputs: {
            HEALTH_CHECK_URL: prodStage.healthCheckUrl
          },
          commands: ['curl -f ${HEALTH_CHECK_URL}']
        })
      ]
    })
  }
} 
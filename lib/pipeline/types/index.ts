export interface EnvironmentConfig {
  env: {
    account: string;
    region: string;
  };
  stageName: string;
  stateful: {
  };
  stateless: {
    lambdaMemorySize: number;
  };
}

export const enum Region {
  singapore = 'ap-southeast-1',
}

export const enum Stage {
  featureDev = 'featureDev',
  staging = 'staging',
  prod = 'prod',
  develop = 'develop',
}

export const enum Account {
  develop = '442867850698',
  staging = '442867850698',
  prod = '442867850698',
}
import * as dotenv from 'dotenv';

import {
  Account,
  EnvironmentConfig,
  Region,
  Stage,
} from '../types';

dotenv.config();

export const environments: Record<Stage, EnvironmentConfig> = {
  [Stage.develop]: {
    env: {
      account:
        process.env.ACCOUNT || (process.env.CDK_DEFAULT_ACCOUNT as string),
      region: process.env.REGION || (process.env.CDK_DEFAULT_REGION as string),
    },
    stateful: {
    },
    stateless: {
      lambdaMemorySize: parseInt(process.env.LAMBDA_MEM_SIZE || '128'),
    },
    stageName: process.env.DEVELOPER_NAME || Stage.develop,
  },

  [Stage.featureDev]: {
    env: {
      account: Account.develop,
      region: Region.singapore,
    },
    stateful: {
    },
    stateless: {
      lambdaMemorySize: 128,
    },
    stageName: Stage.featureDev,
  },

  [Stage.staging]: {
    env: {
      account: Account.staging,
      region: Region.singapore,
    },
    stateful: {
    },
    stateless: {
      lambdaMemorySize: 128,
    },
    stageName: Stage.staging,
  },

  [Stage.prod]: {
    env: {
      account: Account.prod,
      region: Region.singapore,
    },
    stateful: {
    },
    stateless: {
      lambdaMemorySize: 128,
    },
    stageName: Stage.prod,
  },
};

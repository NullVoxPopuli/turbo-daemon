import { TURBO_TOKEN, turboLogsPath } from '../shared.js';

const S3_STORAGE_CONFIG = {
  STORAGE_PROVIDER: 's3',
  STORAGE_PATH: '< not specified >',
  AWS_REGION: '< not specified >',
  // Folks should use ~/.aws/credentials
  //  as the AWS tooling knows to look at that file,
  //  and then we don't need to worry about shell-specific things w/r/t env variables
};

Object.assign(process.env, {
  S3_STORAGE_CONFIG,
  // turbo server
  // LOG_MODE: 'stdout', // stdout gets sent to daemon.log
  LOG_MODE: 'file',
  LOG_LEVEL: 'trace',
  LOG_FILE: turboLogsPath,
  TURBO_TOKEN,
});

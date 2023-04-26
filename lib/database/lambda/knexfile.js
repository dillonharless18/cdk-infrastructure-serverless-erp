// knexfile.js

const { RDS_DB_PASS_SECRET_ID, RDS_DB_NAME, RDS_DB_SCHEMA } = process.env;
const { SecretsManager } = require('aws-sdk');
const secretsManagerClient = new SecretsManager();

async function getConnection() {
  const dbSecret = JSON.parse(await getSecretValue(RDS_DB_PASS_SECRET_ID) || '');
  const config = {
    host: dbSecret.host,
    port: dbSecret.port,
    user: dbSecret.username,
    password: dbSecret.password,
    database: RDS_DB_NAME,
    idleTimeoutMillis: 12000,
    connectionTimeoutMillis: 180000,
  };
  return config;
}

async function getSecretValue(secretId) {
  const data = await secretsManagerClient.getSecretValue({ SecretId: secretId }).promise();
  if ('SecretString' in data) {
    return data.SecretString;
  } else {
    const buff = Buffer.from(data.SecretBinary, 'base64');
    return buff.toString('ascii');
  }
}

const connectionPromise = getConnection();

module.exports = async () => ({
  client: 'pg',
  connection: await connectionPromise,
  migrations: {
    directory: './migrations',
    schemaName: RDS_DB_SCHEMA,
  },
});

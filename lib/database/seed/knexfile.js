// knexfile.js
import { SecretsManager } from "@aws-sdk/client-secrets-manager";

const secretsManagerClient = new SecretsManager();

const RDS_DB_PASS_SECRET_ID = process.env.RDS_DB_PASS_SECRET_ID;
const RDS_DB_NAME = process.env.RDS_DB_NAME;
const RDS_DB_SCHEMA = process.env.RDS_DB_SCHEMA || "";

async function getConnection() {
  const dbSecret = JSON.parse(
    (await getSecretValue(RDS_DB_PASS_SECRET_ID)) || ""
  );
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
  const data = await secretsManagerClient.getSecretValue({
    SecretId: secretId,
  });
  if ("SecretString" in data) {
    return data.SecretString;
  } else {
    const buff = Buffer.from(data.SecretBinary, "base64");
    return buff.toString("ascii");
  }
}

const connectionPromise = getConnection();

export default async () => ({
  client: "pg",
  connection: await connectionPromise,
});

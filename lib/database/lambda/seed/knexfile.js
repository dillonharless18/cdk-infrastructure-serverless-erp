import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

const getSecrets = async () => {
  const secretsManager = new SecretsManagerClient({
    region: "us-east-1",
  });

  const secretId =
    "arn:aws:secretsmanager:us-east-1:136559125535:secret:database-credentials-YTyK5c";

  try {
    const response = await secretsManager.send(
      new GetSecretValueCommand({ SecretId: secretId })
    );
    const secrets = JSON.parse(response.SecretString);

    return {
      client: "pg",
      connection: {
        host: secrets.host,
        user: secrets.username,
        password: secrets.password,
        database: secrets.dbname,
        port: secrets.port,
      },
    };
  } catch (error) {
    console.error("Error fetching secrets:", error);
    throw error;
  }
};

export default async () => {
  const config = await getSecrets();
  return config;
};

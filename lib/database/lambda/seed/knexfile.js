const AWS = require("aws-sdk");

const getSecrets = async () => {
  const secretsManager = new AWS.SecretsManager({
    region: "us-east-1",
  });

  const secretId =
    "arn:aws:secretsmanager:us-east-1:136559125535:secret:database-credentials-GeMfwW";

  try {
    const response = await secretsManager
      .getSecretValue({ SecretId: secretId })
      .promise();
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

module.exports = async () => {
  const config = await getSecrets();
  return config;
};

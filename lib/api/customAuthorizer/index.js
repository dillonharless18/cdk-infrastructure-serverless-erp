const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken');
const s3 = new AWS.S3();

async function getMetadataObject(key) {
  const params = {
    Bucket: 'your-metadata-bucket-name',
    Key: key,
  };
  try {
    const data = await s3.getObject(params).promise();
    return JSON.parse(data.Body.toString());
  } catch (error) {
    console.error('Error getting metadata:', error);
    return null;
  }
}

exports.handler = async (event) => {
  const token = event.authorizationToken.split(' ')[1];
  const decodedToken = jwt.decode(token, { complete: true });
  const { payload } = decodedToken;
  const userGroup = payload['cognito:groups'] && payload['cognito:groups'][0];

  // Get the metadata key based on the requested resource (e.g., /endpoint-1)
  const metadataKey = event.methodArn.split('/').slice(-1)[0] + '.json';

  // Fetch the metadata object from S3
  const metadata = await getMetadataObject(metadataKey);

  if (!metadata) {
    console.error('Metadata not found for:', metadataKey);
    return generatePolicy('user', 'Deny', event.methodArn);
  }

  // Check if the user's group is allowed to access the requested resource
  const allowedGroups = metadata.roles;
  if (allowedGroups && allowedGroups.includes(userGroup)) {
    return generatePolicy('user', 'Allow', event.methodArn);
  } else {
    return generatePolicy('user', 'Deny', event.methodArn);
  }
};

function generatePolicy(principalId, effect, resource) {
  return {
    principalId: principalId,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: effect,
          Resource: resource,
        },
      ],
    },
  };
}

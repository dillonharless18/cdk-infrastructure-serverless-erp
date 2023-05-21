// Inspired by this: https://dev.to/aws-builders/using-cognito-groups-to-control-access-to-api-endpoints-346g 

import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { CognitoJwtVerifier } from 'aws-jwt-verify';

const s3 = new S3Client({ region: process.env.AWS_REGION }); // make sure the region is set correctly
let groupsToPathsMap;

const getGroupsToPathsMap = async () => {
  if (!groupsToPathsMap) {
    // Fetch the authorization config from S3 if we haven't fetched it yet
    const command = new GetObjectCommand({
      Bucket: process.env.CONFIG_BUCKET_NAME, // Pass the bucket name through environment variables
      Key: 'authorizationConfig/authorizationConfig.json',
    });

    const response = await s3.send(command);
    const configData = await new Promise((resolve, reject) => {
      let data = '';
      response.Body.on('data', (chunk) => (data += chunk));
      response.Body.on('end', () => resolve(data));
      response.Body.on('error', reject);
    });

    groupsToPathsMap = JSON.parse(configData);
  }

  return groupsToPathsMap;
};

export const handler = async function(event, context) {
  // get the requested path from the API Gateway event
  const requestPath = event.requestContext.path;
  const requestMethod = event.requestContext.httpMethod;

  const groupsToPathsMap = await getGroupsToPathsMap();
  console.log(`groupsToPathsMap: ${JSON.stringify(groupsToPathsMap, null, 2)}`)
  const existingPaths = groupsToPathsMap.map((config) => `${config.method}-${config.path}`);
  if (!existingPaths.includes(`${requestMethod}-${requestPath}`)) {
    console.log('Invalid path or method');
    return {
      isAuthorized: false,
    };
  }

  const authHeader = event.headers.authorization;
  if (!authHeader) {
    console.log('No auth header');
    return {
      isAuthorized: false,
    };
  }

  // header has a 'Bearer TOKEN' format
  const token = authHeader.split(' ')[1];

  // Verify the token
  const verifier = CognitoJwtVerifier.create({
    userPoolId: process.env.USER_POOL_ID,
    tokenUse: 'access', // or 'id' for ID tokens
    clientId: process.env.APP_CLIENT_ID,
  });

  let payload;
  try {
    payload = await verifier.verify(token);
    console.log('Token is valid. Payload:', payload);
  } catch {
    console.log('Token not valid!');
    return {
      isAuthorized: false,
    };
  }

  // header has a 'Bearer TOKEN' format
  const matchingPathConfig = groupsToPathsMap.find(
    (config) => `${requestMethod}-${requestPath}` === `${config.method}-${config.path}`
  );
  const userGroups = payload['cognito:groups'];
  if (
    matchingPathConfig &&
    userGroups &&
    userGroups.some((group) => matchingPathConfig.allowedGroups.includes(group))
  ) {
    console.log(`Authorized!`);
    console.log(`User Groups: ${JSON.stringify(userGroups, null, 2)}`);
    console.log(`requestPath: ${requestPath}`);
    console.log(`requestMethod: ${requestMethod}`);
    return {
      isAuthorized: true,
    };
  }

  return {
    isAuthorized: false,
  };
};

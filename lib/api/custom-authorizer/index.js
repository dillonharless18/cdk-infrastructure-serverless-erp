// Inspired by this: https://dev.to/aws-builders/using-cognito-groups-to-control-access-to-api-endpoints-346g 

import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { CognitoJwtVerifier } from 'aws-jwt-verify';

const s3 = new S3Client({ region: process.env.AWS_REGION });

// Defining this here will store the value between container re-uses
let pathConfigList;
const getPathConfigList = async () => {
  
  // If the container is re-used we can skip the S3 call
  if (!pathConfigList) { 

    const command = new GetObjectCommand({
      Bucket: process.env.CONFIG_BUCKET_NAME,
      Key: 'authorizationConfig/authorizationConfig.json',
    });

    const response = await s3.send(command);
    const configData = await new Promise((resolve, reject) => {
      let data = '';
      response.Body.on('data', (chunk) => (data += chunk));
      response.Body.on('end', () => resolve(data));
      response.Body.on('error', reject);
    });

    pathConfigList = JSON.parse(configData);
  }

  return pathConfigList;
};


export const handler = async function(event, context) {

  console.log(`event: ${JSON.stringify(event, null, 2)}`)
  // get the requested path from the API Gateway event
  const requestPath = event.resource;
  const requestMethod = event.httpMethod;

  const earlyReturnObject = {
      principalId: null,
      policyDocument: {
          Version: "2012-10-17",
          Statement: [
              {
                  Action: "execute-api:Invoke",
                  Effect: "Deny",
                  Resource: event.methodArn // Use the ARN from the incoming event
              }
          ]
      },
  };

  const pathConfigList = await getPathConfigList();
  
  // Extract the object for this path-to-group mapping if it exists - Will be undefined if not
  const pathConfig = pathConfigList.find(pathcfg => pathcfg.apiPath === requestPath && pathcfg.httpMethod === requestMethod);

  if (!pathConfig) {
    console.log(`Invalid path or method: ${JSON.stringify(pathConfig, null, 2)}`);
    return {...earlyReturnObject}
  }

  const authHeader = event.headers.Authorization ? event.headers.Authorization : event.headers.authorization;
  if (!authHeader) {
    console.log('No auth header');
    return {...earlyReturnObject}
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
    return {...earlyReturnObject}
  }

  // header has a 'Bearer TOKEN' format
  let isAuthorized = false
  const userGroups = payload['cognito:groups'];
  console.log(`User Groups: ${JSON.stringify(userGroups, null, 2)}`);

  if (
    userGroups &&
    userGroups.some((group) => pathConfig.allowedGroups.includes(group))
  ) {
    console.log(`Authorized!`);    
    isAuthorized = true;
  } 
  else if (!userGroups) {
    console.log(`The user has no groups assigned!`)
  } 
  else {
      console.log('Not authorized!')
  }

  const returnObject = {
    principalId: payload.sub, // Use the subject from the JWT payload as principalId
    policyDocument: {
        Version: "2012-10-17",
        Statement: [
            {
                Action: "execute-api:Invoke",
                Effect: isAuthorized ? "Allow" : "Deny",
                Resource: event.methodArn // Use the ARN from the incoming event
            }
        ]
    },
    context: { // Add values here and access them in Lambda through event.requestContext.authorizer
      sub: payload.sub
    }
  };

  console.log(`Return Object: ${JSON.stringify(returnObject, null, 2)}`)

  return {...returnObject}
};

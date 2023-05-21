// Inspired by this page: https://dev.to/aws-builders/using-cognito-groups-to-control-access-to-api-endpoints-346g

const { CognitoJwtVerifier } = require('aws-jwt-verify');

export const handler = async function(event) {
  // get the requested path from the API Gateway event
  const requestPath = event.requestContext.path
  const requestMethod = event.requestContext.httpMethod
  const existingPaths = mapGroupsToPaths.map((config) => `${config.method}-${config.path}`)
  if (!existingPaths.includes(`${requestMethod}-${requestPath}`)) {
    console.log('Invalid path or method')
    return {
      isAuthorized: false
    }
  }

  const authHeader = event.headers.authorization
  if (!authHeader) {
    console.log('No auth header')
    return {
      isAuthorized: false
    }
  }

  // header has a 'Bearer TOKEN' format
  const token = authHeader.split(' ')[1]

  // Verify the token
  const verifier = CognitoJwtVerifier.create({
    userPoolId: process.env.USER_POOL_ID,
    tokenUse: 'access', // or 'id' for ID tokens
    clientId: process.env.APP_CLIENT_ID,
  });

  let payload
  try {
    payload = await verifier.verify(token);
    console.log('Token is valid. Payload:', payload);
  } catch {
    console.log('Token not valid!');
    return {
      isAuthorized: false
    }
  }

  // header has a 'Bearer TOKEN' format
  const matchingPathConfig = mapGroupsToPaths.find(
    (config) => `${requestMethod}-${requestPath}` === `${config.method}-${config.path}`
  )
  const userGroups = payload['cognito:groups']
  if (userGroups.includes(matchingPathConfig.group)) {
    console.log(`Authorized!`)
    console.log(`User Groups: ${JSON.stringify(userGroups, null, 2)}`)
    console.log(`requestPath: ${ requestPath }`)
    console.log(`requestMethod: ${requestMethod}`)
    return {
      isAuthorized: true
    }
  }

  return {
    isAuthorized: false
  }
}
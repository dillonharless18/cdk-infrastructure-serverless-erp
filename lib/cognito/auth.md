# Authorization for oneXerp (these notes will change depending on the application this cdk code is used for)

## Supplemental video

## OAuth 2.0

We are using *authorization code with PKCE* grant. With this flow, when users *authenticate*, they get only an authorization code.
This code is then used to request the id, access, and refresh tokens. This is considered secure. To get the tokens, you
make a request to Cognito's token endpoint. That request must include the authorization code.

### The PKCE part is important since this is an SPA. This is the general flow

1. Create a Code Verifier: First, create a cryptographically random string called the code verifier. This should be a base64url-encoded string of a random sequence of ASCII characters.

2. Create a Code Challenge: Create a code challenge derived from the code verifier. To do this, hash the code verifier using SHA-256, then base64url-encode the result.

3. Send the Authorization Request: When you make the authorization request to Cognito's /oauth2/authorize endpoint, include the code challenge and the method you used to transform the code verifier to the code challenge (S256) in the request parameters.

4. Exchange the Code: After the user logs in and consents, Cognito will redirect back to your application with an authorization code. Make a POST request to the /oauth2/token endpoint to exchange this code for tokens. Include the code verifier you generated earlier in the request.

5. Receive the Tokens: Cognito will check the code verifier against the code challenge it received earlier. If they match, Cognito will return the tokens to your application.

## URLs

Development Login: `GET https://dev-onexerp.auth.us-east-1.amazoncognito.com/oauth2/authorize?response_type=code&client_id=1t65ujrotp1esefli5l9fnko8t&state=STATE&redirect_uri=https://dev.onexerp.com&code_challenge_method=S256&code_challenge=<code_challenge>`

Ensure you replace `<code_challenge>` with the actual code challenge that you've generated as per the PKCE protocol.

The state parameter is used to maintain state between the request and the callback. This is typically used to prevent Cross-Site Request Forgery (CSRF) attacks. You should generate a unique value for each authorization request and verify it when Cognito redirects the user back to your application. In the example, I've used STATE as a placeholder. You should replace this with your actual state value.

Remember, in order to use the PKCE protocol, you'll need to generate the code verifier and code challenge on your own, as these are not provided by Cognito. There are libraries available in many languages that can help you generate these values.

Development Token endpoint: `https://dev-onexerp.auth.us-east-1.amazoncognito.com.auth.us-east-1.amazoncognito.com/oauth2/token`

Users will log in at the hosted UI by navigating to the *development login url*. This will give the application an *authorization code* and will redirect to the main page of the application.

You should then send a POST request to the *token endpoint* to exchange the *authorization code* for the access, id, and refresh *tokens*.

The POST request would look something like this in bash:

```bash
curl -X POST \
  https://dev-onexerp.auth.us-east-1.amazoncognito.com/oauth2/token \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'grant_type=authorization_code&client_id=1t65ujrotp1esefli5l9fnko8t&code=<auth-code>&redirect_uri=https://dev.onexerp.com&code_verifier=<code_verifier>'
```

where the client_id has been replaced with the actual client id of oneXerp's development app client (as of 7.3.2023). The `<auth-code>`
just needs to be replaced with the actual auth code recevied from logging in.

*TODO* Add URLs for production.

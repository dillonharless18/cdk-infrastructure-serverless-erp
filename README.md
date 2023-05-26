# OneXerp Infrastructure Repository

This repository contains the AWS CDK code for creating and managing the infrastructure of OneXerp. It includes the resources required for the API Gateway, Lambda functions, and other related resources.

## Getting Started

### Prerequisites

1. [Node.js](https://nodejs.org/) (v18.x or later)
2. [AWS CLI](https://aws.amazon.com/cli/)
3. [AWS CDK](https://aws.amazon.com/cdk/)

### Installation

1. Clone the repository

```bash
git clone https://github.com/dillonCF/oneXerp-Infrastructure.git
```

2. Change into the repository directory

```bash
cd one-xerp-infrastructure
```

3. Install the required dependencies

```bash
npm install
```

## Deployment

To deploy the infrastructure using AWS CDK, run the following command:

```bash
TODO. There are a few things that need to be checked before deploying. Details to come on this piece. Eventually though, once that piece is done, you can simply run cdk deploy. From that point forward the pipelines will take care of any changes in the repositories.
```

## Structure

The repository is organized as follows:

```md
.
├── bin/
│   └── onexerp-infrastructure.ts
├── lib/
│   ├── api/
|   |   ├── custom-authorizer/
|   |   |   ├── package.json
|   |   |   ├── package-lock.json
|   |   |   └── index.js
│   │   └── api-stack.ts
│   ├── database/
│   │   └── database-stack.ts
│   ├── iam/
│   │   ├── iam-stack.ts (Not currently in use)
│   │   └── roles/
│   │       ├── admin.json
│   │       ├── basic_user.json
│   │       ├── logistics.json
│   │       ├── project_manager.json
│   │       └── driver.json
│   ├── cognito/
│   │   └── cognito-stack.ts
|   ├── lambda-layers/
|   |   ├── authorizer-layer/
|   |   └── database-layer/
│   └── pipeline/
│       └── pipeline-stack.ts
├── package.json
├── README.md
└── tsconfig.json
```

Description of folder contents:

- `bin/`: Contains the entry point file for the CDK app
- `lib/`: Contains the CDK constructs and stacks used to define the infrastructure
  - `api/`: Contains the `ApiStack` which creates the API Gateway and associated resources. This stack will reach out to the oneXerp-Lambdas repository to dynamically create the API endpoints. *More details below.*
  - `database/`: Contains the `DatabaseStack` for creating and managing the database resources
  - `iam/`: Contains the `IamStack` for creating and managing IAM resources
    - `roles/`: Contains JSON files for each role of OneXerp (e.g., admin, basic_user, logistics, project_manager, driver)
  - `cognito/`: Contains the `CognitoStack` for creating and managing Cognito resources
  - `pipeline/`: Contains the `PipelineStack` for creating and managing the CI/CD pipeline

## API Creation

This respository watches the oneXerp-Lambdas repository to dynamically create the API endpoints. It expects the following structure (example names used here):

```md
.
├── endpoints/
│   ├── getAllUsers/
│   │   ├── metadata.json
│   │   └── index.js
│   └── getPoLineItemComments/
│       ├── metadata.json
│       └── index.js
├── someOtherFolder/
│   └── someFile.js
└── anotherFile.js
```

It uses the `metadata.json` file within each Lambda file to automatically create the API. See the `test_lambdas` folder for an example. These `test_lambdas` are used for unit testing the CDK. The API is created in API Gateway. Everything is automated from the API Gateway Resources, to stage deployment, to custom authorization. The pipeline aggregates which groups should be allowed to execute which API endpoints based on the metadata files found in the lambda folders and stores that config in S3, updating it each time it runs. The custom authorizer pulls it down for each invocation and checks whether it should allow the invocation or not.

### Breakdown of `metadata.json` file

Here are two examples of a `metadata.json` file:

```json
{
  "apiPath": "purchase-order-request-items/{purchase-order-request-item-id}/comments",
  "httpMethod": "GET",
  "name": "getPurchaseOrderRequestItemComments",
  "allowedGroups": ["admin", "basic_user", "logistics", "project_manager", "driver"],
  "requestParameters": {
    "after": false
  }
}
```

`apiPath`: *Required.* String: This is used to create all the necessary nested resources in API Gateway. If a path doesn't exist, it will be created. To enable a path parameter, simply enclose it in `{}` as in the example above.

`httpMethod`: *Required.* String: The method associated with the api endpoint.

`name`: *Required.* String: This is the name the Lambda function will assume. Must match the folder name, and if it doesn't, the pipeline will fail. NOTE: We may enable automatic parsing of the folder name to give the Lambda function its name, though that's currently not supported.

`allowedGroups`: *Defaults to ["admin", "basic_user", "logistics", "project_manager", "driver"] (all roles)* Array of strings: Will be used to restrict the API endpoint to various roles within the application's ecosystem. The authorization doesn't assume that permissions are purely heirachical, and therefore requires a group to be explicitly stated for the API to allow user in that group to access it. This means that even if every group should be able to access an endpoint, you must specify each group. For example, just putting `basic-user` in the `allowedGroups` is not enough to allow an `admin` to execute the endpoint.

`requestParameters`: *Defaults to undefined* Object with keys representing the various queryStringParameters that an endpoint should support and values representing whether a queryStringParameter is required to execute the endpoint or not. NOTE: We may change the name of this object to queryStringParameters as currently that is all it supports; path paramters are handled by `apiPath`, and currently header parameters are not in use.

## Adding API Endpoints

To add a new API endpoint, follow these steps:

1. Create a new directory inside the `endpoints/` folder in the oneXerp-Lambdas repository.
2. Inside the new directory, create a `metadata.json` file with the following properties:
   - `apiPath`: The API path for the function (e.g., `purchase-orders/{purchaseOrderId}/line-items/{lineItemId}/comments`)
   - `httpMethod`: The HTTP method for the function (e.g., `GET`)
   - `name`: The name of the function (e.g., `getPoLineItemComments`)
   - `allowedGroups`: The oneXerp roles that will be allowed to access the API Endpoint. Options are: [basic_user, driver, logistics, project_manager, admin]
   - `requestParameters`: The queryStringParameters that an endpoints should support. An object with keys representing queryStringParams and `boolean` values representing if they are required to execute the endpoint.
3. Create the Lambda function's code file (e.g., `index.js`) inside the new directory
      *NOTE*: Dependencies are handled by Lambda Layers in the infrastructure repository. Please keep all large dependencies in `devDependencies` in `package.json` to avoid large bundles. See the Infrastructure Repository for the list of Lambda Layers available.
      *NOTE*: The Lambdas are created in NODE_JS_18 Execution Environment. Please ensure you account for this and use the AWS SDK V3. The imports have changed from V2 and it is the only version of the AWS SDK available by default for NODE_JS_18.
4. The `ApiStack` will automatically create the Lambda function, integration, and API Gateway resource based on the `metadata.json` file. It will associate it with the proper Cognito User Pools according to the allowedGroups property in the metadata.json file.

## Testing

To run the tests, execute the following command:

```bash
npm test
```

This will run the Jest tests found in the `test/` directory.

# OneXerp Infrastructure Repository

This repository contains the AWS CDK code for creating and managing the infrastructure of OneXerp. It includes the resources required for the API Gateway, Lambda functions, and other related resources.

## Getting Started

### Prerequisites

1. [Node.js](https://nodejs.org/) (v14.x or later)
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

- `bin/`: Contains the entry point file for the CDK app
- `lib/`: Contains the CDK constructs and stacks used to define the infrastructure
  - `api/`: Contains the `ApiStack` which creates the API Gateway and associated resources
  - `database/`: Contains the `DatabaseStack` for creating and managing the database resources
  - `iam/`: Contains the `IamStack` for creating and managing IAM resources
    - `roles/`: Contains JSON files for each role of OneXerp (e.g., admin, basic_user, logistics, project_manager, driver)
  - `cognito/`: Contains the `CognitoStack` for creating and managing Cognito resources
  - `pipeline/`: Contains the `PipelineStack` for creating and managing the CI/CD pipeline
- `lambdas/`: Contains the Lambda functions used in the project
  - Each Lambda function has its own directory with a `metadata.json` file describing the function's configuration

  .
+-- bin/
|   +-- onexerp-infrastructure.ts
+-- lib/
|   +-- api/
|   |   +-- api-stack.ts
|   +-- database/
|   |   +-- database-stack.ts
|   +-- iam/
|   |   +-- iam-stack.ts
|   |   +-- roles/
|   |       +-- admin.json
|   |       +-- basic_user.json
|   |       +-- logistics.json
|   |       +-- project_manager.json
|   |       +-- driver.json
|   +-- cognito/
|   |   +-- cognito-stack.ts
|   +-- pipeline/
|       +-- pipeline-stack.ts
+-- lambdas/
|   +-- <function_name>/
|       +-- index.ts
|       +-- metadata.json
+-- package.json
+-- README.md
+-- tsconfig.json

## Adding New Lambda Functions

To add a new Lambda function, follow these steps:

1. Create a new directory under `lambdas/` for the new function
2. Inside the new directory, create a `metadata.json` file with the following properties:
   - `apiPath`: The API path for the function (e.g., `purchase-orders/{purchaseOrderId}/line-items/{lineItemId}/comments`)
   - `httpMethod`: The HTTP method for the function (e.g., `GET`)
   - `name`: The name of the function (e.g., `getPoLineItemComments`)
   - `runtime`: The runtime for the function (e.g., `NODE_JS_18_X`)
3. Create the Lambda function's code file (e.g., `index.js`) inside the new directory
4. The `ApiStack` will automatically create the Lambda function, integration, and API Gateway resource based on the `metadata.json` file

## Testing

To run the tests, execute the following command:

```bash
npm test
```

This will run the Jest tests found in the `test/` directory.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more information.
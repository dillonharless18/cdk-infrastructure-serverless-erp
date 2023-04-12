# OneXerp Infrastructure Repository

This repository contains the AWS CDK code for creating and managing the infrastructure of OneXerp. It includes the resources required for the API Gateway, Lambda functions, and other relateresources.

## Getting Started

### Prerequisites

1. [Node.js](https://nodejs.org/) (v14.x or later)
2. [AWS CLI](https://aws.amazon.com/cli/)
3. [AWS CDK](https://aws.amazon.com/cdk/)

### Installation

1. Clone the repository

```bash
git clone https://github.com/your-repo/one-xerp-infrastructure.git
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
cdk deploy
```

This command will create or update the CloudFormation stack with the resources defined in the CDK app.

## Structure

The repository is organized as follows:

- `bin/`: Contains the entry point file for the CDK app
- `lib/`: Contains the CDK constructs and stacks used to define the infrastructure
  - `api/`: Contains the `ApiStack` which creates the API Gateway and associated resources
- `lambdas/`: Contains the Lambda functions used in the project
  - Each Lambda function has its own directory with a `metadata.json` file describing the function's configuration

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
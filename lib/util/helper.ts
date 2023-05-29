import { region_info } from "aws-cdk-lib";

/**
 * Create a resource with the following convention:
 * stage-domain-resourceName
 * 
 * Ex: dev-us-east-1-example-lambda-name
 * 
 * @param domain the AWS domain
 * @param stage  the AWS stage
 * @param resourceName the resource name
 */
export function createResourceWithHyphenatedName(region: String, stage: String, resourceName: String) {
    return `${resourceName}-${stage}-${region}`;
}
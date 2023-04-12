// import { App } from 'aws-cdk-lib';
// import { Template } from 'aws-cdk-lib/assertions';
// import { IamStack } from '../lib/iam-stack';

// test('IamStack creates IAM roles with expected policies', () => {
//   // GIVEN
//   const app = new App();

//   // WHEN
//   const stack = new IamStack(app, 'TestIamStack');
//   const template = Template.fromStack(stack);

//   // THEN
//   // Check if each role exists
//   const expectedRoles = ['TestRole1', 'TestRole2', 'TestRole3'];
//   expectedRoles.forEach(roleName => {
//     template.resourceCountIs('AWS::IAM::Role', 1, { 'RoleName': roleName });
//   });

//   // Check if each role has the expected policies attached
//   const expectedPolicies = {
//     'TestRole1': ['arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess'],
//     'TestRole2': ['arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess', 'arn:aws:iam::aws:policy/AWSLambdaReadOnlyAccess'],
//     'TestRole3': ['arn:aws:iam::aws:policy/AmazonS3FullAccess', 'arn:aws:iam::aws:policy/AWSLambdaFullAccess']
//   };
//   Object.entries(expectedPolicies).forEach(([roleName, policyArns]) => {
//     const policies = template.getResourcesLike('AWS::IAM::Policy', { 'Roles': [ { 'Ref': roleName } ] });
//     expect(policies).toHaveLength(policyArns.length);
//     policyArns.forEach(arn => {
//       expect(policies).toContainEqual(expect.objectContaining({
//         'Properties': expect.objectContaining({
//           'PolicyDocument': expect.objectContaining({
//             'Statement': expect.arrayContaining([
//               expect.objectContaining({
//                 'Action': expect.arrayContaining([ '*' ]),
//                 'Effect': 'Allow',
//                 'Resource': arn,
//               })
//             ])
//           })
//         })
//       }));
//     });
//   });
// });

#!/usr/bin/env bash

if [[ $# -ge 5 ]]; then
    export CDK_DEVELOPMENT_ACCOUNT=$1
    export CDK_PRODUCTION_ACCOUNT=$2
    export REGION=$3
    export PROD_PROFILE=$4
    export DEV_PROFILE=$5
    shift; shift; shift; shift; shift; shift

    export AWS_REGION=$REGION

    npx cdk bootstrap  --profile $DEV_PROFILE --cloudformation-execution-policies arn:aws:iam::aws:policy/AdministratorAccess aws://$CDK_DEVELOPMENT_ACCOUNT/$REGION

    npx cdk bootstrap --profile $PROD_PROFILE --trust $CDK_DEVELOPMENT_ACCOUNT --cloudformation-execution-policies arn:aws:iam::aws:policy/AdministratorAccess aws://$CDK_PRODUCTION_ACCOUNT/$REGION

    exit $?
else
    echo 1>&5 "Provide development, production accounts, region repository name, dev profile name and prod profile name as first args."
    exit 1
fi
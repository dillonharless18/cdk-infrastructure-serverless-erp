#!/usr/bin/env bash

if [[ $# -ge 3 ]]; then
    export CDK_DEVELOPMENT_ACCOUNT=$1
    export CDK_PRODUCTION_ACCOUNT=$2
    export REGION=$3
    shift; shift; shift;

    npx cdk deploy "$@"
    exit $?
else
    echo 1>&2 "Provide development, production accounts, region and repository name as first four args."
    echo 1>&2 "Additional args are passed through to cdk deploy."
    exit 1
fi
#!/usr/bin/env bash

if [[ $# -ge 4 ]]; then
    export CDK_DEVELOPMENT_ACCOUNT=$1
    export CDK_PRODUCTION_ACCOUNT=$2
    export REGION=$3
    export AWS_PROFILE=$4
    shift; shift; shift; shift

    npx cdk synth "$@"
    exit $?
else
    echo 1>&2 "Provide development, production accounts, region, and profile as first four args."
    echo 1>&2 "Additional args are passed through to cdk deploy."
    exit 1
fi

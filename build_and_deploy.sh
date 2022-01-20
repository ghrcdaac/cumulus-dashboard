#!/bin/bash
set -o errexit
set -o nounset
set -o pipefail
# Verify the keys
aws sts get-caller-identity
# Verify the keys
aws sts get-caller-identity
(($? != 0)) && { printf '%s\n' "Command exited with non-zero"; exit 1; }



export AWS_REGION=$bamboo_AWS_REGION
export DAAC_NAME=${bamboo_DAAC_NAME:-ghrc}

export ENABLE_RECOVERY=true
export HIDE_PDR=true
export SHOW_DISTRIBUTION_API_METRICS=false
export SHOW_TEA_METRICS=true
export TAG=${TAG:-latest}
export STAGE=$(echo ${bamboo_DEPLOY_TO:-sit} | tr "[a-z]" "[A-Z]")
export GLOBAL_SERVED_BY_CUMULUS_API=bamboo_SERVED_BY_CUMULUS_API_${STAGE}
export GLOBAL_SECRET_ACCESS_KEY=bamboo_AWS_${STAGE}_SECRET_ACCESS_KEY
export GLOBAL_API_ROOT=bamboo_CUMULUS_BACKEND_${STAGE}
export GLOBAL_DASHBOARD_BUCKET=bamboo_DASHBOARD_BUCKET_${STAGE}
export GLOBAL_LAUNCHPAD_INTEGRATION=bamboo_AUTH_METHOD_${STAGE}

export AWS_ACCESS_KEY_ID=$(eval echo "\$$GLOBAL_ACCESS_KEY_ID")
export AWS_SECRET_ACCESS_KEY=$(eval echo "\$$GLOBAL_SECRET_ACCESS_KEY")
export API_ROOT=$(eval echo "\$$GLOBAL_API_ROOT")
export DASHBOARD_BUCKET=$(eval echo "\$$GLOBAL_DASHBOARD_BUCKET")
export LAUNCHPAD_INTEGRATION=$(eval echo "\$$GLOBAL_LAUNCHPAD_INTEGRATION")
export SERVED_BY_CUMULUS_API=$(eval echo "\$$GLOBAL_SERVED_BY_CUMULUS_API")
#Maybe used for ELK
# export ESROOT=
# export ES_PASSWORD=
# export ES_USER=
#export KIBANAROOT=

export AUTH_METHOD=${LAUNCHPAD_INTEGRATION:-earthdata}
export LABELS=ghrc-${STAGE}
./bin/build_dashboard_via_docker.sh
aws s3 sync dist  s3://"$DASHBOARD_BUCKET"
docker rmi dashboard-build:${TAG}
exit 0



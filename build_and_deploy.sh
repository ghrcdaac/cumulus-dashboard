#!/bin/bash
set -o errexit
set -o nounset
set -o pipefail


export AWS_REGION=$bamboo_AWS_REGION
export DAAC_NAME=${bamboo_DAAC_NAME:-ghrc}
export SERVED_BY_CUMULUS_API=${bamboo_SERVED_BY_CUMULUS_API:-true}
export ENABLE_RECOVERY=false
export HIDE_PDR=true
export SHOW_DISTRIBUTION_API_METRICS=false
export SHOW_TEA_METRICS=true
export TAG=${TAG:-latest}
access_keys=( $bamboo_AWS_SIT_ACCESS_KEY $bamboo_AWS_UAT_ACCESS_KEY $bamboo_AWS_PROD_ACCESS_KEY)
secret_keys=( $bamboo_AWS_SIT_SECRET_ACCESS_KEY $bamboo_AWS_UAT_SECRET_ACCESS_KEY $bamboo_AWS_PROD_SECRET_ACCESS_KEY)
api_root=( $bamboo_CUMULUS_BACKEND_SIT $bamboo_CUMULUS_BACKEND_UAT $bamboo_CUMULUS_BACKEND_PROD )
dashboard_bucket=( $bamboo_DASHBOARD_BUCKET_SIT $bamboo_DASHBOARD_BUCKET_UAT $bamboo_DASHBOARD_BUCKET_PROD)
envs=( sit uat prod)
envs_index=( 0 ) #1 2 )

#Maybe used for ELK
# export ESROOT=
# export ES_PASSWORD=
# export ES_USER=
#export KIBANAROOT=


for i in "${envs_index[@]}"
do
	export APIROOT=${api_root[$i]}
	export AUTH_METHOD=${bamboo_AUTH_METHOD:-earthdata}
	export LABELS=ghrc-${envs[$i]}
	export STAGE=${envs[$i]}
	export AWS_ACCESS_KEY_ID=${access_keys[$i]}
	export AWS_SECRET_ACCESS_KEY=${secret_keys[$i]}
	export DASHBOARD_BUCKET=${dashboard_bucket[$i]}


./bin/build_dashboard_via_docker.sh
aws s3 sync dist  s3://"$DASHBOARD_BUCKET"
docker rm dashboard-build:${TAG}

done
exit 0



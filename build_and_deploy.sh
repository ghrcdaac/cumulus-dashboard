#!/bin/bash

export AWS_REGION=$bamboo_AWS_REGION
export DAAC_NAME=${bamboo_DAAC_NAME:-dev}
export SERVED_BY_CUMULUS_API=${bamboo_SERVED_BY_CUMULUS_API:-true}
export STAGE=${bamboo_API_STAGE:-dev}
export APIROOT=$bamboo_CUMULUS_BACKEND
export DASHBOARD_BUCKET=$bamboo_DASHBOARD_BUCKET
export LABELS=${bamboo_LABELS:-daac}



access_keys=( $bamboo_ACCESS_KEY_SIT $bamboo_ACCESS_KEY_UAT $bamboo_ACCESS_KEY_PROD)
secret_keys=( $bamboo_SECRET_KEY_SIT $bamboo_SECRET_KEY_UAT $bamboo_SECRET_KEY_PROD)
dashboard_bucket=( $bamboo_DASHBOARD_BUCKET_SIT $bamboo_DASHBOARD_BUCKET_UAT $bamboo_DASHBOARD_BUCKET_PROD)
envs=( sit uat prod)
envs_index=(0 1 2)

for i in "${envs_index[@]}"
do
	echo $i
	export dist=dist_${envs[$i]}
	export AWS_ACCESS_KEY_ID=${access_keys[$i]}
	export AWS_SECRET_ACCESS_KEY=${secret_keys[$i]}
	#./bin/build_in_docker.sh
cat > aws <<EOS
#!/usr/bin/env bash
set -o errexit
set -o nounset
set -o pipefail
# enable interruption signal handling
trap - INT TERM
docker run --rm \
	-t \$(tty &>/dev/null && echo "-i") \
	-e "AWS_ACCESS_KEY_ID=\${AWS_ACCESS_KEY_ID}" \
	-e "AWS_SECRET_ACCESS_KEY=\${AWS_SECRET_ACCESS_KEY}" \
	-e "AWS_DEFAULT_REGION=\${AWS_REGION}" \
	-v "\$(pwd):/project" \
	maven.earthdata.nasa.gov/aws-cli \
	"\$@"
EOS
chmod a+x aws
aws s3 sync dist_${envs[i]}  s3://${dashboard_bucket[$i]} 

rm aws

done



